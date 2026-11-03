"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Newsreader, Inter_Tight, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LINKS, EPS, PRODUCOES, BEATS, FEATS, mini } from "@/data/olx";
import { ONDAS } from "@/data/olxOndas";
import styles from "@/styles/olxTela.module.css";

/*
  Herick OLX: "a tela dele". O feed dele no Instagram é a tela do programa de música: ondas, grade verde, uma frase por faixa.
  A página é essa sessão: cada faixa é uma pista com a forma de onda REAL do áudio (picos medidos de cada vídeo).
  Passar o mouse mostra a agulha; clicar toca o vídeo a partir daquele ponto. Cor de cada grupo = cor da capa.
*/
const serif = Newsreader({ subsets: ["latin"], weight: ["300", "400"], style: ["normal", "italic"], variable: "--ot-serif", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--ot-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400"], variable: "--ot-mono", display: "swap" });

const pad = (n) => String(n).padStart(2, "0");
const tempo = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
// frase de cada faixa do EP, como ele posta no Instagram
const FRASES = {
  BHWF4ZH8dpY: "Sigo de olho aberto",
  i2JI_FpyKdM: "Não dependo de ninguém",
  IAWMbj7tBc0: "Quem será que vai lembrar o tempo perdido?",
  nbcnfG3YtFY: "Tudo em excesso contamina",
};

const GRUPOS = [
  { id: "teoria", cor: "#e8863a", titulo: "Teoria dos Versos", sub: "EP · Herick OLX", img: "/ol/teoria.webp", lanes: EPS[0].faixas.map((f) => ({ id: f.id, t: f.t, frase: FRASES[f.id] })), full: EPS[0].full },
  { id: "mesa", cor: "#ff3b3b", titulo: "Conversas para Mesa de Bar", sub: "EP · d4crvz, MaZéli e Herick OLX", img: "/ol/mesa.webp", lanes: EPS[1].faixas.map((f) => ({ id: f.id, t: f.t })), full: EPS[1].full },
  { id: "marsupio", cor: "#ff5a66", titulo: "Marsúpio", sub: "EP · Canguru Zurado", img: "/ol/marsupio.webp", lanes: EPS[2].faixas.map((f) => ({ id: f.id, t: f.t })), full: EPS[2].full },
  { id: "zumbi", cor: "#d8d2c4", titulo: "Zumbi Studio", sub: "Produções para outros artistas", img: null, lanes: PRODUCOES.map((p) => ({ id: p.id, t: p.t, a: p.a, pagina: p.pagina })) },
];

function Onda({ id, cor }) {
  const d = useMemo(() => {
    const o = ONDAS[id];
    if (!o) return "M0,20H220";
    return o.p.map((v, k) => { const h = Math.max(0.6, (v / 99) * 18); return `M${k + 0.5},${(20 - h).toFixed(1)}V${(20 + h).toFixed(1)}`; }).join("");
  }, [id]);
  return (
    <>
      <svg className={styles.base} viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>
      <svg className={styles.luz} viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true" style={{ color: cor }}><path d={d} /></svg>
    </>
  );
}

export default function OlxTela() {
  const [aberto, setAberto] = useState(null);
  const [toca, setToca] = useState(null);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(styles.vis); io.unobserve(e.target); } }), { threshold: 0.15 });
    document.querySelectorAll("[data-rev]").forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") setAberto(null); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  const mexe = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)).toFixed(1)}%`);
  };
  const sai = (e) => e.currentTarget.style.setProperty("--x", "0%");
  const clica = (e, l, g, lista) => {
    const r = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(0.98, Math.max(0, (e.clientX - r.left) / r.width));
    const d = ONDAS[l.id]?.d || 0;
    setAberto({ id: l.id, t: l.a ? `${l.a} · ${l.t}` : l.t, start: Math.floor(frac * d), lista });
  };
  const abre = (l, lista) => setAberto({ id: l.id, t: l.a ? `${l.a} · ${l.t}` : l.t, start: 0, lista });
  const total = GRUPOS.reduce((s, g) => s + g.lanes.length, 0);

  return (
    <main className={`${styles.raiz} ${serif.variable} ${sans.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Herick OLX" cor="#e9efe9" />

      <header className={styles.topo}>
        <h1 data-rev>Herick OLX</h1>
        <div className={styles.linha} data-rev>
          <p>MC, beatmaker e editor de áudio.</p>
          <p>Também Canguru Zurado e Zumbi Studio.</p>
          <span>{total} faixas · passe o mouse, clique na onda</span>
        </div>
      </header>

      {GRUPOS.map((g) => (
        <section key={g.id} className={styles.grupo} style={{ "--cor": g.cor }}>
          <div className={styles.gtopo} data-rev>
            {g.img && <img src={g.img} alt={`Capa de ${g.titulo}`} />}
            <div>
              <h2>{g.titulo}</h2>
              <p>{g.sub}</p>
            </div>
            {g.full && <button className={styles.inteiro} onClick={() => setAberto({ id: g.full, t: g.titulo, start: 0 })}>EP inteiro ▸</button>}
          </div>
          <div className={styles.regua} aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <span key={i}>{i + 1}</span>)}</div>
          <ol className={styles.lanes}>
            {g.lanes.map((l, i) => (
              <li key={l.id} className={styles.lane} data-rev>
                <div className={styles.cab}>
                  <b>{pad(i + 1)}</b>
                  <div>
                    <strong>{l.a ? l.a : l.t}</strong>
                    <span>{l.a ? l.t : l.frase ? <em>{l.frase}</em> : null}</span>
                  </div>
                  <i>{ONDAS[l.id] ? tempo(ONDAS[l.id].d) : ""}</i>
                </div>
                <button className={styles.onda} onMouseMove={mexe} onMouseLeave={sai} onClick={(e) => clica(e, l, g, g.lanes.map((x) => ({ id: x.id, t: x.a ? `${x.a} · ${x.t}` : x.t })))} aria-label={`Tocar ${l.a ? l.a + ", " : ""}${l.t}`}>
                  <span className={styles.revela}><Onda id={l.id} cor={g.cor} /></span>
                  <u aria-hidden="true" />
                </button>
                {l.pagina && <Link href={l.pagina} className={styles.pg}>página dela ↗</Link>}
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className={styles.grupo} style={{ "--cor": "#9ad7a8" }}>
        <div className={styles.gtopo} data-rev>
          <div><h2>Beats</h2><p>Por BPM · SoundCloud</p></div>
        </div>
        <ul className={styles.beats}>
          {BEATS.map((b) => (
            <li key={b.url} data-rev>
              <button onClick={() => setToca(toca === b.url ? null : b.url)} aria-expanded={toca === b.url}>
                <span className={styles.bpm}>{b.bpm}</span>
                <span className={styles.estilo}>{b.nome}</span>
                <span className={styles.ac}>{toca === b.url ? "fechar" : "ouvir ▸"}</span>
              </button>
              {toca === b.url && <iframe title={`Beat ${b.nome}`} allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(b.url)}&color=%239ad7a8&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`} />}
            </li>
          ))}
        </ul>
        <p className={styles.lojas}>
          <a href={LINKS.coffee1} target="_blank" rel="noopener noreferrer">Coffee Beats #1 ↗</a>
          <a href={LINKS.coffee2} target="_blank" rel="noopener noreferrer">Coffee Beats #2 ↗</a>
          <a href={LINKS.lojaBeats} target="_blank" rel="noopener noreferrer">Loja de beats ↗</a>
        </p>
      </section>

      <section className={styles.part}>
        <h3 data-rev>Participações</h3>
        <ul data-rev>
          {FEATS.map((f) => (
            <li key={f.id}><button onClick={() => abre({ id: f.id, t: `${f.t} · ${f.com.join(", ")}` })}><span>{f.t}</span><em>com {f.com.join(", ")}</em></button></li>
          ))}
        </ul>
      </section>

      <footer className={styles.fim}>
        <ul data-rev>
          <li><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram<span>@olxherick</span></a></li>
          <li><a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify<span>Herick OLX</span></a></li>
          <li><a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube<span>@olxherick</span></a></li>
          <li><a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud<span>olxherick</span></a></li>
        </ul>
      </footer>

      {aberto && (
        <div className={styles.modal} onClick={() => setAberto(null)} role="dialog" aria-label={aberto.t}>
          <div className={styles.player} onClick={(e) => e.stopPropagation()}>
            <iframe key={aberto.id + aberto.start} title={aberto.t} src={`https://www.youtube-nocookie.com/embed/${aberto.id}?autoplay=1&rel=0&start=${aberto.start || 0}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            <p>{aberto.t}</p>
            {aberto.lista && aberto.lista.length > 1 && (
              <div className={styles.listaF}>{aberto.lista.map((f) => <button key={f.id} className={f.id === aberto.id ? styles.sel : ""} onClick={() => setAberto({ ...aberto, id: f.id, t: f.t, start: 0 })}>{f.t}</button>)}</div>
            )}
            <button className={styles.fechar} onClick={() => setAberto(null)}>fechar ×</button>
          </div>
        </div>
      )}
    </main>
  );
}
