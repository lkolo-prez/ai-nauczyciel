// Engagement layer: the loops that make learning sticky — daily quests, a
// session combo multiplier, a soft currency + variable-reward chests, and
// weekly leagues. Designed to reward *consistency and curiosity*, with the
// burnout detector (cognitive.ts) as the safety guardrail.
import { todayISO } from './srs';

// ---------- Daily quests ----------
export type QuestMetric = 'lessons' | 'correct' | 'xp' | 'reviews' | 'combo' | 'newNodes';

export interface Quest {
  id: string;
  label: string;
  icon: string;
  metric: QuestMetric;
  target: number;
  rewardCoins: number;
  rewardXp: number;
}

const QUEST_POOL: Omit<Quest, 'id'>[] = [
  { label: 'Obejrzyj 3 mikrolekcje', icon: '⚡', metric: 'lessons', target: 3, rewardCoins: 15, rewardXp: 20 },
  { label: 'Rozwiąż 5 zadań poprawnie', icon: '🎯', metric: 'correct', target: 5, rewardCoins: 20, rewardXp: 30 },
  { label: 'Zdobądź 60 XP', icon: '✨', metric: 'xp', target: 60, rewardCoins: 20, rewardXp: 0 },
  { label: 'Zrób 4 powtórki', icon: '🔁', metric: 'reviews', target: 4, rewardCoins: 25, rewardXp: 25 },
  { label: 'Zbij combo x4', icon: '🔥', metric: 'combo', target: 4, rewardCoins: 30, rewardXp: 20 },
  { label: 'Odkryj nowy temat', icon: '🧭', metric: 'newNodes', target: 1, rewardCoins: 25, rewardXp: 25 },
  { label: 'Rozwiąż 8 zadań poprawnie', icon: '💪', metric: 'correct', target: 8, rewardCoins: 35, rewardXp: 40 },
  { label: 'Obejrzyj 5 mikrolekcji', icon: '📺', metric: 'lessons', target: 5, rewardCoins: 25, rewardXp: 25 },
];

// Deterministic daily pick so the quests are stable across a day and reloads.
function seedFromDate(dateISO: string): number {
  let h = 0;
  for (let i = 0; i < dateISO.length; i++) h = (h * 31 + dateISO.charCodeAt(i)) >>> 0;
  return h;
}

export function dailyQuests(dateISO = todayISO()): Quest[] {
  const seed = seedFromDate(dateISO);
  const idx = new Set<number>();
  let s = seed;
  while (idx.size < 3) {
    s = (s * 1103515245 + 12345) >>> 0;
    idx.add(s % QUEST_POOL.length);
  }
  return [...idx].map((i, k) => ({ ...QUEST_POOL[i], id: `${dateISO}-${k}` }));
}

// ---------- Combo (session) ----------
// Consecutive correct answers raise a multiplier. Resets on a wrong answer.
export function comboMultiplier(streak: number): number {
  if (streak >= 8) return 2.5;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  if (streak >= 2) return 1.2;
  return 1;
}

export function comboLabel(streak: number): string | null {
  if (streak >= 8) return '🔥 NA OGNIU! x2.5';
  if (streak >= 5) return '⚡ SERIA! x2';
  if (streak >= 3) return '✨ Combo x1.5';
  if (streak >= 2) return 'Combo x1.2';
  return null;
}

// ---------- Chests (variable reward) ----------
export type ChestRarity = 'zwykła' | 'rzadka' | 'epicka';

export interface ChestReward {
  coins: number;
  xp: number;
  streakFreeze: number;
  xpBoostMin: number; // minutes of 2x XP boost
  rarity: ChestRarity;
}

export function openChest(rng: () => number = Math.random): ChestReward {
  const roll = rng();
  const rarity: ChestRarity = roll > 0.92 ? 'epicka' : roll > 0.65 ? 'rzadka' : 'zwykła';
  const base = rarity === 'epicka' ? 3 : rarity === 'rzadka' ? 2 : 1;
  const reward: ChestReward = {
    coins: 10 * base + Math.floor(rng() * 10 * base),
    xp: 15 * base,
    streakFreeze: rarity === 'epicka' ? 1 : rng() > 0.7 ? 1 : 0,
    xpBoostMin: rarity === 'epicka' ? 30 : rarity === 'rzadka' && rng() > 0.5 ? 15 : 0,
    rarity,
  };
  return reward;
}

export const CHEST_COST = 50; // coins to buy a chest in the shop

// ---------- Leagues ----------
export const LEAGUES = [
  { id: 0, name: 'Liga Brązowa', emoji: '🥉', color: '#b87333' },
  { id: 1, name: 'Liga Srebrna', emoji: '🥈', color: '#c0c0c0' },
  { id: 2, name: 'Liga Złota', emoji: '🥇', color: '#ffd700' },
  { id: 3, name: 'Liga Platynowa', emoji: '💠', color: '#5fd0e0' },
  { id: 4, name: 'Liga Diamentowa', emoji: '💎', color: '#7c5cff' },
  { id: 5, name: 'Liga Mistrzów', emoji: '👑', color: '#fb7185' },
];

export function leagueOf(tier: number) {
  return LEAGUES[Math.max(0, Math.min(LEAGUES.length - 1, tier))];
}

export function weekStartISO(d = new Date()): string {
  const day = (d.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  return todayISO(monday);
}

export interface LeagueRow {
  name: string;
  xp: number;
  me?: boolean;
}

// Mock cohort of 9 "rivals" + the user, seeded by week & tier so it feels alive
// and consistent within a week. Promotion = top 3, relegation = bottom 3.
export function leagueStandings(weeklyXp: number, tier: number, name: string): LeagueRow[] {
  const seed = seedFromDate(weekStartISO()) + tier * 7919;
  const names = ['Zofia', 'Antoni', 'Maja', 'Jan', 'Lena', 'Kacper', 'Hania', 'Filip', 'Nadia'];
  let s = seed;
  const rng = () => ((s = (s * 1103515245 + 12345) >>> 0) % 1000) / 1000;
  const base = 80 + tier * 60;
  const rows: LeagueRow[] = names.map((n) => ({
    name: n + ' ' + String.fromCharCode(65 + Math.floor(rng() * 26)) + '.',
    xp: Math.round(base + rng() * base * 2),
  }));
  rows.push({ name: name + ' (Ty)', xp: weeklyXp, me: true });
  return rows.sort((a, b) => b.xp - a.xp);
}
