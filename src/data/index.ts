// Single entry point that loads the open knowledge base (../../data/*.json)
// and exposes it as typed, indexed structures for the app.
import subjectsRaw from '../../data/subjects.json';
import graphRaw from '../../data/knowledge-graph.json';
import lessonsRaw from '../../data/micro-lessons.json';
import questionsRaw from '../../data/questions.json';
import examsRaw from '../../data/exams.json';
import type {
  Subject,
  KnowledgeNode,
  MicroLesson,
  Question,
  Exam,
  ExamSource,
  ErrorType,
} from '../lib/types';

export const subjects = subjectsRaw.subjects as Subject[];
export const nodes = graphRaw.nodes as KnowledgeNode[];
export const lessons = lessonsRaw.lessons as MicroLesson[];
export const questions = questionsRaw.questions as Question[];
export const exams = examsRaw.exams as Exam[];
export const examSources = examsRaw.officialSources as ExamSource[];
export const errorTypeLabels = questionsRaw.errorTypes as Record<ErrorType, string>;
export const dataVersion = subjectsRaw.version as string;

export const nodeById = new Map(nodes.map((n) => [n.id, n]));
export const subjectById = new Map(subjects.map((s) => [s.id, s]));

export const nodesBySubject = (subjectId: string) =>
  nodes.filter((n) => n.subject === subjectId);

export const questionsByNode = (nodeId: string) =>
  questions.filter((q) => q.nodeId === nodeId);

export const lessonsBySubject = (subjectId: string) =>
  lessons.filter((l) => l.subject === subjectId);

// Nodes that directly depend on the given node (its "unlocks").
export const dependentsOf = (nodeId: string) =>
  nodes.filter((n) => n.prereq.includes(nodeId));
