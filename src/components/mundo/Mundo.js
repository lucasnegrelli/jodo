"use client";
import { urlArtista } from "@/data/urlArtista";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/styles/mundo.module.css";

/*
  MUNDO: a Montanha da JODO como cena navegável (referência de UX: salas clicáveis em tela cheia).
  - A cena tem proporção fixa 16:9 e "cobre" a janela (como object-fit: cover): responsivo perfeito.
  - Pontos (hotspots) ficam ancorados em coordenadas da cena, então acompanham o desenho em qualquer tela.
  - Desktop: parallax pelo mouse. Celular/retrato: arrastar para os lados.
  Tudo desenhado em código (SVG), sem imagens externas.
*/

const W = 1600;
const H = 900;

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cume(seed, base, amp, passo) {
  const r = mulberry32(seed);
  let d = `M0,${H} L0,${base}`;
  let y = base;
  for (let x = 0; x <= W + passo; x += passo) {
    y = base + (r() - 0.5) * amp * 2;
    d += ` L${x},${y.toFixed(1)}`;
  }
  return d + ` L${W},${H} Z`;
}

// silhueta da montanha central (coordenadas na cena 1600x900)
const PONTOS = [
  [0, 900], [180, 800], [330, 690], [450, 600], [540, 515], [620, 420],
  [700, 318], [760, 232], [800, 168], [846, 226], [920, 312], [1000, 398],
  [1090, 480], [1190, 566], [1310, 660], [1450, 748], [1600, 820], [1600, 900],
];

function silhueta() {
  return PONTOS.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ") + " Z";
}

function contorno(i) {
  const dy = i * 30;
  return (
    PONTOS.slice(1, -1)
      .map((p, k) => `${k ? "L" : "M"}${p[0]},${p[1] + dy}`)
      .join(" ")
  );
}

export default function Mundo({ artistas, links }) {
  const router = useRouter();
  const cenaRef = useRef(null);
  const camadasRef = useRef([]);
  const alvo = useRef({ x: 0, y: 0, pan: 0 });
  const atual = useRef({ x: 0, y: 0, pan: 0 });
  const arraste = useRef({ ativo: false, inicio: 0, panInicio: 0 });
  const [menu, setMenu] = useState(false);
  const [saida, setSaida] = useState(null);
  const [pronto, setPronto] = useState(false);

  const estrelas = useMemo(() => {
    const r = mulberry32(82);
    return Array.from({ length: 90 }, () => ({
      x: r() * W,
      y: r() * 470,
      r: 0.5 + r() * 1.6,
      o: 0.25 + r() * 0.75,
    }));
  }, []);

  const cumes = useMemo(
    () => [
      { d: cume(11, 560, 34, 40), cor: "#2b1445", prof: 0.15 },
      { d: cume(23, 640, 40, 34), cor: "#1d0d33", prof: 0.3 },
      { d: cume(37, 740, 36, 30), cor: "#120722", prof: 0.55 },
    ],
    []
  );

  useEffect(() => {
    setPronto(true);
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;

    const limite = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const larg = Math.max(vw, (vh * 16) / 9);
      return Math.max(0, (larg - vw) / 2);
    };

    const onMove = (e) => {
      if (e.pointerType === "mouse" && !arraste.current.ativo) {
        alvo.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        alvo.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      }
      if (arraste.current.ativo) {
        const lim = limite();
        const dx = e.clientX - arraste.current.inicio;
        alvo.current.pan = Math.max(-lim, Math.min(lim, arraste.current.panInicio + dx));
      }
    };
    const onDown = (e) => {
      if (e.target.closest("a,button")) return;
      arraste.current = { ativo: true, inicio: e.clientX, panInicio: alvo.current.pan };
    };
    const onUp = () => {
      arraste.current.ativo = false;
    };

    const loop = () => {
      const a = atual.current;
      const t = alvo.current;
      const k = reduz ? 1 : 0.07;
      a.x += (t.x - a.x) * k;
      a.y += (t.y - a.y) * k;
      a.pan += (t.pan - a.pan) * k;

      if (cenaRef.current) {
        cenaRef.current.style.transform = `translate3d(calc(-50% + ${a.pan.toFixed(1)}px), -50%, 0)`;
      }
      camadasRef.current.forEach((el) => {
        if (!el) return;
        const prof = parseFloat(el.dataset.prof || "0");
        const tx = -a.x * prof * 38;
        const ty = -a.y * prof * 18;
        el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const reg = (i) => (el) => {
    camadasRef.current[i] = el;
  };

  const entrar = (e, a) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    setSaida({ x: r.left + r.width / 2, y: r.top + r.height / 2, cor: a.cor });
    setTimeout(() => router.push(urlArtista(a.slug)), 650);
  };

  return (
    <div className={`${styles.palco} ${pronto ? styles.pronto : ""}`}>
      <div className={styles.cena} ref={cenaRef}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#07030f" />
              <stop offset="0.45" stopColor="#35184f" />
              <stop offset="0.78" stopColor="#c04a96" />
              <stop offset="1" stopColor="#d7692c" />
            </linearGradient>
            <radialGradient id="brilho" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#7fcf6a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#7fcf6a" stopOpacity="0" />
            </radialGradient>
            <filter id="grao" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.16" />
              </feComponentTransfer>
            </filter>
            <clipPath id="recorte">
              <path d={silhueta()} />
            </clipPath>
          </defs>

          <rect width={W} height={H} fill="url(#ceu)" />

          <g ref={reg(0)} data-prof="0.08">
            {estrelas.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} className={styles.estrela} style={{ animationDelay: `${(i % 9) * 0.4}s` }} />
            ))}
          </g>

          <g ref={reg(1)} data-prof="0.12">
            <circle cx="800" cy="330" r="330" fill="url(#brilho)" />
            <circle cx="800" cy="330" r="150" fill="#7fcf6a" />
          </g>

          {cumes.map((c, i) => (
            <g key={i} ref={reg(2 + i)} data-prof={c.prof}>
              <path d={c.d} fill={c.cor} />
            </g>
          ))}

          <g ref={reg(5)} data-prof="0.62">
            <path d={silhueta()} fill="#0b0b0b" />
            <g clipPath="url(#recorte)" fill="none" stroke="#7fcf6a" strokeWidth="1.4" strokeLinejoin="round">
              {Array.from({ length: 14 }, (_, i) => (
                <path
                  key={i}
                  d={contorno(i + 1)}
                  pathLength="1"
                  className={styles.contorno}
                  style={{ animationDelay: `${0.4 + i * 0.09}s`, opacity: 0.9 - i * 0.05 }}
                />
              ))}
            </g>
            <path d={silhueta()} fill="none" stroke="#7fcf6a" strokeWidth="2.2" strokeLinejoin="round" />
          </g>

          <g ref={reg(6)} data-prof="0.9">
            <path d={cume(53, 842, 16, 26)} fill="#050309" />
          </g>

          <rect width={W} height={H} filter="url(#grao)" style={{ mixBlendMode: "overlay" }} />
        </svg>

        <div className={styles.pontos} ref={reg(7)} data-prof="0.62">
          {artistas.map((a) => (
            <Link
              key={a.slug}
              href={urlArtista(a.slug)}
              className={styles.ponto}
              style={{
                left: `${a.cena.x}%`,
                top: `${a.cena.y}%`,
                "--cor": a.destaque,
              }}
              onClick={(e) => entrar(e, a)}
              aria-label={`Entrar: ${a.nome}`}
            >
              <span className={styles.anel} />
              <span className={styles.miolo} />
              <span className={styles.rotulo}>{a.nome}</span>
            </Link>
          ))}
        </div>
      </div>

      <h1 className={styles.titulo}>JODO</h1>

      <nav className={styles.bordaEsq} aria-label="Principal">
        <Link href="/artigo">Artigos</Link>
        <Link href="/eventos">Eventos</Link>
        <Link href="/arquivo">Arquivo</Link>
      </nav>
      <div className={styles.bordaDir}>
        <Link href="/artistas">Artistas</Link>
      </div>
      <button className={styles.explorar} onClick={() => setMenu(true)}>
        Explorar
      </button>
      <p className={styles.rodape}>Porque ainda estamos aqui</p>
      <p className={styles.dica}>arraste para os lados</p>

      <div className={`${styles.menu} ${menu ? styles.menuAberto : ""}`} aria-hidden={!menu}>
        <button className={styles.fechar} onClick={() => setMenu(false)}>
          Fechar
        </button>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setMenu(false)} tabIndex={menu ? 0 : -1}>
                {l.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {saida && (
        <div
          className={styles.transicao}
          style={{ "--x": `${saida.x}px`, "--y": `${saida.y}px`, background: saida.cor }}
        />
      )}
    </div>
  );
}

