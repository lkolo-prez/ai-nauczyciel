interface Series {
  points: { day: number; score: number }[];
  color: string;
  label: string;
}

export default function LineChart({
  series,
  height = 180,
}: {
  series: Series[];
  height?: number;
}) {
  const width = 320;
  const pad = 28;
  const maxDay = Math.max(...series.flatMap((s) => s.points.map((p) => p.day)), 1);
  const allScores = series.flatMap((s) => s.points.map((p) => p.score));
  const minY = Math.max(0, Math.min(...allScores) - 8);
  const maxY = Math.min(100, Math.max(...allScores) + 8);

  const x = (d: number) => pad + (d / maxDay) * (width - pad * 2);
  const y = (s: number) => height - pad - ((s - minY) / (maxY - minY || 1)) * (height - pad * 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const val = Math.round(minY + (maxY - minY) * t);
        const yy = y(val);
        return (
          <g key={t}>
            <line x1={pad} y1={yy} x2={width - pad} y2={yy} stroke="rgba(255,255,255,0.07)" />
            <text x={4} y={yy + 3} fontSize={8} fill="rgba(230,233,245,0.5)">
              {val}%
            </text>
          </g>
        );
      })}
      {series.map((s) => {
        const path = s.points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.day)} ${y(p.score)}`)
          .join(' ');
        const last = s.points[s.points.length - 1];
        return (
          <g key={s.label}>
            <path d={path} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" />
            <circle cx={x(last.day)} cy={y(last.score)} r={3.5} fill={s.color} />
            <text x={x(last.day) - 4} y={y(last.score) - 8} fontSize={9} fill={s.color} textAnchor="end">
              {last.score}%
            </text>
          </g>
        );
      })}
      <text x={pad} y={height - 6} fontSize={8} fill="rgba(230,233,245,0.5)">
        dziś
      </text>
      <text x={width - pad} y={height - 6} fontSize={8} fill="rgba(230,233,245,0.5)" textAnchor="end">
        za {maxDay} dni
      </text>
    </svg>
  );
}
