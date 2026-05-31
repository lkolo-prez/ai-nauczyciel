import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { lessons, subjectById, nodeById } from '../data';
import { useStore } from '../lib/store';

export default function Feed() {
  const markLesson = useStore((s) => s.markLesson);
  const seen = useStore((s) => s.seenLessons);
  const [toast, setToast] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mark a lesson as "watched" (+XP) when it scrolls into view.
  useEffect(() => {
    const els = containerRef.current?.querySelectorAll<HTMLElement>('[data-lesson]');
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.7) {
            const id = e.target.getAttribute('data-lesson')!;
            const subject = e.target.getAttribute('data-subject')!;
            const xp = markLesson(id, subject);
            if (xp > 0) {
              setToast(`+${xp} XP`);
              setTimeout(() => setToast(null), 1200);
            }
          }
        }
      },
      { threshold: [0.7] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [markLesson]);

  return (
    <div className="relative h-full">
      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white shadow-glow animate-pop">
          {toast}
        </div>
      )}
      <div
        ref={containerRef}
        className="no-scrollbar snap-y-mandatory h-[calc(100vh-3.5rem)] overflow-y-scroll sm:h-[calc(100vh-7rem)]"
      >
        {lessons.map((l) => {
          const sub = subjectById.get(l.subject)!;
          const node = nodeById.get(l.nodeId);
          const isSeen = seen.includes(l.id);
          return (
            <section
              key={l.id}
              data-lesson={l.id}
              data-subject={l.subject}
              className="snap-start flex h-full min-h-[calc(100vh-3.5rem)] flex-col justify-between p-5 sm:min-h-[calc(100vh-7rem)]"
              style={{
                background: `radial-gradient(120% 60% at 50% 0%, ${sub.color}22 0%, transparent 60%)`,
              }}
            >
              <div className="flex items-center justify-between pt-2">
                <span className="chip" style={{ background: `${sub.color}22`, color: sub.color }}>
                  {sub.icon} {sub.name}
                </span>
                <span className="chip bg-white/5 text-white/60">{l.durationSec}s {isSeen && '✓'}</span>
              </div>

              <div className="flex-1 grid place-content-center">
                <div className="animate-floaty mb-4 text-center text-5xl">{sub.icon}</div>
                <h2 className="mb-4 text-center text-2xl font-extrabold leading-tight">{l.hook}</h2>
                <p className="mx-auto max-w-xs text-center text-[15px] leading-relaxed text-white/85">
                  {l.body}
                </p>
              </div>

              <div className="space-y-3 pb-2">
                <div
                  className="rounded-xl border-l-4 bg-white/5 px-3 py-2 text-sm"
                  style={{ borderColor: sub.color }}
                >
                  💡 <span className="font-semibold">{l.takeaway}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/cwicz"
                    state={{ nodeId: l.nodeId }}
                    className="btn-brand flex-1 text-sm"
                  >
                    Sprawdź się 🎯
                  </Link>
                  {node && (
                    <Link to="/mapa" state={{ subject: sub.id }} className="btn-ghost text-sm">
                      Na mapie 🗺️
                    </Link>
                  )}
                </div>
                <div className="text-center text-[11px] text-white/40">przesuń w górę ↑</div>
              </div>
            </section>
          );
        })}
        <section className="snap-start grid h-full min-h-[calc(100vh-3.5rem)] place-content-center p-8 text-center sm:min-h-[calc(100vh-7rem)]">
          <div className="text-4xl">🎉</div>
          <p className="mt-3 text-lg font-bold">To wszystko na teraz!</p>
          <p className="mt-1 text-sm text-white/60">Wróć jutro po nowe mikrolekcje albo poćwicz.</p>
          <Link to="/cwicz" className="btn-brand mx-auto mt-4">
            Przejdź do ćwiczeń
          </Link>
        </section>
      </div>
    </div>
  );
}
