// Adaptive session builder. Blends three sources so every session feels fresh
// and always has a "next thing": (1) SRS reviews that are due, (2) the weakest
// weighted skills, and (3) discovery of brand-new skills whose prerequisites are
// ready. Difficulty is matched to current mastery to stay in the flow channel.
import { nodes, questions, questionsByNode, nodeById } from '../data';
import { masteryOf, effectiveMastery } from './cognitive';
import type { LearnerState } from './cognitive';
import { isDue, reviewUrgency, type SrsCard } from './srs';
import type { Question } from './types';

export type SessionReason = 'review' | 'weak' | 'new';

export interface SessionItem {
  question: Question;
  reason: SessionReason;
  nodeName: string;
}

interface AdaptiveState extends LearnerState {
  srs: Record<string, SrsCard>;
}

const REASON_META: Record<SessionReason, { label: string; icon: string; color: string }> = {
  review: { label: 'Powtórka', icon: '🔁', color: '#22d3ee' },
  weak: { label: 'Słaby punkt', icon: '🎯', color: '#fb7185' },
  new: { label: 'Nowy temat', icon: '🧭', color: '#34d399' },
};
export const reasonMeta = (r: SessionReason) => REASON_META[r];

// Pick a question for a node close to the target difficulty (flow channel).
function pickQuestion(nodeId: string, mastery: number, used: Set<string>): Question | undefined {
  const pool = questionsByNode(nodeId).filter((q) => !used.has(q.id));
  if (!pool.length) return undefined;
  const targetDiff = 1 + Math.round(mastery * 4); // weak→easy, strong→hard
  return pool.sort(
    (a, b) => Math.abs(a.difficulty - targetDiff) - Math.abs(b.difficulty - targetDiff),
  )[0];
}

// Nodes the learner hasn't really started, but whose prerequisites are ready.
export function discoverableNodes(s: LearnerState): string[] {
  return nodes
    .filter((n) => {
      const started = s.mastery[n.id] !== undefined;
      const prereqReady =
        n.prereq.length === 0 || n.prereq.every((p) => masteryOf(s, p) >= 0.5);
      return !started && prereqReady;
    })
    .sort((a, b) => b.examWeight - a.examWeight)
    .map((n) => n.id);
}

export function buildSession(
  s: AdaptiveState,
  opts: { size?: number; focusNode?: string } = {},
): SessionItem[] {
  const size = opts.size ?? 8;
  const used = new Set<string>();
  const items: SessionItem[] = [];
  const push = (nodeId: string, reason: SessionReason) => {
    const q = pickQuestion(nodeId, masteryOf(s, nodeId), used);
    if (q) {
      used.add(q.id);
      items.push({ question: q, reason, nodeName: nodeById.get(nodeId)?.name ?? '' });
    }
  };

  if (opts.focusNode) {
    for (const q of questionsByNode(opts.focusNode)) {
      if (!used.has(q.id)) {
        used.add(q.id);
        items.push({ question: q, reason: 'weak', nodeName: nodeById.get(opts.focusNode)?.name ?? '' });
      }
    }
    if (items.length) return items.slice(0, size);
  }

  // 1) Due reviews first (most urgent).
  const due = Object.keys(s.srs)
    .filter((id) => isDue(s.srs[id]))
    .sort((a, b) => reviewUrgency(s.srs[b]) - reviewUrgency(s.srs[a]));
  for (const id of due) {
    if (items.length >= Math.ceil(size * 0.5)) break;
    push(id, 'review');
  }

  // 2) Weakest weighted skills.
  const weak = nodes
    .filter((n) => effectiveMastery(s, n.id) < 0.7)
    .sort(
      (a, b) =>
        (0.7 - effectiveMastery(s, a.id)) * a.examWeight <
        (0.7 - effectiveMastery(s, b.id)) * b.examWeight
          ? 1
          : -1,
    );
  for (const n of weak) {
    if (items.length >= Math.ceil(size * 0.8)) break;
    push(n.id, 'weak');
  }

  // 3) Discovery — keep curiosity alive with something new.
  for (const id of discoverableNodes(s)) {
    if (items.length >= size) break;
    push(id, 'new');
  }

  // Fill any remainder with random unused questions.
  if (items.length < size) {
    for (const q of questions) {
      if (items.length >= size) break;
      if (!used.has(q.id)) {
        used.add(q.id);
        items.push({ question: q, reason: 'weak', nodeName: nodeById.get(q.nodeId)?.name ?? '' });
      }
    }
  }

  return items.slice(0, size);
}
