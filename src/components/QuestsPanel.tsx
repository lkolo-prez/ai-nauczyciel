import { useState } from 'react';
import { useStore } from '../lib/store';

export default function QuestsPanel() {
  const quests = useStore((s) => s.todaysQuests)();
  const counters = useStore((s) => s.quest.counters);
  const claimed = useStore((s) => s.quest.claimed);
  const claim = useStore((s) => s.claimQuest);
  const [pop, setPop] = useState<string | null>(null);

  return (
    <section className="card mb-4 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-bold">📜 Wyzwania dnia</h2>
        <span className="chip bg-white/5 text-white/60">
          {claimed.length}/{quests.length} odebrane
        </span>
      </div>
      <div className="space-y-2">
        {quests.map((quest) => {
          const have = counters[quest.metric];
          const pct = Math.min(1, have / quest.target);
          const done = have >= quest.target;
          const isClaimed = claimed.includes(quest.id);
          return (
            <div key={quest.id} className="rounded-xl bg-white/5 p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-lg">{quest.icon}</span>
                <span className="flex-1 text-sm font-medium">{quest.label}</span>
                {isClaimed ? (
                  <span className="chip bg-good/15 text-good">✓ odebrano</span>
                ) : done ? (
                  <button
                    onClick={() => {
                      if (claim(quest)) {
                        setPop(quest.id);
                        setTimeout(() => setPop(null), 900);
                      }
                    }}
                    className="chip bg-brand text-white shadow-glow animate-pop"
                  >
                    Odbierz +{quest.rewardCoins}💎
                  </button>
                ) : (
                  <span className="chip bg-white/5 text-white/50">
                    {Math.min(have, quest.target)}/{quest.target}
                  </span>
                )}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${done ? 'bg-good' : 'bg-gradient-to-r from-brand to-accent'}`}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
              {pop === quest.id && (
                <div className="mt-1 text-center text-xs font-bold text-good animate-pop">
                  +{quest.rewardCoins}💎 {quest.rewardXp ? `+${quest.rewardXp} XP` : ''} 🎉
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
