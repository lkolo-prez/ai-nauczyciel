import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ErrorType, Question } from './types';
import type { Attempt, LearnerState } from './cognitive';
import { ERROR_TYPES, masteryOf, streak } from './cognitive';

const todayISO = () => new Date().toISOString().slice(0, 10);

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
  { id: 'ten-correct', name: 'Dziesiątka', desc: '10 poprawnych odpowiedzi', emoji: '🎯', test: (s) => s.attempts.filter((a) => a.correct).length >= 10 },
  { id: 'feed-explorer', name: 'Odkrywca', desc: 'Obejrzyj 10 mikrolekcji', emoji: '📺', test: (s) => s.seenLessons.length >= 10 },
  { id: 'level-5', name: 'Ekspert', desc: 'Osiągnij poziom 5', emoji: '⭐', test: (s) => s.xp >= 1000 },
  { id: 'master-node', name: 'Mistrz tematu', desc: 'Opanuj dowolny temat powyżej 80%', emoji: '🏆', test: (s) => Object.values(s.mastery).some((m) => m >= 0.8) },
];

interface Store extends LearnerState {
  name: string;
  classId: string;
  setProfile: (name: string, classId: string) => void;
  answerQuestion: (q: Question, chosenIndex: number) => { correct: boolean; xpGained: number };
  markLesson: (lessonId: string, subject: string) => number;
  unlockedAchievements: () => Achievement[];
  reset: () => void;
}

const emptyErrors = (): Record<ErrorType, number> =>
  ERROR_TYPES.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<ErrorType, number>);

const initial: LearnerState & { name: string; classId: string } = {
  name: '',
  classId: 'strateg',
  mastery: {},
  errorCounts: emptyErrors(),
  attempts: [],
  xp: 0,
  seenLessons: [],
  activeDates: [],
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
    (set, get) => ({
      ...initial,

      setProfile: (name, classId) => set({ name, classId }),

      answerQuestion: (q, chosenIndex) => {
        const correct = chosenIndex === q.answerIndex;
        const errorType: ErrorType | null =
          !correct && q.misconceptions
            ? ((q.misconceptions[chosenIndex] || 'koncept') as ErrorType)
            : null;

        const s = get();
        const prev = masteryOf(s, q.nodeId);
        // Bayesian-ish update, sensitive to difficulty.
        const next = correct
          ? prev + (1 - prev) * (0.18 + q.difficulty * 0.03)
          : Math.max(0.02, prev - prev * 0.22);

        const attempt: Attempt = {
          questionId: q.id,
          nodeId: q.nodeId,
          subject: q.subject,
          correct,
          errorType,
          ts: Date.now(),
        };

        const baseXp = correct ? 12 + q.difficulty * 4 : 3;
        const xpGained = Math.round(baseXp * classMultiplier(s.classId, q.subject));

        const errorCounts = { ...s.errorCounts };
        if (errorType) errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;

        const activeDates = s.activeDates.includes(todayISO())
          ? s.activeDates
          : [...s.activeDates, todayISO()];

        set({
          mastery: { ...s.mastery, [q.nodeId]: next },
          attempts: [...s.attempts, attempt],
          errorCounts,
          xp: s.xp + xpGained,
          activeDates,
        });
        return { correct, xpGained };
      },

      markLesson: (lessonId, subject) => {
        const s = get();
        if (s.seenLessons.includes(lessonId)) return 0;
        const xpGained = Math.round(5 * classMultiplier(s.classId, subject));
        const activeDates = s.activeDates.includes(todayISO())
          ? s.activeDates
          : [...s.activeDates, todayISO()];
        set({
          seenLessons: [...s.seenLessons, lessonId],
          xp: s.xp + xpGained,
          activeDates,
        });
        return xpGained;
      },

      unlockedAchievements: () => ACHIEVEMENTS.filter((a) => a.test(get())),

      reset: () => set({ ...initial, name: get().name, classId: get().classId }),
    }),
    {
      name: 'ai-nauczyciel-v1',
      version: 1,
    },
  ),
);

export type { Store };
