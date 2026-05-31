import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { subjects, questions as allQuestions, subjectById } from '../data';
import { useStore } from '../lib/store';
import type { Question } from '../lib/types';

type Phase = 'setup' | 'running' | 'result';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Exam() {
  const answer = useStore((s) => s.answerQuestion);

  const [phase, setPhase] = useState<Phase>('setup');
  const [subject, setSubject] = useState<string>('mixed');
  const [length, setLength] = useState(8);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [items, setItems] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const timerRef = useRef<number | null>(null);

  const pool = useMemo(
    () => (subject === 'mixed' ? allQuestions : allQuestions.filter((q) => q.subject === subject)),
    [subject],
  );
  const maxLen = Math.min(pool.length, 12);

  const start = () => {
    const qs = shuffle(pool).slice(0, Math.min(length, pool.length));
    setItems(qs);
    setAnswers([]);
    setIdx(0);
    setSecondsLeft(qs.length * 45); // 45s per question
    setPhase('running');
  };

  useEffect(() => {
    if (phase !== 'running') return;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((t) => {
        if (t <= 1) {
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const choose = (i: number) => {
    const a = [...answers];
    a[idx] = i;
    setAnswers(a);
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Record every answered question into the cognitive model + SRS.
    items.forEach((q, k) => {
      const chosen = answers[k];
      if (chosen !== undefined) answer(q, chosen, 0);
    });
    setPhase('result');
  };

  if (phase === 'setup') {
    return (
      <div className="p-4">
        <Header />
        <div className="card mb-4 p-4">
          <h2 className="mb-3 font-bold">Wybierz przedmiot</h2>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setSubject('mixed')}
              className={`rounded-xl border p-3 text-left ${subject === 'mixed' ? 'border-brand bg-brand/15' : 'border-white/10 bg-white/5'}`}
            >
              <div className="text-xl">🎲</div>
              <div className="text-sm font-semibold">Mieszany</div>
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSubject(sub.id)}
                className={`rounded-xl border p-3 text-left ${subject === sub.id ? 'border-brand bg-brand/15' : 'border-white/10 bg-white/5'}`}
              >
                <div className="text-xl">{sub.icon}</div>
                <div className="text-sm font-semibold">{sub.name}</div>
              </button>
            ))}
          </div>
          <label className="mb-1 block text-xs text-white/60">Liczba pytań: {Math.min(length, maxLen)}</label>
          <input
            type="range"
            min={4}
            max={maxLen}
            value={Math.min(length, maxLen)}
            onChange={(e) => setLength(+e.target.value)}
            className="w-full accent-brand"
          />
          <div className="mt-2 text-xs text-white/50">⏱️ {Math.min(length, maxLen) * 45}s na cały test (45s/pytanie)</div>
        </div>
        <button onClick={start} className="btn-brand w-full">Rozpocznij walkę z bossem ⚔️</button>
        <Link to="/" className="mt-2 block text-center text-xs text-white/40">Wróć</Link>
      </div>
    );
  }

  if (phase === 'running') {
    const q = items[idx];
    const sub = subjectById.get(q.subject)!;
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');
    const answered = answers[idx];
    const timeLow = secondsLeft <= 15;
    return (
      <div className="flex h-full flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="chip bg-white/5 text-white/60">Pytanie {idx + 1}/{items.length}</span>
          <span className={`chip font-bold ${timeLow ? 'bg-bad/20 text-bad animate-pop' : 'bg-white/5 text-white'}`}>
            ⏱️ {mm}:{ss}
          </span>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${((idx + 1) / items.length) * 100}%` }} />
        </div>

        <div className="card flex-1 p-4">
          <span className="chip mb-2 inline-block" style={{ background: `${sub.color}22`, color: sub.color }}>
            {sub.icon} {sub.name}
          </span>
          <h2 className="mb-4 text-[17px] font-semibold leading-snug">{q.stem}</h2>
          <div className="space-y-2">
            {q.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                  answered === i ? 'border-brand bg-brand/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {idx > 0 && (
            <button onClick={() => setIdx(idx - 1)} className="btn-ghost">‹</button>
          )}
          {idx < items.length - 1 ? (
            <button onClick={() => setIdx(idx + 1)} className="btn-brand flex-1">Następne ›</button>
          ) : (
            <button onClick={finish} className="btn-brand flex-1">Zakończ test ✓</button>
          )}
        </div>
      </div>
    );
  }

  // result
  const correct = items.filter((q, k) => answers[k] === q.answerIndex).length;
  const pct = Math.round((correct / items.length) * 100);
  return <ExamResult correct={correct} total={items.length} pct={pct} onRetry={() => setPhase('setup')} />;
}

function Header() {
  return (
    <header className="mb-4">
      <h1 className="text-lg font-extrabold">⚔️ Egzamin próbny</h1>
      <p className="text-[11px] text-white/50">Test na czas. Wynik zasila Twój cyfrowy profil i harmonogram powtórek.</p>
    </header>
  );
}

function ExamResult({ correct, total, pct, onRetry }: { correct: number; total: number; pct: number; onRetry: () => void }) {
  const grantedRef = useRef(false);
  const [reward, setReward] = useState<{ xp: number; coins: number } | null>(null);

  // Grant a one-time boss reward proportional to the score.
  useEffect(() => {
    if (grantedRef.current) return;
    grantedRef.current = true;
    const xp = 30 + correct * 12 + (pct >= 80 ? 50 : 0);
    const coins = 20 + correct * 4 + (pct >= 80 ? 30 : 0);
    // Apply via store internals: use setGoal? No — use a direct state grant.
    const st = useStore.getState();
    useStore.setState({
      xp: st.xp + xp,
      coins: st.coins + coins,
      dailyXp: { ...st.dailyXp, [new Date().toISOString().slice(0, 10)]: (st.dailyXp[new Date().toISOString().slice(0, 10)] || 0) + xp },
    });
    setReward({ xp, coins });
  }, [correct, pct]);

  const verdict = pct >= 80 ? '🏆 Boss pokonany!' : pct >= 50 ? '💪 Dobra walka!' : '🛡️ Trening czyni mistrza';
  return (
    <div className="grid h-full place-content-center p-6 text-center">
      <div className="animate-pop text-6xl">{pct >= 80 ? '🏆' : pct >= 50 ? '⚔️' : '🛡️'}</div>
      <h1 className="mt-3 text-2xl font-extrabold">{verdict}</h1>
      <div className="mt-2 text-5xl font-black" style={{ color: pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#fb7185' }}>
        {pct}%
      </div>
      <p className="mt-1 text-white/60">{correct}/{total} poprawnych</p>
      {reward && (
        <div className="mt-4 inline-flex items-center justify-center gap-3 rounded-xl bg-white/5 px-4 py-3">
          <span className="font-bold text-brand-400">+{reward.xp} XP</span>
          <span className="font-bold text-accent">+{reward.coins} 💎</span>
        </div>
      )}
      <div className="mt-6 flex flex-col gap-2">
        <button onClick={onRetry} className="btn-brand">Jeszcze raz ⚔️</button>
        <Link to="/cwicz" className="btn-ghost">Przejdź do powtórek</Link>
        <Link to="/" className="text-xs text-white/40">Wróć do domu</Link>
      </div>
    </div>
  );
}
