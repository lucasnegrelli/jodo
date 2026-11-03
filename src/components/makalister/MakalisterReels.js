"use client";
// Makalister · reels. Os próprios clipes dele, um trecho por era. Cada era tem o tratamento de imagem E o layout do próprio clipe:
// 2026 néon + datamosh (blocos que congelam) · 2023 película · 2022 fotocópia com meio-tom · 2018 VHS (painel de fita) · 2017 noite de cinema (legenda).
// O cursor abre uma lupa que mostra a imagem limpa.
import { useEffect, useRef, useState } from "react";
import { Inter_Tight, JetBrains_Mono, Anton, VT323, Newsreader } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LANCAMENTOS } from "@/data/makalisterLancamentos";
import s from "@/styles/makalisterReels.module.css";

const ui = Inter_Tight({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--mk-ui" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mk-mono" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--mk-anton" });
const vt = VT323({ subsets: ["latin"], weight: "400", variable: "--mk-vt" });
const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--mk-serif" });

// modo = tratamento no shader: 0 néon+datamosh · 1 película · 2 fotocópia · 3 VHS · 4 noite
const REELS = [
  { k: "pipa", ano: "2026", data: "29.07.2026", t: "Linha de Pipa", modo: 0, yt: "ONLBrE1DWaQ", views: "9 mil", l: "Gravado no show de lançamento do DSQVDVQE, na Mvuka, em Florianópolis, na passagem de Luiz Barata e Nitcho." },
  { k: "filhos", ano: "2023", data: "13.01.2023", t: "Filhos", modo: 1, yt: "dKW9itSgaHE", views: "30 mil", l: "Single de janeiro de 2023." },
  { k: "lagrimas", ano: "2022", data: "11.11.2022", t: "Mais Que Lágrimas e Quartos Escuros", modo: 2, yt: "onQoVHIGyzo", views: "65 mil", l: "Dois singles num clipe só." },
  { k: "amorvirtual", ano: "2018", data: "09.01.2018", t: "Da Era do Amor Virtual", modo: 3, yt: "2BdVAm7qvk0", views: "436 mil", l: "Prod. Arit." },
  { k: "waves", ano: "2017", data: "08.10.2017", t: "Breaking the Waves", modo: 4, yt: "TEZQQn8MSJo", views: "187 mil", l: "Videoclipe oficial, dirigido por Lucas Negrelli." },
];
const DISCOS = LANCAMENTOS.filter((l) => l.faixas.length > 0);

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
// passo A: encaixa o vídeo na tela e deixa blocos "congelarem" no quadro anterior (datamosh de verdade)
const FRAG_A = `precision highp float;
uniform sampler2D uV,uPrev;uniform vec2 uRes,uVid;uniform float uT,uHold;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 fit(vec2 uv){float ar=uRes.x/uRes.y,vr=uVid.x/uVid.y;vec2 s=ar>vr?vec2(1.,vr/ar):vec2(ar/vr,1.);return (uv-.5)*s+.5;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;vec2 f=clamp(fit(uv),0.,1.);
  vec3 cur=texture2D(uV,vec2(f.x,1.-f.y)).rgb;
  vec2 b=floor(uv*vec2(20.,12.));float r=h(b+floor(uT*3.));
  float hold=step(1.-uHold,r);
  vec2 drift=vec2((h(b)-.5)*.01,-.004*hold);
  vec3 prev=texture2D(uPrev,clamp(uv+drift,0.,1.)).rgb;
  vec3 o=mix(cur,prev,hold*.97);
  gl_FragColor=vec4(o,1.);}`;
// passo B: o tratamento de cada era
const FRAG_B = `precision highp float;
uniform sampler2D uV,uTex;uniform vec2 uRes,uVid,uM;uniform float uT,uMode,uLens;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 fit(vec2 uv){float ar=uRes.x/uRes.y,vr=uVid.x/uVid.y;vec2 s=ar>vr?vec2(1.,vr/ar):vec2(ar/vr,1.);return (uv-.5)*s+.5;}
vec3 S(vec2 p){return texture2D(uTex,clamp(p,0.,1.)).rgb;}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
vec3 blur(vec2 uv,float r){vec3 a=vec3(0.);for(int i=0;i<8;i++){float t=float(i)*.785398;a+=S(uv+vec2(cos(t),sin(t))*r*vec2(uRes.y/uRes.x,1.));}return a/8.;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 f=clamp(fit(uv),0.,1.);vec3 orig=texture2D(uV,vec2(f.x,1.-f.y)).rgb;
  float gr=h(gl_FragCoord.xy+floor(uT*24.))-.5;
  vec3 c;
  if(uMode<.5){
    vec2 d=uv-.5;float ca=.004+.02*dot(d,d);
    c=vec3(S(uv+d*ca).r,S(uv).g,S(uv-d*ca).b);
    vec3 bl=blur(uv,.016);c+=max(bl-.4,0.)*1.7;
    c=mix(vec3(lum(c)),c,1.6)*1.1+gr*.07;
  }else if(uMode<1.5){
    vec2 q=uv;float dentro=step(.11,q.x)*step(q.x,.89)*step(.07,q.y)*step(q.y,.93);
    vec2 w=vec2((h(vec2(floor(uT*9.),1.))-.5)*.005,(h(vec2(floor(uT*9.),2.))-.5)*.007);
    vec3 col=dentro*S(q+w);
    vec2 pq=(q-vec2(.11,.07))/vec2(.78,.86);
    col=col*vec3(1.1,.94,.76)+gr*.14*dentro;
    col*=.92+.12*h(vec2(floor(uT*14.),0.));
    col+=vec3(1.,.5,.12)*smoothstep(.34,0.,pq.x)*(.28+.22*sin(uT*.8))*dentro;
    float esc=step(.9965,h(vec2(floor(pq.x*500.),floor(uT*10.))))*dentro;
    col=mix(col,vec3(.96,.9,.8),esc*.8);
    col*=1.-.6*pow(distance(pq,vec2(.5))*1.15,2.)*dentro;
    float fy=fract(q.y*7.);float furoE=step(.025,q.x)*step(q.x,.062)*step(.28,fy)*step(fy,.72);
    float furoD=step(.938,q.x)*step(q.x,.975)*step(.28,fy)*step(fy,.72);
    col=mix(col,vec3(.94,.89,.78),(furoE+furoD)*.92);c=col;
  }else if(uMode<2.5){
    float band=step(.978,h(vec2(floor(uv.y*60.),floor(uT*5.))));
    vec2 u=uv+vec2(band*.06,0.);vec3 col=S(u);
    float L=lum(col)+(h(floor(uv*uRes/2.))-.5)*.16;
    float ang=.5236;mat2 R=mat2(cos(ang),-sin(ang),sin(ang),cos(ang));
    vec2 gp=fract(R*(uv*uRes/6.5))-.5;
    float dots=step(length(gp),(1.-clamp(L,0.,1.))*.64);
    float tinta=mix(dots,1.,smoothstep(.2,.07,L));
    tinta=max(tinta,step(.997,h(vec2(floor(uv.x*uRes.x/2.),floor(uT*3.))))*.85);
    c=mix(vec3(.94,.92,.86),vec3(.045,.045,.05),clamp(tinta,0.,1.))+gr*.05;
  }else if(uMode<3.5){
    float wob=sin(uv.y*38.+uT*3.)*.0014+(h(vec2(floor(uv.y*180.),floor(uT*18.)))-.5)*.0035*step(.72,h(vec2(floor(uT*2.),5.)));
    float tr=abs(uv.y-(1.-fract(uT*.09)));float trk=smoothstep(.05,0.,tr);
    vec2 u=uv+vec2(wob+trk*(h(vec2(floor(uv.y*90.),floor(uT*30.)))-.4)*.07,0.);
    vec3 y=vec3(lum(S(u)));
    vec3 cb=(S(u+vec2(.007,0.))+S(u+vec2(.014,0.))+S(u+vec2(.021,0.)))/3.;
    vec3 col=y+(cb-vec3(lum(cb)))*1.35;
    col*=.84+.16*sin(uv.y*uRes.y*1.25);col=col*vec3(.86,1.05,1.02)+gr*.12+trk*.18*h(uv*uRes+uT);
    col*=1.-.7*pow(distance(uv,vec2(.5))*1.1,3.);c=col;
  }else{
    vec3 col=S(uv);float l=lum(col);
    vec3 st=vec3(0.);for(int i=-6;i<=6;i++){vec3 q=S(uv+vec2(float(i)*.011,0.));st+=max(q-.62,0.)*(1.-abs(float(i))/7.);}
    vec3 sh=vec3(.015,.11,.13),hi=vec3(1.12,.72,.42);
    col=mix(sh,hi,smoothstep(.0,.78,l))*(.8+l*.7);
    col+=st*vec3(.35,.75,1.)*.7+max(blur(uv,.014)-.5,0.)*vec3(1.,.55,.3);
    col+=gr*.1;col*=1.-.5*pow(distance(uv,vec2(.5))*1.1,2.);
    float bar=step(abs(uv.y-.5),.5*.745);c=col*bar;
  }
  float d=distance((uv-uM)*vec2(uRes.x/uRes.y,1.),vec2(0.));
  c=mix(c,orig,smoothstep(.2,.15,d)*uLens);
  gl_FragColor=vec4(c,1.);}`;

function Legenda({ r }) {
  const tc = useRef(null);
  useEffect(() => {
    if (r.modo !== 3 && r.modo !== 1) return; let n = 0;
    const id = setInterval(() => { n++; if (tc.current) tc.current.textContent = r.modo === 3 ? `0:${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}` : `${String(1 + (n % 24)).padStart(2, "0")} / 24`; }, r.modo === 3 ? 1000 : 120);
    return () => clearInterval(id);
  }, [r.modo]);
  const ver = <a className={s.ver} href={`https://www.youtube.com/watch?v=${r.yt}`} target="_blank" rel="noopener noreferrer">assistir inteiro no YouTube <i>↗</i></a>;
  if (r.modo === 0) return (
    <div className={s.lgNeon}>
      <p className={s.aoVivo}><i /> ao vivo · Mvuka · Florianópolis</p>
      <h2>{r.t}</h2>
      <p className={s.neonSub}>{r.l}</p>
      <div className={s.neonRod}>{ver}<span>{r.data} · {r.views} views</span></div>
      <p className={s.neonAno}>{r.ano}</p>
    </div>
  );
  if (r.modo === 1) return (
    <div className={s.lgFilme}>
      <p className={s.frame}>frame <b ref={tc}>01 / 24</b></p>
      <h2>{r.t}</h2>
      <p className={s.filmeSub}>{r.l}</p>
      <div className={s.filmeRod}>{ver}<span>{r.data} · {r.views} views</span></div>
      <p className={s.filmeAno}>{r.ano}</p>
    </div>
  );
  if (r.modo === 2) return (
    <div className={s.lgXerox}>
      <p className={s.carimbo}>{r.ano}</p>
      <h2><span>{r.t}</span></h2>
      <p className={s.xeroxSub}>{r.l}</p>
      <div className={s.xeroxRod}>{ver}<span>{r.data} · {r.views} views</span></div>
    </div>
  );
  if (r.modo === 3) return (
    <div className={s.lgVhs}>
      <p className={s.play}>▶ PLAY</p><p className={s.sp}>SP</p>
      <h2>{r.t}</h2>
      <p className={s.vhsSub}>{r.l}</p>
      <p className={s.vhsData}>{r.data.replaceAll(".", " ")} <b ref={tc}>0:00:00</b></p>
      <div className={s.vhsRod}>{ver}<span>{r.views} views</span></div>
    </div>
  );
  return (
    <div className={s.lgNoite}>
      <p className={s.noiteAno}>{r.ano}</p>
      <h2>{r.t}</h2>
      <p className={s.legendaFilme}>{r.l}</p>
      <div className={s.noiteRod}>{ver}<span>{r.data} · {r.views} views</span></div>
    </div>
  );
}

function Reel({ r }) {
  const box = useRef(null), cv = useRef(null);
  useEffect(() => {
    const c = cv.current, gl = c.getContext("webgl", { antialias: false, powerPreference: "high-performance" });
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const mkProg = (frag) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag)); gl.bindAttribLocation(p, 0, "p"); gl.linkProgram(p); return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null; };
    const pA = mkProg(FRAG_A), pB = mkProg(FRAG_B); if (!pA || !pB) return;
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uni = (p, ns) => Object.fromEntries(ns.map((n) => [n, gl.getUniformLocation(p, n)]));
    const UA = uni(pA, ["uV", "uPrev", "uRes", "uVid", "uT", "uHold"]), UB = uni(pB, ["uV", "uTex", "uRes", "uVid", "uM", "uT", "uMode", "uLens"]);
    const param = () => { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); };
    const tv = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tv); param();
    let W = 1, H = 1, tex = [], fbo = [], ping = 0;
    const aloca = () => {
      tex.forEach((t) => gl.deleteTexture(t)); fbo.forEach((f) => gl.deleteFramebuffer(f)); tex = []; fbo = [];
      for (let i = 0; i < 2; i++) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); param(); const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); tex.push(t); fbo.push(f); }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    const v = document.createElement("video"); v.src = `/mk/clips/${r.k}.mp4`; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto"; v.setAttribute("playsinline", ""); v.style.display = "none"; box.current.appendChild(v);
    let vis = false, raf = 0, vivo = true, mx = 0.5, my = 0.5, lens = 0, lensAlvo = 0; const t0 = performance.now();
    const mede = () => { W = Math.max(2, Math.round(box.current.clientWidth * dpr)); H = Math.max(2, Math.round(box.current.clientHeight * dpr)); c.width = W; c.height = H; aloca(); };
    mede();
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) { v.play().catch(() => {}); loop(); } else v.pause(); }, { threshold: 0.4 });
    io.observe(box.current);
    const move = (e) => { const q = box.current.getBoundingClientRect(); mx = (e.clientX - q.left) / q.width; my = 1 - (e.clientY - q.top) / q.height; lensAlvo = 1; };
    const sai = () => { lensAlvo = 0; };
    const loop = () => {
      cancelAnimationFrame(raf);
      const f = () => {
        if (!vivo || !vis) return; raf = requestAnimationFrame(f);
        const t = (performance.now() - t0) / 1000, vw = v.videoWidth || 854, vh = v.videoHeight || 480;
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tv); if (v.readyState >= 2) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v);
        const w = 1 - ping, rd = ping;
        gl.useProgram(pA); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[w]); gl.viewport(0, 0, W, H);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[rd]);
        gl.uniform1i(UA.uV, 0); gl.uniform1i(UA.uPrev, 1); gl.uniform2f(UA.uRes, W, H); gl.uniform2f(UA.uVid, vw, vh); gl.uniform1f(UA.uT, t); gl.uniform1f(UA.uHold, r.modo === 0 ? 0.07 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        lens += (lensAlvo - lens) * 0.12;
        gl.useProgram(pB); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[w]);
        gl.uniform1i(UB.uV, 0); gl.uniform1i(UB.uTex, 1); gl.uniform2f(UB.uRes, W, H); gl.uniform2f(UB.uVid, vw, vh); gl.uniform2f(UB.uM, mx, my); gl.uniform1f(UB.uT, t); gl.uniform1f(UB.uMode, r.modo); gl.uniform1f(UB.uLens, lens);
        gl.drawArrays(gl.TRIANGLES, 0, 3); ping = w;
      };
      f();
    };
    const bx = box.current; bx.addEventListener("pointermove", move); bx.addEventListener("pointerleave", sai); window.addEventListener("resize", mede);
    return () => { vivo = false; cancelAnimationFrame(raf); io.disconnect(); v.pause(); v.removeAttribute("src"); v.load(); v.remove(); bx.removeEventListener("pointermove", move); bx.removeEventListener("pointerleave", sai); window.removeEventListener("resize", mede); };
  }, [r]);
  return (
    <section id={`r-${r.k}`} className={s.reel} aria-label={`${r.t}, ${r.ano}`}>
      <div ref={box} className={s.tela}><canvas ref={cv} className={s.canvas} aria-hidden="true" /></div>
      <Legenda r={r} />
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
    <main ref={raiz} className={`${s.raiz} ${ui.variable} ${mono.variable} ${anton.variable} ${vt.variable} ${serif.variable}`}>
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
