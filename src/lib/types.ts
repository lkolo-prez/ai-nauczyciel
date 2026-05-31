export type ErrorType = 'rachunek' | 'polecenie' | 'koncept' | 'pamiec' | 'jezyk';

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  stage: string;
  description: string;
  /** Egzamin ósmoklasisty subject? Drives the exam-focused views. */
  exam?: boolean;
  /** Curriculum area grouping for the subject browser. */
  area?: string;
  /** Grades the subject is taught in, e.g. "IV–VIII". */
  grades?: string;
  examMinutes?: number;
  maxPoints?: number;
}

export interface KnowledgeNode {
  id: string;
  subject: string;
  name: string;
  tier: number;
  difficulty: number;
  examWeight: number;
  prereq: string[];
  summary: string;
}

export interface MicroLesson {
  id: string;
  subject: string;
  nodeId: string;
  durationSec: number;
  hook: string;
  body: string;
  takeaway: string;
  tags: string[];
}

export interface Question {
  id: string;
  subject: string;
  nodeId: string;
  type: 'single' | 'truefalse' | 'multiple' | 'open';
  difficulty: number;
  stem: string;
  options?: string[];
  answerIndex?: number;
  misconceptions?: string[];
  explanation: string;
}

export interface ExamSource {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Exam {
  id: string;
  stage: string;
  year: number;
  session: string;
  subjects: string[];
  source: string;
  sourceUrl: string;
  ingested: boolean;
  note?: string;
}
