"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import * as THREE from "three";
import { Space_Mono, Unbounded, Bebas_Neue, Inter_Tight } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { BEATS } from "@/data/headbBeats";
import s from "@/styles/headb.module.css";

/*
  headB (Bruno Saraiva): MC e beatmaker, "salvador / brazil, Canada" no SoundCloud dele.
  Página-portfólio em cenas de tela cheia, cada uma com a linguagem do que ela mostra:
  0 o espelho (a piada dele: "fale headB 5x em frente ao espelho", com a assinatura vetorizada da capa de "latão medicinal")
  1 o EP 33% de acidez (líquido ácido nas cores da capa, "33%" enchendo)
  2 as beat tapes (sleeves numa caixa de discos, passadas com a rolagem)
  3 o arquivo (os 73 beats do SoundCloud como barras: data x plays)
  4 vídeos (trecho mudo rodando ao fundo) · 5 fim (participações, links)
  Fontes dos dados: SoundCloud, YouTube e Instagram dele.
*/
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--hb-mono", display: "swap" });
const disp = Unbounded({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--hb-disp", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--hb-bebas", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--hb-sans", display: "swap" });

const SC = "https://soundcloud.com/brunoheadb";
const IG = "https://www.instagram.com/brunoheadb/";
const YT = "https://www.youtube.com/user/darksaraiva";
const FB = "https://www.facebook.com/brunoheadb";
const EP_YT = "SujCSOWATx8";
const PER = 2.2, N = 6;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const EP = [
  { t: "reiterando", s: 0 }, { t: "ctrl c ctrl v", s: 95 }, { t: "blockchain", c: "Matheus Coringa", s: 211 }, { t: "latão medicinal", s: 376 },
  { t: "percocet genérico", c: "Dartha", s: 501 }, { t: "carta", s: 620 }, { t: "marcha automática", s: 712 },
];
const EP_TOTAL = 816;

// as beat tapes: abrem o vídeo (yt) ou o set/faixa no SoundCloud (sc)
const TAPES = [
  { t: "vandalismo", n: "beat tape · 2018", d: "com apollo____808", img: "vandalismo", yt: "Ty0Fd8nW8GA" },
  { t: "namekusei", n: "beat tape · 2018", d: "samples da trilha sonora de Dragon Ball", img: "namekusei", yt: "p1ehvVB8194" },
  { t: "beat tape", n: "2017", d: "trxp trxp trxp", img: "tape-janela", yt: "buDMQRfkzpA" },
  { t: "carolina beat tape", n: "set · 8 faixas", d: "SoundCloud", img: "carolina", sc: "brunoheadb/sets/carolina-beat-tape" },
  { t: "trippin' n trappin'", n: "set · 2 faixas", d: "SoundCloud", img: "trippin", sc: "brunoheadb/sets/trippin-n-trappin" },
  { t: "gxng trxp 2", n: "set · 4 faixas", d: "SoundCloud", img: "selfie", sc: "brunoheadb/sets/gxng-trxp-2" },
  { t: "sintéticos & sintéticos", n: "set · 6 faixas", d: "SoundCloud", img: "sinteticos", sc: "brunoheadb/sets/sinteticos-sinteticos" },
  { t: "cera", n: "faixa · 2018", d: "SoundCloud", img: "cera", sc: "brunoheadb/headb-cera" },
  { t: "latão medicinal", n: "faixa · 2018", d: "faz parte do EP 33% de acidez", img: "latao", sc: "brunoheadb/headb-latao-medicinal" },
];

const VIDEOS = [
  { id: "SujCSOWATx8", t: "33% de acidez", m: "EP · 2020" }, { id: "dfnxciABmbU", t: "1nve$timento 1nten$ivo", m: "2017" },
  { id: "p-kaY03zO8k", t: "poca as bolhas", m: "com Darthayan · 2017" }, { id: "VR6-W1kAFac", t: "surfa", m: "prod. Eli Five · 2017" },
  { id: "bh_WT04I3ow", t: "teia", m: "2017" }, { id: "buDMQRfkzpA", t: "beat tape", m: "2017" },
  { id: "p1ehvVB8194", t: "namekusei beat tape", m: "2018" }, { id: "Ty0Fd8nW8GA", t: "vandalismo beat tape", m: "2018" },
  { id: "x4sYhECgC_M", t: "type beat o kct", m: "2018" }, { id: "_P46-LlREtU", t: "alcoengel", m: "2020" },
];

// quem aparece nos trabalhos dele (créditos das descrições dos vídeos); o nome abre a faixa
const CREDITOS = [
  // no que é dele (descrições dos vídeos)
  { n: "Matheus Coringa", f: "blockchain, no EP", yt: EP_YT, t: 211 }, { n: "Dartha", f: "percocet genérico, no EP", yt: EP_YT, t: 501 },
  { n: "apollo____808", f: "vandalismo beat tape", yt: "Ty0Fd8nW8GA" }, { n: "Eli Five", f: "surfa (o beat)", yt: "VR6-W1kAFac" },
  { n: "Cristóvão Buarque", f: "vandalismo beat tape", yt: "Ty0Fd8nW8GA" }, { n: "Onoe Caponoe", f: "Wild In The Streets (remix do headB)", sc: "brunoheadb/onoe-caponoe-wild-in-the-streets-remix-by-brunoheadb" },
  { n: "cinemavicio", f: "arte do EP", yt: EP_YT }, { n: "dudubierrenbach", f: "vídeo do EP", yt: EP_YT },
  // no que é de outros (créditos dos vídeos e reposts dele no SoundCloud)
  { n: "Darthayan", f: "Intro = Suujo e Diamante (beat do headB, 2017)", yt: "cBoJMSOeC4I" }, { n: "Dartha", f: "Devastado (ft. headB, 2021)", yt: "MUj7DNslKbc" },
  { n: "apollo____808", f: "kdmeutubo (com headB, 2019)", yt: "Yai9n39gKzc" }, { n: "Matheus Coringa", f: "Disconnect (2018)", yt: "jeVfgGdVJz8" },
  { n: "DOIS AS", f: "Chore (beat do headB, 2019)", yt: "8euFOQgsqS4" }, { n: "Quinta Esquina", f: "Sumo do Sujo, part. Doi$ A$ (beat do headB)", sc: "malocarec/quinta-esquina-sumo-do-sujo-part-2as-wav" },
  { n: "Ares, o Alef", f: "ALeGRA (beat do headB)", sc: "user-987476897/ares-o-alef-alegra-beat-do" }, { n: "MD55", f: "1D107IZ3, 53 (feat. headB)", sc: "mrdooback/md55-feat-headb-1d107iz3-53" },
  { n: "Imundo$ Temerário", f: "beat do headB", sc: "victor-nascimento-115/imundo-temerario-prod-headb" },
  { n: "Neandertal x Alec$anDrilL", f: "Flash (beat do headB, 2021)", yt: "DqJbXwXvZm4" }, { n: "MC Piaget", f: "Fórmula do Lucro (produção do headB, 2025)", yt: "P4hI9E1bTOg" },
  { n: "82", f: "Vertigem (o beat é do headB)", yt: "2o5OWoEM_tA" }, { n: "Rap Delivery", f: "Cash, no Vol. 2", href: "/artistas/rap-delivery" },
];

const TOTAL_PLAYS = BEATS.reduce((a, b) => a + b.p, 0);
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const dataBr = (d) => `${MESES[+d.slice(4, 6) - 1]} ${d.slice(0, 4)}`;
const mil = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")} mil` : String(n));
const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.round(x % 60)).padStart(2, "0")}`;

function embedDe(a) {
  if (a.yt) return { tipo: "yt", src: `https://www.youtube-nocookie.com/embed/${a.yt}?autoplay=1&rel=0&start=${a.t || 0}`, fora: `https://www.youtube.com/watch?v=${a.yt}` };
  if (a.sc) return { tipo: "sc", src: `https://w.soundcloud.com/player/?url=${encodeURIComponent("https://soundcloud.com/" + a.sc)}&auto_play=true&hide_related=true&show_comments=false&visual=false&show_teaser=false`, fora: `https://soundcloud.com/${a.sc}` };
  return null;
}

/* o líquido ácido do EP: ruído em camadas nas cores da capa (lima, violeta, laranja) */
function acido(el, st) {
  const r = new THREE.WebGLRenderer({ antialias: false });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
  el.appendChild(r.domElement); r.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  const cena = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const u = { uT: { value: 0 }, uR: { value: new THREE.Vector2(1, 1) }, uM: { value: new THREE.Vector2() }, uU: { value: 0 } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }",
    fragmentShader: `precision highp float; uniform float uT,uU; uniform vec2 uR,uM; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*n(p); p*=2.02; a*=.5; } return v; }
      void main(){ vec2 uv=vUv*uR/min(uR.x,uR.y); float t=uT*.06;
        vec2 q=vec2(fbm(uv*1.5+t),fbm(uv*1.5+vec2(5.2,1.3)-t));
        vec2 r=vec2(fbm(uv*2.+q*3.+t*1.3+uM*.5),fbm(uv*2.+q*3.+vec2(1.7,9.2)-t));
        float f=fbm(uv*2.+r*2.8);
        vec3 c=mix(vec3(.03,.01,.08),vec3(.38,.13,.82),smoothstep(.15,.6,f));
        c=mix(c,vec3(.78,1.,.0),smoothstep(.5,.86,f*f*2.1+r.x*.35));
        c=mix(c,vec3(1.,.5,.08),smoothstep(.72,1.,r.y*f*2.2));
        c*=.55+.45*uU; gl_FragColor=vec4(c,1.); }`,
  });
  cena.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m));
  const fit = () => { const w = el.clientWidth || 1, hh = el.clientHeight || 1; r.setSize(w, hh, false); u.uR.value.set(w, hh); };
  fit(); const ro = new ResizeObserver(fit); ro.observe(el);
  let raf = 0, vivo = true; const t0 = performance.now();
  const laco = (now) => {
    if (!vivo) return; raf = requestAnimationFrame(laco);
    if (!st.vis) return;
    u.uT.value = (now - t0) / 1000; u.uU.value = Math.min(1, st.u * 4 + 0.3);
    u.uM.value.x += (st.px - u.uM.value.x) * 0.05; u.uM.value.y += (st.py - u.uM.value.y) * 0.05;
    r.render(cena, cam);
  };
  raf = requestAnimationFrame(laco);
  return () => { vivo = false; cancelAnimationFrame(raf); ro.disconnect(); m.dispose(); r.dispose(); r.domElement.remove(); };
}

function Acido({ st }) {
  const ref = useRef(null);
  useEffect(() => acido(ref.current, st), [st]);
  return <div ref={ref} className={s.acido} aria-hidden="true" />;
}

export default function HeadbPagina() {
  const trilha = useRef(null), palco = useRef(null), cenas = useRef([]), lenis = useRef(null), ups = useRef({}), ptr = useRef({ px: 0, py: 0 });
  const sts = useRef(null);
  if (!sts.current) sts.current = Array.from({ length: N }, () => ({ u: 0, vis: false, px: 0, py: 0 }));
  const [player, setPlayer] = useState(null);
  const [atual, setAtual] = useState(0);
  const [monta, setMonta] = useState("0,1");
  const playerRef = useRef(null); playerRef.current = player;
  const abre = (a) => { const e = embedDe(a); if (e) setPlayer(e); };
  const fecha = () => setPlayer(null);
  const reg = (k, fn) => { ups.current[k] = fn; };
  const tem = (k) => monta.split(",").includes(String(k));
  const refCena = (k) => (el) => { cenas.current[k] = el; };

  // o motor: uma câmera que percorre a trilha; cada cena entra por cima da anterior, dissolvendo
  useEffect(() => {
    const b = document.body.style.overflowX, h = document.documentElement.style.overflowX;
    document.body.style.overflowX = "clip"; document.documentElement.style.overflowX = "clip";
    const lx = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 }); lenis.current = lx;
    let raf = 0, ultMonta = "", ultAtual = -1;
    const quadro = (t) => {
      raf = requestAnimationFrame(quadro); lx.raf(t);
      const tr = trilha.current; if (!tr) return;
      const rc = tr.getBoundingClientRect(), vh = innerHeight;
      const p = clamp(-rc.top / (PER * vh), 0, N - 0.001), dentro = rc.top < vh && rc.bottom > 0;
      const rs = Array.from({ length: N }, (_, k) => (k === 0 ? 1 : clamp((p - (k - 0.3)) / 0.3)));
      const mt = [];
      for (let k = 0; k < N; k++) {
        const el = cenas.current[k]; if (!el) continue;
        const u = clamp(p - k), vis = dentro && rs[k] > 0 && !(k < N - 1 && rs[k + 1] >= 1);
        el.style.visibility = vis ? "visible" : "hidden";
        if (vis) { el.style.opacity = rs[k].toFixed(3); el.style.setProperty("--u", u.toFixed(4)); el.style.setProperty("--r", rs[k].toFixed(3)); }
        const st = sts.current[k]; st.u = u; st.vis = vis; st.px = ptr.current.px; st.py = ptr.current.py;
        if (vis) ups.current[k]?.(u);
        if (Math.abs(k - p) < 1.6) mt.push(k);
      }
      const m = mt.join(","); if (m !== ultMonta) { ultMonta = m; setMonta(m); }
      const a = Math.min(N - 1, Math.floor(p + 0.35)); if (a !== ultAtual) { ultAtual = a; setAtual(a); }
    };
    raf = requestAnimationFrame(quadro);
    const esc = (e) => { if (e.key === "Escape" && playerRef.current) fecha(); };
    addEventListener("keydown", esc);
    return () => { cancelAnimationFrame(raf); lx.destroy(); lenis.current = null; removeEventListener("keydown", esc); document.body.style.overflowX = b; document.documentElement.style.overflowX = h; };
  }, []);
  useEffect(() => { if (player) lenis.current?.stop(); else lenis.current?.start(); }, [player]);

  const vai = (k, frac = 0) => { const y = trilha.current.getBoundingClientRect().top + scrollY + (k + frac) * PER * innerHeight + 2; lenis.current?.scrollTo(y, { duration: 1.6 }); };
  const mexe = (e) => { ptr.current = { px: (e.clientX / innerWidth) * 2 - 1, py: (e.clientY / innerHeight) * 2 - 1 }; };

  /* 0 · o espelho ---------------------------------------------------------------------- */
  const tagsA = useRef([]), tagsB = useRef([]), raizEsp = useRef(null), contagem = useRef(null);
  const POS = [{ x: 0, y: 0, r: -3, e: 1 }, { x: -17, y: -22, r: 6, e: 0.62 }, { x: 19, y: -30, r: -9, e: 0.5 }, { x: -22, y: 20, r: 8, e: 0.44 }, { x: 24, y: 24, r: -6, e: 0.4 }];
  useEffect(() => {
    reg(0, (u) => {
      const n = u * 5.2 + 0.85, pronto = n >= 5.15;
      POS.forEach((p, i) => {
        const a = clamp(n - i), tf = `translate(${p.x}%, ${p.y + (1 - a) * 8}%) rotate(${p.r}deg) scale(${(0.86 + 0.14 * a) * p.e})`;
        if (tagsA.current[i]) { tagsA.current[i].style.opacity = a; tagsA.current[i].style.transform = tf; }
        if (tagsB.current[i]) { tagsB.current[i].style.opacity = a; tagsB.current[i].style.transform = tf; }
      });
      if (contagem.current) contagem.current.textContent = `${String(Math.min(5, Math.floor(n))).padStart(2, "0")}/05`;
      raizEsp.current?.classList.toggle(s.pronto, pronto);
    });
  });

  /* 1 · 33% de acidez ------------------------------------------------------------------ */
  const raizEp = useRef(null);
  useEffect(() => {
    reg(1, (u) => { raizEp.current?.style.setProperty("--lv", (33 * clamp((u - 0.04) / 0.45)).toFixed(1)); });
  });

  /* 2 · as beat tapes: sleeves numa caixa ---------------------------------------------- */
  const luvas = useRef([]), [luva, setLuva] = useState(0), luvaRef = useRef(0);
  useEffect(() => {
    reg(2, (u) => {
      const pos = clamp((u - 0.1) / 0.78) * (TAPES.length - 1), w = innerWidth, sp = Math.min(250, w * 0.3);
      luvas.current.forEach((el, i) => {
        if (!el) return;
        const d = i - pos, ad = Math.abs(d), push = Math.sign(d) * Math.min(ad, 1) * sp * 0.55;
        el.style.transform = `translate3d(${d * sp + push}px, ${ad * 6}px, ${-ad * 150}px) rotateY(${-clamp(d, -1.6, 1.6) * 40}deg) scale(${1 - Math.min(ad, 3) * 0.05})`;
        el.style.opacity = String(clamp(1.15 - ad * 0.24)); el.style.zIndex = String(100 - Math.round(ad * 10));
      });
      const idx = Math.round(pos); if (idx !== luvaRef.current) { luvaRef.current = idx; setLuva(idx); }
    });
  });

  /* 3 · o arquivo: 73 beats, data x plays ---------------------------------------------- */
  const raizArq = useRef(null), [hov, setHov] = useState(null);
  useEffect(() => { reg(3, (u) => { raizArq.current?.style.setProperty("--rise", clamp((u - 0.05) / 0.4).toFixed(3)); }); });
  const maxP = Math.max(...BEATS.map((b) => b.p));
  const anos = []; BEATS.forEach((b, i) => { const a = b.d.slice(0, 4); if (!anos.find((x) => x.a === a)) anos.push({ a, i }); });
  const anosVis = anos.filter((x, k) => k === 0 || (x.i - anos[k - 1].i) / BEATS.length >= 0.1);
  const leitura = hov != null ? BEATS[hov] : null;

  /* 4 · vídeos ------------------------------------------------------------------------- */
  const [vid, setVid] = useState(VIDEOS[0].id);

  return (
    <main className={`${s.raiz} ${mono.variable} ${disp.variable} ${bebas.variable} ${sans.variable}`} onPointerMove={mexe}>
      <VoltarJodo />
      <MarcaTopo nome="headB" cor="#c8ff00" plano escala={1.1} />
      <h1 className={s.sr}>headB, Bruno Saraiva: MC e beatmaker</h1>

      <div ref={trilha} className={s.trilha} style={{ height: `${N * PER * 100}svh` }}>
        <div ref={palco} className={s.palco}>

          {/* 0 · o espelho */}
          <section ref={refCena(0)} className={`${s.cena} ${s.esp}`} aria-label="headB">
            <div ref={raizEsp} className={s.espRaiz}>
              <p className={s.ritual}>fale headB 5x em frente ao espelho</p>
              <div className={s.horizonte} />
              <div className={s.grupo}>{POS.map((_, i) => <i key={i} ref={(el) => (tagsA.current[i] = el)} className={s.tag} />)}</div>
              <div className={`${s.grupo} ${s.refl}`} aria-hidden="true">{POS.map((_, i) => <i key={i} ref={(el) => (tagsB.current[i] = el)} className={s.tag} />)}</div>
              <p ref={contagem} className={s.contagem}>00/05</p>
              <div className={s.apresenta}>
                <p className={s.quem}>Bruno Saraiva · MC e beatmaker · Salvador / Canadá</p>
                <p className={s.numeros}>{BEATS.length} beats no SoundCloud · {mil(TOTAL_PLAYS)} plays · desde 2017</p>
                <p className={s.links}><a href={SC} target="_blank" rel="noopener noreferrer">SoundCloud ↗</a><a href={YT} target="_blank" rel="noopener noreferrer">YouTube ↗</a><a href={IG} target="_blank" rel="noopener noreferrer">Instagram ↗</a></p>
              </div>
              <p className={s.rola}>rola ↓</p>
            </div>
          </section>

          {/* 1 · 33% de acidez */}
          <section ref={refCena(1)} className={`${s.cena} ${s.ep}`} aria-label="33% de acidez">
            {tem(1) ? <Acido st={sts.current[1]} /> : null}
            <div ref={raizEp} className={s.epRaiz}>
              <button className={s.epCapa} onClick={() => abre({ yt: EP_YT })} aria-label="Ver o EP 33% de acidez"><img src="/hb/ep.jpg" alt="Capa do EP 33% de acidez: frutas e flores em cores ácidas, por cinemavicio" draggable="false" /></button>
              <div className={s.epTxt}>
                <p className={s.rot}>EP · jun 2020 · 100% independente · 808 motivos</p>
                <h2 className={s.epNum}><span>33%</span> de acidez</h2>
                <ol className={s.epFaixas}>
                  {EP.map((f, i) => (
                    <li key={f.t}><button onClick={() => abre({ yt: EP_YT, t: f.s })}><i>{String(i + 1).padStart(2, "0")}</i><b>{f.t}</b>{f.c ? <span>com {f.c}</span> : null}<em>{mmss((EP[i + 1] ? EP[i + 1].s : EP_TOTAL) - f.s)}</em></button></li>
                  ))}
                </ol>
                <p className={s.epCred}>arte @cinemavicio · vídeo @dudubierrenbach</p>
              </div>
            </div>
          </section>

          {/* 2 · as beat tapes */}
          <section ref={refCena(2)} className={`${s.cena} ${s.tapes}`} aria-label="Beat tapes">
            <p className={s.rotTopo}>beat tapes e sets · 2017 em diante</p>
            <div className={s.caixa}>
              {TAPES.map((t, i) => (
                <button key={t.t} ref={(el) => (luvas.current[i] = el)} className={s.luva} onClick={() => (i === luva ? abre(t) : vai(2, 0.1 + (i / (TAPES.length - 1)) * 0.78))} aria-label={t.t}>
                  <img src={`/hb/${t.img}.jpg`} alt="" draggable="false" loading="lazy" />
                </button>
              ))}
            </div>
            <div className={s.tapeInfo}>
              <h2>{TAPES[luva].t}</h2>
              <p>{TAPES[luva].n} · {TAPES[luva].d}</p>
              <button onClick={() => abre(TAPES[luva])}>{TAPES[luva].yt ? "Ver o vídeo" : "Ouvir no SoundCloud"}</button>
            </div>
            <div className={s.lip} />
          </section>

          {/* 3 · o arquivo */}
          <section ref={refCena(3)} className={`${s.cena} ${s.arq}`} aria-label="O arquivo de beats">
            <div ref={raizArq} className={s.arqRaiz}>
              <p className={s.rot}>o arquivo · cada barra é um beat · altura = plays · clique para ouvir</p>
              <h2 className={s.arqLeitura}>{leitura ? <>{leitura.t}<small>{dataBr(leitura.d)} · {mil(leitura.p)} plays</small></> : <>{BEATS.length} beats<small>{mil(TOTAL_PLAYS)} plays · de {dataBr(BEATS[0].d)} a {dataBr(BEATS[BEATS.length - 1].d)}</small></>}</h2>
              <div className={s.barras} onPointerLeave={() => setHov(null)}>
                {BEATS.map((b, i) => (
                  <button key={b.u} className={`${s.barra} ${hov === i ? s.barraOn : ""}`} style={{ "--h": 6 + 94 * Math.pow(b.p / maxP, 0.5), "--i": i }} onPointerEnter={() => setHov(i)} onFocus={() => setHov(i)} onClick={() => abre({ sc: b.u })} aria-label={`${b.t}, ${b.p} plays`} />
                ))}
              </div>
              <div className={s.anos}>{anosVis.map((a) => <span key={a.a} style={{ left: `${(a.i / BEATS.length) * 100}%` }}>{a.a}</span>)}</div>
            </div>
          </section>

          {/* 4 · vídeos */}
          <section ref={refCena(4)} className={`${s.cena} ${s.vid}`} aria-label="Vídeos">
            {VIDEOS.map((v) => <div key={v.id} className={`${s.vidFundo} ${vid === v.id ? s.vidOn : ""}`} style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/hqdefault.jpg)` }} />)}
            {tem(4) ? <video key={vid} className={s.vidPrev} src={`/hb/clips/${vid}.mp4`} autoPlay muted loop playsInline preload="auto" aria-hidden="true" /> : null}
            <div className={s.vidTxt}>
              <p className={s.rot}>no canal dele · 2017–2020</p>
              <ul>{VIDEOS.map((v) => <li key={v.id} className={vid === v.id ? s.vidOn : ""}><button onPointerEnter={() => setVid(v.id)} onFocus={() => setVid(v.id)} onClick={() => abre({ yt: v.id })}><b>{v.t}</b><i>{v.m}</i></button></li>)}</ul>
              <p className={s.vidCanal}><a href={YT} target="_blank" rel="noopener noreferrer">Ver o canal inteiro no YouTube ↗</a></p>
            </div>
          </section>

          {/* 5 · fim: participações, links e o convite para pedir um beat */}
          <section ref={refCena(5)} className={`${s.cena} ${s.fim}`} aria-label="Ouvir e seguir">
            <i className={s.fimTag} aria-hidden="true" />
            <div className={s.part}>
              <p className={s.rot}>Feats e prods</p>
              <ul>{CREDITOS.map((c) => (
                <li key={c.n + c.f}>
                  {c.href ? <Link href={c.href}><b>{c.n}</b><span>{c.f}</span></Link> : <button onClick={() => abre(c.yt ? { yt: c.yt, t: c.t } : { sc: c.sc })}><b>{c.n}</b><span>{c.f}</span></button>}
                </li>
              ))}</ul>
            </div>
            <nav className={s.fimLinks} aria-label="Onde ouvir e seguir">
              <a href={SC} target="_blank" rel="noopener noreferrer"><b>SoundCloud</b><span>os {BEATS.length} beats</span></a>
              <a href={YT} target="_blank" rel="noopener noreferrer"><b>YouTube</b><span>Bruno headB · os vídeos</span></a>
              <a href={IG} target="_blank" rel="noopener noreferrer"><b>Instagram</b><span>@brunoheadb</span></a>
              <a href={FB} target="_blank" rel="noopener noreferrer"><b>Facebook</b><span>brunoheadb</span></a>
            </nav>
            <p className={s.fimBeats}>Quer um beat? <a href={IG} target="_blank" rel="noopener noreferrer">Chama no Instagram ↗</a></p>
            <button className={s.fimTopo} onClick={() => lenis.current?.scrollTo(0, { duration: 1.8 })}><span aria-hidden="true">↑</span> Voltar ao topo</button>
          </section>

          <nav className={s.indice} aria-label="Partes">
            {["headB", "33% de acidez", "Beat tapes", "O arquivo", "Vídeos", "Fim"].map((n, k) => <button key={n} className={atual === k ? s.indiceOn : ""} onClick={() => vai(k)} aria-label={n}><span>{n}</span></button>)}
          </nav>
        </div>
      </div>

      {player && (
        <div className={s.player} onClick={fecha}>
          <div className={player.tipo === "sc" ? s.sc : s.yt} onClick={(e) => e.stopPropagation()}>
            <iframe src={player.src} title="Player" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
          </div>
          <p onClick={(e) => e.stopPropagation()}><a href={player.fora} target="_blank" rel="noopener noreferrer">abrir no {player.tipo === "sc" ? "SoundCloud" : "YouTube"}</a><button onClick={fecha}>fechar</button></p>
        </div>
      )}
    </main>
  );
}
