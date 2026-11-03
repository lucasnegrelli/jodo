"use client";

import { useEffect, useRef, useState } from "react";
import { Montserrat, Inter_Tight, DM_Mono, Nanum_Pen_Script } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import styles from "@/styles/davzera.module.css";
import Cenas from "./davzera/Cenas";

/*
  Davzera (Davi Nadier, Salvador; marca e selo Nauzea Inc.). Página-portfólio: substitui linktree, Behance e site próprio.
  Abertura: a capa do PROFUNDHI refeita, bolinhas nas posições e cores da capa (cada uma é uma faixa).
  Depois (davzera/Cenas.js): uma cena de tela cheia por lançamento, cada uma com a estética da própria capa, 3D em Three.js onde o objeto pede.
  Dados: Spotify, YouTube e Instagram dele.
*/
const disp = Montserrat({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--dz-disp", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--dz-sans", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--dz-mono", display: "swap" });
const pixo = Nanum_Pen_Script({ subsets: ["latin"], weight: "400", variable: "--dz-pixo", display: "swap" });

const SMART = "https://distribuasuamusica.lnk.to/PROFUNDHI";
const IG = "https://www.instagram.com/davinadier/";
const yt = (id) => `https://www.youtube.com/watch?v=${id}`;
const PROFUNDHI = "01zEvb04f58yQZdvQq4cDj";

const FAIXAS = [
  { n: 1, t: "FUNK", c: "l v k s", yt: "nb_qfiWGDYY" },
  { n: 2, t: "PROFUNDHI", c: "pedrvso, l v k s", yt: "tdmKcidaazs" },
  { n: 3, t: "CORREDOR DO RITMO", c: "l v k s", yt: "S-FpPskHSic" },
  { n: 4, t: "BRUTE FORCE", c: "l v k s", yt: "OrqgsiC2OF4" },
  { n: 5, t: "MAPEOPLE", c: "Dário Inerente", yt: "7Td_jycFJ2s" },
  { n: 6, t: "FUGEELA", c: "Sergio Estranho, pedrvso" },
  { n: 7, t: "DNA", c: "PG 400, Juce Rock", yt: "ArwOOOLCZBo" },
  { n: 8, t: "CIDADE DA LUZ", c: "Trice, pedrvso", yt: "iIDAROGAduc" },
  { n: 9, t: "AHMED INTERLÚDIO", c: "l v k s", yt: "CAd0tF4Va1g" },
  { n: 10, t: "VICE CITY", c: "pedrvso", yt: "RBTvDlSMlAs" },
  { n: 11, t: "KUIP CHACO", c: "apollo 808, Trxntin", yt: "hBurNAHcC7A" },
  { n: 12, t: "TINTIN", c: "apollo 808, MATHINVOKER", yt: "oSyvemOYiFU" },
  { n: 13, t: "TORKE", c: "apollo 808" },
  { n: 14, t: "SALCÍ", c: "pedrvso", yt: "u4DvrNU8kpo" },
  { n: 15, t: "SMOKYTOWN", c: "apollo 808, l v k s", yt: "G1EDAWARIU4" },
];

// cada bolinha da capa: posição na imagem de 640 px, cor do corpo e cor do brilho, medidas na própria capa
const CAPA = [
  [190, 232, [27, 80, 90], [61, 121, 129]], [242, 238, [23, 86, 112], [40, 122, 125]], [298, 222, [20, 75, 91], [50, 120, 137]], [357, 228, [12, 84, 118], [48, 134, 157]],
  [210, 280, [42, 116, 146], [54, 168, 187]], [270, 282, [70, 212, 205], [94, 221, 213]], [328, 272, [122, 236, 227], [146, 237, 229]], [378, 280, [36, 195, 173], [48, 169, 155]],
  [240, 320, [17, 74, 124], [81, 156, 169]], [300, 320, [30, 121, 180], [79, 179, 210]], [350, 322, [5, 46, 77], [55, 111, 132]], [400, 338, [7, 83, 91], [74, 135, 146]],
  [272, 360, [11, 68, 102], [50, 111, 133]], [348, 376, [110, 233, 221], [93, 230, 226]], [425, 386, [79, 217, 212], [48, 210, 202]],
  [305, 400, [25, 202, 191], [80, 204, 204]], [382, 410, [24, 197, 181], [61, 200, 181]], [335, 440, [97, 226, 214], [110, 231, 217]],
];
const R_CAPA = 25;

const SINGLES = [
  { id: "pacifico", t: "Pacífico", ano: 2026, c: "com apollo 808, James Bertish, Trxntin e a Orquestra Sinfônica de Sergipe", sp: "1T8OFdDeaRL44WeurJftnA", yt: "2YCI5fUsdOk", fs: "15.4vw" },
  { id: "dende", t: "Dendê", ano: 2025, c: "com Dário Inerente", sp: "0fubGaeHs2sQwe7YYaaR9n", fs: "19vw", traco: "#8a3f1d" },
  { id: "malicia", t: "Malícia", ano: 2025, c: "com Vuto", sp: "7tdrG742ZJQDmPBECaZTMD", fs: "17vw" },
];
const ROBO = {
  sp: "5p7f59AWeJSkxYwrPQX3b1",
  faixas: [
    { t: "Copenhagen", d: "2:32", yt: "LISWEMmSGQ0" }, { t: "Encouraçados de Potemkin", d: "3:17" },
    { t: "Sede da Somália", d: "3:14", yt: "4m_738sVUK0" }, { t: "Os Deuses", d: "2:36" },
  ],
};
const COZINHA = {
  sp: "6CD6Ea4dq91dqGutIFJgx5",
  faixas: [
    { t: "Maratona", c: "apollo 808, Bonbap", d: "3:02", yt: "JnXiGvy9FEk" }, { t: "Viet", c: "MSW", d: "3:14", yt: "-jc0FrjzfX4" },
    { t: "Ma Prince 2", c: "", d: "3:27", yt: "qFvRZa4zn_o" }, { t: "Escort Lagoa", c: "MNC Beatz, Bãovivão", d: "4:05", yt: "bbkx_9L39zg" },
    { t: "Orixá de Cabeça", c: "EricBeatz, Eloy Polemico", d: "2:38", yt: "ragOKFS4Iz4" }, { t: "Luzes de Fortal", c: "Big Alien", d: "2:46", yt: "aAncfPDTseM" },
    { t: "Batucada Interlúdio", c: "apollo 808, Bonbap", d: "1:19", yt: "KLLhyzYWiws" }, { t: "Cozinha Marginal", c: "pedrvso", d: "1:50", yt: "iLoST_d6SdI" },
  ],
};
const LOWCARB = {
  sp: "3aq6Wi34SXFO5VUNW3Z6UV",
  faixas: [
    { t: "Lealdade", c: "Victor Xamã, Trxntin", d: "2:12", yt: "-ke_DX-QIAA" }, { t: "Kankan", c: "", d: "3:37", yt: "xrfPy-dy26Y" },
    { t: "Blues e Jeans", c: "apollo 808", d: "3:04", yt: "p9LxE7oEhfI" }, { t: "Bagagem Kármica", c: "Eloy Polemico, Raul Ronde Beatz", d: "3:37", yt: "2J4lkbOH-rQ" },
    { t: "Low Carb", c: "apollo 808", d: "2:21", yt: "DXOeMgZy-Kw" }, { t: "Nat King", c: "l v k s, apollo 808", d: "2:10", yt: "8WU16q2CTlo" },
    { t: "Skin Care", c: "apollo 808", d: "2:41", yt: "UVzAwblYpwo" },
  ],
};
const ANTES = [
  { id: "vale", t: "Vale do Silício", ano: 2019, sp: "4jUVO6BSFwLmnAkki67gRc", yt: "2whNVYZYD9E", fs: "8.2vw" },
  { id: "vol0", t: "Nauzeainc, Vol. 0", ano: 2019, sp: "1jta1FEKymWhqRbVIXynar", c: "o primeiro, pela Nauzearecords", fs: "8.2vw" },
];
const CLIPES = [
  { t: "Ouro 24", id: "0OE_TGmMc-Q" },
  { t: "Cavalo Joker", id: "iVyYvRCHdRg" },
  { t: "thyssenkrupp", id: "PRo-ET6KVWc" },
  { t: "Tipo Dracula", id: "27IRwt0lclw" },
];
const PARCERIAS = ["apollo 808", "l v k s", "pedrvso", "Mandada", "Trice", "PG 400", "Juce Rock", "Dário Inerente", "Trxntin", "MATHINVOKER", "Rei Lacoste", "Vuto", "Eloy Polemico", "Bãovivão", "Big Alien", "Victor Xamã", "James Bertish"];

function embedDe(alvo) {
  if (alvo.yt) return { tipo: "yt", src: `https://www.youtube-nocookie.com/embed/${alvo.yt}?autoplay=1&rel=0`, fora: yt(alvo.yt) };
  if (alvo.sp) return { tipo: "sp", src: `https://open.spotify.com/embed/album/${alvo.sp}`, fora: `https://open.spotify.com/album/${alvo.sp}` };
  return null;
}
const faixaAlvo = (f, sp) => (f.yt ? { yt: f.yt } : { sp });

export default function DavzeraPagina() {
  const capaRef = useRef(null), textoRef = useRef(null), canvasRef = useRef(null), raizRef = useRef(null), hovRef = useRef(null);
  const [hov, setHov] = useState(null);
  const [player, setPlayer] = useState(null);
  const playerRef = useRef(null);
  playerRef.current = player;

  const abre = (alvo) => { const e = embedDe(alvo); if (e) setPlayer(e); };
  const fecha = () => setPlayer(null);
  const poeHov = (h) => { hovRef.current = h; setHov(h); };

  // a mesa: os objetos andam em velocidades um pouco diferentes quando se rola
  useEffect(() => {
    const itens = [...raizRef.current.querySelectorAll("[data-par]")];
    let raf = 0;
    const roda = () => {
      raf = 0;
      const vh = innerHeight;
      for (const el of itens) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        el.style.setProperty("--py", `${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.par)).toFixed(1)}px`);
      }
    };
    const pede = () => { if (!raf) raf = requestAnimationFrame(roda); };
    roda();
    addEventListener("scroll", pede, { passive: true }); addEventListener("resize", pede);
    const esc = (e) => { if (e.key === "Escape" && playerRef.current) fecha(); };
    addEventListener("keydown", esc);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", pede); removeEventListener("resize", pede); removeEventListener("keydown", esc); };
  }, []);

  // a capa do PROFUNDHI refeita: bolinhas na posição e na cor da capa; só um respiro e um empurrão leve do cursor
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const g = cv.getContext("2d");
    let W = 0, H = 0, k = 1, R = 20, dpr = 1, raf = 0, vivo = true, tempo = 0, esp = 0, ptr = { x: -999, y: -999, dentro: false };
    const aoRolar = () => { esp = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.8))); if (textoRef.current) textoRef.current.style.opacity = String(Math.max(0, 1 - esp * 1.7)); };
    const bolas = CAPA.map(([px, py, corpo, brilho], i) => ({ i, px, py, corpo, brilho, x: 0, y: 0, vx: 0, vy: 0, hx: 0, hy: 0, pronto: false, ang: 0, vel: 0.6 + Math.random() * 0.9 }));
    const arruma = () => {
      const r = cv.getBoundingClientRect(), cr = capaRef.current.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
      const lado = Math.min(cr.width, innerHeight * 0.8), cx = cr.left - r.left + cr.width / 2, cy = cr.top - r.top + cr.height / 2;
      k = lado / 640 * (innerWidth < 900 ? 1.72 : 1.5); R = R_CAPA * k; cv._cx = cx; cv._cy = cy;
      const ox = cx - 310 * k, oy = cy - 325 * k;
      for (const b of bolas) {
        b.hx = ox + b.px * k; b.hy = oy + b.py * k;
        b.ang = Math.atan2(b.hy - cy, b.hx - cx) + (Math.random() - 0.5) * 1.6;
        if (!b.pronto) { b.x = b.hx; b.y = b.hy - R * (1.5 + Math.random() * 1.5); b.pronto = true; }
      }
      cv._ox = ox; cv._oy = oy;
    };
    arruma();
    const rgb = (c, f = 1, add = 0) => `rgb(${c.map((v) => Math.max(0, Math.min(255, Math.round(v * f + add)))).join(",")})`;
    const passo = () => {
      if (!vivo) return;
      raf = requestAnimationFrame(passo); tempo += 0.012;
      if (esp >= 1) return;
      for (const b of bolas) {
        // respiro: o ponto de casa balança bem pouco
        const dist = Math.pow(esp, 1.5) * Math.max(W, H) * 1.15 * b.vel;
        const hx = b.hx + Math.sin(tempo + b.i * 1.7) * R * 0.035 + Math.cos(b.ang) * dist, hy = b.hy + Math.cos(tempo * 0.9 + b.i * 2.3) * R * 0.035 + Math.sin(b.ang) * dist + esp * esp * H * 0.45;
        const mola = 0.02 + esp * 0.09;
        b.vx += (hx - b.x) * mola; b.vy += (hy - b.y) * mola;
        if (ptr.dentro) { const dx = b.x - ptr.x, dy = b.y - ptr.y, dd = Math.hypot(dx, dy), al = R * 2.2; if (dd < al && dd > 0.1) { const f = (1 - dd / al) * 0.35; b.vx += (dx / dd) * f; b.vy += (dy / dd) * f; } }
        b.vx *= 0.86; b.vy *= 0.86; b.x += b.vx; b.y += b.vy;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const alvo = hovRef.current;
      for (const b of bolas) { g.fillStyle = "rgba(40, 200, 215, 0.27)"; g.beginPath(); g.ellipse(b.x + R * 0.42, b.y + R * 0.62, R * 1.0, R * 0.62, 0.35, 0, 7); g.fill(); }
      for (const b of bolas) {
        const sel = alvo === b.i, rr = R * (sel ? 1.06 : 1);
        const gr = g.createRadialGradient(b.x - rr * 0.35, b.y - rr * 0.4, rr * 0.05, b.x, b.y, rr);
        gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.14, rgb(b.brilho, 1, 40)); gr.addColorStop(0.5, rgb(b.corpo));
        gr.addColorStop(0.88, rgb(b.corpo, 0.7)); gr.addColorStop(1, rgb(b.corpo, 0.5));
        g.fillStyle = gr; g.beginPath(); g.arc(b.x, b.y, rr, 0, 7); g.fill();
        g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 1; g.beginPath(); g.arc(b.x, b.y, rr - 1.5, Math.PI * 0.9, Math.PI * 1.45); g.stroke();
      }
      g.globalAlpha = Math.max(0, 1 - esp * 2.2);
      g.fillStyle = "#10e0ee"; g.font = `700 ${Math.max(9, 12.5 * k)}px Inter Tight, sans-serif`; g.textAlign = "left"; g.textBaseline = "alphabetic";
      g.fillText("PROFUNDHI", cv._ox + 424 * k, cv._oy + 458 * k); g.fillText("DAVZERA", cv._ox + 424 * k, cv._oy + 474 * k); g.globalAlpha = 1;
    };
    passo();
    const acha = (x, y) => { let m = null, md = 1e9; for (const b of bolas) { const d = Math.hypot(b.x - x, b.y - y); if (d < R * 1.15 && d < md) { md = d; m = b.i; } } return m; };
    const xy = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const move = (e) => { const [x, y] = xy(e); ptr = { x, y, dentro: true }; const h = acha(x, y); if (h !== hovRef.current) poeHov(h); cv.style.cursor = h != null ? "pointer" : "default"; };
    const sai = () => { ptr.dentro = false; poeHov(null); };
    const clica = (e) => { const [x, y] = xy(e); const h = acha(x, y); if (h != null) abre(h < 15 ? faixaAlvo(FAIXAS[h], PROFUNDHI) : { sp: PROFUNDHI }); };
    cv.addEventListener("pointermove", move); cv.addEventListener("pointerleave", sai); cv.addEventListener("click", clica);
    addEventListener("resize", arruma); addEventListener("scroll", aoRolar, { passive: true }); aoRolar();
    return () => { removeEventListener("scroll", aoRolar); vivo = false; cancelAnimationFrame(raf); cv.removeEventListener("pointermove", move); cv.removeEventListener("pointerleave", sai); cv.removeEventListener("click", clica); removeEventListener("resize", arruma); };
  }, []);

  const f = hov != null && hov < 15 ? FAIXAS[hov] : null;
  const lista = (faixas, sp) => faixas.map((x, i) => (
    <li key={x.t}>
      <button onClick={() => abre(faixaAlvo(x, sp))}>
        <i>{String(i + 1).padStart(2, "0")}</i><b>{x.t}</b><span>{x.c}</span><u>{x.yt ? "vídeo" : "ouvir"}</u><em>{x.d}</em>
      </button>
    </li>
  ));

  return (
    <main ref={raizRef} className={`${styles.raiz} ${disp.variable} ${sans.variable} ${mono.variable} ${pixo.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Davzera" cor="#0b2a55" plano fonte="var(--dz-disp), serif" escala={1.25} />

      {/* 0 · a capa do PROFUNDHI, refeita */}
      <section className={styles.tela} aria-label="PROFUNDHI">
        <canvas ref={canvasRef} className={styles.cvFull} aria-label="Capa do PROFUNDHI: 18 bolinhas de gude, 15 delas são as faixas" />
        <div className={`${styles.abre}`}>
          <div ref={textoRef} className={styles.abreTxt}>
            <h1>Davzera</h1>
            <p className={styles.sub}>Rapper e beatmaker · Salvador · Nauzea Inc.</p>
            <p className={styles.rot}>PROFUNDHI · 22 nov 2024 · capa de Mandada</p>
            <ol className={styles.faixas} onPointerLeave={() => poeHov(null)}>
              {FAIXAS.map((x, i) => (
                <li key={x.n} className={hov === i ? styles.ativa : ""}>
                  <button onPointerEnter={() => poeHov(i)} onClick={() => abre(faixaAlvo(x, PROFUNDHI))}><i>{String(x.n).padStart(2, "0")}</i><b>{x.t}</b></button>
                </li>
              ))}
            </ol>
            <p className={styles.credito}>{f ? <>{f.t}{f.c ? <> · {f.c}</> : null}</> : null}</p>
            <p className={styles.acoes}><button onClick={() => abre({ sp: PROFUNDHI })}>Ouvir o álbum</button><a href={SMART} target="_blank" rel="noopener noreferrer">Todas as plataformas ↗</a></p>
          </div>
          <div ref={capaRef} className={styles.capa} />
        </div>
      </section>

      {/* depois da capa: uma cena de tela cheia por lançamento, cada uma com a estética da própria capa */}
      <Cenas abre={abre} parado={!!player} d={{ SINGLES, ROBO, COZINHA, LOWCARB, ANTES, CLIPES, PARCERIAS, SMART, IG, VIS: FAIXAS.filter((x) => x.yt).map((x) => ({ id: x.yt, t: x.t, n: x.n })) }} />

      {player && (
        <div className={styles.player} onClick={fecha}>
          <div className={player.tipo === "sp" ? styles.sp : styles.yt} onClick={(e) => e.stopPropagation()}>
            <iframe src={player.src} title="Player" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
          </div>
          <p onClick={(e) => e.stopPropagation()}><a href={player.fora} target="_blank" rel="noopener noreferrer">abrir no {player.tipo === "sp" ? "Spotify" : "YouTube"}</a><button onClick={fecha}>fechar</button></p>
        </div>
      )}
    </main>
  );
}
