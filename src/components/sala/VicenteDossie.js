"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/vicenteDossie.module.css";
import { DISCO, PERFIS } from "@/data/vicenteBlow";
import { NOS, CONEXOES } from "@/data/conexoes";

/*
 * VBLXW · dossiê.
 * Fotografia dele (P&B e escuro) com o fogo como calor, não como desenho: lanterna que segue o cursor e brasas no hero,
 * campo em rolagem horizontal, a mata que queima de verdade sobre a foto aérea, discografia com a capa seguindo o cursor.
 */

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const NOMES = { spotify: "Spotify", youtube: "YouTube", deezer: "Deezer", soundcloud: "SoundCloud", instagram: "Instagram" };

const CAMPO = [
  ["aereo", "de cima"], ["pista", "pista de terra"], ["aviao", "o avião"], ["barco", "no barco"], ["praia", "margem"],
  ["por", "fim de tarde"], ["maloca", "maloca"], ["rede", "rede"], ["araras", "araras"], ["arara", "arara"],
];
const ROSTOS = ["chapeu", "azul", "colar", "oculos", "branco", "quente", "mascara", "cidade", "chapeubw", "vermelho", "azulcar"];
const PALCO = ["palco1", "palco2", "festa1", "palco3", "festa2", "bar", "arara"];

function Icone({ r }) {
  if (r === "spotify")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#1DB954" />
        <path d="M5.2 8.7c4.3-1.3 9.5-1 13.4 1.3" fill="none" stroke="#000" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M5.9 12.2c3.6-1 7.7-.7 10.8 1.1" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.7 15.4c2.9-.7 5.9-.5 8.4.9" fill="none" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  if (r === "youtube")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="0.5" y="4" width="23" height="16" rx="4.5" fill="#FF0000" />
        <path d="M9.7 8.6v6.8l5.9-3.4z" fill="#fff" />
      </svg>
    );
  if (r === "soundcloud")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#FF5500" />
        <path d="M4 15.5v-3M6.2 16v-5M8.4 16v-6.2M10.6 16V9.2M12 16h6.2a2.4 2.4 0 0 0 .3-4.8 4.1 4.1 0 0 0-6.5-1.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  if (r === "deezer")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#121216" />
        {[[3, 15, "#40ab5d"], [8, 12, "#3c9fda"], [13, 9, "#8c4ad9"], [18, 6, "#e0366b"]].map(([x, y, c]) => (
          <rect key={x} x={x - 1} y={y} width="4" height={19 - y} rx="1" fill={c} />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="igv" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA77" />
          <stop offset="0.45" stopColor="#F5436B" />
          <stop offset="1" stopColor="#7B3FE4" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#igv)" />
      <rect x="5.2" y="5.2" width="13.6" height="13.6" rx="4" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="16.4" cy="7.6" r="1" fill="#fff" />
    </svg>
  );
}

/* texto que acende palavra por palavra quando o bloco entra na tela */
function Acende({ t, i0 = 0 }) {
  const ps = String(t).split(/(\s+)/);
  let k = i0;
  return ps.map((p, j) =>
    /^\s+$/.test(p) || p === "" ? (
      p
    ) : (
      <span key={j} className={styles.w} style={{ "--i": Math.min(k++, 60) }}>
        {p}
      </span>
    )
  );
}

const ARESTAS = CONEXOES.filter((c) => c.com.includes("vicente-blow"));
const VIZ = [...new Set(ARESTAS.flatMap((c) => c.com).filter((x) => x !== "vicente-blow"))];

function Grafo() {
  const [foco, setFoco] = useState(null);
  const cx = 300, cy = 255;
  const pos = (k) => {
    const a = -Math.PI / 2 + (k / VIZ.length) * Math.PI * 2;
    return [cx + Math.cos(a) * 212, cy + Math.sin(a) * 171];
  };
  const obras = foco ? ARESTAS.filter((c) => c.com.includes(foco)) : [];
  return (
    <div className={styles.grafo}>
      <svg viewBox="20 50 560 430" role="img" aria-label="Mapa de quem já fez música com o Vicente Blow">
        {VIZ.map((id, k) => {
          const [x, y] = pos(k);
          return <line key={id} x1={cx} y1={cy} x2={x} y2={y} className={foco === id ? styles.arOn : styles.ar} />;
        })}
        <circle cx={cx} cy={cy} r="62" className={styles.noC} />
        <text x={cx} y={cy + 8} textAnchor="middle" className={styles.noCT}>VBLXW</text>
        {VIZ.map((id, k) => {
          const [x, y] = pos(k);
          const n = NOS[id] || { nome: id };
          const inner = (
            <>
              <circle cx={x} cy={y} r="40" className={`${styles.no} ${n.grupo === "bruxos-do-norte" ? styles.noB : ""} ${foco === id ? styles.noOn : ""}`} />
              <text x={x} y={y + 4} textAnchor="middle" className={styles.noT}>{n.curto || n.nome.split(" ")[0]}</text>
              {n.rota && <text x={x} y={y + 60} textAnchor="middle" className={styles.noL}>abrir página ↗</text>}
            </>
          );
          return n.rota ? (
            <a key={id} href={n.rota} onMouseEnter={() => setFoco(id)} onFocus={() => setFoco(id)} onMouseLeave={() => setFoco(null)}>
              {inner}
            </a>
          ) : (
            <g key={id} onMouseEnter={() => setFoco(id)} onMouseLeave={() => setFoco(null)} tabIndex={0} onFocus={() => setFoco(id)} onBlur={() => setFoco(null)}>
              {inner}
            </g>
          );
        })}
      </svg>
      <p className={styles.grafoL} aria-live="polite">
        {foco ? obras.map((o) => `${o.obra} (${o.ano})`).join("  ·  ") : "em brasa, o Bruxos do Norte; em osso, quem vem de fora"}
      </p>
    </div>
  );
}

/* fogo de verdade sobre a foto aérea: shader com alpha, misturado em "screen" */
const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision mediump float;
uniform vec2 uRes;uniform float uT,uB;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;
  vec2 p=vec2(uv.x*asp*2.4,uv.y*1.7-uT*.42);
  float f=fbm(p+fbm(p*1.4+uT*.25)*.9);
  float v=f*1.05+uB*1.15-uv.y*1.3-.5;
  float a=smoothstep(.12,.8,v);
  vec3 c=mix(vec3(.45,.03,0.),vec3(1.,.38,.04),smoothstep(.25,.7,v));
  c=mix(c,vec3(1.,.86,.45),smoothstep(.72,1.15,v));
  gl_FragColor=vec4(c*a,a);
}`;

export default function VicenteDossie() {
  const raiz = useRef(null);
  const heroEl = useRef(null);
  const brasas = useRef(null);
  const campoEl = useRef(null);
  const trilhaCampo = useRef(null);
  const fogoEl = useRef(null);
  const fogoCv = useRef(null);
  const fogoFoto = useRef(null);
  const veu = useRef(null);
  const legs = useRef([]);
  const fatosEl = useRef(null);
  const barra = useRef(null);
  const capaFlut = useRef(null);
  const [capaSel, setCapaSel] = useState(null);
  const capaRef = useRef(null);

  useEffect(() => {
    const el = raiz.current;
    // o site raiz deixa body/html com overflow escondido, o que quebra o position: sticky; aqui o corte horizontal passa a ser "clip"
    const antes = [document.documentElement.style.cssText, document.body.style.cssText];
    document.documentElement.style.overflow = "visible";
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflow = "visible";
    document.body.style.overflowX = "clip";
    const m = { x: 0.5, y: 0.5, px: 0, py: 0, alvoX: 0, alvoY: 0, cx: 0, cy: 0 };
    let raf, vw = innerWidth, vh = innerHeight, tocou = false;

    // revela blocos ao entrar na tela
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.setAttribute("data-on", "1")),
      { threshold: 0.18 }
    );
    el.querySelectorAll("[data-r]").forEach((n) => io.observe(n));

    // brasas do hero (canvas 2D)
    const bc = brasas.current;
    const bx = bc.getContext("2d");
    let ps = [];
    const dimBrasas = () => {
      bc.width = bc.clientWidth;
      bc.height = bc.clientHeight;
    };
    dimBrasas();
    const nasce = (x, y, v = 1) => {
      ps.push({ x, y, vx: (Math.random() - 0.5) * 0.6 * v, vy: -(0.5 + Math.random() * 1.3) * v, r: 0.6 + Math.random() * 1.9, l: 1, d: 0.004 + Math.random() * 0.007, s: Math.random() * 6 });
    };

    // fogo (WebGL) sobre a foto aérea
    const fc = fogoCv.current;
    const gl = fc.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    let U = null;
    if (gl) {
      const sh = (tipo, src) => {
        const s = gl.createShader(tipo);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(pr);
      gl.useProgram(pr);
      const bf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      U = { r: gl.getUniformLocation(pr, "uRes"), t: gl.getUniformLocation(pr, "uT"), b: gl.getUniformLocation(pr, "uB") };
    }
    const dimFogo = () => {
      fc.width = Math.max(2, Math.floor(vw / 3));
      fc.height = Math.max(2, Math.floor(vh / 3));
      if (gl) gl.viewport(0, 0, fc.width, fc.height);
    };
    dimFogo();

    const prog = (n) => {
      const r = n.getBoundingClientRect();
      return { r, p: Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh))) };
    };

    const medeCampo = () => {
      const t = trilhaCampo.current;
      campoEl.current.style.height = `${Math.max(vh * 1.6, t.scrollWidth - vw + vh)}px`;
    };
    medeCampo();

    const onResize = () => {
      vw = innerWidth;
      vh = innerHeight;
      dimBrasas();
      dimFogo();
      medeCampo();
    };
    const onMove = (e) => {
      m.x = e.clientX / vw;
      m.y = e.clientY / vh;
      m.alvoX = e.clientX;
      m.alvoY = e.clientY;
      tocou = true;
      const hr = heroEl.current.getBoundingClientRect();
      if (e.clientY < hr.bottom && Math.random() < 0.7) nasce(e.clientX - hr.left, e.clientY - hr.top, 0.9);
    };
    const onClick = (e) => {
      const hr = heroEl.current.getBoundingClientRect();
      if (e.clientY < hr.bottom) for (let k = 0; k < 26; k++) nasce(e.clientX - hr.left, e.clientY - hr.top, 2.4);
    };
    addEventListener("resize", onResize);
    addEventListener("pointermove", onMove);
    addEventListener("pointerdown", onClick);

    const t0 = performance.now();
    const tick = (now) => {
      const t = (now - t0) / 1000;
      const y = scrollY;
      // barra de leitura
      const tot = document.documentElement.scrollHeight - vh;
      if (barra.current) barra.current.style.transform = `scaleX(${(tot > 0 ? y / tot : 0).toFixed(4)})`;

      // hero: lanterna segue o cursor (sozinha no toque)
      const hh = heroEl.current;
      if (y < vh * 1.1) {
        if (!tocou) {
          m.alvoX = vw * (0.5 + Math.sin(t * 0.45) * 0.28);
          m.alvoY = vh * (0.42 + Math.cos(t * 0.33) * 0.18);
        }
        m.cx += (m.alvoX - m.cx) * 0.09;
        m.cy += (m.alvoY - m.cy) * 0.09;
        hh.style.setProperty("--mx", `${m.cx.toFixed(0)}px`);
        hh.style.setProperty("--my", `${(m.cy - hh.getBoundingClientRect().top).toFixed(0)}px`);
        hh.style.setProperty("--fx", `${((m.cx / vw - 0.5) * -26).toFixed(1)}px`);
        hh.style.setProperty("--fy", `${((m.cy / vh - 0.5) * -16 + y * 0.12).toFixed(1)}px`);
        // brasas
        if (Math.random() < 0.55) nasce(Math.random() * bc.width, bc.height + 6, 1);
        bx.clearRect(0, 0, bc.width, bc.height);
        ps = ps.filter((p) => p.l > 0);
        for (const p of ps) {
          p.x += p.vx + Math.sin(t * 2 + p.s) * 0.35;
          p.y += p.vy;
          p.l -= p.d;
          bx.beginPath();
          bx.fillStyle = `rgba(255,${Math.floor(90 + p.l * 120)},30,${Math.max(0, p.l).toFixed(2)})`;
          bx.shadowColor = "rgba(255,90,20,.9)";
          bx.shadowBlur = 8;
          bx.arc(p.x, p.y, p.r * (0.5 + p.l * 0.7), 0, 6.283);
          bx.fill();
        }
      }

      // campo: rolagem horizontal presa
      const cEl = campoEl.current;
      const cr = cEl.getBoundingClientRect();
      if (cr.bottom > -50 && cr.top < vh + 50) {
        const p = Math.min(1, Math.max(0, -cr.top / Math.max(1, cr.height - vh)));
        const tr = trilhaCampo.current;
        tr.style.transform = `translate3d(${(-p * Math.max(0, tr.scrollWidth - vw)).toFixed(1)}px,0,0)`;
        cEl.style.setProperty("--pc", p.toFixed(3));
      }

      // fogo: a mata queima conforme rola
      const f = prog(fogoEl.current);
      if (f.r.bottom > -50 && f.r.top < vh + 50) {
        const p = f.p;
        const b = sm((p - 0.12) / 0.62);
        if (gl && U) {
          gl.uniform2f(U.r, fc.width, fc.height);
          gl.uniform1f(U.t, t);
          gl.uniform1f(U.b, b);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        fogoFoto.current.style.filter = `brightness(${(1 - 0.62 * sm(p / 0.75)).toFixed(3)}) saturate(${(1 - 0.85 * sm((p - 0.2) / 0.6)).toFixed(3)}) contrast(1.12)`;
        fogoFoto.current.style.transform = `scale(${(1.04 + p * 0.22).toFixed(4)})`;
        veu.current.style.opacity = sm((p - 0.82) / 0.16).toFixed(3);
        const jan = (a, c, d, e) => sm((p - a) / (c - a)) * (1 - sm((p - d) / (e - d)));
        const J = [jan(0.0, 0.05, 0.2, 0.3), jan(0.28, 0.36, 0.5, 0.58), jan(0.52, 0.62, 2, 2)];
        legs.current.forEach((n, q) => {
          if (!n) return;
          n.style.opacity = J[q].toFixed(3);
          n.style.transform = `translate3d(0,${((1 - J[q]) * 30).toFixed(1)}px,0)`;
        });
        fatosEl.current.style.opacity = sm((p - 0.74) / 0.14).toFixed(3);
      }

      // capa que segue o cursor na discografia
      const cf = capaFlut.current;
      if (cf) {
        const a = capaRef.current;
        a.x += (m.alvoX - a.x) * 0.16;
        a.y += (m.alvoY - a.y) * 0.16;
        cf.style.transform = `translate3d(${(a.x + 26).toFixed(1)}px,${(a.y - 120).toFixed(1)}px,0) rotate(${(((m.alvoX - a.x) / 40) * 1.2).toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    capaRef.current = { x: 0, y: 0 };
    raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(medeCampo);
    ro.observe(trilhaCampo.current);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.cssText = antes[0];
      document.body.style.cssText = antes[1];
      io.disconnect();
      ro.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onClick);
    };
  }, []);

  let k = 0;
  const ac = (t) => {
    const e = <Acende t={t} i0={k} />;
    k += String(t).split(/\s+/).length;
    return e;
  };
  const sel = capaSel != null ? DISCO[capaSel] : null;

  return (
    <main ref={raiz} className={styles.raiz}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Space+Mono:wght@400;700&display=swap"
      />
      <VoltarJodo />
      <div ref={barra} className={styles.barra} aria-hidden="true" />
      <nav className={styles.menu} aria-label="Seções">
        {[["historia", "história"], ["campo", "campo"], ["fogo", "fogo"], ["discos", "discos"], ["rostos", "rostos"], ["conexoes", "conexões"], ["ouvir", "ouvir"]].map(([id, t]) => (
          <a key={id} href={`#${id}`}>{t}</a>
        ))}
      </nav>

      {/* ============ 1. hero ============ */}
      <header ref={heroEl} className={styles.hero}>
        <div className={styles.heroFoto}>
          <img src="/vb/f/hero.webp" alt="Vicente Blow, de colar de miçangas e jaqueta, na penumbra vermelha" />
        </div>
        <div className={styles.lanterna} />
        <canvas ref={brasas} className={styles.brasas} aria-hidden="true" />
        <small className={styles.kick}>manaus · amazonas · desde 2013</small>
        <small className={styles.lado}>el camiño de cobra</small>
        <h1 className={styles.nome}>
          <span>VBLXW</span>
        </h1>
        <p className={styles.sub}>
          <b>vicente blow</b>
          rapper · fotógrafo · bruxos do norte
        </p>
        <span className={styles.desce}>↓</span>
      </header>

      {/* ============ 2. quem é ============ */}
      <section id="historia" className={styles.hist}>
        <div className={styles.histTxt}>
          <span className={styles.rot} data-r>nascido em 99</span>
          <h2 data-r>
            nasceu marcado.
            <br />
            sobreviveu <em>rimando.</em>
          </h2>
          <p className={styles.bio} data-r>
            {ac("Nascido em 99, com o cordão umbilical enrolado no pescoço. Marcado para morrer, ")}
            <mark>{ac("desafiou Deus e matou o próprio senhor destino.")}</mark>
          </p>
          <p className={styles.bio} data-r>
            {ac("Ver o mundo pelo pior lado foi sua terapia. Desenhar com sangue, seu primeiro ofício.")}
          </p>
          <p className={styles.bio} data-r>
            {ac("O rap acendeu a consciência política: o ódio bruto virou ")}
            <mark>{ac("munição organizada")}</mark>
            {ac(" e a caneta, uma mira a laser apontada para o alvo mais forte, o Capital.")}
          </p>
          <p className={styles.fecho} data-r>a.k.a. inimigo número 1 do estado</p>
        </div>
        <div className={styles.colagem}>
          <figure className={styles.f1} data-r><img src="/vb/f/bw1.webp" alt="Vicente Blow em preto e branco, olhando para o lado" loading="lazy" /></figure>
          <figure className={styles.f2} data-r><img src="/vb/f/chapeu.webp" alt="Vicente Blow de chapéu com fita grafada" loading="lazy" /></figure>
          <figure className={styles.f3} data-r><img src="/vb/f/chapeubw.webp" alt="Vicente Blow de camisa branca e chapéu, em preto e branco" loading="lazy" /></figure>
        </div>
      </section>

      {/* ============ 3. campo (rolagem horizontal) ============ */}
      <section id="campo" ref={campoEl} className={styles.campo}>
        <div className={styles.campoPalco}>
          <div className={styles.campoCab}>
            <span className={styles.rot}>o arquivo dele</span>
            <h2>campo</h2>
          </div>
          <div ref={trilhaCampo} className={styles.trilha}>
            <p className={styles.campoIntro}>
              Ele também fotografa e filma. A mata vista de cima, de barco, de pista de terra.
              <br />
              <em>role →</em>
            </p>
            {CAMPO.map(([f, leg], i) => (
              <figure key={f} className={styles.cf} style={{ "--i": i }}>
                <img src={`/vb/f/${f}.webp`} alt={`Foto do arquivo de Vicente Blow: ${leg}`} onLoad={() => window.dispatchEvent(new Event("resize"))} />
                <figcaption>
                  <b>{String(i + 1).padStart(2, "0")}</b> {leg}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4. fogo ============ */}
      <section id="fogo" ref={fogoEl} className={styles.fogo}>
        <div className={styles.fogoPalco}>
          <img ref={fogoFoto} className={styles.fogoFoto} src="/vb/f/copa.webp" alt="" aria-hidden="true" />
          <canvas ref={fogoCv} className={styles.fogoCv} aria-hidden="true" />
          <div ref={veu} className={styles.veu} />
          <div ref={(n) => (legs.current[0] = n)} className={styles.leg}>
            <small>antes</small>
            <b>a mata de pé.</b>
          </div>
          <div ref={(n) => (legs.current[1] = n)} className={styles.leg}>
            <small>29.02.2020</small>
            <b>o primeiro single.</b>
          </div>
          <div ref={(n) => (legs.current[2] = n)} className={`${styles.leg} ${styles.legG}`}>
            <small>depois</small>
            <b>amazônia pega fogo.</b>
          </div>
          <ol ref={fatosEl} className={styles.fatos}>
            <li><b>2013</b><span>entra na cena como bboy, aos 14 anos</span></li>
            <li><b>2017</b><span>desperta para o rap. Primeiro grupo: Interligados</span></li>
            <li><b>2020</b><span>“Amazônia pega fogo”, a primeira obra</span></li>
          </ol>
        </div>
      </section>

      {/* ============ 5. discografia ============ */}
      <section id="discos" className={styles.discos}>
        <div className={styles.secCab}>
          <span className={styles.rot} data-r>de 2020 até hoje</span>
          <h2 data-r>tudo que ele lançou</h2>
        </div>
        <ul className={styles.lista} onMouseLeave={() => setCapaSel(null)}>
          {DISCO.map((d, i) => (
            <li key={d.t + d.data} className={capaSel === i ? styles.liOn : ""} data-r onMouseEnter={() => d.capa && setCapaSel(i)}>
              <a href={d.url} target="_blank" rel="noreferrer">
                <span className={styles.dAno}>{d.ano}<i>{d.data}</i></span>
                <span className={styles.dT}>{d.t}</span>
                <span className={styles.dTag}>{d.tag}</span>
                <span className={styles.dSeta}>↗</span>
              </a>
              {(d.nota || d.com) && (
                <p className={styles.dNota}>
                  {d.nota}
                  {d.com && d.com.map((id) => {
                    const n = NOS[id];
                    if (!n) return null;
                    return n.rota ? (
                      <a key={id} href={n.rota} className={styles.chip}>{n.curto || n.nome} ↗</a>
                    ) : (
                      <b key={id} className={styles.chip}>{n.curto || n.nome}</b>
                    );
                  })}
                </p>
              )}
              {d.capa && <img className={styles.dMini} src={`/vb/capas/${d.capa}.webp`} alt={`Capa de ${d.t}`} loading="lazy" />}
            </li>
          ))}
        </ul>
        <div ref={capaFlut} className={`${styles.capaFlut} ${sel ? styles.capaOn : ""}`} aria-hidden="true">
          {sel && sel.capa && <img src={`/vb/capas/${sel.capa}.webp`} alt="" />}
        </div>
      </section>

      {/* ============ 6. rostos e palco ============ */}
      <section id="rostos" className={styles.rostos}>
        <div className={styles.secCab}>
          <span className={styles.rot} data-r>na rua, no palco</span>
          <h2 data-r>rostos</h2>
        </div>
        <div className={styles.faixa}>
          <div className={styles.corre}>
            {[...ROSTOS, ...ROSTOS].map((f, i) => (
              <img key={i} src={`/vb/f/${f}.webp`} alt={i < ROSTOS.length ? "Retrato de Vicente Blow" : ""} aria-hidden={i >= ROSTOS.length} loading="lazy" />
            ))}
          </div>
        </div>
        <div className={`${styles.faixa} ${styles.faixaB}`}>
          <div className={`${styles.corre} ${styles.volta}`}>
            {[...PALCO, ...PALCO].map((f, i) => (
              <img key={i} src={`/vb/f/${f}.webp`} alt={i < PALCO.length ? "Vicente Blow ao vivo" : ""} aria-hidden={i >= PALCO.length} loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 7. conexões ============ */}
      <section id="conexoes" className={styles.conex}>
        <div className={styles.conexTxt}>
          <span className={styles.rot} data-r>quem anda junto</span>
          <h2 data-r>conexões</h2>
          <p data-r>Cada faixa em dupla é uma linha neste mapa. Passe o mouse em um nome para ver as obras que ligam os dois. Quem já tem página na JODO é só clicar.</p>
        </div>
        <Grafo />
      </section>

      {/* ============ 8. ouvir ============ */}
      <section id="ouvir" className={styles.ouvir}>
        <span className={styles.rot} data-r>onde ouvir</span>
        <h2 data-r>acende o som</h2>
        <ul className={styles.plats}>
          {[
            ["spotify", "Spotify", "artista e discografia", PERFIS.spotify],
            ["deezer", "Deezer", "12 lançamentos", PERFIS.deezer],
            ["youtube", "YouTube", "Ruído das Águas, o álbum completo", PERFIS.youtubeAlbum],
            ["soundcloud", "SoundCloud", "o perfil do Bruxos do Norte", PERFIS.soundcloudGrupo],
            ["instagram", "Instagram", "@bruxobuya", PERFIS.instagram],
          ].map(([r, nome, sub, u]) => (
            <li key={r}>
              <a href={u} target="_blank" rel="noreferrer">
                <span className={styles.platIc}><Icone r={r} /></span>
                <b>{nome}</b>
                <em>{sub}</em>
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.gigante} aria-hidden="true">VBLXW</div>
        <button type="button" className={styles.paraTopo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          ↑ voltar ao começo
        </button>
      </section>
    </main>
  );
}
