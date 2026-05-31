import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, CLASSES, ACHIEVEMENTS } from '../lib/store';
import { levelInfo, streak, errorProfile, ERROR_TYPES } from '../lib/cognitive';
import { errorTypeLabels, dataVersion } from '../data';
import {
  leagueOf,
  leagueStandings,
  LEAGUES,
  CHEST_COST,
  type ChestReward,
} from '../lib/engagement';
import Ring from '../components/Ring';
import Radar from '../components/charts/Radar';

export default function Profile() {
  const s = useStore();
  const reset = useStore((st) => st.reset);
  const buyChest = useStore((st) => st.buyChest);
  const weeklyXp = useStore((st) => st.weeklyXp)();
  const lvl = levelInfo(s.xp);
  const cls = CLASSES.find((c) => c.id === s.classId);
  const unlocked = ACHIEVEMENTS.filter((a) => a.test(s));
  const ep = errorProfile(s);
  const league = leagueOf(s.leagueTier);
  const standings = leagueStandings(weeklyXp, s.leagueTier, s.name || 'Ty');
  const boostLeft = Math.max(0, Math.round((s.inventory.xpBoostUntil - Date.now()) / 60000));

  const [chest, setChest] = useState<ChestReward | null>(null);
  const [opening, setOpening] = useState(false);

  const errAxes = ERROR_TYPES.map((t) => ({
    label: errorTypeLabels[t].split(' ')[0],
    value: ep.total ? (ep.counts[t] || 0) / ep.total : 0,
  }));

  const doOpen = () => {
    setOpening(true);
    setChest(null);
    setTimeout(() => {
      const r = buyChest();
      setOpening(false);
      if (r) setChest(r);
    }, 600);
  };

  return (
    <div className="p-4 pb-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-extrabold">Profil</h1>
        <div className="flex items-center gap-2">
          <span className="chip bg-accent/15 text-accent">💎 {s.coins}</span>
          <Link to="/" className="chip bg-white/5 text-white/60">‹ Dom</Link>
        </div>
      </header>

      <div className="card mb-4 flex items-center gap-4 p-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/20 text-3xl">
          {cls?.emoji ?? '🎓'}
        </div>
        <div className="flex-1">
          <div className="text-lg font-extrabold">{s.name || 'Uczeń'}</div>
          <div className="text-xs text-white/55">{cls?.name} • {lvl.title}</div>
          <div className="mt-1 text-[11px] text-white/45">{cls?.perk}</div>
        </div>
        <Ring value={lvl.progress} size={64} label={`L${lvl.level}`} />
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        <Stat icon="⚡" value={s.xp} label="XP" />
        <Stat icon="🔥" value={streak(s)} label="seria" />
        <Stat icon="🎯" value={s.attempts.filter((a) => a.correct).length} label="trafień" />
        <Stat icon="🔁" value={s.reviewsDone} label="powt." />
      </div>

      <div className="card mb-4 p-4">
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-semibold">Poziom {lvl.level} → {lvl.level + 1}</span>
          <span className="text-white/50">{lvl.xpInLevel}/{lvl.xpForLevel} XP</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${lvl.progress * 100}%` }} />
        </div>
      </div>

      {/* League */}
      <section className="card mb-4 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-bold">{league.emoji} {league.name}</h2>
          <span className="chip bg-white/5 text-white/60">{weeklyXp} XP w tym tygodniu</span>
        </div>
        <div className="mb-2 flex gap-1">
          {LEAGUES.map((l) => (
            <div
              key={l.id}
              className={`h-1.5 flex-1 rounded-full ${l.id <= s.leagueTier ? '' : 'opacity-25'}`}
              style={{ background: l.color }}
            />
          ))}
        </div>
        <div className="space-y-1">
          {standings.slice(0, 5).map((row, i) => (
            <div
              key={row.name}
              className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm ${row.me ? 'bg-brand/15' : 'bg-white/5'} ${i < 3 ? 'ring-1 ring-good/30' : ''}`}
            >
              <span className="w-5 font-bold text-white/50">{i + 1}</span>
              <span className="flex-1 font-medium">{row.name}</span>
              <span className="text-white/60">{row.xp} XP</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-white/35">Top 3 awansuje wyżej. Zdobywaj XP, by piąć się w górę!</p>
      </section>

      {/* Shop / chest */}
      <section className="card mb-4 p-4">
        <h2 className="mb-1 font-bold">🎁 Skrzynia nagród</h2>
        <p className="mb-3 text-[11px] text-white/50">Wymień kryształy na losową nagrodę: XP, boost 2× albo zamrożenie serii.</p>
        <div className="grid place-items-center py-2">
          <div className={`text-6xl ${opening ? 'animate-bounce' : 'animate-floaty'}`}>{opening ? '🎁' : '📦'}</div>
        </div>
        {chest && !opening && (
          <div className="mb-3 animate-pop rounded-xl bg-white/5 p-3 text-center text-sm">
            <div className="font-bold capitalize" style={{ color: chest.rarity === 'epicka' ? '#fb7185' : chest.rarity === 'rzadka' ? '#7c5cff' : '#22d3ee' }}>
              Skrzynia {chest.rarity}!
            </div>
            <div className="mt-1 flex flex-wrap justify-center gap-2 text-xs">
              <span className="chip bg-accent/15 text-accent">+{chest.coins} 💎</span>
              {chest.xp > 0 && <span className="chip bg-brand/15 text-brand-400">+{chest.xp} XP</span>}
              {chest.xpBoostMin > 0 && <span className="chip bg-warn/15 text-warn">⚡ {chest.xpBoostMin} min 2×</span>}
              {chest.streakFreeze > 0 && <span className="chip bg-good/15 text-good">❄️ zamrożenie serii</span>}
            </div>
          </div>
        )}
        <button
          onClick={doOpen}
          disabled={s.coins < CHEST_COST || opening}
          className={`w-full ${s.coins < CHEST_COST ? 'btn-ghost opacity-50' : 'btn-brand'}`}
        >
          {s.coins < CHEST_COST ? `Potrzebujesz ${CHEST_COST} 💎` : `Otwórz za ${CHEST_COST} 💎`}
        </button>
        {(s.inventory.streakFreeze > 0 || boostLeft > 0) && (
          <div className="mt-3 flex justify-center gap-2 text-xs">
            {s.inventory.streakFreeze > 0 && <span className="chip bg-white/5 text-white/70">❄️ {s.inventory.streakFreeze} zamrożeń</span>}
            {boostLeft > 0 && <span className="chip bg-warn/15 text-warn">⚡ boost: {boostLeft} min</span>}
          </div>
        )}
      </section>

      <section className="card mb-4 p-4">
        <h2 className="mb-3 font-bold">🏅 Osiągnięcia ({unlocked.length}/{ACHIEVEMENTS.length})</h2>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.includes(a);
            return (
              <div
                key={a.id}
                className={`rounded-xl p-2 text-center ${got ? 'bg-brand/15' : 'bg-white/5 opacity-40 grayscale'}`}
                title={a.desc}
              >
                <div className="text-xl">{a.emoji}</div>
                <div className="mt-1 text-[9px] font-semibold leading-tight">{a.name}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card mb-4 p-4">
        <h2 className="mb-1 font-bold">🧠 Profil błędów</h2>
        <p className="mb-2 text-[11px] text-white/50">Na czym najczęściej tracisz punkty.</p>
        {ep.total > 0 ? (
          <div className="grid grid-cols-2 items-center">
            <Radar axes={errAxes} color="#fb7185" size={180} />
            <div className="text-sm">
              <div className="text-white/55">Dominujący błąd:</div>
              <div className="text-lg font-bold text-bad">{ep.label}</div>
            </div>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-white/40">Rozwiąż kilka zadań, aby zbudować profil.</p>
        )}
      </section>

      <Link to="/rodzic" className="btn-ghost mb-2 w-full">👪 Tryb rodzica (raport)</Link>
      <button
        onClick={() => {
          if (confirm('Zresetować cały postęp nauki? Tej operacji nie można cofnąć.')) reset();
        }}
        className="btn-ghost w-full text-bad"
      >
        Resetuj postęp
      </button>
      <p className="mt-3 text-center text-[10px] text-white/30">
        Otwarta baza wiedzy • wersja {dataVersion} • dane trzymane lokalnie w przeglądarce
      </p>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="card p-2 text-center">
      <div className="text-lg">{icon}</div>
      <div className="text-base font-extrabold">{value}</div>
      <div className="text-[9px] text-white/50">{label}</div>
    </div>
  );
}
