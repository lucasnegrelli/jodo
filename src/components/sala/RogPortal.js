"use client";

import { useEffect, useRef, useState } from "react";
import { Big_Shoulders_Display, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { CENAS, LINKS, COR_FINAL } from "@/data/rogPortal";
import { TIPOS } from "@/data/rogEdicao";
import styles from "@/styles/rogPortal.module.css";

/*
  Rog: "O portal". Palco fixo (sticky) com 7 cenas; cada uma rola suas peças em parallax e termina mergulhando
  (zoom) numa imagem. A cor do mergulho vira o fundo da cena seguinte. Depois do palco, o índice de vídeos.
  Movimento por transform direto no rAF (sem estado do React no scroll).
*/
const display = Big_Shoulders_Display({ subsets: ["latin"], weight: ["800", "900"], variable: "--rp-display", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--rp-mono", display: "swap" });

const SV = 4; // viewports de rolagem por cena
const T = 200; // percurso das peças, em vh
const N = CENAS.length;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mistura = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };
const pad = (n) => String(n).padStart(2, "0");
const semFaixa = (e) => { const t = e.target; if (t.src.includes("maxresdefault")) t.src = t.src.replace("maxresdefault", "mqdefault"); };

export default function RogPortal() {
  const rolo = useRef(null);
  const cenas = useRef([]);
  const conts = useRef([]);
  const bgs = useRef([]);
  const portais = useRef([]);
  const pecas = useRef(CENAS.map(() => []));
  const capa = useRef(null);
  const cobre = useRef(null);
  const hud = useRef(null);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    // o layout global usa overflow-x: hidden em html e body, o que quebra o sticky do palco; aqui vira clip
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });
    let raf = 0, vh = innerHeight, ultimo = -1;
    const mede = () => { vh = innerHeight; ultimo = -1; };
    addEventListener("resize", mede);

    const quadro = () => {
      raf = requestAnimationFrame(quadro);
      const y = scrollY;
      if (y === ultimo) return;
      ultimo = y;
      const topo = rolo.current.offsetTop;
      const p = clamp((y - topo) / (vh * SV), 0, N - 0.0001);
      const i = Math.floor(p), s = p - i;
      const pi = clamp((s - 0.66) / 0.34); // progresso do mergulho
      const u = clamp(s / 0.72); // progresso do conteúdo

      for (let k = 0; k < N; k++) {
        const el = cenas.current[k];
        const atual = k === i, prox = k === i + 1 && pi > 0.75;
        if (!atual && !prox) { if (el.style.visibility !== "hidden") el.style.visibility = "hidden"; continue; }
        el.style.visibility = "visible";
        el.style.zIndex = atual ? 1 : 0;
        const c = CENAS[k];
        const uk = atual ? u : 0;
        bgs.current[k].style.background = mistura(c.c0, c.c1, uk);
        let op = 1, esc = 1;
        if (atual) op = 1 - suave(pi / 0.25);
        else { op = suave((pi - 0.8) / 0.2); esc = 1 + 0.12 * (1 - suave((pi - 0.8) / 0.2)); }
        conts.current[k].style.opacity = op;
        conts.current[k].style.transform = `scale(${esc})`;
        const ps = pecas.current[k];
        for (let j = 0; j < c.pecas.length; j++) {
          const d = c.pecas[j];
          const topoVh = d.rest + (d.a - uk) * T * d.v;
          ps[j].style.transform = `translate3d(0,${(topoVh * vh) / 100}px,0) rotate(${d.r || 0}deg)`;
        }
        const po = portais.current[k];
        if (atual) {
          po.style.opacity = suave(pi / 0.25);
          po.style.transform = `scale(${1 + Math.pow(pi, 1.6) * 5.5})`;
        } else po.style.opacity = 0;
      }
      // capa: o nome desliza devagar
      if (capa.current) capa.current.style.transform = `translate3d(0,${-u * 14}vh,0)`;
      // cobertura com a cor da cena seguinte
      const prox = i + 1 < N ? CENAS[i + 1].c0 : COR_FINAL;
      cobre.current.style.background = prox;
      cobre.current.style.opacity = suave((pi - 0.55) / 0.35);
      hud.current.dataset.cena = String(Math.min(i + (pi > 0.6 ? 1 : 0), N - 1));
      document.documentElement.style.setProperty("--rp-p", p.toFixed(3));
    };
    quadro();
    return () => {
      cancelAnimationFrame(raf); removeEventListener("resize", mede);
      els.forEach((e, i) => { e.style.overflowX = antes[i]; });
    };
  }, []);

  const ir = (k) => scrollTo({ top: rolo.current.offsetTop + k * SV * innerHeight, behavior: "smooth" });

  return (
    <main className={`${styles.raiz} ${display.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Rog" cor="#efece6" aoSubir={() => ir(0)} />

      <div ref={rolo} className={styles.rolo} style={{ height: `${(N * SV + 1) * 100}svh` }}>
        <div className={styles.palco}>
          {CENAS.map((c, k) => (
            <section key={c.id} ref={(el) => (cenas.current[k] = el)} className={styles.cena} aria-label={c.nome}>
              <div ref={(el) => (bgs.current[k] = el)} className={styles.bg} />
              <div ref={(el) => (conts.current[k] = el)} className={styles.conteudo}>
                {c.palavra && <div className={styles.palavra} aria-hidden="true">{c.palavra}</div>}
                {k === 0 && (
                  <div ref={capa} className={styles.capa}>
                    <h1><span>ROGÉRIO</span><span>SOARES</span></h1>
                    <p>vídeo · foto · pintura · design<br />Lisboa</p>
                  </div>
                )}
                {c.pecas.map((d, j) => (
                  <img
                    key={j}
                    ref={(el) => (pecas.current[k][j] = el)}
                    className={styles.peca}
                    src={`/rg/p/${pad(d.i)}.webp`}
                    alt=""
                    decoding="async"
                    loading={k < 2 ? "eager" : "lazy"}
                    style={{ "--x": d.x, "--w": d.w }}
                  />
                ))}
              </div>
              <img
                ref={(el) => (portais.current[k] = el)}
                className={styles.portal}
                src={`/rg/p/${pad(c.portal.i)}.webp`}
                alt=""
                style={{ objectPosition: `${c.portal.fx}% ${c.portal.fy}%`, transformOrigin: `${c.portal.fx}% ${c.portal.fy}%` }}
              />
            </section>
          ))}
          <div ref={cobre} className={styles.cobre} />
          <div className={styles.grao} aria-hidden="true" />
          <div ref={hud} className={styles.hud} data-cena="0">
            <div className={styles.rotulo}>
              {CENAS.map((c, k) => (
                <button key={c.id} onClick={() => ir(k)} data-k={k}><b>{pad(k + 1)}</b> {c.nome}</button>
              ))}
              <a href="#cinema"><b>08</b> Cinema</a>
            </div>
            <div className={styles.links}>
              <a href={LINKS.pinturas} target="_blank" rel="noopener noreferrer">pinturas ↗</a>
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">instagram ↗</a>
              <a href={LINKS.vimeo} target="_blank" rel="noopener noreferrer">vimeo ↗</a>
            </div>
          </div>
        </div>
      </div>

      <section id="cinema" className={styles.cinema}>
        <h2>CINEMA</h2>
        {TIPOS.map((t) => (
          <div key={t.id} className={styles.tipo}>
            <h3>{t.nome}</h3>
            <div className={styles.grade}>
              {t.itens.map((it) => (
                <button key={it.id} className={styles.card} onClick={() => setAberto(it)}>
                  <span className={styles.thumb}>
                    <img src={it.img} alt="" loading="lazy" onError={semFaixa} />
                  </span>
                  <span className={styles.t}>{it.t}</span>
                  <span className={styles.m}>{it.ano ? it.ano : ""}{it.d ? ` · ${it.d}` : ""}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className={styles.contato}>
          <a href={LINKS.pinturas} target="_blank" rel="noopener noreferrer">pinturas · @nogoddogon ↗</a>
          <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">instagram · @rogdog_ ↗</a>
          <a href={LINKS.vimeo} target="_blank" rel="noopener noreferrer">vimeo · rogeriosoares ↗</a>
          <button onClick={() => ir(0)}>↑ voltar ao cão</button>
        </div>
      </section>

      {aberto && (
        <div className={styles.modal} onClick={() => setAberto(null)} role="dialog" aria-label={aberto.t}>
          <div className={styles.player} onClick={(e) => e.stopPropagation()}>
            <iframe
              title={aberto.t}
              src={aberto.vimeo ? `https://player.vimeo.com/video/${aberto.vimeo}?autoplay=1&dnt=1&title=0&byline=0&portrait=0` : `https://www.youtube-nocookie.com/embed/${aberto.yt}?autoplay=1&rel=0`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
            <p>{aberto.t}{aberto.papel ? ` · ${aberto.papel}` : ""}</p>
            <button onClick={() => setAberto(null)}>fechar ×</button>
          </div>
        </div>
      )}
    </main>
  );
}
