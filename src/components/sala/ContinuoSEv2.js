"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/continuoSEv2.module.css";
import { FASES, LINKS, PEDACO_FAIXAS, SONHO_FAIXAS, CEVAS_CREDITOS } from "@/data/sergioEstranho";
import { IG } from "@/data/sergioIg";
import { POSTS } from "@/data/sergioPosts";
import CAPAS from "@/data/sergioCapas";

/* ---------- utilidades ---------- */
const capa = (id) => `/se/capas/${id}.webp`;
const thumb = (id) => `/se/yt/${id}.webp`;
const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")} mil` : String(n));
const fase = (id) => FASES.find((f) => f.id === id);
const CAPA_POR_ID = Object.fromEntries(CAPAS.map((c) => [c.id, c]));
const YT_POR_CAPA = {};
FASES.forEach((f) => (f.itens || []).forEach((it) => { if (it.yt) YT_POR_CAPA[it.capa] = it.yt.split("v=")[1]; }));
const HDMI = "7JeujUjW3g8DWReeRJy6ua";

const hex2rgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = ([r, g, b]) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const razao = (a, b) => {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};

/* ---------- cenas: a identidade de cada tela ---------- */
// bgs: cores de fundo dominantes (contraste do logo do topo); ac: acento da cena
const CENAS = [
  { id: "abertura", ano: "2026", tick: "início", rot: "Sergio", bgs: ["#0b0a09"], ac: "#f4c430" },
  { id: "agora", ano: "2026", rot: "Agora", bgs: ["#0a1a3a", "#12306e"], ac: "#38e6ff" },
  { id: "idiota", ano: "2025", rot: "O Idiota", bgs: ["#ecebe4"], ac: "#e23a2b" },
  { id: "maluco", ano: "2024", rot: "Persona Non Grata", bgs: ["#f2f2f2", "#0b0b0b"], ac: "#e5262b" },
  { id: "tabem", ano: "2023", rot: "Não Tô Bem", bgs: ["#f7d54a"], ac: "#c2185b" },
  { id: "rancho", ano: "2020–22", rot: "Rancho", bgs: ["#1b0f3a", "#2c1458"], ac: "#ff3df2" },
  { id: "sonho", ano: "2019", rot: "Tudo Isso É um Sonho", bgs: ["#f6c9e4", "#bfe0ff"], ac: "#c2247f" },
  { id: "cevas", ano: "2018", rot: "O Estranho Idioma", bgs: ["#0d2b2a", "#14403c"], ac: "#9be3c2" },
  { id: "luansantana", ano: "2017", rot: "Luansantanamixtape", bgs: ["#e4e6ea"], ac: "#14213d" },
  { id: "beat-tapes", ano: "2016", rot: "Beat tapes", bgs: ["#ff5c7a", "#ff8a5c"], ac: "#1a0610" },
  { id: "subsolo", ano: "2013–15", rot: "EstranhoBeats", bgs: ["#2a2118"], ac: "#ffb347" },
  { id: "final", ano: "hoje", rot: "Links", bgs: ["#0b0a09"], ac: "#f4c430" },
];
const PREV = CENAS.map((c, i) => (i ? CENAS[i - 1].bgs[0] : "transparent"));
const LEN = 1.3; // tela e meia de rolagem por cena
const FADE = 0.3;

function Seta() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- peças ---------- */
function Cap({ id, abrir, className = "", style, children, nome = true }) {
  const c = CAPA_POR_ID[id];
  if (!c) return null;
  return (
    <button
      type="button"
      className={`${styles.cap} ${className}`}
      style={style}
      onClick={() => abrir({ id, titulo: c.t, tipo: c.tipo, ano: c.ano, yt: YT_POR_CAPA[id] || null })}
      aria-label={`Ouvir ${c.t}`}
    >
      <img src={capa(id)} alt={`Capa de ${c.t}`} loading="lazy" draggable="false" />
      {children}
      {nome && (
        <span className={styles.capNome}>
          <b>{c.t}</b>
          <i>{c.tipo} · {c.ano} · ▶ ouvir</i>
        </span>
      )}
    </button>
  );
}

function Clipe({ v, abrir, className = "" }) {
  return (
    <button
      type="button"
      className={`${styles.clipe} ${className}`}
      onClick={() => abrir({ yt: v.yt, titulo: v.titulo, tipo: "vídeo", ano: v.data.slice(-4), id: null })}
    >
      <span className={styles.clipeImg}>
        <img src={thumb(v.yt)} alt="" loading="lazy" />
        <i aria-hidden="true">▶</i>
      </span>
      <strong>{v.titulo}</strong>
      <small>
        {v.data} · {fmt(v.views)} views{v.nota ? ` · ${v.nota}` : ""}
      </small>
    </button>
  );
}

const videosDe = (id, ids) => {
  const f = fase(id);
  const todos = f.videos || [];
  return ids ? ids.map((i) => todos.find((v) => v.yt === i)).filter(Boolean) : todos;
};

/* ---------- chuva da abertura ---------- */
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

/* ============================================================ */
export default function ContinuoSE() {
  const trilha = useRef(null);
  const topo = useRef(null);
  const cenaRefs = useRef([]);
  const [ativa, setAtiva] = useState(0);
  const [aberta, setAberta] = useState(false);
  const [player, setPlayer] = useState(null);
  const [passo, setPasso] = useState(0);

  const posts = useMemo(
    () => POSTS.filter((q) => q.data.startsWith("2026") && q.tipo === "Video").slice().reverse(),
    []
  );

  /* motor: rolagem -> opacidade/progresso de cada cena; cor do logo do topo */
  useEffect(() => {
    const N = CENAS.length;
    let raf = 0;
    let ultimaAtiva = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const pos = window.scrollY / vh;
      const mobile = window.innerWidth <= 800;
      let melhor = 0, melhorV = -1;
      const pesos = [];
      const els = cenaRefs.current;
      if (!mobile) {
        if (trilha.current && trilha.current.dataset.h) { delete trilha.current.dataset.h; trilha.current.style.removeProperty("height"); }
        CENAS.forEach((c, i) => {
          const el = els[i];
          if (!el) return;
          const local = pos - i * LEN;
          const entra = i === 0 ? 1 : sm((local + FADE) / FADE);
          const sai = i === N - 1 ? 0 : sm((local - (LEN - FADE)) / FADE);
          const v = Math.max(0, entra * (1 - sai));
          const t = Math.min(1, Math.max(0, local / LEN));
          el.style.setProperty("--t", t.toFixed(3));
          el.style.removeProperty("transform");
          el.style.setProperty("opacity", v.toFixed(3), "important");
          el.style.setProperty("visibility", v < 0.01 ? "hidden" : "visible", "important");
          el.style.setProperty("pointer-events", v > 0.6 ? "auto" : "none", "important");
          pesos.push(v);
          if (v > melhorV) { melhorV = v; melhor = i; }
        });
      } else {
        // celular: mesma troca de tela cheia do desktop. Cada tela fica fixa e o conteúdo
        // dela "rola" por dentro (translateY) antes de dar lugar à próxima com fade.
        const Fm = vh * 0.36;
        const alt = els.map((el) => (el ? Math.max(vh, el.offsetHeight) : vh));
        // folga: segura a tela um pouco antes e depois de rolar o conteúdo
        const len = alt.map((h) => h - vh + vh * 0.6 + Fm);
        const ini = [];
        let acc = 0;
        len.forEach((l) => { ini.push(acc); acc += l; });
        const total = Math.round(acc + vh);
        if (trilha.current && trilha.current.dataset.h !== String(total)) {
          trilha.current.dataset.h = String(total);
          trilha.current.style.setProperty("height", total + "px", "important");
        }
        const y = window.scrollY;
        CENAS.forEach((c, i) => {
          const el = els[i];
          if (!el) return;
          const local = y - ini[i];
          const entra = i === 0 ? 1 : sm((local + Fm) / Fm);
          const sai = i === N - 1 ? 0 : sm((local - (len[i] - Fm)) / Fm);
          const v = Math.max(0, entra * (1 - sai));
          const pan = Math.min(alt[i] - vh, Math.max(0, local - vh * 0.3));
          el.style.setProperty("--t", Math.min(1, Math.max(0, local / len[i])).toFixed(3));
          el.style.setProperty("transform", `translate3d(0, ${(-pan).toFixed(1)}px, 0)`, "important");
          el.style.setProperty("opacity", v.toFixed(3), "important");
          el.style.setProperty("visibility", v < 0.01 ? "hidden" : "visible", "important");
          el.style.setProperty("pointer-events", v > 0.6 ? "auto" : "none", "important");
          pesos.push(v);
          if (v > melhorV) { melhorV = v; melhor = i; }
        });
      }
      if (melhor !== ultimaAtiva) {
        ultimaAtiva = melhor;
        setAtiva(melhor);
      }
      // cor do logo: contraste contra o fundo (mistura das cenas visíveis)
      const t2 = topo.current && topo.current.parentElement;
      if (t2) {
        const tot = pesos.reduce((x, y) => x + y, 0) || 1;
        let ac = [0, 0, 0];
        const dom = [];
        CENAS.forEach((c, i) => {
          const w = (pesos[i] || 0) / tot;
          if (w <= 0.02) return;
          const a2 = hex2rgb(c.ac);
          ac = ac.map((v2, k) => v2 + a2[k] * w);
          c.bgs.forEach((bb) => dom.push(hex2rgb(bb)));
        });
        if (dom.length) {
          const pior = (cor) => Math.min(...dom.map((bb) => razao(cor, bb)));
          const cand = [ac.map(Math.round), [255, 255, 255], [17, 17, 17]];
          let esc = cand[0];
          if (pior(esc) < 3.4) esc = pior(cand[1]) >= pior(cand[2]) ? cand[1] : cand[2];
          t2.style.setProperty("--logo", `rgb(${esc[0]},${esc[1]},${esc[2]})`);
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* mobile: o conteúdo de cada tela entra suave ao chegar */
  useEffect(() => {
    if (true) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add(styles.revOn), io.unobserve(e.target))),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    cenaRefs.current.forEach((el, i) => {
      if (!el || i === 0) return;
      [...el.children].forEach((c) => {
        c.classList.add(styles.revM);
        io.observe(c);
      });
    });
    return () => io.disconnect();
  }, []);

  /* arrastar com mouse nos carrosséis */
  useEffect(() => {
    const limpar = [];
    document.querySelectorAll("[data-arrasta]").forEach((el) => {
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
    return () => limpar.forEach((f) => f());
  }, []);

  /* chuva: o mouse afasta as vizinhas e segura a que encosta */
  useEffect(() => {
    const chuva = document.querySelector("[data-chuva]");
    if (!chuva) return;
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
      cancelAnimationFrame(raf2);
      chuva.removeEventListener("pointermove", mover);
      chuva.removeEventListener("pointerleave", sair);
    };
  }, []);

  useEffect(() => {
    if (!player) return;
    const k = (e) => e.key === "Escape" && setPlayer(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [player]);

  const irPara = (i) => {
    if (window.innerWidth <= 800) {
      cenaRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: (i * LEN + 0.12) * window.innerHeight, behavior: "smooth" });
  };

  const abrir = (p) => setPlayer(p);
  const reg = (i) => (el) => { cenaRefs.current[i] = el; };

  const fIdiota = fase("idiota");
  const fMaluco = fase("maluco");
  const fTabem = fase("tabem");
  const fRancho = fase("rancho");
  const fSonho = fase("sonho");
  const fCevas = fase("cevas");
  const fLuan = fase("luansantana");
  const fBeat = fase("beat-tapes");
  const fSub = fase("subsolo");
  const fAgora = fase("agora");
  const passoAtual = fIdiota.passos[passo];
  const passoImg = (IG[passoAtual.ig] || [])[0];
  const cena = CENAS[ativa];

  return (
    <main className={styles.raiz} style={{ "--ac": cena.ac }}>
      <VoltarJodo />
      {/* topo: a montanha da JODO muda de cor conforme o fundo que passa por baixo */}
      <header ref={topo} className={styles.topo}>
        <div className={`${styles.marca} ${aberta ? styles.aberta : ""}`} onClick={() => setAberta((v) => !v)} onMouseLeave={() => setAberta(false)}>
          <Link
            href="/"
            className={styles.marcaLink}
            aria-label="Sergio Estranho: voltar ao topo da página"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <i className={styles.mMontanha} />
            <i className={styles.mSe} />
          </Link>
          <Link href="/artistas/rap-delivery" className={styles.rapSai} aria-label="Rap Delivery">
            <img src="/rd-caixa.webp" alt="Rap Delivery" />
          </Link>
        </div>
      </header>

      {/* continuidade: o ano que troca + a linha do tempo embaixo */}
      <div className={styles.ano} aria-hidden="true">
        <span key={cena.ano} className={styles.anoNum}>{cena.ano}</span>
      </div>
      <nav className={styles.tempo} aria-label="Linha do tempo">
        <ol>
          {CENAS.map((c, i) => (
            <li key={c.id} className={i === ativa ? styles.tOn : ""}>
              <button onClick={() => irPara(i)} aria-label={c.rot}>
                <b />
                <span>{c.tick || (c.ano === "hoje" ? "links" : c.ano)}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div ref={trilha} className={styles.trilha} style={{ "--n": CENAS.length, "--len": LEN }}>
        <div className={styles.palco}>
          {/* ===== 0 · abertura ===== */}
          <section ref={reg(0)} style={{ "--prev": PREV[0] }} className={`${styles.cena} ${styles.c_abertura}`}>
            <div className={styles.chuva} data-chuva>
              {CHUVA.map((c, k) => (
                <button
                  key={k}
                  type="button"
                  className={`${styles.gota} ${c.longe ? styles.longe : ""}`}
                  style={{ "--x": `${c.x}%`, "--t": `${c.tam}rem`, "--dur": `${c.dur}s`, "--atraso": `${c.atraso}s`, "--bal": `${c.balanco}px`, "--giro": `${c.giro}deg` }}
                  aria-label={`Ouvir ${c.t} (${c.tipo}, ${c.ano})`}
                  onClick={() => abrir({ id: c.id, titulo: c.t, tipo: c.tipo, ano: c.ano, yt: YT_POR_CAPA[c.id] || null })}
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
                Beatmaker e rimador da zona norte de São Paulo. Quinze anos de beat, rima e vídeo caseiro. Integrante do Rap Delivery.
              </p>
              <ul className={styles.numeros}>
                <li><b>41</b> lançamentos no Spotify</li>
                <li><b>99</b> vídeos no YouTube</li>
                <li><b>2013</b> → <b>2026</b></li>
              </ul>
            </div>
            <a
              className={styles.selo}
              href={`https://open.spotify.com/album/${HDMI}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ouvir O Idiota: Ato II (Deluxe HDMI) no Spotify"
            >
              o álbum mais humilde do ano
              <small>ouvir ↗</small>
            </a>
            <p className={styles.dicaSelo}>role: do mais novo ao mais antigo ↓</p>
          </section>

          {/* ===== 1 · 2026 agora ===== */}
          <section ref={reg(1)} style={{ "--prev": PREV[1] }} className={`${styles.cena} ${styles.c_agora}`}>
            <div className={styles.agoraTxt}>
              <p className={styles.etq}>2026 · o que está rolando</p>
              <h2>AGORA</h2>
              <p>{fAgora.texto[0]}</p>
              <a className={styles.botao} href="https://www.instagram.com/sergioestranho/" target="_blank" rel="noopener noreferrer">
                ver tudo no Instagram <Seta />
              </a>
            </div>
            <ul className={styles.celulares}>
              {posts.slice(0, 5).map((q, k) => (
                <li key={q.sc} style={{ "--k": k }}>
                  <a href={q.url} target="_blank" rel="noopener noreferrer">
                    <span className={styles.tela}>
                      <img src={q.img} alt="" loading="lazy" />
                      <i aria-hidden="true">▶</i>
                    </span>
                    <small>{q.data.slice(8, 10)}/{q.data.slice(5, 7)} · {q.views ? `${fmt(q.views)} views` : "reel"}</small>
                    <span className={styles.leg}>{q.leg}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* ===== 2 · 2025 O Idiota ===== */}
          <section ref={reg(2)} style={{ "--prev": PREV[2] }} className={`${styles.cena} ${styles.c_idiota}`}>
            <div className={styles.idPilha}>
              <Cap id={HDMI} abrir={abrir} className={styles.idGrande} />
              <Cap id="023LKRDk0McH4yzC2AqJ0C" abrir={abrir} className={styles.idMeio} />
              <Cap id="2F0Hsjb0SNMoRhhUvzGYx2" abrir={abrir} className={styles.idPeq} />
            </div>
            <div className={styles.idTxt}>
              <p className={styles.etq}>2025 · o álbum mais humilde do ano</p>
              <h2>O Idiota</h2>
              <p>{fIdiota.texto[0]}</p>
              <ol className={styles.novela}>
                {fIdiota.passos.map((p, k) => (
                  <li key={p.d} className={k === passo ? styles.on : ""} onMouseEnter={() => setPasso(k)} onFocus={() => setPasso(k)} onClick={() => setPasso(k)} tabIndex={0}>
                    <b>{p.d}</b>
                    <span><strong>{p.t}</strong> {p.x}</span>
                    {(IG[p.ig] || [])[0] && (
                      <span className={styles.novelaFoto}>
                        <img src={(IG[p.ig] || [])[0]} alt="" loading="lazy" style={p.zoom ? { transform: `scale(${p.zoom})` } : undefined} />
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
            <figure className={styles.idFoto}>
              {passoImg && (
                <span className={styles.idFotoImg}>
                  <img key={passoImg} src={passoImg} alt="" style={passoAtual.zoom ? { transform: `scale(${passoAtual.zoom})` } : undefined} />
                </span>
              )}
              <figcaption>{passoAtual.d} · {passoAtual.t}</figcaption>
            </figure>
          </section>

          {/* ===== 3 · 2024 ===== */}
          <section ref={reg(3)} style={{ "--prev": PREV[3] }} className={`${styles.cena} ${styles.c_maluco}`}>
            <div className={styles.mLado}>
              <p className={styles.etq}>janeiro de 2024 · mixtape</p>
              <h2>UM PEDAÇO<br />DO MALUCO</h2>
              <div className={styles.mDuas}>
                <Cap id="0DNmWLuHK6HgMFqrIYbLRA" abrir={abrir} className={styles.mCapa} />
                <p className={styles.mTxt}>{fMaluco.texto[0]}</p>
              </div>
              <ol className={styles.pedaco}>
                {PEDACO_FAIXAS.map(([n, ft], k) => (
                  <li key={n}>
                    <i>{String(k + 1).padStart(2, "0")}</i>
                    <span>{n}{ft ? <em> · {ft}</em> : null}</span>
                  </li>
                ))}
              </ol>
              <p className={styles.mFim}>23 faixas · 46 min · clipe de Rascunho Riscado: 82, no canal da JODO</p>
            </div>
            <div className={`${styles.mLado} ${styles.mPreto}`}>
              <p className={styles.etq}>segundo semestre · EP · Sujoground</p>
              <Cap id="5nWYRnVlXKFOzWU6XTX0ew" abrir={abrir} className={`${styles.mCapa} ${styles.mCapaGrande}`} />
              <ol className={styles.estencil}>
                {fMaluco.faixasPNG.map((n, k) => (
                  <li key={n}><i>{String(k + 1).padStart(2, "0")}</i> {n}</li>
                ))}
              </ol>
              <p className={styles.mTxt}>{fMaluco.texto[1]}</p>
              <div className={styles.mExtras}>
                <Cap id="2E68TqAEyRUVrDPbbzOXjI" abrir={abrir} className={styles.mini} nome={false} />
                <span>Sou Chato e Durmo Cedo, com Bruno Darko e Neutro, a mais ouvida: ~97 mil plays.</span>
              </div>
            </div>
          </section>

          {/* ===== 4 · 2023 ===== */}
          <section ref={reg(4)} style={{ "--prev": PREV[4] }} className={`${styles.cena} ${styles.c_tabem}`}>
            <div className={styles.tTxt}>
              <p className={styles.etq}>2023 · duas beat tapes irmãs</p>
              <h2>Tô bem.<br />Não tô bem.</h2>
              <p>{fTabem.texto[0]}</p>
              <div className={styles.tPeq}>
                <Cap id="3VAvcSbWyVy140rGQB5IX0" abrir={abrir} className={styles.tSingle} />
                <Cap id="7C1qGu3QcsoZuBmZxWDOd3" abrir={abrir} className={styles.tSingle} />
              </div>
            </div>
            <div className={styles.discos}>
              <Cap id="1kCu5YhCIu5V71TgewhRVm" abrir={abrir} className={`${styles.disco} ${styles.d1}`} />
              <Cap id="1w5kEEQ1tbkC8CgJVobQEo" abrir={abrir} className={`${styles.disco} ${styles.d2}`} />
            </div>
          </section>

          {/* ===== 5 · 2020–2022 ===== */}
          <section ref={reg(5)} style={{ "--prev": PREV[5] }} className={`${styles.cena} ${styles.c_rancho}`}>
            <div className={styles.rTxt}>
              <p className={styles.etq}>2020 — 2022 · os anos de casa</p>
              <h2>RANCHO<br />MONT GOMER</h2>
              <p>{fRancho.texto[0]}</p>
              <Link href="/artistas/rap-delivery" className={styles.botao}>Rap Delivery, a outra página →</Link>
            </div>
            <div className={styles.cartuchos} data-arrasta>
              {fRancho.itens.map((it, k) => (
                <Cap key={it.capa} id={it.capa} abrir={abrir} className={styles.cartucho} style={{ "--k": k }}>
                  <em>{it.ano}</em>
                </Cap>
              ))}
            </div>
          </section>

          {/* ===== 6 · 2019 ===== */}
          <section ref={reg(6)} style={{ "--prev": PREV[6] }} className={`${styles.cena} ${styles.c_sonho}`}>
            <div className={styles.sCapa}>
              <Cap id="2w5YyPJBTDS6u19AciCTFg" abrir={abrir} className={styles.sGrande} />
              <p className={styles.etq}>EP · cinco faixas, quatro clipes</p>
              <h2>Tudo isso<br />é um sonho</h2>
              <p>{fSonho.texto[0]}</p>
              <ol className={styles.sFaixas}>
                {SONHO_FAIXAS.map(([n, ft, yid], k) => (
                  <li key={n}>
                    <i>{String(k + 1).padStart(2, "0")}</i>
                    <span>{n}{ft ? <em> · {ft}</em> : null}</span>
                    {yid ? (
                      <button onClick={() => abrir({ yt: yid, titulo: n, tipo: "clipe", ano: 2019, id: null })}>▶ clipe</button>
                    ) : (
                      <small>só áudio</small>
                    )}
                  </li>
                ))}
              </ol>
            </div>
            <ul className={styles.tvs}>
              {videosDe("sonho", ["OWysFE4Y-2g", "YmASqFDxxbY", "Q6OgqVg84Nc", "ah7xY5bPmeM"]).map((v, k) => (
                <li key={v.yt} style={{ "--k": k }}>
                  <Clipe v={v} abrir={abrir} />
                </li>
              ))}
            </ul>
            <p className={styles.sFim}>
              No mesmo ano: <b>Efeito 4&apos;33&quot;</b> (com Isaac de Salú), Banheira de Glock, Desculpa por Ser Rapper, Nada Congelado, Pleno e Ação Invulgar.
            </p>
          </section>

          {/* ===== 7 · 2018 ===== */}
          <section ref={reg(7)} style={{ "--prev": PREV[7] }} className={`${styles.cena} ${styles.c_cevas}`}>
            <div className={styles.cvTxt}>
              <p className={styles.etq}>2018 · Cevas × Sergio Estranho</p>
              <h2>O Estranho<br />Idioma</h2>
              <p>{fCevas.texto[0]}</p>
              <ol className={styles.cvFaixas}>
                {["4BDMxTymqCmv8GN9w9taEX", "6ZbnlIMuUU9YKJqSz8HEjR", "2KUkvKyXkKs03hUwMYVWuT", "54z1fJfVpdsIzXSv4Y5tNi"].map((id, k) => (
                  <li key={id}>
                    <button onClick={() => abrir({ id, titulo: CAPA_POR_ID[id].t, tipo: "single", ano: 2018, yt: YT_POR_CAPA[id] || null })}>
                      <i>{String(k + 1).padStart(2, "0")}</i> {CAPA_POR_ID[id].t} <span>▶</span>
                    </button>
                  </li>
                ))}
              </ol>
              <dl className={styles.cvCred}>
                {CEVAS_CREDITOS.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={styles.cvVisual}>
              <Cap id="4BDMxTymqCmv8GN9w9taEX" abrir={abrir} className={styles.cvCapa} />
              <div className={styles.cvClipes}>
                {videosDe("cevas").slice(0, 3).map((v) => (
                  <Clipe key={v.yt} v={v} abrir={abrir} />
                ))}
              </div>
            </div>
          </section>

          {/* ===== 8 · 2017 ===== */}
          <section ref={reg(8)} style={{ "--prev": PREV[8] }} className={`${styles.cena} ${styles.c_luan}`}>
            <div className={styles.lHead}>
              <p className={styles.etq}>2017 · 13 de março de 1991, o mundo começou</p>
              <h2>Luansantana<wbr />mixtape</h2>
              <p>{fLuan.texto[1]}</p>
            </div>
            <ol className={styles.indice}>
              {fLuan.faixas.map(([ano, nome, part, yid]) => (
                <li key={ano}>
                  <button onClick={() => abrir({ yt: yid, titulo: `${ano} · ${nome}`, tipo: "faixa", ano: 2017, id: null })}>
                    <b>{ano}</b>
                    <span>{nome}</span>
                    {part && <small>{part}</small>}
                  </button>
                </li>
              ))}
            </ol>
            <div className={styles.lLado}>
              <Cap id="7lsI7pq16emi72rOlbErK0" abrir={abrir} className={styles.lCapa} />
              <dl className={styles.lFicha}>
                <div><dt>Arte e vídeo</dt><dd>Rodrigo Bento</dd></div>
                <div><dt>Foto</dt><dd>Mon</dd></div>
                <div><dt>Mix e master</dt><dd>Estranho</dd></div>
                <div><dt>Vozes</dt><dd>Rancho Mont Gomer</dd></div>
                <div><dt>Scratchs, faixa 11</dt><dd>Kilo Inc.</dd></div>
              </dl>
              <ul className={styles.filme}>
                {videosDe("luansantana").map((v) => (
                  <li key={v.yt}>
                    <Clipe v={v} abrir={abrir} />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ===== 9 · 2016 ===== */}
          <section ref={reg(9)} style={{ "--prev": PREV[9] }} className={`${styles.cena} ${styles.c_beat}`}>
            <div className={styles.bTxt}>
              <p className={styles.etq}>2016 · o ano de fazer tudo</p>
              <h2>BEAT<br />TAPES</h2>
              <span className={styles.bSub}>e vlogs, e Vai Que É Sua Tafarel</span>
              <p>{fBeat.texto[0]}</p>
            </div>
            <div className={styles.adesivos}>
              {fBeat.itens.map((it, k) => (
                <Cap key={it.capa} id={it.capa} abrir={abrir} className={styles.adCapa} style={{ "--k": k }} nome={false} />
              ))}
              <span className={styles.bSelo}>Vai Que É Sua Tafarel<small>2016 · 2017</small></span>
              {videosDe("beat-tapes").slice(0, 5).map((v) => (
                <Clipe key={v.yt} v={v} abrir={abrir} className={styles.adClipe} />
              ))}
            </div>
          </section>

          {/* ===== 10 · 2013–2015 ===== */}
          <section ref={reg(10)} style={{ "--prev": PREV[10] }} className={`${styles.cena} ${styles.c_sub}`}>
            <div className={styles.sbTxt}>
              <p className={styles.etq}>REC ● 2013 — 2015</p>
              <h2>EstranhoBeats</h2>
              <p>{fSub.texto[0]}</p>
            </div>
            <div className={styles.crts}>
              {videosDe("subsolo", ["cjvJMEK6r70", "ErQZUq9UGs4"]).map((v) => (
                <button key={v.yt} className={styles.crt} onClick={() => abrir({ yt: v.yt, titulo: v.titulo, tipo: "vídeo", ano: v.data.slice(-4), id: null })}>
                  <span><img src={thumb(v.yt)} alt="" loading="lazy" /></span>
                  <em>PLAY ▶ {v.data}</em>
                  <strong>{v.titulo}</strong>
                </button>
              ))}
            </div>
            <p className={styles.sigla} aria-hidden="true">
              E.S.T.R.A.<br />N.H.O.
              <small>(esta sigla não significa nada)</small>
            </p>
            <ul className={styles.pasta}>
              {videosDe("subsolo", ["XRVUa3nHgK0", "GORvYC8xoRs", "7PPgF3FkIrk", "7XMrV-hUk9Q", "GRAewTsqSR8"]).map((v) => (
                <li key={v.yt}>
                  <button onClick={() => abrir({ yt: v.yt, titulo: v.titulo, tipo: "vídeo", ano: v.data.slice(-4), id: null })}>
                    <i>{v.data}</i> {v.titulo} <span>{fmt(v.views)}</span>
                  </button>
                </li>
              ))}
              {fSub.itens.map((it) => (
                <li key={it.capa}>
                  <button onClick={() => abrir({ id: it.capa, titulo: it.titulo, tipo: it.tipo, ano: it.ano, yt: null })}>
                    <i>{it.ano}</i> {it.titulo} <span>spotify</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* ===== 11 · final ===== */}
          <section ref={reg(11)} style={{ "--prev": PREV[11] }} className={`${styles.cena} ${styles.c_final}`}>
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
            <Link href="/artistas/rap-delivery" className={styles.rdFinal}>
              <img src="/rd-caixa.webp" alt="" />
              <span>
                <small>também no</small>
                <strong>Rap Delivery</strong>
                <em>o super grupo de entregadores de rap, com 1cort3, domrafa e 82 →</em>
              </span>
            </Link>
            <button className={styles.topoBtn} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              voltar ao topo ↑
            </button>
          </section>
        </div>
      </div>

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
              {player.id && (
                <a href={`https://open.spotify.com/album/${player.id}`} target="_blank" rel="noopener noreferrer">Spotify <Seta /></a>
              )}
              {player.yt && (
                <a href={`https://www.youtube.com/watch?v=${player.yt}`} target="_blank" rel="noopener noreferrer">YouTube <Seta /></a>
              )}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
