"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import { Newsreader, Inter_Tight, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LINKS, EPS, NOMES, ESTRELAS, PRODUCOES, BEATS, NA_JODO, mini } from "@/data/olx";
import styles from "@/styles/olxOlho.module.css";

/*
  Herick OLX: "Olho Aberto". A página abre no macro do olho (foto de perfil dele); a pupila vira o buraco negro e a rolagem entra
  na órbita de "Teoria dos Versos": os EPs viram planetas e as letras giram em volta. Depois: os três nomes, a constelação de
  parcerias, o Zumbi Studio (mesa de mixagem), os beats por BPM, a JODO e o contato.
  Movimento por transform direto no rAF; rolagem suave com Lenis.
*/
const serif = Newsreader({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--ol-serif", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--ol-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--ol-mono", display: "swap" });

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const pad = (n) => String(n).padStart(2, "0");
const LETRAS = "TEORIA DOS VERSOS · ".repeat(3).split("");
// estrelas de fundo (posições fixas, sem aleatório, para não dar diferença entre servidor e navegador)
const FUNDO = Array.from({ length: 80 }, (_, i) => { const a = (i * 7919) % 1000, b = (i * 104729) % 1000; return { x: a / 10, y: b / 10, s: 1 + ((i * 31) % 3) }; });
const ORBITAS = [{ k: 0.19, v: 1, fase: 0.3 }, { k: 0.31, v: 0.7, fase: 2.4 }, { k: 0.43, v: 0.5, fase: 4.4 }];

export default function OlxOlho() {
  const [intro, setIntro] = useState(true);
  const [ep, setEp] = useState(0);
  const [aberto, setAberto] = useState(null); // { id, t, lista? }
  const [estrela, setEstrela] = useState(null);
  const [toca, setToca] = useState(null);
  const lenis = useRef(null);
  const ab = useRef(null), olho = useRef(null), buraco = useRef(null), nome = useRef(null), dica = useRef(null);
  const orb = useRef(null), anel = useRef(null), planetas = useRef([]), orbSvg = useRef(null);
  const mesa = useRef(null), fader = useRef([]);
  const epAtual = EPS[ep];
  const ligadas = useMemo(() => ESTRELAS, []);
  const topo = () => lenis.current?.scrollTo(0, { duration: 1.6 });
  const ir = (id) => lenis.current?.scrollTo(document.getElementById(id), { duration: 1.6, offset: -10 });

  useEffect(() => {
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });
    const lx = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, gestureOrientation: "both" });
    lenis.current = lx;
    const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduz) { lx.stop(); scrollTo(0, 0); }
    const tIntro = setTimeout(() => { lx.start(); setIntro(false); }, reduz ? 0 : 2200);

    let raf = 0, W = innerWidth, H = innerHeight;
    const mede = () => { W = innerWidth; H = innerHeight; };
    addEventListener("resize", mede);

    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add(styles.vis); }), { threshold: 0.2 });
    document.querySelectorAll("[data-rev]").forEach((e) => io.observe(e));

    const quadro = (tempo) => {
      raf = requestAnimationFrame(quadro);
      lx.raf(tempo);
      const y = scrollY;

      // 1: abertura, a pupila vira o buraco negro
      if (ab.current && olho.current) {
        const top = ab.current.offsetTop, tot = ab.current.offsetHeight - H;
        const p = clamp((y - top) / tot);
        const r = olho.current.getBoundingClientRect();
        const cx = r.left + r.width * 0.7, cy = r.top + r.height * 0.41;
        const d = 10 + Math.pow(p, 2.8) * Math.max(W, H) * 3.1;
        const b = buraco.current.style;
        b.left = `${cx}px`; b.top = `${cy}px`; b.width = `${d}px`; b.height = `${d}px`;
        nome.current.style.opacity = String(1 - suave(p / 0.5));
        nome.current.style.transform = `translate3d(0,${-p * 14}vh,0)`;
        dica.current.style.opacity = String(1 - suave(p / 0.15));
        olho.current.style.transform = `scale(${1 + p * 0.12})`;
      }

      // 2: órbita
      if (orb.current) {
        const top = orb.current.offsetTop, tot = orb.current.offsetHeight - H;
        const p = clamp((y - top) / tot);
        const cel = W < 820;
        const cx = W / 2, cy = H * (cel ? 0.42 : 0.5), t = tempo * 0.00004;
        const tam = Math.min(cel ? 120 : 210, Math.min(W, H) * 0.24);
        anel.current.style.transform = `translate(-50%,-50%) rotate(${p * 360 + tempo * 0.004}deg)`;
        planetas.current.forEach((el, i) => {
          if (!el) return;
          const o = ORBITAS[i], rx = W * (cel ? o.k * 1.05 : o.k * 1.12), ry = rx * (cel ? 0.5 : 0.34);
          const a = o.fase + p * Math.PI * 2 * 1.2 * o.v + t * o.v * 8;
          const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
          const fi = -0.2; // inclinação da órbita
          const X = px * Math.cos(fi) - py * Math.sin(fi), Y = px * Math.sin(fi) + py * Math.cos(fi);
          const prof = (Math.sin(a) + 1) / 2;
          const esc = 0.72 + prof * 0.4;
          el.style.transform = `translate3d(${cx + X - tam / 2}px,${cy + Y - tam / 2}px,0) scale(${esc})`;
          el.style.zIndex = String(Math.round(prof * 100));
          el.style.width = `${tam}px`; el.style.height = `${tam}px`;
          el.style.opacity = String(0.55 + prof * 0.45);
        });
        if (orbSvg.current) { orbSvg.current.style.transform = "translate(-50%,-50%) rotate(-11deg)"; }
      }

      // 5: faders do estúdio
      if (mesa.current) {
        const r = mesa.current.getBoundingClientRect();
        const p = clamp((H - r.top) / (H + r.height));
        fader.current.forEach((f, i) => { if (f) f.style.top = `calc(${(Math.sin(p * 7 + i * 1.7) * 0.5 + 0.5) * 100}% - 6px)`; });
      }
    };
    raf = requestAnimationFrame(quadro);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(tIntro); io.disconnect();
      removeEventListener("resize", mede); lx.destroy(); lenis.current = null;
      els.forEach((e, i) => { e.style.overflowX = antes[i]; });
    };
  }, []);

  useEffect(() => { if (aberto) lenis.current?.stop(); else lenis.current?.start(); }, [aberto]);

  const tocar = (id, t, lista) => setAberto({ id, t, lista });

  return (
    <main className={`${styles.raiz} ${serif.variable} ${sans.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Herick OLX" cor="#efe8e0" aoSubir={topo} />
      {intro && <div className={styles.intro} aria-hidden="true" />}

      {/* 1 abertura */}
      <section ref={ab} className={styles.abertura} style={{ height: "280svh" }}>
        <div className={styles.palcoAb}>
          <div className={styles.abre}>
            <img ref={olho} className={styles.olho} src="/ol/olho.webp" alt="Olho de Herick OLX, em close" fetchPriority="high" />
            <div ref={nome} className={styles.nome}>
              <h1><span>Herick</span><span><em>OLX</em></span></h1>
              <p>MC · Canguru Zurado · Zumbi Studio</p>
            </div>
            <p ref={dica} className={styles.dica}>role ↓</p>
          </div>
          <div ref={buraco} className={styles.buraco} aria-hidden="true" />
        </div>
      </section>

      {/* 2 órbita */}
      <section id="orbita" ref={orb} className={styles.orbita} style={{ height: "340svh" }}>
        <div className={styles.palcoOr}>
          <div className={styles.estrelas} aria-hidden="true">{FUNDO.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s }} />)}</div>
          <svg ref={orbSvg} className={styles.orbSvg} viewBox="-500 -300 1000 600" aria-hidden="true">
            {ORBITAS.map((o, i) => <ellipse key={i} cx="0" cy="0" rx={o.k * 1000 * 1.12} ry={o.k * 1000 * 1.12 * 0.34} />)}
          </svg>
          <div className={styles.centro} aria-hidden="true">
            <div ref={anel} className={styles.anel}>{LETRAS.map((l, i) => <span key={i} style={{ transform: `rotate(${(i / LETRAS.length) * 360}deg) translateY(calc(var(--raio) * -1))` }}>{l}</span>)}</div>
            <div className={styles.nucleo} />
          </div>
          {EPS.map((e, i) => (
            <button key={e.id} ref={(el) => (planetas.current[i] = el)} className={`${styles.planeta} ${ep === i ? styles.sel : ""}`} onClick={() => setEp(i)} aria-label={`${e.nome}, ${e.sub}`}>
              <img src={e.img} alt="" loading="eager" />
            </button>
          ))}
          <div className={styles.painel}>
            <span className={styles.rotulo}>Lançamentos</span>
            <h2>{epAtual.nome}</h2>
            <p className={styles.sub}>{epAtual.sub}</p>
            <ol>
              {epAtual.faixas.map((f, i) => (
                <li key={f.id}><button onClick={() => tocar(f.id, f.t, epAtual.faixas)}><b>{pad(i + 1)}</b>{f.t}</button></li>
              ))}
            </ol>
            <button className={styles.completo} onClick={() => tocar(epAtual.full, epAtual.nome)}>ouvir o EP ▸</button>
            <div className={styles.seletor} role="tablist">
              {EPS.map((e, i) => <button key={e.id} role="tab" aria-selected={ep === i} className={ep === i ? styles.on : ""} onClick={() => setEp(i)}>{e.nome}</button>)}
            </div>
          </div>
        </div>
      </section>

      {/* 3 três nomes */}
      <section className={styles.nomes}>
        <span className={styles.rotulo} data-rev>Um olho, três nomes</span>
        <div className={styles.tres}>
          {NOMES.map((n) => (
            <button key={n.nome} className={styles.nomeCard} data-rev onClick={() => ir(n.alvo)}>
              <b>{n.n}</b>
              <h3>{n.nome}</h3>
              <p>{n.txt}</p>
              <i aria-hidden="true">↓</i>
            </button>
          ))}
        </div>
      </section>

      {/* 4 constelação */}
      <section id="parcerias" className={styles.const}>
        <div className={styles.constTop} data-rev>
          <span className={styles.rotulo}>Parcerias</span>
          <h2>Quem divide a faixa</h2>
        </div>
        <svg className={styles.mapa} data-rev viewBox="0 0 1000 640" role="group" aria-label="Constelação de parcerias">
          {ligadas.map((s, i) => <line key={s.n} className={`${styles.fio} ${estrela === s.n ? styles.fioOn : ""}`} x1="500" y1="320" x2={s.x} y2={s.y} style={{ "--i": i }} />)}
          <circle className={styles.cOlx} cx="500" cy="320" r="30" />
          <text className={styles.tOlx} x="500" y="326" textAnchor="middle">OLX</text>
          {ligadas.map((s) => (
            <g key={s.n} className={`${styles.estrela} ${estrela === s.n ? styles.eOn : ""} ${s.jodo ? styles.eJodo : ""}`} tabIndex={0} role="button" aria-label={`${s.n}: ${s.faixas.map((f) => f.t).join(", ")}`}
               onMouseEnter={() => setEstrela(s.n)} onMouseLeave={() => setEstrela(null)} onFocus={() => setEstrela(s.n)} onBlur={() => setEstrela(null)}
               onClick={() => tocar(s.faixas[0].id, s.faixas[0].t, s.faixas)} onKeyDown={(e) => { if (e.key === "Enter") tocar(s.faixas[0].id, s.faixas[0].t, s.faixas); }}>
              <circle cx={s.x} cy={s.y} r="22" className={styles.area} />
              <circle cx={s.x} cy={s.y} r="5.5" className={styles.ponto} />
              <text x={s.x} y={s.y - 15} textAnchor="middle">{s.n}{s.jodo ? " · JODO" : ""}</text>
            </g>
          ))}
        </svg>
        <ul className={styles.chips}>
          {ESTRELAS.map((s) => <li key={s.n}><button onClick={() => tocar(s.faixas[0].id, s.faixas[0].t, s.faixas)}>{s.n}{s.jodo ? " · JODO" : ""}</button></li>)}
        </ul>
        <p className={styles.legendaMapa}>{estrela ? ESTRELAS.find((s) => s.n === estrela).faixas.map((f) => f.t).join(" · ") : "Passe o mouse numa estrela. Clique para ouvir."}</p>
      </section>

      {/* 5 zumbi studio */}
      <section id="estudio" className={styles.estudio}>
        <div className={styles.estTop} data-rev>
          <span className={styles.rotulo}>Zumbi Studio</span>
          <h2>Beats e mixagem para outros artistas</h2>
        </div>
        <div ref={mesa} className={styles.mesa}>
          {PRODUCOES.map((p, i) => (
            <div key={p.id} className={styles.canal} data-rev>
              <button className={styles.capa} onClick={() => tocar(p.id, `${p.a} · ${p.t}`)} aria-label={`Ver ${p.a}, ${p.t}`}>
                <img src={mini(p.id)} alt="" loading="lazy" />
                <i aria-hidden="true">▸</i>
              </button>
              <div className={styles.fa}><div className={styles.trilho}><span ref={(el) => (fader.current[i] = el)} className={styles.botao} /></div></div>
              <span className={styles.num}>{pad(i + 1)}</span>
              <strong>{p.t}</strong>
              <em>{p.a}</em>
              {p.pagina && <Link href={p.pagina}>página dela ↗</Link>}
            </div>
          ))}
        </div>
      </section>

      {/* 6 beats */}
      <section className={styles.beats}>
        <div className={styles.beatsTop} data-rev>
          <span className={styles.rotulo}>Beats</span>
          <h2>Por BPM</h2>
          <p>Uma faixa de cada estilo, no SoundCloud dele.</p>
        </div>
        <ul data-rev>
          {BEATS.map((b) => (
            <li key={b.url} className={toca === b.url ? styles.ativo : ""}>
              <button onClick={() => setToca(toca === b.url ? null : b.url)} aria-expanded={toca === b.url}>
                <span className={styles.bpm}>{b.bpm}<small>bpm</small></span>
                <span className={styles.estilo}>{b.nome}</span>
                <span className={styles.acao}>{toca === b.url ? "fechar" : "ouvir ▸"}</span>
              </button>
              {toca === b.url && (
                <iframe title={`Beat ${b.nome}`} loading="lazy" allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(b.url)}&color=%23d4141c&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`} />
              )}
            </li>
          ))}
        </ul>
        <div className={styles.lojas}>
          <a href={LINKS.coffee1} target="_blank" rel="noopener noreferrer">Coffee Beats #1 ↗</a>
          <a href={LINKS.coffee2} target="_blank" rel="noopener noreferrer">Coffee Beats #2 ↗</a>
          <a href={LINKS.lojaBeats} target="_blank" rel="noopener noreferrer">Loja de beats, com Strads ↗</a>
        </div>
      </section>

      {/* 7 JODO */}
      <section className={styles.jodo}>
        <div className={styles.jodoTop} data-rev>
          <span className={styles.rotulo}>Na JODO</span>
          <h2>Com o DK, no canal da JODO</h2>
        </div>
        <div className={styles.jodoGrade}>
          {NA_JODO.map((v) => (
            <button key={v.id} className={styles.jodoCard} data-rev onClick={() => tocar(v.id, `${v.t} · ${v.c}`)}>
              <span className={styles.jt}><img src={mini(v.id)} alt="" loading="lazy" /><i aria-hidden="true">▸</i></span>
              <strong>{v.t}</strong>
              <em>{v.c}</em>
            </button>
          ))}
        </div>
      </section>

      {/* 8 contato */}
      <footer className={styles.fim}>
        <div className={styles.fimNome} aria-hidden="true">Herick<br /><em>OLX</em></div>
        <ul>
          <li><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram <span>@olxherick</span></a></li>
          <li><a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify <span>Herick OLX</span></a></li>
          <li><a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube <span>@olxherick</span></a></li>
          <li><a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud <span>olxherick</span></a></li>
        </ul>
        <button className={styles.topo} onClick={topo}>↑ topo</button>
      </footer>

      {aberto && (
        <div className={styles.modal} onClick={() => setAberto(null)} role="dialog" aria-label={aberto.t}>
          <div className={styles.player} onClick={(e) => e.stopPropagation()}>
            <iframe title={aberto.t} src={`https://www.youtube-nocookie.com/embed/${aberto.id}?autoplay=1&rel=0`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            <p>{aberto.t}</p>
            {aberto.lista && aberto.lista.length > 1 && (
              <div className={styles.lista}>{aberto.lista.map((f) => <button key={f.id + f.t} className={f.id === aberto.id ? styles.on : ""} onClick={() => setAberto({ ...aberto, id: f.id, t: f.t })}>{f.t}</button>)}</div>
            )}
            <button className={styles.fechar} onClick={() => setAberto(null)}>fechar ×</button>
          </div>
        </div>
      )}
    </main>
  );
}
