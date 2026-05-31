import { useState } from 'react';
import { Link } from 'react-router-dom';
import { subjects, lessonsBySubject } from '../data';
import { useStore } from '../lib/store';
import { ERROR_TYPES } from '../lib/cognitive';
import {
  topicWeights,
  bankErrorDistribution,
  personalErrorDistribution,
  bankCoverage,
  errorLabel,
} from '../lib/analytics';

// Layer 10 — "Trendy egzaminacyjne": where the points actually are, what gets
// tested most, and which mistakes cost the most — nationally vs. you.
export default function Trends() {
  const s = useStore();
  const [subject, setSubject] = useState(subjects[0].id);
  const weights = topicWeights(subject);
  const bankErr = bankErrorDistribution();
  const myErr = personalErrorDistribution(s);
  const coverage = bankCoverage((id) => lessonsBySubject(id).length);
  const maxWeight = Math.max(...weights.map((w) => w.examWeight), 1);
  const bankTotal = ERROR_TYPES.reduce((a, t) => a + bankErr[t], 0) || 1;
  const myTotal = ERROR_TYPES.reduce((a, t) => a + (myErr[t] || 0), 0) || 1;

  return (
    <div className="p-4 pb-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold">📊 Trendy egzaminacyjne</h1>
          <p className="text-[11px] text-white/50">Gdzie naprawdę są punkty i jakie błędy kosztują najwięcej.</p>
        </div>
        <Link to="/" className="chip bg-white/5 text-white/60">‹ Dom</Link>
      </header>

      <div className="mb-3 flex gap-2">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSubject(sub.id)}
            className={`chip border ${subject === sub.id ? 'border-brand bg-brand/20 text-white' : 'border-white/10 bg-white/5 text-white/60'}`}
          >
            {sub.icon} {sub.shortName}
          </button>
        ))}
      </div>

      {/* Topic weights */}
      <section className="card mb-4 p-4">
        <h2 className="mb-1 font-bold">🎯 Najważniejsze tematy</h2>
        <p className="mb-3 text-[11px] text-white/50">Im dłuższy pasek, tym częściej/więcej punktów na egzaminie.</p>
        <div className="space-y-2">
          {weights.map((w) => (
            <Link key={w.nodeId} to="/cwicz" state={{ nodeId: w.nodeId }} className="block">
              <div className="mb-0.5 flex justify-between text-xs">
                <span>{w.name}</span>
                <span className="text-white/50">waga {w.examWeight}/5 • {w.questionCount} zadań</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${(w.examWeight / maxWeight) * 100}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Error types: national vs me */}
      <section className="card mb-4 p-4">
        <h2 className="mb-1 font-bold">🧠 Co kosztuje punkty</h2>
        <p className="mb-3 text-[11px] text-white/50">Rozkład typów błędów: w bazie zadań vs Twój profil.</p>
        <div className="space-y-3">
          {ERROR_TYPES.map((t) => {
            const bankPct = Math.round((bankErr[t] / bankTotal) * 100);
            const myPct = Math.round(((myErr[t] || 0) / myTotal) * 100);
            return (
              <div key={t}>
                <div className="mb-1 text-xs font-medium">{errorLabel(t)}</div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-10 text-white/40">baza</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-white/40" style={{ width: `${bankPct}%` }} />
                  </div>
                  <span className="w-7 text-right text-white/50">{bankPct}%</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px]">
                  <span className="w-10 text-brand-400">Ty</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${myPct}%` }} />
                  </div>
                  <span className="w-7 text-right text-white/50">{myPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
        {myTotal <= 1 && (
          <p className="mt-3 text-center text-[11px] text-white/40">Rozwiąż kilka zadań, aby zobaczyć swój rozkład.</p>
        )}
      </section>

      {/* Bank coverage */}
      <section className="card p-4">
        <h2 className="mb-3 font-bold">📚 Pokrycie bazy wiedzy</h2>
        <div className="space-y-2">
          {coverage.map((c) => (
            <div key={c.subject} className="flex items-center gap-3 rounded-lg bg-white/5 p-2.5 text-sm">
              <span className="flex-1 font-medium">{c.name}</span>
              <span className="chip bg-white/5 text-white/60">{c.nodes} tematów</span>
              <span className="chip bg-white/5 text-white/60">{c.questions} zadań</span>
              <span className="chip bg-white/5 text-white/60">{c.lessons} lekcji</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-white/35">
          Baza jest otwarta (CC BY-SA) — rośnie z każdym wkładem społeczności.
        </p>
      </section>
    </div>
  );
}
