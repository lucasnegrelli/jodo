"use client";
// Página do Lessa Gustavo: um acervo em rolagem, do lançamento mais novo ao mais antigo.
// Um fundo em shader mistura a paleta de cada capa conforme a rolagem; algumas capas viram objetos que reagem ao cursor (objetos.js).
import { useCallback, useEffect, useRef, useState } from "react";
import { Archivo } from "next/font/google";
import Lenis from "lenis";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { ACERVO } from "@/data/lessaAcervo";
import { LINKS } from "@/data/lessaObras";
import s from "@/styles/lessaAcervo.module.css";

const arq = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--la-sans" });

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const quando = (d) => (d.length > 4 ? `${MESES[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}` : d);
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const HERO = { bg: "#0f0e0d", b1: "#e6231c", b2: "#3b2a24", ink: "#f3efe6" };
const PAL = [HERO, ...ACERVO.map((a) => a.pal), HERO].map((p) => ({ bg: rgb(p.bg), b1: rgb(p.b1), b2: rgb(p.b2), ink: rgb(p.ink) }));
// capas com objeto reativo (objetos.js). Desligado a pedido do Lucas (2026-11-03): as capas ficam só como capa. Para religar: new Set(["muita-ostra", "almojanta", "catarina", "agora", "radar-filme-sujo"])
const VIVOS = new Set([]);
const DICA = { "muita-ostra": "passe o cursor no muro", almojanta: "ligue os interruptores", catarina: "passe a lanterna", agora: "ligue as estrelas", "radar-filme-sujo": "mova o radar" };
const LAY = (i) => "abcd"[(i * 5 + (i >> 1)) % 4];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const css = (c) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision mediump float;
uniform vec2 uRes;uniform float uT,uV,uS;uniform vec3 uBg,uB1,uB2;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float a=uRes.x/uRes.y;vec2 p=uv*vec2(a,1.);float t=uT*.05;
  float w=n(p*2.1+t*4.+uS*.5)-.5;
  vec2 c1=vec2(.22+.3*sin(t*1.3+uS*.6),.62+.24*cos(t*1.1+uS*.4))*vec2(a,1.);
  vec2 c2=vec2(.8+.2*cos(t*.9-uS*.5),.28+.28*sin(t*1.4+uS*.35))*vec2(a,1.);
  float b1=smoothstep(.85,.0,length(p-c1)+w*.45);float b2=smoothstep(.8,.0,length(p-c2)+w*.4);
  vec3 col=uBg;col=mix(col,uB1,b1*.5);col=mix(col,uB2,b2*.42);
  col*=1.-.32*dot(uv-.5,uv-.5)*2.;col+=uV*.045;
  col+=(h(gl_FragCoord.xy+floor(uT*24.))-.5)*.06;
  gl_FragColor=vec4(col,1.);}`;

/* a capa: foto estática e, nas que têm objeto, um canvas por cima que só roda enquanto a capa está na tela */
function Capa({ a, vivo, onLuz, onAchou }) {
  const fig = useRef(null), cv = useRef(null);
  useEffect(() => {
    if (!vivo) return;
    let morto = false, raf = 0, visivel = false, obj = null, tm = 0;
    const fe = fig.current, cn = cv.current, ctx = cn.getContext("2d");
    const img = new Image(); img.src = `/lg/hd/${a.k}.jpg`;
    const p = { x: -999, y: -999, ativo: false }, lay = { w: 0, h: 0, dpr: 1, sx: 0, sy: 0, S: 0 };
    const env = { ctx, lay, ptr: p, img, obra: {}, achou: () => onAchou?.(), luz: (n) => onLuz?.(n), cursor: (c) => { fe.style.cursor = c; } };
    const mede = () => {
      const r = fe.getBoundingClientRect(); if (r.width < 8) return; lay.dpr = Math.min(window.devicePixelRatio || 1, 2); lay.w = lay.h = lay.S = Math.round(r.width);
      cn.width = cn.height = Math.max(2, Math.round(lay.S * lay.dpr)); obj?.prep?.();
    };
    img.onload = async () => { const m = await import("./objetos"); if (morto) return; obj = m.OBJETOS[a.k](env); mede(); cn.dataset.on = "1"; };
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { rootMargin: "12% 0px" }); io.observe(fe);
    const ro = new ResizeObserver(mede); ro.observe(fe);
    const rel = (e) => { const r = cn.getBoundingClientRect(); p.x = e.clientX - r.left; p.y = e.clientY - r.top; };
    const move = (e) => { rel(e); p.ativo = true; };
    const sai = () => { p.ativo = false; p.x = p.y = -999; };
    const down = (e) => { rel(e); p.ativo = true; obj?.clique?.(); if (e.pointerType === "touch") { clearTimeout(tm); tm = setTimeout(sai, 1800); } };
    const leave = (e) => { if (e.pointerType !== "touch") sai(); };
    fe.addEventListener("pointermove", move); fe.addEventListener("pointerdown", down); fe.addEventListener("pointerleave", leave);
    let ult = performance.now(); const t0 = ult;
    const frame = (ms) => {
      if (morto) return; raf = requestAnimationFrame(frame);
      if (!visivel || !obj) return;
      const dt = Math.min(0.05, (ms - ult) / 1000); ult = ms; obj.quadro((ms - t0) / 1000, dt);
    };
    raf = requestAnimationFrame(frame);
    return () => { morto = true; cancelAnimationFrame(raf); clearTimeout(tm); io.disconnect(); ro.disconnect(); fe.removeEventListener("pointermove", move); fe.removeEventListener("pointerdown", down); fe.removeEventListener("pointerleave", leave); };
  }, [a.k, vivo, onLuz, onAchou]);
  return (
    <figure ref={fig} className={`${s.capa} ${vivo ? s.viva : ""}`}>
      <img src={`/lg/hd/${a.k}.jpg`} alt={`Capa de ${a.t}`} loading="lazy" decoding="async" draggable={false} />
      {vivo ? <canvas ref={cv} className={s.objeto} aria-hidden="true" /> : null}
      {vivo ? <figcaption className={s.dica}>{DICA[a.k]}</figcaption> : null}
    </figure>
  );
}

function Capitulo({ a, i, setRef }) {
  const [achou, setAchou] = useState(false);
  const raiz = useRef(null);
  const luz = useCallback((n) => raiz.current?.style.setProperty("--luz", n.toFixed(3)), []);
  const ac = useCallback(() => setAchou(true), []);
  const ano = a.d.slice(0, 4), L = LAY(i), muitas = a.faixas.length > 14;
  return (
    <article ref={(el) => { raiz.current = el; setRef(i + 1, el); }} id={`d-${a.k}`} className={`${s.cap} ${s["lay" + L.toUpperCase()]}`} data-achou={achou ? "1" : "0"} aria-label={a.t}>
      <div className={s.ano} aria-hidden="true">{ano}</div>
      <div className={s.capaBox}><Capa a={a} vivo={VIVOS.has(a.k)} onLuz={luz} onAchou={ac} /></div>
      <div className={s.info}>
        <p className={s.meta}><b>{String(i + 1).padStart(2, "0")}</b><span>{a.tipo}</span>{a.faixas.length > 1 ? <span>{a.faixas.length} faixas</span> : null}<span>{quando(a.d)}</span></p>
        <h2 className={`${s.titulo} ${a.t.length > 24 ? s.longo : ""}`}>{a.t}</h2>
        {a.nota ? <p className={s.nota}>{a.nota}</p> : null}
        {a.faixas.length > 1 ? <ol className={`${s.faixas} ${muitas ? s.muitas : ""}`}>{a.faixas.map((f) => <li key={f}>{f}</li>)}</ol> : null}
        {a.cred.length ? <dl className={s.cred}>{a.cred.map(([r, n]) => <div key={r}><dt>{r}</dt><dd>{n.join(", ")}</dd></div>)}</dl> : null}
        {a.label ? <p className={s.selo}>{a.label}</p> : null}
        <div className={s.ouvir}>{a.ouvir.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer">{n}<i>↗</i></a>)}</div>
      </div>
    </article>
  );
}

export default function LessaAcervo() {
  const raiz = useRef(null), fundo = useRef(null), refs = useRef([]), lenis = useRef(null);
  const [ativo, setAtivo] = useState(0), [leg, setLeg] = useState(null);
  const setRef = useCallback((i, el) => { refs.current[i] = el; }, []);
  const vai = useCallback((i) => {
    const el = refs.current[i]; if (!el) return;
    if (lenis.current) lenis.current.scrollTo(el, { duration: 1.5, offset: 0 }); else el.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = raiz.current, cv = fundo.current;
    let raf = 0, morto = false, vh = window.innerHeight, centros = [], ult = performance.now(), ya = window.scrollY, atv = 0;
    const sb = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior = "auto";
    if (!reduz) { lenis.current = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 }); }
    // fundo em shader
    const gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    let U = {}, prog = null;
    if (gl) {
      const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
      if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.useProgram(prog); const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        ["uRes", "uT", "uV", "uS", "uBg", "uB1", "uB2"].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
      } else { prog = null; }
    }
    const mede = () => {
      vh = window.innerHeight; const d = Math.min(window.devicePixelRatio || 1, 1.25);
      cv.width = Math.round(window.innerWidth * d); cv.height = Math.round(vh * d); if (gl && prog) gl.viewport(0, 0, cv.width, cv.height);
      const y0 = window.scrollY; centros = refs.current.map((n) => { const r = n.getBoundingClientRect(); return r.top + y0 + r.height / 2; });
    };
    mede();
    const ro = new ResizeObserver(mede); ro.observe(el);
    if (document.fonts?.ready) document.fonts.ready.then(mede);
    let cur = { bg: [...PAL[0].bg], b1: [...PAL[0].b1], b2: [...PAL[0].b2], ink: [...PAL[0].ink] }, vel = 0;
    const vis = new Set();
    const ioPar = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? vis.add(e.target) : vis.delete(e.target))), { rootMargin: "20% 0px" });
    const ioIn = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.dataset.in = "1"; }), { threshold: 0.16 });
    refs.current.forEach((n) => { ioPar.observe(n); ioIn.observe(n); });
    const frame = (ms) => {
      if (morto) return; raf = requestAnimationFrame(frame);
      lenis.current?.raf(ms);
      const dt = Math.min(0.05, (ms - ult) / 1000); ult = ms;
      const sy = window.scrollY, y = sy + vh * 0.5;
      vel += (clamp(Math.abs(sy - ya) / Math.max(dt, 0.001) / 3000) - vel) * 0.12; ya = sy;
      let i = 0; while (i < centros.length - 2 && y >= centros[i + 1]) i++;
      const f = clamp((y - centros[i]) / ((centros[i + 1] - centros[i]) || 1)), m = clamp((f - 0.4) / 0.45), e = m * m * (3 - 2 * m);
      const A = PAL[i], B = PAL[i + 1] || PAL[i], k = 1 - Math.exp(-dt * 3.2);
      ["bg", "b1", "b2", "ink"].forEach((n) => { cur[n] = mix(cur[n], mix(A[n], B[n], e), k); });
      const idx = f < 0.5 ? i : i + 1; if (idx !== atv) { atv = idx; setAtivo(idx); }
      el.style.setProperty("--ink", css(cur.ink)); el.style.setProperty("--bg", css(cur.bg));
      if (gl && prog) {
        gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform1f(U.uT, ms / 1000); gl.uniform1f(U.uV, vel); gl.uniform1f(U.uS, sy / vh);
        gl.uniform3f(U.uBg, cur.bg[0] / 255, cur.bg[1] / 255, cur.bg[2] / 255); gl.uniform3f(U.uB1, cur.b1[0] / 255, cur.b1[1] / 255, cur.b1[2] / 255); gl.uniform3f(U.uB2, cur.b2[0] / 255, cur.b2[1] / 255, cur.b2[2] / 255);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!reduz) vis.forEach((n) => { const r = n.getBoundingClientRect(); n.style.setProperty("--p", ((r.top + r.height / 2 - vh / 2) / vh).toFixed(3)); });
    };
    raf = requestAnimationFrame(frame);
    return () => { morto = true; cancelAnimationFrame(raf); ro.disconnect(); ioPar.disconnect(); ioIn.disconnect(); lenis.current?.destroy(); lenis.current = null; document.documentElement.style.scrollBehavior = sb; };
  }, []);

  const total = ACERVO.length, a = ativo >= 1 && ativo <= total ? ACERVO[ativo - 1] : null;
  return (
    <main ref={raiz} className={`${s.raiz} ${arq.variable}`}>
      <canvas ref={fundo} className={s.fundo} aria-hidden="true" />
      <div className={s.grao} aria-hidden="true" />
      <VoltarJodo />
      <MarcaTopo nome="Lessa Gustavo" cor="#e6231c" plano escala={1.05} aoSubir={() => vai(0)} />
      <nav className={s.links} aria-label="Plataformas">
        <a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify</a>
        <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
        <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud</a>
        <a href={LINKS.bandcamp} target="_blank" rel="noopener noreferrer">Bandcamp</a>
      </nav>

      <section ref={(el) => setRef(0, el)} className={s.hero} aria-label="Início">
        <h1 className={s.nome}><span>lessa</span><span>gustavo</span></h1>
        <p className={s.sub}>música, arte conceitual, design e moda<br />Baixada Fluminense · 2015 — 2026</p>
        <ol className={s.mosaico} aria-label="Todos os lançamentos">
          {ACERVO.map((d, i) => (
            <li key={d.k} style={{ "--n": i }}><button type="button" onClick={() => vai(i + 1)} onMouseEnter={() => setLeg(d)} onMouseLeave={() => setLeg(null)} onFocus={() => setLeg(d)} onBlur={() => setLeg(null)} aria-label={`${d.t}, ${d.d.slice(0, 4)}`}>
              <img src={`/lg/th/${d.k}.jpg`} alt="" loading="eager" decoding="async" draggable={false} />
            </button></li>
          ))}
        </ol>
        <p className={s.leg} aria-live="polite">{leg ? <><b>{leg.d.slice(0, 4)}</b> {leg.t}</> : <>{total} lançamentos, do mais novo ao mais velho. Role.</>}</p>
      </section>

      {ACERVO.map((d, i) => <Capitulo key={d.k} a={d} i={i} setRef={setRef} />)}

      <section ref={(el) => setRef(total + 1, el)} className={s.outro} aria-label="Sobre e links">
        <p className={s.eyebrow}>sobre</p>
        <p className={s.texto}>Gustavo Lessa é da Baixada Fluminense e vem das artes visuais. Escreve, produz com parceiros e desenha as próprias capas, quase sempre a partir de fotos de objetos. Desde 2015, mais de vinte lançamentos, de um EP de quatro faixas a um álbum de trinta e duas.</p>
        <ul className={s.plataformas}>
          <li><a href={LINKS.spotify} target="_blank" rel="noopener noreferrer"><span>Spotify</span><i>↗</i></a></li>
          <li><a href={LINKS.bandcamp} target="_blank" rel="noopener noreferrer"><span>Bandcamp</span><i>↗</i></a></li>
          <li><a href={LINKS.youtube} target="_blank" rel="noopener noreferrer"><span>YouTube</span><i>↗</i></a></li>
          <li><a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer"><span>SoundCloud</span><i>↗</i></a></li>
          <li><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer"><span>Instagram</span><em>@gessalustavo</em><i>↗</i></a></li>
        </ul>
        <button type="button" className={s.topo} onClick={() => vai(0)}>voltar ao início ↑</button>
      </section>

      <nav className={s.regua} aria-label="Linha do tempo">
        {ACERVO.map((d, i) => (
          <button key={d.k} type="button" className={ativo === i + 1 ? s.on : ""} onClick={() => vai(i + 1)} aria-label={`${d.t}, ${d.d.slice(0, 4)}`}>
            <span>{d.d.slice(0, 4)}</span><i />
          </button>
        ))}
      </nav>
      <p className={s.contador} aria-hidden="true">{a ? <><b>{String(ativo).padStart(2, "0")}</b> / {total} · {a.d.slice(0, 4)}</> : "acervo"}</p>
    </main>
  );
}
