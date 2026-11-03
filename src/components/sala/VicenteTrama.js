"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef } from "react";
import styles from "@/styles/vicenteTrama.module.css";
import { PERFIS, DISCO } from "@/data/vicenteBlow";

/*
 * VBLXW · trama.
 * A página é um balaio. Cada célula é o cruzamento de duas talas de arumã (sarja: uma por cima, uma por baixo).
 * Os padrões são baniwa, com nome e tradução do livro "Arte Baniwa: cestaria de arumã" (FOIRN/ISA, 2000).
 * O desenho de cada um na grade, e a escolha de qual padrão vai em qual trabalho, são leituras nossas.
 *
 * O trabalho dele é a figura, o tecido é o fundo:
 *  - cada trabalho grande tem um capítulo; a capa aparece inteira, sem distorção, presa num aro de cesto alinhado à grade;
 *  - o tecido em volta pega a cor média de cada capa;
 *  - os títulos são letras feitas das mesmas células;
 *  - onde há texto corrido, as talas são cortadas e abrem uma janela.
 */

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const md = (a, n) => ((a % n) + n) % n;

const PADROES = [
  { nome: "waláiapo", trad: "balaio, ele vê" },
  { nome: "itsidawhi", trad: "casca de jabuti" },
  { nome: "dzawiiphoakaromi", trad: "pegada de onça" },
  { nome: "kowhepokettamárhi", trad: "caminho de saúva" },
  { nome: "pirarucu iwhi", trad: "escama de pirarucu" },
  { nome: "makowethi", trad: "olho de ave noturna" },
  { nome: "tsiipaittipi", trad: "rabo de pacu" },
];

// 0 base · 1 claro · 2 destaque. O arumã baniwa é natural, preto de cinza e vermelho de urucum;
// aqui a paleta de cada trabalho vem da própria capa (leitura nossa).
const PAL0 = ["#3a3326", "#dccfae", "#d0391b"];

function padrao(id, x, y) {
  if (id === 0) {
    const px = md(x, 9) - 4, py = md(y, 9) - 4;
    const d = Math.max(Math.abs(px), Math.abs(py));
    return d === 0 ? 2 : d % 2 === 1 ? 1 : 0;
  }
  if (id === 1) {
    const sx = x + (Math.floor(y / 12) % 2 ? 6 : 0);
    const px = md(sx, 12) - 6, py = md(y, 12) - 6;
    const d = Math.abs(px) + Math.abs(py);
    if (d === 0) return 2;
    return d % 3 === 1 || d === 6 ? 1 : 0;
  }
  if (id === 2) {
    const ty = Math.floor(y / 9);
    const u = md(x + (ty % 2 ? 4 : 0), 8), v = md(y, 9);
    const dedo = (u === 1 && (v === 2 || v === 3)) || ((u === 3 || u === 4) && (v === 1 || v === 2)) || (u === 6 && (v === 2 || v === 3));
    const w = v === 4 ? [2, 5] : v === 5 || v === 6 ? [1, 6] : v === 7 ? [2, 5] : null;
    const almof = w && u >= w[0] && u <= w[1];
    if (almof && v >= 5 && v <= 6 && (u === 3 || u === 4)) return 2;
    return dedo || almof ? 1 : 0;
  }
  if (id === 3) {
    const zig = Math.abs(md(y, 10) - 5);
    const s = x + zig;
    const m = md(s, 7);
    if (m < 2) return 1;
    return m === 4 && md(Math.floor(y / 10) + Math.floor(s / 7), 3) === 0 ? 2 : 0;
  }
  if (id === 4) {
    const row = Math.floor(y / 6);
    const u = md(x + (row % 2 ? 4 : 0), 8), v = md(y, 6);
    const arco = (v === 0 && u >= 2 && u <= 5) || (v === 1 && (u === 1 || u === 6)) || (v === 2 && (u === 0 || u === 7));
    if (v >= 3 && v <= 4 && (u === 3 || u === 4)) return 2;
    return arco ? 1 : 0;
  }
  if (id === 5) {
    const u = md(x, 11), v = md(y, 7);
    const dx = (u - 5) / 5, dy = (v - 3) / 3;
    const r = dx * dx + dy * dy;
    if (r < 0.2) return 2;
    return r >= 0.5 && r <= 1.02 ? 1 : 0;
  }
  const m = md(Math.abs(md(x, 10) - 5) + y, 6);
  if (m < 2) return 1;
  return m === 3 && md(x + y * 2, 11) === 0 ? 2 : 0;
}

const achaDisco = (capa) => DISCO.find((d) => d.capa === capa);
const SP = (id) => `https://open.spotify.com/intl-pt/album/${id}`;
const YT = (id) => `https://www.youtube.com/watch?v=${id}`;

// um capítulo por trabalho grande. Cada um tem os dois links (Spotify e YouTube); onde há clipe, há prévia em loop.
const OBRAS = [
  {
    id: "ampf", linhas: ["AMAZÔNIA", "PEGA FOGO"], rot: "o primeiro single", meta: "29.02.2020",
    nota: "Tudo começou queimando. O clipe é da JODO.",
    capa: "amazonia-pega-fogo", sp: "1sEtlDt7CrrIg2TlhsFT77", yt: "HAtrs4fNb00", clipe: true, video: "amazonia-pega-fogo",
    pat: 3, L: 1.3,
    porque: "A trilha que as formigas abrem na mata. Leitura nossa: o corte que aparece antes do fogo.",
  },
  {
    id: "falha", par: true, linhas: ["NO CANAL", "FALHA"], rot: "dois singles · 2021", meta: "produção de LF e VL",
    nota: "Capital Crime tem clipe oficial no canal Falha. Free$tyle Quarentena levou o 1º lugar no festival de Hip-Hop Dimanaus, no meio do ano.",
    itens: [
      { capa: "capital-crime", sp: "6IID0sdtKUIIOiKuGMm09X", yt: "t3N7I1FZLZA", clipe: true, video: "capital-crime" },
      { capa: "freestyle-quarentena", sp: "5kAKUBe6Q1cXFmTVfuUH9k", yt: "EiZVJf37tUc", clipe: false },
    ],
    pat: 2, L: 1.5,
    porque: "Rastro que se repete. Leitura nossa para os singles de rua: o caminho que ele deixa onde passa.",
  },
  {
    id: "vida", linhas: ["A VIDA É", "UM RIO"], rot: "single · com Sergio Estranho", meta: "06.12.2021",
    nota: "Liga Manaus a São Paulo: a faixa tem o Sergio, do Rap Delivery.",
    capa: "a-vida-e-um-rio", sp: "5c4n5qCiLFMLb2KsxBqTfk", yt: "mWALEYoxlpc", clipe: true, video: "a-vida-e-um-rio",
    pat: 4, L: 1.3,
    porque: "Escamas do peixe grande do rio. Leitura nossa para a faixa que fala do rio e liga duas cidades.",
  },
  {
    id: "fluxxxo", linhas: ["EL", "FLUXXXO"], rot: "single · vídeo oficial", meta: "12.04.2022",
    nota: "Traz “Manaus City”, com segunda parte e vídeo oficial.",
    capa: "el-fluxxxo", sp: "5RYHITtIZeCp2HNab7zvKl", yt: "1duWPyd9wrM", clipe: true, video: "el-fluxxxo",
    pat: 1, L: 1.3,
    porque: "O casco do jabuti: escamas que se encaixam. Leitura nossa para Manaus City, a cidade que carrega o rio nas costas.",
  },
  {
    id: "reflexo", linhas: ["REFLEXO"], rot: "ep · com LF", meta: "29.05.2023",
    nota: "",
    capa: "reflexo", sp: "3yJSVEIVaDt8JAM3KqT0sT", yt: "qVJTfgF1rxc", clipe: false,
    pat: 0, L: 1.3, grande: true,
    porque: "Balaio, ele vê: ver e ser visto. Leitura nossa para um EP chamado Reflexo.",
  },
  {
    id: "rema", linhas: ["R.E.M.A"], rot: "single · com Naycol Davan", meta: "18.08.2023",
    nota: "Produção do Insyt. Clipe oficial no canal dos Bruxos do Norte.",
    capa: "rema", sp: "5ACrfGRw8wDLHzJ4qv8kBd", yt: "FIIUH57aYSc", clipe: true, video: "rema",
    pat: 5, L: 1.3,
    porque: "O olho aberto no escuro. Leitura nossa para um single chamado R.E.M.A: o sono em que o olho não fecha.",
  },
  {
    id: "ruido", linhas: ["RUÍDO DAS", "ÁGUAS"], rot: "álbum · com PRISM∆ e LF", meta: "28.02.2025",
    nota: "Sete faixas. Produção de LF. Capa de KdeirA. O álbum inteiro tem vídeo no canal dos Bruxos do Norte.",
    capa: "ruido", sp: "3xqESrPBdKu22WExN2bnl9", yt: "AyMgXCTz8wQ", clipe: true, video: "ruido-das-aguas",
    pat: 6, L: 1.7,
    porque: "A cauda do peixe que corta a água. Leitura nossa para o álbum que ele fez das águas.",
  },
].map((o, k) => ({ ...o, cap: k + 1 }));

// as fotos dele que passam na capa
const FOTOS = ["hero", "chapeu", "branco", "azul", "quente", "mascara", "vermelho"];
// o resto da discografia: só o áudio, mas com os dois links
const OUTROS = [
  { capa: "slip-like-time", sp: "3W7KQwKI5tanTeOaIDELfp", yt: "5ky2s7kEeKQ" },
  { capa: "zabutre", sp: "1WyLqzX3egsIkJ4eKmObYx", yt: "kXlUzS6Y2_Q" },
  { capa: "tomando-um-cha", sp: "5uaFrtLN1wCkpOzLi7qPf0", yt: "SihwCgo4viU" },
  { capa: "rua-nova", sp: "7ac5eleR0qSTSMdDMQZLRe", yt: "3xvcsiddSMk" },
  { capa: "mundo-estranho", spUrl: "https://open.spotify.com/search/Pode%20P%C3%A1%2C%20Ora%20Pois", yt: "6RmWvU75a8E" },
];

const CAPITULOS = [
  { id: "capa", pat: 0, L: 1.9, porque: "O primeiro padrão que toda criança baniwa aprende: quadrados dentro de quadrados, no fundo de todo urutu, o cesto grande. Abre a página: aqui o balaio olha de volta." },
  ...OBRAS.map((o) => ({ id: o.id, pat: o.pat, L: o.L, porque: o.porque })),
  { id: "outros", pat: 4, L: 1.4, porque: "Escamas encaixadas: cada faixa solta é uma peça do mesmo peixe grande. Leitura nossa." },
  { id: "ouvir", pat: 0, L: 1.0, porque: "De volta ao primeiro padrão: o balaio fecha como abriu." },
];
const CAP_OUTROS = CAPITULOS.length - 2;
const CAP_OUVIR = CAPITULOS.length - 1;

const Rv = ({ k = 0, as: T = "div", className = "", children, ...r }) => (
  <T className={`${styles.rv} ${className}`} style={{ "--k": k }} {...r}>
    {children}
  </T>
);

// faixa fina no rodapé: o padrão que está tecido na tela
const Legenda = ({ cap }) => {
  const c = CAPITULOS[cap];
  const p = PADROES[c.pat];
  return (
    <Rv k={6} className={styles.legenda}>
      <span>padrão baniwa</span>
      <b>{p.nome}</b>
      <i>“{p.trad}”</i>
      <em>{c.porque}</em>
    </Rv>
  );
};

// título tecido: o elemento só marca o lugar; as letras são desenhadas nas células pelo canvas
const Tece = ({ cap, txt, className = "" }) => (
  <div className={`${styles.tece} ${className}`} data-tece={cap} data-txt={txt} role="heading" aria-level={2} aria-label={txt} />
);

export default function VicenteTrama() {
  const raiz = useRef(null);
  const cv = useRef(null);
  const trilha = useRef(null);
  const tag = useRef(null);
  const anel = useRef(null);
  const caps = useRef([]);
  const geo = useRef({ B: [], total: 0 });

  useEffect(() => {
    const antes = [document.documentElement.style.cssText, document.body.style.cssText];
    document.documentElement.style.overflow = "visible";
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflow = "visible";
    document.body.style.overflowX = "clip";

    const canvas = cv.current;
    const ctx = canvas.getContext("2d");
    let vw, vh, S, cols, rows, H;
    let own = null, halo = null;

    const mede = () => {
      const B = [0];
      CAPITULOS.forEach((c) => B.push(B[B.length - 1] + c.L * vh));
      geo.current = { B, total: B[B.length - 1] };
      if (trilha.current) trilha.current.style.height = `${B[B.length - 1] + vh}px`;
    };

    // as medidas das obras, em células, para tudo cair exatamente na grade do tecido
    const medidas = () => {
      const r = raiz.current;
      if (!r) return;
      const set = (k, v) => r.style.setProperty(k, String(v));
      const mob = cols < rows * 0.8;
      set("--S", `${S}px`);
      set("--cols", cols);
      set("--rows", rows);
      let jw, jh, jx, jy;
      if (!mob) {
        jh = Math.round(rows * 0.62);
        jw = Math.round(jh * 0.8);
        jx = cols - jw - Math.round(cols * 0.07);
        jy = Math.round((rows - jh) / 2 - rows * 0.1);
      } else {
        jw = Math.round(cols * 0.5);
        jh = Math.round(jw * 1.25);
        jx = Math.round((cols - jw) / 2);
        jy = Math.round(rows * 0.05);
      }
      r.style.setProperty("--cty", String(jy + jh + 3));
      set("--jw", jw); set("--jh", jh); set("--jx", jx); set("--jy", jy);
      const cap = (f, fm) => {
        const cs = mob ? Math.round(cols * fm) : Math.round(rows * f);
        const cx = mob ? Math.round((cols - cs) / 2) : cols - cs - Math.round(cols * 0.09);
        const cy = mob ? Math.round(rows * 0.07) : Math.round((rows - cs) / 2 - rows * 0.04);
        return [cs, cx, cy];
      };
      const [cs, cx, cy] = cap(0.6, 0.62);
      set("--cs", cs); set("--cx", cx); set("--cy", cy);
      const [cg, gx, gy] = cap(0.7, 0.7);
      set("--cg", cg); set("--gx", gx); set("--gy", gy);
      // capa + vídeo: no desktop o vídeo cobre o canto de baixo da capa (camadas); no celular, um embaixo do outro
      const cv = mob ? Math.round(cols * 0.5) : Math.round(rows * 0.5);
      const cxv = mob ? Math.round((cols - cv) / 2) : Math.round(cols * 0.58);
      const cyv = mob ? Math.round(rows * 0.05) : Math.round(rows * 0.12);
      const vwid = mob ? cv : Math.round(cv * 0.85);
      const vhei = Math.round((vwid * 9) / 16);
      const vxv = mob ? cxv : cxv - Math.round(cv * 0.3);
      const vyv = mob ? cyv + cv + 2 : cyv + cv - Math.round(vhei * 0.5);
      set("--cv", cv); set("--cxv", cxv); set("--cyv", cyv);
      set("--vwid", vwid); set("--vhei", vhei); set("--vxv", vxv); set("--vyv", vyv);
      // par de capas
      const c2 = mob ? Math.round(cols * 0.42) : Math.round(rows * 0.31);
      set("--hv2", Math.round((c2 * 9) / 16));
      const p2x = mob ? Math.round((cols - (c2 * 2 + 2)) / 2) : cols - (c2 * 2 + 3) - Math.round(cols * 0.07);
      const p2y = mob ? Math.round(rows * 0.07) : Math.round((rows - c2) / 2 - rows * 0.06);
      set("--c2", c2); set("--p2x", p2x); set("--p2y", p2y);
      // grade de capas menores
      const c3 = mob ? Math.round(cols * 0.27) : Math.round(rows * 0.27);
      const g3x = mob ? Math.round(cols * 0.06) : cols - (c3 * 3 + 6) - Math.round(cols * 0.06);
      set("--c3", c3); set("--g3x", g3x);
    };

    // as letras dos títulos, em células
    const tece = () => {
      own = new Uint16Array(cols * rows);
      halo = new Uint16Array(cols * rows);
      const Q = 4;
      const big = document.createElement("canvas");
      big.width = cols * Q;
      big.height = rows * Q;
      const bx = big.getContext("2d");
      const pq = document.createElement("canvas");
      pq.width = cols;
      pq.height = rows;
      const px = pq.getContext("2d", { willReadFrequently: true });
      px.imageSmoothingEnabled = true;
      px.imageSmoothingQuality = "high";
      document.querySelectorAll("[data-tece]").forEach((el) => {
        const cap = +el.dataset.tece;
        const txt = el.dataset.txt;
        const r = el.getBoundingClientRect();
        const x0 = r.left / S, y0 = r.top / S, w = r.width / S, h = r.height / S;
        if (w < 2 || h < 2) return;
        bx.clearRect(0, 0, big.width, big.height);
        bx.fillStyle = "#fff";
        const fs = (h * Q) / 0.72;
        bx.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`;
        bx.textBaseline = "alphabetic";
        const mw = bx.measureText(txt).width;
        const sx = mw > w * Q ? (w * Q) / mw : 1;
        bx.save();
        bx.translate(x0 * Q, (y0 + h) * Q);
        bx.scale(sx, 1);
        bx.fillText(txt, 0, 0);
        bx.restore();
        px.clearRect(0, 0, cols, rows);
        px.drawImage(big, 0, 0, cols, rows);
        const dt = px.getImageData(0, 0, cols, rows).data;
        for (let j = 0; j < rows; j++)
          for (let i = 0; i < cols; i++) {
            if (dt[(j * cols + i) * 4 + 3] > 110) {
              own[j * cols + i] |= 1 << cap;
              for (let dj = -2; dj <= 2; dj++)
                for (let di = -2; di <= 2; di++) {
                  const ii = i + di, jj = j + dj;
                  if (ii >= 0 && jj >= 0 && ii < cols && jj < rows) halo[jj * cols + ii] |= 1 << cap;
                }
            }
          }
      });
    };

    const monta = () => {
      vw = innerWidth;
      vh = innerHeight;
      const d = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(vw * d);
      canvas.height = Math.floor(vh * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      S = Math.max(9, Math.min(14, Math.round(Math.min(vh, vw * 1.4) / 58)));
      cols = Math.ceil(vw / S) + 1;
      rows = Math.ceil(vh / S) + 1;
      H = new Float32Array(cols * rows);
      for (let k = 0; k < H.length; k++) H[k] = Math.abs(Math.sin(k * 127.1) * 43758.5453) % 1;
      medidas();
      mede();
      requestAnimationFrame(tece);
    };
    monta();
    if (document.fonts && document.fonts.load) {
      document.fonts.load("900 40px Archivo").then(() => tece()).catch(() => {});
      document.fonts.ready.then(() => tece()).catch(() => {});
    }

    const trail = Array.from({ length: 10 }, () => [-999, -999]);
    let ultTr = 0, tocou = false, px = 0, py = 0, csx = 0, csy = 0, nx = 0, ny = 0, sobreLink = false;
    const onMove = (e) => {
      tocou = true;
      px = e.clientX;
      py = e.clientY;
      sobreLink = !!(e.target && e.target.closest && e.target.closest("a,button"));
      const now = performance.now();
      if (now - ultTr > 45) {
        ultTr = now;
        trail.pop();
        trail.unshift([px, py]);
      } else trail[0] = [px, py];
    };
    addEventListener("pointermove", onMove);
    addEventListener("resize", monta);

    // cor média de uma imagem (para a trama em volta pegar a cor da capa)
    const corMed = document.createElement("canvas");
    corMed.width = corMed.height = 1;
    const cmx = corMed.getContext("2d", { willReadFrequently: true });
    const mediaDe = (img) => {
      try {
        cmx.drawImage(img, 0, 0, 1, 1);
        const d = cmx.getImageData(0, 0, 1, 1).data;
        const m = Math.max(d[0], d[1], d[2], 1);
        const k = Math.min(1.8, 190 / m);
        return [Math.min(255, d[0] * k) | 0, Math.min(255, d[1] * k) | 0, Math.min(255, d[2] * k) | 0];
      } catch (e) {
        return null;
      }
    };

    // paleta de cada trabalho, tirada da capa (ou da foto) do capítulo
    const pals = {};
    const paleta = (img) => {
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 12;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0, 12, 12);
        const d = x.getImageData(0, 0, 12, 12).data;
        const px2 = [];
        for (let k = 0; k < d.length; k += 4) px2.push([d[k], d[k + 1], d[k + 2]]);
        const lu = (p) => 0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2];
        px2.sort((a, b) => lu(a) - lu(b));
        const med = (arr) => arr.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map((v) => v / arr.length);
        const q = Math.floor(px2.length / 4);
        const esc = med(px2.slice(0, q)), cla = med(px2.slice(-q));
        let ac = px2[0], sa = -1;
        px2.forEach((p) => {
          const mx = Math.max(...p), mn = Math.min(...p);
          const s2 = mx > 70 ? (mx - mn) / mx : 0;
          if (s2 > sa) { sa = s2; ac = p; }
        });
        const fit = (p, alvo) => {
          const m = Math.max(p[0], p[1], p[2], 1);
          const k = alvo / m;
          return `rgb(${Math.min(255, p[0] * k) | 0},${Math.min(255, p[1] * k) | 0},${Math.min(255, p[2] * k) | 0})`;
        };
        return [fit(esc, 62), fit(cla, 225), sa > 0.25 ? fit(ac, 235) : PAL0[2]];
      } catch (e) {
        return null;
      }
    };
    const getPal = (cap) => {
      if (pals[cap]) return pals[cap];
      const im = document.querySelector(`[data-abre="${cap}"][data-tipo="foto"] img`);
      if (im && im.complete && im.naturalWidth) {
        pals[cap] = paleta(im) || PAL0;
        return pals[cap];
      }
      return PAL0;
    };

    // uma célula: o cruzamento de duas talas. len = quanto da tala já passou (0..1)
    const celula = (c, i, j, len, br, warp, pal, ox = 0, oy = 0) => {
      if (len <= 0 || br <= 0.01) return;
      const x = i * S + ox, y = j * S + oy, g = 1.5;
      ctx.globalAlpha = br;
      ctx.fillStyle = pal[c];
      if (warp) {
        const h = (S - g) * len;
        ctx.fillRect(x + g, y, S - g * 2, h);
        ctx.fillStyle = "rgba(255,255,255,.1)";
        ctx.fillRect(x + S * 0.4, y, S * 0.2, h);
        ctx.fillStyle = "rgba(0,0,0,.4)";
        ctx.fillRect(x + g, y, S - g * 2, 2);
        ctx.fillRect(x + g, y + h - 2, S - g * 2, 2);
      } else {
        const w = (S - g) * len;
        ctx.fillRect(x, y + g, w, S - g * 2);
        ctx.fillStyle = "rgba(255,255,255,.1)";
        ctx.fillRect(x, y + S * 0.4, w, S * 0.2);
        ctx.fillStyle = "rgba(0,0,0,.4)";
        ctx.fillRect(x, y + g, 2, S - g * 2);
        ctx.fillRect(x + w - 2, y + g, 2, S - g * 2);
      }
    };

    const ok = (m) => m && (m.tagName === "VIDEO" ? m.readyState >= 2 && m.videoWidth > 0 : m.complete && m.naturalWidth > 0);

    // a imagem inteira, limpa. Fotos têm paralaxe leve; capas ficam exatamente como são
    const desenha = (src, w, hv, clip) => {
      const iw = src.naturalWidth || src.videoWidth, ih = src.naturalHeight || src.videoHeight;
      const e = 1 + 0.02 * hv;
      const dw = w.rw * e, dh = w.rh * e, dx = w.rl - (dw - w.rw) / 2, dy = w.rt - (dh - w.rh) / 2;
      let sx0 = 0, sy0 = 0, sw = iw, sh = ih;
      if (!w.fixa) {
        const ra = w.rw / w.rh;
        let cw, ch;
        if (iw / ih > ra) { ch = ih; cw = ih * ra; } else { cw = iw; ch = iw / ra; }
        sw = cw / 1.08;
        sh = ch / 1.08;
        sx0 = (iw - sw) / 2 + (nx * (iw - sw)) / 2 * 0.8;
        sy0 = (ih - sh) / 2 + (ny * (ih - sh)) / 2 * 0.8;
      }
      if (clip) {
        ctx.save();
        ctx.clip(clip);
      }
      ctx.drawImage(src, sx0, sy0, sw, sh, dx, dy, dw, dh);
      if (clip) ctx.restore();
    };

    const pintaJanela = (w0, t) => {
      const list = w0.srcs.filter(ok);
      if (!list.length) return;
      // capas: a arte fica inteira, dentro de uma margem de 1 célula onde as talas passam por cima
      const w = w0.fixa ? { ...w0, rl: w0.rl + S, rt: w0.rt + S, rw: w0.rw - 2 * S, rh: w0.rh - 2 * S } : w0;
      const hv = w.hv;
      // sombra da peça
      ctx.save();
      ctx.globalAlpha = w.o;
      ctx.shadowColor = "rgba(0,0,0,.65)";
      ctx.shadowBlur = 26 + 18 * hv;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = "#000";
      ctx.fillRect(w.rl, w.rt, w.rw, w.rh);
      ctx.restore();
      ctx.globalAlpha = w.o;
      let a = list[0], b = null, prog = 0;
      if (w.seq && list.length > 1) {
        const per = 4.6;
        const tt = Math.max(0, t);
        const k = Math.floor(tt / per);
        a = list[k % list.length];
        const ph = tt - k * per;
        if (ph > 3.4) {
          b = list[(k + 1) % list.length];
          prog = (ph - 3.4) / 1.2;
        }
      }
      desenha(a, w, hv, null);
      if (b) {
        // a próxima foto entra como tala: cada célula cresce de cima para baixo, em ondas
        const l = Math.round(w.rl / S), r = Math.round(w.rr / S), tp = Math.round(w.rt / S), bt = Math.round(w.rb / S);
        const path = new Path2D();
        for (let j = tp; j < bt; j++)
          for (let i = l; i < r; i++) {
            const thr = ((i - l) / Math.max(1, r - l)) * 0.55 + H[j * cols + i] * 0.3;
            const fr = Math.min(1, Math.max(0, (prog - thr) / 0.3));
            if (fr > 0) path.rect(i * S, j * S, S, S * fr + 1);
          }
        desenha(b, w, hv, path);
      }
      ctx.globalAlpha = 1;
    };

    // o aro: as talas do tecido passam por cima e por baixo da moldura, uma sim, outra não
    const aro = (w, pal) => {
      const l = Math.round(w.rl / S), r = Math.round(w.rr / S) - 1, tp = Math.round(w.rt / S), bt = Math.round(w.rb / S) - 1;
      const ring = 2, over = w.fixa ? 1 : 2;
      const peca = (i, j, warp, sobre) => {
        const col = sobre ? ((warp ? i : j) % 4 === 0 ? 2 : 1) : 1;
        if (sobre) {
          ctx.globalAlpha = 0.4 * w.o;
          ctx.fillStyle = "#000";
          ctx.fillRect(i * S + 3, j * S + 3, S, S);
        }
        celula(col, i, j, 1, (sobre ? 0.98 : 0.55) * w.o, warp, pal);
      };
      for (let i = l - ring; i <= r + ring; i++) {
        const ov = (i & 1) === 0;
        for (let k = 1; k <= ring; k++) {
          peca(i, tp - k, true, false);
          peca(i, bt + k, true, false);
        }
        if (ov) for (let k = 0; k < over; k++) peca(i, tp + k, true, true);
        else for (let k = 0; k < over; k++) peca(i, bt - k, true, true);
      }
      for (let j = tp; j <= bt; j++) {
        const ov = (j & 1) === 0;
        for (let k = 1; k <= ring; k++) {
          peca(l - k, j, false, false);
          peca(r + k, j, false, false);
        }
        if (ov) for (let k = 0; k < over; k++) peca(l + k, j, false, true);
        else for (let k = 0; k < over; k++) peca(r - k, j, false, true);
      }
      ctx.globalAlpha = 1;
    };

    let raf, ic = 0;
    const ops = new Array(CAPITULOS.length).fill(0);
    const t0 = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) / 1000;
      const { B, total } = geo.current;
      const y = Math.min(total, Math.max(0, scrollY));
      ic = 0;
      while (ic < CAPITULOS.length - 1 && y >= B[ic + 1]) ic++;
      const meia = vh * 0.3;
      caps.current.forEach((el, i) => {
        if (!el) return;
        const ent = i === 0 ? 1 : sm((y - (B[i] - meia * 0.5)) / meia);
        const sai = i === CAPITULOS.length - 1 ? 1 : 1 - sm((y - (B[i + 1] - meia * 1.2)) / meia);
        const o = Math.min(ent, sai);
        ops[i] = o;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.classList.toggle(styles.on, o > 0.55);
      });
      // a troca: perto da fronteira de baixo, a trama refaz o próximo padrão
      let f = 0;
      if (ic < CAPITULOS.length - 1) f = sm((y - (B[ic + 1] - meia * 1.4)) / (meia * 1.8));
      const pA = CAPITULOS[ic].pat, pB = CAPITULOS[Math.min(ic + 1, CAPITULOS.length - 1)].pat;
      const palA = getPal(ic), palB = getPal(Math.min(ic + 1, CAPITULOS.length - 1));

      // lanterna: sem mouse, passeia sozinha
      if (!tocou) {
        const cx = vw * 0.5 + Math.sin(t * 0.5) * vw * 0.3;
        const cy = vh * 0.5 + Math.cos(t * 0.37) * vh * 0.3;
        trail.pop();
        trail.unshift([cx, cy]);
      }
      const R = Math.max(150, vh * 0.3);

      // cursor suavizado: o pano reage e as fotos têm paralaxe
      const alvoX = tocou ? px : vw * 0.5, alvoY = tocou ? py : vh * 0.5;
      csx += (alvoX - csx) * 0.12;
      csy += (alvoY - csy) * 0.12;
      nx = (csx / vw - 0.5) * 2;
      ny = (csy / vh - 0.5) * 2;

      // as janelas que o texto, as fotos e as capas abrem no tecido
      const jan = [];
      document.querySelectorAll("[data-abre]").forEach((el) => {
        const i = +el.dataset.abre;
        const o = ops[i];
        if (o < 0.02) return;
        const r = el.getBoundingClientRect();
        const foto = el.dataset.tipo === "foto";
        let cor = null, srcs = [], hv = 0;
        if (foto) {
          srcs = Array.from(el.querySelectorAll("img,video"));
          if (el._cor === undefined) {
            const im = srcs.find((m) => m.tagName === "IMG");
            if (!im) el._cor = null;
            else if (im.complete && im.naturalWidth) el._cor = mediaDe(im);
          }
          cor = el._cor || null;
          const dentro = tocou && px > r.left && px < r.right && py > r.top && py < r.bottom;
          el._hv = (el._hv || 0) + ((dentro ? 1 : 0) - (el._hv || 0)) * 0.14;
          hv = el._hv;
        }
        jan.push({ o, foto, cor, srcs, hv, fixa: el.dataset.fixa === "1", seq: el.dataset.seq === "1", rl: r.left, rr: r.right, rt: r.top, rb: r.bottom, rw: r.width, rh: r.height });
      });

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0b0a10";
      ctx.fillRect(0, 0, vw, vh);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i;
          const h = H[idx];
          const kl = Math.min(1, Math.max(0, (t * 0.9 - (j / rows) * 1.4 - h * 0.35) / 0.4));
          if (kl <= 0) continue;
          const cxp = i * S + S / 2, cyp = j * S + S / 2;
          const warp0 = ((i + j) & 3) < 2;
          // título tecido: as letras são células cheias
          const ob = own ? own[idx] : 0;
          if (ob) {
            let om = 0;
            for (let c = 0; c < 16; c++) if (ob & (1 << c) && ops[c] > om) om = ops[c];
            if (om > 0.02) {
              celula(1, i, j, kl, 0.98 * om, warp0, PAL0);
              continue;
            }
          }
          let L = 0;
          for (let q = 0; q < trail.length; q++) {
            const dx = cxp - trail[q][0], dy = cyp - trail[q][1];
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < R) L = Math.max(L, (1 - d / R) * (1 - q * 0.07));
          }
          let abre = 0;
          const hb = halo ? halo[idx] : 0;
          if (hb) for (let c = 0; c < 16; c++) if (hb & (1 << c)) abre = Math.max(abre, 0.9 * ops[c]);
          let corte = 1, vazio = false, tint = 0, tc = null;
          for (let q = 0; q < jan.length; q++) {
            const w = jan[q];
            const dxo = Math.max(w.rl - cxp, cxp - w.rr);
            const dyo = Math.max(w.rt - cyp, cyp - w.rb);
            const d = Math.max(dxo, dyo) / S;
            if (w.foto) {
              // dentro da janela e no aro: desenhados depois (imagem limpa + talas que se cruzam)
              if (d < 2.15) vazio = true;
              else if (d < 8.15) {
                const k = w.o * (1 - (d - 2.15) / 6);
                abre = Math.max(abre, k * 0.35);
                if (w.cor && k > tint) {
                  tint = k;
                  tc = w.cor;
                }
              }
            } else {
              abre = Math.max(abre, w.o * sm((1.9 - d) / 2.4));
              if (d > 0 && d < 2.6) corte = Math.min(corte, 1 - w.o * (1 - d / 2.6) * (0.3 + 0.7 * h));
            }
          }
          if (vazio) continue;
          const warp = warp0 !== L > 0.45;
          const base = 0.42 + 0.58 * L;
          const br = base * (1 - 0.88 * abre);
          // o pano cede onde o cursor passa
          let ox = 0, oy = 0;
          if (tocou) {
            const dx = cxp - csx, dy = cyp - csy;
            const dd = Math.sqrt(dx * dx + dy * dy);
            if (dd < 200 && dd > 1) {
              const kk = Math.exp(-(dd * dd) / (2 * 75 * 75)) * 10;
              ox = (dx / dd) * kk;
              oy = (dy / dd) * kk;
            }
          }
          const cA = padrao(pA, Math.floor((i - (cols >> 1)) / 2), Math.floor((j - (rows >> 1)) / 2));
          const len = kl * corte;
          if (f <= 0) {
            celula(cA, i, j, len, br, warp, palA, ox, oy);
          } else {
            const k = Math.min(1, Math.max(0, (f - h * 0.55) / 0.45));
            celula(cA, i, j, len, br, warp, palA, ox, oy);
            if (k > 0) celula(padrao(pB, Math.floor((i - (cols >> 1)) / 2), Math.floor((j - (rows >> 1)) / 2)), i, j, k * corte, br, warp, palB, ox, oy);
          }
          // a cor da obra vaza para a trama em volta
          if (tint > 0.03 && tc) {
            ctx.globalAlpha = Math.min(0.55, tint * 0.6) * len;
            ctx.fillStyle = `rgb(${tc[0]},${tc[1]},${tc[2]})`;
            ctx.fillRect(i * S + ox + 1.5, j * S + oy + 1.5, S - 3, S - 3);
          }
        }
      }
      ctx.globalAlpha = 1;
      // as peças: imagem limpa e o aro tecido por cima
      for (let q = 0; q < jan.length; q++) {
        if (!jan[q].foto) continue;
        pintaJanela(jan[q], t);
        aro(jan[q], palA);
      }

      // anel do cursor
      const an = anel.current;
      if (an) {
        an.style.opacity = tocou ? "1" : "0";
        an.style.transform = `translate3d(${csx}px, ${csy}px, 0) translate(-50%, -50%) scale(${sobreLink ? 2.2 : 1})`;
      }

      // a etiqueta que segue o cursor: o nome do padrão tecido ali
      const tg = tag.current;
      if (tg) {
        const p = PADROES[CAPITULOS[f > 0.5 ? Math.min(ic + 1, CAPITULOS.length - 1) : ic].pat];
        if (tg.dataset.n !== p.nome) {
          tg.dataset.n = p.nome;
          tg.innerHTML = `<b>${p.nome}</b> “${p.trad}”`;
        }
        tg.style.opacity = tocou ? "1" : "0";
        tg.style.transform = `translate3d(${px + 18}px, ${py + 14}px, 0)`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", monta);
      document.documentElement.style.cssText = antes[0];
      document.body.style.cssText = antes[1];
    };
  }, []);

  const cap = (i) => (n) => (caps.current[i] = n);

  return (
    <main ref={raiz} className={styles.raiz}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap"
      />
      <canvas ref={cv} className={styles.tela} aria-hidden="true" />
      <div ref={tag} className={styles.tag} aria-hidden="true" />
      <div ref={anel} className={styles.anel} aria-hidden="true" />
      <VoltarJodo />
      <div className={styles.palco}>
        {/* capa: quem é ele, na mesma tela */}
        <section ref={cap(0)} className={`${styles.cap} ${styles.capa}`}>
          <div className={styles.capaTxt}>
            <Rv k={0} as="span" className={styles.rot}>vblxw · manaus · desde 2013</Rv>
            <h1 className={styles.sr}>Vicente Blow</h1>
            <Tece cap={0} txt="VICENTE" className={styles.tNome} />
            <Tece cap={0} txt="BLOW" className={styles.tNome2} />
            <div className={styles.capaBaixo} data-abre="0" data-tipo="txt">
              <Rv k={2} as="p" className={styles.sub}>rapper · Bruxos do Norte · “el camiño de cobra”</Rv>
              <Rv k={3} as="p" className={styles.italico}>nasceu marcado. sobreviveu rimando.</Rv>
              <Rv k={4} as="p" className={styles.corpo}>
                Nascido em 99, com o cordão umbilical enrolado no pescoço. Marcado para morrer, <mark>desafiou Deus e matou o próprio senhor destino.</mark> Ver o mundo pelo pior lado foi sua terapia. Desenhar com sangue, seu primeiro ofício.
              </Rv>
              <Rv k={5} as="p" className={`${styles.corpo} ${styles.corpo2}`}>
                O rap acendeu a consciência política: o ódio bruto virou <mark>munição organizada</mark> e a caneta, uma mira a laser apontada para o alvo mais forte, o Capital.
              </Rv>
              <Rv k={6} as="p" className={styles.epi}>a.k.a. inimigo número 1 do estado</Rv>
            </div>
          </div>
          <Rv k={2} className={styles.janela} data-abre="0" data-tipo="foto" data-seq="1">
            {FOTOS.map((f, n) => (
              <img key={f} src={`/vb/f/${f}.webp`} alt={n === 0 ? "Vicente Blow" : ""} />
            ))}
          </Rv>
          <Rv k={3} className={styles.capaCta} data-abre="0" data-tipo="txt">
            <a className={styles.btn} href={PERFIS.spotify} target="_blank" rel="noreferrer">ouvir no Spotify ↗</a>
            <a className={styles.btn2} href={PERFIS.instagram} target="_blank" rel="noreferrer">@bruxobuya ↗</a>
          </Rv>
          <Legenda cap={0} />
        </section>

        {/* um capítulo por trabalho: capa, prévia do clipe (quando há) e os dois links */}
        {OBRAS.map((o) => {
          const d0 = achaDisco(o.capa || (o.itens && o.itens[0].capa));
          return (
            <section key={o.id} ref={cap(o.cap)} className={`${styles.cap} ${styles.obra}`}>
              <div className={styles.obraL}>
                <Rv k={0} as="span" className={styles.rot}>{o.rot}</Rv>
                {o.linhas.map((l) => (
                  <Tece key={l} cap={o.cap} txt={l} className={styles.tObra} />
                ))}
                <div className={styles.obraInfo} data-abre={o.cap} data-tipo="txt">
                  <Rv k={1} as="p" className={styles.meta}>{o.meta}</Rv>
                  {o.nota && <Rv k={2} as="p" className={styles.corpo}>{o.nota}</Rv>}
                  {!o.par && (
                    <Rv k={3} className={styles.cta}>
                      <a className={styles.btn} href={SP(o.sp)} target="_blank" rel="noreferrer">Spotify ↗</a>
                      <a className={styles.btn2} href={YT(o.yt)} target="_blank" rel="noreferrer">{o.clipe ? "ver clipe ↗" : "YouTube ↗"}</a>
                    </Rv>
                  )}
                </div>
              </div>
              {o.par ? (
                <div className={styles.par}>
                  {o.itens.map((it, n) => {
                    const d = achaDisco(it.capa);
                    return (
                      <div key={it.capa} className={styles.parItem}>
                        <Rv k={2 + n} className={styles.parImg} data-abre={o.cap} data-tipo="foto" data-fixa="1">
                          <a href={SP(it.sp)} target="_blank" rel="noreferrer"><img src={`/vb/capas/${it.capa}.webp`} alt={`Capa de ${d.t}`} /></a>
                        </Rv>
                        {it.video && (
                          <Rv k={3 + n} className={styles.parVid} data-abre={o.cap} data-tipo="foto">
                            <video src={`/vb/v/${it.video}.mp4`} muted loop playsInline autoPlay preload="auto" />
                          </Rv>
                        )}
                        <Rv k={3 + n} className={styles.legCapa} data-abre={o.cap} data-tipo="txt">
                          <b>{d.t}</b>
                          <small>{d.data}.{d.ano}</small>
                          <span className={styles.links}>
                            <a href={SP(it.sp)} target="_blank" rel="noreferrer">Spotify ↗</a>
                            <a href={YT(it.yt)} target="_blank" rel="noreferrer">{it.clipe ? "clipe ↗" : "YouTube ↗"}</a>
                          </span>
                        </Rv>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <Rv k={2} className={o.video ? styles.capaV : o.grande ? styles.capaMax : styles.capaGrande} data-abre={o.cap} data-tipo="foto" data-fixa="1">
                    <a href={SP(o.sp)} target="_blank" rel="noreferrer"><img src={`/vb/capas/${d0.capa}.webp`} alt={`Capa de ${d0.t}`} /></a>
                  </Rv>
                  {o.video && (
                    <Rv k={3} className={styles.vidJan} data-abre={o.cap} data-tipo="foto">
                      <video src={`/vb/v/${o.video}.mp4`} muted loop playsInline autoPlay preload="auto" />
                    </Rv>
                  )}
                </>
              )}
              <Legenda cap={o.cap} />
            </section>
          );
        })}

        {/* o resto da discografia */}
        <section ref={cap(CAP_OUTROS)} className={`${styles.cap} ${styles.outros}`}>
          <div className={styles.outrosL}>
            <Rv k={0} as="span" className={styles.rot}>singles e participações</Rv>
            <Tece cap={CAP_OUTROS} txt="E MAIS" className={styles.tObra} />
          </div>
          <div className={styles.grade3}>
            {OUTROS.map((it, n) => {
              const d = achaDisco(it.capa);
              if (!d) return null;
              return (
                <div key={it.capa} className={styles.g3Item}>
                  <Rv k={1 + (n % 3)} className={styles.g3Img} data-abre={CAP_OUTROS} data-tipo="foto" data-fixa="1">
                    <a href={it.sp ? SP(it.sp) : it.spUrl} target="_blank" rel="noreferrer"><img src={`/vb/capas/${d.capa}.webp`} alt={`Capa de ${d.t}`} loading="lazy" /></a>
                  </Rv>
                  <Rv k={2 + (n % 3)} className={styles.legCapa} data-abre={CAP_OUTROS} data-tipo="txt">
                    <b>{d.t}</b>
                    <small>{d.data}.{d.ano}</small>
                    <span className={styles.links}>
                      <a href={it.sp ? SP(it.sp) : it.spUrl} target="_blank" rel="noreferrer">Spotify ↗</a>
                      <a href={YT(it.yt)} target="_blank" rel="noreferrer">YouTube ↗</a>
                    </span>
                  </Rv>
                </div>
              );
            })}
          </div>
          <Legenda cap={CAP_OUTROS} />
        </section>

        {/* ouvir */}
        <section ref={cap(CAP_OUVIR)} className={`${styles.cap} ${styles.ouvir}`}>
          <div className={styles.outrosL}>
            <Rv k={0} as="span" className={styles.rot}>acende o som</Rv>
            <Tece cap={CAP_OUVIR} txt="ONDE" className={styles.tQuem} />
            <Tece cap={CAP_OUVIR} txt="OUVIR." className={styles.tQuem} />
            <div className={styles.ouvirCorpo} data-abre={CAP_OUVIR} data-tipo="txt">
              <Rv k={2} className={styles.cta}>
                <a className={styles.btn} href={PERFIS.spotify} target="_blank" rel="noreferrer">Spotify ↗</a>
                {PERFIS.deezer && <a className={styles.btn2} href={PERFIS.deezer} target="_blank" rel="noreferrer">Deezer ↗</a>}
                <a className={styles.btn2} href={PERFIS.instagram} target="_blank" rel="noreferrer">@bruxobuya ↗</a>
                {PERFIS.youtubeAlbum && <a className={styles.btn2} href={PERFIS.youtubeAlbum} target="_blank" rel="noreferrer">YouTube ↗</a>}
              </Rv>
              <Rv k={3} as="p" className={styles.fonte}>
                Nomes e traduções dos padrões: <i>Arte Baniwa: cestaria de arumã</i> (FOIRN e ISA, 2000). O desenho de cada um na grade, a escolha de qual vai em qual trabalho e as cores de cada trabalho (tiradas da capa) são leituras nossas. O arumã baniwa em si é natural, preto de cinza e vermelho de urucum.
              </Rv>
            </div>
          </div>
          <Legenda cap={CAP_OUVIR} />
        </section>
      </div>
      <div ref={trilha} className={styles.trilha} />
    </main>
  );
}
