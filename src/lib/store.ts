import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ErrorType, Question } from './types';
import type { Attempt, LearnerState } from './cognitive';
import { ERROR_TYPES, masteryOf, streak } from './cognitive';
import {
  newCard,
  reviewCard,
  qualityFrom,
  isDue,
  todayISO,
  type SrsCard,
} from './srs';
import {
  comboMultiplier,
  dailyQuests,
  openChest,
  CHEST_COST,
  weekStartISO,
  type Quest,
  type ChestReward,
} from './engagement';

export interface CharacterClass {
  id: string;
  name: string;
  emoji: string;
  perk: string;
}

export const CLASSES: CharacterClass[] = [
  { id: 'analityk', name: 'Analityk', emoji: '🧮', perk: '+10% XP za matematykę' },
  { id: 'humanista', name: 'Humanista', emoji: '📖', perk: '+10% XP za polski' },
  { id: 'poliglota', name: 'Poliglota', emoji: '🌍', perk: '+10% XP za angielski' },
  { id: 'strateg', name: 'Strateg', emoji: '♟️', perk: '+5% XP wszędzie, dłuższe serie' },
];

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  test: (s: Store) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', name: 'Pierwszy krok', desc: 'Rozwiąż pierwsze zadanie', emoji: '👣', test: (s) => s.attempts.length >= 1 },
  { id: 'streak-3', name: 'Seria 3 dni', desc: 'Ucz się 3 dni z rzędu', emoji: '🔥', test: (s) => streak(s) >= 3 },
  { id: 'streak-7', name: 'Tydzień ognia', desc: 'Ucz się 7 dni z rzędu', emoji: '🔥', test: (s) => streak(s) >= 7 },
  { id: 'ten-correct', name: 'Dziesiątka', desc: '10 poprawnych odpowiedzi', emoji: '🎯', test: (s) => s.attempts.filter((a) => a.correct).length >= 10 },
  { id: 'combo-master', name: 'Combo Mistrz', desc: 'Zbij combo x2.5', emoji: '⚡', test: (s) => s.bestCombo >= 8 },
  { id: 'feed-explorer', name: 'Odkrywca', desc: 'Obejrzyj 10 mikrolekcji', emoji: '📺', test: (s) => s.seenLessons.length >= 10 },
  { id: 'reviewer', name: 'Systematyk', desc: 'Zrób 20 powtórek', emoji: '🔁', test: (s) => s.reviewsDone >= 20 },
  { id: 'level-5', name: 'Ekspert', desc: 'Osiągnij poziom 5', emoji: '⭐', test: (s) => s.xp >= 1000 },
  { id: 'master-node', name: 'Mistrz tematu', desc: 'Opanuj temat powyżej 80%', emoji: '🏆', test: (s) => Object.values(s.mastery).some((m) => m >= 0.8) },
  { id: 'rich', name: 'Skarbnik', desc: 'Uzbieraj 200 kryształów', emoji: '💎', test: (s) => s.coins >= 200 },
];

export interface Inventory {
  streakFreeze: number;
  xpBoostUntil: number; // epoch ms; while > now, XP is doubled
}

export type QuestMetricCounters = {
  lessons: number;
  correct: number;
  xp: number;
  reviews: number;
  combo: number;
  newNodes: number;
};

export interface QuestDay {
  date: string;
  counters: QuestMetricCounters;
  claimed: string[];
}

interface Profile {
  name: string;
  classId: string;
}

interface Engagement {
  coins: number;
  srs: Record<string, SrsCard>;
  dailyXp: Record<string, number>;
  quest: QuestDay;
  leagueTier: number;
  leagueWeek: string;
  examDate: string | null;
  dailyGoalXp: number;
  bestCombo: number;
  reviewsDone: number;
  inventory: Inventory;
}

export interface AnswerResult {
  correct: boolean;
  xpGained: number;
  coinsGained: number;
  multiplier: number;
  wasReview: boolean;
  discovered: boolean;
}

interface Actions {
  setProfile: (name: string, classId: string) => void;
  answerQuestion: (q: Question, chosenIndex: number, comboStreak: number) => AnswerResult;
  markLesson: (lessonId: string, subject: string) => number;
  todaysQuests: () => Quest[];
  claimQuest: (quest: Quest) => boolean;
  buyChest: () => ChestReward | null;
  setGoal: (examDate: string | null, dailyGoalXp: number) => void;
  weeklyXp: () => number;
  todayXp: () => number;
  unlockedAchievements: () => Achievement[];
  reset: () => void;
}

type Store = LearnerState & Profile & Engagement & Actions;

const emptyErrors = (): Record<ErrorType, number> =>
  ERROR_TYPES.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<ErrorType, number>);

const emptyCounters = (): QuestMetricCounters => ({
  lessons: 0,
  correct: 0,
  xp: 0,
  reviews: 0,
  combo: 0,
  newNodes: 0,
});

const freshQuestDay = (): QuestDay => ({ date: todayISO(), counters: emptyCounters(), claimed: [] });

const initial: LearnerState & Profile & Engagement = {
  name: '',
  classId: 'strateg',
  mastery: {},
  errorCounts: emptyErrors(),
  attempts: [],
  xp: 0,
  seenLessons: [],
  activeDates: [],
  coins: 0,
  srs: {},
  dailyXp: {},
  quest: freshQuestDay(),
  leagueTier: 0,
  leagueWeek: weekStartISO(),
  examDate: null,
  dailyGoalXp: 50,
  bestCombo: 0,
  reviewsDone: 0,
  inventory: { streakFreeze: 0, xpBoostUntil: 0 },
};

function classMultiplier(classId: string, subject: string): number {
  if (classId === 'analityk' && subject === 'matematyka') return 1.1;
  if (classId === 'humanista' && subject === 'polski') return 1.1;
  if (classId === 'poliglota' && subject === 'angielski') return 1.1;
  if (classId === 'strateg') return 1.05;
  return 1;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      // Ensure the quest day & league week are current; reset counters on rollover.
      const ensureDay = () => {
        const s = get();
        const patch: Partial<Store> = {};
        if (s.quest.date !== todayISO()) patch.quest = freshQuestDay();
        if (s.leagueWeek !== weekStartISO()) {
          // promotion/relegation based on last week's standing proxy (weekly XP).
          const wk = get().weeklyXp();
          let tier = s.leagueTier;
          if (wk >= 300) tier = Math.min(5, tier + 1);
          else if (wk < 80) tier = Math.max(0, tier - 1);
          patch.leagueTier = tier;
          patch.leagueWeek = weekStartISO();
        }
        if (Object.keys(patch).length) set(patch);
      };

      const addXp = (amount: number) => {
        const s = get();
        const boosted = s.inventory.xpBoostUntil > Date.now() ? amount * 2 : amount;
        const day = todayISO();
        set({
          xp: s.xp + boosted,
          dailyXp: { ...s.dailyXp, [day]: (s.dailyXp[day] || 0) + boosted },
        });
        return boosted;
      };

      const bumpCounter = (metric: keyof QuestMetricCounters, by: number, mode: 'add' | 'max' = 'add') => {
        const q = get().quest;
        const cur = q.counters[metric];
        const next = mode === 'max' ? Math.max(cur, by) : cur + by;
        set({ quest: { ...q, counters: { ...q.counters, [metric]: next } } });
      };

      const markActive = () => {
        const s = get();
        if (!s.activeDates.includes(todayISO()))
          set({ activeDates: [...s.activeDates, todayISO()] });
      };

      return {
        ...initial,

        setProfile: (name, classId) => set({ name, classId }),

        answerQuestion: (q, chosenIndex, comboStreak) => {
          ensureDay();
          const correct = chosenIndex === q.answerIndex;
          const errorType: ErrorType | null =
            !correct && q.misconceptions
              ? ((q.misconceptions[chosenIndex] || 'koncept') as ErrorType)
              : null;

          const s = get();
          const discovered = s.mastery[q.nodeId] === undefined;
          const prev = masteryOf(s, q.nodeId);
          const next = correct
            ? prev + (1 - prev) * (0.18 + q.difficulty * 0.03)
            : Math.max(0.02, prev - prev * 0.22);

          // SRS scheduling
          const existing = s.srs[q.nodeId];
          const wasReview = isDue(existing) && existing !== undefined;
          const card = existing ?? newCard();
          const quality = qualityFrom(correct, q.difficulty);
          const updatedCard = reviewCard(card, quality);

          const attempt: Attempt = {
            questionId: q.id,
            nodeId: q.nodeId,
            subject: q.subject,
            correct,
            errorType,
            ts: Date.now(),
          };

          const mult = correct ? comboMultiplier(comboStreak) : 1;
          const baseXp = correct ? 12 + q.difficulty * 4 : 3;
          const rawXp = Math.round(baseXp * classMultiplier(s.classId, q.subject) * mult);
          const coinsGained = correct ? Math.round(2 + q.difficulty + (mult - 1) * 4) : 0;

          const errorCounts = { ...s.errorCounts };
          if (errorType) errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;

          set({
            mastery: { ...s.mastery, [q.nodeId]: next },
            attempts: [...s.attempts, attempt],
            errorCounts,
            srs: { ...s.srs, [q.nodeId]: updatedCard },
            coins: s.coins + coinsGained,
            bestCombo: Math.max(s.bestCombo, comboStreak),
            reviewsDone: s.reviewsDone + (wasReview ? 1 : 0),
          });
          markActive();
          const xpGained = addXp(rawXp);

          // quest counters
          if (correct) bumpCounter('correct', 1);
          if (wasReview) bumpCounter('reviews', 1);
          if (discovered && correct) bumpCounter('newNodes', 1);
          bumpCounter('combo', comboStreak, 'max');
          bumpCounter('xp', xpGained);

          return { correct, xpGained, coinsGained, multiplier: mult, wasReview, discovered };
        },

        markLesson: (lessonId, subject) => {
          ensureDay();
          const s = get();
          if (s.seenLessons.includes(lessonId)) return 0;
          markActive();
          const xpGained = addXp(Math.round(5 * classMultiplier(s.classId, subject)));
          set({ seenLessons: [...s.seenLessons, lessonId], coins: get().coins + 2 });
          bumpCounter('lessons', 1);
          bumpCounter('xp', xpGained);
          return xpGained;
        },

        todaysQuests: () => {
          ensureDay();
          return dailyQuests();
        },

        claimQuest: (quest) => {
          ensureDay();
          const s = get();
          const done = s.quest.counters[quest.metric] >= quest.target;
          if (!done || s.quest.claimed.includes(quest.id)) return false;
          set({
            coins: s.coins + quest.rewardCoins,
            quest: { ...s.quest, claimed: [...s.quest.claimed, quest.id] },
          });
          if (quest.rewardXp) addXp(quest.rewardXp);
          return true;
        },

        buyChest: () => {
          const s = get();
          if (s.coins < CHEST_COST) return null;
          const reward = openChest();
          set({
            coins: s.coins - CHEST_COST + reward.coins,
            inventory: {
              streakFreeze: s.inventory.streakFreeze + reward.streakFreeze,
              xpBoostUntil:
                reward.xpBoostMin > 0
                  ? Math.max(s.inventory.xpBoostUntil, Date.now()) + reward.xpBoostMin * 60000
                  : s.inventory.xpBoostUntil,
            },
          });
          if (reward.xp) addXp(reward.xp);
          return reward;
        },

        setGoal: (examDate, dailyGoalXp) => set({ examDate, dailyGoalXp }),

        weeklyXp: () => {
          const s = get();
          const wk = weekStartISO();
          return Object.entries(s.dailyXp)
            .filter(([d]) => d >= wk)
            .reduce((a, [, v]) => a + v, 0);
        },

        todayXp: () => get().dailyXp[todayISO()] || 0,

        unlockedAchievements: () => ACHIEVEMENTS.filter((a) => a.test(get())),

        reset: () =>
          set({ ...initial, name: get().name, classId: get().classId, quest: freshQuestDay() }),
      };
    },
    {
      name: 'ai-nauczyciel-v1',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const p = (persisted ?? {}) as Partial<Store>;
        if (version < 2) {
          return {
            ...initial,
            ...p,
            coins: 0,
            srs: {},
            dailyXp: {},
            quest: freshQuestDay(),
            leagueTier: 0,
            leagueWeek: weekStartISO(),
            examDate: null,
            dailyGoalXp: 50,
            bestCombo: 0,
            reviewsDone: 0,
            inventory: { streakFreeze: 0, xpBoostUntil: 0 },
          } as Store;
        }
        return p as Store;
      },
    },
  ),
);

export type { Store };
