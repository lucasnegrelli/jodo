"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/continuoC3.module.css";
import CAPAS from "@/data/c3Capas.json";
import VIDEOS from "@/data/c3Videos.json";

/* ---------- utilidades ---------- */
const capa = (id) => `/c3/capas/${id}.webp`;
const thumb = (id) => `/c3/yt/${id}.webp`;
const ig = (n) => `/c3/ig/${n}.webp`;
const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")} mil` : String(n));
const CAPA = Object.fromEntries(CAPAS.map((c) => [c.id, c]));
const VID = Object.fromEntries(VIDEOS.map((v) => [v.id, v]));
const dataBr = (s) => `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;

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

const AMANHA = "7N2l86SAph4EmZYOC8UegF";
const PARANOILISMO = "0FBHiiGSlZKNunpesNNx3t";

const SPOTIFY = "https://open.spotify.com/intl-pt/artist/6eroWsdqxSDDCB0klggZlY";
const YOUTUBE = "https://www.youtube.com/channel/UCwkhz_4ZMHl-a06mA7MfX2g";
const LINKS = [
  { nome: "Spotify", url: SPOTIFY, nota: "1cort3" },
  { nome: "YouTube", url: YOUTUBE, nota: "TRASHTREVASGANG · desde 2017" },
  { nome: "Instagram", url: "https://www.instagram.com/1cort3_/", nota: "@1cort3_" },
  { nome: "Linktree", url: "https://linktr.ee/1cort3", nota: "tudo num lugar só" },
];

/* ---------- cenas ---------- */
const CENAS = [
  { id: "abertura", ano: "2026", tick: "início", bgs: ["#07080a"], ac: "#b6ff3c" },
  { id: "amanha", ano: "2026", rot: "Amanhã", bgs: ["#1a0a1c", "#2a0f2e"], ac: "#ff3df2" },
  { id: "rimas", ano: "2022", rot: "Rimas pra Viagem", bgs: ["#ffd400"], ac: "#111111" },
  { id: "parano", ano: "2021", rot: "Paranoilismo", bgs: ["#0b1a0e", "#0f2a14"], ac: "#b6ff3c" },
  { id: "micro", ano: "2020", rot: "MicroTape", bgs: ["#e9e1cf"], ac: "#b3201a" },
  { id: "conhaque", ano: "2019", rot: "Conhaque", bgs: ["#1b0f3a", "#2b1658"], ac: "#c7a6ff" },
  { id: "darco", ano: "2018–19", rot: "yungdarco22", bgs: ["#0d0d0d"], ac: "#ff5a1f" },
  { id: "quintal", ano: "2017–18", rot: "O quintal", bgs: ["#2b2118", "#1b140d"], ac: "#e8b25a" },
  { id: "final", ano: "hoje", tick: "links", bgs: ["#07080a"], ac: "#b6ff3c" },
];
const LEN = 1.3;
const FADE = 0.3;

function Seta() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cap({ id, abrir, className = "", style, nome = true }) {
  const c = CAPA[id];
  if (!c) return null;
  return (
    <button
      type="button"
      className={`${styles.cap} ${className}`}
      style={style}
      onClick={() => abrir({ id, titulo: c.t, tipo: c.tipo, ano: c.ano, yt: null })}
      aria-label={`Ouvir ${c.t}`}
    >
      <img src={capa(id)} alt={`Capa de ${c.t}`} loading="lazy" draggable="false" />
      {nome && (
        <span className={styles.capNome}>
          <b>{c.t}</b>
          <i>{c.tipo} · {c.ano} · ▶ ouvir</i>
        </span>
      )}
    </button>
  );
}

function Clipe({ id, abrir, className = "", curto = false }) {
  const v = VID[id];
  if (!v) return null;
  return (
    <button
      type="button"
      className={`${styles.clipe} ${className}`}
      onClick={() => abrir({ yt: id, titulo: v.t, tipo: "vídeo", ano: v.d.slice(0, 4), id: null })}
    >
      <span className={styles.clipeImg}>
        <img src={thumb(id)} alt="" loading="lazy" />
        <i aria-hidden="true">▶</i>
      </span>
      <strong>{v.t}</strong>
      {!curto && (
        <small>
          {dataBr(v.d)} · {fmt(v.v)} views
        </small>
      )}
    </button>
  );
}

/* chuva de miniaturas na abertura */
const GOTAS = (() => {
  const ids = VIDEOS.map((v) => v.id);
  return Array.from({ length: 24 }, (_, k) => {
    const r = (n) => {
      const x = Math.sin((k + 1) * 12.9898 + n * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return {
      id: ids[(k * 7) % ids.length],
      x: 2 + r(2) * 92,
      tam: 6 + r(3) * 6,
      dur: 22 + r(4) * 20,
      atraso: -r(5) * 50,
      giro: -10 + r(6) * 20,
    };
  });
})();

/* ============================================================ */
export default function ContinuoC3() {
  const trilha = useRef(null);
  const topo = useRef(null);
  const cenaRefs = useRef([]);
  const [ativa, setAtiva] = useState(0);
  const [aberta, setAberta] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const N = CENAS.length;
    let raf = 0;
    let ultima = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const pos = window.scrollY / vh;
      const mobile = window.innerWidth <= 800;
      const els = cenaRefs.current;
      const pesos = [];
      let melhor = 0, melhorV = -1;
      if (!mobile) {
        if (trilha.current && trilha.current.dataset.h) {
          delete trilha.current.dataset.h;
          trilha.current.style.removeProperty("height");
        }
        CENAS.forEach((c, i) => {
          const el = els[i];
          if (!el) return;
          const local = pos - i * LEN;
          const entra = i === 0 ? 1 : sm((local + FADE) / FADE);
          const sai = i === N - 1 ? 0 : sm((local - (LEN - FADE)) / FADE);
          const v = Math.max(0, entra * (1 - sai));
          el.style.setProperty("--t", Math.min(1, Math.max(0, local / LEN)).toFixed(3));
          el.style.removeProperty("transform");
          el.style.setProperty("opacity", v.toFixed(3), "important");
          el.style.setProperty("visibility", v < 0.01 ? "hidden" : "visible", "important");
          el.style.setProperty("pointer-events", v > 0.6 ? "auto" : "none", "important");
          pesos.push(v);
          if (v > melhorV) { melhorV = v; melhor = i; }
        });
      } else {
        const Fm = vh * 0.36;
        const alt = els.map((el) => (el ? Math.max(vh, el.offsetHeight) : vh));
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
          el.style.setProperty("transform", `translate3d(0, ${(-pan).toFixed(1)}px, 0)`, "important");
          el.style.setProperty("opacity", v.toFixed(3), "important");
          el.style.setProperty("visibility", v < 0.01 ? "hidden" : "visible", "important");
          el.style.setProperty("pointer-events", v > 0.6 ? "auto" : "none", "important");
          pesos.push(v);
          if (v > melhorV) { melhorV = v; melhor = i; }
        });
      }
      if (melhor !== ultima) {
        ultima = melhor;
        setAtiva(melhor);
      }
      const t2 = topo.current;
      if (t2) {
        const tot = pesos.reduce((x, y2) => x + y2, 0) || 1;
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

  useEffect(() => {
    if (!player) return;
    const k = (e) => e.key === "Escape" && setPlayer(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [player]);

  const irPara = (i) => {
    if (window.innerWidth <= 800) {
      let h = 0;
      for (let k = 0; k < i; k++) {
        const el = cenaRefs.current[k];
        const a = el ? Math.max(window.innerHeight, el.offsetHeight) : window.innerHeight;
        h += a - window.innerHeight + window.innerHeight * 0.96;
      }
      window.scrollTo({ top: h + 4, behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: (i * LEN + 0.12) * window.innerHeight, behavior: "smooth" });
  };

  const abrir = (p) => setPlayer(p);
  const reg = (i) => (el) => { cenaRefs.current[i] = el; };
  const cena = CENAS[ativa];

  return (
    <main className={styles.raiz} style={{ "--ac": cena.ac }}>
      <header ref={topo} className={styles.topo}>
        <div className={`${styles.marca} ${aberta ? styles.aberta : ""}`} onClick={() => setAberta((v) => !v)}>
          <Link
            href="/"
            className={styles.marcaLink}
            aria-label="1cort3: voltar ao topo da página"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <i className={styles.mMontanha} />
            <b className={styles.mNome}>1cort3</b>
          </Link>
          <Link href="/artistas/rap-delivery" className={styles.rapSai} aria-label="Rap Delivery">
            <img src="/rd-caixa.webp" alt="Rap Delivery" />
          </Link>
        </div>
      </header>

      <div className={styles.ano} aria-hidden="true">
        <span key={cena.ano} className={styles.anoNum}>{cena.ano}</span>
      </div>
      <nav className={styles.tempo} aria-label="Linha do tempo">
        <ol>
          {CENAS.map((c, i) => (
            <li key={c.id} className={i === ativa ? styles.tOn : ""}>
              <button onClick={() => irPara(i)} aria-label={c.rot || c.tick}>
                <b />
                <span>{c.tick || c.ano}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div ref={trilha} className={styles.trilha} style={{ "--n": CENAS.length, "--len": LEN }}>
        <div className={styles.palco}>
          {/* 0 · abertura */}
          <section ref={reg(0)} className={`${styles.cena} ${styles.c_abertura}`}>
            <div className={styles.chuva} aria-hidden="true">
              {GOTAS.map((g, k) => (
                <span
                  key={k}
                  className={styles.gota}
                  style={{ "--x": `${g.x}%`, "--t": `${g.tam}rem`, "--dur": `${g.dur}s`, "--atraso": `${g.atraso}s`, "--giro": `${g.giro}deg` }}
                >
                  <img src={thumb(g.id)} alt="" loading="lazy" />
                </span>
              ))}
            </div>
            <div className={styles.aberturaTxt}>
              <p className={styles.etq}>mc · produtor · experimental · trashtrevasgang</p>
              <h1 data-t="1cort3">1cort3</h1>
              <p className={styles.lide}>
                Perdidão no inferno de concreto, fabricando mp3 daqui até a morte. Começou em 2017 com o yungdarco22, no quintal, como Trash Trevas Gang. Hoje é Rap Delivery e solo.
              </p>
              <ul className={styles.numeros}>
                <li><b>57</b> vídeos no YouTube</li>
                <li><b>9</b> lançamentos no Spotify</li>
                <li><b>2017</b> → <b>2026</b></li>
              </ul>
            </div>
            <p className={styles.dicaBase}>role: do mais novo ao mais antigo ↓</p>
          </section>

          {/* 1 · 2026 */}
          <section ref={reg(1)} className={`${styles.cena} ${styles.c_amanha}`}>
            <div className={styles.amTxt}>
              <p className={styles.etq}>2026 · a volta</p>
              <h2>AMANHÃ<span>.mp3</span></h2>
              <p>
                Em maio de 2026 o 1cort3 volta a largar faixa nova: Amanhã (20/05), Porto de Taiwan (30/06) e o remaster de um som oculto de 2019, Atmos(Fera) (31/07). Letra, beat e remaster do próprio.
              </p>
              <p className={styles.fichaMini}>
                Amanhã: capa do disssimulator · rec, mix e master do @joncotidie · fotos e edição do Gabriel Jovita
              </p>
            </div>
            <div className={styles.janelas}>
              <Cap id={AMANHA} abrir={abrir} className={styles.jGrande} />
              <Cap id="5iOE7xLlpjMpsQxLJbHdFd" abrir={abrir} className={styles.jMeio} />
              <Cap id="1X5JbYwCzzZ99Hpd1E8tCR" abrir={abrir} className={styles.jPeq} />
              <figure className={styles.jFoto}>
                <img src={ig("2026-05-18_DYfvD4cnW2w_01")} alt="" loading="lazy" />
                <figcaption>20.05.26 · o amanhã chegou</figcaption>
              </figure>
            </div>
          </section>

          {/* 2 · Rimas pra Viagem */}
          <section ref={reg(2)} className={`${styles.cena} ${styles.c_rimas}`}>
            <div className={styles.rmTxt}>
              <p className={styles.etq}>2022 · rap delivery</p>
              <h2>RIMAS<br />PRA VIAGEM</h2>
              <p>
                O disco do Rap Delivery, com 1cort3, Sergio Estranho, domrafa e 82. Aqui o Caio rima e produz junto com o grupo; a história completa do disco, do show e da estrada está na página do Rap Delivery.
              </p>
              <Link href="/artistas/rap-delivery" className={styles.botao}>página do Rap Delivery →</Link>
            </div>
            <div className={styles.rmCapa}>
              <img src="/rd/rimas-capa.webp" alt="Capa do Rimas pra Viagem" loading="lazy" />
            </div>
          </section>

          {/* 3 · 2021–22 */}
          <section ref={reg(3)} className={`${styles.cena} ${styles.c_parano}`}>
            <div className={styles.pnTxt}>
              <p className={styles.etq}>2021 · EP · 6 faixas · 17 min</p>
              <h2>PARANOILISMO</h2>
              <ol className={styles.pnFaixas}>
                <li><i>01</i> Relatos da Queda <em>· Sergio Estranho</em></li>
                <li><i>02</i> Jazz do Otário <em>· El Mandarim</em></li>
                <li><i>03</i> Skit</li>
                <li><i>04</i> Linue <em>· SAULL OE</em></li>
                <li><i>05</i> Apocalipsiquikis</li>
                <li><i>06</i> Nadando para o Nada</li>
              </ol>
              <p className={styles.fichaMini}>Em 2022 ainda saem Reflexos Noturnos (beat do DK, mix do Sergio) e, em dezembro de 2023, Conflito Delirante.</p>
            </div>
            <div className={styles.pnVis}>
              <Cap id={PARANOILISMO} abrir={abrir} className={styles.pnCapa} />
              <div className={styles.pnClipes}>
                <Clipe id="3RAprgsioNg" abrir={abrir} />
                <Clipe id="KxpaGYx7uJQ" abrir={abrir} />
                <Clipe id="HQpDJl6escA" abrir={abrir} />
              </div>
            </div>
          </section>

          {/* 4 · 2020 */}
          <section ref={reg(4)} className={`${styles.cena} ${styles.c_micro}`}>
            <div className={styles.mcTxt}>
              <p className={styles.etq}>2020 · MicroTape</p>
              <h2>FAUSTÃO,<br />EU ESTOU<br />SANGRANDO</h2>
              <p>
                Uma microtape de três faixas, cada uma com a data de um dia de 1989: 26 de março, 2 de abril, 9 de abril. No mesmo ano, dois clipes caseiros: homenagem a varanda e janela, e passeando em corredores de mercados mortos.
              </p>
            </div>
            <ul className={styles.recortes}>
              {["vOsP_s874yE", "8VDRvlzJSaM", "Hgk9sEeSnmo", "ibvJzVxNFo8", "v8Vm84rxXPQ"].map((id, k) => (
                <li key={id} style={{ "--k": k }}>
                  <Clipe id={id} abrir={abrir} />
                </li>
              ))}
            </ul>
          </section>

          {/* 5 · 2019 */}
          <section ref={reg(5)} className={`${styles.cena} ${styles.c_conhaque}`}>
            <div className={styles.chTxt}>
              <p className={styles.etq}>2019 · a fase mais produtiva</p>
              <h2>CONHAQU3</h2>
              <p>
                Vinte e três vídeos em um ano: freestyles, clipes e as faixas que viram single depois. Conhaqu3 (março), Coisas loucas no seu sabadown, LOVETREVASONG e a série com yungdarco22.
              </p>
            </div>
            <div className={styles.chVis}>
              <div className={styles.chCapas}>
                <Cap id="16NEortbsWuSKJmopD726x" abrir={abrir} />
                <Cap id="03buoofuEegSBMhTJj6Tqe" abrir={abrir} />
                <Cap id="1Mt55lMhJwmDYiZQAVAoy4" abrir={abrir} />
              </div>
              <div className={styles.chClipes}>
                <Clipe id="b100oQ1MVU8" abrir={abrir} />
                <Clipe id="dunMozZyZl4" abrir={abrir} />
              </div>
            </div>
          </section>

          {/* 6 · yungdarco22 */}
          <section ref={reg(6)} className={`${styles.cena} ${styles.c_darco}`}>
            <div className={styles.dcTxt}>
              <p className={styles.etq}>o parceiro</p>
              <h2>YUNG<br />DARCO<br />22</h2>
              <p>
                O yungdarco22 está em metade do canal. Faixas dele, faixas juntos, instrumental e voz trocando de lugar. Foi com ele que o 1cort3 começou, e a Trash Trevas Gang nasceu aí.
              </p>
            </div>
            <ul className={styles.polaroids}>
              {["hnvxFufYZIM", "waSh8xq8_lY", "Gg88Sf2QQDo", "xZzMv3DoUeI", "hLLgXwIxY4Y", "0in3NrZE8PU"].map((id, k) => (
                <li key={id} style={{ "--k": k }}>
                  <Clipe id={id} abrir={abrir} />
                </li>
              ))}
            </ul>
          </section>

          {/* 7 · 2017–18 */}
          <section ref={reg(7)} className={`${styles.cena} ${styles.c_quintal}`}>
            <div className={styles.qtTxt}>
              <p className={styles.etq}>dez/2017 → 2018 · trash trevas gang</p>
              <h2>O QUINTAL</h2>
              <p>
                Trap gravado no quintal do yungdarco22, “dentro de um buraco imundo em algum canto do sétimo círculo do inferno”, “numa garrafa de Askov”. Instrumental de um, voz do outro, master do Arthur Pereira.
              </p>
            </div>
            <ul className={styles.arquivo}>
              {["xLDrzVbnZNo", "jw3C1a19t74", "0in3NrZE8PU", "hLLgXwIxY4Y", "wXhD1YJb-R0", "Z6UdtRn6Kqs"].map((id) => {
                const v = VID[id];
                return (
                  <li key={id}>
                    <button onClick={() => abrir({ yt: id, titulo: v.t, tipo: "vídeo", ano: v.d.slice(0, 4), id: null })}>
                      <i>{dataBr(v.d)}</i>
                      <span>{v.t}</span>
                      <em>{fmt(v.v)}</em>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className={styles.qtVid}>
              <Clipe id="wXhD1YJb-R0" abrir={abrir} />
            </div>
          </section>

          {/* 8 · final */}
          <section ref={reg(8)} className={`${styles.cena} ${styles.c_final}`}>
            <p className={styles.etq}>onde ouvir e ver</p>
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
                <em>o super grupo de entregadores de rap, com Sergio Estranho, domrafa e 82 →</em>
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
