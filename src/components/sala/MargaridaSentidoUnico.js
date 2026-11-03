"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { GATO, GATO_VIEWBOX, gatoGrupo } from "@/data/logoGato";
import styles from "@/styles/margarida.module.css";

/*
  MARGARIDA THE CAT: "sentido único".
  Conceito: o céu da capa de (Reality in a) Speeding Cloud, em retícula de jornal, passando a toda velocidade sobre uma
  São Paulo vermelha, com as placas de trânsito da capa penduradas no tempo. As nuvens são geradas em código.

  Estrutura: PALCO FIXO, uma cena inteira por vez. A rolagem só avança a linha do tempo. TODA troca de cena usa a mesma
  assinatura, a "nuvem que passa": uma massa de nuvens em retícula varre a tela da direita para a esquerda, cobre tudo (é
  aí que a cena troca, escondida) e some atrás, como o céu da capa acelerando. Dentro de cada cena, os elementos entram
  com animação própria (cartazes colados, TV que liga, capas que caem, mascote que se desenha).
  Cada [data-sec] recebe --in (entrada do conteúdo 0..1), --l (progresso da cena 0..1) e --d (u - índice).
*/

const SPOTIFY_ARTISTA = "https://open.spotify.com/intl-pt/artist/31DECbEW8piJ1XXK1wPulZ";
const SPOTIFY_SINGLE = "https://open.spotify.com/track/3Bp4JADvs63bPc2oN3z79I";
const IG = "https://www.instagram.com/margarida_thecat/";

const LETRA = [
  "completely out of reach",
  "reality's a thin line",
  "crushing me so hard",
  "i wish i could at least",
  "pretend i'm real",
  "and all i can do is dream",
  "and ask if this world is not for me",
];

const BANDA = [
  { papel: "voz", nome: "Clara Sanches", ig: "claracsanches", v: "voz", rot: -3, cor: "#ff3b30" },
  { papel: "guitarra", nome: "Rafael Filizola", ig: "rafafilizola", v: "rafael", rot: 2.2, cor: "#46d6c0" },
  { papel: "guitarra", nome: "Malcolm Lincoln", ig: "malcolm_dss", v: "malcolm", rot: -1.6, cor: "#b36cff" },
  { papel: "baixo", nome: "Joca Primi", ig: "joca_primi", v: "joca", rot: 3, cor: "#ff7a1a" },
  { papel: "bateria", nome: "Silvio Freitas", ig: "silvi0d", v: "silvio", rot: -2.4, cor: "#e8c53a" },
];

const SHOWS = [
  { d: "21.08.2026", l: "Coletivo Cafundó", v: "tv-cafundo26" },
  { d: "25.01.2026", l: "Ensaio longo", v: "tv-ensaio" },
  { d: "23.11.2025", l: "Fim de Linha / A Venda", v: "tv-fimdelinha" },
  { d: "19.04.2025", l: "Casa Lab", v: "tv-estudio" },
  { d: "08.03.2025", l: "Festival Rock Delas", v: "tv-backstage" },
  { d: "15.02.2025", l: "Coletivo Cafundó", v: "tv-cafundo25" },
];

// vídeos oficiais para assistir completos (enquanto não há show marcado)
const ASSISTA = [
  { id: "Dy3vun2hzpA", t: "In Gloom ao vivo", s: "KNKRockFest" },
  { id: "kz6oFKe24ls", t: "not4u", s: "videoclipe oficial" },
];

const DISCOS = [
  { t: "(Reality in a) Speeding Cloud", a: "2026 · single", img: "single-speeding", url: "https://open.spotify.com/album/2cSOkil6NbhOO6VssyZt27" },
  { t: "Alien Song", a: "2026 · single", img: "alien", url: "https://open.spotify.com/album/2lvpaPUJtOs1JsYrAotfKy" },
  { t: "Human Thoughts", a: "2024 · EP", img: "human", url: "https://open.spotify.com/album/2EjzVxtZaDFEHFjyQxk2g9" },
  { t: "Catnip Stun", a: "2024 · single", img: "catnip", url: "https://open.spotify.com/album/2hLX0wt4YMo8g6dmdFb12y" },
  { t: "In Gloom", a: "2024 · single", img: "gloom", url: "https://open.spotify.com/album/5AmNwZkT7vNlFeRdaOdyIy" },
  { t: "Fanatic Utopia", a: "2023 · single", img: "fanatic", url: "https://open.spotify.com/album/32pZHBboI1Sg1vj3xOrlM3" },
  { t: "not4u", a: "single", img: "not4u", url: "https://open.spotify.com/album/4ZjSSWA7zFCYLDFVxfhgU1" },
];

// ícones de marca (Simple Icons)
const ICONES = {
  Instagram: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  Spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
  YouTube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  Linktree: "m13.73635 5.85251 4.00467-4.11665 2.3248 2.3808-4.20064 4.00466h5.9085v3.30473h-5.9365l4.22865 4.10766-2.3248 2.3338L12.0005 12.099l-5.74052 5.76852-2.3248-2.3248 4.22864-4.10766h-5.9375V8.12132h5.9085L3.93417 4.11665l2.3248-2.3808 4.00468 4.11665V0h3.4727zm-3.4727 10.30614h3.4727V24h-3.4727z",
};
const REDES = [
  { n: "Instagram", href: IG, cor: "#e4405f" },
  { n: "Spotify", href: SPOTIFY_ARTISTA, cor: "#1ed760" },
  { n: "YouTube", href: "https://youtu.be/2nBsbAyGrVM", cor: "#ff0033" },
  { n: "Linktree", href: "https://linktr.ee/margaridathecat", cor: "#43e660" },
];

const N_CENAS = 7;
const JANELA = 0.42; // fração de cada passo gasta na passada de nuvem entre cenas
const TROCA = 0.55; // ponto da passada em que a cena troca (tela toda coberta)

// ---------- ruído (value noise + fbm) ----------
function hash(x, y) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) {
  let s = 0, amp = 0.5;
  for (let i = 0; i < 4; i++) {
    s += amp * vnoise(x, y);
    x *= 2.03; y *= 2.03; amp *= 0.5;
  }
  return s;
}
const suave = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const limita = (x, a, b) => Math.min(b, Math.max(a, x));

// o mascote: gato de cabeça de chama, desenhado traço a traço
function Gato({ className, cor = "#fff", largura = 5 }) {
  return (
    <svg className={className} viewBox={GATO_VIEWBOX} aria-hidden="true" focusable="false">
      {GATO.map((d, i) => (
        <path key={i} d={d} data-g={gatoGrupo(i)} pathLength="1" style={{ "--i": i, stroke: cor, strokeWidth: largura }} />
      ))}
    </svg>
  );
}

// céu em retícula: ruído em movimento desenhado com pontos
function Nuvens({ cor = "#dcdcdc", celula = 11, base = 0.55, className, opacidade = 0.92, acompanhaMouse = true }) {
  const cvRef = useRef(null);
  useEffect(() => {
    const cv = cvRef.current;
    const host = cv && cv.parentElement;
    if (!cv || !host) return;
    const cena = host.closest("[data-sec]");
    const ctx = cv.getContext("2d");
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const PASSOS = 12;
    const sprites = [];
    for (let k = 0; k < PASSOS; k++) {
      const s = document.createElement("canvas");
      s.width = s.height = celula;
      const c = s.getContext("2d");
      c.fillStyle = cor;
      c.beginPath();
      c.arc(celula / 2, celula / 2, ((k + 1) / PASSOS) * celula * 0.66, 0, Math.PI * 2);
      c.fill();
      sprites.push(s);
    }
    let W = 0, H = 0, cols = 0, rows = 0;
    const ajusta = () => {
      const r = host.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      cv.width = W;
      cv.height = H;
      cols = Math.ceil(W / celula) + 1;
      rows = Math.ceil(H / celula) + 1;
    };
    ajusta();
    window.addEventListener("resize", ajusta);
    let t = Math.random() * 50, vento = 1, alvo = 1, raf, ultimo = performance.now(), rolAnt = window.scrollY;

    const desenha = () => {
      ctx.clearRect(0, 0, W, H);
      for (let r = 0; r < rows; r++) {
        const y = r * celula;
        const ny = r * 0.052;
        const baixo = y / H;
        for (let c = 0; c < cols; c++) {
          const n = fbm(c * 0.04 + t, ny) - baixo * 0.16;
          const b = suave(0.4, 0.74, n);
          if (b < 0.06) continue;
          ctx.drawImage(sprites[Math.min(PASSOS - 1, Math.floor(b * PASSOS))], c * celula, y);
        }
      }
    };
    const loop = (agora) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || (cena && cena.dataset.off === "1")) return;
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      if (dt < 1 / 32) return;
      ultimo = agora;
      vento += (alvo - vento) * 0.06;
      t += dt * base * vento;
      desenha();
    };
    if (reduz) desenha();
    else raf = requestAnimationFrame(loop);

    const onMove = (e) => {
      if (acompanhaMouse) alvo = 0.6 + (e.clientX / window.innerWidth) * 1.8;
    };
    const onScroll = () => {
      const v = Math.abs(window.scrollY - rolAnt);
      rolAnt = window.scrollY;
      alvo = Math.min(7, 1 + v * 0.4);
      clearTimeout(onScroll.t);
      onScroll.t = setTimeout(() => (alvo = 1), 160);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", ajusta);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [cor, celula, base, acompanhaMouse]);
  return <canvas ref={cvRef} className={className} style={{ opacity: opacidade }} aria-hidden="true" />;
}

// a passada de nuvem: massa de retícula que cobre a tela e some (a troca de cena fica escondida no meio).
// Cada troca tem a sua: direção, tamanho dos pontos, formato das nuvens, cor da borda e ritmo.
const VARIANTES = [
  null,
  { dir: "l", cel: 12, esc: [0.06, 0.075], seed: 3.7, amp: 0.55, w: 0.2, borda: "#d9d9d9", cob: "#050505", e1: 1.0, e2: 1.0 },
  { dir: "d", cel: 17, esc: [0.04, 0.032], seed: 11.2, amp: 0.7, w: 0.3, borda: "#ff3b30", cob: "#050505", e1: 1.5, e2: 0.7 },
  { dir: "r", cel: 9, esc: [0.16, 0.045], seed: 5.1, amp: 0.5, w: 0.14, borda: "#ffffff", cob: "#050505", e1: 0.7, e2: 1.5 },
  { dir: "dl", cel: 14, esc: [0.05, 0.05], seed: 21.7, amp: 0.65, w: 0.3, borda: "#d9d9d9", cob: "#1a0504", e1: 1.2, e2: 1.2 },
  { dir: "u", cel: 21, esc: [0.03, 0.026], seed: 8.8, amp: 0.8, w: 0.36, borda: "#ffffff", cob: "#050505", e1: 0.8, e2: 0.8 },
  { dir: "l", cel: 11, esc: [0.1, 0.12], seed: 15.3, amp: 0.45, w: 0.12, borda: "#ff3b30", cob: "#050505", e1: 1.6, e2: 0.6 },
];

function Passada({ canvasRef }) {
  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    const sprites = {};
    const sprite = (cor, cel) => {
      const k = cor + cel;
      if (!sprites[k]) {
        const s = document.createElement("canvas");
        s.width = s.height = cel * 2;
        const c = s.getContext("2d");
        c.fillStyle = cor;
        c.beginPath();
        c.arc(cel, cel, cel * 0.9, 0, Math.PI * 2);
        c.fill();
        sprites[k] = s;
      }
      return sprites[k];
    };
    let W = 0, H = 0;
    const grades = {};
    const grade = (idx) => {
      const v = VARIANTES[idx];
      if (!grades[idx]) {
        const cols = Math.ceil(W / v.cel) + 1, rows = Math.ceil(H / v.cel) + 1;
        const ruido = new Float32Array(cols * rows);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) ruido[r * cols + c] = fbm(c * v.esc[0] * (v.cel / 12) + v.seed, r * v.esc[1] * (v.cel / 12) + v.seed * 0.7);
        grades[idx] = { cols, rows, ruido };
      }
      return grades[idx];
    };
    const ajusta = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
      Object.keys(grades).forEach((k) => delete grades[k]);
    };
    ajusta();
    window.addEventListener("resize", ajusta);
    const coord = (dir, x, y) => {
      const fx = x / W, fy = y / H;
      if (dir === "l") return fx;
      if (dir === "r") return 1 - fx;
      if (dir === "d") return 1 - fy;
      if (dir === "u") return fy;
      return (1 - fx + fy) / 2; // dl: sai do canto inferior esquerdo
    };
    cv.desenha = (p, idx) => {
      ctx.clearRect(0, 0, W, H);
      const v = VARIANTES[idx];
      if (!v || p <= 0 || p >= 1) return;
      // ritmo próprio: acelera/desacelera antes e depois do ponto de troca, mantendo a tela toda coberta na troca
      const q = p < TROCA ? TROCA * Math.pow(p / TROCA, v.e1) : 1 - (1 - TROCA) * Math.pow((1 - p) / (1 - TROCA), v.e2);
      const minV = -v.amp / 2, maxV = 1 + v.amp / 2;
      const Tw = (v.w + 0.572 + 0.55 * v.amp - 0.02) / 0.45 + 0.05;
      const L0 = maxV + 0.02, L1 = minV - Tw - 0.02;
      const L = L0 + (L1 - L0) * q;
      const T = L + Tw;
      const { cols, rows, ruido } = grade(idx);
      const cel = v.cel;
      const preto = sprite(v.cob, cel), borda = sprite(v.borda, cel);
      for (let r = 0; r < rows; r++) {
        const y = r * cel - cel * 0.5;
        for (let c = 0; c < cols; c++) {
          const x = c * cel - cel * 0.5;
          const vv = coord(v.dir, c * cel, r * cel) + (ruido[r * cols + c] - 0.5) * v.amp;
          const cob = suave(L, L + v.w, vv) * (1 - suave(T, T + v.w, vv));
          if (cob < 0.04) continue;
          const rp = Math.min(1, cob * 1.35) * cel * 0.95;
          if (rp > 0.5) ctx.drawImage(preto, 0, 0, cel * 2, cel * 2, x + cel - rp, y + cel - rp, rp * 2, rp * 2);
          const bd = Math.sin(Math.min(1, cob) * Math.PI);
          if (bd > 0.08) {
            const rg = bd * cel * 0.62;
            ctx.drawImage(borda, 0, 0, cel * 2, cel * 2, x + cel - rg, y + cel - rg, rg * 2, rg * 2);
          }
        }
      }
    };
    return () => window.removeEventListener("resize", ajusta);
  }, [canvasRef]);
  return null;
}

export default function MargaridaSentidoUnico() {
  const raiz = useRef(null);
  const passadaRef = useRef(null);
  const [show, setShow] = useState(0);
  const [jogoCarregado, setJogoCarregado] = useState(false);

  // rolagem -> linha do tempo (variáveis CSS por cena + passada de nuvem entre cenas)
  useEffect(() => {
    const cenas = [...raiz.current.querySelectorAll("[data-sec]")];
    let raf = 0;
    const calc = () => {
      raf = 0;
      const vh = window.innerHeight;
      const passo = window.matchMedia("(max-width: 900px)").matches ? 1.6 : 1.3;
      const u = window.scrollY / (passo * vh);
      const prog = (i) => (i === 0 ? 1 : limita((u - (i - JANELA)) / JANELA, 0, 1)); // passada que traz a cena i
      let ativa = 0, idxAtiva = 0;
      for (let i = 1; i < cenas.length; i++) if (prog(i) > 0 && prog(i) < 1) { ativa = prog(i); idxAtiva = i; }
      cenas.forEach((el, i) => {
        const visivel = (i === 0 || prog(i) >= TROCA) && (i === cenas.length - 1 || prog(i + 1) < TROCA);
        const hold = limita(u - i + (1 - TROCA) * JANELA, 0, 1);
        el.style.setProperty("--l", hold.toFixed(4));
        el.style.setProperty("--in", limita((hold - 0.17) / 0.22, 0, 1).toFixed(4)); // a entrada só começa quando a nuvem já abriu
        el.style.setProperty("--d", limita(u - i, -1, 2).toFixed(4));
        el.style.setProperty("--c", (limita((hold - 0.2) / 0.52, 0, 1) * 4).toFixed(4)); // índice contínuo (0 a 4) para o baralho da banda
        const antes = el.dataset.off;
        el.dataset.off = visivel ? "0" : "1";
        el.style.visibility = visivel ? "visible" : "hidden";
        if (i === 5 && prog(5) > 0.2) setJogoCarregado(true);
        if (antes !== el.dataset.off) {
          el.querySelectorAll("video").forEach((v) => (visivel ? v.play().catch(() => {}) : v.pause()));
        }
      });
      if (passadaRef.current && passadaRef.current.desenha) passadaRef.current.desenha(ativa, idxAtiva);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  const atual = SHOWS[show];

  return (
    <main className={styles.pagina} ref={raiz}>
      <VoltarJodo />
      <MarcaTopo
        nome="Margarida The Cat"
        cor="#ff3b30"
        emblema={
          <>
            <Gato cor="#fff" largura={7} />
            <i />
            <i />
            <i />
          </>
        }
      />

      <div className={styles.palco}>
        {/* ============ 0. ABERTURA ============ */}
        <section className={`${styles.cena} ${styles.hero}`} data-sec>
          <Nuvens className={styles.nuvens} />
          <div className={styles.vinheta} aria-hidden="true" />
          <div className={styles.camadaCidade}>
            <img className={styles.skyline} src="/mc/skyline.webp" alt="" />
            <img className={styles.placaPendurada} src="/mc/placa-pendurada.webp" alt="" />
            <img className={styles.placaProibido} src="/mc/placa-proibido.webp" alt="" />
          </div>
          <div className={styles.conteudo}>
            <a className={styles.single} href={SPOTIFY_SINGLE} target="_blank" rel="noopener noreferrer" aria-label="Ouvir (Reality in a) Speeding Cloud no Spotify">
              <img src="/mc/letras.png" alt="(reality in a) speeding cloud" />
              <span>novo single · 29.09.2026 ▸ ouvir</span>
            </a>
            <div>
              <h1 className={styles.nome}>
                <span>Margarida</span>
                <span>The Cat</span>
              </h1>
              <p className={styles.linha}>rock alternativo · bela vista, são paulo</p>
            </div>
          </div>
          <p className={styles.rola} aria-hidden="true">rola ↓ sentido único</p>
        </section>

        {/* ============ 1. FAIXA ============ */}
        <section className={`${styles.cena} ${styles.faixa}`} data-sec>
          <Nuvens className={styles.nuvensFaixa} cor="#120505" celula={13} base={0.9} opacidade={0.55} acompanhaMouse={false} />
          <div className={styles.faixaGrid}>
            <div className={styles.capaBloco}>
              <img className={styles.capa} src="/mc/capa.jpg" alt="Capa do single (Reality in a) Speeding Cloud" />
            </div>
            <div className={styles.letra}>
              <p className={styles.rotuloBranco}>a faixa · 3:09</p>
              {LETRA.map((l, i) => (
                <p key={l} className={styles.letraLinha} style={{ "--dir": i % 2 ? 1 : -1 }}>
                  {l}
                </p>
              ))}
              <div className={styles.player}>
                <iframe
                  title="(Reality in a) Speeding Cloud no Spotify"
                  src="https://open.spotify.com/embed/track/3Bp4JADvs63bPc2oN3z79I?utm_source=generator&theme=0"
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============ 2. A BANDA ============ */}
        <section className={`${styles.cena} ${styles.banda}`} data-sec>
          <div className={styles.xadrez} aria-hidden="true" />
          <div className={styles.bandaTopo}>
            <div>
              <p className={styles.rotulo}>a banda</p>
              <h2>cinco pessoas, um barulho só</h2>
            </div>
            <p className={styles.bio}>
              Nascida na Bela Vista, no centro de São Paulo, depois da pandemia, de uma amizade e de um surto de criatividade.
              Do grunge ao rock psicodélico, composição e arranjo coletivos.
            </p>
          </div>
          <div className={styles.posters}>
            {BANDA.map((m, i) => (
              <article key={m.nome} className={styles.poster} style={{ "--i": i, "--rot": `${m.rot}deg`, "--cor": m.cor }}>
                <i className={styles.fita} aria-hidden="true" />
                <h3>{m.papel}</h3>
                <div className={styles.foto}>
                  <video src={`/mc/v/${m.v}.mp4`} muted loop playsInline preload="auto" />
                </div>
                <p className={styles.nomeMembro}>{m.nome}</p>
                <a className={styles.insta} href={`https://www.instagram.com/${m.ig}/`} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONES.Instagram} fill="currentColor" /></svg>
                  @{m.ig}
                </a>
              </article>
            ))}
          </div>
          <div className={styles.pontos} aria-hidden="true">
            {BANDA.map((m, i) => (
              <i key={m.nome} style={{ "--i": i }} />
            ))}
          </div>
        </section>

        {/* ============ 3. SHOWS ============ */}
        <section className={`${styles.cena} ${styles.shows}`} data-sec>
          <div className={styles.showsGrid}>
            <div className={styles.showsLista}>
              <p className={styles.rotulo}>ao vivo</p>
              <h2>noites que ficaram</h2>
              <ul>
                {SHOWS.map((s, i) => (
                  <li key={s.d + s.l}>
                    <button className={i === show ? styles.showAtivo : ""} onMouseEnter={() => setShow(i)} onFocus={() => setShow(i)} onClick={() => setShow(i)}>
                      <b>{s.d}</b>
                      <span>{s.l}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className={styles.assista}>
                <p className={styles.rotulo}>assista inteiro</p>
                {ASSISTA.map((v) => (
                  <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">
                    <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" />
                    <span>
                      <b>{v.t}</b>
                      <small>{v.s}</small>
                    </span>
                    <i aria-hidden="true">▸</i>
                  </a>
                ))}
              </div>
            </div>
            <div className={styles.tv}>
              <div className={styles.tvTela}>
                <video key={atual.v} src={`/mc/v/${atual.v}.mp4`} muted loop playsInline autoPlay />
                <span className={styles.tvRec}>● rec {atual.d}</span>
                <span className={styles.tvCanal}>CH 0{show + 1}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 4. DISCOS ============ */}
        <section className={`${styles.cena} ${styles.discos}`} data-sec>
          <div className={styles.mural}>
            {DISCOS.map((d, i) => (
              <a key={d.t} className={styles.disco} href={d.url} target="_blank" rel="noopener noreferrer" style={{ "--i": i }}>
                <img src={`/mc/capas/${d.img}.jpg`} alt={`Capa: ${d.t}`} loading="lazy" />
                <span>{d.t}</span>
                <em>{d.a}</em>
              </a>
            ))}
            <div className={styles.discosTitulo}>
              <p className={styles.rotuloBranco}>discografia</p>
              <h2>tudo que já saiu</h2>
              <a className={styles.pilula} href={SPOTIFY_ARTISTA} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONES.Spotify} fill="currentColor" /></svg>
                ouvir no Spotify
              </a>
            </div>
          </div>
        </section>

        {/* ============ 5. O JOGO (de outra pessoa, mostrado com crédito) ============ */}
        <section className={`${styles.cena} ${styles.jogoCena}`} data-sec>
          <Nuvens className={styles.nuvensJogo} cor="#d8231a" celula={14} base={0.7} opacidade={0.5} acompanhaMouse={false} />
          <div className={styles.jogoGrid}>
            <div className={styles.jogoTexto}>
              <p className={styles.rotulo}>o jogo</p>
              <h2>
                quem aí quer o <em>margarida no metrô</em>?
              </h2>
              <ol className={styles.metroLinha}>
                <li><small>jogo</small><b>Margarida no Metrô</b></li>
                <li><small>feito por</small><b><a href="https://www.instagram.com/akira.gmg/" target="_blank" rel="noopener noreferrer">@akira.gmg</a></b></li>
                <li><small>trilha</small><b>(Reality in a) Speeding Cloud</b></li>
                <li><small>status</small><b>em desenvolvimento</b></li>
              </ol>
              <a className={styles.botaoJogo} href="https://www.instagram.com/margarida_thecat/reel/DeNXDzqy3Pv/" target="_blank" rel="noopener noreferrer">
                ver no Instagram ▸
              </a>
            </div>
            <div className={styles.jogoTela}>
              {jogoCarregado ? (
                <iframe
                  title="Margarida no Metrô, vídeo do jogo no Instagram"
                  src="https://www.instagram.com/reel/DeNXDzqy3Pv/embed"
                  allowFullScreen
                  scrolling="no"
                />
              ) : (
                <div className={styles.jogoCapa}>
                  <span className={styles.jogoPlay}>▶</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============ 6. FINAL ============ */}
        <section className={`${styles.cena} ${styles.final}`} data-sec>
          <Nuvens className={styles.nuvensFinal} base={0.4} opacidade={0.5} acompanhaMouse={false} />
          <div className={styles.finalTexto}>
            <Gato className={styles.gatoFinal} cor="#fff" largura={4} />
            <p className={styles.faixaFinal}>o céu continua passando.</p>
            <p className={styles.adesivo}>artistas e coletivos pela democracia</p>
            <nav className={styles.redes} aria-label="Margarida The Cat nas redes">
              {REDES.map((r) => (
                <a key={r.n} href={r.href} target="_blank" rel="noopener noreferrer" aria-label={r.n} title={r.n} style={{ "--marca": r.cor }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONES[r.n]} fill="currentColor" /></svg>
                </a>
              ))}
            </nav>
            <button className={styles.paraCima} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              voltar para cima ↑
            </button>
          </div>
          <div className={styles.cidadeFinal}>
            <div className={styles.prediosFaixa}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <img key={i} src="/mc/predios.webp" alt="" style={i % 2 ? { transform: "scaleX(-1)" } : undefined} />
              ))}
            </div>
            <img className={styles.placaFinal1} src="/mc/placa-pendurada.webp" alt="" />
            <img className={styles.placaFinal2} src="/mc/placa-proibido.webp" alt="" />
          </div>
        </section>

        <canvas ref={passadaRef} className={styles.passada} aria-hidden="true" />
        <Passada canvasRef={passadaRef} />
      </div>
    </main>
  );
}
