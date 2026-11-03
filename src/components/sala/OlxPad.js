"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Oswald, Inter_Tight, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LINKS, EPS, PRODUCOES, FEATS, BEATS, mini } from "@/data/olx";
import { ONDAS } from "@/data/olxOndas";
import styles from "@/styles/olxPad.module.css";

/*
  Herick OLX: "o pad". Não é uma página de rolagem: é o instrumento dele. Ele mostra no Instagram que faz beat no numpad e no pad MIDI,
  então a página é uma grade 4x4: um pad por faixa dos EPs (são 16). Apertar o pad (ou a tecla) toca a faixa no monitor, com a forma de
  onda real e a agulha viva. Quatro bancos, como numa MPC: Lançamentos, Produções, Com outros e Beats (SoundCloud).
*/
// a tipografia vem do próprio material dele: os vídeos de letra do Instagram usam caixa-alta condensada branca sobre preto
const serif = Oswald({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--oq-serif", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--oq-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--oq-mono", display: "swap" });

const TECLAS = "1234qwerasdfzxcv".split("");
const COR_EP = ["#ee7a2e", "#ff3b3b", "#ff6b78"];
// cartaz de cada faixa do Teoria dos Versos: quadro do vídeo de letra que ele posta no Instagram
const ARTE = { BHWF4ZH8dpY: "/ol/t1.webp", i2JI_FpyKdM: "/ol/t2.webp", IAWMbj7tBc0: "/ol/t3.webp", nbcnfG3YtFY: "/ol/t4.webp" };
const FRASES = {
  BHWF4ZH8dpY: "Sigo de olho aberto",
  i2JI_FpyKdM: "De acordo com o que tenho",
  IAWMbj7tBc0: "Quem será que vai lembrar o tempo perdido?",
  nbcnfG3YtFY: "Pois o futuro ficou crítico",
};
// cada pad mostra um pedaço da capa (EPs), o quadro do vídeo (produções e participações) ou um detalhe do olho (beats)
const RECORTES = [[22, 24], [78, 18], [50, 52], [18, 82], [82, 70], [52, 92]];
const OLHO = [[20, 40], [45, 45], [70, 41], [85, 30], [30, 60], [60, 55], [50, 30]];
const BANCOS = [
  { id: "a", nome: "Lançamentos", pads: EPS.flatMap((e, ei) => e.faixas.map((f, fi) => {
    const a = ARTE[f.id];
    return { id: f.id, t: f.t, s: e.nome, cor: COR_EP[ei], frase: FRASES[f.id], arte: a || e.img, ox: a ? 50 : RECORTES[fi % 6][0], oy: a ? 44 : RECORTES[fi % 6][1], z: a ? 1.5 : 2.1, br: a ? 2.4 : 0.95 };
  })) },
  { id: "b", nome: "Produções", pads: PRODUCOES.map((p) => ({ id: p.id, t: p.t, s: p.a, cor: "#e2dccd", pagina: p.pagina, arte: mini(p.id), ox: 50, oy: 50, z: 1 })) },
  { id: "c", nome: "Com outros", pads: FEATS.map((f) => ({ id: f.id, t: f.t, s: `com ${f.com.join(", ")}`, cor: "#9ad7a8", arte: mini(f.id), ox: 50, oy: 50, z: 1 })) },
  { id: "d", nome: "Beats", pads: BEATS.map((b, i) => ({ id: b.url, sc: b.url, t: b.nome, s: `${b.bpm} bpm`, cor: "#7fd8c4", arte: "/ol/olho.webp", ox: OLHO[i % 7][0], oy: OLHO[i % 7][1], z: 2.6 })) },
];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function OlxPad() {
  const [bi, setBi] = useState(0);
  const [ativo, setAtivo] = useState(null); // { pad, bi, i }
  const [tocando, setTocando] = useState(false);
  const [sc, setSc] = useState(null);
  const alvo = useRef(null), yt = useRef(null), apiOk = useRef(false), pend = useRef(null);
  const ativoRef = useRef(null), agulha = useRef(null), luz = useRef(null), tAtual = useRef(null), tTotal = useRef(null);
  ativoRef.current = ativo;
  const scRef = useRef(null);
  const raiz = useRef(null), luzMouse = useRef({ x: 0.7, y: 0.3, ax: 0.7, ay: 0.3 });
  scRef.current = sc;

  const banco = BANCOS[bi];
  const onda = useMemo(() => {
    const o = ativo && ONDAS[ativo.pad.id];
    if (!o) return null;
    return { d: o.d, path: o.p.map((v, k) => { const h = Math.max(0.6, (v / 99) * 19); return `M${k + 0.5},${(20 - h).toFixed(1)}V${(20 + h).toFixed(1)}`; }).join("") };
  }, [ativo]);

  const proximo = () => {
    const a = ativoRef.current; if (!a) return;
    const pads = BANCOS[a.bi].pads;
    const i = a.i + 1;
    if (!pads[a.i]?.sc && i < pads.length) tocar(a.bi, i);
    else setTocando(false);
  };

  const cria = (id) => {
    if (!alvo.current) return;
    const el = document.createElement("div");
    alvo.current.appendChild(el);
    yt.current = new window.YT.Player(el, {
      videoId: id, host: "https://www.youtube-nocookie.com",
      playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
      events: {
        onReady: (e) => { e.target.playVideo(); },
        onStateChange: (e) => { if (e.data === 1) setTocando(true); else if (e.data === 2) setTocando(false); else if (e.data === 0) proximo(); },
      },
    });
  };

  const tocar = (b, i) => {
    const pad = BANCOS[b].pads[i];
    if (!pad) return;
    setAtivo({ pad, bi: b, i });
    if (pad.sc) { yt.current?.pauseVideo?.(); setTocando(true); setSc(pad.sc); return; }
    setSc(null);
    if (yt.current?.loadVideoById) yt.current.loadVideoById(pad.id);
    else if (apiOk.current) cria(pad.id);
    else pend.current = pad.id;
  };

  useEffect(() => {
    // sticky do monitor no celular exige overflow-x: clip (e não hidden) no html/body
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });
    return () => els.forEach((e, i) => { e.style.overflowX = antes[i]; });
  }, []);

  useEffect(() => {
    if (window.YT?.Player) apiOk.current = true;
    else {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
      window.onYouTubeIframeAPIReady = () => { apiOk.current = true; if (pend.current) { cria(pend.current); pend.current = null; } };
    }
    let raf = 0;
    const quadro = () => {
      raf = requestAnimationFrame(quadro);
      const L = luzMouse.current, r = raiz.current;
      if (r) { L.ax += (L.x - L.ax) * 0.06; L.ay += (L.y - L.ay) * 0.06; r.style.setProperty("--lx", `${(L.ax * 100).toFixed(2)}%`); r.style.setProperty("--ly", `${(L.ay * 100).toFixed(2)}%`); }
      const p = yt.current;
      if (!agulha.current) return;
      if (scRef.current) { agulha.current.style.left = "0%"; luz.current.style.clipPath = "inset(0 100% 0 0)"; if (tAtual.current) tAtual.current.textContent = ""; if (tTotal.current) tTotal.current.textContent = ""; return; }
      if (!p || !p.getCurrentTime) return;
      const d = p.getDuration?.() || 0, t = p.getCurrentTime() || 0;
      const f = d ? clamp(t / d) : 0;
      agulha.current.style.left = `${f * 100}%`;
      luz.current.style.clipPath = `inset(0 ${(1 - f) * 100}% 0 0)`;
      if (tAtual.current) tAtual.current.textContent = mmss(t);
      if (tTotal.current) tTotal.current.textContent = d ? mmss(d) : "";
    };
    raf = requestAnimationFrame(quadro);
    const k = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const i = TECLAS.indexOf(e.key.toLowerCase());
      if (i >= 0) { e.preventDefault(); tocar(bankAtual.current, i); return; }
      if (e.key === " " && yt.current?.getPlayerState) { e.preventDefault(); const s = yt.current.getPlayerState(); if (s === 1) yt.current.pauseVideo(); else yt.current.playVideo(); }
    };
    addEventListener("keydown", k);
    return () => { cancelAnimationFrame(raf); removeEventListener("keydown", k); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const bankAtual = useRef(0);
  bankAtual.current = bi;

  const seek = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = clamp((e.clientX - r.left) / r.width, 0, 0.99);
    const d = yt.current?.getDuration?.();
    if (d && !scRef.current) yt.current.seekTo(f * d, true);
  };

  const cor = ativo ? ativo.pad.cor : "#e8863a";

  return (
    <main ref={raiz} className={`${styles.raiz} ${serif.variable} ${sans.variable} ${mono.variable}`} style={{ "--c": cor, "--luzc": cor }} onMouseMove={(e) => { luzMouse.current.x = e.clientX / innerWidth; luzMouse.current.y = e.clientY / innerHeight; }}>
      <div className={styles.luz} aria-hidden="true" />
      <VoltarJodo />
      <MarcaTopo nome="Herick OLX" cor="#ece8e0" fonte="var(--oq-serif), sans-serif" escala={1.1} />

      <div className={styles.app}>
        <section className={`${styles.tela} ${ativo ? "" : styles.ocioso}`} aria-label="Monitor">
          <div className={`${styles.monitor} ${ativo ? styles.fixo : ""}`}>
            {!ativo && <img className={styles.olho} src="/ol/olho.webp" alt="Olho de Herick OLX, em close" />}
            <div ref={alvo} className={`${styles.video} ${ativo && !sc ? styles.on : ""}`} />
            {sc && <iframe key={sc} className={styles.sc} title={`Beat ${ativo?.pad.t}`} allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(sc)}&color=%237fd8c4&auto_play=true&visual=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`} />}
            {!ativo && <p className={styles.dica}>Aperte um pad.<span className={styles.teclas}>Ou as teclas <b><i>1 2 3 4</i><i>Q W E R</i><i>A S D F</i><i>Z X C V</i></b></span></p>}
          </div>

          <div className={styles.info}>
            {ativo ? (
              <>
                <p className={styles.sup}><b>{String(ativo.i + 1).padStart(2, "0")}</b> {BANCOS[ativo.bi].nome} · {ativo.pad.s}</p>
                <h2 key={ativo.pad.id}>{ativo.pad.t}</h2>
                {ativo.pad.frase && <p className={styles.frase}>{ativo.pad.frase}</p>}
                {ativo.pad.sc && <p className={styles.frase}>Beat no SoundCloud, em {ativo.pad.s}</p>}
                {ativo.pad.pagina && <Link href={ativo.pad.pagina} className={styles.pg}>página dela ↗</Link>}
              </>
            ) : (
              <>
                <h1>Herick OLX</h1>
                <p className={styles.sub}>MC, beatmaker e editor de áudio.</p>
              </>
            )}
          </div>

          <button className={styles.ondaBox} onClick={seek} disabled={!ativo || !!sc} aria-label="Pular para o ponto clicado">
            <svg viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true">
              {onda ? <path className={styles.base} d={onda.path} /> : <path className={styles.base} d="M0,20H220" />}
            </svg>
            <svg ref={luz} className={styles.luz} viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true" style={{ clipPath: "inset(0 100% 0 0)" }}>
              {onda ? <path d={onda.path} /> : <path d="M0,20H220" />}
            </svg>
            <i ref={agulha} className={styles.agulha} aria-hidden="true" />
          </button>
          <p className={styles.tempo}><span ref={tAtual}>0:00</span><span ref={tTotal} /></p>

          <ul className={styles.links}>
            <li><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify</a></li>
            <li><a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud</a></li>
            <li><a href={LINKS.coffee1} target="_blank" rel="noopener noreferrer">Beats ↗</a></li>
          </ul>
        </section>

        <section className={styles.mesa} aria-label="Pads">
          <div className={styles.bancos} role="tablist">
            {BANCOS.map((b, i) => <button key={b.id} role="tab" aria-selected={bi === i} className={bi === i ? styles.sel : ""} onClick={() => setBi(i)}><b>{b.id.toUpperCase()}</b><span>{b.nome}</span></button>)}
          </div>
          <div className={styles.grade} key={banco.id}>
            {Array.from({ length: 16 }, (_, i) => {
              const pad = banco.pads[i];
              const on = ativo && ativo.bi === bi && ativo.i === i;
              if (!pad) return <div key={i} className={`${styles.pad} ${styles.vazio}`}><em>{TECLAS[i]}</em></div>;
              return (
                <button key={i} className={`${styles.pad} ${on ? styles.ativo : ""} ${on && tocando ? styles.pulsa : ""}`} style={{ "--p": pad.cor, "--i": i }} onMouseEnter={() => raiz.current?.style.setProperty("--luzc", pad.cor)} onMouseLeave={() => raiz.current?.style.setProperty("--luzc", ativoRef.current ? ativoRef.current.pad.cor : "#ee7a2e")} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }} onClick={() => tocar(bi, i)} aria-label={`${pad.s}: ${pad.t}. Tecla ${TECLAS[i]}`}>
                  <img className={styles.arte} src={pad.arte} alt="" loading="lazy" style={{ objectPosition: `${pad.ox}% ${pad.oy}%`, transformOrigin: `${pad.ox}% ${pad.oy}%`, "--z": pad.z, "--br": pad.br || 0.95 }} />
                  <i className={styles.veu} aria-hidden="true" />
                  <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{pad.t}</strong>
                  <span className={styles.s}>{pad.s}</span>
                  <em>{TECLAS[i]}</em>
                </button>
              );
            })}
          </div>
          <p className={styles.nota}>Espaço pausa. A faixa seguinte entra sozinha. Os beats tocam pelo SoundCloud.</p>
        </section>
      </div>
    </main>
  );
}
