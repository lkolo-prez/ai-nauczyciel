import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, CLASSES } from '../lib/store';
import { examSubjects as subjects } from '../data';
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
import { useT } from '../lib/useT';
import Radar from '../components/charts/Radar';
import Ring from '../components/Ring';
import QuestsPanel from '../components/QuestsPanel';
import GoalCard from '../components/GoalCard';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Onboarding() {
  const setProfile = useStore((s) => s.setProfile);
  const { t } = useT();
  const [name, setName] = useState('');
  const [cls, setCls] = useState('strateg');
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-5 backdrop-blur">
      <div className="card w-full max-w-sm p-6 animate-pop">
        <div className="mb-3 flex justify-end"><LanguageSwitcher /></div>
        <div className="mb-1 text-2xl font-extrabold">{t('onb.hi')}</div>
        <p className="mb-4 text-sm text-white/70">{t('onb.intro')}</p>
        <label className="mb-1 block text-xs font-semibold text-white/60">{t('onb.name')}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('onb.namePlaceholder')}
          className="mb-4 w-full rounded-xl bg-white/5 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
        />
        <div className="mb-2 text-xs font-semibold text-white/60">{t('onb.pickClass')}</div>
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
          {t('onb.start')}
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
  const { t } = useT();

  return (
    <div className="p-4 pb-6">
      {!s.name && <Onboarding />}

      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/50">{t('home.examTitle')}</div>
          <h1 className="text-xl font-extrabold">{t('home.greeting', { name: s.name || 'Uczniu' })}</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <span className="chip bg-accent/15 text-accent">💎 {s.coins}</span>
          <Link to="/profil" className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
            <span className="text-lg">{CLASSES.find((c) => c.id === s.classId)?.emoji ?? '🎓'}</span>
            <div className="text-right leading-tight">
              <div className="text-[10px] text-white/50">{t('common.level').slice(0, 3)}. {lvl.level} {league.emoji}</div>
              <div className="text-xs font-semibold">🔥 {str}</div>
            </div>
          </Link>
        </div>
      </header>

      {boostActive && (
        <div className="mb-3 rounded-xl border border-warn/40 bg-warn/10 p-2 text-center text-xs font-semibold text-warn">
          {t('home.boostActive')}
        </div>
      )}

      {burn.risk !== 'ok' && (
        <div
          className={`mb-4 rounded-xl border p-3 text-sm ${
            burn.risk === 'wysokie' ? 'border-bad/40 bg-bad/10 text-bad' : 'border-warn/40 bg-warn/10 text-warn'
          }`}
        >
          <div className="font-semibold">
            {burn.risk === 'wysokie' ? t('burnout.high') : t('burnout.warn')}
          </div>
          <div className="text-xs opacity-80">{burn.reasons[0]}. {t('burnout.advice')}</div>
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
            <div className="font-bold text-accent">{t('home.reviewsDue', { n: due })}</div>
            <div className="text-xs text-white/60">{t('home.reviewsDesc')}</div>
          </div>
          <span className="btn-brand text-sm">{t('home.review')}</span>
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
          <div className="font-bold">{t('home.bossTitle')}</div>
          <div className="text-xs text-white/60">{t('home.bossDesc')}</div>
        </div>
        <span className="text-white/40">›</span>
      </Link>

      <section className="card mb-4 p-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-bold">{t('home.twin')}</h2>
          <span className="chip bg-white/5 text-white/60">{t('home.analyses', { n: ep.total })}</span>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <Radar axes={radarAxes} />
          <div className="space-y-2">
            {subjects.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <Ring value={estimatedScore(s, sub.id) / 100} size={44} stroke={5} color={sub.color} />
                <div className="leading-tight">
                  <div className="text-sm font-semibold">{t(`subjects.${sub.id}`)}</div>
                  <div className="text-[10px] text-white/50">{t('home.scoreForecast')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70">
          {t('home.dominantError')} <span className="font-semibold text-white">{ep.label}</span>
        </div>
      </section>

      <section className="card mb-4 p-4">
        <h2 className="mb-2 font-bold">{t('home.planToday')}</h2>
        <p className="mb-3 text-xs text-white/55">{t('home.planDesc')}</p>
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
                    {t(`subjects.${sub.id}`)} • {t('home.mastery')} {Math.round(g.mastery * 100)}%
                    {g.unlocks > 0 && ` • ${t('home.unlocks', { n: g.unlocks })}`}
                  </div>
                </div>
                <span className="text-white/40">›</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Tile to="/feed" icon="⚡" title={t('tiles.feed')} sub={t('tiles.feedSub')} />
        <Tile to="/przedmioty" icon="📂" title={t('tiles.subjects')} sub={t('tiles.subjectsSub')} />
        <Tile to="/symulator" icon="📈" title={t('tiles.simulator')} sub={t('tiles.simulatorSub')} />
        <Tile to="/mapa" icon="🗺️" title={t('tiles.map')} sub={t('tiles.mapSub')} />
        <Tile to="/tutor" icon="🤖" title={t('tiles.ai')} sub={t('tiles.aiSub')} />
        <Tile to="/generator" icon="🛠️" title={t('tiles.generator')} sub={t('tiles.generatorSub')} />
        <Tile to="/rodzic" icon="👪" title={t('tiles.parent')} sub={t('tiles.parentSub')} />
        <Tile to="/trendy" icon="📊" title={t('tiles.trends')} sub={t('tiles.trendsSub')} />
        <Tile to="/nauczyciel" icon="🧑‍🏫" title={t('tiles.teacher')} sub={t('tiles.teacherSub')} />
        <Tile to="/kariera" icon="🧭" title={t('tiles.career')} sub={t('tiles.careerSub')} />
      </section>
    </div>
  );
}

function Tile({ to, icon, title, sub }: { to: string; icon: string; title: string; sub: string }) {
  return (
    <Link to={to} className="card flex flex-col gap-1 p-4 transition hover:bg-card">
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold">{title}</span>
      <span className="text-[11px] text-white/50">{sub}</span>
    </Link>
  );
}
