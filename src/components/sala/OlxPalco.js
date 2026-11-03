"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { Instrument_Serif, Inter_Tight, DM_Mono } from "next/font/google";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { ONDAS } from "@/data/olxOndas";
import styles from "@/styles/olxPalco.module.css";

/*
  Palco de UMA faixa (teste): "Olho Aberto", do EP Teoria dos Versos.
  Camadas em velocidades diferentes: nome em contorno (atrás), recorte da capa, forma de onda real (corta a tela), nome sólido (na frente).
  A rolagem leva o nome para fora; a onda acende conforme o avanço. Clicar na onda toca o vídeo a partir daquele ponto.
*/
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--op-serif", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--op-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: "400", variable: "--op-mono", display: "swap" });

const FAIXA = { id: "BHWF4ZH8dpY", n: "01", linhas: ["Olho", "Aberto"], ep: "Teoria dos Versos · Herick OLX", frase: "Sigo de olho aberto", cor: "#e8863a" };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const tempo = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Titulo({ cls, oculto }) {
  return (
    <div className={cls} aria-hidden={oculto ? "true" : undefined}>
      {FAIXA.linhas.map((l, li) => (
        <span key={l} className={styles.linha}>
          {l.split("").map((c, i) => <i key={i} style={{ "--k": li * 5 + i }}><b>{c}</b></i>)}
        </span>
      ))}
    </div>
  );
}

export default function OlxPalco() {
  const [aberto, setAberto] = useState(null);
  const palco = useRef(null), tras = useRef(null), frente = useRef(null), capa = useRef(null), capaImg = useRef(null), onda = useRef(null), luz = useRef(null), barra = useRef(null), ui = useRef(null);
  const o = ONDAS[FAIXA.id];
  const d = useMemo(() => o.p.map((v, k) => { const h = Math.max(0.6, (v / 99) * 19); return `M${k + 0.5},${(20 - h).toFixed(1)}V${(20 + h).toFixed(1)}`; }).join(""), [o]);

  useEffect(() => {
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });
    const lx = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    let raf = 0, H = innerHeight, suave = 0;
    const mede = () => { H = innerHeight; };
    addEventListener("resize", mede);
    const quadro = (t) => {
      raf = requestAnimationFrame(quadro);
      lx.raf(t);
      const el = palco.current; if (!el) return;
      const tot = el.offsetHeight - H;
      const p = clamp((scrollY - el.offsetTop) / tot);
      suave += (p - suave) * 0.2;
      const s = suave;
      tras.current.style.transform = `translate3d(${lerp(7, -12, s)}vw,${lerp(0, -3, s)}vh,0)`;
      frente.current.style.transform = `translate3d(${lerp(7, -46, s)}vw,${lerp(0, 3, s)}vh,0)`;
      frente.current.style.opacity = String(1 - clamp((s - 0.78) / 0.2));
      capa.current.style.transform = `translate3d(0,${lerp(16, -18, s)}vh,0) scale(${lerp(1.06, 0.94, s)})`;
      capaImg.current.style.transform = `translate3d(0,${lerp(-7, 7, s)}%,0) scale(1.25)`;
      onda.current.style.transform = `translate3d(${lerp(0, -16, s)}vw,0,0)`;
      luz.current.style.clipPath = `inset(0 ${(1 - s) * 100}% 0 0)`;
      barra.current.style.transform = `scaleX(${s})`;
      ui.current.style.opacity = String(1 - clamp((s - 0.85) / 0.15));
    };
    raf = requestAnimationFrame(quadro);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", mede); lx.destroy(); els.forEach((e, i) => { e.style.overflowX = antes[i]; }); };
  }, []);

  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") setAberto(null); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  const toca = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = clamp((e.clientX - r.left) / r.width, 0, 0.98);
    setAberto({ start: Math.floor(f * o.d) });
  };

  return (
    <main className={`${styles.raiz} ${serif.variable} ${sans.variable} ${mono.variable}`} style={{ "--cor": FAIXA.cor }}>
      <VoltarJodo />
      <section ref={palco} className={styles.runway}>
        <div className={styles.palco}>
          <div className={styles.fundo} aria-hidden="true" />
          <div ref={tras} className={styles.camada}><Titulo cls={styles.tras} oculto /></div>
          <div ref={capa} className={styles.capa} aria-hidden="true"><img ref={capaImg} src="/ol/teoria.webp" alt="" /></div>
          <div ref={frente} className={styles.camada}><Titulo cls={styles.frente} /></div>

          <button ref={onda} className={styles.onda} onClick={toca} aria-label="Tocar Olho Aberto a partir do ponto clicado">
            <svg viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>
            <svg ref={luz} className={styles.luz} viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>
          </button>

          <div ref={ui} className={styles.ui}>
            <p className={styles.topo}><b>{FAIXA.n}</b><span>{FAIXA.ep}</span></p>
            <p className={styles.frase}>{FAIXA.frase}</p>
            <p className={styles.meta}><span>{tempo(o.d)}</span><button onClick={() => setAberto({ start: 0 })}>ouvir ▸</button></p>
          </div>
          <i ref={barra} className={styles.barra} aria-hidden="true" />
        </div>
      </section>
      <p className={styles.nota}>Teste de 1 faixa (de 26). Role de volta para cima para rever.</p>

      {aberto && (
        <div className={styles.modal} onClick={() => setAberto(null)} role="dialog" aria-label="Olho Aberto">
          <div className={styles.player} onClick={(e) => e.stopPropagation()}>
            <iframe title="Olho Aberto" src={`https://www.youtube-nocookie.com/embed/${FAIXA.id}?autoplay=1&rel=0&start=${aberto.start || 0}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            <button className={styles.fechar} onClick={() => setAberto(null)}>fechar ×</button>
          </div>
        </div>
      )}
    </main>
  );
}
