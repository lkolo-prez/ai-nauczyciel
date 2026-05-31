import { Link } from 'react-router-dom';
import { areas, subjects, nodesBySubject, questionsByNode } from '../data';

// Layer 2 (full curriculum) — browse every subject of the IV–VIII core
// curriculum, grouped by area, with how much of its knowledge graph exists.
// Exam subjects are flagged; tapping a subject opens its knowledge map.
export default function Subjects() {
  const subjectStats = (id: string) => {
    const ns = nodesBySubject(id);
    const q = ns.reduce((a, n) => a + questionsByNode(n.id).length, 0);
    return { nodes: ns.length, questions: q };
  };

  return (
    <div className="p-4 pb-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold">📂 Przedmioty</h1>
          <p className="text-[11px] text-white/50">Cała podstawa programowa klas IV–VIII.</p>
        </div>
        <Link to="/" className="chip bg-white/5 text-white/60">‹ Dom</Link>
      </header>

      <div className="mb-4 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-[11px] text-brand-400">
        ⭐ Przedmioty oznaczone gwiazdką to egzamin ósmoklasisty — dla nich działa cyfrowy bliźniak i symulator.
      </div>

      {areas.map((area) => {
        const list = subjects.filter((s) => s.area === area.id);
        if (!list.length) return null;
        return (
          <section key={area.id} className="mb-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: area.color }} />
              {area.name}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {list.map((sub) => {
                const st = subjectStats(sub.id);
                return (
                  <Link
                    key={sub.id}
                    to="/mapa"
                    state={{ subject: sub.id }}
                    className="card p-3 transition hover:bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{sub.icon}</span>
                      {sub.exam && <span className="text-warn" title="Egzamin ósmoklasisty">⭐</span>}
                    </div>
                    <div className="mt-1 text-sm font-semibold leading-tight">{sub.name}</div>
                    <div className="text-[10px] text-white/45">{sub.grades}</div>
                    <div className="mt-1 flex gap-1 text-[9px] text-white/50">
                      <span className="chip bg-white/5 px-1.5 py-0.5">{st.nodes} tematów</span>
                      {st.questions > 0 && <span className="chip bg-white/5 px-1.5 py-0.5">{st.questions} zadań</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="text-center text-[10px] text-white/35">
        Baza jest otwarta (CC BY-SA) i rośnie — przedmioty nieegzaminacyjne mają już mapę wiedzy, a zadania dochodzą z każdym wkładem.
      </p>
    </div>
  );
}
