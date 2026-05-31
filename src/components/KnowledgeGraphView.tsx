import { useMemo } from 'react';
import { nodesBySubject } from '../data';
import type { KnowledgeNode } from '../lib/types';

function masteryColor(m: number) {
  if (m >= 0.7) return '#34d399';
  if (m >= 0.45) return '#fbbf24';
  return '#fb7185';
}

export default function KnowledgeGraphView({
  subjectId,
  masteryOf,
  selectedId,
  onSelect,
}: {
  subjectId: string;
  masteryOf: (id: string) => number;
  selectedId?: string;
  onSelect: (n: KnowledgeNode) => void;
}) {
  const { nodes, positions, width, height } = useMemo(() => {
    const ns = nodesBySubject(subjectId);
    const tiers = new Map<number, KnowledgeNode[]>();
    for (const n of ns) {
      const arr = tiers.get(n.tier) || [];
      arr.push(n);
      tiers.set(n.tier, arr);
    }
    const tierKeys = [...tiers.keys()].sort((a, b) => a - b);
    const rowH = 96;
    const colW = 150;
    const maxCols = Math.max(...[...tiers.values()].map((a) => a.length));
    const width = Math.max(320, maxCols * colW);
    const height = tierKeys.length * rowH + 40;
    const positions = new Map<string, { x: number; y: number }>();
    tierKeys.forEach((tk, row) => {
      const arr = tiers.get(tk)!;
      arr.forEach((n, i) => {
        const x = (width / (arr.length + 1)) * (i + 1);
        const y = 36 + row * rowH;
        positions.set(n.id, { x, y });
      });
    });
    return { nodes: ns, positions, width, height };
  }, [subjectId]);

  return (
    <div className="overflow-x-auto no-scrollbar -mx-1">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="max-w-none">
        {/* edges */}
        {nodes.map((n) =>
          n.prereq.map((p) => {
            const a = positions.get(p);
            const b = positions.get(n.id);
            if (!a || !b) return null;
            return (
              <line
                key={`${p}-${n.id}`}
                x1={a.x}
                y1={a.y + 16}
                x2={b.x}
                y2={b.y - 16}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1.5}
              />
            );
          }),
        )}
        {/* nodes */}
        {nodes.map((n) => {
          const pos = positions.get(n.id)!;
          const m = masteryOf(n.id);
          const col = masteryColor(m);
          const selected = selectedId === n.id;
          return (
            <g
              key={n.id}
              transform={`translate(${pos.x},${pos.y})`}
              onClick={() => onSelect(n)}
              className="cursor-pointer"
            >
              <circle r={selected ? 22 : 18} fill={col} fillOpacity={selected ? 0.35 : 0.18} stroke={col} strokeWidth={selected ? 3 : 2} />
              <text textAnchor="middle" dy={4} fontSize={11} fontWeight={700} fill={col}>
                {Math.round(m * 100)}
              </text>
              <text textAnchor="middle" y={34} fontSize={9} fill="rgba(230,233,245,0.85)">
                {n.name.length > 18 ? n.name.slice(0, 17) + '…' : n.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
