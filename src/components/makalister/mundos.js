"use client";
// Os mundos do Makalister: cada disco, quando você entra na capa, vira um lugar com a própria cara.
// Contrato: <Mundo l={lançamento} /> ocupa a tela toda; quem fecha é a moldura (botão "capas"). Mundos prontos: dEPOIS dE sOBREVIVER…, Ondas 2, A Terça Parte da Noite; os outros usam o genérico.
import { useEffect, useRef } from "react";
import s from "@/styles/makalisterMergulho.module.css";

const dz = (l) => `https://www.deezer.com/album/${l.id}`;
const ano = (l) => l.d.slice(0, 4);
function Faixas({ l, className }) { return <ol className={className}>{l.faixas.map((t, i) => <li key={`${t}-${i}`}>{t}</li>)}</ol>; }
function Ouvir({ l, className }) { return <a className={`${s.ouvir} ${className || ""}`} href={dz(l)} target="_blank" rel="noopener noreferrer">Ouvir no Deezer <i>↗</i></a>; }

/* ===== dEPOIS dE sOBREVIVER qUERO vIVER…: papel branco e giz de cera vermelho; passar o cursor risca ===== */
export function MundoGiz({ l }) {
  const el = useRef(null), cv = useRef(null);
  useEffect(() => {
    const box = el.current, c = cv.current, ctx = c.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, ult = null, raf = 0, vivo = true;
    const mede = () => { const r = box.getBoundingClientRect(); w = r.width; h = r.height; c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    mede();
    const risca = (x0, y0, x1, y1) => {
      const n = Math.max(1, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 3));
      for (let i = 0; i < n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = `rgba(${188 + Math.random() * 24 | 0},${28 + Math.random() * 22 | 0},${20 + Math.random() * 14 | 0},${0.1 + Math.random() * 0.2})`;
          ctx.beginPath(); ctx.arc(x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12, 2 + Math.random() * 5, 0, 7); ctx.fill();
        }
      }
    };
    const move = (e) => { const r = box.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (ult) risca(ult.x, ult.y, x, y); ult = { x, y }; };
    const sai = () => { ult = null; };
    const frame = () => { if (!vivo) return; raf = requestAnimationFrame(frame); ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,.010)"; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = "source-over"; };
    frame();
    box.addEventListener("pointermove", move); box.addEventListener("pointerleave", sai); window.addEventListener("resize", mede);
    return () => { vivo = false; cancelAnimationFrame(raf); box.removeEventListener("pointermove", move); box.removeEventListener("pointerleave", sai); window.removeEventListener("resize", mede); };
  }, []);
  return (
    <div ref={el} className={s.giz}>
      <canvas ref={cv} className={s.gizRisco} aria-hidden="true" />
      <figure className={s.gizCapa}><img src={l.img} alt={`Capa de ${l.t}`} draggable={false} /><i /><i /></figure>
      <div className={s.gizTexto}>
        <p className={s.gizAno}>{ano(l)}</p>
        <h2>{l.t}</h2>
        <Faixas l={l} className={s.gizFaixas} />
        <Ouvir l={l} className={s.gizOuvir} />
        <p className={s.gizDica}>risque a folha com o cursor</p>
      </div>
    </div>
  );
}

/* ===== Ondas 2: o amarelo pintado da capa, em faixas de tinta que correm; o cursor mexe a água ===== */
const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision highp float;
uniform vec2 uRes,uM;uniform float uT;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 p=vec2(uv.x*asp,uv.y);
  vec2 m=vec2(uM.x*asp,uM.y);float dm=distance(p,m);
  float w=p.y*3.2+fbm(p*vec2(1.6,2.4)+vec2(uT*.05,0.))*2.2+sin(p.x*5.+uT*.45)*.22;
  w+=exp(-dm*dm*7.)*.9*sin(dm*18.-uT*3.);
  float b=fract(w);
  vec3 ama=vec3(.96,.72,.10),ver=vec3(.76,.15,.11),cre=vec3(.97,.91,.76),azu=vec3(.11,.24,.62),vrd=vec3(.10,.33,.22);
  vec3 c=ama;
  c=mix(c,ver,smoothstep(.46,.49,b)-smoothstep(.62,.65,b));
  c=mix(c,cre,smoothstep(.64,.67,b)-smoothstep(.72,.75,b));
  c=mix(c,azu,smoothstep(.74,.77,b)-smoothstep(.86,.89,b));
  c=mix(c,vrd,smoothstep(.88,.91,b)-smoothstep(.95,.98,b));
  c*=.92+.1*h(floor(gl_FragCoord.xy/2.)+floor(uT*8.));
  gl_FragColor=vec4(c,1.);}`;
export function MundoOndas({ l }) {
  const cv = useRef(null), box = useRef(null);
  useEffect(() => {
    const c = cv.current, gl = c.getContext("webgl", { antialias: false });
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(["uRes", "uM", "uT"].map((n) => [n, gl.getUniformLocation(pr, n)]));
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, raf = 0, vivo = true; const t0 = performance.now();
    const mede = () => { c.width = Math.round(window.innerWidth * dpr); c.height = Math.round(window.innerHeight * dpr); gl.viewport(0, 0, c.width, c.height); };
    mede();
    const move = (e) => { tx = e.clientX / window.innerWidth; ty = 1 - e.clientY / window.innerHeight; };
    const frame = () => {
      if (!vivo) return; raf = requestAnimationFrame(frame);
      mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;
      gl.uniform2f(U.uRes, c.width, c.height); gl.uniform2f(U.uM, mx, my); gl.uniform1f(U.uT, (performance.now() - t0) / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    frame();
    const bx = box.current; bx.addEventListener("pointermove", move); window.addEventListener("resize", mede);
    return () => { vivo = false; cancelAnimationFrame(raf); bx.removeEventListener("pointermove", move); window.removeEventListener("resize", mede); };
  }, []);
  return (
    <div ref={box} className={s.ondas}>
      <canvas ref={cv} className={s.ondasFundo} aria-hidden="true" />
      <div className={s.ondasMiolo}>
        <figure className={s.ondasCapa}><img src={l.img} alt={`Capa de ${l.t}`} draggable={false} /></figure>
        <div className={s.ondasTexto}>
          <p className={s.ondasAno}>{ano(l)} · {l.tipo}</p>
          <h2>{l.t}</h2>
          <Faixas l={l} className={s.ondasFaixas} />
          <Ouvir l={l} className={s.ondasOuvir} />
        </div>
      </div>
    </div>
  );
}

/* ===== A Terça Parte da Noite: o negativo, o grão, a luz que falha; as faixas viram legenda ===== */
export function MundoNoite({ l }) {
  const g = useRef(null), tc = useRef(null);
  useEffect(() => {
    const c = g.current, ctx = c.getContext("2d"), W = 320, H = 180; c.width = W; c.height = H;
    const img = ctx.createImageData(W, H); let vivo = true, raf = 0, ult = 0; const t0 = performance.now();
    const frame = (ms) => {
      if (!vivo) return; raf = requestAnimationFrame(frame);
      if (ms - ult > 70) {
        ult = ms; for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } ctx.putImageData(img, 0, 0);
        const s0 = Math.floor((ms - t0) / 1000) + 3 * 3600 + 47 * 60 + 12; if (tc.current) tc.current.textContent = `${String(Math.floor(s0 / 3600) % 24).padStart(2, "0")}:${String(Math.floor(s0 / 60) % 60).padStart(2, "0")}:${String(s0 % 60).padStart(2, "0")}`;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { vivo = false; cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className={s.noite}>
      <img className={s.noiteCapa} src={l.img} alt={`Capa de ${l.t}`} draggable={false} />
      <canvas ref={g} className={s.noiteGrao} aria-hidden="true" />
      <div className={s.noiteFaixa} aria-hidden="true" />
      <p className={s.noiteTc}>REC ● <span ref={tc}>03:47:12</span></p>
      <div className={s.noiteLegenda}>
        <h2>{l.t}</h2>
        <p className={s.noiteMeta}>{l.d.split("-").reverse().join(".")} · {l.tipo}</p>
        <Faixas l={l} className={s.noiteFaixas} />
        <Ouvir l={l} className={s.noiteOuvir} />
      </div>
    </div>
  );
}

/* ===== o genérico: a própria capa, desfocada e enorme, até o disco ganhar um mundo ===== */
export function MundoGenerico({ l }) {
  return (
    <div className={s.gen}>
      <div className={s.genFundo} style={{ backgroundImage: `url(${l.img})` }} aria-hidden="true" />
      <div className={s.genMiolo}>
        <figure className={s.genCapa}><img src={l.img} alt={`Capa de ${l.t}`} draggable={false} /></figure>
        <div className={s.genTexto}>
          <p className={s.genMeta}>{ano(l)} · {l.tipo}{l.label ? ` · ${l.label}` : ""}</p>
          <h2>{l.t}</h2>
          {l.nota ? <p className={s.genNota}>{l.nota}</p> : null}
          <Faixas l={l} className={s.genFaixas} />
          <Ouvir l={l} />
        </div>
      </div>
    </div>
  );
}

// quais discos já têm mundo próprio (id do Deezer) e o tema do cabeçalho em cada um ("claro" pede marca escura)
export const MUNDOS = { 915434391: MundoGiz, 263885112: MundoOndas, 57587452: MundoNoite };
export const TEMA_CLARO = new Set([915434391, 263885112]);
