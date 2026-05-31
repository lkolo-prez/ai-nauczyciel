import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { examSubjects as subjects, questions as allQuestions, nodesBySubject, nodeById } from '../data';
import type { Question } from '../lib/types';

// Layers 9 & 24 — exam/worksheet generator. A teacher (or a student) assembles a
// test from chosen topics & difficulty in seconds, with an answer key, and prints
// it to PDF. Built entirely client-side from the open question bank.

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Generator() {
  const [subject, setSubject] = useState<string>('matematyka');
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [maxDiff, setMaxDiff] = useState(5);
  const [count, setCount] = useState(8);
  const [title, setTitle] = useState('Sprawdzian');
  const [generated, setGenerated] = useState<Question[] | null>(null);

  const nodes = useMemo(() => nodesBySubject(subject), [subject]);

  const pool = useMemo(() => {
    return allQuestions.filter((q) => {
      if (q.subject !== subject) return false;
      if (q.difficulty > maxDiff) return false;
      if (selectedNodes.size > 0 && !selectedNodes.has(q.nodeId)) return false;
      return true;
    });
  }, [subject, maxDiff, selectedNodes]);

  const toggleNode = (id: string) => {
    setSelectedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generate = () => {
    setGenerated(shuffle(pool).slice(0, Math.min(count, pool.length)));
  };

  const printWorksheet = () => {
    if (!generated) return;
    const sub = subjects.find((s) => s.id === subject)!;
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const items = generated
      .map((q, i) => {
        const opts = (q.options || [])
          .map((o, k) => `<li>${String.fromCharCode(65 + k)}. ${esc(o)}</li>`)
          .join('');
        return `<div class="q"><p class="stem"><b>${i + 1}.</b> ${esc(q.stem)} <span class="topic">[${esc(nodeById.get(q.nodeId)?.name || '')}, p.${q.difficulty}]</span></p><ol class="opts">${opts}</ol></div>`;
      })
      .join('');
    const key = generated
      .map(
        (q, i) =>
          `<span class="k">${i + 1}. ${String.fromCharCode(65 + (q.answerIndex ?? 0))}</span>`,
      )
      .join('');
    const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:32px;line-height:1.5}
  h1{font-size:20px;margin:0 0 4px} .meta{color:#555;font-size:13px;margin-bottom:6px}
  .fields{display:flex;justify-content:space-between;font-size:13px;border-bottom:1px solid #ccc;padding-bottom:8px;margin-bottom:16px}
  .q{margin:0 0 14px;break-inside:avoid} .stem{margin:0 0 4px} .topic{color:#888;font-size:11px;font-weight:normal}
  .opts{margin:2px 0 0 18px;padding:0} .opts li{list-style:none;margin:2px 0}
  .key{margin-top:28px;border-top:2px dashed #aaa;padding-top:10px}
  .key h2{font-size:14px;margin:0 0 6px} .k{display:inline-block;width:64px;font-size:13px}
  @media print{.noprint{display:none}}
</style></head><body>
  <h1>${esc(title)} — ${esc(sub.name)}</h1>
  <div class="meta">Egzamin ósmoklasisty • ${generated.length} zadań • wygenerowano w AI Nauczyciel (EduOS)</div>
  <div class="fields"><span>Imię i nazwisko: ........................................</span><span>Klasa: ........</span><span>Data: ............</span></div>
  ${items}
  <div class="key"><h2>Klucz odpowiedzi</h2>${key}</div>
  <button class="noprint" onclick="window.print()" style="margin-top:20px;padding:8px 16px">Drukuj / zapisz PDF</button>
</body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div className="p-4 pb-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold">🛠️ Generator sprawdzianów</h1>
          <p className="text-[11px] text-white/50">Dla nauczyciela i ucznia — test w kilka sekund, z kluczem i drukiem do PDF.</p>
        </div>
        <Link to="/" className="chip bg-white/5 text-white/60">‹ Dom</Link>
      </header>

      <div className="card mb-4 p-4">
        <label className="mb-1 block text-xs font-semibold text-white/60">Tytuł</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
        />

        <label className="mb-1 block text-xs font-semibold text-white/60">Przedmiot</label>
        <div className="mb-4 flex gap-2">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSubject(s.id);
                setSelectedNodes(new Set());
                setGenerated(null);
              }}
              className={`chip border ${subject === s.id ? 'border-brand bg-brand/20 text-white' : 'border-white/10 bg-white/5 text-white/60'}`}
            >
              {s.icon} {s.shortName}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-semibold text-white/60">
          Tematy {selectedNodes.size === 0 ? '(wszystkie)' : `(${selectedNodes.size})`}
        </label>
        <div className="mb-4 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto no-scrollbar">
          {nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => toggleNode(n.id)}
              className={`chip border text-[11px] ${selectedNodes.has(n.id) ? 'border-brand bg-brand/20 text-white' : 'border-white/10 bg-white/5 text-white/60'}`}
            >
              {n.name}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-semibold text-white/60">Maks. trudność</span>
            <span className="text-brand-400">{maxDiff}/5</span>
          </div>
          <input type="range" min={1} max={5} value={maxDiff} onChange={(e) => setMaxDiff(+e.target.value)} className="w-full accent-brand" />
        </div>

        <div className="mb-1">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-semibold text-white/60">Liczba zadań</span>
            <span className="text-brand-400">{Math.min(count, pool.length)} (dostępnych: {pool.length})</span>
          </div>
          <input type="range" min={1} max={Math.max(1, pool.length)} value={Math.min(count, Math.max(1, pool.length))} onChange={(e) => setCount(+e.target.value)} className="w-full accent-brand" />
        </div>
      </div>

      <button onClick={generate} disabled={pool.length === 0} className={`w-full ${pool.length === 0 ? 'btn-ghost opacity-50' : 'btn-brand'}`}>
        {pool.length === 0 ? 'Brak zadań dla tych ustawień' : 'Generuj sprawdzian ✨'}
      </button>

      {generated && generated.length > 0 && (
        <div className="card mt-4 p-4 animate-pop">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Podgląd ({generated.length})</h2>
            <button onClick={printWorksheet} className="chip bg-brand text-white">🖨️ Drukuj / PDF</button>
          </div>
          <ol className="space-y-3">
            {generated.map((q) => (
              <li key={q.id} className="rounded-lg bg-white/5 p-3 text-sm">
                <div className="mb-1 font-medium">{q.stem}</div>
                <div className="flex flex-wrap gap-1 text-[11px] text-white/50">
                  <span className="chip bg-white/5">{nodeById.get(q.nodeId)?.name}</span>
                  <span className="chip bg-white/5">poziom {q.difficulty}/5</span>
                  <span className="chip bg-good/15 text-good">odp. {String.fromCharCode(65 + (q.answerIndex ?? 0))}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
