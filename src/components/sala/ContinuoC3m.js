"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/continuoC3m.module.css";
import CAPAS from "@/data/c3Capas.json";
import VIDEOS from "@/data/c3Videos.json";
import CV from "@/data/capaViva.json";

/* ---------- utilidades ---------- */
const capa = (id) => `/c3/capas/${id}.webp`;
const thumb = (id) => `/c3/yt/${id}.webp`;
const foto = (n) => `/c3/m/f${String(n).padStart(2, "0")}.webp`;
const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")} mil` : String(n));
const CAPA = Object.fromEntries(CAPAS.map((c) => [c.id, c]));
const VID = Object.fromEntries(VIDEOS.map((v) => [v.id, v]));
const dataBr = (s) => `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;

const hex2rgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = ([r, g, b]) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const razao = (a, b) => {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};

const AMANHA = "7N2l86SAph4EmZYOC8UegF";
const V2019 = VIDEOS.filter((v) => v.d.startsWith("2019")).sort((a, b) => b.v - a.v);
const DARCO = VIDEOS.filter((v) => /yung/i.test(v.t) || /darco/i.test(v.t)).filter((v) => v.d >= "20190101").sort((a, b) => b.v - a.v);
const LANCS = [
  { d: "20/05", id: "7N2l86SAph4EmZYOC8UegF", t: "Amanhã", tipo: "single · 2026" },
  { d: "30/06", id: "5iOE7xLlpjMpsQxLJbHdFd", t: "Porto de Taiwan", tipo: "single · 2026" },
  { d: "31/07", id: "1X5JbYwCzzZ99Hpd1E8tCR", t: "Atmos(Fera)", tipo: "single · remaster de 2019" },
];
const RIMAS_ID = "0t9SaUWD2L14daeop8Aipt";
// 13 faixas do disco (Spotify); caio = 1cort3 nos créditos
const NO_RIMAS = [
  { n: "Intro Delivery", q: "o grupo todo", yt: null, caio: true },
  { n: "Correria Tropicante", q: "1cort3, Matheus Coringa, DJ BatataKilla, Jayro", yt: "KqnFZu4eeOc", caio: true },
  { n: "Quinta Nova Sexta", q: "1cort3, 82", yt: "Ce9q7FI12ig", caio: true },
  { n: "Entrega Não Rastreada", q: "Sergio Estranho, 1cort3, 82", yt: "qtHRCgUJH18", caio: true },
  { n: "Dia de Folga no Frio", q: "Sergio Estranho, 1cort3, Eloy Polêmico", yt: "GR9J1G5tGRI", caio: true },
  { n: "Dando Grau na Bad", q: "Sergio Estranho, 1cort3, 82", yt: "qbA_eBZEh-U", caio: true },
  { n: "Entrega 17H03", q: "Sergio Estranho, 1cort3, domrafa, RED MSG MGN", yt: "9h1gRYk1O-w", caio: true },
  { n: "No Fronte", q: "Sergio Estranho, 1cort3, domrafa, 82, Erickillaz", yt: "5E6gafrDyik", caio: true },
  { n: "Espectros Noturnos", q: "Sergio Estranho, 1cort3, 82, El Mandarim", yt: "uQXZSAKZ4q4", caio: true },
  { n: "Corte Estranho", q: "Sergio Estranho, 1cort3, domrafa, Eloy Polêmico, obelga, affneguin", yt: "YyCLnnu2L2g", caio: true },
  { n: "Corujão", q: "Sergio Estranho, 1cort3, 82", yt: "Pgxcv-dxaIE", caio: true },
  { n: "After", q: "Sergio Estranho, 1cort3, 82", yt: "spsZROURqU8", caio: true },
  { n: "Outro Delivery", q: "o grupo todo", yt: null, caio: true },
];
const PARANOILISMO = "0FBHiiGSlZKNunpesNNx3t";
const SPOTIFY = "https://open.spotify.com/intl-pt/artist/6eroWsdqxSDDCB0klggZlY";
const YOUTUBE = "https://www.youtube.com/channel/UCwkhz_4ZMHl-a06mA7MfX2g";
const LINKS = [
  { nome: "Spotify", url: SPOTIFY, nota: "1cort3" },
  { nome: "YouTube", url: YOUTUBE, nota: "TRASHTREVASGANG · desde 2017" },
  { nome: "Instagram", url: "https://www.instagram.com/1cort3_/", nota: "@1cort3_" },
  { nome: "Linktree", url: "https://linktr.ee/1cort3", nota: "tudo num lugar só" },
];

/* uma persona (selfie) por era: a "forma" do capítulo */
const CENAS = [
  { id: "capa", ano: "2026", tick: "capa", forma: "01", nome: "coelho", foto: 6, bgs: ["#0a0510"], ac: "#ff2d8a" },
  { id: "amanha", ano: "2026", tick: "2026", forma: "02", nome: "madrugada", foto: 4, bgs: ["#f4f0e6"], ac: "#e0116e" },
  { id: "hiato", ano: "2023", tick: "2023", forma: "03", nome: "hiato", foto: 0, bgs: ["#07060a"], ac: "#ff3b2f" },
  { id: "rimas", ano: "2022", tick: "2022", forma: "04", nome: "entregador", foto: 3, bgs: ["#ffd400"], ac: "#111111" },
  { id: "parano", ano: "2021", tick: "2021", forma: "05", nome: "paranoia", foto: 11, bgs: ["#0b0b0f"], ac: "#ff2d8a" },
  { id: "micro", ano: "2020", tick: "2020", forma: "06", nome: "toalha", foto: 2, bgs: ["#f4f0e6"], ac: "#0f0f12" },
  { id: "conhaque", ano: "2019", tick: "2019", forma: "07", nome: "loiro", foto: 8, bgs: ["#161226"], ac: "#ffd24a" },
  { id: "darco", ano: "2018–19", tick: "2018", forma: "08", nome: "dupla", foto: 13, bgs: ["#ff2d8a"], ac: "#0a0a0a" },
  { id: "quintal", ano: "2017", tick: "2017", forma: "09", nome: "origem", foto: 5, bgs: ["#e9e1cf"], ac: "#3a2b1d" },
  { id: "final", ano: "fim", tick: "fim", forma: "10", nome: "chapéu", foto: 10, bgs: ["#0a0510"], ac: "#ff2d8a" },
];
const LEN = 1.3;
const FADE = 0.3;

function Seta() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cap({ id, abrir, className = "", nome = true }) {
  const c = CAPA[id];
  if (!c) return null;
  return (
    <button
      type="button"
      className={`${styles.cap} ${className}`}
      onClick={() => abrir({ id, titulo: c.t, tipo: c.tipo, ano: c.ano, yt: null })}
      aria-label={`Ouvir ${c.t}`}
    >
      <img src={capa(id)} alt={`Capa de ${c.t}`} loading="lazy" draggable="false" />
      {nome && (
        <span className={styles.capNome}>
          <b>{c.t}</b>
          <i>{c.tipo} · {c.ano} · ▶ ouvir</i>
        </span>
      )}
    </button>
  );
}

function Clipe({ id, abrir, className = "" }) {
  const v = VID[id];
  if (!v) return null;
  return (
    <button
      type="button"
      className={`${styles.clipe} ${className}`}
      onClick={() => abrir({ yt: id, titulo: v.t, tipo: "vídeo", ano: v.d.slice(0, 4), id: null })}
    >
      <span className={styles.clipeImg}>
        <img src={thumb(id)} alt="" loading="lazy" />
        <i aria-hidden="true">▶</i>
      </span>
      <strong>{v.t}</strong>
      <small>
        {dataBr(v.d)} · {fmt(v.v)} views
      </small>
    </button>
  );
}

function FotoLoop({ fotos, className = "", intervalo = 1500, alt = "" }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const x0 = useRef(null);
  useEffect(() => {
    if (pausa) return;
    const t = setInterval(() => setI((v) => (v + 1) % fotos.length), intervalo);
    return () => clearInterval(t);
  }, [pausa, fotos.length, intervalo]);
  const passo = (d) => setI((v) => (v + d + fotos.length) % fotos.length);
  return (
    <div
      className={`${styles.loop} ${className}`}
      onPointerDown={(e) => { x0.current = e.clientX; setPausa(true); }}
      onPointerUp={(e) => {
        const dx = e.clientX - (x0.current ?? e.clientX);
        if (Math.abs(dx) > 24) passo(dx < 0 ? 1 : -1); else passo(1);
        x0.current = null;
        setTimeout(() => setPausa(false), 2500);
      }}
      onPointerLeave={() => { x0.current = null; setPausa(false); }}
      role="img"
      aria-label={alt}
    >
      {fotos.map((f, k) => (
        <img key={f} src={f} alt="" className={k === i ? styles.loopOn : ""} loading="lazy" draggable="false" />
      ))}
      <span className={styles.loopN}>{String(i + 1).padStart(2, "0")}/{String(fotos.length).padStart(2, "0")}</span>
    </div>
  );
}


/* capa do Conflito Delirante recriada a partir do PSD: letras soltas que caem, brilham e tremem; anéis girando; o desenho "bebe" */
function CapaViva({ className = "" }) {
  const ref = useRef(null);
  const [tick, setTick] = useState(0);
  const [entrou, setEntrou] = useState(false);
  const [treme, setTreme] = useState(-1);
  const [boom, setBoom] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setEntrou(e.isIntersecting && e.intersectionRatio > 0.35), { threshold: [0, 0.35, 0.7] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => { if (entrou) setTick((t) => t + 1); }, [entrou]);
  useEffect(() => {
    if (!entrou) return;
    const a = setInterval(() => {
      const i = Math.floor(Math.random() * CV.letras.length);
      setTreme(i);
      setTimeout(() => setTreme(-1), 520);
    }, 1700);
    const b = setInterval(() => setTick((t) => t + 1), 16000);
    return () => { clearInterval(a); clearInterval(b); };
  }, [entrou]);
  const mover = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    ref.current.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const sai = () => { ref.current.style.setProperty("--px", "0"); ref.current.style.setProperty("--py", "0"); };
  const f = CV.fig;
  return (
    <div ref={ref} className={`${styles.cv} ${entrou ? styles.cvOn : ""} ${boom ? styles.cvBoom : ""} ${className}`} onPointerMove={mover} onPointerLeave={sai} onClick={() => { if (boom) return; setBoom(true); setTimeout(() => setBoom(false), 2300); }} role="img" aria-label="Capa de Conflito Delirante: 1cort3 de óculos, sorvendo um drinque" key="cv">
      <div className={styles.cvG0}>
        <img className={styles.cvBase} src="/c3/capa-viva/base.webp" alt="" draggable="false" />
        <img className={styles.cvAnel2} src="/c3/capa-viva/sh2-full.webp" alt="" draggable="false" style={{ left: `${CV.aneis.sh2.x}%`, top: `${CV.aneis.sh2.y}%`, width: `${CV.aneis.sh2.w}%` }} />
        <img className={styles.cvAnel1} src="/c3/capa-viva/sh1-full.webp" alt="" draggable="false" style={{ left: `${CV.aneis.sh1.x}%`, top: `${CV.aneis.sh1.y}%`, width: `${CV.aneis.sh1.w}%` }} />
      </div>
      <div className={styles.cvG1} key={tick}>
        {CV.letras.map((l, i) => (
          <img
            key={l.n}
            className={`${styles.cvLetra} ${treme === i ? styles.cvTreme : ""}`}
            src={`/c3/capa-viva/${l.n}`}
            alt=""
            draggable="false"
            style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, "--i": i, "--rot": `${((i * 37) % 21) - 10}deg`, "--dx": `${((i * 53) % 17) - 8}%`, "--ex": `${(((i * 61) % 41) - 20) * 12}%`, "--ey": `${(((i * 37) % 33) - 16) * 14}%`, "--er": `${((i * 53) % 720) - 360}deg` }}
          />
        ))}
      </div>
      <div className={styles.cvG2}>
        <img className={styles.cvFig} src="/c3/capa-viva/fig.webp" alt="" draggable="false" style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%` }} />
      </div>
      <span className={styles.cvFlash} key={"f" + tick} aria-hidden="true" />
      <span className={styles.cvBranco} key={"b" + boom} aria-hidden="true" />
    </div>
  );
}

/* grade de 30 meses: os quadrados vazios "falham", a linha de vida é reta e um clique manda uma onda pela grade */
const DIAS = Math.round((Date.UTC(2026, 4, 20) - Date.UTC(2023, 11, 12)) / 86400000);
function HiatoMeses() {
  const ref = useRef(null);
  const [g, setG] = useState(-1);
  const [txt, setTxt] = useState("");
  const [onda, setOnda] = useState({ i: -1, n: 0 });
  const [dias, setDias] = useState(0);
  const [visto, setVisto] = useState(false);
  const [cols, setCols] = useState(6);
  useEffect(() => {
    const f = () => setCols(innerWidth <= 800 ? 5 : 6);
    f(); addEventListener("resize", f);
    return () => removeEventListener("resize", f);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisto(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visto) { setDias(0); return; }
    let raf = 0;
    const t0 = performance.now();
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / 4200);
      const v = Math.round(DIAS * (1 - Math.pow(1 - k, 3)));
      setDias(k < 1 && Math.random() < 0.18 ? Math.floor(Math.random() * DIAS) : v);
      if (k < 1) raf = requestAnimationFrame(passo); else setDias(DIAS);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [visto]);
  useEffect(() => {
    const t = setInterval(() => {
      const i = 1 + Math.floor(Math.random() * 28);
      const lixo = ["▓▒░", "…", "??", "00:00", "ø", "—", "0 faixas", "sem sinal"][Math.floor(Math.random() * 8)];
      setG(i); setTxt(lixo);
      setTimeout(() => setG(-1), 280);
    }, 1100);
    return () => clearInterval(t);
  }, []);
  const clica = (k) => {
    setOnda({ i: k, n: onda.n + 1 });
    setTimeout(() => setOnda((o) => ({ ...o, i: -1 })), 1700);
  };
  return (
    <div ref={ref} className={styles.hiGrade}>
      <p className={styles.hiDias}>
        <b>{dias.toLocaleString("pt-BR")}</b> dias · <b>{(dias * 24).toLocaleString("pt-BR")}</b> horas de silêncio
      </p>
      <svg className={styles.hiLinha} viewBox="0 0 600 54" preserveAspectRatio="none" aria-hidden="true">
        <path className={styles.hiLinhaPath} d="M0 27H44l8 0 7-22 9 44 7-22H524l8 0 7-22 9 44 7-22H600" />
        <path className={styles.hiLinhaVarre} d="M0 27H44l8 0 7-22 9 44 7-22H524l8 0 7-22 9 44 7-22H600" />
      </svg>
      <ol className={styles.hiMeses}>
        {Array.from({ length: 30 }, (_, k) => {
          const m = (11 + k) % 12;
          const a = 2023 + Math.floor((11 + k) / 12);
          const rot = `${String(m + 1).padStart(2, "0")}/${String(a).slice(2)}`;
          const cls = k === 0 ? styles.hiPrimeiro : k === 29 ? styles.hiUltimo : `${styles.hiVazio} ${g === k ? styles.hiFalha : ""}`;
          const lin = Math.floor(k / cols), col = k % cols;
          const d = onda.i >= 0 ? Math.hypot(lin - Math.floor(onda.i / cols), col - (onda.i % cols)) : 0;
          return (
            <li
              key={k + "-" + (onda.i >= 0 ? onda.n : 0)}
              className={`${cls} ${onda.i >= 0 ? styles.hiOnda : ""}`}
              style={{ "--i": k, "--d": `${Math.round(d * 90)}ms` }}
              onClick={() => clica(k)}
            >
              <span>{g === k ? txt : rot}</span>
              {k === 0 && <em>conflito<br />delirante</em>}
              {k === 29 && <em>amanhã</em>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* balão de fala */
function Balao({ children, className = "", cauda = "bl" }) {
  return <p className={`${styles.balao} ${styles["cauda_" + cauda]} ${className}`}>{children}</p>;
}

/* onomatopeia */
function Sfx({ children, className = "", style }) {
  return (
    <span className={`${styles.sfx} ${className}`} style={style} aria-hidden="true">
      {children}
    </span>
  );
}

/* ============================================================ */
export default function ContinuoC3m() {
  const trilha = useRef(null);
  const topo = useRef(null);
  const cenaRefs = useRef([]);
  const [ativa, setAtiva] = useState(0);
  const [aberta, setAberta] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const N = CENAS.length;
    let raf = 0;
    let ultima = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const pos = window.scrollY / vh;
      const mobile = window.innerWidth <= 800;
      const els = cenaRefs.current;
      const pesos = [];
      let melhor = 0, melhorV = -1;
      if (!mobile) {
        if (trilha.current && trilha.current.dataset.h) {
          delete trilha.current.dataset.h;
          trilha.current.style.removeProperty("height");
        }
        CENAS.forEach((c, i) => {
          const el = els[i];
          if (!el) return;
          const local = pos - i * LEN;
          const entra = i === 0 ? 1 : sm((local + FADE) / FADE);
          const sai = i === N - 1 ? 0 : sm((local - (LEN - FADE)) / FADE);
          const v = Math.max(0, entra * (1 - sai));
          el.style.setProperty("--t", Math.min(1, Math.max(0, local / LEN)).toFixed(3));
          el.style.removeProperty("transform");
          el.style.setProperty("opacity", v.toFixed(3), "important");
          el.style.setProperty("visibility", v < 0.01 ? "hidden" : "visible", "important");
          el.style.setProperty("pointer-events", v > 0.6 ? "auto" : "none", "important");
          pesos.push(v);
          if (v > melhorV) { melhorV = v; melhor = i; }
        });
      } else {
        const Fm = vh * 0.36;
        const alt = els.map((el) => (el ? Math.max(vh, el.offsetHeight) : vh));
        const len = alt.map((h) => h - vh + vh * 0.6 + Fm);
        const ini = [];
        let acc = 0;
        len.forEach((l) => { ini.push(acc); acc += l; });
        const total = Math.round(acc + vh);
        if (trilha.current && trilha.current.dataset.h !== String(total)) {
          trilha.current.dataset.h = String(total);
          trilha.current.style.setProperty("height", total + "px", "important");
        }
        const y = window.scrollY;
        CENAS.forEach((c, i) => {
          const el = els[i];
          if (!el) return;
          const local = y - ini[i];
          const entra = i === 0 ? 1 : sm((local + Fm) / Fm);
          const sai = i === N - 1 ? 0 : sm((local - (len[i] - Fm)) / Fm);
          const v = Math.max(0, entra * (1 - sai));
          const pan = Math.min(alt[i] - vh, Math.max(0, local - vh * 0.3));
          el.style.setProperty("--t", Math.min(1, Math.max(0, local / len[i])).toFixed(3));
          el.style.setProperty("transform", `translate3d(0, ${(-pan).toFixed(1)}px, 0)`, "important");
          el.style.setProperty("opacity", v.toFixed(3), "important");
          el.style.setProperty("visibility", v < 0.01 ? "hidden" : "visible", "important");
          el.style.setProperty("pointer-events", v > 0.6 ? "auto" : "none", "important");
          pesos.push(v);
          if (v > melhorV) { melhorV = v; melhor = i; }
        });
      }
      if (melhor !== ultima) {
        ultima = melhor;
        setAtiva(melhor);
      }
      const t2 = topo.current;
      if (t2) {
        const tot = pesos.reduce((x, y2) => x + y2, 0) || 1;
        let ac = [0, 0, 0];
        const dom = [];
        CENAS.forEach((c, i) => {
          const w = (pesos[i] || 0) / tot;
          if (w <= 0.02) return;
          const a2 = hex2rgb(c.ac);
          ac = ac.map((v2, k) => v2 + a2[k] * w);
          c.bgs.forEach((bb) => dom.push(hex2rgb(bb)));
        });
        if (dom.length) {
          const pior = (cor) => Math.min(...dom.map((bb) => razao(cor, bb)));
          const cand = [ac.map(Math.round), [255, 255, 255], [17, 17, 17]];
          let esc = cand[0];
          if (pior(esc) < 3.4) esc = pior(cand[1]) >= pior(cand[2]) ? cand[1] : cand[2];
          t2.style.setProperty("--logo", `rgb(${esc[0]},${esc[1]},${esc[2]})`);
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* o fundo reage ao mouse; três olhos vêm atrás (paranoia) */
  useEffect(() => {
    const raiz = document.querySelector("[data-c3]");
    if (!raiz || window.matchMedia("(hover: none)").matches) return;
    let mx = 0.5, my = 0.5, px = innerWidth / 2, py = innerHeight / 2, raf = 0;
    const olhos = [...document.querySelectorAll("[data-olho]")];
    const pos = olhos.map(() => ({ x: px, y: py }));
    const mover = (e) => {
      px = e.clientX; py = e.clientY;
      mx = px / innerWidth; my = py / innerHeight;
      raiz.style.setProperty("--mx", mx.toFixed(3));
      raiz.style.setProperty("--my", my.toFixed(3));
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      olhos.forEach((el, i) => {
        const k = 0.16 - i * 0.045;
        const o = pos[i];
        o.x += (px - o.x) * k;
        o.y += (py - o.y) * k;
        const a = Math.atan2(py - o.y, px - o.x);
        el.style.transform = `translate(${(o.x + 26 + i * 28).toFixed(1)}px, ${(o.y + 18 + i * 10).toFixed(1)}px)`;
        const pup = el.firstElementChild;
        if (pup) pup.style.transform = `translate(${(Math.cos(a) * 5).toFixed(1)}px, ${(Math.sin(a) * 5).toFixed(1)}px)`;
      });
    };
    window.addEventListener("pointermove", mover);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", mover);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!player) return;
    const k = (e) => e.key === "Escape" && setPlayer(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [player]);

  const irPara = (i) => {
    if (window.innerWidth <= 800) {
      let h = 0;
      for (let k = 0; k < i; k++) {
        const el = cenaRefs.current[k];
        const a = el ? Math.max(window.innerHeight, el.offsetHeight) : window.innerHeight;
        h += a - window.innerHeight + window.innerHeight * 0.96;
      }
      window.scrollTo({ top: h + 4, behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: (i * LEN + 0.12) * window.innerHeight, behavior: "smooth" });
  };

  const abrir = (p) => setPlayer(p);
  const reg = (i) => (el) => { cenaRefs.current[i] = el; };
  const cena = CENAS[ativa];

  return (
    <main className={styles.raiz} data-c3 style={{ "--ac": cena.ac }}>
      <VoltarJodo />
      <header ref={topo} className={styles.topo}>
        <div className={`${styles.marca} ${aberta ? styles.aberta : ""}`} onClick={() => setAberta((v) => !v)} onMouseLeave={() => setAberta(false)}>
          <Link
            href="/"
            className={styles.marcaLink}
            aria-label="1cort3: voltar ao topo da página"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <i className={styles.mMontanha} />
            <b className={styles.mNome}>1CORT3</b>
          </Link>
          <Link href="/artistas/rap-delivery" className={styles.rapSai} aria-label="Rap Delivery">
            <img src="/rd-caixa.webp" alt="Rap Delivery" />
          </Link>
        </div>
      </header>

      {/* a forma: o retrato muda de persona a cada era */}
      <aside className={styles.forma} aria-hidden="true">
        <span className={styles.formaFoto}>
          {CENAS.map((c, i) => (
            <img key={c.id} src={foto(c.foto)} alt="" className={i === ativa ? styles.formaOn : ""} />
          ))}
        </span>
        <span className={styles.formaTxt}>
          <small>forma</small>
          <b>{cena.forma}</b>
          <em>{cena.nome}</em>
        </span>
      </aside>

      <div className={styles.ano} aria-hidden="true">
        <span key={cena.ano} className={styles.anoNum}>{cena.ano}</span>
      </div>
      <nav className={styles.tempo} aria-label="Páginas do capítulo">
        <ol>
          {CENAS.map((c, i) => (
            <li key={c.id} className={i === ativa ? styles.tOn : ""}>
              <button onClick={() => irPara(i)} aria-label={`página ${i + 1}`}>
                <b />
                <span>{c.tick}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      {[0, 1, 2].map((i) => (
        <span key={i} data-olho className={styles.olho} aria-hidden="true">
          <i />
        </span>
      ))}
      <div ref={trilha} className={styles.trilha} style={{ "--n": CENAS.length, "--len": LEN }}>
        <div className={styles.palco}>
          {/* ===== 0 · capa do capítulo ===== */}
          <section ref={reg(0)} className={`${styles.cena} ${styles.c_capa}`}>
            <div className={styles.capaImg}>
              <img src="/c3/m/cristo.webp" alt="1cort3 de braços abertos, em pose de Cristo, com as mãos coladas ao meio do corpo, sobre um céu de nuvens azuis" />
              <span className={styles.capaCred}>foto e edição: Gabriel Jovita</span>
            </div>
            <div className={styles.capaTxt}>
              <p className={styles.caixa}>CAPÍTULO ÚNICO · 2017 → 2026</p>
              <h1 className={styles.logoTxt}>1CORT3</h1>
              <p className={styles.sub}><small>faixa 2026</small>TRANSFORMATIK</p>
              <p className={styles.lide}>
                mc, produtor fonográfico e audiovisual. perdidão no inferno de concreto, fabricando mp3 daqui até a morte. comecei em 2017 no quintal do yungdarco22, trash trevas gang. 57 vídeos depois, volto em outra forma. experimentando o experimento, sempre.
              </p>
              <ul className={styles.numeros}>
                <li><b>57</b> vídeos</li>
                <li><b>9</b> lançamentos</li>
                <li><b>10</b> formas</li>
              </ul>
            </div>
            <Sfx className={styles.sfxGrande}>ゴゴゴゴ</Sfx>
            <p className={styles.dicaBase}>vire a página ↓ do mais novo ao mais antigo</p>
          </section>

          {/* ===== 1 · Amanhã ===== */}
          <section ref={reg(1)} className={`${styles.cena} ${styles.c_amanha}`}>
            <div className={styles.pagina}>
              <figure className={`${styles.painel} ${styles.p1}`}>
                <img src="/c3/j/janela.webp" alt="" loading="lazy" style={{ objectPosition: "50% 55%" }} />
              </figure>
              <figure className={`${styles.painel} ${styles.p2}`}>
                <img src="/c3/j/maos.webp" alt="" loading="lazy" style={{ objectPosition: "50% 0%" }} />
                <Sfx className={styles.sfxP}>ドン!</Sfx>
              </figure>
              <figure className={`${styles.painel} ${styles.p3}`}>
                <img src="/c3/j/olhos.webp" alt="" loading="lazy" style={{ objectPosition: "50% 0%" }} />
              </figure>
              <figure className={`${styles.painel} ${styles.p5}`}>
                <img src="/c3/j/duplo.webp" alt="" loading="lazy" style={{ objectPosition: "62% 0%" }} />
              </figure>
            </div>
            <div className={styles.am4}>
              <p className={styles.etq}>2026 · a volta</p>
              <h2 className={styles.tAmanha}>AMANHÃ</h2>
              <p className={styles.amLide}>maio de 2026. largo faixa nova. letra, beat e remaster: eu mesmo.</p>
              <ol className={styles.lancs}>
                {LANCS.map((l) => (
                  <li key={l.id}>
                    <button onClick={() => abrir({ id: l.id, titulo: l.t, tipo: l.tipo, ano: 2026, yt: null })}>
                      <b>{l.d}</b>
                      <img src={capa(l.id)} alt="" loading="lazy" />
                      <span>
                        <strong>{l.t}</strong>
                        <em>{l.tipo}</em>
                      </span>
                      <i>▶</i>
                    </button>
                  </li>
                ))}
              </ol>
              <blockquote className={styles.citacao}>
                “sem refrão, sem cacau, sentimento glacial”
                <cite>Amanhã · 1cort3</cite>
              </blockquote>
              <small className={styles.creditoMini}>rec, mix e master joncotidie · capa disssimulator · fotos e edição Gabriel Jovita</small>
            </div>
          </section>

          {/* ===== 2 · Conflito Delirante: o hiato (dez/2023 → mai/2026), 30 meses numa grade ===== */}
          <section ref={reg(2)} className={`${styles.cena} ${styles.c_hiato}`}>
            <div className={styles.hiTxt}>
              <p className={styles.hiEtq}>dez/2023 · single</p>
              <h2 className={styles.hiTit}>Conflito Delirante</h2>
              <div className={styles.hiMeio}>
                <CapaViva className={styles.hiCapaViva} />
                <dl className={styles.hiFicha}>
                  <div><dt>artista e composição</dt><dd>1cort3</dd></div>
                  <div><dt>instrumental</dt><dd>1cort3 &amp; <a href="https://www.instagram.com/joncotidie/" target="_blank" rel="noopener noreferrer">@joncotidie</a></dd></div>
                  <div><dt>captação, mix e master</dt><dd><a href="https://www.instagram.com/joncotidie/" target="_blank" rel="noopener noreferrer">@joncotidie</a></dd></div>
                  <div><dt>arte de capa</dt><dd>Ludmila Guimarães Magnossão &amp; <a href="https://www.instagram.com/_jodo/" target="_blank" rel="noopener noreferrer">JODO</a></dd></div>
                </dl>
              </div>
              <div className={styles.hiPlat}>
                <a className={styles.hiSp} href="https://open.spotify.com/album/3MVbtSymLTtKCZmfusDQlo" target="_blank" rel="noopener noreferrer" aria-label="Ouvir no Spotify">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.5-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-.99-.12-1.11-.6-.12-.48.12-.99.6-1.11 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.21 1.17zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" /></svg>
                  <span>Spotify</span>
                </a>
                <a className={styles.hiYt} href="https://www.youtube.com/watch?v=_YFN79f7YbA" target="_blank" rel="noopener noreferrer" aria-label="Ver no YouTube">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" /></svg>
                  <span>YouTube</span>
                </a>
              </div>
            </div>
            <div className={styles.hiTempo}>
              <p className={styles.hiTempoTit}>
                <b>29</b> <span>meses sem lançar</span>
                <span className={styles.hiPlatM}>
                  <a className={styles.hiSp} href="https://open.spotify.com/album/3MVbtSymLTtKCZmfusDQlo" target="_blank" rel="noopener noreferrer" aria-label="Ouvir no Spotify"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.5-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-.99-.12-1.11-.6-.12-.48.12-.99.6-1.11 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.21 1.17zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" /></svg></a>
                  <a className={styles.hiYt} href="https://www.youtube.com/watch?v=_YFN79f7YbA" target="_blank" rel="noopener noreferrer" aria-label="Ver no YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" /></svg></a>
                </span>
              </p>
              <HiatoMeses />
              <p className={styles.hiLegenda}>cada quadrado é um mês sem lançamento no spotify: do <i>Conflito Delirante</i>, em 12/2023, até o <i>Amanhã</i>, em 05/2026.</p>
            </div>
            <span className={styles.hiRuido} aria-hidden="true" />
          </section>

          {/* ===== 3 · Rimas pra Viagem ===== */}
          <section ref={reg(3)} className={`${styles.cena} ${styles.c_rimas}`}>
            <div className={styles.rmTxt}>
              <p className={styles.etq}>2022 · em grupo</p>
              <h2 className={styles.tRimas} aria-label="Rimas pra Viagem"><span className={styles.rmA}>Rimas</span><span className={styles.rmB}>pra</span><span className={styles.rmC}>Viagem</span></h2>
              <Balao className={styles.rmBalao}>não vou foder<br />meu jeitão<br />de acontecer</Balao>
              <p>
                2022. rimo e produzo com o rap delivery: eu, sergio estranho, domrafa e 82. o disco, o show e a estrada estão na página do grupo.
              </p>
              <Link href="/artistas/rap-delivery" className={styles.botao}>página do rap delivery →</Link>
            </div>
            <div className={styles.disco13}>
              <p className={styles.discoHead}>13 faixas · 35 min · 09/09/2022 · o Caio está em todas</p>
              <ol className={styles.pedidos}>
                {NO_RIMAS.map((f, k) => (
                  <li key={f.n} className={f.caio ? styles.caio : styles.semCaio}>
                    <button
                      onClick={() =>
                        f.yt
                          ? abrir({ yt: f.yt, titulo: f.n, tipo: "faixa", ano: 2022, id: RIMAS_ID })
                          : abrir({ id: RIMAS_ID, titulo: "Rimas pra Viagem · " + f.n, tipo: "álbum", ano: 2022, yt: null })
                      }
                    >
                      <b>{String(k + 1).padStart(2, "0")}</b>
                      <span>
                        <strong>{f.n}</strong>
                        <em>{f.q}</em>
                      </span>
                      <i>▶</i>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.rmPalco}>
              <div className={styles.rmCapa}>
                <img src="/rd/rimas-capa.webp" alt="Capa do Rimas pra Viagem" loading="lazy" />
              </div>
              <div className={styles.rmLoops}>
                <div className={styles.loopTag}>
                  <FotoLoop className={styles.loopC} intervalo={1900} alt="Fotos do Jovita: os quatro do Rap Delivery" fotos={["/rd/grupo.webp", "/rd/grupo-pisca.webp", ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `/rd/noite-${n}.webp`)]} />
                  <b>fotos do Jovita</b>
                </div>
                <div className={`${styles.loopTag} ${styles.tagA}`}>
                  <FotoLoop className={styles.loopA} intervalo={1100} alt="Pré-show" fotos={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((n) => `/rd/ps-${String(n).padStart(2, "0")}.webp`)} />
                  <b>pré-show</b>
                </div>
                <div className={`${styles.loopTag} ${styles.tagB}`}>
                  <FotoLoop className={styles.loopB} intervalo={1200} alt="O show" fotos={[...[1, 2, 3, 4, 5, 6, 7].map((n) => `/rd/sh-${String(n).padStart(2, "0")}.webp`), ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => `/rd/av-${String(n).padStart(2, "0")}.webp`)]} />
                  <b>o show</b>
                </div>
              </div>
            </div>
          </section>

          {/* ===== 3 · Paranoilismo ===== */}
          <section ref={reg(4)} className={`${styles.cena} ${styles.c_parano}`}>
            <div className={styles.pnTxt}>
              <p className={styles.etq}>2021 · EP · 6 faixas · 17 min</p>
              <h2 className={styles.tParano}>PARANOILISMO</h2>
              <ol className={styles.indice}>
                <li><i>01</i> Relatos da Queda <em>· Sergio Estranho</em></li>
                <li><i>02</i> Jazz do Otário <em>· El Mandarim</em></li>
                <li><i>03</i> Skit</li>
                <li><i>04</i> Linue <em>· SAULL OE</em></li>
                <li><i>05</i> Apocalipsiquikis</li>
                <li><i>06</i> Nadando para o Nada</li>
              </ol>
              <Balao className={styles.pnBalao} cauda="bl">morrendo por dentro,<br />necromante eu ressurjo</Balao>
              <p className={styles.copyMini}>pesadelo no meu sonho, 17 minutos de paranoia. depois vieram Reflexos Noturnos (2022, beat do DK, mix do Sergio) e Conflito Delirante (dez/2023).</p>
            </div>
            <div className={styles.pnVis}>
              <ul className={styles.gifs}>
                {[
                  ["pn-g1", "KxpaGYx7uJQ", "Paranoilismo (EP completo)"],
                  ["pn-g2", "3RAprgsioNg", "Relatos da queda (clipe)"],
                  ["pn-g3", "2diY_6FGl7Q", "Dirigindo a noite"],
                  ["pn-g4", "M_emTTDu9CM", "Omae wa mou shindeiru · the wxlker"],
                ].map(([f, yid, t], k) => (
                  <li key={f} style={{ "--k": k }}>
                    <button onClick={() => abrir({ yt: yid, titulo: t, tipo: "vídeo", ano: 2021, id: null })} aria-label={`Ver ${t}`}>
                      <img src={`/c3/m/${f}.webp`} alt="" loading="lazy" />
                      <span>{t}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ===== 4 · MicroTape ===== */}
          <section ref={reg(5)} className={`${styles.cena} ${styles.c_micro}`}>
            <span className={styles.ano89} aria-hidden="true">1989</span>
            <div className={styles.mcTxt}>
              <p className={styles.etq}>2020 · MicroTape</p>
              <h2 className={styles.tMicro}>FAUSTÃO,<br />EU ESTOU<br />SANGRANDO</h2>
              <p>
                três faixas, três folhas de calendário de 1989. quarentena, sangue, 1989 sangrando em 2020. no mesmo ano saem dois clipes caseiros: homenagem a varanda e janela, e passeando em corredores de mercados mortos.
              </p>
            </div>
            <ol className={styles.calendario}>
              {[
                ["vOsP_s874yE", "26", "MAR", "1989"],
                ["8VDRvlzJSaM", "02", "ABR", "1989"],
                ["Hgk9sEeSnmo", "09", "ABR", "1989"],
              ].map(([id, dia, mes, ano], k) => (
                <li key={id} style={{ "--k": k }}>
                  <button onClick={() => abrir({ yt: id, titulo: VID[id].t, tipo: "vídeo", ano: 2020, id: null })}>
                    <span className={styles.folhaTopo}>{mes} · {ano}</span>
                    <b>{dia}</b>
                    <span className={styles.folhaImg}><img src={`/c3/m/mc-${id}.webp`} alt="" loading="lazy" /></span>
                    <small>faixa {String(k + 1).padStart(2, "0")} · ▶ ouvir</small>
                  </button>
                </li>
              ))}
            </ol>
            <ul className={styles.caseiros}>
              {[
                ["ibvJzVxNFo8", "homenagem a varanda & janela", "04/08/2020"],
                ["v8Vm84rxXPQ", "passeando em corredores de mercados mortos", "08/10/2020"],
              ].map(([id, t, d]) => (
                <li key={id}>
                  <button onClick={() => abrir({ yt: id, titulo: t, tipo: "clipe", ano: 2020, id: null })}>
                    <img src={`/c3/m/mc-${id}.webp`} alt="" loading="lazy" />
                    <span><b>clipe · {d}</b>{t}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* ===== 5 · 2019 ===== */}
          <section ref={reg(6)} className={`${styles.cena} ${styles.c_conhaque}`}>
            <div className={styles.chTxt}>
              <p className={styles.etq}>2019 · a fase mais produtiva</p>
              <h2 className={styles.tConhaque}>CONHAQU3</h2>
              <p>
                <b>{V2019.length}</b> vídeos em 12 meses. freestyle, clipe, beat, tudo no mesmo ano. trash trevas gang no talo. as três faixas das capas só chegaram às plataformas em abril de 2021. passa o mouse: é tudo isso aqui.
              </p>
              <div className={styles.chCapas}>
                <Cap id="16NEortbsWuSKJmopD726x" abrir={abrir} />
                <Cap id="03buoofuEegSBMhTJj6Tqe" abrir={abrir} />
                <Cap id="1Mt55lMhJwmDYiZQAVAoy4" abrir={abrir} />
              </div>
            </div>
            <ul className={styles.parede}>
              {V2019.map((v, k) => (
                <li key={v.id} style={{ "--k": k }}>
                  <button onClick={() => abrir({ yt: v.id, titulo: v.t, tipo: "vídeo", ano: 2019, id: null })}>
                    <img src={thumb(v.id)} alt="" loading="lazy" />
                    <span>{v.t}<em>{dataBr(v.d)} · {fmt(v.v)}</em></span>
                  </button>
                </li>
              ))}
            </ul>
            <Sfx className={styles.sfxCh}>ゴ</Sfx>
          </section>

          {/* ===== 6 · yungdarco22 ===== */}
          <section ref={reg(7)} className={`${styles.cena} ${styles.c_darco}`}>
            <div className={styles.dcLado}>
              <p className={styles.etq}>de um lado</p>
              <h2 className={styles.tDarco}>1CORT3</h2>
              <p>voz, beat, mix, tudo na mesma mão. a trash trevas gang começa aqui.</p>
              <ul className={styles.dcLista}>
                {["o6zX-YxJht8", "2Gox3jskjGk", "KkHKu46NH_4", "UpGp4IdeWZQ"].map((id) => {
                  const v = VID[id];
                  return (
                    <li key={id}>
                      <button onClick={() => abrir({ yt: id, titulo: v.t, tipo: "vídeo", ano: v.d.slice(0, 4), id: null })}>
                        <img src={thumb(id)} alt="" loading="lazy" />
                        <span>{v.t.replace(/^1c0?rt3 ?[-–]? ?/i, "")}<em>{fmt(v.v)}</em></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className={styles.dcMeio}>
              <span className={styles.vs}>VS</span>
            </div>
            <div className={`${styles.dcLado} ${styles.dcDir}`}>
              <p className={styles.etq}>do outro</p>
              <h2 className={styles.tDarco}>YUNGDARCO22</h2>
              <p>metade do canal é dele: {DARCO.length} faixas e clipes de 2019 em diante. instrumental e microfone trocando de mão.</p>
              <ul className={styles.dcLista}>
                {DARCO.slice(0, 4).map((v) => (
                  <li key={v.id}>
                    <button onClick={() => abrir({ yt: v.id, titulo: v.t, tipo: "vídeo", ano: v.d.slice(0, 4), id: null })}>
                      <img src={thumb(v.id)} alt="" loading="lazy" />
                      <span>{v.t.replace(/^yung ?darco ?22 ?[-–]? ?/i, "").replace(/^1corte? x yungdarco22 ?[-–]? ?/i, "")}<em>{fmt(v.v)}</em></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ===== 7 · quintal ===== */}
          <section ref={reg(8)} className={`${styles.cena} ${styles.c_quintal}`}>
            <div className={styles.qtL}>
              <p className={styles.etq}>flashback · dez/2017 → 2018</p>
              <h2 className={styles.tQuintal}>O QUINTAL</h2>
              <p className={styles.qtCopy}>
                dezembro de 2017. instrumental do darco, voz minha. tudo gravado no quintal: uma voz “dentro de um buraco imundo, em algum canto do sétimo círculo do inferno”, outra “numa garrafa de askov”. master do arthur pereira. foi assim que começou.
              </p>
              <ol className={styles.arquivo}>
                {["xLDrzVbnZNo", "jw3C1a19t74", "0in3NrZE8PU", "hLLgXwIxY4Y"].map((id) => {
                  const v = VID[id];
                  return (
                    <li key={id}>
                      <button onClick={() => abrir({ yt: id, titulo: v.t, tipo: "vídeo", ano: v.d.slice(0, 4), id: null })}>
                        <i>{dataBr(v.d)}</i>
                        <span>{v.t}</span>
                        <em>{fmt(v.v)}</em>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className={styles.rolando} aria-hidden="true">
              <div className={styles.rolandoTrilho}>
                {[...VIDEOS.filter((v) => v.d < "20190101").map((v) => v.id), ...VIDEOS.filter((v) => v.d < "20190101").map((v) => v.id)].map((id, k) => (
                  <img key={k} src={thumb(id)} alt="" loading="lazy" />
                ))}
              </div>
            </div>
            <div className={styles.qtR}>
              <div className={styles.qtGrande}>
                <Clipe id="wXhD1YJb-R0" abrir={abrir} />
              </div>
              <div className={styles.qtPeq}>
                <Clipe id="Z6UdtRn6Kqs" abrir={abrir} />
              </div>
              <blockquote className={styles.qtCitacao}>
                “vozes gravadas dentro de uma garrafa de askov”
                <cite>frutas vermelhas · 2018</cite>
              </blockquote>
            </div>
          </section>

          {/* ===== 8 · fim ===== */}
          <section ref={reg(9)} className={`${styles.cena} ${styles.c_final}`}>
            <figure className={styles.maos}>
              <img src="/c3/j/inverso.webp" alt="" loading="lazy" style={{ objectPosition: "50% 20%" }} />
            </figure>
            <Sfx className={styles.sfxFim}>つづく</Sfx>
            <h2 className={styles.fimTit}>CONTINUA…</h2>
            <p className={styles.etq}>onde ouvir e ver</p>
            <ul className={styles.redes}>
              {LINKS.map((l) => (
                <li key={l.nome}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                    <strong>{l.nome}</strong>
                    <small>{l.nota}</small>
                    <Seta />
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/artistas/rap-delivery" className={styles.rdFinal}>
              <img src="/rd-caixa.webp" alt="" />
              <span>
                <small>também no</small>
                <strong>Rap Delivery</strong>
                <em>o super grupo de entregadores de rap, com Sergio Estranho, domrafa e 82 →</em>
              </span>
            </Link>
            <button className={styles.topoBtn} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              voltar ao topo ↑
            </button>
          </section>
        </div>
      </div>

      {player && (
        <div className={styles.modal} onClick={() => setPlayer(null)} role="dialog" aria-modal="true" aria-label={player.titulo}>
          <div className={styles.caixaPlayer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.fechar} onClick={() => setPlayer(null)}>fechar</button>
            <p className={styles.etqP}>{player.tipo} · {player.ano}</p>
            <h3>{player.titulo}</h3>
            {player.yt ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${player.yt}?autoplay=1&rel=0`}
                title={player.titulo}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                className={styles.spot}
                src={`https://open.spotify.com/embed/album/${player.id}?theme=0`}
                title={player.titulo}
                allow="autoplay; encrypted-media; clipboard-write"
              />
            )}
            <p className={styles.playerLinks}>
              {player.id && (
                <a href={`https://open.spotify.com/album/${player.id}`} target="_blank" rel="noopener noreferrer">Spotify <Seta /></a>
              )}
              {player.yt && (
                <a href={`https://www.youtube.com/watch?v=${player.yt}`} target="_blank" rel="noopener noreferrer">YouTube <Seta /></a>
              )}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
