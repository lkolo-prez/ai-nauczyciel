import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { subjects, nodeById, dependentsOf, lessonsBySubject } from '../data';
import { useStore } from '../lib/store';
import { effectiveMastery } from '../lib/cognitive';
import KnowledgeGraphView from '../components/KnowledgeGraphView';
import type { KnowledgeNode } from '../lib/types';

export default function KnowledgeMap() {
  const loc = useLocation();
  const initialSubject = (loc.state as { subject?: string } | null)?.subject ?? subjects[0].id;
  const s = useStore();
  const [subject, setSubject] = useState(initialSubject);
  const [selected, setSelected] = useState<KnowledgeNode | null>(null);

  const mastery = (id: string) => effectiveMastery(s, id);

  return (
    <div className="p-4">
      <header className="mb-3">
        <h1 className="text-lg font-extrabold">🗺️ Mapa wiedzy</h1>
        <p className="text-[11px] text-white/50">
          Graf zależności umiejętności. Strzałka A→B: „żeby ogarnąć B, najpierw A".
        </p>
      </header>

      <div className="mb-3 flex gap-2">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => {
              setSubject(sub.id);
              setSelected(null);
            }}
            className={`chip border ${
              subject === sub.id ? 'border-brand bg-brand/20 text-white' : 'border-white/10 bg-white/5 text-white/60'
            }`}
          >
            {sub.icon} {sub.shortName}
          </button>
        ))}
      </div>

      <div className="card p-3">
        <KnowledgeGraphView
          subjectId={subject}
          masteryOf={mastery}
          selectedId={selected?.id}
          onSelect={setSelected}
        />
        <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-white/50">
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-good inline-block" /> opanowane</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-warn inline-block" /> w toku</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-bad inline-block" /> luka</span>
        </div>
      </div>

      {selected ? (
        <div className="card mt-4 p-4 animate-pop">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-bold">{selected.name}</h2>
            <span className="chip bg-white/5 text-white/60">{Math.round(mastery(selected.id) * 100)}%</span>
          </div>
          <p className="mb-3 text-sm text-white/75">{selected.summary}</p>

          {selected.prereq.length > 0 && (
            <div className="mb-2 text-xs">
              <span className="text-white/50">Wymaga wcześniej: </span>
              {selected.prereq.map((p) => (
                <span key={p} className="chip mr-1 bg-white/5 text-white/70">
                  {nodeById.get(p)?.name}
                </span>
              ))}
            </div>
          )}
          {dependentsOf(selected.id).length > 0 && (
            <div className="mb-3 text-xs">
              <span className="text-white/50">Odblokowuje: </span>
              {dependentsOf(selected.id).map((d) => (
                <span key={d.id} className="chip mr-1 bg-brand/15 text-brand-400">
                  {d.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Link to="/cwicz" state={{ nodeId: selected.id }} className="btn-brand flex-1 text-sm">
              Ćwicz ten temat 🎯
            </Link>
            {lessonsBySubject(subject).some((l) => l.nodeId === selected.id) && (
              <Link to="/feed" className="btn-ghost text-sm">Mikrolekcja</Link>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-center text-xs text-white/40">Dotknij węzła, aby zobaczyć szczegóły i ćwiczyć.</p>
      )}
    </div>
  );
}
