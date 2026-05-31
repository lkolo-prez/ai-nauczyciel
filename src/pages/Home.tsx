import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, CLASSES } from '../lib/store';
import { subjects } from '../data';
import {
  estimatedScore,
  rootGaps,
  burnoutRisk,
  levelInfo,
  streak,
  errorProfile,
} from '../lib/cognitive';
import { dueNodeIds } from '../lib/srs';
import { leagueOf } from '../lib/engagement';
import Radar from '../components/charts/Radar';
import Ring from '../components/Ring';
import QuestsPanel from '../components/QuestsPanel';
import GoalCard from '../components/GoalCard';

function Onboarding() {
  const setProfile = useStore((s) => s.setProfile);
  const [name, setName] = useState('');
  const [cls, setCls] = useState('strateg');
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-5 backdrop-blur">
      <div className="card w-full max-w-sm p-6 animate-pop">
        <div className="mb-1 text-2xl font-extrabold">Cześć! 👋</div>
        <p className="mb-4 text-sm text-white/70">
          Zbuduję Twój <span className="text-brand-400 font-semibold">cyfrowy profil ucznia</span> i poprowadzę Cię do egzaminu ósmoklasisty.
        </p>
        <label className="mb-1 block text-xs font-semibold text-white/60">Jak masz na imię?</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Twoje imię"
          className="mb-4 w-full rounded-xl bg-white/5 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
        />
        <div className="mb-2 text-xs font-semibold text-white/60">Wybierz klasę postaci</div>
        <div className="mb-5 grid grid-cols-2 gap-2">
          {CLASSES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCls(c.id)}
              className={`rounded-xl border p-3 text-left transition ${
                cls === c.id ? 'border-brand bg-brand/15' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="text-xl">{c.emoji}</div>
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="text-[10px] text-white/55">{c.perk}</div>
            </button>
          ))}
        </div>
        <button className="btn-brand w-full" onClick={() => setProfile(name.trim() || 'Uczeń', cls)}>
          Zaczynamy 🚀
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const s = useStore();
  const lvl = levelInfo(s.xp);
  const str = streak(s);
  const burn = burnoutRisk(s);
  const ep = errorProfile(s);
  const league = leagueOf(s.leagueTier);
  const due = dueNodeIds(s.srs).length;
  const boostActive = s.inventory.xpBoostUntil > Date.now();

  const radarAxes = subjects.map((sub) => ({ label: sub.shortName, value: estimatedScore(s, sub.id) / 100 }));
  const gaps = rootGaps(s, undefined, 3);

  return (
    <div className="p-4 pb-6">
      {!s.name && <Onboarding />}

      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/50">Egzamin ósmoklasisty</div>
          <h1 className="text-xl font-extrabold">Cześć, {s.name || 'Uczniu'} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip bg-accent/15 text-accent">💎 {s.coins}</span>
          <Link to="/profil" className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
            <span className="text-lg">{CLASSES.find((c) => c.id === s.classId)?.emoji ?? '🎓'}</span>
            <div className="text-right leading-tight">
              <div className="text-[10px] text-white/50">Poz. {lvl.level} {league.emoji}</div>
              <div className="text-xs font-semibold">🔥 {str}</div>
            </div>
          </Link>
        </div>
      </header>

      {boostActive && (
        <div className="mb-3 rounded-xl border border-warn/40 bg-warn/10 p-2 text-center text-xs font-semibold text-warn">
          ⚡ Boost 2× XP aktywny! Wykorzystaj go w ćwiczeniach.
        </div>
      )}

      {burn.risk !== 'ok' && (
        <div
          className={`mb-4 rounded-xl border p-3 text-sm ${
            burn.risk === 'wysokie' ? 'border-bad/40 bg-bad/10 text-bad' : 'border-warn/40 bg-warn/10 text-warn'
          }`}
        >
          <div className="font-semibold">
            {burn.risk === 'wysokie' ? '⚠️ Wysokie ryzyko wypalenia' : '🟡 Zadbaj o tempo'}
          </div>
          <div className="text-xs opacity-80">{burn.reasons[0]}. Zrób krótką, lekką sesję 5 minut.</div>
        </div>
      )}

      <GoalCard />

      {/* Due reviews — the daily hook */}
      {due > 0 && (
        <Link
          to="/cwicz"
          className="card mb-4 flex items-center gap-3 border-accent/30 bg-accent/10 p-4 transition hover:bg-accent/15"
        >
          <span className="text-3xl">🔁</span>
          <div className="flex-1">
            <div className="font-bold text-accent">{due} {due === 1 ? 'temat' : 'tematy'} do powtórki dziś</div>
            <div className="text-xs text-white/60">Utrwal, zanim zapomnisz — to klucz do trwałej wiedzy.</div>
          </div>
          <span className="btn-brand text-sm">Powtórz ›</span>
        </Link>
      )}

      <QuestsPanel />

      {/* Exam boss mode */}
      <Link
        to="/egzamin"
        className="card mb-4 flex items-center gap-3 overflow-hidden p-4 transition hover:bg-card"
        style={{ background: 'linear-gradient(110deg, rgba(124,92,255,0.18), rgba(251,113,133,0.12))' }}
      >
        <span className="animate-floaty text-3xl">⚔️</span>
        <div className="flex-1">
          <div className="font-bold">Egzamin próbny — Boss</div>
          <div className="text-xs text-white/60">Test na czas. Pokonaj bossa, zgarnij wielką nagrodę.</div>
        </div>
        <span className="text-white/40">›</span>
      </Link>

      <section className="card mb-4 p-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-bold">🧬 Twój cyfrowy bliźniak</h2>
          <span className="chip bg-white/5 text-white/60">{ep.total} analiz</span>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <Radar axes={radarAxes} />
          <div className="space-y-2">
            {subjects.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <Ring value={estimatedScore(s, sub.id) / 100} size={44} stroke={5} color={sub.color} />
                <div className="leading-tight">
                  <div className="text-sm font-semibold">{sub.name}</div>
                  <div className="text-[10px] text-white/50">prognoza wyniku</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70">
          Dominujący typ błędu: <span className="font-semibold text-white">{ep.label}</span>
          {ep.dominant && ' — popracujmy nad tym świadomie.'}
        </div>
      </section>

      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-bold">🎯 Plan na dziś</h2>
        <p className="mb-3 text-xs text-white/55">
          System znalazł „korzenie" Twoich braków — tematy, które odblokują najwięcej.
        </p>
        <div className="space-y-2">
          {gaps.map((g, i) => {
            const sub = subjects.find((x) => x.id === g.node.subject)!;
            return (
              <Link
                key={g.node.id}
                to="/cwicz"
                state={{ nodeId: g.node.id }}
                className="flex items-center gap-3 rounded-xl bg-white/5 p-3 transition hover:bg-white/10"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand/20 text-sm font-bold text-brand-400">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{g.node.name}</div>
                  <div className="text-[10px] text-white/50">
                    {sub.name} • opanowanie {Math.round(g.mastery * 100)}%
                    {g.unlocks > 0 && ` • odblokuje ${g.unlocks} tematów`}
                  </div>
                </div>
                <span className="text-white/40">›</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link to="/feed" className="card flex flex-col gap-1 p-4 transition hover:bg-card">
          <span className="text-2xl">⚡</span>
          <span className="font-semibold">Feed wiedzy</span>
          <span className="text-[11px] text-white/50">Nauka jak TikTok</span>
        </Link>
        <Link to="/symulator" className="card flex flex-col gap-1 p-4 transition hover:bg-card">
          <span className="text-2xl">📈</span>
          <span className="font-semibold">Symulator</span>
          <span className="text-[11px] text-white/50">Twój przyszły wynik</span>
        </Link>
        <Link to="/mapa" className="card flex flex-col gap-1 p-4 transition hover:bg-card">
          <span className="text-2xl">🗺️</span>
          <span className="font-semibold">Mapa wiedzy</span>
          <span className="text-[11px] text-white/50">Graf zależności</span>
        </Link>
        <Link to="/tutor" className="card flex flex-col gap-1 p-4 transition hover:bg-card">
          <span className="text-2xl">🤖</span>
          <span className="font-semibold">Nauczyciel AI</span>
          <span className="text-[11px] text-white/50">Pytaj o wszystko</span>
        </Link>
      </section>
    </div>
  );
}
