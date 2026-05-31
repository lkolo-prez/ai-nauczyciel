// Spaced repetition (SM-2 variant). This is the engine that turns one-off
// practice into a long-term habit: every reviewed skill gets scheduled to come
// back exactly when the learner is about to forget it. "Do powtórki dziś" is the
// hook that brings users back day after day — and it genuinely boosts retention.

export interface SrsCard {
  ease: number; // easiness factor (>= 1.3)
  interval: number; // days until next review
  due: string; // ISO yyyy-mm-dd
  reps: number; // successful reps in a row
  lapses: number; // times forgotten
  last: string; // ISO of last review
}

export const todayISO = (d = new Date()) => d.toISOString().slice(0, 10);

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + Math.round(days));
  return todayISO(d);
}

export function newCard(today = todayISO()): SrsCard {
  return { ease: 2.5, interval: 0, due: today, reps: 0, lapses: 0, last: today };
}

// Map a practice outcome to an SM-2 quality score 0..5.
// correct + easy/fast → high; correct + hard → medium-high; wrong → 2.
export function qualityFrom(correct: boolean, difficulty: number, fastBonus = false): number {
  if (!correct) return 2;
  // difficulty 1..5 → base 5..3, plus a small bonus for quick answers
  const base = 5 - Math.max(0, difficulty - 1) * 0.4;
  return Math.min(5, Math.round(base + (fastBonus ? 0.5 : 0)));
}

export function reviewCard(card: SrsCard, quality: number, today = todayISO()): SrsCard {
  const c = { ...card, last: today };
  if (quality < 3) {
    c.reps = 0;
    c.lapses += 1;
    c.interval = 1;
  } else {
    c.reps += 1;
    if (c.reps === 1) c.interval = 1;
    else if (c.reps === 2) c.interval = 3;
    else c.interval = Math.round(c.interval * c.ease);
    c.ease = Math.max(1.3, c.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }
  c.due = addDays(today, c.interval);
  return c;
}

export function isDue(card: SrsCard | undefined, today = todayISO()): boolean {
  if (!card) return false;
  return card.due <= today;
}

export function dueNodeIds(srs: Record<string, SrsCard>, today = todayISO()): string[] {
  return Object.keys(srs).filter((id) => isDue(srs[id], today));
}

// How "urgent" a review is — more overdue + more lapses = higher priority.
export function reviewUrgency(card: SrsCard, today = todayISO()): number {
  const overdue = Math.max(0, daysBetween(card.due, today));
  return overdue + card.lapses * 0.5;
}

export function daysBetween(aISO: string, bISO: string): number {
  return Math.round(
    (new Date(bISO + 'T00:00:00').getTime() - new Date(aISO + 'T00:00:00').getTime()) / 86400000,
  );
}
