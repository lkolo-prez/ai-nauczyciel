import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { examSubjects as subjects, nodesBySubject } from '../data';

// Layer 13 — "Nauczyciel AI": a class dashboard. With no real backend yet, it
// simulates a deterministic cohort so a teacher can see what the product offers:
// class-wide weak topics, at-risk students, and a one-tap jump to generate a
// targeted worksheet. Wiring real student profiles is an Etap-2/4 task.

interface Student {
  name: string;
  scores: Record<string, number>; // subjectId -> %
}

const FIRST = ['Zofia', 'Antoni', 'Maja', 'Jan', 'Lena', 'Kacper', 'Hania', 'Filip', 'Nadia', 'Igor', 'Ola', 'Szymon', 'Zuzia', 'Wojtek', 'Aniela', 'Bartek', 'Pola', 'Tymon', 'Kalina', 'Borys'];

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1103515245 + 12345) >>> 0) % 10000) / 10000;
}

function buildClass(size: number, seed: number): Student[] {
  const rng = seeded(seed);
  return Array.from({ length: size }, (_, i) => {
    const scores: Record<string, number> = {};
    for (const sub of subjects) {
      // each student has a baseline + per-subject variation
      const base = 45 + rng() * 45;
      scores[sub.id] = Math.round(Math.max(20, Math.min(98, base)));
    }
    return { name: `${FIRST[i % FIRST.length]} ${String.fromCharCode(65 + (i % 26))}.`, scores };
  });
}

export default function Teacher() {
  const [size, setSize] = useState(24);
  const [subject, setSubject] = useState(subjects[0].id);
  const students = useMemo(() => buildClass(size, 4242), [size]);

  const avg = (sid: string) => Math.round(students.reduce((a, s) => a + s.scores[sid], 0) / students.length);
  const atRisk = students.filter((s) => Object.values(s.scores).some((v) => v < 40)).length;

  // Simulated class-wide topic mastery for the selected subject (deterministic).
  const topicHeat = useMemo(() => {
    const rng = seeded(subject.length * 99 + size);
    return nodesBySubject(subject).map((n) => ({
      node: n,
      mastery: Math.round(Math.max(20, Math.min(95, 40 + (n.examWeight <= 3 ? 25 : 5) + rng() * 45))),
    }));
  }, [subject, size]);

  const weakest = [...topicHeat].sort((a, b) => a.mastery - b.mastery).slice(0, 3);

  const heatColor = (m: number) => (m >= 70 ? '#34d399' : m >= 50 ? '#fbbf24' : '#fb7185');

  return (
    <div className="p-4 pb-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold">🧑‍🏫 Tryb nauczyciela</h1>
          <p className="text-[11px] text-white/50">Raport klasy: słabe punkty, uczniowie z ryzykiem, gotowe lekcje.</p>
        </div>
        <Link to="/" className="chip bg-white/5 text-white/60">‹ Dom</Link>
      </header>

      <div className="mb-3 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-[11px] text-warn">
        ℹ️ Dane klasy są symulowane (demo). Po podłączeniu kont uczniów raport będzie na żywo.
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <div className="text-xl">👥</div>
          <div className="text-lg font-extrabold">{size}</div>
          <div className="text-[10px] text-white/50">uczniów</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl">📊</div>
          <div className="text-lg font-extrabold">{Math.round(subjects.reduce((a, s) => a + avg(s.id), 0) / subjects.length)}%</div>
          <div className="text-[10px] text-white/50">średnia klasy</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl" style={{ color: atRisk ? '#fb7185' : '#34d399' }}>🛟</div>
          <div className="text-lg font-extrabold" style={{ color: atRisk ? '#fb7185' : '#34d399' }}>{atRisk}</div>
          <div className="text-[10px] text-white/50">z ryzykiem</div>
        </div>
      </div>

      <div className="card mb-4 p-4">
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-semibold text-white/60">Liczebność klasy</span>
          <span className="text-brand-400">{size}</span>
        </div>
        <input type="range" min={10} max={32} value={size} onChange={(e) => setSize(+e.target.value)} className="w-full accent-brand" />
      </div>

      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-bold">Średnie wg przedmiotów</h2>
        <div className="space-y-3">
          {subjects.map((sub) => (
            <div key={sub.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{sub.icon} {sub.name}</span>
                <span className="font-semibold" style={{ color: sub.color }}>{avg(sub.id)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${avg(sub.id)}%`, background: sub.color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-4 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-bold">🌡️ Mapa cieplna tematów</h2>
          <div className="flex gap-1">
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSubject(sub.id)}
                className={`chip border text-[11px] ${subject === sub.id ? 'border-brand bg-brand/20 text-white' : 'border-white/10 bg-white/5 text-white/60'}`}
              >
                {sub.shortName}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {topicHeat.map((t) => (
            <div key={t.node.id} className="flex items-center gap-2 rounded-lg p-2 text-[11px]" style={{ background: `${heatColor(t.mastery)}22` }}>
              <span className="h-2 w-2 rounded-full" style={{ background: heatColor(t.mastery) }} />
              <span className="flex-1 truncate">{t.node.name}</span>
              <span className="font-semibold" style={{ color: heatColor(t.mastery) }}>{t.mastery}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="mb-2 font-bold">💡 Sugestie lekcji</h2>
        <p className="mb-3 text-[11px] text-white/50">Najsłabsze tematy klasy — warto poświęcić im lekcję i sprawdzian.</p>
        <div className="space-y-2">
          {weakest.map((t) => (
            <div key={t.node.id} className="flex items-center gap-2 rounded-lg bg-white/5 p-2.5 text-sm">
              <span className="text-bad">●</span>
              <span className="flex-1">{t.node.name}</span>
              <span className="text-white/50">{t.mastery}%</span>
            </div>
          ))}
        </div>
        <Link to="/generator" className="btn-brand mt-3 w-full text-sm">🛠️ Wygeneruj sprawdzian na te tematy</Link>
      </section>
    </div>
  );
}
