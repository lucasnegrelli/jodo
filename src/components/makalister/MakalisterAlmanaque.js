"use client";
// Makalister · Almanaque. A carreira em ordem de almanaque: um capítulo por ano, do mais novo ao mais velho (selo dele: Almanak).
// Cada lançamento carrega a fase REAL da lua no dia em que saiu (suncalc), vista do hemisfério sul. A lua fixa no canto muda com a rolagem.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LANCAMENTOS } from "@/data/makalisterLancamentos";
import { VIDEOS, LINKS } from "@/data/makalisterExtras";
import { Lua, SeloLua, faseDe, nomeFase } from "./lua";
import s from "@/styles/makalisterAlmanaque.module.css";

const serif = Fraunces({ subsets: ["latin"], axes: ["opsz", "SOFT", "WONK"], style: ["normal", "italic"], variable: "--mk-serif" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mk-mono" });

const fmtData = (iso) => (iso.length === 4 ? iso : new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" }).replace(".,", ",").replace(/\.$/, ""));
const mmss = (n) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
const mil = (n) => (n >= 1000 ? `${Math.round(n / 1000)} mil` : String(n));
const ehDisco = (l) => l.faixas.length > 0;

// agrupa por ano (mais novo primeiro) e numera as pranchas (os discos) do mais antigo para o mais novo
const DISCOS_CRONO = LANCAMENTOS.filter(ehDisco).slice().reverse();
const GRUPOS = [...new Set(LANCAMENTOS.map((l) => l.d.slice(0, 4)))].sort((a, b) => b - a).map((ano) => {
  const doAno = LANCAMENTOS.filter((l) => l.d.startsWith(ano));
  return { ano, discos: doAno.filter(ehDisco), avulsos: doAno.filter((l) => !ehDisco(l)), videos: VIDEOS.filter((v) => v.ano === ano), total: doAno.length };
});
const ANOS_ASC = GRUPOS.slice().reverse();
const MAX = Math.max(...GRUPOS.map((g) => g.total));

// curva suave (Catmull-Rom → Bézier) para a "maré" de lançamentos por ano
function onda(pontos) {
  let d = `M ${pontos[0][0]} ${pontos[0][1]}`;
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i - 1] || pontos[i], p1 = pontos[i], p2 = pontos[i + 1], p3 = pontos[i + 2] || p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function Mare({ aoClicar }) {
  const W = 1000, H = 190, pad = 34;
  const pts = ANOS_ASC.map((g, i) => [pad + (i / (ANOS_ASC.length - 1)) * (W - pad * 2), H - 44 - (g.total / MAX) * (H - 92)]);
  const linha = onda(pts);
  return (
    <svg className={s.mare} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Lançamentos por ano, de 2013 a 2026">
      <path d={`${linha} L ${pts[pts.length - 1][0]} ${H - 20} L ${pts[0][0]} ${H - 20} Z`} className={s.mareArea} />
      <path d={linha} className={s.mareLinha} />
      {ANOS_ASC.map((g, i) => (
        <g key={g.ano} className={s.mareP} onClick={() => aoClicar(g.ano)} tabIndex={0} role="button" aria-label={`${g.ano}: ${g.total} lançamentos`} onKeyDown={(e) => e.key === "Enter" && aoClicar(g.ano)}>
          <circle cx={pts[i][0]} cy={pts[i][1]} r="4.5" />
          <text x={pts[i][0]} y={pts[i][1] - 12} textAnchor="middle" className={s.mareN}>{g.total}</text>
          <text x={pts[i][0]} y={H - 4} textAnchor="middle" className={s.mareA}>{g.ano.slice(2)}</text>
        </g>
      ))}
    </svg>
  );
}

function Prancha({ l, setAtiva }) {
  const f = faseDe(l.d), n = DISCOS_CRONO.indexOf(l) + 1;
  return (
    <article className={s.prancha} data-iso={l.d} data-t={l.t} data-rev>
      <figure className={s.placa}>
        <img src={l.img} alt={`Capa de ${l.t}`} width="900" height="900" loading="lazy" decoding="async" draggable={false} />
        <figcaption><span>Prancha {String(n).padStart(2, "0")}</span><span>{l.tipo}</span></figcaption>
      </figure>
      <div className={s.texto}>
        <p className={s.data}><SeloLua p={f.p} tamanho={18} /><time dateTime={l.d}>{fmtData(l.d)} {l.d.slice(0, 4)}</time><span>{nomeFase(f.p)} · {Math.round(f.f * 100)}%</span></p>
        <h3 className={l.t.length > 26 ? s.longo : ""}>{l.t}</h3>
        {l.nota ? <p className={s.nota}>{l.nota}</p> : null}
        <ol className={`${s.tabua} ${l.faixas.length > 14 ? s.longa : ""}`}>{l.faixas.map((t, i) => <li key={`${t}-${i}`}>{t}</li>)}</ol>
        {l.label ? <p className={s.selo}>{l.label}</p> : null}
        <a className={s.ouvir} href={`https://www.deezer.com/album/${l.id}`} target="_blank" rel="noopener noreferrer">Ouvir no Deezer <i>↗</i></a>
      </div>
    </article>
  );
}

function Video({ v, setAtiva }) {
  const f = v.iso ? faseDe(v.iso) : null;
  return (
    <a className={s.video} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" data-rev {...(v.iso ? { "data-iso": v.iso, "data-t": v.t } : {})}>
      <span className={s.quadro}><img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" decoding="async" /><b>{mmss(v.dur)}</b></span>
      <span className={s.vtxt}>
        <small>Vídeo · {v.canal} · {mil(v.views)} views{f ? <> · <SeloLua p={f.p} tamanho={13} className={s.vlua} /></> : null}</small>
        <strong>{v.t}</strong>
        <em>{v.nota}</em>
      </span>
    </a>
  );
}

export default function MakalisterAlmanaque() {
  const raiz = useRef(null), lenis = useRef(null);
  const [ativa, setAtiva] = useState(null), [anoAtivo, setAnoAtivo] = useState(GRUPOS[0].ano), [hoje, setHoje] = useState(null);
  const faseAtiva = useMemo(() => (ativa ? faseDe(ativa.iso) : null), [ativa]);
  const total = LANCAMENTOS.length, nDiscos = DISCOS_CRONO.length;

  useEffect(() => { setHoje(faseDe(new Date().toISOString().slice(0, 10))); }, []);

  const vai = useCallback((ano) => {
    const el = document.getElementById(`a${ano}`); if (!el) return;
    if (lenis.current) lenis.current.scrollTo(el, { offset: -10, duration: 1.6 }); else el.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tick = null;
    if (!reduz) {
      lenis.current = new Lenis({ lerp: 0.09 });
      lenis.current.on("scroll", ScrollTrigger.update);
      tick = (t) => lenis.current?.raf(t * 1000);
      gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    } else raiz.current.dataset.reduz = "1";
    const ctx = gsap.context(() => {
      if (!reduz) gsap.utils.toArray("[data-rev]").forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } }));
      // a lua do canto acompanha o lançamento mais próximo do meio da tela (discos, vídeos com data e avulsos)
      const els = gsap.utils.toArray("[data-iso]"), secs = gsap.utils.toArray("[data-ano]"); let ult = null, ocupado = false;
      const acha = () => {
        ocupado = false; const alvo = window.innerHeight * 0.55; let melhor = null, d = 1e9;
        for (const el of els) { const r = el.getBoundingClientRect(); if (r.bottom < -120 || r.top > window.innerHeight + 120) continue; const dd = Math.abs((r.top + r.bottom) / 2 - alvo); if (dd < d) { d = dd; melhor = el; } }
        let ano = null; for (const sc of secs) { if (sc.getBoundingClientRect().top <= window.innerHeight * 0.5) ano = sc; }
        if (ano) setAnoAtivo(ano.dataset.ano);
        if (melhor && melhor !== ult) { ult = melhor; setAtiva({ iso: melhor.dataset.iso, t: melhor.dataset.t }); }
      };
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: () => { if (!ocupado) { ocupado = true; requestAnimationFrame(acha); } } });
      acha();
      if (!reduz) gsap.from("[data-hero] > *", { opacity: 0, y: 24, duration: 1.2, stagger: 0.12, ease: "power3.out", delay: 0.1 });
    }, raiz);
    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => { ctx.revert(); if (tick) gsap.ticker.remove(tick); lenis.current?.destroy(); lenis.current = null; gsap.ticker.lagSmoothing(500, 33); };
  }, []);

  return (
    <main ref={raiz} className={`${s.raiz} ${serif.variable} ${mono.variable}`}>
      <div className={s.grao} aria-hidden="true" />
      <VoltarJodo />
      <MarcaTopo nome="Makalister" cor="#1a1713" plano escala={1.05} aoSubir={() => (lenis.current ? lenis.current.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: "smooth" }))} />

      <aside className={s.lunario} aria-label="Lua do lançamento em foco">
        <Lua fase={faseAtiva ? faseAtiva.p : hoje ? hoje.p : 0.5} tamanho={92} className={s.luaFixa} />
        <p>{faseAtiva ? <><b>{fmtData(ativa.iso)} {ativa.iso.slice(0, 4)}</b><span>{nomeFase(faseAtiva.p)}</span></> : <span>lua de hoje</span>}</p>
      </aside>
      <nav className={s.regua} aria-label="Anos">
        {GRUPOS.map((g) => <button key={g.ano} type="button" className={anoAtivo === g.ano ? s.on : ""} onClick={() => vai(g.ano)} aria-label={`Ir para ${g.ano}`}><span>{g.ano}</span><i /></button>)}
      </nav>

      <header className={s.hero}>
        <div className={s.faixaTopo} data-hero><span>Almanak</span><span>Ano XIV</span><span>Edição de 2026</span></div>
        <div className={s.heroMiolo} data-hero>
          <Lua fase={hoje ? hoje.p : 0.5} tamanho={210} className={s.luaGrande} />
          <h1>Makalister</h1>
          <p className={s.sub}>Almanaque de lançamentos, 2013 — 2026</p>
          <p className={s.sub2}>São José, Santa Catarina · {total} lançamentos · {nDiscos} discos e EPs{hoje ? <> · hoje, {nomeFase(hoje.p)}, {Math.round(hoje.f * 100)}% iluminada</> : null}</p>
        </div>
        <button type="button" className={s.desce} onClick={() => vai("sumario")} data-hero>Sumário ↓</button>
      </header>

      <section id="asumario" className={s.sumario} aria-label="Sumário">
        <div id="asumario-ancora" />
        <h2 data-rev>Sumário</h2>
        <p className={s.leg} data-rev>Lançamentos por ano. A curva é a maré da produção dele: clique num ponto para ir ao ano.</p>
        <div data-rev><Mare aoClicar={vai} /></div>
        <ol className={s.livro}>
          {GRUPOS.map((g) => (
            <li key={g.ano} data-rev><button type="button" onClick={() => vai(g.ano)}><b>{g.ano}</b><i /><span>{g.discos.length ? `${g.discos.length} ${g.discos.length > 1 ? "discos" : "disco"}` : ""}{g.discos.length && g.avulsos.length ? " · " : ""}{g.avulsos.length ? `${g.avulsos.length} ${g.avulsos.length > 1 ? "avulsos" : "avulso"}` : ""}</span></button></li>
          ))}
        </ol>
      </section>

      {GRUPOS.map((g) => (
        <section key={g.ano} id={`a${g.ano}`} data-ano={g.ano} className={s.ano} aria-labelledby={`t${g.ano}`}>
          <div className={s.margem}>
            <h2 id={`t${g.ano}`} className={s.numeral}>{g.ano}</h2>
            <p className={s.balanco}>{g.total} {g.total > 1 ? "lançamentos" : "lançamento"}<br />{g.discos.length ? `${g.discos.length} ${g.discos.length > 1 ? "discos e EPs" : "disco ou EP"}` : "só avulsos"}</p>
          </div>
          <div className={s.corpo}>
            {g.discos.map((l) => <Prancha key={l.id} l={l} setAtiva={setAtiva} />)}
            {g.videos.length ? <div className={s.videos}><h3 data-rev>Imagem em movimento</h3>{g.videos.map((v) => <Video key={v.id} v={v} setAtiva={setAtiva} />)}</div> : null}
            {g.avulsos.length ? (
              <div className={s.avulsosBox}>
                <h3 data-rev>Avulsos</h3>
                <ul className={s.avulsos}>
                  {g.avulsos.map((l) => {
                    const f = faseDe(l.d);
                    return (
                      <li key={l.id} tabIndex={0} data-iso={l.d} data-t={l.t} onMouseEnter={() => setAtiva({ iso: l.d, t: l.t })} onFocus={() => setAtiva({ iso: l.d, t: l.t })} data-rev>
                        <a href={`https://www.deezer.com/album/${l.id}`} target="_blank" rel="noopener noreferrer">
                          <img src={l.img} alt={`Capa de ${l.t}`} width="360" height="360" loading="lazy" decoding="async" draggable={false} />
                          <strong>{l.t}</strong>
                          <small><SeloLua p={f.p} tamanho={12} />{fmtData(l.d)}</small>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ))}

      <footer className={s.colofao}>
        <p className={s.eyebrow} data-rev>Colofão</p>
        <p className={s.texto2} data-rev>Rapper e produtor de São José, na Grande Florianópolis. O Almanak é o selo e o canal onde boa parte do que ele fez está guardada. Este almanaque junta tudo em ordem de calendário: {total} lançamentos entre 2013 e 2026, e a lua que havia no céu de cada dia em que saíram.</p>
        <ul className={s.links} data-rev>
          <li><a href={LINKS.deezer} target="_blank" rel="noopener noreferrer">Deezer <i>↗</i></a></li>
          <li><a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud <i>↗</i></a></li>
        </ul>
        <p className={s.nota2} data-rev>Fases da lua calculadas para cada data e vistas do hemisfério sul, onde a lua crescente acende pela esquerda. Composto em Fraunces e JetBrains Mono. Dados: Deezer, SoundCloud e canal Almanak.</p>
        <button type="button" className={s.topo} onClick={() => (lenis.current ? lenis.current.scrollTo(0, { duration: 1.8 }) : scrollTo({ top: 0, behavior: "smooth" }))}>voltar ao início ↑</button>
      </footer>
    </main>
  );
}
