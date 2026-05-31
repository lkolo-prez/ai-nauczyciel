import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { examSubjects as subjects } from '../data';
import { estimatedScore, rootGaps, burnoutRisk, streak } from '../lib/cognitive';
import Ring from '../components/Ring';

// Layer 12 — "Rodzic AI": a calm, jargon-free snapshot a parent can read in 10s,
// without needing to understand the subject matter.
export default function Parent() {
  const s = useStore();
  const burn = burnoutRisk(s);
  const gaps = rootGaps(s, undefined, 3);
  const activeThisWeek = new Set(s.activeDates).size;
  const avg = Math.round(
    subjects.reduce((a, sub) => a + estimatedScore(s, sub.id), 0) / subjects.length,
  );

  const riskLabel = burn.risk === 'wysokie' ? 'Podwyższone' : burn.risk === 'uwaga' ? 'Umiarkowane' : 'Niskie';
  const riskColor = burn.risk === 'wysokie' ? '#fb7185' : burn.risk === 'uwaga' ? '#fbbf24' : '#34d399';

  return (
    <div className="p-4 pb-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold">👪 Panel rodzica</h1>
          <p className="text-[11px] text-white/50">Raport postępów {s.name || 'ucznia'} — w prostym języku.</p>
        </div>
        <Link to="/" className="chip bg-white/5 text-white/60">‹ Dom</Link>
      </header>

      <div className="card mb-4 flex items-center gap-4 p-4">
        <Ring value={avg / 100} size={72} color="#7c5cff" />
        <div>
          <div className="text-sm text-white/55">Średnia prognoza wyniku</div>
          <div className="text-2xl font-extrabold">{avg}%</div>
          <div className="text-xs text-white/50">na podstawie aktywności w aplikacji</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <div className="text-xl">🔥</div>
          <div className="text-lg font-extrabold">{streak(s)}</div>
          <div className="text-[10px] text-white/50">dni z rzędu</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl">📅</div>
          <div className="text-lg font-extrabold">{activeThisWeek}</div>
          <div className="text-[10px] text-white/50">dni nauki</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl" style={{ color: riskColor }}>🛡️</div>
          <div className="text-sm font-extrabold" style={{ color: riskColor }}>{riskLabel}</div>
          <div className="text-[10px] text-white/50">ryzyko zniechęcenia</div>
        </div>
      </div>

      <section className="card mb-4 p-4">
        <h2 className="mb-3 font-bold">Postęp wg przedmiotów</h2>
        <div className="space-y-3">
          {subjects.map((sub) => {
            const sc = estimatedScore(s, sub.id);
            return (
              <div key={sub.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{sub.icon} {sub.name}</span>
                  <span className="font-semibold" style={{ color: sub.color }}>{sc}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${sc}%`, background: sub.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-bold">Na co zwrócić uwagę</h2>
        {gaps.length ? (
          <ul className="space-y-2 text-sm">
            {gaps.map((g) => (
              <li key={g.node.id} className="flex items-center gap-2">
                <span className="text-bad">●</span>
                <span className="flex-1">{g.node.name}</span>
                <span className="text-white/50">{Math.round(g.mastery * 100)}%</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/50">Brak pilnych braków — równy, dobry postęp. 👍</p>
        )}
        <div className="mt-3 rounded-lg bg-white/5 p-3 text-xs text-white/70">
          💡 Rada: krótka, regularna nauka (15–20 min dziennie) daje lepsze efekty niż rzadkie długie sesje.
          {burn.risk !== 'ok' && ' Warto dziś odciążyć ucznia i pochwalić za wysiłek.'}
        </div>
      </section>

      <p className="text-center text-[10px] text-white/30">
        Dane pochodzą z aktywności w aplikacji i są przechowywane lokalnie na urządzeniu.
      </p>
    </div>
  );
}
