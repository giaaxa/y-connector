import { LogoMark } from "@/components/brand/logo";

/**
 * Hero visual: a constellation of people orbiting the Y — echoing the logo's
 * orbital swoosh. Pure SVG/CSS, decorative.
 */
const nodes = [
  { x: 78, y: 92, label: "Founder", r: 7 },
  { x: 410, y: 70, label: "AI engineer", r: 6 },
  { x: 470, y: 260, label: "Designer", r: 7 },
  { x: 420, y: 430, label: "Mentor", r: 6 },
  { x: 120, y: 450, label: "Student", r: 7 },
  { x: 30, y: 280, label: "Marketer", r: 5 },
  { x: 260, y: 22, label: "Graduate", r: 5 },
  { x: 270, y: 500, label: "Fintech", r: 5 },
];
const edges: [number, number][] = [
  [0, 6], [6, 1], [1, 2], [2, 3], [3, 7], [7, 4], [4, 5], [5, 0], [0, 2], [1, 4], [6, 3], [5, 2],
];

export function Constellation() {
  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div className="absolute inset-0 rounded-full dot-grid [mask-image:radial-gradient(circle,black_40%,transparent_70%)]" />
      <svg viewBox="0 0 500 520" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="edge" x1="0" x2="1">
            <stop offset="0" stopColor="#111" stopOpacity="0.05" />
            <stop offset="0.5" stopColor="#111" stopOpacity="0.28" />
            <stop offset="1" stopColor="#111" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <g className="origin-center animate-orbit" style={{ transformBox: "fill-box" }}>
          <ellipse cx="250" cy="262" rx="225" ry="120" fill="none" stroke="#FFCC00" strokeWidth="2.5" transform="rotate(-24 250 262)" strokeDasharray="520 900" strokeLinecap="round" />
        </g>
        <ellipse cx="250" cy="262" rx="190" ry="205" fill="none" stroke="#111" strokeOpacity="0.07" />
        <ellipse cx="250" cy="262" rx="120" ry="128" fill="none" stroke="#111" strokeOpacity="0.07" strokeDasharray="3 6" />
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="url(#edge)" strokeWidth="1.2" />
        ))}
        {nodes.map((n, i) => (
          <line key={`c${i}`} x1={n.x} y1={n.y} x2={250} y2={262} stroke="#111" strokeOpacity="0.06" strokeDasharray="2 5" />
        ))}
        {nodes.map((n, i) => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r={n.r + 8} fill="#FFCC00" opacity="0.25" className="animate-pulse-dot" style={{ animationDelay: `${i * 0.4}s` }} />
            <circle cx={n.x} cy={n.y} r={n.r} fill={i % 3 === 0 ? "#FFCC00" : "#111"} stroke="#fff" strokeWidth="2.5" />
          </g>
        ))}
      </svg>
      {nodes.map((n, i) => (
        <span
          key={n.label}
          className="absolute -translate-x-1/2 translate-y-3 rounded-full border border-line bg-white/90 px-2.5 py-1 font-mono text-[10px] tracking-wider whitespace-nowrap text-ink-soft uppercase shadow-sm animate-rise"
          style={{ left: `${(n.x / 500) * 100}%`, top: `${(n.y / 520) * 100}%`, animationDelay: `${300 + i * 90}ms` }}
        >
          {n.label}
        </span>
      ))}
      <div className="absolute top-1/2 left-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_20px_60px_-20px_rgb(0_0_0/0.35)] ring-1 ring-line sm:h-44 sm:w-44">
        <LogoMark className="w-28 sm:w-32" title="" />
      </div>
    </div>
  );
}
