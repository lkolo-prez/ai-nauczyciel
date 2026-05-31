export type ErrorType = 'rachunek' | 'polecenie' | 'koncept' | 'pamiec' | 'jezyk';

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  examMinutes: number;
  maxPoints: number;
  stage: string;
  description: string;
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
