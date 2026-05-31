import { useState } from 'react';
import { useStore } from '../lib/store';
import Ring from './Ring';

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(iso + 'T00:00:00').getTime() - today.getTime()) / 86400000);
}

export default function GoalCard() {
  const examDate = useStore((s) => s.examDate);
  const dailyGoalXp = useStore((s) => s.dailyGoalXp);
  const setGoal = useStore((s) => s.setGoal);
  const todayXp = useStore((s) => s.todayXp)();
  const [editing, setEditing] = useState(false);

  const goalPct = Math.min(1, todayXp / dailyGoalXp);
  const left = examDate ? daysUntil(examDate) : null;

  return (
    <section className="card mb-4 p-4">
      <div className="flex items-center gap-4">
        <Ring value={goalPct} size={72} color={goalPct >= 1 ? '#34d399' : '#7c5cff'} label={`${todayXp}`} />
        <div className="flex-1">
          <div className="text-sm font-bold">Cel dnia: {dailyGoalXp} XP</div>
          {goalPct >= 1 ? (
            <div className="text-xs font-semibold text-good">✅ Cel osiągnięty! Tak trzymaj 🔥</div>
          ) : (
            <div className="text-xs text-white/55">Jeszcze {Math.max(0, dailyGoalXp - todayXp)} XP do celu</div>
          )}
          {left !== null ? (
            <button onClick={() => setEditing((v) => !v)} className="mt-1 text-xs text-brand-400">
              ⏳ {left > 0 ? `${left} dni do egzaminu` : 'Dziś egzamin! Powodzenia 🍀'} • zmień
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="mt-1 text-xs text-brand-400">
              🎯 Ustaw datę egzaminu →
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          <label className="block text-xs text-white/60">Data egzaminu</label>
          <input
            type="date"
            defaultValue={examDate ?? ''}
            onChange={(e) => setGoal(e.target.value || null, dailyGoalXp)}
            className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
          <label className="block text-xs text-white/60">Dzienny cel XP: {dailyGoalXp}</label>
          <input
            type="range"
            min={20}
            max={200}
            step={10}
            value={dailyGoalXp}
            onChange={(e) => setGoal(examDate, +e.target.value)}
            className="w-full accent-brand"
          />
          <button onClick={() => setEditing(false)} className="btn-ghost w-full text-sm">
            Gotowe
          </button>
        </div>
      )}
    </section>
  );
}
