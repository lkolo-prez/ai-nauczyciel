// Layer 10 — exam analytics. Computes "what matters most" from the open data:
// topic weight (how much each skill is worth on the exam), question-bank
// coverage, and the distribution of error types — both nationally (from the
// question bank's tagged misconceptions) and personally (from the learner).
import { nodes, questions, subjects, errorTypeLabels } from '../data';
import { ERROR_TYPES } from './cognitive';
import type { LearnerState } from './cognitive';
import type { ErrorType } from './types';

export interface TopicWeight {
  nodeId: string;
  name: string;
  subject: string;
  examWeight: number;
  questionCount: number;
  sharePct: number; // share of total exam weight within its subject
}

// Topics ranked by exam weight within a subject — "co najczęściej się liczy".
export function topicWeights(subjectId: string): TopicWeight[] {
  const ns = nodes.filter((n) => n.subject === subjectId);
  const total = ns.reduce((a, n) => a + n.examWeight, 0) || 1;
  return ns
    .map((n) => ({
      nodeId: n.id,
      name: n.name,
      subject: n.subject,
      examWeight: n.examWeight,
      questionCount: questions.filter((q) => q.nodeId === n.id).length,
      sharePct: Math.round((n.examWeight / total) * 100),
    }))
    .sort((a, b) => b.examWeight - a.examWeight);
}

// National-ish error distribution derived from the bank's tagged wrong answers.
export function bankErrorDistribution(): Record<ErrorType, number> {
  const counts = ERROR_TYPES.reduce(
    (acc, t) => ({ ...acc, [t]: 0 }),
    {} as Record<ErrorType, number>,
  );
  for (const q of questions) {
    for (const m of q.misconceptions || []) {
      if (m && m in counts) counts[m as ErrorType] += 1;
    }
  }
  return counts;
}

export function personalErrorDistribution(s: LearnerState): Record<ErrorType, number> {
  return s.errorCounts;
}

export interface CoverageRow {
  subject: string;
  name: string;
  color: string;
  questions: number;
  nodes: number;
  lessons: number;
}

export function bankCoverage(lessonsBySubjectCount: (id: string) => number): CoverageRow[] {
  return subjects.map((sub) => ({
    subject: sub.id,
    name: sub.name,
    color: sub.color,
    questions: questions.filter((q) => q.subject === sub.id).length,
    nodes: nodes.filter((n) => n.subject === sub.id).length,
    lessons: lessonsBySubjectCount(sub.id),
  }));
}

export const errorLabel = (t: ErrorType) => errorTypeLabels[t];
