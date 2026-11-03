"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Jost, Mrs_Saint_Delafield, Barlow_Condensed, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LINKS, EPS, PRODUCOES, BEATS, FEATS, mini } from "@/data/olx";
import styles from "@/styles/olxCenas.module.css";

/*
  Herick OLX: três nomes, três cenas. A página abre com três entradas lado a lado (Herick OLX, Canguru Zurado, Zumbi Studio);
  clicar abre a cena em tela cheia, com cortina saindo do painel clicado. Cada cena tem o visual das capas do próprio nome.
  Parceiros só aparecem como crédito e link. O dock fixo embaixo troca de cena a qualquer hora.
*/
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--oc-jost", display: "swap" });
const script = Mrs_Saint_Delafield({ subsets: ["latin"], weight: "400", variable: "--oc-script", display: "swap" });
const cond = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--oc-cond", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--oc-mono", display: "swap" });

const pad = (n) => String(n).padStart(2, "0");
const CENAS = [
  { nome: "Herick OLX", sub: "Rap. Os EPs Teoria dos Versos e Conversas para Mesa de Bar." },
  { nome: "Canguru Zurado", sub: "O outro nome. O EP Marsúpio." },
  { nome: "Zumbi Studio", sub: "Produção e beats para outros artistas." },
];
const CORES = ["#f3e6c8", "#ff4a55", "#111111"];

export default function OlxCenas() {
  const [cena, setCena] = useState(null);
  const [clip, setClip] = useState("inset(0px)");
  const [troca, setTroca] = useState(false);
  const [ep, setEp] = useState(0);
  const [aberto, setAberto] = useState(null);
  const [toca, setToca] = useState(null);
  const [prev, setPrev] = useState(null);
  const paineis = useRef([]);
  const sobre = useRef(null);
  const rgb = useRef(null);
  const fecha = useRef(0);

  const origem = (i) => {
    const el = paineis.current[i];
    if (!el) return "inset(50% 50% 50% 50%)";
    const r = el.getBoundingClientRect();
    return `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`;
  };
  const entrar = (i) => {
    clearTimeout(fecha.current);
    setTroca(false); setToca(null);
    setClip(origem(i)); setCena(i);
    requestAnimationFrame(() => requestAnimationFrame(() => setClip("inset(0px)")));
  };
  const sair = () => {
    setAberto(null);
    setClip(origem(cena));
    fecha.current = setTimeout(() => setCena(null), 820);
  };
  const trocar = (i) => { if (i === cena) { sobre.current?.scrollTo({ top: 0, behavior: "smooth" }); return; } setTroca(true); setToca(null); setCena(i); };

  useEffect(() => { sobre.current?.scrollTo(0, 0); }, [cena]);
  useEffect(() => {
    document.body.style.overflow = cena !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cena]);
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") { if (aberto) setAberto(null); else if (cena !== null) sair(); } };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  });

  const tocar = (id, t, lista) => setAberto({ id, t, lista });
  const mexe = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
    rgb.current?.style.setProperty("--dx", dx.toFixed(2));
    rgb.current?.style.setProperty("--dy", dy.toFixed(2));
  };
  const prevMove = (e) => { if (prev) setPrev({ ...prev, x: e.clientX, y: e.clientY }); };

  const epAtual = EPS[ep];
  const marsupio = EPS[2];

  const Rodape = ({ cor }) => (
    <footer className={styles.rodape} style={{ "--rc": cor }}>
      <ul>
        <li><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram <span>@olxherick</span></a></li>
        <li><a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify <span>Herick OLX</span></a></li>
        <li><a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube <span>@olxherick</span></a></li>
        <li><a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud <span>olxherick</span></a></li>
      </ul>
    </footer>
  );

  return (
    <main className={`${styles.raiz} ${jost.variable} ${script.variable} ${cond.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Herick OLX" cor={cena === null ? "#efe8e0" : CORES[cena]} aoSubir={() => (cena === null ? scrollTo(0, 0) : sobre.current?.scrollTo({ top: 0, behavior: "smooth" }))} />

      {/* entrada: três painéis */}
      <h1 className={styles.h1}>Herick OLX<span>três nomes, escolhe uma entrada</span></h1>
      <section className={styles.entrada} aria-label="Escolha uma das três identidades">
        <button ref={(el) => (paineis.current[0] = el)} className={`${styles.painel} ${styles.p1}`} onClick={() => entrar(0)}>
          <img src="/ol/olho.webp" alt="" fetchPriority="high" />
          <span className={styles.leg}><b>01</b><strong>Herick OLX</strong><em>{CENAS[0].sub}</em></span>
        </button>
        <button ref={(el) => (paineis.current[1] = el)} className={`${styles.painel} ${styles.p2}`} onClick={() => entrar(1)}>
          <img src="/ol/marsupio.webp" alt="" />
          <span className={styles.leg}><b>02</b><strong>Canguru Zurado</strong><em>{CENAS[1].sub}</em></span>
        </button>
        <button ref={(el) => (paineis.current[2] = el)} className={`${styles.painel} ${styles.p3}`} onClick={() => entrar(2)}>
          <span className={styles.mosaico} aria-hidden="true">{PRODUCOES.slice(0, 6).map((p) => <img key={p.id} src={mini(p.id)} alt="" />)}</span>
          <span className={styles.leg}><b>03</b><strong>Zumbi Studio</strong><em>{CENAS[2].sub}</em></span>
        </button>
      </section>

      {/* cenas */}
      {cena !== null && (
        <div ref={sobre} className={styles.sobre} style={{ clipPath: clip, WebkitClipPath: clip }}>
          {cena === 0 && (
            <section key="c0" className={`${styles.c1} ${ep === 1 ? styles.bar : ""} ${troca ? styles.entra : ""}`}>
              <div className={styles.brilho} aria-hidden="true" />
              <div className={styles.c1Grade}>
                <div className={styles.c1Capa}>
                  <img key={ep} src={epAtual.img} alt={`Capa de ${epAtual.nome}`} />
                </div>
                <div className={styles.c1Txt}>
                  <div className={styles.abas} role="tablist">
                    {EPS.slice(0, 2).map((e, i) => <button key={e.id} role="tab" aria-selected={ep === i} className={ep === i ? styles.on : ""} onClick={() => setEp(i)}>{e.nome}</button>)}
                  </div>
                  <h2 key={ep}>{epAtual.nome}</h2>
                  <p className={styles.cred}>{epAtual.sub}</p>
                  <ol className={styles.faixas}>
                    {epAtual.faixas.map((f, i) => (
                      <li key={f.id}><button onClick={() => tocar(f.id, f.t, epAtual.faixas)}><b>{pad(i + 1)}</b><span>{f.t}</span><i aria-hidden="true">▸</i></button></li>
                    ))}
                  </ol>
                  <button className={styles.ep} onClick={() => tocar(epAtual.full, epAtual.nome)}>Ouvir o EP inteiro ▸</button>
                </div>
              </div>
              <div className={styles.feats}>
                <h3>Também em</h3>
                <ul>
                  {FEATS.map((f) => (
                    <li key={f.id}>
                      <button onClick={() => tocar(f.id, `${f.t} · ${f.com.join(", ")}`)}>
                        <span className={styles.fm}><img src={mini(f.id)} alt="" loading="lazy" /></span>
                        <strong>{f.t}</strong>
                        <em>com {f.com.join(", ")}</em>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <Rodape cor="#f3e6c8" />
            </section>
          )}

          {cena === 1 && (
            <section key="c1" className={`${styles.c2} ${troca ? styles.entra : ""}`}>
              <h2 className={styles.canguru}>Canguru Zurado</h2>
              <div className={styles.c2Grade}>
                <div ref={rgb} className={styles.rgb} onMouseMove={mexe}>
                  <img src={marsupio.img} alt="Capa do EP Marsúpio, de Canguru Zurado" />
                  <img className={styles.r} src={marsupio.img} alt="" aria-hidden="true" />
                  <img className={styles.c} src={marsupio.img} alt="" aria-hidden="true" />
                </div>
                <div className={styles.c2Txt}>
                  <p className={styles.cred}>EP · Marsúpio</p>
                  <ol className={styles.faixas}>
                    {marsupio.faixas.map((f, i) => (
                      <li key={f.id}><button onClick={() => tocar(f.id, f.t, marsupio.faixas)}><b>{pad(i + 1)}</b><span>{f.t}</span><i aria-hidden="true">▸</i></button></li>
                    ))}
                  </ol>
                  <button className={styles.ep} onClick={() => tocar(marsupio.full, marsupio.nome)}>Ouvir o EP inteiro ▸</button>
                </div>
              </div>
              <Rodape cor="#ff4a55" />
            </section>
          )}

          {cena === 2 && (
            <section key="c2" className={`${styles.c3} ${troca ? styles.entra : ""}`} onMouseMove={prevMove}>
              <header className={styles.c3Topo}>
                <h2>Zumbi Studio</h2>
                <p>Produção e beats para outros artistas. Cada linha leva ao vídeo.</p>
              </header>
              <ol className={styles.folha}>
                {PRODUCOES.map((p, i) => (
                  <li key={p.id}>
                    <button onClick={() => tocar(p.id, `${p.a} · ${p.t}`)} onMouseEnter={(e) => setPrev({ id: p.id, x: e.clientX, y: e.clientY })} onMouseLeave={() => setPrev(null)}>
                      <b>{pad(i + 1)}</b>
                      <img className={styles.fmini} src={mini(p.id)} alt="" loading="lazy" />
                      <span className={styles.fa}>{p.a}</span>
                      <span className={styles.ft}>{p.t}</span>
                      <i aria-hidden="true">▸</i>
                    </button>
                    {p.pagina && <Link href={p.pagina} className={styles.pg}>página dela ↗</Link>}
                  </li>
                ))}
              </ol>

              <div className={styles.beats}>
                <h3>Beats <small>por BPM</small></h3>
                <ul>
                  {BEATS.map((b) => (
                    <li key={b.url} className={toca === b.url ? styles.ativo : ""}>
                      <button onClick={() => setToca(toca === b.url ? null : b.url)} aria-expanded={toca === b.url}>
                        <span className={styles.bpm}>{b.bpm}<small>bpm</small></span>
                        <span className={styles.estilo}>{b.nome}</span>
                        <span className={styles.acao}>{toca === b.url ? "fechar" : "ouvir ▸"}</span>
                      </button>
                      {toca === b.url && <iframe title={`Beat ${b.nome}`} allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(b.url)}&color=%23111111&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`} />}
                    </li>
                  ))}
                </ul>
                <div className={styles.lojas}>
                  <a href={LINKS.coffee1} target="_blank" rel="noopener noreferrer">Coffee Beats #1 ↗</a>
                  <a href={LINKS.coffee2} target="_blank" rel="noopener noreferrer">Coffee Beats #2 ↗</a>
                  <a href={LINKS.lojaBeats} target="_blank" rel="noopener noreferrer">Loja de beats ↗</a>
                </div>
              </div>
              <Rodape cor="#111111" />
              {prev && <img className={styles.flut} src={mini(prev.id)} alt="" style={{ left: prev.x, top: prev.y }} />}
            </section>
          )}

          <nav className={styles.dock} aria-label="Trocar de identidade">
            <button className={styles.sai} onClick={sair} aria-label="Voltar para as três entradas">← entradas</button>
            {CENAS.map((c, i) => <button key={c.nome} className={cena === i ? styles.on : ""} onClick={() => trocar(i)}>{c.nome}</button>)}
          </nav>
        </div>
      )}

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
