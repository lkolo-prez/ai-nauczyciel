import { Link } from 'react-router-dom';
import { useStore, CLASSES, ACHIEVEMENTS } from '../lib/store';
import { levelInfo, streak, errorProfile, ERROR_TYPES } from '../lib/cognitive';
import { errorTypeLabels, dataVersion } from '../data';
import Ring from '../components/Ring';
import Radar from '../components/charts/Radar';

// Mock leaderboard to illustrate the school/city ranking concept.
const SCHOOL_RANK = [
  { name: 'Zofia K.', xp: 4120 },
  { name: 'Antoni W.', xp: 3380 },
  { name: 'Maja L.', xp: 2910 },
];

export default function Profile() {
  const s = useStore();
  const reset = useStore((st) => st.reset);
  const lvl = levelInfo(s.xp);
  const cls = CLASSES.find((c) => c.id === s.classId);
  const unlocked = ACHIEVEMENTS.filter((a) => a.test(s));
  const ep = errorProfile(s);

  const board = [...SCHOOL_RANK, { name: (s.name || 'Ty') + ' (Ty)', xp: s.xp }].sort(
    (a, b) => b.xp - a.xp,
  );

  const errAxes = ERROR_TYPES.map((t) => ({
    label: errorTypeLabels[t].split(' ')[0],
    value: ep.total ? (ep.counts[t] || 0) / ep.total : 0,
  }));

  return (
    <div className="p-4 pb-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-extrabold">Profil</h1>
        <Link to="/" className="chip bg-white/5 text-white/60">‹ Dom</Link>
      </header>

      {/* Hero */}
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

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat icon="⚡" value={s.xp} label="XP" />
        <Stat icon="🔥" value={streak(s)} label="dni z rzędu" />
        <Stat icon="🎯" value={s.attempts.filter((a) => a.correct).length} label="trafień" />
      </div>

      {/* XP progress */}
      <div className="card mb-4 p-4">
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-semibold">Poziom {lvl.level} → {lvl.level + 1}</span>
          <span className="text-white/50">{lvl.xpInLevel}/{lvl.xpForLevel} XP</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${lvl.progress * 100}%` }} />
        </div>
      </div>

      {/* Achievements */}
      <section className="card mb-4 p-4">
        <h2 className="mb-3 font-bold">🏅 Osiągnięcia ({unlocked.length}/{ACHIEVEMENTS.length})</h2>
        <div className="grid grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.includes(a);
            return (
              <div
                key={a.id}
                className={`rounded-xl p-2 text-center ${got ? 'bg-brand/15' : 'bg-white/5 opacity-40 grayscale'}`}
                title={a.desc}
              >
                <div className="text-2xl">{a.emoji}</div>
                <div className="mt-1 text-[10px] font-semibold leading-tight">{a.name}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Error profile */}
      <section className="card mb-4 p-4">
        <h2 className="mb-1 font-bold">🧠 Profil błędów</h2>
        <p className="mb-2 text-[11px] text-white/50">
          Na czym najczęściej tracisz punkty. Wiedza ważniejsza niż sam wynik %.
        </p>
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

      {/* Ranking */}
      <section className="card mb-4 p-4">
        <h2 className="mb-3 font-bold">🏆 Ranking szkoły</h2>
        <div className="space-y-2">
          {board.map((b, i) => {
            const me = b.name.includes('(Ty)');
            return (
              <div
                key={b.name}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${me ? 'bg-brand/15' : 'bg-white/5'}`}
              >
                <span className="w-5 font-bold text-white/50">{i + 1}</span>
                <span className="flex-1 font-medium">{b.name}</span>
                <span className="text-white/60">{b.xp} XP</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[10px] text-white/35">Rankingi szkoły i miasta — wkrótce na żywo.</p>
      </section>

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
    <div className="card p-3 text-center">
      <div className="text-xl">{icon}</div>
      <div className="text-lg font-extrabold">{value}</div>
      <div className="text-[10px] text-white/50">{label}</div>
    </div>
  );
}
