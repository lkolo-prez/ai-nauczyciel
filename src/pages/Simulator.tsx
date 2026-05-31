import { useState } from 'react';
import { Link } from 'react-router-dom';
import { examSubjects as subjects } from '../data';
import { useStore } from '../lib/store';
import { estimatedScore, projectScore } from '../lib/cognitive';
import LineChart from '../components/charts/LineChart';

export default function Simulator() {
  const s = useStore();
  const [minutes, setMinutes] = useState(20);
  const [days, setDays] = useState(30);

  const series = subjects.map((sub) => ({
    label: sub.shortName,
    color: sub.color,
    points: projectScore(s, sub.id, minutes, days),
  }));

  return (
    <div className="p-4 pb-6">
      <header className="mb-4">
        <h1 className="text-lg font-extrabold">📈 Symulator wyniku</h1>
        <p className="text-[11px] text-white/50">
          Zobacz, dokąd zaprowadzi Cię regularna nauka — w oparciu o Twój realny profil.
        </p>
      </header>

      <div className="card mb-4 p-4">
        <LineChart series={series} />
      </div>

      <div className="card mb-4 space-y-4 p-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-semibold">⏱️ Nauka dziennie</span>
            <span className="text-brand-400 font-bold">{minutes} min</span>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={minutes}
            onChange={(e) => setMinutes(+e.target.value)}
            className="w-full accent-brand"
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-semibold">📅 Przez ile dni</span>
            <span className="text-brand-400 font-bold">{days} dni</span>
          </div>
          <input
            type="range"
            min={7}
            max={90}
            step={1}
            value={days}
            onChange={(e) => setDays(+e.target.value)}
            className="w-full accent-brand"
          />
        </div>
      </div>

      <div className="space-y-2">
        {subjects.map((sub) => {
          const now = estimatedScore(s, sub.id);
          const proj = series.find((x) => x.label === sub.shortName)!;
          const future = proj.points[proj.points.length - 1].score;
          const delta = future - now;
          return (
            <div key={sub.id} className="card flex items-center gap-3 p-3">
              <span className="text-2xl">{sub.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{sub.name}</div>
                <div className="text-[11px] text-white/50">jeśli {minutes} min/dzień przez {days} dni</div>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  <span className="text-white/60">{now}%</span>
                  <span className="mx-1 text-white/40">→</span>
                  <span className="font-bold" style={{ color: sub.color }}>{future}%</span>
                </div>
                <div className="text-[11px] font-semibold text-good">+{delta} p.p.</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl bg-brand/10 p-4 text-sm text-white/80">
        💪 Nawet <span className="font-bold text-brand-400">{minutes} minut dziennie</span> robi
        realną różnicę. System sam dobiera, na czym się skupić, żeby każda minuta dała maksimum.
      </div>

      <Link to="/cwicz" className="btn-brand mt-4 w-full">Zacznij teraz 🎯</Link>
    </div>
  );
}
