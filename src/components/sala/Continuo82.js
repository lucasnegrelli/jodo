"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/continuo82.module.css";
import useContrasteLogo from "@/lib/useContrasteLogo";
import Painel82 from "./Painel82";

/*
  82: uma continuidade só.
  Um palco fixo e uma rolagem. Cada trabalho é uma cena com linguagem de movimento própria
  (glitch no K-OS, montagem horizontal no Intravenal, órbita no Häxan, tira vertical na Realeza).
  As cenas se sobrepõem: a identidade de uma vira a da próxima, e o fundo muda de cor sem corte.
*/

const thumb = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
const CITACOES = [
  "O nome do jogo não é proibição, é Compressão Psicoacústica.",
  "A mão invisível aqui não regula preços; ela regula o desespero.",
  "Se eles ouvirem e disserem “gostei”, você falhou. Se disserem “não gostei”, você falhou.",
  "Os 13 minutos e 57 segundos do EP: o ouvinte deixa de ser um cidadão e vira um habitante da Nação JODO.",
  "As above, so below. PHINEA$ aponta para Antares; KRAPNEK82 desce para as vísceras.",
];
const INTRA_DOC = [
  { l: "a", t: "Sinais", h: "00:01", yt: "I6cvxEs1otg" },
  { l: "b", t: "Aporte", h: "03:00", yt: "IDpYmEUT5rY" },
  { l: "c", t: "Engrenagem", h: "05:43", yt: "fB4r6Ggm1p4" },
  { l: "d", t: "Inverso", h: "08:07", yt: "QwaWUmaIjq8" },
  { l: "e", t: "Manual", h: "11:12", yt: "gcTz6i2nwII" },
];
const SPOTIFY_INTRA = "https://open.spotify.com/intl-pt/album/52wRSFms6UCZ55l8DjfthN";
const SPOTIFY_HAXAN = "https://open.spotify.com/intl-pt/album/6hESUCzdK9lDy9GIH3o25I";
const SPOTIFY_MUNDO = "https://open.spotify.com/intl-pt/album/0vTovd2j9EKHULeMaJW6fR";
/* redes do rodapé: só aparece botão de quem tem link. Preencher a url de cada uma para ligar o botão (X ainda sem endereço). */
const REDES = [
  { nome: "Instagram", cor: "#e4405f", grad: "linear-gradient(45deg, #feda75, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5)", ic: "#fff", url: "https://www.instagram.com/krapnek82/", d: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.2-3.2a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" },
  { nome: "YouTube", cor: "#ff0000", ic: "#fff", url: "https://www.youtube.com/@JODOJODOJODO", d: "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3Z" },
  { nome: "Spotify", cor: "#1db954", ic: "#0b0b0b", url: "https://open.spotify.com/album/7685I632mcfgWdjccuBgJi", d: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.6 14.4a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.4-1.1a.75.75 0 1 1-.35-1.46c4.5-1 8.4-.6 11.5 1.3a.75.75 0 0 1 .25 1.01Zm1.3-3a.94.94 0 0 1-1.3.3c-3.2-2-8-2.5-11.8-1.4a.94.94 0 1 1-.55-1.8c4.3-1.3 9.6-.7 13.3 1.6a.94.94 0 0 1 .35 1.3Zm.1-3.1c-3.8-2.3-10.2-2.5-13.9-1.4a1.12 1.12 0 1 1-.65-2.15c4.2-1.3 11.3-1 15.7 1.6a1.12 1.12 0 0 1-1.15 1.95Z" },
  { nome: "X", cor: "#f4f4f4", ic: "#000", url: "", d: "M17.7 3h3L14.2 10.4 22 21h-6.1l-4.8-6.3L5.6 21h-3l7-8L2.2 3h6.3l4.3 5.7ZM16.6 19.2h1.7L7.7 4.7H5.9Z" },
].filter((r) => r.url);

const SPOTIFY_KOS = "https://open.spotify.com/album/7685I632mcfgWdjccuBgJi";

const KOS = [
  { t: "Dekalogo", yt: "vw73wsczwRs" },
  { t: "Folklore", yt: "HIMjVqnF-o4" },
  { t: "Smol Tow", yt: "OT_8fRWbl04" },
  { t: "Kek Doom", yt: "TXI8L6Zowqo", clipe: true },
  { t: "Kaskarrupt", yt: "IQRRTZkNedc" },
  { t: "*sekret*", yt: "MfjEAsWIzME" },
  { t: "Insanne", yt: "U38QKWmhGQY" },
];
const INTRA = [
  { t: "Sinais", yt: "I6cvxEs1otg" },
  { t: "Aporte", yt: "IDpYmEUT5rY" },
  { t: "Engrenagem", yt: "fB4r6Ggm1p4" },
  { t: "Inverso", yt: "QwaWUmaIjq8" },
  { t: "Manual", yt: "gcTz6i2nwII" },
];
const HAXAN = [
  { t: "Se Eu Rir", yt: "kAw_1UgNqVg", p: "Msor" },
  { t: "Realeza", yt: "TabOu0jvAb4", p: "Msor", clipe: true },
  { t: "Abençoa", yt: "DRkCBHQyi00", p: "Msor" },
  { t: "Vertigem", yt: "2o5OWoEM_tA", p: "HeadB", clipe: true },
  { t: "Coisas Transparentes", yt: "HGyUqv0Vda0", p: "Msor" },
];

/* linha do tempo, em unidades de altura de tela (1 = 100vh de rolagem). Do mais novo para o mais antigo. */
const CENA = {
  kos: [0, 3.7],
  intra: [3.3, 6.9],
  haxan: [6.4, 11.4],
  mundo: [10.9, 14.0],
  antes: [13.6, 16.4],
};
const TOTAL = 16.4;

const FUNDOS = [
  [0, [0, 0, 0]],
  [3.3, [0, 0, 0]],
  [4.0, [28, 28, 28]],
  [6.4, [28, 28, 28]],
  [7.3, [249, 245, 238]],
  [8.1, [249, 245, 238]],
  [9.0, [14, 11, 12]],
  [10.9, [14, 11, 12]],
  [11.6, [24, 10, 7]],
  [13.4, [24, 10, 7]],
  [14.3, [5, 6, 5]],
  [99, [5, 6, 5]],
];

const MUNDO = [
  { n: 1, t: "F****** Tudo" },
  { n: 2, t: "Cuspir Sapos" },
  { n: 3, t: "Pode Pá, Ora Pois", feat: "RaizK, Vicente Blow" },
  { n: 4, t: "Pão de Batata", feat: "1cort3, Espontâneo" },
  { n: 5, t: "Fura Filas" },
  { n: 6, t: "Memória de Peixe", yt: "z5jI9H2ZMks" },
  { n: 7, t: "Céloko", feat: "Sergio Estranho" },
];

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const loc = (y, a, b) => clamp((y - a) / (b - a));
const vis = (y, [a, b], f = 0.55) => sm((y - a) / f) * (1 - sm((y - (b - f)) / f));

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

function fmt(n) {
  if (!n) return "";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",") + " mil";
  return String(n);
}

export default function Continuo82({ identidades, painel, discos, serie }) {
  useContrasteLogo();
  const E = useRef({});
  const reg = (k) => (el) => {
    if (el) E.current[k] = el;
  };
  const [tocando, setTocando] = useState(null);
  const [ativa, setAtiva] = useState("kos");
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const f = () => setMobile(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  const [marcaAberta, setMarcaAberta] = useState(false);
  const [bagSaindo, setBagSaindo] = useState(false);
  const [extra, setExtra] = useState(0);
  const extraRef = useRef(0);
  const saindoT = useRef(null);
  const bagVai = () => {
    setBagSaindo(true);
    clearTimeout(saindoT.current);
    saindoT.current = setTimeout(() => setBagSaindo(false), 420);
  };

  useEffect(() => {
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0 };
    const m = { x: 0, y: 0 };
    let ultimoY = window.scrollY / window.innerHeight;
    let vel = 0;
    let raf;
    let ativaAtual = "kos";

    const move = (e) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", move, { passive: true });

    const set = (k, estilo) => {
      const el = E.current[k];
      if (!el) return;
      for (const p in estilo) el.style[p] = estilo[p];
    };
    const T = (x = 0, y = 0, s = 1, r = 0) => `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;

    const loop = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const y = window.scrollY / H;
      vel += ((y - ultimoY) * 60 - vel) * 0.18;
      ultimoY = y;
      m.x += (mouse.x - m.x) * 0.07;
      m.y += (mouse.y - m.y) * 0.07;
      const mx = reduz ? 0 : m.x;
      const my = reduz ? 0 : m.y;
      const gv = reduz ? 0 : vel;

      {
        const mc0 = E.current["marca"];
        if (mc0) mc0.dataset.fora = y > TOTAL - 0.4 ? "1" : "0";
      }
      // a montanha cresce de leve conforme o mouse se aproxima (chamando)
      {
        const mc = E.current["marca"];
        if (mc) {
          const r = mc.getBoundingClientRect();
          const d = Math.hypot((mouse.x + 0.5) * W - (r.left + r.width / 2), (mouse.y + 0.5) * H - (r.top + 40));
          mc.style.setProperty("--prox", clamp(1 - d / 300).toFixed(3));
        }
      }

      // fundo
      const [r, g, b] = fundoEm(y);
      set("fundo", { background: `rgb(${r},${g},${b})` });

      // cenas: visibilidade + interação
      const vh = {
        kos: 1 - sm((y - (CENA.kos[1] - 0.55)) / 0.55),
        intra: vis(y, CENA.intra),
        haxan: vis(y, CENA.haxan),
        mundo: vis(y, CENA.mundo),
        antes: sm((y - CENA.antes[0]) / 0.6),
      };
      for (const k in vh) set(k, { opacity: vh[k].toFixed(3), pointerEvents: vh[k] > 0.45 ? "auto" : "none", visibility: vh[k] < 0.005 ? "hidden" : "visible" });

      // cena ativa (para a navegação lateral)
      let a = "kos";
      if (y >= 3.2) a = "intra";
      if (y >= 6.3) a = "haxan";
      if (y >= 10.8) a = "mundo";
      if (y >= 13.5) a = "antes";
      if (a !== ativaAtual) {
        ativaAtual = a;
        setAtiva(a);
      }

      /* ===== K-OS: terminal. Digitação, glitch com canais RGB separados pela velocidade, recortes em passos ===== */
      {
        const passo = (n, p = 6) => Math.round(n / p) * p;
        const esc = 0.7 + sm(loc(y, 0, 2.8)) * 0.3;
        const sep = clamp(Math.abs(gv) * 22, 0, 90);
        const sai = 1 - sm((y - 3.0) / 0.7);
        // mau contato: sinal que cai, volta, treme em saltos secos (sem movimento suave)
        const sp = sm(loc(y, 0.04, 1.5));
        const some = 1 - sm(loc(y, 1.35, 2.1));
        const agora = performance.now() / 1000;
        const h = (n) => {
          const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
          return v - Math.floor(v);
        };
        const tick = Math.floor(agora * 11);
        const queda = (k) => (h(tick * 0.37 + k) > 0.8 ? 1 : 0); // sinal cai
        const tremor = (k, amp) => (h(tick + k * 9.1) - 0.5) * amp * (h(tick * 0.5 + k) > 0.55 ? 1 : 0.15);
        set("k_r", {
          transform: T(passo(-sp * W * 0.36 - sep * 0.5 + tremor(1, 120) * (0.3 + sp)), passo(-sp * H * 0.06 + tremor(2, 30)), esc, 0),
          opacity: (some * (1 - queda(1) * 0.85)).toFixed(3),
        });
        set("k_g", {
          transform: T(passo(sp * W * 0.32 + sep * 0.4 + tremor(3, 120) * (0.3 + sp)), passo(sp * H * 0.1 + tremor(4, 30)), esc * (1 - sp * 0.08), 0),
          opacity: (some * (1 - queda(2) * 0.85)).toFixed(3),
        });
        set("k_b", { transform: T(passo(sep * 0.6 + mx * 30), passo(my * 16), esc, 0) });
        set("k_face", { opacity: ((0.22 + sm(loc(y, 0, 2.6)) * 0.78) * sai).toFixed(3) });
        set("k_titulo", {
          transform: T(passo(mx * -24, 4), -y * H * 0.12 + my * -14, 1 + y * 0.04, 0),
          opacity: sai.toFixed(3),
          filter: `drop-shadow(${(3 + sep / 4).toFixed(0)}px 0 rgba(255,40,60,.85)) drop-shadow(${(-3 - sep / 4).toFixed(0)}px 0 rgba(40,200,255,.85)) drop-shadow(0 0 18px rgba(90,255,80,.55))`,
        });
        // o terminal digita o comando conforme a rolagem
        const cmd = "play --album k-os --no-shuffle";
        const n = Math.floor(clamp(loc(y, 0.02, 0.8)) * cmd.length);
        const el = E.current["k_cmd"];
        if (el && el.dataset.n !== String(n)) {
          el.dataset.n = String(n);
          el.textContent = cmd.slice(0, n);
        }
        set("k_term", { opacity: (1 - sm((y - 2.7) / 0.6)).toFixed(3) });
        // cortes do rosto: aparecem e somem como tela com mau contato, fixos no lugar (nada desliza)
        for (let i = 1; i <= 6; i++) {
          const t2 = Math.floor(agora * (3 + i * 0.6));
          const liga = h(t2 + i * 3.3) > 0.18;
          const entra = sm(loc(y, 0.05 + i * 0.12, 0.3 + i * 0.12));
          const fadeOut = 1 - sm((y - 1.3) / 0.45);
          const rasga = h(t2 * 1.7 + i) > 0.9;
          set("k_c" + i, {
            opacity: (liga ? entra * fadeOut * (0.55 + 0.45 * h(t2 + i)) : entra * fadeOut * 0.04).toFixed(3),
            transform: T(rasga ? (h(t2 + i * 5) - 0.5) * 70 : 0, 0, rasga ? 1.04 : 1, 0),
            clipPath: rasga ? `inset(${(h(t2 + i) * 40).toFixed(0)}% 0 ${(h(t2 * 2 + i) * 40).toFixed(0)}% 0)` : "none",
          });
        }
        {
          // o 8 acende em azul conforme o mouse chega perto
          const o8 = E.current["k_oito"];
          let prox = 0;
          if (o8) {
            const r8 = o8.getBoundingClientRect();
            const mxp = (mouse.x + 0.5) * W;
            const myp = (mouse.y + 0.5) * H;
            const dx = Math.max(r8.left - mxp, 0, mxp - r8.right);
            const dy = Math.max(r8.top - myp, 0, myp - r8.bottom);
            prox = clamp(1 - Math.hypot(dx, dy) / 40);
          }
          set("k_oito", {
            opacity: sai.toFixed(3),
            transform: "none",
            filter: `drop-shadow(0 0 ${(12 + prox * 70).toFixed(0)}px rgba(60,140,255,${(0.75 + prox * 0.25).toFixed(2)})) drop-shadow(0 0 ${(4 + prox * 26).toFixed(0)}px rgba(120,190,255,${(0.6 + prox * 0.4).toFixed(2)})) brightness(${(1 + prox * 0.9).toFixed(2)})`,
          });
        }
        set("k_clip", {
          opacity: (sm(loc(y, 1.3, 1.8)) * (1 - sm((y - 3.0) / 0.5))).toFixed(3),
          transform: T(0, (1 - sm(loc(y, 1.3, 1.9))) * H * 0.25, 1, -1.5),
        });
        set("k_ul", { opacity: (sm((y - 0.35) / 0.5) * (1 - sm((y - 3.1) / 0.55))).toFixed(3) });
        set("k_cred", { opacity: (sm((y - 1.0) / 0.6) * (1 - sm((y - 3.0) / 0.5))).toFixed(3) });
        set("k_linhagem", { opacity: (1 - sm(y / 0.9)).toFixed(3) });
      }

      /* ===== INTRAVENAL: dossiê. As letras se montam, o documento é "desclassificado", as citações passam ===== */
      {
        const t = loc(y, CENA.intra[0], CENA.intra[1]);
        set("i_fundo_tex", { opacity: (sm(t * 5) * (1 - sm(loc(t, 0.88, 1)))).toFixed(3) });
        set("i_fundo", { opacity: (0.95 * sm(t * 5) * (1 - sm(loc(t, 0.88, 1)))).toFixed(3), transform: T(-t * 40, 0, 1, 0) });
        const mont = sm(loc(t, 0.0, 0.4));
        const fusao = 0;
        const larg = Math.min(0.94 * W, 1000) / 3;
        set("i_l1", { transform: T(-(1 - mont) * W * 0.6 + mx * -20 + fusao * larg, 0, 1, -(1 - mont) * 4) });
        set("i_l2", { transform: T(0, (1 - mont) * -H * 0.5 + my * -12, 0.8 + mont * 0.2, 0) });
        set("i_l3", { transform: T((1 - mont) * W * 0.6 + mx * -20 - fusao * larg, 0, 1, (1 - mont) * 4) });
        {
          const enc = sm(loc(t, 0.4, 0.58));
          const el = E.current["i_titulo"];
          if (el) {
            el.style.opacity = (1 - sm(loc(t, 0.52, 0.6))).toFixed(3);
            el.style.transform = `translate(-50%, -50%) scale(${Math.max(0.001, 1 - enc).toFixed(3)})`;
          }
        }
        set("i_kicker", { opacity: (sm(loc(t, 0.3, 0.38)) * (1 - sm(loc(t, 0.5, 0.58)))).toFixed(3) });
        const dv = sm(loc(t, 0.4, 0.55)) * (1 - sm(loc(t, 0.8, 0.92)));
        const dvm = W <= 700 ? sm(loc(t, 0.4, 0.55)) * (1 - sm(loc(t, 0.66, 0.76))) : dv;
        set("i_doc", { opacity: dvm.toFixed(3), transform: "translateY(-50%) " + T(-(1 - sm(loc(t, 0.4, 0.6))) * W * 0.3 + mx * -10, my * -8, 1, -0.5) });
        set("i_diag", { opacity: (dvm * 0.92).toFixed(3), transform: "translateY(-50%) " + T((1 - sm(loc(t, 0.45, 0.65))) * W * 0.3 + mx * -16, my * -10, 1, 0.8) });
        const q = Math.min(CITACOES.length - 1, Math.floor(loc(t, 0.5, 0.82) * CITACOES.length));
        const el = E.current["i_quote"];
        if (el && el.dataset.q !== String(q)) {
          el.dataset.q = String(q);
          el.textContent = CITACOES[q];
        }
        set("i_quote", { opacity: (sm(loc(t, 0.5, 0.58)) * (1 - sm(loc(t, 0.8, 0.9)))).toFixed(3) });
        const f = loc(t, 0.78, 1.0);
        if (W <= 700) {
          // celular: são só duas imagens (os dois panoramas); entram uma depois da outra, com uma leve deriva
          set("i_tira", { opacity: "1", transform: "none" });
          const a = sm(loc(t, 0.78, 0.84)) * (1 - sm(loc(t, 0.98, 1.0)));
          const b = sm(loc(t, 0.82, 0.88)) * (1 - sm(loc(t, 0.98, 1.0)));
          const d = sm(loc(t, 0.88, 0.99)); // o carrossel se desfaz em fatias e vai ficando branco
          set("i_pan_a", { opacity: a.toFixed(3), transform: `translate3d(${((0.5 - loc(t, 0.78, 1.0)) * -36).toFixed(1)}px, 0, 0)` });
          set("i_pan_b", { opacity: b.toFixed(3), transform: `translate3d(${((0.5 - loc(t, 0.82, 1.0)) * 36).toFixed(1)}px, 0, 0)` });
          ["i_pan_a", "i_pan_b"].forEach((k) => E.current[k] && E.current[k].style.setProperty("--d", d.toFixed(3)));
        } else {
          set("i_tira", { opacity: (sm(loc(t, 0.78, 0.86)) * (1 - sm(loc(t, 0.94, 1.0)))).toFixed(3), transform: T(W * 0.7 - f * W * 2.6, 0, 1, 0) });
        }
      }

      /* ===== HÄXAN: abre como a capa viva (creme, marcas no lugar) e vira cartaz escuro; as marcas entram em órbita ===== */
      {
        const t = loc(y, CENA.haxan[0], CENA.haxan[1]);
        const cobre = sm(loc(t, 0.0, 0.14));
        const viva = 1 - sm(loc(t, 0.28, 0.5));
        const orb = (1 - viva) * (t * 300 + 40);
        const R0 = Math.min(W, H) * 0.36;
        const ang = (k) => ((orb + k * 90) * Math.PI) / 180;
        const fim = 1 - sm(loc(t, 0.88, 1.0));
        const marcas = [
          ["x_ondas", 0, 0.5, -30],
          ["x_verm", 1, 1.1, 18],
          ["x_verde", 2, 0.9, -22],
          ["x_azul", 3, 1.4, 14],
        ];
        marcas.forEach(([k, i2, mm, rot]) => {
          const a2 = ang(i2);
          const o = 1 - viva;
          const px = Math.cos(a2) * R0 * 1.25 * o + mx * -70 * mm * 0.6;
          const py = Math.sin(a2) * R0 * 0.62 * o + my * -40 * mm * 0.6;
          set(k, {
            transform: T(px, py, 1 - o * 0.5, rot * o + Math.sin(a2) * 8 * o),
            opacity: (cobre * (0.35 + 0.65 * viva) * fim).toFixed(3),
          });
        });
        if (W <= 700) {
          // celular: a capa viva ocupa a tela; depois do giro ela encolhe e sobe, abrindo espaço pro título e pra lista
          const ec = E.current["x_capa"];
          if (ec) ec.style.transform = `translate(-50%, calc(-50% - ${((1 - viva) * H * 0.2).toFixed(0)}px)) scale(${(1 - (1 - viva) * 0.45).toFixed(3)})`;
        }
        set("x_ondas", { filter: `invert(${(1 - viva).toFixed(2)})` });
        set("x_pers", {
          transform: T(mx * -14 - (1 - viva) * W * 0.27, my * -10 + (1 - viva) * H * 0.08, 0.78 + 0.22 * viva, 0),
          opacity: (cobre * fim).toFixed(3),
        });
        // a tira do zine da Realeza (assets do clipe) sobe ao fundo, no fim do Häxan
        [1, 2, 3, 4].forEach((c) => {
          const sp = [0.55, 1.1, 0.8, 1.4][c - 1];
          const zt = loc(t, 0.62, 1.0);
          set("x_z" + c, { transform: T(0, H * 0.7 - zt * H * (1.2 + sp) , 1, 0), opacity: (0.13 * sm(loc(t, 0.6, 0.8)) * fim).toFixed(3) });
        });
        set("x_meta", { opacity: (cobre * viva).toFixed(3) });
        set("x_cartaz", { opacity: (0.55 * sm(loc(t, 0.3, 0.55)) * fim).toFixed(3), transform: T(0, -t * 90, 1.1, 0) });
        const nasc = sm(loc(t, 0.34, 0.6));
        set("x_titulo", {
          opacity: (nasc * fim).toFixed(3),
          transform: T(mx * -16, my * -10 + (1 - nasc) * 40, 1.5 - nasc * 0.5, 0),
          filter: `blur(${((1 - nasc) * 14).toFixed(1)}px)`,
        });
        set("x_lista", { opacity: (sm(loc(t, 0.5, 0.68)) * fim).toFixed(3) });
      }

      /* ===== MUNDO ESTRANHO: letreiro neon que acende (pisca), a bala-planeta passa, a pilha de balas emoldura a tracklist ===== */
      {
        const t = loc(y, CENA.mundo[0], CENA.mundo[1]);
        const fim = 1 - sm(loc(t, 0.9, 1.0));
        const acende = sm(loc(t, 0.0, 0.16));
        const pisca = t < 0.2 ? (Math.sin(t * 260) > -0.15 ? 1 : 0.3) : 1;
        const ent = sm(loc(t, 0.0, 0.28));
        const passa = sm(loc(t, 0.36, 0.62));
        set("m_titulo", {
          opacity: (acende * pisca * fim * (1 - 0.35 * passa)).toFixed(3),
          transform: T(0, 0, 1 + (1 - acende) * 0.18 - passa * 0.12, 0),
        });
        set("m_bala", {
          opacity: (ent * (1 - passa) * fim).toFixed(3),
          transform: T(0, (1 - ent) * H * 0.55 - passa * H * 0.5, 1 + passa * 0.55, Math.sin(t * 11) * 3 + passa * 8),
        });
        set("m_cevas", {
          opacity: (sm(loc(t, 0.1, 0.3)) * (1 - passa) * fim).toFixed(3),
          transform: T(mx * -50, (1 - sm(loc(t, 0.1, 0.32))) * 60 - passa * H * 0.25, 1, -3),
        });
        for (let i = 0; i < 18; i++) {
          const q = (n) => {
            const v = Math.sin((i + 1) * 12.9898 * n) * 43758.5453;
            return v - Math.floor(v);
          };
          const vel = 0.6 + q(1) * 1.8;
          const x0 = q(2) * 1.2 - 0.1;
          const vx = (q(3) - 0.5) * 0.5;
          const p0 = (t * vel * 1.6 + q(4)) % 1;
          const px = (x0 + vx * (p0 - 0.5)) * W;
          const py = (1.15 - p0 * 1.5) * H;
          const tam = 0.5 + q(5) * 1.1;
          const ab = sm(loc(t, 0.04 + q(6) * 0.2, 0.3 + q(6) * 0.2)) * fim;
          set("m_f" + i, {
            transform: T(px, py, tam, (q(7) - 0.5) * 80 + t * 360 * (q(8) - 0.5) * 2),
            opacity: (ab * (0.55 + 0.45 * Math.min(1, tam))).toFixed(3),
          });
        }
        set("m_lista", {
          opacity: (sm(loc(t, 0.46, 0.64)) * fim).toFixed(3),
          transform: T(0, (1 - sm(loc(t, 0.46, 0.66))) * H * 0.1 + my * -8, 1, 0),
        });
        set("m_ficha", { opacity: (sm(loc(t, 0.6, 0.76)) * fim).toFixed(3) });
      }

      /* ===== 2019—2021: arquivo em terminal; os grupos entram em sequência ===== */
      {
        const t = loc(y, CENA.antes[0], CENA.antes[1]);
        set("a_lista", { opacity: sm(loc(y, 14.0, 14.7)).toFixed(3) });
        const el = E.current["a_lista"];
        if (el) el.style.setProperty("--p", clamp(loc(y, 14.2, 15.8)).toFixed(3));
        set("a_titulo", { transform: T(mx * -20, -t * 40 + my * -10, 1, 0) });
        // o conteúdo rola por dentro da cena: mede o quanto passa da tela e estica a trilha
        const inn = E.current["a_inner"];
        if (inn) {
          const sobra = W <= 700 ? Math.max(0, inn.scrollHeight - H * 0.86) : 0;
          const sH = sobra / H;
          const ex = sobra > 0 ? Math.max(0, Math.ceil((15.0 + sH + 0.9 - TOTAL) * 10) / 10) : 0;
          if (Math.abs(ex - extraRef.current) > 0.05) {
            extraRef.current = ex;
            setExtra(ex);
          }
          const prog = sobra > 0 ? clamp((y - 15.0) / Math.max(0.05, sH)) : 0;
          inn.style.transform = `translate3d(0, ${(-sobra * prog).toFixed(1)}px, 0)`;
        }
      }

      // posição de rolagem do preenchimento (navegação)
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setTocando(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const ir = (id) => {
    if (id === "clipes") {
      document.getElementById("clipes")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const topo = { kos: 0, intra: 4.2, haxan: 6.9, mundo: 11.6, antes: 14.6 }[id];
    window.scrollTo({ top: topo * window.innerHeight, behavior: "smooth" });
  };
  const tocar = (f, quem) => setTocando({ yt: f.yt, titulo: f.t || f.titulo, quem });

  const NAV = [
    ["kos", "K-OS"],
    ["intra", "Intravenal"],
    ["haxan", "Häxan"],
    ["mundo", "Mundo Estranho"],
    ["antes", "Destrave"],
    ["clipes", "Clipes e tudo mais"],
  ];

  return (
    <div className={styles.raiz}>
      <VoltarJodo />
      <header className={styles.topo}>
        <div data-logo-zona ref={reg("marca")} className={`${styles.marcaCentro} ${marcaAberta ? styles.aberta : ""} ${bagSaindo ? styles.saindo : ""}`} onMouseEnter={() => { clearTimeout(saindoT.current); setBagSaindo(false); }} onMouseLeave={bagVai} onClick={() => { if (marcaAberta) bagVai(); setMarcaAberta((v) => !v); }}>
          <Link href="/" className={styles.marcaLink} aria-label="82: voltar ao topo da página" onClick={(e) => { e.preventDefault(); if (window.scrollY < 30) window.location.reload(); else window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <img className={styles.mMontanha} src="/jodo-montanha.png" alt="JODO" data-logo-contraste />
            <img className={styles.m82} src="/82/drops/kos-oito.webp" alt="82" />
          </Link>
          <Link href="/artistas/rap-delivery" className={styles.rapSai} aria-label="Rap Delivery">
            <img src="/rd-caixa.webp" alt="Rap Delivery" />
          </Link>
        </div>
      </header>

      <nav className={styles.nav} aria-label="Trabalhos">
        {NAV.map(([id, rot]) => (
          <button key={id} onClick={() => ir(id)} className={ativa === id ? styles.navAtivo : ""}>
            <i />
            <span>{rot}</span>
          </button>
        ))}
      </nav>

      <div className={styles.trilha} style={{ height: `${(TOTAL + extra + 1) * 100}vh` }}>
        <div className={styles.palco}>
          <div className={styles.fundo} ref={reg("fundo")} />

          {/* ---------- K-OS ---------- */}
          <div className={`${styles.cena} ${styles.primeira}`} ref={reg("kos")}>
            <div className={styles.kFace} ref={reg("k_face")}>
              <img ref={reg("k_r")} src="/82/drops/kos-feed-7.jpg" alt="" />
              <img ref={reg("k_g")} src="/82/drops/kos-feed-9.jpg" alt="" />
              <img ref={reg("k_b")} src="/82/drops/kos-feed-8.jpg" alt="" />
            </div>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <img key={n} ref={reg("k_c" + n)} className={`${styles.kCorte} ${styles["kc" + n]}`} src={`/82/drops/kos-feed-${n}.jpg`} alt="" />
            ))}
            <p className={styles.kTerm} ref={reg("k_term")}>
              <span>(root@krapnek82)-[~] $</span> <b ref={reg("k_cmd")} />
              <i />
            </p>
            <img className={styles.kTitulo} ref={reg("k_titulo")} src="/82/drops/kos-titulo.webp" alt="K-OS" />
            <div className={styles.kLista} ref={reg("k_lista")}>
              <img className={styles.kOito} ref={reg("k_oito")} src="/82/drops/kos-oito.webp" alt="8" />
              <div ref={reg("k_ul")}>
              <ul>
                {KOS.map((f) => (
                  <li key={f.yt}>
                    <button onClick={() => tocar(f, "KRAPNEK82 · K-OS")}>
                      <span>{f.t}</span>
                      {f.clipe && <em>clipe</em>}
                    </button>
                  </li>
                ))}
              </ul>
              <a href={SPOTIFY_KOS} target="_blank" rel="noopener noreferrer" className={styles.ouvir}>ouvir no Spotify ↗</a>
              </div>
            </div>
            <button className={styles.kClip} ref={reg("k_clip")} onClick={() => tocar({ t: "Kek Doom", yt: "TXI8L6Zowqo" }, "KRAPNEK82 · K-OS · clipe")} aria-label="Kek Doom, clipe">
              <img src="/82/drops/kos-story-kekdoom.jpg" alt="" />
              <span>kek doom · clipe ▶</span>
            </button>
            <p className={styles.kCred} ref={reg("k_cred")}>
              <span>letras e instrumentais por krapnek82 · captação, mix e master por akaphineas</span>
              <span>capa e mídias por orlandovfo · direção de fotografia do kek doom por ariadnynz</span>
              <span>colab merchan special: mosaico da caneta posca mop’r por trinca</span>
              <span>2026</span>
            </p>
            <div className={styles.kLinhagem} ref={reg("k_linhagem")}>
              <ul>
                {identidades.map((n) => (
                  <li key={n.nome}><i>{n.anos.slice(0, 4)}</i> {n.nome}</li>
                ))}
              </ul>
              <small>cada nome uma fase ↓ desce que tem mais</small>
            </div>
          </div>

          {/* ---------- INTRAVENAL ---------- */}
          <div className={styles.cena} ref={reg("intra")}>
            <div className={styles.iFundoTex} ref={reg("i_fundo_tex")} />
            <img className={styles.iFundo} ref={reg("i_fundo")} src="/82/drops/intravenal-capa-hq.webp" alt="" />
            <p className={styles.iKicker} ref={reg("i_kicker")}>aprovado para lançamento · 30/01/2026</p>
            <div className={styles.iLetras} ref={reg("i_titulo")}>
              <img ref={reg("i_l1")} src="/82/drops/intravenal-letra-1t.jpg" alt="INT" />
              <img ref={reg("i_l2")} src="/82/drops/intravenal-letra-2t.webp" alt="RAVE" />
              <img ref={reg("i_l3")} src="/82/drops/intravenal-letra-3t.jpg" alt="NAL" />
            </div>
            <article className={styles.iDoc} ref={reg("i_doc")}>
              <div className={styles.iDocA}>
              <p className={styles.iAprov}>Aprovado Para Lançamento 30/01/2026: JODO-AM-SP82-INTRAVENAL-001</p>
              <h3>DEPARTAMENTO DE OPERAÇÕES SONORAS</h3>
              <p className={styles.iGrupo}>GRUPO OPERACIONAL KRAPNEK82 &amp; PHINEA$</p>
              <p className={styles.iGrupo}>COMANDO DE INTELIGÊNCIA E SEGURANÇA DA JODO SETOR 011</p>
              <time>30 Janeiro 2026</time>
              <p className={styles.iAssunto}><b>ASSUNTO:</b> Análise e Avaliação do Processo INTRAVENAL</p>
              </div>
              <div className={styles.iDocB}>
              <p className={styles.iTl}>(TRACKLIST):</p>
              <ol>
                {INTRA_DOC.map((f) => (
                  <li key={f.yt}>
                    <button onClick={() => tocar(f, "akaphineas e KRAPNEK82 · Intravenal")}>
                      <span>({f.l}) {f.t}</span>
                      <i>[{f.h}]</i>
                    </button>
                  </li>
                ))}
              </ol>
              <p className={styles.iDur}>Duração total: 13:57 · 5 rastros · 5 sentidos · 2026</p>
              <a href={SPOTIFY_INTRA} target="_blank" rel="noopener noreferrer" className={styles.ouvirDoc}>ouvir no Spotify ↗</a>
              </div>
            </article>
            <img className={styles.iDiag} ref={reg("i_diag")} src="/82/drops/intravenal-dossie-final.webp" alt="Diagramas do dossiê: The Absolute in Infinity" />
            <blockquote className={styles.iQuote} ref={reg("i_quote")} />
            <div className={styles.iTira} ref={reg("i_tira")}>
              <img className={styles.iFoto1} src="/82/drops/intravenal-tira-1.webp" alt="" />
              {[["i_pan_a", [4, 3, 2]], ["i_pan_b", [7, 6, 5]]].map(([ref, grupo]) => (
                <div key={ref} className={styles.iPan} ref={reg(ref)}>
                  {grupo.map((n, gi) =>
                    mobile ? (
                      <div key={n} className={styles.iTile}>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <span key={i} className={styles.iSlice} style={{ "--s": (((i * 37 + n * 11 + gi * 5) % 9) / 14).toFixed(2) }}>
                            <img src={`/82/drops/intravenal-tira-${n}.webp`} alt="" style={{ marginLeft: `${-i * 100}%`, width: "800%" }} />
                          </span>
                        ))}
                      </div>
                    ) : (
                      <img key={n} className={n === 4 || n === 7 ? styles.iGap : ""} src={`/82/drops/intravenal-tira-${n}.webp`} alt="" />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ---------- HÄXAN ---------- */}
          <div className={styles.cena} ref={reg("haxan")}>
            <img className={styles.xCartaz} ref={reg("x_cartaz")} src="/82/drops/haxan-cartaz-frente.webp" alt="" />
            <div className={styles.xZine}>
              {[[1, 5], [2, 6], [3, 7], [4, 8]].map((par, c) => (
                <div key={c} className={styles.rCol} ref={reg("x_z" + (c + 1))}>
                  {par.map((n) => (
                    <img key={n} src={`/82/drops/zine-${n}.webp`} alt="" />
                  ))}
                </div>
              ))}
            </div>
            <div className={styles.xCapa} ref={reg("x_capa")}>
              <img ref={reg("x_ondas")} src="/82/drops/haxan-ondas.png" alt="" />
              <img ref={reg("x_verm")} src="/82/drops/haxan-vermelho.png" alt="" />
              <img ref={reg("x_verde")} src="/82/drops/haxan-verde.png" alt="" />
              <img ref={reg("x_azul")} src="/82/drops/haxan-azul.png" alt="" />
              <img ref={reg("x_pers")} src="/82/drops/haxan-personagem.webp" alt="82, o personagem de capuz e óculos azuis" />
            </div>
            <p className={styles.xMeta} ref={reg("x_meta")}>Häxan · EP · 2025 · KRAPNEK82</p>
            <img className={styles.xTitulo} ref={reg("x_titulo")} src="/82/drops/haxan-titulo.webp" alt="Häxan" />
            <div className={styles.xLista} ref={reg("x_lista")}>
              <p className={styles.meta}>EP · 2025 · todas produzidas pelo Msor, menos Vertigem, do HeadB</p>
              <ol>
                {HAXAN.map((f) => (
                  <li key={f.yt}>
                    <button onClick={() => tocar(f, `KRAPNEK82 · Häxan · prod. ${f.p}`)}>
                      <span>{f.t}</span>
                      <small>prod. {f.p}</small>
                      {f.clipe && <em>clipe</em>}
                      <b>▶</b>
                    </button>
                  </li>
                ))}
              </ol>
              <a href={SPOTIFY_HAXAN} target="_blank" rel="noopener noreferrer" className={styles.ouvir}>ouvir no Spotify ↗</a>
            </div>
          </div>

          {/* ---------- MUNDO ESTRANHO ---------- */}
          <div className={`${styles.cena} ${styles.mundo}`} ref={reg("mundo")}>
            {Array.from({ length: 18 }, (_, i) => (
              <img key={i} className={styles.mFly} ref={reg("m_f" + i)} src={["/82/drops/mundo-bala.webp", "/82/drops/mundo-bala-6.webp", "/82/drops/mundo-bala-1.webp", "/82/drops/mundo-bala-6.webp", "/82/drops/mundo-bala-2.webp", "/82/drops/mundo-bala-4.webp", "/82/drops/mundo-bala-3.webp"][i % 7]} alt="" />
            ))}
            <img className={styles.mTitulo} ref={reg("m_titulo")} src="/82/drops/mundo-titulo.webp" alt="Mundo Estranho" />
            <img className={styles.mBala} ref={reg("m_bala")} src="/82/drops/mundo-bala.webp" alt="Bala-planeta: um sapo-mundo de olhos arregalados" />
            <p className={styles.mCevas} ref={reg("m_cevas")}>82 &amp; CEVAS</p>
            <div className={styles.mLista} ref={reg("m_lista")}>
              <ol>
                {MUNDO.map((f) => (
                  <li key={f.n}>
                    {f.yt ? (
                      <button onClick={() => tocar({ yt: f.yt, t: f.t }, "82 e Cevas · Mundo Estranho")}>
                        <i>{f.n}.</i> {f.t} <em>clipe ▶</em>
                      </button>
                    ) : (
                      <span>
                        <i>{f.n}.</i> {f.t}
                        {f.feat && <small> (feat. {f.feat})</small>}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <a href={SPOTIFY_MUNDO} target="_blank" rel="noopener noreferrer" className={styles.mOuvir}>ouvir no Spotify ↗</a>
            </div>
            <p className={styles.mFicha} ref={reg("m_ficha")}>
              mixtape · 82 &amp; Cevas · 2023 · instrumentais por Sergio Estranho<br />
              scratch na faixa 1 por DJ Riscólado · mix e master no Rancho Mont Gomer<br />
              Cevas, do Fundão, Portugal · 82, de São Paulo
            </p>
          </div>

          {/* ---------- 2019—2021 ---------- */}
          <div className={`${styles.cena} ${styles.antesCena}`} ref={reg("antes")}>
            <div className={styles.aLista} ref={reg("a_lista")}>
              <div ref={reg("a_inner")} className={styles.aInner}>
              <h2 ref={reg("a_titulo")}>DESTRAVE</h2>
              <p className={styles.aSub}>
                <span>(root@krapnek82)-[~/destrave] $</span> ls -la <b>2019—2021</b>
              </p>
              <div className={styles.aGrupos}>
                {discos.map((d, di) => (
                  <section key={d.id} className={`${styles.aGrupo} ${d.larga ? styles.larga : ""}`} style={{ "--g": di }}>
                    <header>
                      <em>{d.anos}</em>
                      <h3>{d.titulo}</h3>
                      {d.nota && <small>{d.nota}</small>}
                      {d.historia && (
                        <p className={styles.aHistoria}>
                          {d.historia} <Link href="/artistas/rap-delivery">Rap Delivery →</Link>
                        </p>
                      )}
                    </header>
                    <ul>
                      {d.itens.map((i) => (
                        <li key={i.yt}>
                          <button onClick={() => tocar(i, i.quem)}>
                            <img src={thumb(i.yt)} alt="" width="96" height="54" loading="lazy" />
                            <span>
                              <strong>{i.titulo}</strong>
                              <small>{i.quem}</small>
                            </span>
                            {i.views ? <b>{fmt(i.views)}</b> : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Painel82 dados={painel} onTocar={(v) => setTocando({ yt: v.yt, titulo: v.titulo, quem: v.quem })} />

      <footer className={styles.rodape}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Voltar ao topo da página">
          <img src="/82/drops/kos-oito.webp" alt="" />
          <span>voltar ao topo</span>
          <i>↑</i>
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
