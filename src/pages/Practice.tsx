import { useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { subjectById, nodeById, errorTypeLabels } from '../data';
import { useStore } from '../lib/store';
import { buildSession, reasonMeta, type SessionItem } from '../lib/adaptive';
import { comboLabel } from '../lib/engagement';

export default function Practice() {
  const loc = useLocation();
  const focusNode = (loc.state as { nodeId?: string } | null)?.nodeId;
  const store = useStore();
  const answer = useStore((st) => st.answerQuestion);

  const [session, setSession] = useState<SessionItem[]>(() =>
    buildSession(store, { size: 10, focusNode }),
  );
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<ReturnType<typeof answer> | null>(null);
  const [combo, setCombo] = useState(0);
  const [done, setDone] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  const item = session[idx % session.length];
  const q = item.question;
  const sub = subjectById.get(q.subject)!;
  const node = nodeById.get(q.nodeId);
  const meta = reasonMeta(item.reason);

  const queueInfo = useMemo(() => {
    const counts = { review: 0, weak: 0, new: 0 } as Record<string, number>;
    session.forEach((s) => (counts[s.reason] += 1));
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const choose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const correct = i === q.answerIndex;
    const newCombo = correct ? combo + 1 : 0;
    const r = answer(q, i, newCombo);
    setResult(r);
    setCombo(newCombo);
    setDone((d) => d + 1);
    if (correct) {
      setCorrectCount((c) => c + 1);
      const cl = comboLabel(newCombo);
      if (cl) {
        setFlash(cl);
        setTimeout(() => setFlash(null), 1100);
      }
    }
  };

  const next = () => {
    setChosen(null);
    setResult(null);
    const nextIdx = idx + 1;
    if (nextIdx >= session.length) {
      setSession(buildSession(useStore.getState(), { size: 10 }));
      setIdx(0);
    } else {
      setIdx(nextIdx);
    }
  };

  const errType =
    chosen !== null && !result?.correct && q.misconceptions ? q.misconceptions[chosen] : '';

  return (
    <div className="relative flex h-full flex-col p-4">
      {flash && (
        <div className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-accent px-5 py-2 text-lg font-extrabold text-white shadow-glow animate-pop">
          {flash}
        </div>
      )}

      <header className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold">Ćwiczenia</h1>
          <div className="flex gap-1.5 text-[10px] text-white/50">
            <span>🔁 {queueInfo.review}</span>
            <span>🎯 {queueInfo.weak}</span>
            <span>🧭 {queueInfo.new}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right text-xs">
          {combo >= 2 && (
            <div className="rounded-full bg-warn/15 px-2 py-1 font-bold text-warn">🔥 {combo}</div>
          )}
          <div>
            <div className="font-bold text-good">{correctCount}/{done}</div>
            <div className="text-white/40">poprawne</div>
          </div>
        </div>
      </header>

      <div className="card flex-1 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="chip" style={{ background: `${sub.color}22`, color: sub.color }}>
            {sub.icon} {sub.name}
          </span>
          <span className="chip" style={{ background: `${meta.color}22`, color: meta.color }}>
            {meta.icon} {meta.label}
          </span>
          {node && <span className="chip bg-white/5 text-white/55">{node.name}</span>}
          <span className="ml-auto chip bg-white/5 text-white/55">poziom {q.difficulty}/5</span>
        </div>

        <h2 className="mb-4 text-[17px] font-semibold leading-snug">{q.stem}</h2>

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

        {result && (
          <div className="mt-4 animate-pop">
            <div
              className={`mb-2 flex items-center justify-between rounded-xl p-3 ${
                result.correct ? 'bg-good/15 text-good' : 'bg-bad/15 text-bad'
              }`}
            >
              <span className="font-bold">{result.correct ? '🎉 Dobrze!' : '🤔 Nie tym razem'}</span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                {result.multiplier > 1 && <span className="text-warn">x{result.multiplier}</span>}
                <span>+{result.xpGained} XP</span>
                {result.coinsGained > 0 && <span className="text-accent">+{result.coinsGained} 💎</span>}
              </span>
            </div>
            {result.wasReview && (
              <div className="mb-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs text-accent">
                🔁 Powtórka zaliczona — temat wróci za jakiś czas, by utrwalić wiedzę.
              </div>
            )}
            {result.discovered && result.correct && (
              <div className="mb-2 rounded-lg border border-good/30 bg-good/10 px-3 py-1.5 text-xs text-good">
                🧭 Nowy temat odkryty! Dodano go do Twojej mapy wiedzy.
              </div>
            )}
            {errType && (
              <div className="mb-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
                Typ błędu: <span className="font-semibold">{errorTypeLabels[errType as keyof typeof errorTypeLabels]}</span>. Zapisano w profilu.
              </div>
            )}
            <p className="rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-white/85">{q.explanation}</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        {result ? (
          <button onClick={next} className="btn-brand flex-1">
            {combo >= 2 ? `Kontynuuj serię 🔥 (${combo})` : 'Następne zadanie ›'}
          </button>
        ) : (
          <div className="flex-1 text-center text-xs text-white/40">Wybierz odpowiedź, aby zobaczyć analizę</div>
        )}
        <Link to="/" className="btn-ghost">Koniec</Link>
      </div>
    </div>
  );
}
