interface Axis {
  label: string;
  value: number; // 0..1
}

export default function Radar({
  axes,
  size = 240,
  color = '#7c5cff',
}: {
  axes: Axis[];
  size?: number;
  color?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 34;
  const n = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, v: number) => {
    const a = angle(i);
    return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v];
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const poly = axes.map((ax, i) => point(i, Math.max(0.04, ax.value)).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
      {rings.map((rr) => (
        <polygon
          key={rr}
          points={axes.map((_, i) => point(i, rr).join(',')).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" />;
      })}
      <polygon points={poly} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={2} />
      {axes.map((ax, i) => {
        const [x, y] = point(i, 1.18);
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize={10}
            fill="rgba(230,233,245,0.8)"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {ax.label}
          </text>
        );
      })}
      {axes.map((ax, i) => {
        const [x, y] = point(i, Math.max(0.04, ax.value));
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </svg>
  );
}
