"use client";

import { useEffect, useRef, useState } from "react";
import { Instrument_Serif, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { TRABALHOS, LINKS, NA_JODO } from "@/data/rogdog";
import styles from "@/styles/rogPortfolio.module.css";

/*
  Rog (RogDog / Rogério Soares): portfólio de videomaker, para ele conseguir trabalho de filmar e editar.
  Estrutura: quatro CENAS em tela cheia (herói, trabalhos, na JODO, contato) que trocam por rolagem com encaixe (scroll-snap);
  o conteúdo de cada cena reage à posição da rolagem (--p e --a), então a troca é uma animação contínua, não um corte.
  "Trabalhos" é uma vitrine: lista compacta à esquerda e palco grande à direita com o trabalho em foco.
  Só afirma o que está confirmado (papéis vêm da descrição dos vídeos dele).
  Fontes: Instrument Serif (títulos), Inter Tight (texto), IBM Plex Mono (metadados).
*/

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--rg-serif", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--rg-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--rg-mono", display: "swap" });

// fotos do herói: só quadros de filme (nada de cartela de marca)
const HERO_IDS = ["844972951", "533302315", "530125211", "1167917096", "1167905827", "974149756", "408975542", "254591173", "397729036"];
const HERO = HERO_IDS.map((id) => TRABALHOS.find((x) => x.id === id)).filter(Boolean);
const CENAS = [["heroi", "Início"], ["trabalhos", "Trabalhos"], ["jodo", "Na JODO"], ["contato", "Contato"]];
const num = (n) => String(n).padStart(2, "0");

export default function RogPortfolio() {
  const [h, setH] = useState(0);
  const [ativo, setAtivo] = useState(0);
  const [aberto, setAberto] = useState(null);
  const [cena, setCena] = useState(0);
  const rolo = useRef(null);
  const cenas = useRef([]);
  const anterior = useRef(null);

  // fotos do herói trocam devagar
  useEffect(() => {
    const reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduz) return;
    const t = setInterval(() => setH((v) => (v + 1) % HERO.length), 3600);
    return () => clearInterval(t);
  }, []);

  // a rolagem alimenta a animação: t = posição em "telas"; cada cena recebe --in (entrando por baixo, 1 a 0) e --out (saindo, 0 a 1)
  useEffect(() => {
    const el = rolo.current;
    if (!el) return;
    let raf = 0;
    const atualizar = () => {
      raf = 0;
      const t = el.scrollTop / el.clientHeight;
      cenas.current.forEach((c, i) => {
        if (!c) return;
        const d = t - i;
        c.style.visibility = Math.abs(d) < 1 ? "visible" : "hidden";
        c.style.pointerEvents = Math.abs(d) < 0.5 ? "auto" : "none";
        c.style.zIndex = String(i + 1);
        c.style.setProperty("--in", Math.max(0, Math.min(1, -d)).toFixed(3));
        c.style.setProperty("--out", Math.max(0, Math.min(1, d)).toFixed(3));
      });
      setCena(Math.round(t));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(atualizar); };
    atualizar();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { el.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const ir = (i) => {
    if (rolo.current) rolo.current.scrollTo({ top: i * rolo.current.clientHeight, behavior: "smooth" });
  };

  // teclado: setas e espaço trocam de cena (quando o player está fechado)
  useEffect(() => {
    if (aberto !== null) return;
    const k = (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey) { e.preventDefault(); ir(Math.min(CENAS.length - 1, cena + 1)); }
      else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) { e.preventDefault(); ir(Math.max(0, cena - 1)); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [aberto, cena]);

  // teclado no player
  useEffect(() => {
    if (aberto === null) return;
    const k = (e) => {
      if (e.key === "Escape") setAberto(null);
      else if (e.key === "ArrowRight") setAberto((i) => (i + 1) % TRABALHOS.length);
      else if (e.key === "ArrowLeft") setAberto((i) => (i - 1 + TRABALHOS.length) % TRABALHOS.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [aberto]);

  // guarda o trabalho anterior do palco para a troca de imagem ser um fade
  const w = TRABALHOS[ativo];
  const prevId = anterior.current;
  useEffect(() => { anterior.current = w.id; }, [w.id]);
  const t = aberto !== null ? TRABALHOS[aberto] : null;

  return (
    <div className={`${styles.pagina} ${serif.variable} ${sans.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Rog" cor="#efece6" />

      <nav className={styles.menu} aria-label="Seções">
        {CENAS.slice(1).map(([id, rot], k) => (
          <button key={id} className={cena === k + 1 ? styles.menuOn : ""} onClick={() => ir(k + 1)} aria-current={cena === k + 1 ? "true" : undefined}>
            {rot}
          </button>
        ))}
      </nav>

      <div ref={rolo} className={styles.rolo} style={aberto !== null ? { overflow: "hidden" } : undefined}>
        <div className={styles.palco}>
        {/* 1. herói */}
        <section ref={(e) => (cenas.current[0] = e)} className={`${styles.cena} ${styles.heroi}`} aria-label="Rog">
          <div className={styles.fotos} aria-hidden="true">
            {[h, (h - 1 + HERO.length) % HERO.length].map((i, k) => (
              <img key={`${HERO[i].id}-${k}`} src={`/rg/${HERO[i].id}.webp`} alt="" className={k === 0 ? styles.fotoEntra : styles.fotoFundo} />
            ))}
          </div>
          <div className={styles.veu} aria-hidden="true" />
          <div className={`${styles.conteudo} ${styles.heroiConteudo}`}>
            <h1 className={styles.nome}>
              <span>Rogério</span>
              <span>Soares</span>
            </h1>
            <div className={styles.heroiBase}>
              <p className={styles.heroiLinha}>Videomaker. Também <em>RogDog</em>.</p>
              <p className={styles.heroiFuncoes}>Direção, fotografia, edição e finalização</p>
              <p className={styles.heroiLugar}>Lisboa</p>
              <button className={styles.descer} onClick={() => ir(1)}>Trabalhos <i aria-hidden="true">↓</i></button>
            </div>
          </div>
        </section>

        {/* 2. trabalhos: vitrine */}
        <section ref={(e) => (cenas.current[1] = e)} className={`${styles.cena} ${styles.trabalhos}`} aria-label="Trabalhos">
          <div className={`${styles.conteudo} ${styles.vitrine}`}>
            <div className={styles.vitPalco}>
              {prevId && prevId !== w.id && <img key={`p-${prevId}`} className={styles.vitFundo} src={`/rg/${prevId}.webp`} alt="" />}
              <img key={w.id} className={styles.vitImg} src={`/rg/${w.id}.webp`} alt="" />
              <div className={styles.vitVeu} aria-hidden="true" />
              <div key={`t-${w.id}`} className={styles.vitTexto}>
                <p className={styles.vitMeta}>{num(ativo + 1)} / {TRABALHOS.length} · {w.ano} · {w.d}{w.tag ? ` · ${w.tag}` : ""}</p>
                <h2 className={styles.vitTit}>{w.t}</h2>
                {w.role && <p className={styles.vitPapel}>{w.role}</p>}
                <button className={styles.assistir} onClick={() => setAberto(ativo)}>Assistir <i aria-hidden="true">▶</i></button>
              </div>
            </div>
            <div className={styles.indice}>
              <p className={styles.indiceTopo}><span>Trabalhos</span><span>{TRABALHOS[TRABALHOS.length - 1].ano} a {TRABALHOS[0].ano}</span></p>
              <ol className={styles.lista}>
                {TRABALHOS.map((x, i) => (
                  <li key={x.id}>
                    <button
                      className={ativo === i ? styles.linhaOn : ""}
                      aria-current={ativo === i ? "true" : undefined}
                      onPointerEnter={(e) => { if (e.pointerType === "mouse") setAtivo(i); }}
                      onFocus={() => setAtivo(i)}
                      onClick={() => { setAtivo(i); setAberto(i); }}
                    >
                      <span className={styles.n}>{num(i + 1)}</span>
                      <span className={styles.tit}>{x.t}</span>
                      <span className={styles.ano}>{x.ano}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 3. na JODO */}
        <section ref={(e) => (cenas.current[2] = e)} className={`${styles.cena} ${styles.jodo}`} aria-label="Na JODO">
          <div className={`${styles.conteudo} ${styles.jodoGrade}`}>
            <div className={styles.jodoEsq}>
              <h2>Na <i>JODO</i></h2>
              <p className={styles.frase}>Foi o Rog quem puxou os meninos pra JODO.</p>
            </div>
            <div className={styles.jodoDir}>
              {NA_JODO.map((g) => (
                <div key={g.grupo} className={styles.grupo}>
                  <h3 className={styles.grupoTit}>{g.grupo}{g.sub && <span>{g.sub}</span>}</h3>
                  <ul className={styles.creditos}>
                    {g.itens.map((c) => (
                      <li key={c.titulo + c.ano}>
                        <span className={styles.cAno}>{c.ano}</span>
                        <div>
                          <h4>{c.titulo}</h4>
                          {c.papel && <p className={styles.cPapel}>{c.papel}</p>}
                          {c.nota && <p className={styles.cNota}>{c.nota}</p>}
                          {(c.yt || c.vimeo) && (
                            <a href={c.yt ? `https://www.youtube.com/watch?v=${c.yt}` : `https://vimeo.com/${c.vimeo}`} target="_blank" rel="noopener noreferrer">Ver {c.yt ? "no YouTube" : "no Vimeo"} ↗</a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. contato */}
        <section ref={(e) => (cenas.current[3] = e)} className={`${styles.cena} ${styles.contato}`} aria-label="Contato">
          <div className={`${styles.conteudo} ${styles.contatoConteudo}`}>
            <h2>Filmar <i>e</i> editar.</h2>
            <div className={styles.contatoLinks}>
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram <span>@rogdog_ ↗</span></a>
              <a href={LINKS.vimeo} target="_blank" rel="noopener noreferrer">Vimeo <span>todos os trabalhos ↗</span></a>
            </div>
            <p className={styles.rodapeLinha}>Rogério Soares · Lisboa · Página feita pela JODO</p>
          </div>
        </section>
        </div>
        <div className={styles.trilha} aria-hidden="true">{CENAS.map(([id]) => <div key={id} className={styles.marcador} />)}</div>
      </div>

      {t && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label={t.t} onClick={() => setAberto(null)}>
          <div className={styles.modalInterno} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTopo}>
              <div>
                <h3>{t.t}</h3>
                <p>{t.ano} · {t.d}{t.tag ? ` · ${t.tag}` : ""}{t.role ? ` · ${t.role}` : ""}</p>
              </div>
              <button onClick={() => setAberto(null)} aria-label="Fechar">Fechar ✕</button>
            </div>
            <div className={styles.player}>
              <iframe
                key={t.id}
                src={`https://player.vimeo.com/video/${t.id}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`}
                title={t.t}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.modalBase}>
              <button onClick={() => setAberto((i) => (i - 1 + TRABALHOS.length) % TRABALHOS.length)}>← anterior</button>
              <a href={`https://vimeo.com/${t.id}`} target="_blank" rel="noopener noreferrer">Ver no Vimeo ↗</a>
              <button onClick={() => setAberto((i) => (i + 1) % TRABALHOS.length)}>próximo →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
