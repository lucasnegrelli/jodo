"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Fraunces, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LINKS } from "@/data/rogPortal";
import { TIPOS } from "@/data/rogEdicao";
import styles from "@/styles/rogFilme.module.css";

/*
  Rog: página única, vídeo primeiro, depois design; foto e pintura só como detalhe.
  1 Abertura: nome grande sobre frames dele de hoje, trocando devagar.
  2 Selecionados: 8 trabalhos, um por sessão em tela cheia; a rolagem troca de sessão com uma cortina; o da vez toca mudo.
  3 Todos: índice compacto (lista com prévia no hover). 4 Design. 5 Foto + pinturas (detalhe). 6 O que faz + contato.
  Movimento por transform/clip-path direto no rAF.
*/
const display = Fraunces({ subsets: ["latin"], weight: ["300", "400"], style: ["normal", "italic"], variable: "--rf-display", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--rf-mono", display: "swap" });

// os 8 selecionados (escolha pela qualidade de imagem e por serem recentes; o Rog pode trocar)
// quadros da abertura: miniaturas do Vimeo em 1920x1080 (public/rg/hero), só os mais nítidos e sem logo de marca
const HERO_IDS = ["1167917096", "533302315", "530125211", "844972951", "962599086"];
const SEL_IDS = ["367927913", "1167905827", "1167917096", "533302315", "530125211", "844972951", "408975542", "962599086"];
const PER = 0.9; // viewports de rolagem por sessão
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
const pad = (n) => String(n).padStart(2, "0");
const P = (n) => `/rg/p/${pad(n)}.webp`;
const semFaixa = (e) => { const t = e.target; if (t.src.includes("maxresdefault")) t.src = t.src.replace("maxresdefault", "mqdefault"); };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };

const COLUNAS = [
  { dir: 1, itens: [65, 66, 72, 77, 68, 69] },
  { dir: -1, itens: [9, 12, 13, 14, 15, 17, 20, 23] },
  { dir: 1, itens: [76, 86, 70, 71, 73] },
];
const CORES = ["#1d9a52", "#1a78b8", "#8a5a2b"];
const FAIXA = [1, 26, 39, 44, 3, 79, 33, 54, 36, 24, 45, 80, 58, 2];
const TELAS = [57, 64, 0, 59];
const SERVICOS = ["Direção", "Fotografia", "Edição", "Finalização e cor"];

export default function RogFilme() {
  const todos = useMemo(() => TIPOS.flatMap((t) => t.itens.map((it) => ({ ...it, tipo: t.nome }))), []);
  const sel = useMemo(() => SEL_IDS.map((id) => todos.find((i) => i.id === id)), [todos]);
  const n = sel.length;

  const [foco, setFoco] = useState(0);
  const [toca, setToca] = useState(-1);
  const [aberto, setAberto] = useState(null);
  const [previa, setPrevia] = useState(null);
  const [quadro0, setQuadro0] = useState(0);
  const nHero = HERO_IDS.length;
  const [pronto, setPronto] = useState({});
  const alvo = useRef({ x: 0, y: 0 }), pos = useRef({ x: 0, y: 0 }), prevEl = useRef(null);

  const secSel = useRef(null), camadas = useRef([]), fundos = useRef([]);
  const desg = useRef(null), desgPalco = useRef(null), colunas = useRef([]), palavra = useRef(null);
  const faixa = useRef(null);
  const ultimoFoco = useRef(0);

  // abertura: troca de frame a cada 4 s
  useEffect(() => {
    const t = setInterval(() => setQuadro0((q) => (q + 1) % nHero), 4000);
    return () => clearInterval(t);
  }, [nHero]);

  useEffect(() => {
    // o layout global usa overflow-x: hidden em html e body, o que quebra o sticky; aqui vira clip
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });
    let raf = 0, ultimo = -1, H = innerHeight;
    const mede = () => { H = innerHeight; ultimo = -1; };
    addEventListener("resize", mede);

    const quadro = () => {
      raf = requestAnimationFrame(quadro);
      const y = scrollY;
      if (y === ultimo) return;
      ultimo = y;

      // selecionados: cortina vertical entre sessões
      const s = secSel.current;
      if (s) {
        const p = clamp((y - s.offsetTop) / (s.offsetHeight - H));
        const f = p * (n - 1);
        const i = Math.min(Math.floor(f), n - 1), t = f - i;
        for (let k = 0; k < n; k++) {
          const c = camadas.current[k];
          if (k <= i) {
            c.style.visibility = "visible"; c.style.clipPath = "inset(0 0 0 0)";
            fundos.current[k].style.transform = `scale(${1 + (k === i ? 0.07 * t : 0.07)})`;
          } else if (k === i + 1) {
            const e = ease((t - 0.3) / 0.7);
            c.style.visibility = e > 0 ? "visible" : "hidden";
            c.style.clipPath = `inset(${(1 - e) * 100}% 0 0 0)`;
            fundos.current[k].style.transform = `scale(${1.1 - 0.1 * e})`;
          } else c.style.visibility = "hidden";
        }
        const fi = Math.min(i + (t > 0.6 ? 1 : 0), n - 1);
        if (fi !== ultimoFoco.current) { ultimoFoco.current = fi; setFoco(fi); }
      }

      // design
      const dg = desg.current;
      if (dg) {
        const p = clamp((y - dg.offsetTop) / (dg.offsetHeight - H));
        desgPalco.current.style.background = p < 0.5 ? mix(CORES[0], CORES[1], p * 2) : mix(CORES[1], CORES[2], (p - 0.5) * 2);
        colunas.current.forEach((c, k) => {
          if (!c) return;
          const sobra = c.offsetHeight - H;
          c.style.transform = `translate3d(0,${COLUNAS[k].dir === 1 ? -p * sobra : -(1 - p) * sobra}px,0)`;
        });
        palavra.current.style.transform = `translate3d(${(-p * 12).toFixed(2)}vw,0,0)`;
      }

      // foto: faixa que desliza
      const fx = faixa.current;
      if (fx) {
        const rect = fx.parentElement.getBoundingClientRect();
        const t = clamp((H - rect.top) / (H + rect.height));
        fx.style.transform = `translate3d(${-t * (fx.scrollWidth - innerWidth)}px,0,0)`;
      }
    };
    quadro();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", mede); els.forEach((e, i) => { e.style.overflowX = antes[i]; }); };
  }, [n]);

  // o vídeo da sessão começa depois de ~0,35 s parado nela; o da próxima já é carregado junto, para não aparecer o poster
  useEffect(() => {
    setToca(-1);
    const t = setTimeout(() => setToca(foco), 350);
    return () => clearTimeout(t);
  }, [foco]);

  // prévia do índice: segue o cursor com atraso suave
  useEffect(() => {
    const mv = (e) => { alvo.current = { x: e.clientX, y: e.clientY }; };
    addEventListener("pointermove", mv);
    let r = 0;
    const loop = () => {
      r = requestAnimationFrame(loop);
      const a = alvo.current, p = pos.current;
      p.x += (a.x - p.x) * 0.14; p.y += (a.y - p.y) * 0.14;
      if (prevEl.current) prevEl.current.style.transform = `translate3d(${p.x + 28}px,${p.y - 110}px,0)`;
    };
    loop();
    return () => { removeEventListener("pointermove", mv); cancelAnimationFrame(r); };
  }, []);

  const irSel = (i) => {
    const s = secSel.current;
    scrollTo({ top: s.offsetTop + (i / (n - 1)) * (s.offsetHeight - innerHeight), behavior: "smooth" });
  };
  const irId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className={`${styles.raiz} ${display.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Rog" cor="#efece6" aoSubir={() => scrollTo({ top: 0, behavior: "smooth" })} fonte="var(--rf-display), serif" escala={1.2} />

      {/* 1 abertura */}
      <section className={styles.abertura}>
        {HERO_IDS.map((id, k) => (
          <img key={id} className={`${styles.frame} ${k === quadro0 ? styles.frameOn : ""}`} src={`/rg/hero/${id}.webp`} alt="" width="1920" height="1080" />
        ))}
        <div className={styles.veu} />
        <h1 className={styles.nome}><span>Rogério</span><span><em>Soares</em></span></h1>
        <div className={styles.base}>
          <p>Direção · Fotografia · Edição · Finalização<br />Lisboa, desde 2015</p>
          <nav>
            <button onClick={() => irId("selecionados")}>Vídeo ↓</button>
            <button onClick={() => irId("design")}>Design ↓</button>
            <button onClick={() => irId("foto")}>Foto ↓</button>
            <button onClick={() => irId("contato")}>Contato ↓</button>
          </nav>
        </div>
      </section>

      {/* 2 selecionados */}
      <section id="selecionados" ref={secSel} className={styles.sel} style={{ height: `${((n - 1) * PER + 1) * 100}svh` }}>
        <div className={styles.palcoSel}>
          {sel.map((it, k) => (
            <div key={it.id} ref={(el) => (camadas.current[k] = el)} className={styles.camada} style={{ zIndex: k + 1 }}>
              <div ref={(el) => (fundos.current[k] = el)} className={styles.fundo}>
                <img className={pronto[k] && (toca === k || toca === k - 1) ? "" : styles.borra} src={it.img} alt="" loading={k < 2 ? "eager" : "lazy"} onError={semFaixa} />
                {(toca === k || toca === k - 1) && it.vimeo && (
                  <iframe
                    className={`${styles.vid} ${pronto[k] ? styles.vidOn : ""}`}
                    title={it.t}
                    src={`https://player.vimeo.com/video/${it.vimeo}?background=1&autoplay=1&loop=1&muted=1&dnt=1`}
                    allow="autoplay"
                    tabIndex={-1}
                    onLoad={() => setPronto((p) => ({ ...p, [k]: true }))}
                  />
                )}
              </div>
              <div className={styles.veuSel} />
              <div className={styles.num} aria-hidden="true">{pad(k + 1)}</div>
              <div className={styles.legenda}>
                <span className={styles.tipo}>{it.tipo}</span>
                <h2>{it.t}</h2>
                <p>{[it.ano, it.d, it.papel].filter(Boolean).join(" · ")}{it.jodo ? " · JODO" : ""}</p>
                <button onClick={() => setAberto(it)}>assistir completo ▸</button>
              </div>
            </div>
          ))}
          <div className={styles.rotuloSel}>Selecionados · {pad(foco + 1)} / {pad(n)}</div>
          <ol className={styles.lista}>
            {sel.map((it, k) => (
              <li key={it.id}><button className={k === foco ? styles.on : ""} onClick={() => irSel(k)} aria-label={it.t}>{pad(k + 1)}</button></li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 todos os trabalhos */}
      <section className={styles.todos}>
        <h2>Todos os <em>trabalhos</em></h2>
        {TIPOS.map((t) => (
          <div key={t.id} className={styles.grupo}>
            <h3>{t.nome}</h3>
            <ul>
              {t.itens.map((it) => (
                <li key={it.id}>
                  <button onClick={() => setAberto(it)} onMouseEnter={() => setPrevia(it)} onMouseLeave={() => setPrevia(null)} onFocus={() => setPrevia(it)} onBlur={() => setPrevia(null)}>
                    <b>{pad(todos.findIndex((x) => x.id === it.id && x.tipo === t.nome) + 1)}</b>
                    <span>{it.t}</span>
                    <i>{[it.ano, it.d].filter(Boolean).join(" · ")}</i>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div ref={prevEl} className={`${styles.previa} ${previa ? styles.previaOn : ""}`} aria-hidden="true">
          {previa && <img src={previa.img} alt="" onError={semFaixa} />}
        </div>
      </section>

      {/* 4 design */}
      <section id="design" ref={desg} className={styles.desg} style={{ height: "300svh" }}>
        <div ref={desgPalco} className={styles.palcoDesg} style={{ background: CORES[0] }}>
          <div ref={palavra} className={styles.palavraDesg} aria-hidden="true">Design</div>
          <div className={styles.cols}>
            {COLUNAS.map((c, k) => (
              <div key={k} ref={(el) => (colunas.current[k] = el)} className={`${styles.col} ${k === 2 ? styles.colExtra : ""}`}>
                {c.itens.map((i) => <img key={i} src={P(i)} alt="" loading="lazy" decoding="async" />)}
              </div>
            ))}
          </div>
          <p className={styles.nota}>Cartazes e posts para redes<br />identidade e campanhas</p>
        </div>
      </section>

      {/* 5 foto e pintura (detalhe) */}
      <section id="foto" className={styles.foto}>
        <h2>Foto</h2>
        <div className={styles.faixaMask}>
          <div ref={faixa} className={styles.faixa}>
            {FAIXA.map((i) => <img key={i} src={P(i)} alt="" loading="lazy" decoding="async" />)}
          </div>
        </div>
        <div className={styles.telas}>
          <span>também pinta ↘</span>
          {TELAS.map((i) => <img key={i} src={P(i)} alt="" loading="lazy" />)}
          <a href={LINKS.pinturas} target="_blank" rel="noopener noreferrer">@nogoddogon ↗</a>
        </div>
      </section>

      {/* 6 o que faz + contato */}
      <footer id="contato" className={styles.fim}>
        <p className={styles.chamada}>Precisa de imagem para o seu projeto?</p>
        <ul className={styles.servicos}>{SERVICOS.map((s) => <li key={s}>{s}</li>)}</ul>
        <a className={styles.botao} href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Chamar no Instagram ↗</a>
        <a className={styles.tela} href={LINKS.pinturas} target="_blank" rel="noopener noreferrer">
          <img src={P(57)} alt="Pintura de Rog" loading="lazy" />
          <span>pinturas ↗ @nogoddogon</span>
        </a>
        <div className={styles.rog} aria-hidden="true">Rog</div>
        <div className={styles.links}>
          <a href={LINKS.vimeo} target="_blank" rel="noopener noreferrer">vimeo ↗ <small>rogeriosoares</small></a>
          <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">instagram ↗ <small>@rogdog_</small></a>
          <a href={LINKS.pinturas} target="_blank" rel="noopener noreferrer">pinturas ↗ <small>@nogoddogon</small></a>
          <button onClick={() => scrollTo({ top: 0, behavior: "smooth" })}>↑ topo</button>
        </div>
      </footer>

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
