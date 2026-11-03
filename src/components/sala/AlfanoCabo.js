"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { Unbounded, Inter_Tight, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LINKS, VIDEOS, PARCERIAS, FLYERS } from "@/data/alfano";
import styles from "@/styles/alfanoCabo.module.css";

/*
  Alfano: "O cabo". Um cabo de microfone vermelho desce da parte de cima da tela, atravessa a página (desenhado pela rolagem),
  segura os flyers do clipping como lambe e termina na tomada do contato. Fotos P&B dele; um só vermelho.
  O traçado é calculado a partir da posição das seções (data-cabo = fração da largura onde o cabo cruza a seção; "sag" = linha horizontal do clipping).
*/
const display = Unbounded({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--al-display", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--al-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--al-mono", display: "swap" });

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const semFaixa = (e) => { const t = e.target; if (t.src.includes("maxresdefault")) t.src = t.src.replace("maxresdefault", "mqdefault"); };
const placeholder = (e) => { const t = e.target; if (t.naturalWidth <= 120 && t.src.includes("maxresdefault")) t.src = t.src.replace("maxresdefault", "hqdefault"); };

export default function AlfanoCabo() {
  const raiz = useRef(null), svg = useRef(null), pCabo = useRef(null), pSombra = useRef(null), tomada = useRef(null);
  const flyers = useRef([]);
  const rolo = useRef(null), fita = useRef(null), prog = useRef(null);
  const lenis = useRef(null);
  const [intro, setIntro] = useState(true);
  const [aberto, setAberto] = useState(null);
  const topo = () => lenis.current?.scrollTo(0, { duration: 1.6 });
  const arrasto = useRef({ on: false, x0: 0, y0: 0, mexeu: false });
  const fator = () => { const r = rolo.current, f = fita.current; return (r.offsetHeight - innerHeight) / Math.max(1, f.scrollWidth - innerWidth + 60); };
  const topoRolo = () => rolo.current.getBoundingClientRect().top + scrollY;
  // setas: vão para o vídeo anterior/seguinte (posição da fita convertida em rolagem vertical)
  const passo = (dir) => {
    const f = fita.current, cards = [...f.children];
    if (innerWidth < 820) { f.scrollBy({ left: dir * (cards[0].offsetWidth + 14), behavior: "smooth" }); return; }
    const x = -(new DOMMatrixReadOnly(getComputedStyle(f).transform).m41);
    let i = cards.reduce((m, c, k) => (Math.abs(c.offsetLeft - innerWidth * 0.07 - x) < Math.abs(cards[m].offsetLeft - innerWidth * 0.07 - x) ? k : m), 0);
    i = Math.min(cards.length - 1, Math.max(0, i + dir));
    const alvoX = Math.min(f.scrollWidth - innerWidth + 60, Math.max(0, cards[i].offsetLeft - innerWidth * 0.07));
    lenis.current?.scrollTo(topoRolo() + alvoX * fator(), { duration: 1.1 });
  };
  const pDown = (e) => { if (e.pointerType !== "mouse" || e.button !== 0) return; arrasto.current = { on: true, x0: e.clientX, y0: scrollY, sl0: fita.current.scrollLeft, mexeu: false }; };
  const pMove = (e) => {
    const a = arrasto.current;
    if (!a.on) return;
    const dx = e.clientX - a.x0;
    if (Math.abs(dx) > 6) a.mexeu = true;
    if (a.mexeu && innerWidth < 820) { fita.current.style.scrollSnapType = "none"; fita.current.scrollLeft = a.sl0 - dx; } // layout de celular com mouse: arrasta a própria fita
    else if (a.mexeu) lenis.current?.scrollTo(a.y0 - dx * fator(), { immediate: true });
  };
  const pUp = () => { arrasto.current.on = false; if (fita.current) fita.current.style.scrollSnapType = ""; setTimeout(() => { arrasto.current.mexeu = false; }, 0); };

  useEffect(() => {
    // o layout global usa overflow-x: hidden em html e body; aqui vira clip
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });

    const lx = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, gestureOrientation: "both" });
    lenis.current = lx;
    // entrada: a rolagem fica travada até a cortina subir
    const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduz) { lx.stop(); scrollTo(0, 0); }
    const tIntro = setTimeout(() => { lx.start(); setIntro(false); }, reduz ? 0 : 2300);
    let amostras = [], L = 0, raf = 0, ultimo = -1, H = innerHeight;

    const monta = () => {
      const m = raiz.current;
      if (!m) return;
      const W = m.clientWidth, PH = m.offsetHeight;
      svg.current.setAttribute("viewBox", `0 0 ${W} ${PH}`);
      svg.current.style.height = `${PH}px`;
      const secs = [...m.querySelectorAll("[data-cabo]")];
      if (rolo.current && fita.current) rolo.current.style.height = W < 820 ? "" : `${(fita.current.scrollWidth - W) * 0.48 + innerHeight}px`;
      if (fita.current) {
        if (W < 820) { fita.current.setAttribute("data-lenis-prevent-touch", ""); fita.current.setAttribute("data-lenis-prevent-wheel", ""); fita.current.style.transform = ""; }
        else { fita.current.removeAttribute("data-lenis-prevent-touch"); fita.current.removeAttribute("data-lenis-prevent-wheel"); }
      }
      const cel = W < 820; // no celular o cabo fica colado na borda esquerda, fora do texto
      const pts = [{ x: W * (cel ? 0.03 : 0.94), y: -20 }];
      let d = `M ${pts[0].x} ${pts[0].y}`;
      let ant = pts[0];
      const vai = (x, y) => { const dy = (y - ant.y) * 0.45; d += ` C ${ant.x} ${ant.y + dy} ${x} ${y - dy} ${x} ${y}`; ant = { x, y }; };
      let fim = ant;
      secs.forEach((s) => {
        const top = s.offsetTop, h = s.offsetHeight;
        if (s.dataset.cabo === "sag") {
          const y = top + h * 0.2, sag = Math.min(70, W * 0.05);
          vai(W * 0.03, y);
          d += ` Q ${W * 0.5} ${y + 2 * sag} ${W * 0.97} ${y}`;
          ant = { x: W * 0.97, y };
          flyers.current.forEach((f, i) => {
            if (!f) return;
            const t = [0.2, 0.5, 0.8][i];
            const fy = y + 4 * sag * t * (1 - t), fx = W * 0.03 + W * 0.94 * t;
            f.style.left = `${fx}px`; f.style.top = `${fy - top}px`;
          });
        } else if (s.dataset.cabo === "fim") {
          vai(W * (cel ? 0.97 : +s.dataset.x || 0.3), top + h * 0.62);
          fim = ant;
        } else vai(W * (cel ? 0.03 : +s.dataset.cabo), top + h * 0.5);
      });
      pCabo.current.setAttribute("d", d);
      pSombra.current.setAttribute("d", d);
      L = pCabo.current.getTotalLength();
      pCabo.current.style.strokeDasharray = `${L} ${L}`;
      pSombra.current.style.strokeDasharray = `${L} ${L}`;
      amostras = [];
      const N = 600;
      for (let i = 0; i <= N; i++) { const p = pCabo.current.getPointAtLength((L * i) / N); amostras.push([p.y, (L * i) / N]); }
      tomada.current.style.left = `${fim.x}px`;
      tomada.current.style.top = `${fim.y}px`;
      ultimo = -1;
    };

    const quadro = (tempo) => {
      raf = requestAnimationFrame(quadro);
      lx.raf(tempo);
      const y = scrollY;
      // parallax suavizado: cada elemento persegue o alvo (lerp), então o movimento continua depois que a rolagem para
      let mexendo = false;
      document.querySelectorAll("[data-par],[data-sp]").forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -300 || r.top > H + 300) return;
        const c = r.top + r.height / 2 - H / 2;
        const alvo = -c * +(el.dataset.par || el.dataset.sp);
        const v = (el._v ?? alvo) + (alvo - (el._v ?? alvo)) * 0.1;
        if (Math.abs(alvo - v) > 0.05) mexendo = true;
        el._v = v;
        el.style.transform = el.dataset.par ? `translate3d(0,${v.toFixed(2)}px,0) scale(1.18)` : `translate3d(0,${v.toFixed(2)}px,0)`;
      });
      // vídeos: a rolagem vertical corre a fita na horizontal (fixa na tela); no celular é rolagem lateral normal
      if (rolo.current && fita.current && innerWidth >= 820) {
        const r = rolo.current.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - H)));
        fita.current.style.transform = `translate3d(${-p * (fita.current.scrollWidth - innerWidth + 60)}px,0,0)`;
        if (prog.current) prog.current.style.transform = `scaleX(${p})`;
      }
      if (y === ultimo && !mexendo) return;
      ultimo = y;
      // cabo: desenha até a altura de 70% da tela
      const alvo = y + H * 0.7;
      let len = 0;
      for (let i = 0; i < amostras.length; i++) { if (amostras[i][0] <= alvo) len = amostras[i][1]; else break; }
      const desenhado = len;
      const off = L - desenhado;
      pCabo.current.style.strokeDashoffset = off;
      pSombra.current.style.strokeDashoffset = off;
      tomada.current.style.opacity = desenhado >= L * 0.995 ? 1 : 0;
    };

    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add(styles.vis); }), { threshold: 0.15 });
    document.querySelectorAll("[data-rev]").forEach((e) => io.observe(e));

    // thumbs do YouTube que vieram como placeholder de 120x90 (sem maxres): troca pela hqdefault
    const arruma = () => document.querySelectorAll("img[src*='maxresdefault']").forEach((i) => { if (i.complete && i.naturalWidth > 0 && i.naturalWidth <= 120) i.src = i.src.replace("maxresdefault", "hqdefault"); });
    arruma();
    const tA = setTimeout(arruma, 800), tB = setTimeout(arruma, 2500);
    const refaz = () => { H = innerHeight; monta(); };
    refaz();
    const t1 = setTimeout(monta, 600), t2 = setTimeout(monta, 2000);
    const ro = new ResizeObserver(() => monta());
    ro.observe(raiz.current);
    addEventListener("resize", refaz);
    document.fonts?.ready.then(monta);
    quadro();
    return () => {
      cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); ro.disconnect(); io.disconnect();
      removeEventListener("resize", refaz);
      clearTimeout(tIntro); clearTimeout(tA); clearTimeout(tB); lx.destroy(); lenis.current = null;
      els.forEach((e, i) => { e.style.overflowX = antes[i]; });
    };
  }, []);

  useEffect(() => { if (aberto) lenis.current?.stop(); else lenis.current?.start(); }, [aberto]);

  return (
    <main ref={raiz} className={`${styles.raiz} ${display.variable} ${sans.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Alfano" cor="#f2f0ea" aoSubir={topo} fonte="var(--al-display), sans-serif" escala={0.8} />

      <svg ref={svg} className={styles.cabo} preserveAspectRatio="none" aria-hidden="true">
        <path ref={pSombra} className={styles.sombra} fill="none" />
        <path ref={pCabo} className={styles.fio} fill="none" />
      </svg>

      {intro && <div className={styles.intro} aria-hidden="true"><i /><b>Alfano</b></div>}
      <div ref={tomada} className={styles.tomada} aria-hidden="true"><i /><i /></div>

      {/* capa */}
      <section className={styles.capa} data-cabo="0.94">
        <div className={styles.capaFoto}><img data-par="0.12" src="/al/capa.webp" alt="Alfano com a mão no rosto, segurando o microfone" fetchPriority="high" /></div>
        <h1 data-sp="0.28" aria-label="Alfano">{"Alfano".split("").map((l, i) => <span key={i} aria-hidden="true" style={{ "--i": i }}><em>{l}</em></span>)}</h1>
        <p className={styles.sub}>MC · multi-artista independente<br />Zona Sul, São Paulo</p>
        <button className={styles.descer} onClick={() => lenis.current?.scrollTo("#release", { duration: 1.6 })}>rolar ↓</button>
      </section>

      {/* release */}
      <section id="release" className={styles.release} data-cabo="0.92">
        <div className={styles.releaseTxt} data-rev>
          <div data-sp="0.07">
            <span className={styles.rotulo}>Release</span>
            <p className={styles.frase}>Expressa com toda sua arte a vida e faz da sua vida a própria arte.</p>
            <p className={styles.corpo}>Multi-artista independente da Zona Sul de São Paulo. Faz parte dos coletivos Inadequadxs e Sol1 na Missão.</p>
          </div>
        </div>
        <div className={styles.releaseFoto} data-rev><div className={styles.cortina}><img data-par="0.1" src="/al/release.webp" alt="Alfano cantando entre as plantas" loading="lazy" /></div></div>
      </section>

      {/* trajetória */}
      <section className={styles.traj} data-cabo="0.08">
        <div className={styles.trajFoto} data-rev><div className={styles.cortina}><img data-par="0.09" src="/al/trajetoria.webp" alt="Alfano com a mão no microfone" loading="lazy" /></div></div>
        <div className={styles.trajTxt} data-rev>
          <span className={styles.rotulo}>Trajetória</span>
          <div className={styles.sete} data-sp="-0.06">7<small>anos de carreira,<br />quase</small></div>
          <ul>
            <li>Solo e em colaboração com os coletivos.</li>
            <li>Palcos e internet, em vários espaços de São Paulo.</li>
          </ul>
        </div>
      </section>

      {/* música */}
      <section id="musica" className={styles.musica} data-cabo="0.03">
        <div ref={rolo} className={styles.rolo}>
          <div className={styles.palcoV}>
            <div className={styles.musicaTop}>
              <span className={styles.rotulo}>Ouvir e assistir</span>
              <h2>{VIDEOS.length} vídeos no canal</h2>
            </div>
            <div ref={fita} className={styles.fita} onPointerDown={pDown} onPointerMove={pMove} onPointerUp={pUp} onPointerLeave={pUp} onClickCapture={(e) => { if (arrasto.current.mexeu) { e.stopPropagation(); e.preventDefault(); } }}>
              {VIDEOS.map((v, n) => (
                <button key={v.id} className={styles.card} onClick={() => setAberto(v)} aria-label={`Assistir ${v.t}`}>
                  <span className={styles.thumb}>
                    <img src={`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`} alt="" loading="lazy" onLoad={placeholder} onError={semFaixa} />
                    <b>{String(n + 1).padStart(2, "0")}</b>
                    <i aria-hidden="true">▸</i>
                  </span>
                  <span className={styles.titulo}>{v.t}</span>
                  {v.c && <span className={styles.meta}>{v.c}</span>}
                </button>
              ))}
            </div>
            <div className={styles.palcoBase}>
              <div className={styles.barra}><i ref={prog} /></div>
              <div className={styles.setas}>
                <button onClick={() => passo(-1)} aria-label="Vídeo anterior">←</button>
                <button onClick={() => passo(1)} aria-label="Próximo vídeo">→</button>
              </div>
              <div className={styles.ouvir}>
                <a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify ↗</a>
                <a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud ↗</a>
                <a href={LINKS.playlist} target="_blank" rel="noopener noreferrer">Playlist “Até Quando” ↗</a>
                <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube ↗</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* além de si */}
      <section className={styles.alem} data-cabo="0.06">
        <div className={styles.alemFoto} data-rev><div className={styles.cortina}><img data-par="0.1" src="/al/alem.webp" alt="Alfano de olhos fechados, cantando" loading="lazy" /></div></div>
        <div className={styles.alemTxt} data-rev>
          <div data-sp="0.07">
            <span className={styles.rotulo}>Além de si</span>
            <p className={styles.frase}>Assina projetos de vários artistas de São Paulo.</p>
            <p className={styles.corpo}>Faz parte do <a href={LINKS.gang} target="_blank" rel="noopener noreferrer">Inadequados Gang</a>, coletivo da Zona Sul, e tem faixas com outros nomes da cena.</p>
          </div>
        </div>
        <div className={styles.faixaNomes} aria-label="Faixas com">
          <span className={styles.faixaRotulo}>Faixas com</span>
          <div>{[...PARCERIAS, ...PARCERIAS].map((n, i) => <span key={i}>{n}</span>)}</div>
        </div>
      </section>

      {/* clipping */}
      <section className={styles.clip} data-cabo="sag">
        <span className={styles.rotulo}>Clipping</span>
        <div className={styles.flyers}>
          {FLYERS.map((f, i) => (
            <figure key={f.t} ref={(el) => (flyers.current[i] = el)} className={styles.flyer} style={{ "--r": `${f.rot}deg`, "--d": `${i * 0.7}s` }}>
              <i className={styles.pino} aria-hidden="true" />
              <img src={f.img} alt={`Flyer: ${f.t}`} loading="lazy" />
              <figcaption><b>{f.t}</b>{f.d}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* contato */}
      <section className={styles.contato} data-cabo="fim" data-x="0.978">
        <div className={styles.contatoTxt}>
          <span className={styles.rotulo}>Contato</span>
          <a className={styles.mail} href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
          <ul>
            <li><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram <span>@alfanosoueu_</span></a></li>
            <li><a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify <span>Alfano</span></a></li>
            <li><a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube <span>@afn574R</span></a></li>
            <li><a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud <span>alfanosoueu</span></a></li>
          </ul>
        </div>
        <div className={styles.contatoFoto}><img src="/al/contato.webp" alt="Alfano levantando o braço, de microfone" loading="lazy" /></div>
        <button className={styles.topo} onClick={topo}>↑ topo</button>
      </section>

      {aberto && (
        <div className={styles.modal} onClick={() => setAberto(null)} role="dialog" aria-label={aberto.t}>
          <div className={styles.player} onClick={(e) => e.stopPropagation()}>
            <iframe title={aberto.t} src={`https://www.youtube-nocookie.com/embed/${aberto.id}?autoplay=1&rel=0`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            <p>Alfano · {aberto.t}{aberto.c ? ` · ${aberto.c}` : ""}</p>
            <button onClick={() => setAberto(null)}>fechar ×</button>
          </div>
        </div>
      )}
    </main>
  );
}
