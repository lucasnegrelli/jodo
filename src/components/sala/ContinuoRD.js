"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/continuoRD.module.css";
import useContrasteLogo from "@/lib/useContrasteLogo";

const thumb = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
function fmt(n) {
  if (n == null) return "";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",") + " mil";
  return String(n);
}

/* linha do tempo em alturas de tela: uma cena só, as seções se transformam uma na outra */
const CENA = {
  abertura: [0, 2.4],
  proximas: [2.0, 4.9],
  rimas: [4.5, 7.6],
  dia: [7.2, 10.1],
  caminho: [9.7, 12.8],
  pedido: [12.4, 15.4],
  quatro: [15.0, 17.8],
};
const TOTAL = 17.8;
const FUNDOS = [
  [0, [11, 11, 11]],
  [1.9, [11, 11, 11]],
  [2.9, [26, 13, 46]],
  [4.1, [26, 13, 46]],
  [4.9, [11, 11, 11]],
  [9.5, [11, 11, 11]],
  [10.2, [7, 16, 11]],
  [11.9, [7, 16, 11]],
  [12.7, [11, 11, 11]],
  [99, [11, 11, 11]],
];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const loc = (y, a, b) => clamp((y - a) / (b - a));
const vis = (y, [a, b], f = 0.6) => sm((y - a) / f) * (1 - sm((y - (b - f)) / f));
function fundoEm(y) {
  for (let i = 0; i < FUNDOS.length - 1; i++) {
    const [y0, c0] = FUNDOS[i];
    const [y1, c1] = FUNDOS[i + 1];
    if (y <= y1) {
      const t = sm((y - y0) / (y1 - y0));
      return c0.map((v, k) => Math.round(v + (c1[k] - v) * t));
    }
  }
  return FUNDOS[FUNDOS.length - 1][1];
}

/* Cyber Delivery: o EP do Caio (1cort3) e do Sergio, só rimando, feito antes do 82 entrar. Sai este mês. */
const CYBER = ["Cyber Acelero", "Cyber Runer", "Cyber Namoro", "Cyber Cyborg", "Cyber Luzes"];

/* Rimas pra Viagem Vol. 2 (sai em 2027): faixas pelos arquivos da pasta do disco */
const VOL2 = [
  "Interferência", "Cash", "Confusões", "DissCrypto", "Futuro", "Gratialce", "Domingueira do Nada",
  "Chuva Maldita", "Capucheta 3D", "Mistérios", "1cort3verso", "Nada Legal", "Tapa no Vórtex",
];
const VOL2_FEAT = { Cash: "feat. headB", Futuro: "feat. Ian Lecter", Gratialce: "feat. AfroDroid", "1cort3verso": "feat. M16" };

const RUA = [1, 2, 3, 4, 5, 7, 9, 10, 11, 12];
const NOITE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `/rd/noite-${n}.webp`);
const FITA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((n, i) => [`/rd/noite-${n}.webp`, `/rd/show-${RUA[i]}.webp`]);
const SPOTIFY = "https://open.spotify.com/intl-pt/artist/1cI4z9p9FwsSPXJLqKoamq";
const YT_CANAL = "https://www.youtube.com/channel/UCzrPpA-5rx7kvV7NnGAkRkw?sub_confirmation=1";

/* fichas dos primeiros vídeos (descrições do YouTube) */
const FICHA = {
  "RvGwjcL7t6o": "primeiro single do supergrupo de entregadores de rimas. Beat, mix e master: domrafa · letra e voz: 1cort3 e Sergio Estranho · imagens: 82 · edição: Sergio Estranho · gravado no Rancho Mont Gomer",
  "tzlwnsVa0bE": "instrumental, mix e master: domrafa · letra e vozes: Sergio Estranho e 1cort3 · vídeo: Crônicas · Rancho Mont Gomer",
  "ShTQ-pZ3Yyo": "letra, voz e beat: 1cort3 e Sergio Estranho · mix e master: domrafa · arte: Juliana Profício · Rancho Mont Gomer",
  "8Tg92hxUBDo": "instrumental: 1cort3 · mix e master: domrafa · letra e vozes: Sergio Estranho e 1cort3 · vídeo: Crônicas",
  "vuHVgBhz2SI": "uma faixa e um corte: 82 + 1cort3, ainda antes do disco",
  "G-im-OYcTBM": "instrumental: Barbo the Brabo · mix e master: domrafa · letra e vozes: Sergio Estranho e 1cort3 · foto e edição: 82 aka JODO",
};

const PARADAS = [
  ["abertura", "Abertura", 0],
  ["proximas", "Cyber Delivery", 2.9],
  ["rimas", "Rimas pra Viagem", 5.4],
  ["dia", "O dia do show", 8.2],
  ["caminho", "A Caminho", 10.8],
  ["pedido", "Primeiros pedidos", 13.4],
  ["quatro", "Os quatro", 16.0],
];

const REDES = [
  { nome: "Spotify", url: SPOTIFY, cor: "#1db954", ic: "#0b0b0b", d: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.6 14.4a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.4-1.1a.75.75 0 1 1-.35-1.46c4.5-1 8.4-.6 11.5 1.3a.75.75 0 0 1 .25 1.01Zm1.3-3a.94.94 0 0 1-1.3.3c-3.2-2-8-2.5-11.8-1.4a.94.94 0 1 1-.55-1.8c4.3-1.3 9.6-.7 13.3 1.6a.94.94 0 0 1 .35 1.3Zm.1-3.1c-3.8-2.3-10.2-2.5-13.9-1.4a1.12 1.12 0 1 1-.65-2.15c4.2-1.3 11.3-1 15.7 1.6a1.12 1.12 0 0 1-1.15 1.95Z" },
  { nome: "Instagram", url: "https://www.instagram.com/rap.delivery/", cor: "#e4405f", grad: "linear-gradient(45deg, #feda75, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5)", ic: "#fff", d: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.2-3.2a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" },
  { nome: "X", url: "https://twitter.com/DeliveryRap", cor: "#f4f4f4", ic: "#000", d: "M17.7 3h3L14.2 10.4 22 21h-6.1l-4.8-6.3L5.6 21h-3l7-8L2.2 3h6.3l4.3 5.7ZM16.6 19.2h1.7L7.7 4.7H5.9Z" },
  { nome: "Facebook", url: "https://www.facebook.com/rapdeliveryofc", cor: "#1877f2", ic: "#fff", d: "M13.5 22v-8.2h2.8l.5-3.4h-3.3V8.3c0-1 .3-1.6 1.7-1.6H17V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.5H7.5v3.4h2.8V22h3.2Z" },
  { nome: "YouTube", url: "https://www.youtube.com/channel/UCzrPpA-5rx7kvV7NnGAkRkw", cor: "#ff0000", ic: "#fff", d: "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3Z" },
];

// imagem estática carrega primeiro; a animada entra depois, quando o navegador está ocioso
function ImgAnim({ estatica, animada, ...resto }) {
  const [src, setSrc] = useState(estatica);
  useEffect(() => {
    let vivo = true;
    const carregar = () => {
      const im = new window.Image();
      im.onload = () => vivo && setSrc(animada);
      im.src = animada;
    };
    const idle = window.requestIdleCallback ? window.requestIdleCallback(carregar, { timeout: 4000 }) : setTimeout(carregar, 1500);
    return () => {
      vivo = false;
      if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [animada]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} {...resto} />;
}

function rolarLado(e) {
  const box = e.currentTarget.closest("ol, div");
  if (box) box.scrollBy({ left: box.clientWidth * 0.8, behavior: "smooth" });
}

export default function ContinuoRD({ paradas, integrantes, total }) {
  useContrasteLogo();
  const E = useRef({});
  const reg = (k) => (el) => {
    if (el) E.current[k] = el;
  };
  const [tocando, setTocando] = useState(null);
  const [ativa, setAtiva] = useState(0);
  const [menu, setMenu] = useState(false);

  // arrastar com o mouse nos carrosséis (no toque já é nativo)
  useEffect(() => {
    const limpar = [];
    document.querySelectorAll("[data-arrasta]").forEach((el) => {
      let down = false, x0 = 0, s0 = 0, moveu = false;
      const dn = (e) => { if (e.pointerType !== "mouse") return; down = true; moveu = false; x0 = e.clientX; s0 = el.scrollLeft; el.classList.add("arrastando"); };
      const mv = (e) => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moveu = true; el.scrollLeft = s0 - dx; };
      const up = () => { down = false; el.classList.remove("arrastando"); };
      const clk = (e) => { if (moveu) { e.preventDefault(); e.stopPropagation(); moveu = false; } };
      el.addEventListener("pointerdown", dn);
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up);
      el.addEventListener("click", clk, true);
      limpar.push(() => { el.removeEventListener("pointerdown", dn); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); el.removeEventListener("click", clk, true); });
    });
    return () => limpar.forEach((f) => f());
  }, []);

  useEffect(() => {
    let raf;
    let ativaAtual = 0;
    const set = (k, estilo) => {
      const el = E.current[k];
      if (!el) return;
      for (const p in estilo) el.style[p] = estilo[p];
    };
    const loop = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const y = window.scrollY / H;
      if (W > 800) {
        const [r, g, b] = fundoEm(y);
        set("fundo", { background: `rgb(${r},${g},${b})` });
        for (const k in CENA) {
          const v = k === "abertura" ? 1 - sm((y - (CENA[k][1] - 0.6)) / 0.6) : vis(y, CENA[k]);
          const el = E.current[k];
          if (!el) continue;
          el.style.opacity = v.toFixed(3);
          el.style.visibility = v < 0.005 ? "hidden" : "visible";
          el.style.pointerEvents = v > 0.45 ? "auto" : "none";
          el.style.setProperty("--t", loc(y, CENA[k][0], CENA[k][1]).toFixed(3));
        }
        // o losango da abertura vira a marca da rota
        const m = sm(loc(y, 1.5, 2.5));
        const pl = E.current["placa"];
        if (pl) pl.style.setProperty("--m", m.toFixed(3));
        // fita de fotos de fundo: aparece forte na abertura, some no amarelo, volta no fim
        const rua = 0.55 * (1 - sm(loc(y, 1.2, 2.6))) + 0.1 * sm(loc(y, 2.6, 3.4)) * (1 - sm(loc(y, 9.4, 10.1))) + 0.38 * sm(loc(y, 14.6, 15.6));
        set("rua", { opacity: Math.max(0, rua - 0.25 * sm(loc(y, 9.6, 10.3)) * 0.0).toFixed(3) });
        set("rota_marca", { top: `${6 + (y / TOTAL) * 78}%` });
        let a = 0;
        PARADAS.forEach(([, , ini], i) => {
          if (y >= ini - 0.5) a = i;
        });
        if (a !== ativaAtual) {
          ativaAtual = a;
          setAtiva(a);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setTocando(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const tocar = (f) => setTocando({ yt: f.yt, titulo: f.titulo, quem: f.quem });
  const pedido = paradas.find((p) => p.id === "pedido");
  const caminho = paradas.find((p) => p.id === "a-caminho");
  const solto = paradas.find((p) => p.id === "single");
  const rimas = paradas.find((p) => p.id === "rimas-pra-viagem");
  const volta = paradas.find((p) => p.id === "volta");
  const rimasFaixas = rimas ? rimas.faixas.filter((f) => /^\d+ ·/.test(f.titulo)) : [];
  const noFronte = rimasFaixas.find((f) => f.yt === "5E6gafrDyik");
  const fullAlbum = rimas ? rimas.faixas.find((f) => /full album/i.test(f.titulo)) : null;
  const clipes = [noFronte, volta && volta.faixas[0]].filter(Boolean);
  const pedidos = pedido ? [...pedido.faixas, ...(solto ? solto.faixas : [])] : [];
  const irPara = (i) => window.scrollTo({ top: PARADAS[i][2] * window.innerHeight, behavior: "smooth" });
  const CAM = [
    "/rd/caminho-1.webp",
    "/rd/caminho-2.webp",
    "/rd/caminho-3.webp",
    "/rd/caminho-4.webp",
  ];

  return (
    <div className={styles.raiz}>
      <VoltarJodo />
      <div className={`${styles.centro} ${menu ? styles.centroAberto : ""}`} onClick={() => setMenu((v) => !v)}>
        <Link
          href="/"
          data-logo-zona
          className={styles.centroLink}
          aria-label="JODO, voltar ao mapa"
          onClick={(e) => {
            if (window.matchMedia("(hover: none)").matches && !menu) e.preventDefault();
          }}
        >
          <img className={styles.cMontanha} src="/jodo-montanha.png" alt="JODO" data-logo-contraste />
          <img className={styles.cCaixa} src="/rd-caixa.webp" alt="Rap Delivery" />
        </Link>
        <ul className={styles.quatroNomes}>
          {integrantes.map((i, k) => (
            <li key={i.nome} className={styles["nome" + k]} style={{ "--k": k }}>
              <Link href={i.href} aria-label={i.nome}>
                {i.nome === "Sergio Estranho" ? (
                  <img className={styles.nomeLogoSergio} src="/rd/logo-sergio.webp" alt="Sergio Estranho" />
                ) : i.nome === "82" ? (
                  <img className={styles.nomeLogo82} src="/rd/logo-82.webp" alt="82" />
                ) : (
                  i.nome
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* a rota: o losango anda pela página; cada parada é uma cena */}
      <nav className={styles.rota} aria-label="Paradas">
        <i className={styles.rotaLinha} />
        <img className={styles.rotaMarca} ref={reg("rota_marca")} src="/rd/logo.webp" alt="" />
        <ul>
          {PARADAS.map(([id, nome], i) => (
            <li key={id} className={ativa === i ? styles.rotaAtiva : ""}>
              <button onClick={() => irPara(i)} aria-label={nome}><b /><span>{nome}</span></button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.trilha} style={{ height: `${(TOTAL + 1) * 100}vh` }}>
        <div className={styles.palco}>
          <div className={styles.fundo} ref={reg("fundo")} />
          <div className={styles.rua} ref={reg("rua")} aria-hidden="true">
            {FITA.concat(FITA).map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>

          {/* ===== ABERTURA ===== */}
          <div className={`${styles.cena} ${styles.hero}`} ref={reg("abertura")}>
            <div className={styles.fitaHeroBox} aria-hidden="true">
              <div className={`${styles.fitaQ} ${styles.fitaHero}`}>
                {NOITE.concat(NOITE).map((src, i) => (
                  <img key={i} src={src} alt="" />
                ))}
              </div>
            </div>
            <img className={styles.placa} ref={reg("placa")} src="/rd/logo.webp" alt="Rap Delivery: placa amarela de trânsito com um entregador de scooter" />
            <div className={styles.heroTxt}>
              <p className={styles.kick}>super grupo de entregadores de rap</p>
              <h1>RAP<br />DELIVERY</h1>
              <p className={styles.sub}>1cort3 · domrafa · Sergio Estranho · 82</p>
              <p className={styles.dica}>cada entrega, uma parada ↓</p>
            </div>
          </div>

          {/* ===== CYBER DELIVERY (e o Vol. 2, em off, no botão) ===== */}
          <div className={`${styles.cena} ${styles.proximas}`} ref={reg("proximas")}>
            <video className={styles.cyberVideo} src="/rd/cyber-moto.mp4" autoPlay muted loop playsInline aria-hidden="true" />
            <div className={styles.cyberVeu} />
            <div className={styles.cyberCap}>
              <ImgAnim className={styles.capaCyber} estatica="/rd/cyber-capa.webp" animada="/rd/cyber-capa-anim.webp" alt="Capa do EP Cyber Delivery: uma moto voadora com a caixa amarela RD numa rua de São Paulo à noite" />
              <span className={styles.brilho} />
            </div>
            <div className={styles.cyberTxt}>
              <p className={styles.kick}>EP · lançamento este mês</p>
              <h2 className={styles.tCyber}><span className={styles.cy1}>CYBER</span><span className={styles.cy2}>DELIVERY</span></h2>
              <p className={styles.sub}>1cort3 e Sergio Estranho, só rimando. Gravado antes do 82 entrar pro Rap Delivery.</p>
              <p className={styles.sub}>“minha alma em QR Code, emoções não sinto mais.”</p>
              <ol className={styles.cyberLista}>
                {CYBER.map((t, i) => (
                  <li key={t}>
                    <i>{String(i + 1).padStart(2, "0")}</i>
                    <strong>{t}</strong>
                  </li>
                ))}
              </ol>
              <div className={styles.seguir}>
                <a href={SPOTIFY} target="_blank" rel="noopener noreferrer" className={styles.segSpotify}>seguir no Spotify ↗</a>
                <a href={YT_CANAL} target="_blank" rel="noopener noreferrer" className={styles.segYt}>se inscrever no YouTube ↗</a>
              </div>
              <p className={styles.seguirNota}>ainda sem pré-save: segue o perfil e espera a entrega chegar.</p>
            </div>
          </div>

          {/* ===== RIMAS PRA VIAGEM VOL. 1 ===== */}
          <div className={`${styles.cena} ${styles.rimas}`} ref={reg("rimas")}>
            <div className={styles.rimasCapaBox}>
              <img className={styles.rimasCapa} src="/rd/rimas-capa.webp" alt="Capa do Rimas pra Viagem: o Rafa de DJ na janela, o 82 no telhado, o Sergio no portão e o Caio de scooter com a bag vermelha, em frente a uma casa preta" />
            </div>
            <div className={styles.rimasInfo}>
              <p className={styles.kick}>LP · set/2022 · a primeira entrega completa · volume 1</p>
              <p className={styles.creditoCapa}>capa do Vol. 1 e do Vol. 2: <a href="https://www.instagram.com/kauevilete/" target="_blank" rel="noopener noreferrer">Kaue</a></p>
              <div className={styles.ouvir}>
                <a className={styles.albumBtn} href={SPOTIFY} target="_blank" rel="noopener noreferrer">ouvir no Spotify ↗</a>
                {fullAlbum && <button className={styles.ytBtn} onClick={() => tocar(fullAlbum)}>disco inteiro no YouTube ▶</button>}
              </div>
              <ol className={styles.rimasLista}>
                {fullAlbum && (
                  <li key="faixa-1">
                    <i className={styles.num}>1</i>
                    <span>faixa de abertura</span>
                    <small>no disco inteiro</small>
                    <button onClick={() => tocar(fullAlbum)}>ouvir ▶</button>
                  </li>
                )}
                {rimasFaixas.map((f) => (
                  <li key={f.yt}>
                    <i className={styles.num}>{(f.titulo.match(/^(\d+) ·/) || [])[1]}</i>
                    <span>{f.titulo.replace(/^\d+ · /, "")}</span>
                    <small>{f.quem.replace(/ · clipe$/, "")}</small>
                    {f.yt === "5E6gafrDyik" && <button onClick={() => tocar(f)}>clipe ▶</button>}
                    {/^5 ·/.test(f.titulo) && volta && volta.faixas[0] && (
                      <button onClick={() => tocar(volta.faixas[0])}>clipe ▶</button>
                    )}
                  </li>
                ))}
              </ol>
              <div className={styles.teaser}>
              <div className={styles.vol2Box}>
                <button className={styles.vol2Btn} aria-label="Rimas pra Viagem Vol. 2, 2027, ver as faixas">
                  <i>2027</i> Rimas pra Viagem Vol. 2
                </button>
                <div className={styles.nota} role="tooltip">
                  <p className={styles.notaTopo}>PRÓXIMA ENTREGA · 2027</p>
                  <h3>Rimas pra Viagem <span>Vol. 2</span></h3>
                  <ol>
                    {VOL2.map((t, i) => (
                      <li key={t}>
                        <i>{String(i + 1).padStart(2, "0")}</i>
                        <strong>{t}</strong>
                        <em />
                        <small>{VOL2_FEAT[t] || ""}</small>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              </div>
              <div className={styles.clipes}>
                {clipes.map((f) => (
                  <button key={f.yt} onClick={() => tocar(f)}>
                    <img src={thumb(f.yt)} alt="" />
                    <span><em>clipe</em><strong>{f.titulo.replace(/^\d+ · /, "")}</strong></span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== O DIA DO SHOW: stop-motion ===== */}
          <div className={`${styles.cena} ${styles.dia}`} ref={reg("dia")}>
            <p className={styles.kick}>03/09/2022 · o dia do show de lançamento do Rimas pra Viagem</p>
            <div className={styles.stops}>
              <figure>
                <img src="/rd/stop-ida.webp" alt="Stop motion com as fotos da gente se arrumando em casa para ir ao show" />
                <figcaption><b>17:36</b> a gente se arrumando pra ir</figcaption>
              </figure>
              <figure>
                <img src="/rd/stop-show.webp" alt="Stop motion com fotos e quadros dos vídeos do show de lançamento" />
                <figcaption><b>21:40</b> o show</figcaption>
              </figure>
            </div>
            <p className={styles.nota2}>câmera digital, data impressa. Fotos e vídeos do dia, em sequência.</p>
          </div>

          {/* ===== A CAMINHO ===== */}
          {caminho && (
            <div className={`${styles.cena} ${styles.caminho}`} ref={reg("caminho")}>
              <div className={styles.faixaRua} aria-hidden="true" />
              <div className={styles.caminhoCol}>
                <p className={styles.kickEscuro}>EP · jan/2022 · a nossa primeira EP junta</p>
                <h2 className={styles.tCaminho}>A CAMINHO</h2>
                <p className={styles.brisa}>“crime contra a gravidade.”<br />“a caneta é meu cajado.”<br />“tudo e nada ao mesmo tempo.”</p>
                <ol className={styles.tracksCam}>
                  {(caminho.tracklist || []).map((n, i) => (
                    <li key={n}><i>{i + 1}</i> {n}</li>
                  ))}
                </ol>
                <ul className={styles.credCam}>
                  {(caminho.creditos || []).map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <div className={styles.botoes}>
                  {caminho.faixas.map((f) => (
                    <button key={f.yt} onClick={() => tocar(f)}>EP inteiro ▶ <small>{fmt(f.views)}</small></button>
                  ))}
                </div>
              </div>
              <div className={styles.camFotos} data-arrasta="1">
                {CAM.map((src, i) => (
                  <figure key={src} style={{ "--i": i }}>
                    <ImgAnim estatica={src} animada={src.replace("caminho-", "caminho-gif-")} alt="Quadro do vídeo do EP A Caminho" />
                  </figure>
                ))}
              </div>
            </div>
          )}

          {/* ===== OS PRIMEIROS PEDIDOS ===== */}
          {pedido && (
            <div className={`${styles.cena} ${styles.pedido}`} ref={reg("pedido")}>
              <img className={styles.bag} src="/rd-caixa.webp" alt="" />
              <div className={styles.pedidoCol}>
                <p className={styles.kick}>2021 · antes de ter disco</p>
                <h2 className={styles.tPedido}>OS PRIMEIROS PEDIDOS</h2>
                <ol className={styles.comandas} data-arrasta="1">
                  {pedidos.map((f, i) => (
                    <li key={f.yt} style={{ "--r": `${((i * 53) % 7) - 3}deg`, "--i": i }}>
                      <button onClick={() => tocar(f)}>
                        <span className={styles.comNum}>PEDIDO {String(i + 1).padStart(2, "0")}</span>
                        <img src={thumb(f.yt)} alt="" loading="lazy" />
                        <strong>{f.titulo}</strong>
                        <small>{(f.data || "").replace("-", "/")}{f.views ? ` · ${fmt(f.views)} views` : ""}</small>
                        {FICHA[f.yt] && <em>{FICHA[f.yt]}</em>}
                      </button>
                    </li>
                  ))}
                  <li className={styles.setaRolar}><button type="button" className={styles.setaBtn} aria-label="Próximo pedido" onClick={rolarLado}>›</button></li>
                </ol>
              </div>
            </div>
          )}

          {/* ===== OS QUATRO ===== */}
          <div className={`${styles.cena} ${styles.quatro}`} ref={reg("quatro")}>
            <div className={`${styles.fitaQ} ${styles.fitaQ1}`} aria-hidden="true">
              {NOITE.concat(NOITE).map((src, i) => (
                <img key={i} src={src} alt="" />
              ))}
            </div>
            <div className={`${styles.fitaQ} ${styles.fitaQ2}`} aria-hidden="true">
              {NOITE.slice().reverse().concat(NOITE.slice().reverse()).map((src, i) => (
                <img key={i} src={src} alt="" />
              ))}
            </div>
            <p className={styles.kick}>os quatro entregadores</p>
            <img className={styles.grupo} src="/rd/grupo-pisca.webp" alt="Os quatro integrantes do Rap Delivery, em pé, na frente de uma parede branca, em duas fotos que alternam" />
            <p className={styles.creditoFotos}>
              fotos: <a href="https://instagram.com/jovita.jpeg" target="_blank" rel="noopener noreferrer">Gabriel Jovita</a>
            </p>
            <ul className={styles.integrantes}>
              {integrantes.map((i) => (
                <li key={i.nome}>
                  <Link href={i.href}>
                    <strong>{i.nome}</strong>
                    <small>{i.papel}</small>
                  </Link>
                </li>
              ))}
            </ul>
            <p className={styles.numeros}>
              <span className={styles.nw}><b>{total.videos}</b> vídeos</span> · <span className={styles.nw}><b>{fmt(total.views)}</b> views</span> · <span className={styles.nw}>desde <b>2021</b></span>
            </p>
          </div>
        </div>
      </div>

      <footer className={styles.rodape}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Voltar ao topo da página">
          <img src="/rd/logo.webp" alt="" />
          <span>voltar ao topo</span>
        </button>
        <nav className={styles.redes} aria-label="Redes sociais">
          {REDES.map((r) => (
            <a key={r.nome} href={r.url} target="_blank" rel="noopener noreferrer" aria-label={r.nome} title={r.nome} style={{ "--c": r.cor, "--g": r.grad || r.cor, "--ic": r.ic }}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={r.d} fill="currentColor" /></svg>
            </a>
          ))}
        </nav>
      </footer>

      {tocando && (
        <div className={styles.modal} onClick={() => setTocando(null)} role="dialog" aria-modal="true">
          <div className={styles.caixa} onClick={(e) => e.stopPropagation()}>
            <button className={styles.fechar} onClick={() => setTocando(null)}>fechar</button>
            <div className={styles.player}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${tocando.yt}?autoplay=1&rel=0`}
                title={tocando.titulo}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <p className={styles.legenda}><strong>{tocando.titulo}</strong> · {tocando.quem}</p>
          </div>
        </div>
      )}
    </div>
  );
}
