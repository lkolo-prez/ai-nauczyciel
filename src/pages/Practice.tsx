import { useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { questions as allQuestions, subjectById, nodeById, errorTypeLabels } from '../data';
import { useStore } from '../lib/store';
import { rootGaps } from '../lib/cognitive';
import type { Question } from '../lib/types';

export default function Practice() {
  const loc = useLocation();
  const focusNode = (loc.state as { nodeId?: string } | null)?.nodeId;
  const s = useStore();
  const answer = useStore((st) => st.answerQuestion);

  // Build a session queue: focused node, else weakest root gaps, else all.
  const queue = useMemo<Question[]>(() => {
    if (focusNode) {
      const q = allQuestions.filter((x) => x.nodeId === focusNode);
      if (q.length) return shuffle(q);
    }
    const gapNodes = new Set(rootGaps(s, undefined, 5).map((g) => g.node.id));
    const prioritized = allQuestions.filter((q) => gapNodes.has(q.nodeId));
    return shuffle(prioritized.length >= 3 ? prioritized : allQuestions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNode]);

  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; xpGained: number } | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [showReason, setShowReason] = useState(false);
  const [done, setDone] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const q = queue[idx % queue.length];
  const sub = subjectById.get(q.subject)!;
  const node = nodeById.get(q.nodeId);

  const choose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const r = answer(q, i);
    setResult(r);
    setDone((d) => d + 1);
    if (r.correct) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    setChosen(null);
    setResult(null);
    setReasoning('');
    setShowReason(false);
    setIdx((i) => i + 1);
  };

  const errType =
    chosen !== null && !result?.correct && q.misconceptions
      ? q.misconceptions[chosen]
      : '';

  return (
    <div className="flex h-full flex-col p-4">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold">Ćwiczenia</h1>
          <div className="text-[11px] text-white/50">
            {focusNode && node ? `Temat: ${node.name}` : 'Tryb inteligentny — Twoje słabe punkty'}
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="font-bold text-good">{correctCount}/{done}</div>
          <div className="text-white/40">poprawne</div>
        </div>
      </header>

      <div className="card flex-1 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="chip" style={{ background: `${sub.color}22`, color: sub.color }}>
            {sub.icon} {sub.name}
          </span>
          {node && <span className="chip bg-white/5 text-white/55">{node.name}</span>}
          <span className="ml-auto chip bg-white/5 text-white/55">poziom {q.difficulty}/5</span>
        </div>

        <h2 className="mb-4 text-[17px] font-semibold leading-snug">{q.stem}</h2>

        {/* Optional: capture reasoning before answering */}
        {chosen === null && (
          <div className="mb-3">
            {!showReason ? (
              <button
                onClick={() => setShowReason(true)}
                className="text-xs text-brand-400 underline-offset-2 hover:underline"
              >
                ✍️ Pokaż, jak myślisz (opcjonalnie)
              </button>
            ) : (
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Zapisz swój tok rozumowania, zanim odpowiesz…"
                className="w-full rounded-xl bg-white/5 p-3 text-sm outline-none focus:ring-2 focus:ring-brand"
                rows={2}
              />
            )}
          </div>
        )}

        <div className="space-y-2">
          {q.options?.map((opt, i) => {
            const isCorrect = i === q.answerIndex;
            const isChosen = i === chosen;
            let cls = 'border-white/10 bg-white/5 hover:bg-white/10';
            if (chosen !== null) {
              if (isCorrect) cls = 'border-good/60 bg-good/15';
              else if (isChosen) cls = 'border-bad/60 bg-bad/15';
              else cls = 'border-white/5 bg-white/5 opacity-60';
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={chosen !== null}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${cls}`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {chosen !== null && isCorrect && <span className="text-good">✓</span>}
                {chosen !== null && isChosen && !isCorrect && <span className="text-bad">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {result && (
          <div className="mt-4 animate-pop">
            <div
              className={`mb-2 flex items-center justify-between rounded-xl p-3 ${
                result.correct ? 'bg-good/15 text-good' : 'bg-bad/15 text-bad'
              }`}
            >
              <span className="font-bold">
                {result.correct ? '🎉 Dobrze!' : '🤔 Nie tym razem'}
              </span>
              <span className="text-sm font-semibold">+{result.xpGained} XP</span>
            </div>
            {errType && (
              <div className="mb-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
                Typ błędu: <span className="font-semibold">{errorTypeLabels[errType as keyof typeof errorTypeLabels]}</span>
                . System zapamiętał to w Twoim profilu.
              </div>
            )}
            <p className="rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-white/85">
              {q.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        {result ? (
          <button onClick={next} className="btn-brand flex-1">
            Następne zadanie ›
          </button>
        ) : (
          <div className="flex-1 text-center text-xs text-white/40">Wybierz odpowiedź, aby zobaczyć analizę</div>
        )}
        <Link to="/" className="btn-ghost">Koniec</Link>
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
