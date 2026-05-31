// On-device tutor "brain". Works fully offline by reasoning over the open
// knowledge base (graph + lessons + questions). The architecture leaves a clear
// seam (`generateAnswer`) where a hosted LLM (e.g. Claude API) can be plugged in
// later for free-form explanations, image/handwriting and voice analysis.
import { nodes, lessons, questions, nodeById } from '../data';
import type { KnowledgeNode, MicroLesson, Question } from './types';
import { rootGaps, masteryOf } from './cognitive';
import type { LearnerState } from './cognitive';

export interface TutorReply {
  text: string;
  node?: KnowledgeNode;
  lesson?: MicroLesson;
  question?: Question;
  suggestions: string[];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Find the knowledge node most relevant to a free-text message.
function matchNode(message: string): KnowledgeNode | undefined {
  const m = norm(message);
  let best: { node: KnowledgeNode; score: number } | undefined;
  for (const node of nodes) {
    const hay = norm(node.name + ' ' + node.summary);
    const words = norm(node.name).split(/\s+/);
    let score = 0;
    for (const w of words) if (w.length > 3 && m.includes(w)) score += 3;
    // a few hand-picked synonyms
    const syn: Record<string, string[]> = {
      'mat.pitagoras': ['pitagoras', 'przeciwprostokat', 'trojkat prostokat'],
      'mat.procenty': ['procent', 'rabat', 'obnizk', 'podwyzk', 'vat'],
      'mat.potegi': ['pierwiastek', 'pierwiastk', 'potega', 'potegi'],
      'mat.ulamki': ['ulamek', 'ulamki', 'mianownik'],
      'mat.bryly': ['bryla', 'objetosc', 'graniastoslup', 'ostroslup'],
      'pol.rozprawka': ['rozprawka', 'teza', 'argument'],
      'ang.gramatyka': ['czas', 'present perfect', 'past simple', 'gramatyk'],
    };
    for (const s of syn[node.id] || []) if (m.includes(norm(s))) score += 4;
    if (hay.split(/\s+/).some((w) => w.length > 4 && m.includes(w))) score += 1;
    if (!best || score > best.score) best = { node, score };
  }
  return best && best.score > 0 ? best.node : undefined;
}

export function generateReply(message: string, state: LearnerState): TutorReply {
  const m = norm(message);

  // Intent: "what should I do / plan"
  if (/(co.*robic|od czego|plan|zaczac|nauka|powtorz)/.test(m)) {
    const gaps = rootGaps(state, undefined, 3);
    if (gaps.length) {
      const list = gaps.map((g, i) => `${i + 1}. ${g.node.name} (${Math.round(g.mastery * 100)}%)`).join('\n');
      return {
        text: `Na podstawie Twojego profilu zacznij od fundamentów, które odblokują resztę:\n\n${list}\n\nNajwiększy zysk da pierwszy temat — jest słaby, a wiele innych od niego zależy.`,
        node: gaps[0].node,
        lesson: lessons.find((l) => l.nodeId === gaps[0].node.id),
        suggestions: [`Wyjaśnij: ${gaps[0].node.name}`, 'Daj mi zadanie', 'Pokaż mapę wiedzy'],
      };
    }
  }

  // Intent: "give me a task"
  if (/(zadanie|cwicz|sprawdz|test|quiz|przyklad)/.test(m)) {
    const node = matchNode(message);
    const pool = node ? questions.filter((q) => q.nodeId === node.id) : questions;
    const q = pool[Math.floor(Math.random() * pool.length)];
    return {
      text: node
        ? `Spróbuj tego zadania z tematu „${node.name}". Po odpowiedzi pokażę Ci, gdzie był błąd.`
        : 'Oto zadanie na rozgrzewkę. Rozwiążesz?',
      question: q,
      node,
      suggestions: ['Daj inne zadanie', 'Wyjaśnij ten temat'],
    };
  }

  // Intent: "explain X" / "I don't understand X"
  const node = matchNode(message);
  if (node) {
    const lesson = lessons.find((l) => l.nodeId === node.id);
    const ownM = Math.round(masteryOf(state, node.id) * 100);
    const prereqText =
      node.prereq.length > 0
        ? `\n\nTo opiera się na: ${node.prereq
            .map((p) => nodeById.get(p)?.name)
            .filter(Boolean)
            .join(', ')}. Jeśli to też kuleje, zacznij od tego.`
        : '';
    return {
      text: `**${node.name}** — ${node.summary}${prereqText}\n\nTwoje opanowanie tematu: ${ownM}%.`,
      node,
      lesson,
      question: questions.find((q) => q.nodeId === node.id),
      suggestions: [`Daj zadanie: ${node.name}`, 'Co dalej po tym temacie?', 'Pokaż na mapie'],
    };
  }

  // Fallback
  return {
    text: 'Jestem Twoim nauczycielem AI. Napisz np. „nie rozumiem pierwiastków", „od czego zacząć?" albo „daj mi zadanie z procentów", a poprowadzę Cię krok po kroku.',
    suggestions: ['Od czego zacząć?', 'Nie rozumiem procentów', 'Daj mi zadanie'],
  };
}
