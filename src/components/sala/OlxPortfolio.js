"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newsreader, Inter_Tight, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LINKS, EPS, PRODUCOES, BEATS, FEATS, mini } from "@/data/olx";
import styles from "@/styles/olxPortfolio.module.css";

/*
  Herick OLX: portfólio fino. Nome, lançamentos (capas), produções do Zumbi Studio, beats e contato.
  Sem efeito de cena: tipografia, linhas finas e as próprias capas. Parceiros só como crédito.
*/
const serif = Newsreader({ subsets: ["latin"], weight: ["300", "400"], style: ["normal", "italic"], variable: "--op-serif", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--op-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400"], variable: "--op-mono", display: "swap" });

const pad = (n) => String(n).padStart(2, "0");

export default function OlxPortfolio() {
  const [sel, setSel] = useState(null);
  const [aberto, setAberto] = useState(null);
  const [toca, setToca] = useState(null);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(styles.vis); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll("[data-rev]").forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") setAberto(null); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  const tocar = (id, t, lista) => setAberto({ id, t, lista });
  const ep = sel === null ? null : EPS[sel];

  return (
    <main className={`${styles.raiz} ${serif.variable} ${sans.variable} ${mono.variable}`} onMouseMove={(e) => { if (prev) setPrev({ ...prev, x: e.clientX, y: e.clientY }); }}>
      <VoltarJodo />
      <MarcaTopo nome="Herick OLX" cor="#ece6dc" />

      <header className={styles.topo}>
        <h1 data-rev>Herick OLX</h1>
        <div className={styles.linha} data-rev>
          <p>MC e produtor.</p>
          <p>Também Canguru Zurado e Zumbi Studio.</p>
          <nav aria-label="Seções"><a href="#lancamentos">Lançamentos</a><a href="#producoes">Produções</a><a href="#beats">Beats</a><a href="#contato">Contato</a></nav>
        </div>
      </header>

      <section id="lancamentos" className={styles.bloco}>
        <h2 data-rev><span>Lançamentos</span></h2>
        <div className={styles.capas}>
          {EPS.map((e, i) => (
            <div key={e.id} className={styles.capaBox} data-rev>
              <button className={`${styles.capa} ${sel === i ? styles.on : ""} ${sel !== null && sel !== i ? styles.apaga : ""}`} onClick={() => setSel(sel === i ? null : i)} aria-expanded={sel === i} aria-label={`${e.nome}: ${e.faixas.length} faixas`}>
                <img src={e.img} alt={`Capa de ${e.nome}`} loading="eager" />
              </button>
              <p className={styles.leg}><strong>{e.nome}</strong><span>{e.sub}</span><em>{e.faixas.length} faixas</em></p>
            </div>
          ))}
        </div>

        {ep && (
          <div className={styles.painel} key={ep.id}>
            <ol>
              {ep.faixas.map((f, i) => (
                <li key={f.id}><button onClick={() => tocar(f.id, f.t, ep.faixas)}><b>{pad(i + 1)}</b><span>{f.t}</span><i aria-hidden="true">▸</i></button></li>
              ))}
            </ol>
            <button className={styles.inteiro} onClick={() => tocar(ep.full, ep.nome)}>Ouvir o EP inteiro</button>
          </div>
        )}

        <div className={styles.part} data-rev>
          <h3>Participações</h3>
          <ul>
            {FEATS.map((f) => (
              <li key={f.id}><button onClick={() => tocar(f.id, `${f.t} · ${f.com.join(", ")}`)}><span>{f.t}</span><em>com {f.com.join(", ")}</em></button></li>
            ))}
          </ul>
        </div>
      </section>

      <section id="producoes" className={styles.bloco}>
        <h2 data-rev><span>Produções</span><small>Zumbi Studio</small></h2>
        <ol className={styles.lista} data-rev>
          {PRODUCOES.map((p, i) => (
            <li key={p.id}>
              <button onClick={() => tocar(p.id, `${p.a} · ${p.t}`)} onMouseEnter={(e) => setPrev({ id: p.id, x: e.clientX, y: e.clientY })} onMouseLeave={() => setPrev(null)}>
                <b>{pad(i + 1)}</b>
                <img src={mini(p.id)} alt="" loading="lazy" />
                <span className={styles.art}>{p.a}</span>
                <span className={styles.fx}>{p.t}</span>
                <i aria-hidden="true">▸</i>
              </button>
              {p.pagina && <Link href={p.pagina} className={styles.pg}>página dela ↗</Link>}
            </li>
          ))}
        </ol>
      </section>

      <section id="beats" className={styles.bloco}>
        <h2 data-rev><span>Beats</span><small>por BPM</small></h2>
        <ul className={styles.beats} data-rev>
          {BEATS.map((b) => (
            <li key={b.url}>
              <button onClick={() => setToca(toca === b.url ? null : b.url)} aria-expanded={toca === b.url}>
                <span className={styles.bpm}>{b.bpm}</span>
                <span className={styles.estilo}>{b.nome}</span>
                <span className={styles.ac}>{toca === b.url ? "fechar" : "ouvir"}</span>
              </button>
              {toca === b.url && <iframe title={`Beat ${b.nome}`} allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(b.url)}&color=%23ece6dc&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`} />}
            </li>
          ))}
        </ul>
        <p className={styles.lojas} data-rev>
          <a href={LINKS.coffee1} target="_blank" rel="noopener noreferrer">Coffee Beats #1 ↗</a>
          <a href={LINKS.coffee2} target="_blank" rel="noopener noreferrer">Coffee Beats #2 ↗</a>
          <a href={LINKS.lojaBeats} target="_blank" rel="noopener noreferrer">Loja de beats ↗</a>
        </p>
      </section>

      <footer id="contato" className={styles.fim}>
        <h2 data-rev><span>Contato</span></h2>
        <ul data-rev>
          <li><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram<span>@olxherick</span></a></li>
          <li><a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify<span>Herick OLX</span></a></li>
          <li><a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube<span>@olxherick</span></a></li>
          <li><a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud<span>olxherick</span></a></li>
        </ul>
      </footer>

      {prev && <img className={styles.flut} src={mini(prev.id)} alt="" style={{ left: prev.x, top: prev.y }} />}

      {aberto && (
        <div className={styles.modal} onClick={() => setAberto(null)} role="dialog" aria-label={aberto.t}>
          <div className={styles.player} onClick={(e) => e.stopPropagation()}>
            <iframe title={aberto.t} src={`https://www.youtube-nocookie.com/embed/${aberto.id}?autoplay=1&rel=0`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            <p>{aberto.t}</p>
            {aberto.lista && aberto.lista.length > 1 && (
              <div className={styles.listaF}>{aberto.lista.map((f) => <button key={f.id + f.t} className={f.id === aberto.id ? styles.sel : ""} onClick={() => setAberto({ ...aberto, id: f.id, t: f.t })}>{f.t}</button>)}</div>
            )}
            <button className={styles.fechar} onClick={() => setAberto(null)}>fechar ×</button>
          </div>
        </div>
      )}
    </main>
  );
}
