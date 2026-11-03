"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/continuoSE.module.css";
import { FASES, LINKS } from "@/data/sergioEstranho";
import { IG } from "@/data/sergioIg";
import { POSTS } from "@/data/sergioPosts";
import CAPAS from "@/data/sergioCapas";

// do mais novo ao mais antigo (como na página do Rap Delivery)
const ORDEM = [...FASES].reverse();

// cada fase tem um desenho próprio
const LAYOUT = {
  idiota: "linha",
  maluco: "duo",
  tabem: "duo",
  rancho: "carrossel",
  sonho: "clipes",
  cevas: "duas",
  luansantana: "mixtape",
  "beat-tapes": "livre",
  subsolo: "arquivo",
  agora: "agora",
};

// vídeo de cada capa (quando existe)
const YT_POR_CAPA = {};
FASES.forEach((f) => (f.itens || []).forEach((it) => { if (it.yt) YT_POR_CAPA[it.capa] = it.yt.split("v=")[1]; }));

// chuva de capas: determinística (mesmo servidor/cliente)
const CHUVA = Array.from({ length: CAPAS.length }, (_, k) => {
  const r = (n) => {
    const v = Math.sin((k + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  const longe = r(1) < 0.4;
  return {
    ...CAPAS[(k * 17) % CAPAS.length],
    x: 2 + r(2) * 94,
    tam: longe ? 3.6 + r(3) * 2 : 5.6 + r(3) * 4.4,
    dur: longe ? 34 + r(4) * 16 : 20 + r(4) * 14,
    atraso: -r(5) * 54,
    balanco: 18 + r(6) * 60,
    giro: -14 + r(7) * 28,
    longe,
  };
});

// adesivos colados nas fases (frases dele mesmo)
const ADESIVO = {
  agora: "#TFT",
  idiota: "o primeiro álbum depois de 15 anos",
  maluco: "Rascunho Riscado: clipe do 82",
  tabem: "vontade de sorrir toda hora",
  rancho: "ZN",
  sonho: "tudo isso é um sonho",
  cevas: "O Estranho Idioma",
  luansantana: "de 0624 até 2013",
  "beat-tapes": "teve um dia que eu fiz um beat pra cada sample",
  subsolo: "CrapMusic Inc.",
};

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")} mil` : String(n));
const capa = (id) => `/se/capas/${id}.webp`;
const thumb = (id) => `/se/yt/${id}.webp`;

function fotosIg(chaves, max = 3) {
  const out = [];
  (chaves || []).forEach((k) => (IG[k] || []).slice(0, max).forEach((src) => out.push(src)));
  return out;
}

function Seta() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cartao({ it, k, i }) {
  return (
    <li
      data-rev
      className={`${styles.cartao} ${it.grande ? styles.grande : ""}`}
      style={{ "--r": `${(((k * 37 + i * 11) % 9) - 4) * 0.8}deg`, "--k": k }}
    >
      <div className={styles.moldura}>
        <img src={capa(it.capa)} alt={`Capa de ${it.titulo}`} loading="lazy" />
        <i className={styles.fitaCola} />
      </div>
      <div className={styles.legenda}>
        <strong>{it.titulo}</strong>
        <small>
          {it.tipo} · {it.ano}
          {it.nota ? ` · ${it.nota}` : ""}
        </small>
        <span className={styles.links}>
          <a href={it.spotify} target="_blank" rel="noopener noreferrer">
            Spotify <Seta />
          </a>
          {it.yt && (
            <a href={it.yt} target="_blank" rel="noopener noreferrer">
              YouTube <Seta />
            </a>
          )}
        </span>
      </div>
    </li>
  );
}

function Video({ v }) {
  return (
    <li>
      <a href={v.url} target="_blank" rel="noopener noreferrer">
        <span className={styles.mini}>
          <img src={thumb(v.yt)} alt="" loading="lazy" />
          <i aria-hidden="true">▶</i>
        </span>
        <strong>{v.titulo}</strong>
        <small>
          {v.data} · {fmt(v.views)} views
          {v.nota ? ` · ${v.nota}` : ""}
        </small>
      </a>
    </li>
  );
}

export default function ContinuoSE() {
  const raiz = useRef(null);
  const [ativa, setAtiva] = useState(-1);
  const [aberta, setAberta] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const secs = [...raiz.current.querySelectorAll("[data-fase]")];
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setAtiva(Number(e.target.dataset.fase))),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    secs.forEach((s) => io.observe(s));
    const rev = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add(styles.vis)),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
    );
    raiz.current.querySelectorAll("[data-rev]").forEach((n) => {
      n.classList.add(styles.rev);
      rev.observe(n);
    });

    let raf = 0;
    const par = [...raiz.current.querySelectorAll("[data-par]")];
    const tick = () => {
      const vh = window.innerHeight;
      par.forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        n.style.setProperty("--py", `${(c * Number(n.dataset.par || 30)).toFixed(1)}px`);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // arrastar com o mouse no carrossel
    const limpar = [];
    raiz.current.querySelectorAll("[data-arrasta]").forEach((el) => {
      let down = false, x0 = 0, s0 = 0, moveu = false;
      const dn = (e) => { if (e.pointerType !== "mouse") return; down = true; moveu = false; x0 = e.clientX; s0 = el.scrollLeft; };
      const mv = (e) => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moveu = true; el.scrollLeft = s0 - dx; };
      const up = () => { down = false; };
      const clk = (e) => { if (moveu) { e.preventDefault(); e.stopPropagation(); moveu = false; } };
      el.addEventListener("pointerdown", dn);
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up);
      el.addEventListener("click", clk, true);
      limpar.push(() => { el.removeEventListener("pointerdown", dn); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); el.removeEventListener("click", clk, true); });
    });

    // capas na chuva: o mouse afasta as vizinhas e segura a que encosta
    const chuva = raiz.current.querySelector("[data-chuva]");
    let raf2 = 0, px = -9999, py = -9999;
    const aplica = () => {
      raf2 = 0;
      let achou = null;
      [...chuva.children].forEach((g) => {
        const im = g.firstElementChild;
        const o = im._o || (im._o = { x: 0, y: 0 });
        const r = im.getBoundingClientRect();
        const cx = r.left + r.width / 2 - o.x, cy = r.top + r.height / 2 - o.y;
        const dx = cx - px, dy = cy - py;
        const d = Math.hypot(dx, dy) || 1;
        const meio = Math.min(r.width, r.height) / 2;
        const segura = !achou && d < meio * 0.9;
        if (segura) achou = g;
        let rx = 0, ry = 0;
        if (!segura && d < 190) {
          const f = Math.pow(1 - d / 190, 1.4) * 80;
          rx = (dx / d) * f;
          ry = (dy / d) * f;
        }
        o.x = rx; o.y = ry;
        im.style.translate = `${rx}px ${ry}px`;
        im.style.scale = segura ? "1.28" : "1";
        g.classList.toggle(styles.segura, segura);
      });
    };
    const mover = (e) => { px = e.clientX; py = e.clientY; if (!raf2) raf2 = requestAnimationFrame(aplica); };
    const sair = () => { px = py = -9999; if (!raf2) raf2 = requestAnimationFrame(aplica); };
    chuva.addEventListener("pointermove", mover);
    chuva.addEventListener("pointerleave", sair);

    return () => {
      io.disconnect();
      rev.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(raf2);
      chuva.removeEventListener("pointermove", mover);
      chuva.removeEventListener("pointerleave", sair);
      limpar.forEach((f) => f());
    };
  }, []);

  useEffect(() => {
    if (!player) return;
    const k = (e) => e.key === "Escape" && setPlayer(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [player]);

  const irPara = (i) => {
    const el = raiz.current.querySelector(`[data-fase="${i}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main ref={raiz} className={styles.raiz}>
      {/* fundo fixo: a cor da fase e a capa dela, borrada */}
      <div className={styles.fundo} aria-hidden="true">
        {ORDEM.map((f, i) => {
          const c = f.itens && f.itens[0] && f.itens[0].capa;
          return (
            <div key={f.id} className={`${styles.camada} ${ativa === i ? styles.camadaOn : ""}`} style={{ "--cor": f.cor }}>
              {c && <img src={capa(c)} alt="" />}
            </div>
          );
        })}
        <div className={styles.grao} />
      </div>

      {/* topo: logo da JODO no meio; no hover vira o logo dele e sai a caixinha do Rap Delivery */}
      <header className={styles.topo}>
        <div className={`${styles.marca} ${aberta ? styles.aberta : ""}`} onClick={() => setAberta((v) => !v)}>
          <Link
            href="/"
            className={styles.marcaLink}
            aria-label="Sergio Estranho: voltar ao topo da página"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img className={styles.mMontanha} src="/jodo-montanha.png" alt="JODO" />
            <img className={styles.mSe} src="/se/logo-sergio.webp" alt="Sergio Estranho" />
          </Link>
          <Link href="/artistas/rap-delivery" className={styles.rapSai} aria-label="Rap Delivery">
            <img src="/rd-caixa.webp" alt="Rap Delivery" />
          </Link>
        </div>
      </header>

      <nav className={styles.anos} aria-label="Linha do tempo">
        <ul>
          {ORDEM.map((f, i) => (
            <li key={f.id} className={ativa === i ? styles.anoOn : ""}>
              <button onClick={() => irPara(i)} aria-label={`Ir para ${f.anos}`}>
                <b />
                <span>{f.ano0}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ===== ABERTURA: chove capa; o logo se escreve ===== */}
      <section className={styles.abertura}>
        <div className={styles.chuva} data-chuva>
          {CHUVA.map((c, k) => (
            <button
              key={k}
              type="button"
              className={`${styles.gota} ${c.longe ? styles.longe : ""}`}
              style={{ "--x": `${c.x}%`, "--t": `${c.tam}rem`, "--dur": `${c.dur}s`, "--atraso": `${c.atraso}s`, "--bal": `${c.balanco}px`, "--giro": `${c.giro}deg` }}
              aria-label={`Ouvir ${c.t} (${c.tipo}, ${c.ano})`}
              onClick={() => setPlayer({ id: c.id, titulo: c.t, tipo: c.tipo, ano: c.ano, yt: YT_POR_CAPA[c.id] || null })}
            >
              <img src={capa(c.id)} alt="" loading="lazy" draggable="false" />
              <span className={styles.rotulo}>
                <b>{c.t}</b>
                <i>{c.tipo} · {c.ano} · ▶ ouvir</i>
              </span>
            </button>
          ))}
        </div>
        <div className={styles.aberturaTxt}>
          <h1>
            <img src="/se/logo-sergio.webp" alt="Sergio Estranho" />
          </h1>
          <p className={styles.lide}>
            Beatmaker e rimador da zona norte de São Paulo. Quinze anos de beat, rima e vídeo caseiro. Sócio do Rancho Mont Gomer, do coletivo Morlockz e do Rap Delivery.
          </p>
          <ul className={styles.numeros}>
            <li><b>41</b> lançamentos no Spotify</li>
            <li><b>99</b> vídeos no YouTube</li>
            <li><b>2013</b> → <b>2026</b></li>
          </ul>
          <p className={styles.dica}>do mais novo ao mais antigo ↓</p>
          <span className={`${styles.adesivo} ${styles.adesivoHero}`}>o álbum mais humilde do ano</span>
        </div>
      </section>

      {/* ===== FASES ===== */}
      {ORDEM.map((f, i) => {
        const lay = LAYOUT[f.id] || "livre";
        const papel = i % 2 === 1;
        const fotos = fotosIg(f.ig);
        const itens = f.itens || [];
        const todosVideos = f.videos || [];
        // o vídeo mais visto vira destaque na coluna da direita e não repete na lista
        const dest = lay !== "mixtape" && todosVideos.length > 1 ? [...todosVideos].sort((a, b) => b.views - a.views)[0] : null;
        const videos = dest ? todosVideos.filter((v) => v !== dest) : todosVideos;
        return (
          <div key={f.id} className={`${styles.faixa} ${papel ? styles.papelF : ""}`}>
          <section id={f.id} data-fase={i} className={`${styles.fase} ${styles["l_" + lay]}`}>
            <div className={styles.cabeca} data-rev>
              {ADESIVO[f.id] && (
                <span className={styles.adesivo} style={{ "--g": `${((i * 29) % 11) - 5}deg` }} data-par="-16">
                  {ADESIVO[f.id]}
                </span>
              )}
              <span className={styles.anoGrande} data-par="-24">{f.anos}</span>
              <p className={styles.kicker}>{f.kicker}</p>
              <h2>{f.titulo}</h2>
            </div>

            <div className={styles.corpo} data-rev>
              <div className={styles.texto}>
                {f.texto.map((t, k) => (
                  <p key={k}>{t}</p>
                ))}
              </div>
              <div className={styles.lado}>
                {f.nota && (
                  <p className={styles.nota} data-par="18">
                    {f.nota}
                    <svg className={styles.rabiscoSeta} viewBox="0 0 90 60" aria-hidden="true">
                      <path d="M4 8 C 30 0, 64 10, 70 44 M70 44 L 58 34 M70 44 L 80 31" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </p>
                )}
                {dest && (
                  <a className={styles.destaque} href={dest.url} target="_blank" rel="noopener noreferrer" data-par="-14">
                    <span className={styles.mini}>
                      <img src={thumb(dest.yt)} alt="" loading="lazy" />
                      <i aria-hidden="true">▶</i>
                    </span>
                    <strong>{dest.titulo}</strong>
                    <small>
                      {dest.data} · {fmt(dest.views)} views{dest.nota ? ` · ${dest.nota}` : ""}
                    </small>
                    <em className={styles.fitaCola} />
                  </a>
                )}
              </div>
            </div>

            {/* 2025: a novela, passo a passo */}
            {f.passos && (
              <ol className={styles.passos}>
                {f.passos.map((p, k) => {
                  const img = (IG[p.ig] || [])[0];
                  return (
                    <li key={p.d} data-rev tabIndex={0}>
                      <span className={styles.passoData}>{p.d}</span>
                      <div className={styles.passoTxt}>
                        <strong>{p.t}</strong>
                        <p>{p.x}</p>
                      </div>
                      {img && <img src={img} alt="" loading="lazy" style={{ "--r": `${(((k * 37) % 7) - 3) * 0.9}deg` }} />}
                    </li>
                  );
                })}
              </ol>
            )}

            {itens.length > 0 && (
              <ul
                className={`${styles.mural} ${lay === "carrossel" ? styles.carrossel : ""}`}
                {...(lay === "carrossel" ? { "data-arrasta": "1" } : {})}
              >
                {itens.map((it, k) => (
                  <Cartao key={it.capa} it={it} k={k} i={i} />
                ))}
              </ul>
            )}

            {f.faixas && (
              <div className={styles.linha} data-rev>
                <p className={styles.etq}>vinte faixas, vinte anos do mundo</p>
                <ol>
                  {f.faixas.map(([ano, nome, part, yid]) => (
                    <li key={ano}>
                      <a href={`https://www.youtube.com/watch?v=${yid}`} target="_blank" rel="noopener noreferrer">
                        <b>{ano}</b>
                        <span>{nome}</span>
                        {part && <small>{part}</small>}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {f.faixasPNG && (
              <div className={styles.lista} data-rev>
                <p className={styles.etq}>Persona Non Grata</p>
                <ol>
                  {f.faixasPNG.map((n, k) => (
                    <li key={n}><i>{String(k + 1).padStart(2, "0")}</i> {n}</li>
                  ))}
                </ol>
              </div>
            )}

            {f.tracklistAto1 && (
              <div className={styles.lista} data-rev>
                <p className={styles.etq}>O Idiota: Ato I</p>
                <ol>
                  {f.tracklistAto1.map((n, k) => (
                    <li key={n}><i>{String(k + 1).padStart(2, "0")}</i> {n}</li>
                  ))}
                </ol>
              </div>
            )}

            {f.id === "agora" && (
              <div className={styles.posts} data-rev>
                <p className={styles.etq}>no Instagram · os quadros do momento</p>
                <ul>
                  {POSTS.filter((q) => q.data.startsWith("2026") && q.tipo === "Video")
                    .reverse()
                    .map((q) => (
                      <li key={q.sc}>
                        <a href={q.url} target="_blank" rel="noopener noreferrer">
                          <span className={styles.postImg}>
                            <img src={q.img} alt="" loading="lazy" />
                            <i aria-hidden="true">▶</i>
                          </span>
                          <small>
                            {q.data.slice(8, 10)}/{q.data.slice(5, 7)} · {q.views ? `${fmt(q.views)} views` : "reel"}
                          </small>
                          <span className={styles.postLeg}>{q.leg}</span>
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {fotos.length > 0 && f.id !== "agora" && (
              <div className={styles.colagem} data-rev>
                {fotos.map((src, k) => (
                  <img key={src} src={src} alt="" loading="lazy" style={{ "--r": `${(((k * 53) % 7) - 3) * 0.9}deg` }} />
                ))}
              </div>
            )}

            {f.participacoes && (
              <p className={styles.creditos} data-rev>
                <b>Participações:</b> {f.participacoes.join(" · ")}.<br />
                {f.creditos}
              </p>
            )}

            {videos.length > 0 && (
              <div className={`${styles.videos} ${styles["v_" + lay]}`} data-rev>
                <p className={styles.etq}>{lay === "mixtape" ? `${videos.length} clipes` : "no YouTube"}</p>
                <ul>
                  {videos.map((v) => (
                    <Video key={v.yt} v={v} />
                  ))}
                </ul>
              </div>
            )}

            {f.rapdelivery && (
              <Link href="/artistas/rap-delivery" className={styles.rdCartao} data-rev>
                <img src="/rd/logo.webp" alt="" />
                <span>
                  <small>também nessa época</small>
                  <strong>Rap Delivery</strong>
                  <em>o super grupo de entregadores de rap, com 1cort3, domrafa e 82 →</em>
                </span>
              </Link>
            )}
          </section>
          </div>
        );
      })}

      {player && (
        <div className={styles.modal} onClick={() => setPlayer(null)} role="dialog" aria-modal="true" aria-label={player.titulo}>
          <div className={styles.caixaPlayer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.fechar} onClick={() => setPlayer(null)}>fechar</button>
            <p className={styles.etq}>{player.tipo} · {player.ano}</p>
            <h3>{player.titulo}</h3>
            {player.yt ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${player.yt}?autoplay=1&rel=0`}
                title={player.titulo}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                className={styles.spot}
                src={`https://open.spotify.com/embed/album/${player.id}?theme=0`}
                title={player.titulo}
                allow="autoplay; encrypted-media; clipboard-write"
              />
            )}
            <p className={styles.playerLinks}>
              <a href={`https://open.spotify.com/album/${player.id}`} target="_blank" rel="noopener noreferrer">Spotify <Seta /></a>
              {player.yt && (
                <a href={`https://www.youtube.com/watch?v=${player.yt}`} target="_blank" rel="noopener noreferrer">YouTube <Seta /></a>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ===== FINAL ===== */}
      <section className={styles.final} data-rev>
        <p className={styles.etq}>onde ouvir, ver e comprar</p>
        <ul className={styles.redes}>
          {LINKS.map((l) => (
            <li key={l.nome}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                <strong>{l.nome}</strong>
                <small>{l.nota}</small>
                <Seta />
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.rodape}>
          Estúdio <b>Rancho Mont Gomer</b> · coletivo <b>Morlockz</b> · membro do{" "}
          <Link href="/artistas/rap-delivery">Rap Delivery</Link>
        </p>
        <button className={styles.topoBtn} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          voltar ao topo ↑
        </button>
      </section>
    </main>
  );
}
