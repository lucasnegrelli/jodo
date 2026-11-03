// Bichos da mata do Vicente Blow, desenhados em SVG (silhuetas estilizadas). Cores e animações ficam no CSS module.
export function Arara({ s }) {
  return (
    <svg className={s.araraSvg} viewBox="-6 -22 150 96" aria-hidden="true">
      <path d="M52 34 L-4 58 L3 47 L-6 42 L8 38 L52 31 Z" fill="#c8261b" />
      <path d="M52 36 L0 54 L12 44 L52 34 Z" fill="#1f4fd3" />
      <g className={s.asaFundo} style={{ transformOrigin: "70px 30px" }}>
        <path d="M70 30 Q50 -8 92 -18 Q88 10 80 30 Z" fill="#163a9c" />
      </g>
      <ellipse cx="74" cy="35" rx="26" ry="11" fill="#d02a1c" />
      <circle cx="102" cy="30" r="9" fill="#d93522" />
      <path d="M108 25 Q127 22 124 38 Q120 32 112 34 Z" fill="#e9dfc9" />
      <circle cx="104" cy="28" r="2.2" fill="#fff" />
      <circle cx="104.6" cy="28" r="1.1" fill="#111" />
      <g className={s.asa} style={{ transformOrigin: "74px 30px" }}>
        <path d="M74 30 Q52 -12 98 -22 Q92 10 82 30 Z" fill="#1e50d4" />
        <path d="M74 30 Q62 2 88 -10 Q84 12 80 30 Z" fill="#f2c230" opacity="0.9" />
      </g>
    </svg>
  );
}

export function Onca({ s }) {
  return (
    <svg className={s.onca} viewBox="0 0 140 44" aria-hidden="true">
      <defs>
        <radialGradient id="olhoOnca" cx="50%" cy="50%" r="55%">
          <stop offset="0" stopColor="#f6ff6a" />
          <stop offset="0.7" stopColor="#c9d92a" />
          <stop offset="1" stopColor="#6f8f0a" />
        </radialGradient>
      </defs>
      {[[34, 22], [106, 22]].map(([x, y], k) => (
        <g key={k} className={s.olho} style={{ transformOrigin: `${x}px ${y}px` }}>
          <path d={`M${x - 24} ${y} Q${x} ${y - 17} ${x + 24} ${y} Q${x} ${y + 15} ${x - 24} ${y} Z`} fill="url(#olhoOnca)" />
          <ellipse cx={x} cy={y} rx="3.4" ry="11" fill="#050805" />
        </g>
      ))}
    </svg>
  );
}

export function Tucano({ s }) {
  return (
    <svg className={s.tucano} viewBox="0 0 150 100" aria-hidden="true">
      <defs>
        <linearGradient id="bicoTuc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f2a516" />
          <stop offset="0.55" stopColor="#f26b16" />
          <stop offset="1" stopColor="#d5301b" />
        </linearGradient>
      </defs>
      <path d="M-4 86 Q70 80 154 90" stroke="#06140e" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M38 60 L12 92 L30 84 L46 72 Z" fill="#050a07" />
      <ellipse cx="62" cy="52" rx="24" ry="30" transform="rotate(-8 62 52)" fill="#070d09" />
      <ellipse cx="74" cy="42" rx="11" ry="12" fill="#f4d54a" />
      <circle cx="78" cy="22" r="13" fill="#070d09" />
      <path d="M84 16 Q124 12 140 34 Q112 30 86 34 Z" fill="url(#bicoTuc)" />
      <path d="M128 22 Q140 28 140 34 Q132 32 126 28 Z" fill="#150808" />
      <circle cx="82" cy="19" r="3.4" fill="#37a6d6" />
      <circle cx="82.6" cy="19" r="1.4" fill="#000" />
    </svg>
  );
}

export function Boto({ s }) {
  return (
    <svg className={s.boto} viewBox="-6 -10 230 100" aria-hidden="true">
      <defs>
        <linearGradient id="peleBoto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4a8c0" />
          <stop offset="1" stopColor="#c8738f" />
        </linearGradient>
      </defs>
      <path d="M22 62 C52 8 122 -2 172 26 L214 30 L174 42 C132 54 72 92 22 62 Z" fill="url(#peleBoto)" />
      <path d="M96 12 L114 -8 L120 14 Z" fill="#c8738f" />
      <path d="M22 62 L2 46 L14 66 L0 82 L28 68 Z" fill="#c8738f" />
      <circle cx="176" cy="30" r="2.2" fill="#2a0f18" />
    </svg>
  );
}

export function Vagalumes({ s, n = 26 }) {
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const a = (k * 2654435761) % 1000 / 1000;
        const b = (k * 40503 + 7) % 1000 / 1000;
        const c = (k * 69069 + 3) % 1000 / 1000;
        return (
          <i
            key={k}
            className={s.vaga}
            style={{ left: `${(a * 100).toFixed(1)}%`, top: `${(30 + b * 62).toFixed(1)}%`, animationDelay: `${(-c * 9).toFixed(2)}s`, animationDuration: `${(6 + b * 7).toFixed(1)}s`, "--dx": `${((c - 0.5) * 120).toFixed(0)}px`, "--dy": `${((a - 0.5) * 90).toFixed(0)}px` }}
          />
        );
      })}
    </>
  );
}
