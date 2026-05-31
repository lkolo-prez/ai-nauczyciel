// Validates the open knowledge base: referential integrity + acyclic graph.
// Run: npm run validate:data   (also runs in CI on every PR)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const load = (f) => JSON.parse(readFileSync(join(root, f), 'utf8'));

const errors = [];
const fail = (m) => errors.push(m);

const subjects = load('subjects.json');
const graph = load('knowledge-graph.json');
const lessons = load('micro-lessons.json');
const questions = load('questions.json');
const exams = load('exams.json');

const subjectIds = new Set(subjects.subjects.map((s) => s.id));
const nodeIds = new Set(graph.nodes.map((n) => n.id));

// 1. Subjects referenced by nodes exist
for (const n of graph.nodes) {
  if (!subjectIds.has(n.subject)) fail(`node ${n.id}: unknown subject "${n.subject}"`);
  for (const p of n.prereq) {
    if (!nodeIds.has(p)) fail(`node ${n.id}: unknown prereq "${p}"`);
  }
}

// 2. Graph is acyclic (DFS)
const adj = new Map(graph.nodes.map((n) => [n.id, n.prereq]));
const state = new Map();
const visit = (id, stack) => {
  if (state.get(id) === 'done') return;
  if (state.get(id) === 'open') {
    fail(`cycle detected: ${[...stack, id].join(' -> ')}`);
    return;
  }
  state.set(id, 'open');
  for (const p of adj.get(id) || []) visit(p, [...stack, id]);
  state.set(id, 'done');
};
for (const id of nodeIds) visit(id, []);

// 3. Lessons & questions point to real nodes/subjects
for (const l of lessons.lessons) {
  if (!subjectIds.has(l.subject)) fail(`lesson ${l.id}: unknown subject "${l.subject}"`);
  if (!nodeIds.has(l.nodeId)) fail(`lesson ${l.id}: unknown node "${l.nodeId}"`);
}
const validErr = new Set(Object.keys(questions.errorTypes));
for (const q of questions.questions) {
  if (!subjectIds.has(q.subject)) fail(`question ${q.id}: unknown subject "${q.subject}"`);
  if (!nodeIds.has(q.nodeId)) fail(`question ${q.id}: unknown node "${q.nodeId}"`);
  if (q.options && typeof q.answerIndex === 'number') {
    if (q.answerIndex < 0 || q.answerIndex >= q.options.length)
      fail(`question ${q.id}: answerIndex out of range`);
    if (q.misconceptions && q.misconceptions.length !== q.options.length)
      fail(`question ${q.id}: misconceptions length != options length`);
    for (const m of q.misconceptions || []) {
      if (m !== '' && !validErr.has(m)) fail(`question ${q.id}: unknown error type "${m}"`);
    }
  }
}

// 4. Exams reference declared sources
const sourceIds = new Set(exams.officialSources.map((s) => s.id));
for (const e of exams.exams) {
  if (!sourceIds.has(e.source)) fail(`exam ${e.id}: unknown source "${e.source}"`);
}

const counts = `${subjects.subjects.length} przedmiotów, ${graph.nodes.length} węzłów, ${lessons.lessons.length} mikrolekcji, ${questions.questions.length} zadań, ${exams.exams.length} arkuszy`;

if (errors.length) {
  console.error('❌ Walidacja bazy wiedzy NIE przeszła:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✅ Baza wiedzy OK (${counts}).`);
