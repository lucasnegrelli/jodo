"use client";

import { useEffect, useRef, useState } from "react";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { DISCO, TOP, OUVINTES, DUP } from "@/data/lum3Disco";
import { ICONES } from "@/data/iconesMarca";
import styles from "@/styles/lum3k.module.css";

/*
  1LUM3 (v3 "PROJETOS", fora do mapa até o Lucas aprovar).
  A página é construída a partir das capas dos PROJETOS dela (álbuns, EPs e os singles com arte própria), do mais novo ao mais
  antigo, cada um com o mundo da própria capa: o ocre do álbum de 2026, o vermelho do single, o branco do instante-já,
  a colagem de centro parte II, o tom de pele de FIDELIO, o preto de antinomia (onde mora "deep down", com Baco Exu do Blues)
  e o âmbar da lâmpada de waters, o primeiro EP, de 2018 (com os clipes que a JODO fez dele).
  Cada seção entra de um jeito: tinta que nasce do mouse, rasgo de papel, luz, nuvens, cortina, persiana, água subindo, pingos...
  As pinturas respiram com um shader (WebGL). O nome dela nunca é escrito: é sempre o logotipo, em tamanho grande.
  As capas vêm do Spotify por link direto. O Instagram de colagens (@arquivofluxo) é a arte pessoal dela, não a identidade do site.
*/

const CDN = "https://i.scdn.co/image/ab67616d0000b273";

// colunas de cada letra do logotipo (1 L U M 3) em /lum3/l1.png ... l5.png; o emblema do cabeçalho as acende uma por uma
const LETRAS = [[0, 110], [120, 240], [255, 399], [420, 660], [674, 818]];

const DEEP = TOP.find((t) => t.t === "deep down");
const TOP_DELA = TOP.filter((t) => t.t !== "deep down").slice(0, 3);

// cada capítulo é um projeto. `efeito` é como a seção entra; `cor` é a mancha.
const LANC = [
  {
    id: "album", ano: "2026", tipo: "álbum", titulo: "Um estudo sobre|os nossos tropeços",
    sp: "1W8IOFuLxa6qGijUjBCdw3", capa: CDN + "e5bb61d9777b3119b822dd03", cor: "#c8921a", efeito: "tinta",
    ficha: [["lançamento", "2026"], ["formato", "álbum · 7 faixas · 22 min"], ["com", "Beli Remour, pibara e FRAJ"]],
    faixas: [["E quando eu me cansar de tudo? (Tudo que você não viu)", "3:14"], ["Deslizes, memórias, detalhes & infinitos", "4:02"], ["Explicando o céu", "5:14"],
             ["As Guitarras do Fim do Mundo (Skit)", "0:40"], ["Venenos inofensivos", "3:38"], ["No teto da boca", "5:01"], ["Fim", "0:40"]],
  },
  {
    id: "cansar", ano: "2026", tipo: "single", titulo: "E quando eu me cansar de tudo?", sub: "(tudo que você não viu)",
    sp: "74fVYwlkNocYi8moLkIhno", capa: CDN + "55b4af8db0f34e2a8bdc23ea", cor: "#a31f17", efeito: "rasgo",
    ficha: [["lançamento", "2026"], ["duração", "3:14"], ["faixa 01 do álbum", "Um estudo sobre os nossos tropeços"], ["com", "Beli Remour"]], faixas: [],
  },
  {
    id: "ep", ano: "2026", tipo: "ep", titulo: "instante-já",
    sp: "2lW0wS0UHQ11Q2prcG6OnO", capa: null, cor: "#ffffff", efeito: "luz",
    ficha: [["lançamento", "16.06.2026"], ["formato", "EP · 6 faixas · 17 min"], ["com", "d4crvz e GUS"]],
    faixas: [["centro parte I", "3:16"], ["efêmero", "2:39"], ["estrago · com d4crvz", "4:16"], ["sina", "2:01"], ["neon", "1:50"], ["sem antes, nem depois · com GUS", "3:17"]],
  },
  {
    id: "centro", ano: "2025", tipo: "single", titulo: "centro parte II",
    sp: "23pudiOCn8YnqSoP5R6iaJ", capa: "/lum3/ceu-cidade.webp", cor: "#cbbba5", efeito: "nuvens",
    ficha: [["lançamento", "24.01.2025"], ["duração", "3:12"], ["produção", "domrafa"], ["capa", "colagem da JODO"]], faixas: [], visualizer: 0,
  },
  {
    id: "fidelio", ano: "2021", tipo: "ep", titulo: "FIDELIO",
    sp: "3qISPbB5vtiv6QwGcrC1Y4", capa: CDN + "6276cf9f4d486b58cad0a0bd", cor: "#8a5a47", efeito: "cortina",
    ficha: [["lançamento", "15.07.2021"], ["formato", "EP · 6 faixas · 17 min"]],
    faixas: [["a coisa mais perto", "3:01"], ["lovecrime", "3:41"], ["jay vaquer", "2:38"], ["pêndulo", "2:43"], ["de olhos bem fechados", "2:32"], ["basta", "2:13"]],
  },
  {
    id: "antinomia", ano: "2019", tipo: "álbum", titulo: "antinomia",
    sp: "3JB05mV6vyTS6yd8MibwsD", capa: CDN + "ec372d1959b1c38637dc7358", cor: "#0c0c0c", efeito: "persiana",
    ficha: [["lançamento", "05.07.2019"], ["formato", "álbum · 13 faixas · 44 min"], ["com", "Baco Exu do Blues, Tuyo, LIEV e Rodrigo Zin"]],
    destaque: { n: DEEP.n, t: "plays em “deep down”, com Baco Exu do Blues (faixa 06)" },
    faixas: [["(passadopresentefuturo)", "3:24"], ["2", "0:51"], ["burning eyes", "3:19"], ["a coisa mais distante", "2:34"], ["vazio", "4:06"], ["deep down · com Baco Exu do Blues", "3:27"],
             ["clímax", "4:18"], ["antinomia", "3:12"], ["panorâmica · com Tuyo e LIEV", "4:03"], ["up to you", "1:22"], ["meu bem, meu mal", "3:53"], ["corpo fechado · com Rodrigo Zin", "3:08"], ["sil^ncio", "6:17"]],
  },
  {
    id: "waters", ano: "2018", tipo: "primeiro ep", titulo: "waters",
    sp: "6PGNlGRVbqYQLPWdAQ61Im", capa: CDN + "d1d6ba7c514bb1a1f7eb35b5", cor: "#2b2f31", efeito: "ondas",
    ficha: [["lançamento", "11.01.2018"], ["formato", "EP · 6 faixas · 22 min"], ["com", "LIEV (em todas as faixas)"], ["na JODO", "cabo polonio e first untitled viraram clipe"]],
    faixas: [["vacuum", "2:10"], ["cabo polonio", "3:15"], ["like me", "3:38"], ["first untitled", "3:31"], ["that day", "3:42"], ["waters", "5:34"]],
    clipes: [{ i: 6, t: "ver cabo polonio" }, { i: 4, t: "ver the first untitled" }],
  },
];

const VIDEOS = [
  { yt: "xkMMy2l6K60", t: "centro parte II · visualizer", a: "2025", d: "prod. domrafa" },
  { yt: "s0SZfnLEoR4", t: "S01EP01 · na idade da pedra era assim", a: "2025", d: "" },
  { yt: "Bi9I-xs-lXQ", t: "sonhos de ícaro", a: "2025", d: "com akaphineas" },
  { yt: "MC_RX-io2JM", t: "JODO no Cafundó", a: "2025", d: "30/05/25" },
  { yt: "38-ei08eocA", t: "the first untitled", a: "2019", d: "prod. liev · shot by JODO" },
  { yt: "RYqfqbxcpX8", t: "$OMBRA$", a: "2019", d: "com 82 e OLX · prod. PRIMATA" },
  { yt: "laSYG5S6At8", t: "cabo polonio", a: "2018", d: "", z: 1.42 },
  { yt: "GaihH1exUVE", t: "limbo", a: "2018", d: "" },
  { yt: "sF0aPA176iw", t: "BOLHA", a: "2018", d: "com D4CRVZ e CIANO" },
  { yt: "kfRkbKFKS9w", t: "live id", a: "2018", d: "com Matheus Coringa" },
];

const ART = "https://open.spotify.com/intl-pt/artist/01JSyuJJh1WCHIuM3Zx7hn";
const LINK_TOP = {
  "Promessas": "https://open.spotify.com/intl-pt/album/0KDsIQQPFD46WurwJt9XlM",
  "Flor de Alcaçúz": "https://open.spotify.com/intl-pt/album/0kFCWEhvIaoJAtVTqyM5by",
};

const REDES = [
  { r: "Instagram", u: "https://www.instagram.com/1lum3/" },
  { r: "Spotify", u: "https://open.spotify.com/intl-pt/artist/01JSyuJJh1WCHIuM3Zx7hn" },
  { r: "YouTube", u: "https://www.youtube.com/1lum3" },
  { r: "Twitch", u: "https://www.twitch.tv/1lum3" },
  { r: "Guilhotina, o blog", u: "https://guilhotina.wordpress.com/" },
  { r: "@arquivofluxo", u: "https://www.instagram.com/arquivofluxo/" },
];

// ícones de rede (cor da marca): Simple Icons do site, mais Twitch e um lápis (blog)
const P_TWITCH = "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z";
const P_LAPIS = "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z";
const MARCA = {
  "Instagram": { p: ICONES.Instagram, c: "#E4405F" },
  "Spotify": { p: ICONES.Spotify, c: "#1DB954" },
  "YouTube": { p: ICONES.YouTube, c: "#FF0000" },
  "Twitch": { p: P_TWITCH, c: "#9146FF" },
  "Guilhotina, o blog": { p: P_LAPIS, c: "#21759B" },
  "@arquivofluxo": { p: ICONES.Instagram, c: "#E4405F", legenda: "fluxo" },
};

// seções que não são projetos
const EXTRA = [
  { id: "numeros", cor: "#222222", efeito: "pingos" },
  { id: "discografia", cor: "#e9e4d8", efeito: "subir" },
  { id: "videos", cor: "#0b0b0b", efeito: "iris" },
];
const SECOES = [...LANC.map((l) => ({ id: l.id, cor: l.cor, efeito: l.efeito })), ...EXTRA];
const COR = SECOES.map((x) => x.cor);
const idx = (id) => SECOES.findIndex((x) => x.id === id) + 1;

const fmt = (n) => n.toLocaleString("pt-BR");

// mancha de tinta: polígono de borda irregular que cresce a partir de (cx, cy)
function mancha(cx, cy, R, seed) {
  const pts = [];
  const N = 64;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2;
    const r = R * (1 + 0.1 * Math.sin(3 * a + seed) + 0.06 * Math.sin(7 * a - seed * 1.7) + 0.03 * Math.sin(13 * a + seed * 2.3));
    pts.push(`${(cx + Math.cos(a) * r).toFixed(0)}px ${(cy + Math.sin(a) * r).toFixed(0)}px`);
  }
  return `polygon(${pts.join(",")})`;
}

// rasgo diagonal com borda de papel rasgado que varre a tela
function rasgo(e, vw, vh) {
  const pts = ["0px 0px"];
  const N = 22;
  const x0 = -0.3 * vw + e * 1.6 * vw;
  for (let k = 0; k <= N; k++) {
    const y = (k / N) * vh;
    const jit = Math.sin(k * 12.9898) * 26 + Math.sin(k * 3.1) * 14;
    pts.push(`${(x0 + (y / vh) * 0.22 * vw + jit).toFixed(0)}px ${y.toFixed(0)}px`);
  }
  pts.push(`0px ${vh}px`);
  return `polygon(${pts.join(",")})`;
}

// água subindo: a borda de cima é uma onda
function ondas(e, vw, vh) {
  const base = (1 - e) * (vh + 90) - 40;
  const pts = [`0px ${vh}px`];
  for (let x = 0; x <= vw + 40; x += 40) pts.push(`${x}px ${(base + Math.sin(x / 85 + e * 9) * 30 + Math.sin(x / 31 - e * 5) * 8).toFixed(0)}px`);
  pts.push(`${vw}px ${vh}px`);
  return `polygon(${pts.join(",")})`;
}

const MASC = (g) => ({ maskImage: g, WebkitMaskImage: g });

// a curva e a distância de rolagem de cada efeito: cada um entra num ritmo
const RITMO = {
  tinta: { faixa: 0.85, curva: (p) => p * p * (3 - 2 * p) },
  rasgo: { faixa: 0.55, curva: (p) => p * p },
  luz: { faixa: 1.15, curva: (p) => 1 - Math.pow(1 - p, 3) },
  nuvens: { faixa: 0.95, curva: (p) => p * p * (3 - 2 * p) },
  cortina: { faixa: 0.6, curva: (p) => 1 - Math.pow(1 - p, 3) },
  persiana: { faixa: 0.8, curva: (p) => p * p * (3 - 2 * p) },
  ondas: { faixa: 0.9, curva: (p) => p },
  pingos: { faixa: 0.6, curva: (p) => 1 - Math.pow(1 - p, 2) },
  subir: { faixa: 0.7, curva: (p) => p },
  iris: { faixa: 0.95, curva: (p) => p * p * (3 - 2 * p) },
};

// trocas de cor SEM corte seco: toda borda é um degradê largo (a cor nova vai tomando a tela), e cada seção ainda entra
// de um lugar e num ritmo diferentes (mouse, esquerda, cima, baixo, centro, vários pontos, bordas)
function aplicaEntrada(m, efeito, e, vw, vh, ptr, seed) {
  const R = Math.hypot(vw, vh);
  m.style.clipPath = "none"; m.style.maskImage = ""; m.style.webkitMaskImage = "";
  if (e <= 0) { m.style.clipPath = "circle(0px at 0 0)"; return; }
  if (e >= 0.995) { m.style.clipPath = "inset(0)"; return; }
  const F = 30; // largura do degradê, em % do caminho (borda macia, sem corte seco)
  const linha = (dir) => {
    const pos = e * (100 + F);
    return `linear-gradient(${dir}, #000 0%, #000 ${Math.max(0, pos - F).toFixed(1)}%, transparent ${pos.toFixed(1)}%)`;
  };
  // mancha que nasce NA POSIÇÃO ATUAL do mouse e o acompanha enquanto a seção chega
  const mancha = (x, y, k = 1) => {
    const r = e * R * 1.45 * k;
    return `radial-gradient(circle at ${x}px ${y}px, #000 0, #000 ${(r * 0.55).toFixed(0)}px, transparent ${r.toFixed(0)}px)`;
  };
  const px = ptr.x.toFixed(0), py = ptr.y.toFixed(0);
  let g;
  if (efeito === "tinta") g = mancha(px, py); // de onde está o mouse
  else if (efeito === "rasgo") g = `linear-gradient(to right, #000 0%, #000 ${Math.max(0, e * (100 + F) - F).toFixed(1)}%, transparent ${(e * (100 + F)).toFixed(1)}%)`; // da esquerda
  else if (efeito === "ondas" || efeito === "subir") g = linha("to top"); // de baixo
  else if (efeito === "persiana") g = linha("to bottom"); // de cima
  else if (efeito === "luz") g = mancha(px, (-vh * 0.1).toFixed(0), 1.1); // luz que vaza de cima, na altura do mouse
  else if (efeito === "cortina") { // abre a partir da posição horizontal do mouse
    const h = Math.max(e * 100, 0.01);
    const c = (ptr.x / vw) * 100;
    g = `linear-gradient(90deg, transparent ${(c - h).toFixed(1)}%, #000 ${(c - h * 0.3).toFixed(1)}%, #000 ${(c + h * 0.3).toFixed(1)}%, transparent ${(c + h).toFixed(1)}%)`;
  } else if (efeito === "nuvens") { // vários pontos de baixo, o do meio acompanha o mouse
    g = [8, 27, 46, 64, 82, 96].map((x, k) => mancha(k === 2 ? px : (vw * x / 100).toFixed(0), (vh * (1.08 - (k % 3) * 0.05)).toFixed(0), 0.6 + (k % 4) * 0.12)).join(",");
  } else if (efeito === "pingos") { // vários pontos; o mouse é um deles
    const pts = [[ptr.x, ptr.y], [vw * 0.12, vh * 0.24], [vw * 0.88, vh * 0.18], [vw * 0.7, vh * 0.82], [vw * 0.28, vh * 0.74]];
    g = pts.map(([x, y], k) => mancha(x.toFixed(0), y.toFixed(0), 0.5 + k * 0.07)).join(",");
  } else { // íris: a cor vem das bordas para o mouse
    const r = (1 - e) * R * 0.8;
    g = `radial-gradient(circle at ${px}px ${py}px, transparent ${(r * 0.5).toFixed(0)}px, #000 ${(r + 40).toFixed(0)}px)`;
  }
  Object.assign(m.style, MASC(g));
}

const VERT = "attribute vec2 p;varying vec2 uv;void main(){uv=p*0.5+0.5;uv.y=1.0-uv.y;gl_Position=vec4(p,0.0,1.0);}";
const FRAG = `precision mediump float;uniform sampler2D t;uniform float time;uniform vec2 m;uniform float h;varying vec2 uv;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 q=uv;float a=nz(q*4.0+time*0.12),b=nz(q*9.0-time*0.09);vec2 d=vec2(a-0.5,b-0.5)*0.011;
float dist=distance(q,m);float rip=exp(-dist*6.5)*h;vec2 dir=normalize(q-m+vec2(0.0001));
d+=dir*sin(dist*34.0-time*3.2)*0.013*rip+(vec2(nz(q*14.0+time*0.4),nz(q*14.0-time*0.4))-0.5)*0.02*rip;
float sh=rip*0.006;vec4 c=texture2D(t,q+d);c.r=texture2D(t,q+d+vec2(sh,0.0)).r;c.b=texture2D(t,q+d-vec2(sh,0.0)).b;gl_FragColor=vec4(c.rgb,1.0);}`;

// pintura que se deforma como tinta molhada onde o mouse passa; se o WebGL falhar, fica a imagem comum
function Pintura({ src, alt }) {
  const cv = useRef(null);
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    let raf = 0, vivo = true, visivel = false;
    const gl = c.getContext("webgl", { antialias: false });
    if (!gl) return;
    const sh = (tipo, fonte) => { const s = gl.createShader(tipo); gl.shaderSource(s, fonte); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const tex = gl.createTexture();
    const img = new Image();
    img.crossOrigin = "anonymous";
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, h = 0, ht = 0;
    const tam = () => {
      const r = c.getBoundingClientRect();
      const d = Math.min(2, devicePixelRatio || 1);
      c.width = Math.max(2, Math.round(r.width * d)); c.height = Math.max(2, Math.round(r.height * d));
      gl.viewport(0, 0, c.width, c.height);
    };
    const move = (e) => {
      const r = c.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height;
      ht = tx >= 0 && tx <= 1 && ty >= 0 && ty <= 1 ? 1 : 0;
    };
    const quadro = (t) => {
      if (!vivo) return;
      mx += (tx - mx) * 0.12; my += (ty - my) * 0.12; h += (ht - h) * 0.07;
      if (visivel) {
        gl.uniform1f(U("time"), t / 1000); gl.uniform2f(U("m"), mx, my); gl.uniform1f(U("h"), h);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(quadro);
    };
    img.onload = () => {
      try {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(U("t"), 0);
        tam();
        setPronto(true);
        raf = requestAnimationFrame(quadro);
      } catch (e) { /* imagem sem CORS: fica a imagem comum */ }
    };
    img.src = src;
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { rootMargin: "100px" });
    io.observe(c);
    addEventListener("pointermove", move);
    addEventListener("resize", tam);
    return () => { vivo = false; cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", move); removeEventListener("resize", tam); };
  }, [src]);
  return (
    <div className={styles.pintura}>
      <img src={src} alt={alt} crossOrigin="anonymous" loading="lazy" />
      <canvas ref={cv} className={pronto ? styles.vivo : ""} aria-hidden="true" />
    </div>
  );
}

const AGUA_FRAG = `precision highp float;
uniform float time; uniform vec2 res; uniform vec3 rip[5];
void main(){
  vec2 uv = gl_FragCoord.xy / res.xy;
  vec2 q = vec2(uv.x * res.x / res.y, uv.y);
  float t = time * 0.16 + 23.0;
  vec2 p = mod(q * 6.28318 * 0.9, 6.28318) - 250.0;
  vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 5; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 5.0; c = 1.17 - pow(c, 1.4);
  float caus = pow(abs(c), 8.0);
  float a = clamp(caus, 0.0, 1.0) * 0.13;
  for (int k = 0; k < 5; k++) {
    float age = time - rip[k].z;
    if (age > 0.0 && age < 5.0) {
      float d = distance(q, vec2(rip[k].x * res.x / res.y, rip[k].y));
      float ring = sin(d * 38.0 - age * 5.0) * exp(-age * 0.9) * exp(-d * 2.6);
      a += max(ring, 0.0) * 0.08;
    }
  }
  vec3 tint = vec3(0.70, 0.86, 0.90);
  gl_FragColor = vec4(tint * a, a);
}`;

// fundo de água: canvas WebGL atrás da seção, bem sutil; o mouse faz ondulações
function AguaFundo() {
  const cv = useRef(null);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const gl = c.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    const sh = (tipo, fonte) => { const x = gl.createShader(tipo); gl.shaderSource(x, fonte); gl.compileShader(x); return x; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, AGUA_FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(pr, "time"), uR = gl.getUniformLocation(pr, "res"), uP = gl.getUniformLocation(pr, "rip");
    const ondas = new Float32Array(15).fill(0);
    for (let k = 0; k < 5; k++) ondas[k * 3 + 2] = -99;
    let prox = 0, ultimo = 0, visivel = false, raf = 0, vivo = true;
    const t0 = performance.now();
    const tam = () => {
      const r = c.getBoundingClientRect();
      const esc = 0.6; // meia resolução: é um fundo suave e fica leve
      c.width = Math.max(2, Math.round(r.width * esc)); c.height = Math.max(2, Math.round(r.height * esc));
      gl.viewport(0, 0, c.width, c.height);
    };
    tam();
    const move = (e) => {
      const r = c.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      const agora = performance.now();
      if (agora - ultimo < 260) return;
      ultimo = agora;
      ondas[prox * 3] = (e.clientX - r.left) / r.width;
      ondas[prox * 3 + 1] = 1 - (e.clientY - r.top) / r.height;
      ondas[prox * 3 + 2] = (agora - t0) / 1000;
      prox = (prox + 1) % 5;
    };
    const quadro = (agora) => {
      if (!vivo) return;
      if (visivel) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uT, (agora - t0) / 1000);
        gl.uniform2f(uR, c.width, c.height);
        gl.uniform3fv(uP, ondas);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(quadro);
    };
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { rootMargin: "80px" });
    io.observe(c);
    addEventListener("pointermove", move);
    addEventListener("resize", tam);
    raf = requestAnimationFrame(quadro);
    return () => { vivo = false; cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", move); removeEventListener("resize", tam); };
  }, []);
  return <canvas ref={cv} className={styles.agua} aria-hidden="true" />;
}

// estado compartilhado entre o loop de rolagem e o fundo fluido (WebGL)
const ESTADO = { ok: false, i: 0, e: 0, fx: 0, x: 0, y: 0, sujo: true };
const FX = { tinta: 0, rasgo: 1, ondas: 2, subir: 3, persiana: 4, luz: 5, cortina: 6, nuvens: 7, pingos: 8, iris: 9 };
const hexv = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

const FUNDO_FRAG = `precision highp float;
uniform vec2 res; uniform float time; uniform float e; uniform int fx; uniform vec3 cA; uniform vec3 cB; uniform vec2 pm;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1.0,0.0)),f.x),mix(hs(i+vec2(0.0,1.0)),hs(i+vec2(1.0,1.0)),f.x),f.y);}
float fbm(vec2 p){float v=0.0;float a=0.5;for(int k=0;k<4;k++){v+=a*vn(p);p*=2.03;a*=0.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/res; float asp=res.x/res.y; vec2 q=vec2(uv.x*asp,uv.y); vec2 P=vec2(pm.x*asp,pm.y);
  float diag=length(vec2(asp,1.0)); float d=0.0;
  if(fx==0) d=distance(q,P)/diag;
  else if(fx==1) d=uv.x;
  else if(fx==2) d=uv.y+0.04*sin(uv.x*11.0+time*0.8);
  else if(fx==3) d=uv.y;
  else if(fx==4) d=1.0-uv.y;
  else if(fx==5) d=distance(q,vec2(P.x,1.12))/diag;
  else if(fx==6) d=abs(uv.x-pm.x)*1.35;
  else if(fx==7){
    d=distance(q,vec2(asp*0.1,-0.08));
    d=min(d,distance(q,vec2(asp*0.3,-0.12)));
    d=min(d,distance(q,vec2(P.x,-0.1)));
    d=min(d,distance(q,vec2(asp*0.72,-0.12)));
    d=min(d,distance(q,vec2(asp*0.92,-0.08)));
    d=d/(diag*0.85);
  } else if(fx==8){
    d=distance(q,P);
    d=min(d,distance(q,vec2(asp*0.12,0.76)));
    d=min(d,distance(q,vec2(asp*0.88,0.82)));
    d=min(d,distance(q,vec2(asp*0.7,0.18)));
    d=min(d,distance(q,vec2(asp*0.28,0.26)));
    d=d/(diag*0.6);
  } else d=1.0-distance(q,P)/diag;
  vec2 w=q*2.2+vec2(time*0.04,-time*0.03);
  float n=(fbm(w)-0.5)*2.0;
  float n2=fbm(w*2.1+7.0)-0.5;
  float amp=(fx==2)?0.17:0.12;
  float v=d+n*amp+n2*amp*0.45+amp*1.2;
  float F=0.2;
  float t=e*(1.0+F+amp*2.8);
  float m=1.0-smoothstep(t-F,t,v);
  gl_FragColor=vec4(mix(cA,cB,m),1.0);
}`;

function FundoFluido() {
  const cv = useRef(null);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const gl = c.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;
    const sh = (tipo, fonte) => { const x = gl.createShader(tipo); gl.shaderSource(x, fonte); gl.compileShader(x); return x; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FUNDO_FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const tam = () => {
      const esc = 0.5; // campos suaves: meia resolução é suficiente e fica leve
      c.width = Math.max(2, Math.round(innerWidth * esc)); c.height = Math.max(2, Math.round(innerHeight * esc));
      gl.viewport(0, 0, c.width, c.height);
      ESTADO.sujo = true;
    };
    tam();
    ESTADO.ok = true;
    const t0 = performance.now();
    let raf = 0, vivo = true;
    const quadro = (agora) => {
      if (!vivo) return;
      const ativo = ESTADO.i > 0;
      c.style.opacity = ativo ? "1" : "0";
      if (ativo && (ESTADO.sujo || (ESTADO.e > 0 && ESTADO.e < 0.995))) {
        const a = hexv(ESTADO.i > 1 ? COR[ESTADO.i - 2] : "#0b0b0b");
        const b = hexv(COR[ESTADO.i - 1]);
        gl.uniform2f(U("res"), c.width, c.height);
        gl.uniform1f(U("time"), (agora - t0) / 1000);
        gl.uniform1f(U("e"), ESTADO.e >= 0.995 ? 2 : ESTADO.e);
        gl.uniform1i(U("fx"), ESTADO.fx);
        gl.uniform3f(U("cA"), a[0], a[1], a[2]);
        gl.uniform3f(U("cB"), b[0], b[1], b[2]);
        gl.uniform2f(U("pm"), ESTADO.x / innerWidth, 1 - ESTADO.y / innerHeight);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        ESTADO.sujo = ESTADO.e < 0.995 ? true : false;
      }
      raf = requestAnimationFrame(quadro);
    };
    raf = requestAnimationFrame(quadro);
    addEventListener("resize", tam);
    return () => { vivo = false; ESTADO.ok = false; cancelAnimationFrame(raf); removeEventListener("resize", tam); };
  }, []);
  return <canvas ref={cv} className={styles.fundoFluido} aria-hidden="true" />;
}

// número que sobe até o valor quando entra na tela
function Conta({ valor, className }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, feito = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || feito) return;
      feito = true;
      const t0 = performance.now(), dur = 1700;
      const passo = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        setV(Math.round(valor * (1 - Math.pow(1 - k, 4))));
        if (k < 1) raf = requestAnimationFrame(passo);
      };
      raf = requestAnimationFrame(passo);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [valor]);
  return <span ref={ref} className={className}>{fmt(v)}</span>;
}

export default function Lum3Capas() {
  const raiz = useRef(null);
  const [toca, setToca] = useState(null);
  const [gaveta, setGaveta] = useState(null);
  const [vsel, setVsel] = useState(0);
  const [vplay, setVplay] = useState(false);
  const [vhov, setVhov] = useState(null);
  const lista = useRef(null);
  const logoG = useRef(null);
  const pulaLogo = () => {
    const el = logoG.current;
    if (!el) return;
    el.classList.remove(styles.pula);
    void el.offsetWidth;
    el.classList.add(styles.pula);
    setTimeout(() => el.classList.remove(styles.pula), 1400);
  };
  const [rost, setRost] = useState({ x: 0, y: 0 });
  const [rostoOn, setRostoOn] = useState(false);
  const [acesa, setAcesa] = useState(false);
  const [naParede, setNaParede] = useState(false);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const manchas = [...el.querySelectorAll("[data-mancha]")];
    const secoes = [...el.querySelectorAll("[data-cap]")].filter((s) => +s.dataset.cap >= 1);
    const ptr = { x: innerWidth * 0.3, y: innerHeight * 0.55 };
    const centro = {};
    let raf = 0;
    const move = (e) => { ptr.x = e.clientX; ptr.y = e.clientY; if (!raf) raf = requestAnimationFrame(roda); };
    const toque = (e) => { if (e.touches[0]) { ptr.x = e.touches[0].clientX; ptr.y = e.touches[0].clientY; } };
    const roda = () => {
      raf = 0;
      const vw = innerWidth, vh = innerHeight;
      let ativo = 0, eAtivo = 0, fxAtivo = 0;
      secoes.forEach((sec) => {
        const i = +sec.dataset.cap;
        const m = manchas[i - 1];
        const def = SECOES[i - 1];
        const r = def && RITMO[def.efeito];
        if (!m || !r) return;
        const top = sec.getBoundingClientRect().top;
        const p = Math.max(0, Math.min(1, 1 - top / (vh * r.faixa)));
        if (p > 0) { ativo = i; eAtivo = r.curva(p); fxAtivo = FX[def.efeito]; }
        if (ESTADO.ok) { m.style.display = "none"; return; }
        m.style.display = "";
        if (p <= 0) { delete centro[i]; }
        else if (!centro[i]) centro[i] = { x: ptr.x, y: ptr.y };
        aplicaEntrada(m, def.efeito, p <= 0 ? 0 : r.curva(p), vw, vh, ptr, i * 1.7);
      });
      ESTADO.i = ativo; ESTADO.e = eAtivo; ESTADO.fx = fxAtivo; ESTADO.x = ptr.x; ESTADO.y = ptr.y; ESTADO.sujo = true;
    };
    const pede = () => { if (!raf) raf = requestAnimationFrame(roda); };
    roda();
    addEventListener("scroll", pede, { passive: true });
    addEventListener("resize", pede);
    addEventListener("pointermove", move);
    addEventListener("touchstart", toque, { passive: true });
    return () => { removeEventListener("scroll", pede); removeEventListener("resize", pede); removeEventListener("pointermove", move); removeEventListener("touchstart", toque); cancelAnimationFrame(raf); };
  }, []);

  const v = VIDEOS[vsel];
  const vp = VIDEOS[vhov != null ? vhov : vsel];
  const vai = (k) => { const n = (k + VIDEOS.length) % VIDEOS.length; setVsel(n); setVplay(false); setVhov(null); };
  const tiles = DISCO.filter((d) => !DUP[d.id]);
  const juntos = (d) => DISCO.filter((x) => DUP[x.id] === d.id);
  const anos = [...new Set(tiles.map((d) => d.ano))];
  useEffect(() => {
    const el = lista.current && lista.current.children[vsel];
    if (el && lista.current) lista.current.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
  }, [vsel]);
  useEffect(() => {
    const move = (e) => setRost({ x: (e.clientX / innerWidth - 0.5) * 2, y: (e.clientY / innerHeight - 0.5) * 2 });
    addEventListener("pointermove", move);
    return () => removeEventListener("pointermove", move);
  }, []);

  // o logo grande da abertura: as letras se inclinam e sobem na direção do mouse, a mais perto fica rosa; o clique faz a onda
  useEffect(() => {
    const box = logoG.current;
    if (!box) return;
    const ls = [...box.children];
    let mx = -9999, my = 0, raf = 0, visivel = true;
    const est = ls.map(() => ({ ty: 0, sk: 0, pk: 0 }));
    const move = (e) => { mx = e.clientX; my = e.clientY; };
    const sai = () => { mx = -9999; };
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0.1 });
    io.observe(box);
    const quadro = () => {
      if (visivel) {
        const W = innerWidth;
        ls.forEach((l, i) => {
          const r = l.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const perto = mx < -999 ? 0 : Math.max(0, 1 - Math.abs(mx - cx) / (W * 0.22));
          const e = est[i];
          e.pk += (perto * perto - e.pk) * 0.14;
          l.style.setProperty("--pk", e.pk.toFixed(3));
        });
      }
      raf = requestAnimationFrame(quadro);
    };
    addEventListener("pointermove", move);
    document.addEventListener("pointerleave", sai);
    raf = requestAnimationFrame(quadro);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", move); document.removeEventListener("pointerleave", sai); };
  }, []);

  // o site global põe overflow-x: hidden em html e body, o que impede o position: sticky (os players fixos); aqui troca por "clip"
  useEffect(() => {
    const h = document.documentElement, b = document.body;
    const antes = [h.style.overflowX, b.style.overflowX];
    h.style.overflowX = "clip"; b.style.overflowX = "clip";
    return () => { h.style.overflowX = antes[0]; b.style.overflowX = antes[1]; };
  }, []);

  // waters: a seção "acende" quando entra na tela, como a lâmpada da capa
  useEffect(() => {
    const el = document.getElementById("waters");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setAcesa(e.isIntersecting && e.intersectionRatio > 0.35), { threshold: [0, 0.35, 0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // no celular o player da discografia vira uma barra fixa embaixo, só enquanto a seção está na tela
  useEffect(() => {
    const el = document.getElementById("discografia");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNaParede(e.isIntersecting), { threshold: 0.04 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const abreClipe = (i) => { setVsel(i); setVplay(true); setVhov(null); document.getElementById("videos").scrollIntoView({ behavior: "smooth" }); };

  const cap = (l, i) => (
    <section key={l.id} className={`${styles.cap} ${styles["c_" + l.id]} ${l.id === "waters" && acesa ? styles.acesa : ""}`} data-cap={i + 1} id={l.id}>
      {l.id === "waters" && <AguaFundo />}
      <div className={styles.figura}>
        {l.id === "ep" ? (
          <div className={styles.capaEp} aria-label="capa do EP instante-já"><span>instante-já</span></div>
        ) : l.visualizer != null ? (
          <div className={styles.capaLink}>
            <Pintura src={l.capa} alt={`capa de ${l.titulo}`} />
            <button className={styles.bandeira} onClick={() => abreClipe(l.visualizer)} aria-label="assistir o visualizer"><i /> visualizer</button>
          </div>
        ) : (
          <Pintura src={l.capa} alt={`capa de ${l.titulo.replace("|", " ")}`} />
        )}
        <span className={styles.num}>{l.ano}</span>
        {l.destaque && (
          <p className={styles.destaque}><Conta valor={l.destaque.n} className={styles.destN} /><span>{l.destaque.t}</span></p>
        )}
        {(l.clipes || []).length > 0 && (
          <div className={styles.clipeCards}>
            {l.clipes.map((c) => (
              <button key={c.i} onClick={() => abreClipe(c.i)} aria-label={c.t}>
                <span style={{ backgroundImage: `url(https://i.ytimg.com/vi/${VIDEOS[c.i].yt}/mqdefault.jpg)`, backgroundSize: VIDEOS[c.i].z ? `${VIDEOS[c.i].z * 100}% auto` : undefined }} />
                <b>▸ {c.t}</b>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={styles.titulo}>
        <p className={styles.tipo}>{l.tipo}</p>
        <h2>{l.titulo.split("|").map((t, k) => <span key={k} className={styles.linhaT}>{t}</span>)}{l.sub && <small>{l.sub}</small>}</h2>
      </div>
      <div className={styles.info}>
        <dl className={styles.ficha}>
          {l.ficha.map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}
        </dl>
        {l.faixas.length > 0 && (
          <ol className={styles.faixas}>
            {l.faixas.map(([n, t]) => <li key={n}><span>{n}</span><b>{t}</b></li>)}
          </ol>
        )}
        <div className={styles.acoes}>
          {toca === l.id ? (
            <iframe className={styles.spot} title={l.titulo} src={`https://open.spotify.com/embed/album/${l.sp}?theme=0`} allow="encrypted-media" loading="lazy" />
          ) : (
            <button className={styles.ouvir} onClick={() => setToca(l.id)}><i /> ouvir</button>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <main className={styles.pagina} ref={raiz}>
      <VoltarJodo />
      <MarcaTopo nome="1LUM3" cor="#ffffff" plano emblema={<span className={styles.emb}>{LETRAS.map(([x0, x1], i) => <span key={i} className={styles.ltr} style={{ left: `${(x0 / 818) * 100}%`, width: `${((x1 - x0) / 818) * 100}%`, "--i": i, WebkitMaskImage: `url(/lum3/l${i + 1}.png)`, maskImage: `url(/lum3/l${i + 1}.png)` }} />)}</span>} />

      <FundoFluido />
      {/* uma mancha de tinta por seção (reserva, se o WebGL não estiver disponível) */}
      {COR.map((cor, k) => (
        <div key={k} data-mancha className={styles.mancha} style={{ background: cor, zIndex: 1 + k }} aria-hidden="true" />
      ))}

      <div className={styles.conteudo}>
        <section className={styles.abertura} data-cap="0">
          <div className={styles.logoG} ref={logoG} role="img" aria-label="1LUM3" onClick={pulaLogo}>
            {LETRAS.map(([x0, x1], i) => (
              <span key={i} className={styles.lg} style={{ left: `${(x0 / 818) * 100}%`, width: `${((x1 - x0) / 818) * 100}%`, "--i": i, WebkitMaskImage: `url(/lum3/l${i + 1}.png)`, maskImage: `url(/lum3/l${i + 1}.png)` }}><i /></span>
            ))}
          </div>
          <div className={styles.numeros0}>
            <p><a className={styles.linkN} href={ART} target="_blank" rel="noopener noreferrer"><Conta valor={OUVINTES} className={styles.n0} /><span>ouvintes mensais · Spotify ↗</span></a></p>
            <p><a className={styles.linkN} href="#discografia"><Conta valor={DISCO.length} className={styles.n0} /><span>lançamentos, de 2018 a 2026 ↓</span></a></p>
          </div>
          <p className={styles.rola}>rola ↓</p>
        </section>

        {LANC.map(cap)}

        <section className={styles.numeros} data-cap={idx("numeros")} id="numeros">
          <div className={styles.numGrade}>
            <div className={styles.numEsq}>
              <p className={styles.tipo}>no spotify</p>
              <a className={styles.gigLink} href={ART} target="_blank" rel="noopener noreferrer">
                <h2 className={styles.gigante}><Conta valor={OUVINTES} /><small>ouvintes por mês · abrir no Spotify ↗</small></h2>
              </a>
              <ol className={styles.top}>
                {TOP_DELA.map((t, k) => (
                  <li key={t.t} style={{ "--w": `${Math.max(4, (t.n / TOP_DELA[0].n) * 100)}%`, "--d": `${k * 0.12}s` }}>
                    <b>{String(k + 1).padStart(2, "0")}</b>
                    <a className={styles.nomeTop} href={LINK_TOP[t.t] || ART} target="_blank" rel="noopener noreferrer">{t.t}<small>{t.com}</small></a>
                    <Conta valor={t.n} className={styles.playsTop} />
                    <i className={styles.barra} />
                  </li>
                ))}
              </ol>
              <div className={styles.bioBloco}>
                <span className={styles.marcaBio} role="img" aria-label="1LUM3" />
                <p>é Luiza Soares, cantora e compositora brasileira. Seu repertório bilíngue mistura o abstrato e o sensorial, numa busca por conexão, abrigo e sentido em meio ao caos da vida moderna.</p>
              </div>
            </div>
            <div className={styles.numDir}>
              <iframe title="1LUM3 no Spotify" src="https://open.spotify.com/embed/artist/01JSyuJJh1WCHIuM3Zx7hn?theme=0" allow="encrypted-media" loading="lazy" />
            </div>
          </div>
        </section>

        <section className={styles.parede} data-cap={idx("discografia")} id="discografia">
          <h2>tudo <small>2018 — 2026</small></h2>
          <div className={styles.paredeGrade}>
            <div className={styles.paredeEsq}>
              {anos.map((ano) => (
                <div key={ano} className={styles.ano}>
                  <h3>{ano}</h3>
                  <ul>
                    {tiles.filter((d) => d.ano === ano).map((d) => (
                      <li key={d.id} className={(gaveta || tiles[0]).id === d.id ? styles.tocando : ""}>
                        <button onClick={() => setGaveta(d)} aria-label={`${d.titulo}, ${d.tipo} de ${d.ano}`}>
                          <img src={d.capa} alt="" loading="lazy" />
                          <span><b>{d.titulo}</b><small>{d.tipo}{d.n > 1 ? ` · ${d.n} faixas` : ""}{juntos(d).length ? ` · + ${juntos(d).map((x) => x.titulo).join(", ")}` : ""}</small></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <aside className={`${styles.player} ${naParede ? styles.dockOn : ""}`}>
              {(() => {
                const atual = gaveta || tiles[0];
                return (
                  <>
                    <img src={atual.capa} alt={`capa de ${atual.titulo}`} />
                    <p className={styles.tipo}>{atual.tipo} · {atual.ano}{atual.n > 1 ? ` · ${atual.n} faixas` : ""}</p>
                    <h3>{atual.titulo}</h3>
                    <iframe key={atual.id} title={atual.titulo} src={`https://open.spotify.com/embed/album/${atual.id}?theme=0`} allow="encrypted-media" loading="lazy" />
                    {juntos(atual).length > 0 && (
                      <p className={styles.tambem}>com a mesma capa: {juntos(atual).map((x) => (
                        <button key={x.id} onClick={() => setGaveta({ ...x, capa: atual.capa })}>{x.titulo}</button>
                      ))}</p>
                    )}
                  </>
                );
              })()}
            </aside>
          </div>
        </section>

        <section className={styles.cinema} data-cap={idx("videos")} id="videos">
          <h2>a sala <small>os vídeos, 2018 — 2025</small></h2>
          <div className={styles.sala}>
            <div className={styles.tela}>
              {vplay ? (
                <iframe title={v.t} src={`https://www.youtube-nocookie.com/embed/${v.yt}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; fullscreen" />
              ) : (
                <button className={styles.poster} style={{ backgroundImage: `url(https://i.ytimg.com/vi/${vp.yt}/hqdefault.jpg)`, backgroundSize: vp.z ? `${vp.z * 100}% auto` : undefined }} onClick={() => { setVsel(vhov != null ? vhov : vsel); setVhov(null); setVplay(true); }} aria-label={`assistir ${vp.t}`}>
                  <i />
                </button>
              )}
              <p className={styles.legendaV}><b>{vp.t}</b><span>{vp.a}{vp.d ? ` · ${vp.d}` : ""}</span></p>
              <div className={styles.setas}>
                <button onClick={() => vai(vsel - 1)} aria-label="vídeo anterior">‹</button>
                <span>{String(vsel + 1).padStart(2, "0")} / {String(VIDEOS.length).padStart(2, "0")}</span>
                <button onClick={() => vai(vsel + 1)} aria-label="próximo vídeo">›</button>
              </div>
            </div>
            <ol className={styles.lista} ref={lista} onMouseLeave={() => setVhov(null)}>
              {VIDEOS.map((x, k) => (
                <li key={x.yt} className={k === vsel ? styles.sel : ""}>
                  <button onMouseEnter={() => !vplay && setVhov(k)} onFocus={() => !vplay && setVhov(k)} onClick={() => { setVsel(k); setVplay(false); setVhov(null); }}>
                    <span className={styles.min} style={{ backgroundImage: `url(https://i.ytimg.com/vi/${x.yt}/mqdefault.jpg)`, backgroundSize: x.z ? `${x.z * 100}% auto` : undefined }} />
                    <em>{x.a}</em><b>{x.t}</b>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      <footer className={styles.rodape}>
        <div className={styles.rodGrade}>
          <div className={styles.rodPalco}>
            <img className={styles.rodLogo} src="/lum3/logo.png" alt="1LUM3" />
            <span className={`${styles.rodRosto} ${rostoOn ? styles.rostoOn : ""}`} style={{ transform: `translate(${rost.x * -12}px, ${rost.y * -8}px) rotate(${rost.x * 3 - 4}deg)` }} onPointerEnter={() => setRostoOn(true)} onPointerLeave={() => setRostoOn(false)} onClick={() => setRostoOn((x) => !x)}>
              <img src="/lum3/rosto.webp" alt="" />
              <img className={styles.rostoCheio} src="/lum3/rosto-opaco.webp" alt="" />
            </span>
          </div>
          <nav className={styles.rodLinks} aria-label="onde encontrar">
            <p className={styles.rodFrase}>quem me conhece<br />não me conhece mais</p>
            <p className={styles.rodSub}>Luiza Soares · cantora e compositora</p>
            <ul className={styles.rodIcones}>
              {REDES.slice(0, 4).map((r) => {
                const m = MARCA[r.r];
                return (
                  <li key={r.r}>
                    <a href={r.u} target="_blank" rel="noopener noreferrer" style={{ "--cm": m.c }} title={r.r} aria-label={r.r}>
                      {r.r === "Spotify" ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" strokeLinecap="round"><path d="M4.2 8.6c5.1-1.5 10.5-1.1 15.4 1.3" strokeWidth="2.5" /><path d="M5.4 12.7c4.2-1.1 8.4-.8 12 1.1" strokeWidth="2.1" /><path d="M6.6 16.6c3.2-.8 6.4-.6 9 .9" strokeWidth="1.8" /></g></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={m.p} /></svg>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
            <ul className={styles.rodOutras}>
              {REDES.slice(4).map((r) => (
                <li key={r.r}><a href={r.u} target="_blank" rel="noopener noreferrer">{r.r}</a></li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={styles.rodPe}>
          <a className={styles.rodMapa} href="/">← mapa da JODO</a>
          <p className={styles.rodAssina}><i aria-hidden="true" /><span>feito pela JODO · porque ainda estamos aqui</span></p>
          <a className={styles.rodTopo} href="#" onClick={(e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="voltar ao topo"><b>↑</b><span>topo</span></a>
        </div>
      </footer>

    </main>
  );
}
