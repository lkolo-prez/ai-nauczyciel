import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { subjects } from '../data';
import { estimatedScore } from '../lib/cognitive';

// Layer 17 — career explorer. From the student's subject strengths it suggests
// fields and concrete professions, to make learning feel purposeful ("po co mi
// to?"). Heuristic for now; an LLM + richer profile can deepen this later.

interface Path {
  name: string;
  emoji: string;
  blurb: string;
  weights: Record<string, number>; // subject -> importance 0..1
  jobs: string[];
}

const PATHS: Path[] = [
  {
    name: 'Technologia i IT',
    emoji: '💻',
    blurb: 'Programowanie, dane, sztuczna inteligencja, chmura.',
    weights: { matematyka: 1, angielski: 0.7, polski: 0.3 },
    jobs: ['Programista', 'Data Scientist', 'Cloud Architect', 'Specjalista AI'],
  },
  {
    name: 'Nauki ścisłe i inżynieria',
    emoji: '🔬',
    blurb: 'Fizyka, technika, projektowanie, badania.',
    weights: { matematyka: 1, angielski: 0.5, polski: 0.3 },
    jobs: ['Inżynier', 'Architekt', 'Analityk', 'Biotechnolog'],
  },
  {
    name: 'Medycyna i zdrowie',
    emoji: '🩺',
    blurb: 'Opieka, ratownictwo, farmacja, psychologia.',
    weights: { matematyka: 0.7, polski: 0.7, angielski: 0.6 },
    jobs: ['Lekarz', 'Farmaceuta', 'Fizjoterapeuta', 'Psycholog'],
  },
  {
    name: 'Prawo i biznes',
    emoji: '⚖️',
    blurb: 'Argumentacja, ekonomia, zarządzanie, negocjacje.',
    weights: { polski: 1, matematyka: 0.6, angielski: 0.7 },
    jobs: ['Prawnik', 'Przedsiębiorca', 'Analityk biznesowy', 'Menedżer'],
  },
  {
    name: 'Język i komunikacja',
    emoji: '🗣️',
    blurb: 'Media, tłumaczenia, marketing, dyplomacja.',
    weights: { polski: 0.9, angielski: 1, matematyka: 0.3 },
    jobs: ['Dziennikarz', 'Tłumacz', 'Specjalista marketingu', 'Copywriter'],
  },
  {
    name: 'Kultura i sztuka',
    emoji: '🎨',
    blurb: 'Projektowanie, film, literatura, gry.',
    weights: { polski: 0.9, angielski: 0.6, matematyka: 0.4 },
    jobs: ['Projektant UX', 'Reżyser', 'Pisarz', 'Game designer'],
  },
];

export default function Career() {
  const s = useStore();
  const scores: Record<string, number> = {};
  for (const sub of subjects) scores[sub.id] = estimatedScore(s, sub.id);

  const ranked = PATHS.map((p) => {
    let num = 0;
    let den = 0;
    for (const [sid, w] of Object.entries(p.weights)) {
      num += (scores[sid] ?? 30) * w;
      den += w;
    }
    return { path: p, fit: Math.round(num / (den || 1)) };
  }).sort((a, b) => b.fit - a.fit);

  const hasData = s.attempts.length >= 3;

  return (
    <div className="p-4 pb-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold">🧭 Doradca kariery</h1>
          <p className="text-[11px] text-white/50">Dokąd mogą zaprowadzić Cię Twoje mocne strony.</p>
        </div>
        <Link to="/" className="chip bg-white/5 text-white/60">‹ Dom</Link>
      </header>

      {!hasData && (
        <div className="mb-3 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-[11px] text-warn">
          ℹ️ Rozwiąż kilka zadań, aby dopasowanie ścieżek było trafniejsze.
        </div>
      )}

      <div className="space-y-3">
        {ranked.map(({ path, fit }, i) => (
          <div key={path.name} className={`card p-4 ${i === 0 ? 'ring-1 ring-brand/40' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{path.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{path.name}</span>
                  {i === 0 && <span className="chip bg-brand/20 text-brand-400">Najlepsze dopasowanie</span>}
                </div>
                <div className="text-[11px] text-white/55">{path.blurb}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold" style={{ color: fit >= 70 ? '#34d399' : fit >= 50 ? '#fbbf24' : '#fb7185' }}>
                  {fit}%
                </div>
                <div className="text-[9px] text-white/40">dopasowanie</div>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${fit}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {path.jobs.map((j) => (
                <span key={j} className="chip bg-white/5 text-white/70 text-[11px]">{j}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] text-white/35">
        To wskazówka, nie wyrocznia — zainteresowania zmieniają się i to świetnie. 🚀
      </p>
    </div>
  );
}
