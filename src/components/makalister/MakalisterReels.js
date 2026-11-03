"use client";
// Makalister · reels. Os próprios clipes dele, um trecho por era, cada um tratado como o próprio clipe trata a imagem
// (néon e datamosh em 2026, super-8 em 2023, fotocópia 1-bit em 2022, VHS em 2018, noite de cidade em 2017). O cursor abre uma lupa que mostra a imagem limpa.
import { useEffect, useRef, useState } from "react";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LANCAMENTOS } from "@/data/makalisterLancamentos";
import s from "@/styles/makalisterReels.module.css";

const ui = Inter_Tight({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--mk-ui" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mk-mono" });

// modo = tratamento no shader: 0 néon/datamosh · 1 super-8 · 2 fotocópia 1-bit · 3 VHS · 4 noite
const REELS = [
  { k: "pipa", ano: "2026", t: "Linha de Pipa", modo: 0, yt: "ONLBrE1DWaQ", views: "9 mil", l: "Gravado no show de lançamento do DSQVDVQE, na Mvuka, em Florianópolis, na passagem de Luiz Barata e Nitcho.", tag: "néon · datamosh" },
  { k: "filhos", ano: "2023", t: "Filhos", modo: 1, yt: "dKW9itSgaHE", views: "30 mil", l: "Single de janeiro de 2023.", tag: "super-8" },
  { k: "lagrimas", ano: "2022", t: "Mais Que Lágrimas e Quartos Escuros", modo: 2, yt: "onQoVHIGyzo", views: "65 mil", l: "Dois singles num clipe só.", tag: "fotocópia 1-bit" },
  { k: "amorvirtual", ano: "2018", t: "Da Era do Amor Virtual", modo: 3, yt: "2BdVAm7qvk0", views: "436 mil", l: "Prod. Arit.", tag: "VHS" },
  { k: "waves", ano: "2017", t: "Breaking the Waves", modo: 4, yt: "TEZQQn8MSJo", views: "187 mil", l: "Videoclipe oficial, dirigido por Lucas Negrelli.", tag: "noite de cidade" },
];
const DISCOS = LANCAMENTOS.filter((l) => l.faixas.length > 0);

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision highp float;
uniform sampler2D uV;uniform vec2 uRes,uVid,uM;uniform float uT,uMode,uLens;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 fit(vec2 uv){float ar=uRes.x/uRes.y,vr=uVid.x/uVid.y;vec2 s=ar>vr?vec2(1.,vr/ar):vec2(ar/vr,1.);return (uv-.5)*s+.5;}
vec3 tex(vec2 uv){return texture2D(uV,clamp(fit(uv),0.,1.)).rgb;}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;uv.y=1.-uv.y;
  vec3 orig=tex(uv),c=orig;
  float gr=h(gl_FragCoord.xy+floor(uT*24.))-.5;
  if(uMode<.5){
    vec2 b=floor(uv*vec2(26.,15.));float r=h(b+floor(uT*3.));
    vec2 off=r>.93?vec2((h(b)-.5)*.14,0.):vec2(0.);
    vec3 col=vec3(tex(uv+off+vec2(.005,0.)).r,tex(uv+off).g,tex(uv+off-vec2(.005,0.)).b);
    col=mix(col,1.-col,step(.988,h(b*1.7+floor(uT*2.)))*.6*smoothstep(.05,.3,lum(col)));
    c=mix(vec3(lum(col)),col,1.55)*1.12;c+=gr*.07;
  }else if(uMode<1.5){
    vec2 q=uv;bool dentro=q.x>.11&&q.x<.89&&q.y>.07&&q.y<.93;
    vec2 pq=(q-vec2(.11,.07))/vec2(.78,.86);pq+=vec2((h(vec2(floor(uT*8.),1.))-.5)*.006,(h(vec2(floor(uT*8.),2.))-.5)*.006);
    vec3 col=dentro?tex(pq):vec3(0.);
    col=mix(col,col*vec3(1.1,.95,.78),.6)+gr*.12;
    col*=1.-.55*pow(distance(pq,vec2(.5))*1.2,2.)*step(0.,1.);
    float fx=q.x<.07?1.:0.;
    float furo=step(.025,q.x)*step(q.x,.062)*step(.28,fract(q.y*7.))*step(fract(q.y*7.),.72);
    col=mix(col,vec3(.93,.88,.78),furo*.9);
    float furo2=step(.938,q.x)*step(q.x,.975)*step(.28,fract(q.y*7.))*step(fract(q.y*7.),.72);
    col=mix(col,vec3(.93,.88,.78),furo2*.9);c=col;
  }else if(uMode<2.5){
    float band=step(.975,h(vec2(floor(uv.y*70.),floor(uT*5.))));
    vec3 col=tex(uv+vec2(band*.07,0.));
    float g=lum(col)+gr*.5+(h(floor(uv*vec2(uRes.x/2.,uRes.y/2.)))-.5)*.12;
    float v=step(.46,g);
    c=mix(vec3(.04,.04,.045),vec3(.94,.93,.89),v);
  }else if(uMode<3.5){
    float j=(h(vec2(floor(uv.y*240.),floor(uT*20.)))-.5)*.004*step(.7,h(vec2(floor(uT*3.),3.)));
    float tr=smoothstep(.0,.04,abs(uv.y-fract(uT*.13))-.0);
    vec2 u2=uv+vec2(j+(1.-tr)*.03,0.);
    vec3 col=vec3(tex(u2+vec2(.004,0.)).r,tex(u2).g,tex(u2-vec2(.004,0.)).b);
    col*=.82+.18*sin(uv.y*uRes.y*1.3);col=mix(col,col*vec3(.8,1.05,1.0),.5)+gr*.1;
    col*=1.-.7*pow(distance(uv,vec2(.5))*1.1,3.);c=col;
  }else{
    vec3 col=orig;float l=lum(col);
    vec3 sh=vec3(.02,.13,.15),hi=vec3(1.1,.72,.45);
    col=mix(sh,hi,smoothstep(.0,.8,l))*(.85+l*.6);
    col=mix(col,vec3(.9,.1,.08),smoothstep(.1,.5,col.r-col.b)*.25);
    col+=gr*.12;col*=1.-.55*pow(distance(uv,vec2(.5))*1.1,2.);c=col;
  }
  float d=distance((uv-uM)*vec2(uRes.x/uRes.y,1.),vec2(0.));
  c=mix(c,orig,smoothstep(.2,.15,d)*uLens);
  gl_FragColor=vec4(c,1.);}`;

function Reel({ r }) {
  const box = useRef(null), cv = useRef(null);
  useEffect(() => {
    const c = cv.current, gl = c.getContext("webgl", { antialias: false, powerPreference: "high-performance" });
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(["uV", "uRes", "uVid", "uM", "uT", "uMode", "uLens"].map((n) => [n, gl.getUniformLocation(pr, n)]));
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const v = document.createElement("video"); v.src = `/mk/clips/${r.k}.mp4`; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto"; v.setAttribute("playsinline", ""); v.style.display = "none"; box.current.appendChild(v);
    let vis = false, raf = 0, vivo = true, mx = 0.5, my = 0.5, lens = 0, lensAlvo = 0; const t0 = performance.now();
    const mede = () => { c.width = Math.round(box.current.clientWidth * dpr); c.height = Math.round(box.current.clientHeight * dpr); gl.viewport(0, 0, c.width, c.height); };
    mede();
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) { v.play().catch(() => {}); loop(); } else v.pause(); }, { threshold: 0.4 });
    io.observe(box.current);
    const move = (e) => { const q = box.current.getBoundingClientRect(); mx = (e.clientX - q.left) / q.width; my = (e.clientY - q.top) / q.height; lensAlvo = 1; };
    const sai = () => { lensAlvo = 0; };
    const loop = () => { cancelAnimationFrame(raf); const f = () => { if (!vivo || !vis) return; raf = requestAnimationFrame(f); if (v.readyState >= 2) { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v); } lens += (lensAlvo - lens) * 0.12; gl.uniform1i(U.uV, 0); gl.uniform2f(U.uRes, c.width, c.height); gl.uniform2f(U.uVid, v.videoWidth || 854, v.videoHeight || 480); gl.uniform2f(U.uM, mx, my); gl.uniform1f(U.uT, (performance.now() - t0) / 1000); gl.uniform1f(U.uMode, r.modo); gl.uniform1f(U.uLens, lens); gl.drawArrays(gl.TRIANGLES, 0, 3); }; f(); };
    const bx = box.current; bx.addEventListener("pointermove", move); bx.addEventListener("pointerleave", sai); window.addEventListener("resize", mede);
    return () => { vivo = false; cancelAnimationFrame(raf); io.disconnect(); v.pause(); v.removeAttribute("src"); v.load(); v.remove(); bx.removeEventListener("pointermove", move); bx.removeEventListener("pointerleave", sai); window.removeEventListener("resize", mede); };
  }, [r]);
  return (
    <section id={`r-${r.k}`} className={s.reel} aria-label={`${r.t}, ${r.ano}`}>
      <div ref={box} className={s.tela}><canvas ref={cv} className={s.canvas} aria-hidden="true" /></div>
      <div className={s.legenda}>
        <p className={s.ano}>{r.ano}</p>
        <h2>{r.t}</h2>
        <p className={s.sobre}>{r.l}</p>
        <div className={s.rodape}>
          <a href={`https://www.youtube.com/watch?v=${r.yt}`} target="_blank" rel="noopener noreferrer">assistir inteiro no YouTube <i>↗</i></a>
          <span>{r.views} views · tratamento: {r.tag}</span>
        </div>
      </div>
      <p className={s.lupa} aria-hidden="true">passe o cursor: a lupa mostra a imagem limpa</p>
    </section>
  );
}

export default function MakalisterReels() {
  const raiz = useRef(null); const [at, setAt] = useState(REELS[0].k);
  useEffect(() => {
    const el = raiz.current, secs = [...el.querySelectorAll("section[id^='r-'], #discos")];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setAt(e.target.id.replace("r-", "")); }), { root: el, threshold: 0.55 });
    secs.forEach((x) => io.observe(x)); return () => io.disconnect();
  }, []);
  const vai = (k) => document.getElementById(k === "discos" ? "discos" : `r-${k}`)?.scrollIntoView({ behavior: "smooth" });
  return (
    <main ref={raiz} className={`${s.raiz} ${ui.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Makalister" cor="#ece8de" plano escala={1.05} />
      <img className={s.assinatura} src="/mk/assinatura.png" alt="Makalister" width="900" height="168" />
      <nav className={s.pontos} aria-label="Eras">
        {[...REELS.map((r) => [r.k, r.ano]), ["discos", "discos"]].map(([k, rot]) => <button key={k} type="button" className={at === k ? s.on : ""} onClick={() => vai(k)} aria-label={`Ir para ${rot}`}><span>{rot}</span><i /></button>)}
      </nav>
      {REELS.map((r) => <Reel key={r.k} r={r} />)}
      <section id="discos" className={s.discos} aria-label="Discos e EPs">
        <h2>discos e EPs</h2>
        <ul>
          {DISCOS.map((l) => (
            <li key={l.id}><a href={`https://www.deezer.com/album/${l.id}`} target="_blank" rel="noopener noreferrer"><img src={l.img} alt={`Capa de ${l.t}`} width="900" height="900" loading="lazy" decoding="async" /><b>{l.t}</b><i>{l.d.slice(0, 4)} · {l.tipo}</i></a></li>
          ))}
        </ul>
        <p className={s.fim}>Shows e contato: contatoalmanak@gmail.com · Dados: Deezer, SoundCloud e canal Almanak.</p>
      </section>
    </main>
  );
}
