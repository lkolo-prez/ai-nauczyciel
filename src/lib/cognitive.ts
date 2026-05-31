// The "cognitive twin": pure functions that turn raw activity into a model of
// the learner — mastery per skill, dominant error type, score projection,
// burnout risk and the prioritised "root gaps" in the knowledge graph.
import { nodes, nodeById, nodesBySubject, errorTypeLabels, examSubjects } from '../data';
import type { ErrorType, KnowledgeNode } from './types';

// Nodes that belong to exam subjects — the cognitive twin stays exam-focused
// even though the knowledge base now spans the whole curriculum.
const EXAM_SUBJECT_IDS = new Set(examSubjects.map((s) => s.id));
export const examNodes = nodes.filter((n) => EXAM_SUBJECT_IDS.has(n.subject));
export const isExamNode = (nodeId: string) => {
  const n = nodeById.get(nodeId);
  return n ? EXAM_SUBJECT_IDS.has(n.subject) : false;
};

export interface Attempt {
  questionId: string;
  nodeId: string;
  subject: string;
  correct: boolean;
  errorType: ErrorType | null;
  ts: number;
}

export interface LearnerState {
  mastery: Record<string, number>;
  errorCounts: Record<ErrorType, number>;
  attempts: Attempt[];
  xp: number;
  seenLessons: string[];
  activeDates: string[]; // ISO yyyy-mm-dd, unique, sorted asc
}

export const DEFAULT_MASTERY = 0.15;
export const ERROR_TYPES: ErrorType[] = ['rachunek', 'polecenie', 'koncept', 'pamiec', 'jezyk'];

export const masteryOf = (s: LearnerState, nodeId: string): number =>
  s.mastery[nodeId] ?? DEFAULT_MASTERY;

// Mastery of a node, dampened by the mastery of its prerequisites — you can't
// be solid on geometry if percentages are shaky. This is the graph at work.
export function effectiveMastery(s: LearnerState, nodeId: string): number {
  const node = nodeById.get(nodeId);
  if (!node) return DEFAULT_MASTERY;
  const own = masteryOf(s, nodeId);
  if (node.prereq.length === 0) return own;
  const prereqAvg =
    node.prereq.reduce((a, p) => a + masteryOf(s, p), 0) / node.prereq.length;
  // If prerequisites are weak, cap the effective mastery.
  return Math.min(own, 0.4 + 0.6 * prereqAvg) * 0.5 + own * 0.5;
}

export function subjectMastery(s: LearnerState, subjectId: string): number {
  const ns = nodesBySubject(subjectId);
  if (!ns.length) return DEFAULT_MASTERY;
  const totalWeight = ns.reduce((a, n) => a + n.examWeight, 0);
  return ns.reduce((a, n) => a + effectiveMastery(s, n.id) * n.examWeight, 0) / totalWeight;
}

// Current estimated exam score (%) for a subject.
export function estimatedScore(s: LearnerState, subjectId: string): number {
  return Math.round(subjectMastery(s, subjectId) * 100);
}

export interface ErrorProfile {
  counts: Record<ErrorType, number>;
  total: number;
  dominant: ErrorType | null;
  label: string;
}

export function errorProfile(s: LearnerState): ErrorProfile {
  const counts = s.errorCounts;
  const total = ERROR_TYPES.reduce((a, t) => a + (counts[t] || 0), 0);
  let dominant: ErrorType | null = null;
  let max = 0;
  for (const t of ERROR_TYPES) {
    if ((counts[t] || 0) > max) {
      max = counts[t];
      dominant = t;
    }
  }
  return { counts, total, dominant, label: dominant ? errorTypeLabels[dominant] : '—' };
}

export interface RootGap {
  node: KnowledgeNode;
  mastery: number;
  unlocks: number; // how many skills depend on this one
  priority: number;
}

// Root gaps = weak skills whose prerequisites are already OK, ranked by exam
// weight and by how many other skills they unlock. These are what to fix first.
export function rootGaps(s: LearnerState, subjectId?: string, limit = 3): RootGap[] {
  const pool = subjectId ? nodesBySubject(subjectId) : nodes;
  const gaps: RootGap[] = [];
  for (const node of pool) {
    const m = effectiveMastery(s, node.id);
    if (m >= 0.7) continue; // already solid
    const prereqOk =
      node.prereq.length === 0 ||
      node.prereq.every((p) => masteryOf(s, p) >= 0.55);
    if (!prereqOk) continue; // fix the prerequisite first, not this
    const unlocks = nodes.filter((n) => n.prereq.includes(node.id)).length;
    const priority = (0.7 - m) * node.examWeight * (1 + unlocks * 0.5);
    gaps.push({ node, mastery: m, unlocks, priority });
  }
  return gaps.sort((a, b) => b.priority - a.priority).slice(0, limit);
}

// Projection: where mastery heads if the learner studies `minutesPerDay` for
// `days`, focusing on the weakest weighted skills. Returns a daily score curve.
export function projectScore(
  s: LearnerState,
  subjectId: string,
  minutesPerDay: number,
  days: number,
): { day: number; score: number }[] {
  // Clone mastery for the subject's nodes.
  const ns = nodesBySubject(subjectId);
  const m: Record<string, number> = {};
  for (const n of ns) m[n.id] = masteryOf(s, n.id);

  const learnPerMin = 0.0035; // calibrated so ~20 min/day moves the needle
  const curve: { day: number; score: number }[] = [];
  const sim: LearnerState = { ...s, mastery: { ...s.mastery, ...m } };

  const scoreNow = () => {
    const totalWeight = ns.reduce((a, n) => a + n.examWeight, 0);
    return Math.round(
      (ns.reduce((a, n) => a + effectiveMastery(sim, n.id) * n.examWeight, 0) /
        totalWeight) *
        100,
    );
  };
  curve.push({ day: 0, score: scoreNow() });

  for (let d = 1; d <= days; d++) {
    // Spend the day's budget on the weakest weighted nodes whose prereqs are ok.
    let budget = minutesPerDay;
    const order = [...ns].sort(
      (a, b) =>
        (0.9 - sim.mastery[a.id]) * a.examWeight -
        (0.9 - sim.mastery[b.id]) * b.examWeight,
    );
    // weakest-weighted first
    order.reverse();
    for (const n of order) {
      if (budget <= 0) break;
      const spend = Math.min(budget, 12);
      budget -= spend;
      const gain = (1 - sim.mastery[n.id]) * learnPerMin * spend;
      sim.mastery[n.id] = Math.min(0.98, sim.mastery[n.id] + gain);
    }
    curve.push({ day: d, score: scoreNow() });
  }
  return curve;
}

export interface BurnoutSignal {
  risk: 'ok' | 'uwaga' | 'wysokie';
  score: number; // 0..1
  reasons: string[];
}

// Heuristic burnout / disengagement detector based on recent activity,
// accuracy trend and error rate.
export function burnoutRisk(s: LearnerState): BurnoutSignal {
  const reasons: string[] = [];
  let score = 0;

  const today = new Date();
  const daysSinceActive = s.activeDates.length
    ? Math.floor(
        (today.getTime() - new Date(s.activeDates[s.activeDates.length - 1]).getTime()) /
          86400000,
      )
    : 99;
  if (daysSinceActive >= 3) {
    score += 0.4;
    reasons.push(`Brak nauki od ${daysSinceActive} dni`);
  }

  // Accuracy trend: last 6 vs previous 6 attempts.
  const a = s.attempts;
  if (a.length >= 8) {
    const recent = a.slice(-6);
    const prev = a.slice(-12, -6);
    const accRecent = recent.filter((x) => x.correct).length / recent.length;
    const accPrev = prev.length ? prev.filter((x) => x.correct).length / prev.length : accRecent;
    if (accRecent + 0.15 < accPrev) {
      score += 0.35;
      reasons.push('Spadek skuteczności w ostatnich zadaniach');
    }
    if (accRecent < 0.4) {
      score += 0.25;
      reasons.push('Dużo błędów z rzędu');
    }
  }

  score = Math.min(1, score);
  const risk = score >= 0.6 ? 'wysokie' : score >= 0.3 ? 'uwaga' : 'ok';
  if (!reasons.length) reasons.push('Wszystko w normie — dobra robota!');
  return { risk, score, reasons };
}

// ---- RPG layer ----
export interface LevelInfo {
  level: number;
  title: string;
  xpInLevel: number;
  xpForLevel: number;
  progress: number;
}

const TITLES = [
  'Nowicjusz',
  'Uczeń',
  'Adept',
  'Praktyk',
  'Znawca',
  'Ekspert',
  'Mistrz',
  'Arcymistrz',
  'Legenda Egzaminu',
];

export function levelInfo(xp: number): LevelInfo {
  // Each level needs 100 * level XP.
  let level = 1;
  let remaining = xp;
  while (remaining >= level * 100) {
    remaining -= level * 100;
    level++;
  }
  const xpForLevel = level * 100;
  return {
    level,
    title: TITLES[Math.min(level - 1, TITLES.length - 1)],
    xpInLevel: remaining,
    xpForLevel,
    progress: remaining / xpForLevel,
  };
}

export function streak(s: LearnerState): number {
  if (!s.activeDates.length) return 0;
  const set = new Set(s.activeDates);
  let count = 0;
  const d = new Date();
  // allow today or yesterday as the streak anchor
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  if (!set.has(iso(d))) d.setDate(d.getDate() - 1);
  while (set.has(iso(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
