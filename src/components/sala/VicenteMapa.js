"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "@/styles/vicenteMapa.module.css";
import { DISCO, PERFIS, FALHA } from "@/data/vicenteBlow";
import { NOS } from "@/data/conexoes";
import { FOGO_I, OBRAS, geraTerreno, solo, copaAlt, rioZ } from "@/lib/territorio";
import { SIL, amostraSilhueta } from "@/lib/silhuetas";

/*
 * VBLXW · mapa.
 * Um palco fixo em tela cheia; os capítulos trocam por fusão (como nos outros sites da JODO) e a câmera viaja pelo território.
 * O portfólio dele é o mapa: cada marca no chão é um lançamento. A paisagem é ilustrativa, feita em código.
 */

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const lerp = (a, b, t) => a + (b - a) * t;

// capítulos: comprimento em telas (vh) e quanto a câmera espera antes de seguir para o próximo
const CAPS = [
  { id: "capa", nome: "vblxw", L: 1.3, hold: 0 },
  { id: "quem", nome: "quem", L: 1.5, hold: 0 },
  { id: "mapa", nome: "mapa", L: 4.0, hold: 0.9 },
  { id: "mata", nome: "a mata viva", L: 1.9, hold: 0.8 },
  { id: "discos", nome: "discografia", L: 3.8, hold: 0.92 },
  { id: "ouvir", nome: "ouvir", L: 1.3, hold: 0 },
];
const ANOS_DISCO = [2025, 2023, 2022, 2021, 2020];

// o que acontecia com a mata em cada ano, e o que ele fazia
const ANOS = [
  { ano: 2013, fogo: 0, grow: 0, estado: "mata de pé", txt: "Entra na cena como bboy, aos 14 anos." },
  { ano: 2017, fogo: 0, grow: 0, estado: "mata de pé", txt: "Desperta para o rap. Primeiro grupo: Interligados." },
  { ano: 2019, fogo: 0.28, grow: 0, estado: "o fogo começa", txt: "O INPE conta 89.178 focos de queimada na Amazônia, 30% a mais que em 2018. Cerca de 45% dos focos de agosto de 2019 a setembro de 2020 estavam em áreas recém-desmatadas." },
  { ano: 2020, fogo: 1, grow: 0, estado: "queimada", txt: "Em 29.02 sai “Amazônia pega fogo”, o primeiro single, em uma das maiores temporadas de fogo do Amazonas desde 1998." },
  { ano: 2021, fogo: 1, grow: 0.3, estado: "a mata volta", txt: "Sete lançamentos em seis meses. O primeiro lugar no festival de Hip-Hop Dimanaus, no meio do ano." },
  { ano: 2022, fogo: 1, grow: 0.5, estado: "a mata volta", txt: "El Fluxxxo: “Manaus City” ganha segunda parte e vídeo oficial." },
  { ano: 2023, fogo: 1, grow: 0.72, estado: "a mata volta", txt: "Reflexo, R.E.M.A e a participação no Mundo Estranho, do Altamente 82." },
  { ano: 2025, fogo: 1, grow: 1, estado: "mata de volta", txt: "Ruído das Águas, com PRISM∆ e LF: o disco que chama de volta para casa." },
];

// a mata viva: bichos em silhueta de pontos, cada um na sua faixa
const HAB = { copa: -58, sub: -18, chao: 24, margem: 62, rio: 100 };
const ESPECIES = [
  { id: "guariba", nome: "guariba", cient: "Alouatta sp.", fato: "O rugido do macho se ouve a quilômetros.", tipo: "dossel", h: "copa", dx: -26, gap: 9, A: 3, n: 3, lift: 0.5 },
  { id: "tucano", nome: "tucano", cient: "Ramphastos sp.", fato: "O bico enorme é leve e oco. Ele semeia a mata.", tipo: "dossel", h: "copa", dx: -2, gap: 14, A: 2, n: 2, lift: 0.6 },
  { id: "preguica", nome: "preguiça-real", cient: "Choloepus didactylus", fato: "Vive pendurada nas copas e quase não desce.", tipo: "dossel", h: "copa", dx: 20, gap: 0, A: 0.5, n: 1, lift: 4.5 },
  { id: "harpia", nome: "harpia", cient: "Harpia harpyja", fato: "Uma das maiores águias do mundo.", tipo: "planar", h: "copa", dx: 34, gap: 0, A: 0, n: 1, hy: 16 },
  { id: "arara", nome: "arara-vermelha", cient: "Ara chloropterus", fato: "Voa em casais, quase sempre de dois em dois.", tipo: "voo", h: "copa", dx: 0, gap: 12, A: 0, n: 5, hy: 9, v: 9 },
  { id: "morcego", nome: "morcegos", cient: "Chiroptera", fato: "Dispersam sementes e polinizam.", tipo: "enxame", h: "sub", dx: -14, gap: 7, A: 6, n: 4, hy: 11 },
  { id: "morpho", nome: "borboleta-morfo", cient: "Morpho sp.", fato: "O azul vem da estrutura da asa, não de pigmento.", tipo: "enxame", h: "sub", dx: 14, gap: 8, A: 6, n: 3, hy: 5 },
  { id: "onca", nome: "onça-pintada", cient: "Panthera onca", fato: "O maior felino das Américas.", tipo: "chao", h: "chao", dx: -18, gap: 0, A: 5, n: 1, anda: true },
  { id: "anta", nome: "anta", cient: "Tapirus terrestris", fato: "Planta a floresta: espalha as sementes que come.", tipo: "chao", h: "chao", dx: 2, gap: 0, A: 5, n: 1, anda: true },
  { id: "tamandua", nome: "tamanduá-bandeira", cient: "Myrmecophaga tridactyla", fato: "Não tem dentes.", tipo: "chao", h: "chao", dx: 22, gap: 0, A: 4, n: 1, anda: true },
  { id: "capivara", nome: "capivara", cient: "Hydrochoerus hydrochaeris", fato: "O maior roedor do mundo.", tipo: "margem", h: "margem", dx: -18, gap: 9, A: 3, n: 3, anda: true },
  { id: "jacare", nome: "jacaré-açu", cient: "Melanosuchus niger", fato: "O maior jacaré da Amazônia.", tipo: "margem", h: "margem", dx: 14, gap: 20, A: 2, n: 2 },
  { id: "boto", nome: "boto-cor-de-rosa", cient: "Inia geoffrensis", fato: "O maior golfinho de rio do mundo.", tipo: "rio", h: "rio", dx: -18, gap: 16, A: 5, n: 2, hy: -0.6 },
  { id: "ariranha", nome: "ariranha", cient: "Pteronura brasiliensis", fato: "A maior lontra do mundo.", tipo: "rio", h: "rio", dx: 18, gap: 11, A: 3, n: 3, hy: -0.3, anda: true },
  { id: "peixeboi", nome: "peixe-boi-da-amazônia", cient: "Trichechus inunguis", fato: "O único peixe-boi só de água doce.", tipo: "rio", h: "rio", dx: -4, gap: 0, A: 6, n: 1, hy: -9.5 },
  { id: "pirarucu", nome: "pirarucu", cient: "Arapaima gigas", fato: "Um dos maiores peixes de água doce do mundo.", tipo: "rio", h: "rio", dx: 30, gap: 0, A: 4, n: 3, hy: -5 },
];

// ---------- shaders ----------
const VERT = `
attribute float aH1,aH2,aHm,aKind,aDitch,aRnd,aWater,aOpen,aObra;
uniform float uT,uPx,uFire,uGrow,uTherm,uDraw,uMapa,uSlab;
uniform float uOn[14];
uniform vec2 uI;
varying vec3 vCol;varying float vA;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
vec3 iron(float t){
  vec3 c=mix(vec3(.01,.0,.03),vec3(.11,.04,.32),smoothstep(0.,.2,t));
  c=mix(c,vec3(.45,.08,.55),smoothstep(.2,.4,t));
  c=mix(c,vec3(.87,.2,.35),smoothstep(.4,.58,t));
  c=mix(c,vec3(1.,.5,.07),smoothstep(.58,.74,t));
  c=mix(c,vec3(1.,.86,.3),smoothstep(.74,.9,t));
  return mix(c,vec3(1.,.98,.9),smoothstep(.9,1.,t));
}
void main(){
  vec2 p=position.xz;
  float h=aKind<.5?aH1:(aKind<1.5?aH2:aHm);
  float alt=aH1-aH2;
  float fd=length(p-uI)+(n2(p*.07+3.)-.5)*52.;
  float R=uFire*470.-20.;
  float queimado=smoothstep(R-40.,R-76.,fd);
  float quente=smoothstep(R+6.,R-16.,fd)*(1.-smoothstep(R-16.,R-66.,fd));
  float brota=step(aRnd,uGrow)*uGrow;
  float on=aObra<.5?.55:uOn[int(aObra+.5)];
  float draw=1.-smoothstep(uDraw*340.-80.,uDraw*340.,length(p));
  float dOn=aObra<.5?.5:(on<.5?.34:(on<1.4?1.:(on<1.8?1.5:2.3)));
  float ditch=aDitch*draw*dOn;
  vec3 pos=vec3(p.x,h,p.y);
  vec3 col;float a;
  if(aKind<.5){
    col=mix(vec3(.05,.42,.36),vec3(.55,.95,.78),smoothstep(2.,32.,alt));
    col=mix(col,vec3(.9,1.,.95),smoothstep(32.,46.,alt));
    if(aWater>.5)col=vec3(.35,.62,.8);
    float vis=aWater>.5?1.:(1.-queimado*(1.-brota));
    a=vis*mix(.34,.26,uMapa);
    pos.y=mix(pos.y,aH2+(h-aH2)*uGrow,queimado*brota);
    pos.x+=sin(uT*.7+aRnd*6.283)*.2*(alt/30.)*(1.-queimado);
    pos.y+=quente*aRnd*24.*(.4+.6*fract(uT*.25+aRnd*5.));
    col=mix(col,vec3(.5,1.,.62),queimado*brota*.45);
  }else if(aKind<1.5){
    col=mix(vec3(.28,.2,.12),vec3(.93,.82,.6),smoothstep(-2.,16.,aH2));
    vec3 dc=mix(vec3(1.,.36,.14),vec3(1.,.9,.66),smoothstep(1.2,2.1,dOn));
    col=mix(col,dc,clamp(ditch,0.,1.));
    float base=max(max(aOpen*.5,queimado),max(uMapa*.22,uSlab*.3));
    a=base*.55+ditch*1.5;
    col=mix(col,vec3(.22,.06,.03),queimado*.55*(1.-clamp(ditch,0.,1.)));
  }else{
    col=mix(vec3(.62,.66,.16),vec3(.2,.7,.52),smoothstep(0.,alt*.9,h-aH2));
    float vis=(1.-queimado*(1.-brota));
    a=vis*mix(.24,.15,uMapa);
    pos.y=mix(pos.y,aH2+(h-aH2)*uGrow,queimado*brota);
    pos.y+=quente*aRnd*14.*(.4+.6*fract(uT*.3+aRnd*7.));
  }
  float ht=aKind<.5?(.1+smoothstep(0.,40.,alt)*.2):(aKind<1.5?(.22+smoothstep(-2.,16.,aH2)*.12):(.15+smoothstep(0.,40.,h-aH2)*.15));
  float heat=clamp(ht+quente*.9+queimado*.12,0.,1.);
  vec3 th=iron(heat);
  if(ditch>.3&&aKind>.5&&aKind<1.5)th=mix(th,iron(.55+.12*min(dOn,2.)),.75);
  col=mix(col,th,uTherm*(aWater>.5?.4:.85));
  col=mix(col,vec3(1.,.9,.5),quente*.5);
  a=max(a,quente*.9*(aKind<.5?1.:.4));
  a*=mix(1.,(1.-smoothstep(17.,25.,abs(p.y)))*.42,uSlab);
  vec4 mv=modelViewMatrix*vec4(pos,1.);
  gl_Position=projectionMatrix*mv;
  float dist=-mv.z;
  float sz=(aKind<.5?2.4:(aKind<1.5?2.0+clamp(ditch,0.,2.)*1.6:1.6))*(1.+quente*.6);
  gl_PointSize=clamp(sz*uPx*(150./dist),1.,mix(7.,3.2,uSlab)*uPx);
  vCol=col;vA=a*exp(-dist*.0034);
}`;
const FRAG = `precision mediump float;varying vec3 vCol;varying float vA;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.26,d)*vA;if(a<.01)discard;gl_FragColor=vec4(vCol,a);}`;
const VERT_A = `uniform float uPx;attribute float aR,aVis;varying float vA;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
gl_PointSize=clamp(2.2*uPx*(150./-mv.z)*(.8+aR*.4),1.6,4.6*uPx);vA=min(aVis,1.4)*(.62+.38*aR);}`;
const FRAG_A = `precision mediump float;varying float vA;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.1,d)*vA;if(a<.01)discard;
gl_FragColor=vec4(mix(vec3(1.,.55,.16),vec3(1.,.97,.84),smoothstep(.34,0.,d)),a);}`;

function Icone({ r }) {
  if (r === "Spotify")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#1DB954" />
        <path d="M5.2 8.7c4.3-1.3 9.5-1 13.4 1.3" fill="none" stroke="#000" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M5.9 12.2c3.6-1 7.7-.7 10.8 1.1" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.7 15.4c2.9-.7 5.9-.5 8.4.9" fill="none" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  if (r === "YouTube")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="0.5" y="4" width="23" height="16" rx="4.5" fill="#FF0000" />
        <path d="M9.7 8.6v6.8l5.9-3.4z" fill="#fff" />
      </svg>
    );
  if (r === "SoundCloud")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#FF5500" />
        <path d="M4 15.5v-3M6.2 16v-5M8.4 16v-6.2M10.6 16V9.2M12 16h6.2a2.4 2.4 0 0 0 .3-4.8 4.1 4.1 0 0 0-6.5-1.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  if (r === "Deezer")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#121216" />
        {[[3, 15, "#40ab5d"], [8, 12, "#3c9fda"], [13, 9, "#8c4ad9"], [18, 6, "#e0366b"]].map(([x, y, c]) => (
          <rect key={x} x={x - 1} y={y} width="4" height={19 - y} rx="1" fill={c} />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="igv" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA77" />
          <stop offset="0.45" stopColor="#F5436B" />
          <stop offset="1" stopColor="#7B3FE4" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#igv)" />
      <rect x="5.2" y="5.2" width="13.6" height="13.6" rx="4" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="16.4" cy="7.6" r="1" fill="#fff" />
    </svg>
  );
}

// elemento que entra desfocado e sobe, quando o capítulo fica ativo (como nos outros sites)
const Rv = ({ k = 0, as: T = "div", className = "", children, ...r }) => (
  <T className={`${styles.rv} ${className}`} style={{ "--k": k }} {...r}>
    {children}
  </T>
);

export default function VicenteMapa() {
  const cv = useRef(null);
  const trilha = useRef(null);
  const caps = useRef([]);
  const menuRef = useRef([]);
  const geo = useRef({ B: [], total: 0 });
  const mouse = useRef({ x: 0, y: 0, cx: 0, cy: 0, tocou: 0, px: -999, py: -999, ui: false });
  const anoRef = useRef(0);
  const selRef = useRef(-1);
  const listaRef = useRef(-1);
  const bichoRef = useRef(null);
  const discoRef = useRef(0);
  const auto = useRef({ ult: 0, feito: false });
  const [ano, setAno] = useState(0);
  const [sel, setSel] = useState(-1);
  const [disco, setDisco] = useState(0);
  const [bicho, setBicho] = useState(null);

  const escolheAno = (i) => {
    auto.current.feito = true;
    anoRef.current = i;
    setAno(i);
  };
  const vaiPara = (i, f = 0.02) => {
    const B = geo.current.B;
    if (B.length) window.scrollTo({ top: B[i] + (B[i + 1] - B[i]) * f, behavior: "smooth" });
  };

  useEffect(() => {
    const antes = [document.documentElement.style.cssText, document.body.style.cssText];
    document.documentElement.style.overflow = "visible";
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflow = "visible";
    document.body.style.overflowX = "clip";

    const canvas = cv.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch (e) {
      return undefined;
    }
    const mobile = innerWidth < 860;
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x04070a, 1);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(mobile ? 60 : 46, innerWidth / innerHeight, 1, 1600);
    renderer.setSize(innerWidth, innerHeight, false);

    // ===== o território =====
    const pts = geraTerreno(mobile ? 1.2 : 0.7);
    const N = pts.length;
    const pos = new Float32Array(N * 3);
    const colunas = { aH1: 2, aH2: 3, aHm: 4, aKind: 5, aDitch: 6, aRnd: 7, aWater: 8, aOpen: 9, aObra: 10 };
    const att = {};
    Object.keys(colunas).forEach((k) => (att[k] = new Float32Array(N)));
    pts.forEach((q, i) => {
      pos[i * 3] = q[0];
      pos[i * 3 + 2] = q[1];
      for (const k in colunas) att[k][i] = q[colunas[k]];
    });
    const geoT = new THREE.BufferGeometry();
    geoT.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    Object.entries(att).forEach(([k, v]) => geoT.setAttribute(k, new THREE.BufferAttribute(v, 1)));
    const uOn = new Float32Array(14);
    const U = {
      uT: { value: 0 }, uPx: { value: dpr }, uFire: { value: 0 }, uGrow: { value: 0 }, uTherm: { value: 0 }, uDraw: { value: 0 }, uMapa: { value: 0 }, uSlab: { value: 0 },
      uI: { value: new THREE.Vector2(FOGO_I[0], FOGO_I[1]) }, uOn: { value: uOn },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const nuvem = new THREE.Points(geoT, mat);
    nuvem.frustumCulled = false;
    scene.add(nuvem);

    // ===== a mata viva: silhuetas de perfil em pontos =====
    let rs = 7;
    const rnd = () => {
      rs = (rs * 16807) % 2147483647;
      return (rs - 1) / 2147483646;
    };
    const todos = [];
    ESPECIES.forEach((sp, si) => {
      const passo = sp.n >= 3 ? 3.8 : sp.n >= 2 ? 3.0 : 2.4;
      const f0 = amostraSilhueta(sp.id, 0, passo, si + 3);
      sp.base = f0.map(([x, y]) => [x, y, (rnd() - 0.5) * 0.9, rnd()]);
      sp.base1 = null;
      if (SIL[sp.id].poses > 1) {
        const f1 = amostraSilhueta(sp.id, 1, passo, si + 11);
        sp.base1 = sp.base.map((q, k) => [f1[k % f1.length][0], f1[k % f1.length][1], q[2], q[3]]);
      }
      sp.hgt = Math.max(1, ...sp.base.map((q) => q[1]));
      sp.inds = Array.from({ length: sp.n }, (_, k) => ({ x: 0, z: 0, hd: 0, ph: rnd() * 6.283 + k, vx: 0, gait: 0 }));
      sp.idx0 = todos.length;
      sp.inds.forEach(() => sp.base.forEach((q) => todos.push(q[3])));
    });
    const M = todos.length;
    const aPos = new Float32Array(M * 3), aR = new Float32Array(M), aVis = new Float32Array(M);
    todos.forEach((r, i) => (aR[i] = r));
    const gA = new THREE.BufferGeometry();
    gA.setAttribute("position", new THREE.BufferAttribute(aPos, 3));
    gA.setAttribute("aR", new THREE.BufferAttribute(aR, 1));
    gA.setAttribute("aVis", new THREE.BufferAttribute(aVis, 1));
    const mA = new THREE.ShaderMaterial({ vertexShader: VERT_A, fragmentShader: FRAG_A, uniforms: { uPx: { value: dpr } }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const animais = new THREE.Points(gA, mA);
    animais.frustumCulled = false;
    animais.visible = false;
    scene.add(animais);

    const KEYS = [
      [[12, 78, 170], [0, 10, 0]],
      [[-110, 62, 120], [-10, 10, -10]],
      [[0, 238, 50], [0, 0, 0]],
      [[20, 26, 112], [20, 22, 0]],
      [[40, 170, 120], [10, 0, 0]],
      [[0, 270, 70], [0, 0, 0]],
      [[14, 285, 86], [0, 0, 0]],
    ];
    const ray = new THREE.Raycaster();
    const plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), -8);
    const hit = new THREE.Vector3(), v3 = new THREE.Vector3();
    const camPos = new THREE.Vector3(), camAlvo = new THREE.Vector3();
    const cur = { fogo: 0, grow: 0 };
    let raf, t0 = performance.now(), ult = t0, ativo = true;

    // altura de cada capítulo em px (a trilha de rolagem)
    const mede = () => {
      const vh = innerHeight;
      const B = [0];
      CAPS.forEach((c) => B.push(B[B.length - 1] + c.L * vh));
      geo.current = { B, total: B[B.length - 1] };
      if (trilha.current) trilha.current.style.height = `${B[B.length - 1] + vh}px`;
    };
    mede();

    const onMove = (e) => {
      const m = mouse.current;
      m.x = (e.clientX / innerWidth) * 2 - 1;
      m.y = -(e.clientY / innerHeight) * 2 + 1;
      m.tocou = 1;
      m.px = e.clientX;
      m.py = e.clientY;
      m.ui = !!(e.target && e.target.closest && e.target.closest("[data-ui]"));
    };
    const onResize = () => {
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight, false);
      mede();
    };
    addEventListener("pointermove", onMove);
    addEventListener("pointerdown", onMove);
    addEventListener("resize", onResize);
    const vis = () => (ativo = !document.hidden);
    document.addEventListener("visibilitychange", vis);

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!ativo) return;
      const dt = Math.min(0.05, (now - ult) / 1000);
      ult = now;
      const t = (now - t0) / 1000;
      const vw = innerWidth, vh = innerHeight;
      const { B, total } = geo.current;
      const y = Math.min(total, Math.max(0, scrollY));

      // capítulo atual (u = índice + fração) e a fusão de tela cheia entre capítulos
      let ic = 0;
      while (ic < CAPS.length - 1 && y >= B[ic + 1]) ic++;
      const frac = Math.min(1, Math.max(0, (y - B[ic]) / Math.max(1, B[ic + 1] - B[ic])));
      const u = ic + frac;
      const meia = vh * 0.22;
      caps.current.forEach((el, i) => {
        if (!el) return;
        const ent = i === 0 ? 1 : sm((y - (B[i] - meia)) / (2 * meia));
        const sai = i === CAPS.length - 1 ? 1 : 1 - sm((y - (B[i + 1] - meia)) / (2 * meia));
        const o = Math.min(ent, sai);
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.classList.toggle(styles.on, o > 0.55);
      });
      menuRef.current.forEach((a, i) => a && a.classList.toggle(styles.menuOn, i === ic));

      // câmera
      const hold = CAPS[ic].hold;
      const f = hold > 0 ? sm((frac - hold) / (1 - hold)) : sm(frac);
      const A = KEYS[ic], Bk = KEYS[ic + 1];
      const m = mouse.current;
      m.cx += (m.x - m.cx) * 0.05;
      m.cy += (m.y - m.cy) * 0.05;
      const asp = vw / vh;
      const noMapa = u > 2.02 && u < 3.0;
      const mapaW = sm((u - 1.8) / 0.4) * (1 - sm((u - 2.9) / 0.1));
      const k = asp < 1 ? lerp(1.15, 1.5, mapaW) : asp < 1.4 ? lerp(1.25, 1.15, mapaW) : 1;
      camAlvo.set(lerp(A[1][0], Bk[1][0], f), lerp(A[1][1], Bk[1][1], f), lerp(A[1][2], Bk[1][2], f));
      camPos.set(lerp(A[0][0], Bk[0][0], f) + m.cx * 6 + Math.sin(t * 0.1) * 2, lerp(A[0][1], Bk[0][1], f) + m.cy * 3, lerp(A[0][2], Bk[0][2], f));
      camPos.sub(camAlvo).multiplyScalar(k).add(camAlvo);
      // no celular a frisa da mata viva é larga demais para a tela: a câmera caminha por ela com a rolagem
      if (asp < 1 && u > 2.9 && u < 3.95) {
        const pan = lerp(-62, 78, sm((u - 3.0) / 0.8)) * sm((u - 2.9) / 0.1) * (1 - sm((u - 3.82) / 0.12));
        camAlvo.x += pan;
        camPos.x += pan;
      }
      cam.position.copy(camPos);
      if (asp < 1) cam.up.set(mapaW, 1 - mapaW, 0).normalize();
      else cam.up.set(0, 1, 0);
      cam.lookAt(camAlvo);

      // linha do tempo do mapa: toca sozinha uma vez, devagar
      const au = auto.current;
      if (noMapa && !au.feito) {
        if (!au.ult) au.ult = now;
        if (now - au.ult > 2800) {
          au.ult = now;
          if (anoRef.current < ANOS.length - 1) {
            anoRef.current += 1;
            setAno(anoRef.current);
          } else au.feito = true;
        }
      }
      // discografia: um ano por vez, conforme a rolagem
      if (ic === 4) {
        const di = Math.min(ANOS_DISCO.length - 1, Math.floor((frac / 0.97) * ANOS_DISCO.length));
        if (di !== discoRef.current) {
          discoRef.current = di;
          setDisco(di);
        }
      }

      // estado da mata
      let alvo = ANOS[anoRef.current];
      if (u < 1.9) alvo = { fogo: 0, grow: 0 };
      else if (u >= 3.0) alvo = { fogo: 1, grow: 1 };
      cur.fogo += (alvo.fogo - cur.fogo) * Math.min(1, dt * 0.75);
      cur.grow += (alvo.grow - cur.grow) * Math.min(1, dt * 0.8);
      const slab = sm((u - 2.9) / 0.1) * (1 - sm((u - 3.82) / 0.12));
      U.uT.value = t;
      U.uFire.value = cur.fogo;
      U.uGrow.value = cur.grow;
      U.uTherm.value = sm(cur.fogo * 3) * (1 - sm(cur.grow / 0.5));
      U.uDraw.value = sm((u - 1.6) / 0.6);
      U.uMapa.value = sm((u - 1.8) / 0.4);
      U.uSlab.value = slab;

      // qual marca está sob o cursor (só no mapa)
      let hov = -1;
      if (noMapa && m.tocou) {
        if (m.ui) hov = selRef.current;
        else {
          ray.setFromCamera({ x: m.x, y: m.y }, cam);
          if (ray.ray.intersectPlane(plano, hit)) {
            let bd = 1e9;
            OBRAS.forEach((o, i) => {
              if (DISCO[i].ano > ANOS[anoRef.current].ano) return;
              const d = Math.hypot(hit.x - o.cx, hit.z - o.cz) / (o.R * 1.2 + 5);
              if (d < 1 && d < bd) { bd = d; hov = i; }
            });
          }
        }
      }
      if (hov !== selRef.current) {
        selRef.current = hov;
        setSel(hov);
      }
      const liberadas = u >= 3.0;
      for (let i = 0; i < OBRAS.length; i++) {
        const a2 = DISCO[i].ano;
        let v = liberadas || a2 <= ANOS[anoRef.current].ano ? 1 : 0;
        if (!liberadas && a2 === ANOS[anoRef.current].ano) v = 1.6;
        if (i === hov || i === listaRef.current) v = 2.4;
        uOn[i + 1] = v;
      }

      // ===== a mata viva =====
      const presenca = sm((u - 2.94) / 0.08) * (1 - sm((u - 3.84) / 0.1));
      let melhor = null, dm = 90;
      if (presenca > 0.02) {
        ESPECIES.forEach((sp) => {
          const H = HAB[sp.h];
          let cx = 0, cy = 0, cz = 0;
          sp.inds.forEach((b, bi) => {
            const ang = t * (0.3 + 0.04 * (bi % 3)) + b.ph;
            const c0 = H + sp.dx * 0.82 + (bi - (sp.n - 1) / 2) * sp.gap;
            const xAnt = b.x;
            if (sp.tipo === "voo") {
              b.x += (sp.v || 9) * dt;
              if (b.x > H + 70 || b.x === 0) b.x = H - 70 - bi * 6;
              b.z = Math.sin(b.x * 0.05 + bi) * 5 + (bi % 2 ? 2 : -2);
              b.hd = 0;
            } else if (sp.tipo === "planar") {
              b.ph += dt * 0.35;
              b.x = H + sp.dx * 0.82 + Math.cos(b.ph) * 12;
              b.z = Math.sin(b.ph) * 6;
              b.hd = Math.sin(b.ph) >= 0 ? Math.PI : 0;
            } else {
              b.x = c0 + Math.sin(ang) * sp.A;
              b.z = sp.tipo === "margem" ? rioZ(b.x) + (bi % 2 ? 1 : -1) * 10 : sp.tipo === "rio" ? rioZ(b.x) + (bi % 2 ? 2 : -2) : bi % 2 ? 1.5 : -1.5;
              b.hd = Math.cos(ang) >= 0 ? 0 : Math.PI;
            }
            b.vx = (b.x - xAnt) / Math.max(dt, 0.001);
            if (sp.anda) b.gait += Math.abs(b.vx) * dt * 1.35;
            const dir = Math.cos(b.hd) >= 0 ? 1 : -1;
            const gy = solo(b.x, b.z);
            let yb;
            if (sp.tipo === "chao" || sp.tipo === "margem") yb = gy;
            else if (sp.tipo === "dossel") yb = gy + copaAlt(b.x, b.z) + sp.lift;
            else if (sp.tipo === "voo") yb = solo(H, 0) + copaAlt(H, 0) + sp.hy + (bi % 3) * 3 + Math.sin(t * 0.8 + bi) * 1.2;
            else if (sp.tipo === "planar") yb = solo(H, 0) + copaAlt(H, 0) + sp.hy + Math.sin(t * 0.3) * 2;
            else if (sp.tipo === "enxame") yb = gy + sp.hy + Math.sin(t * 0.9 + b.ph) * 2.5;
            else yb = -2.4 + sp.hy - (sp.id === "pirarucu" ? bi * 2.8 : 0) + (sp.id === "boto" ? Math.max(0, Math.sin(t * 0.9 + b.x * 0.05 + bi * 2)) * 5 : Math.sin(t * 0.6 + b.ph) * 0.3);
            const pose = sp.base1 && Math.sin(t * (sp.tipo === "planar" ? 2.5 : 14) + b.ph) > 0 ? 1 : 0;
            const arr = pose ? sp.base1 : sp.base;
            const foco = bichoRef.current === sp.id ? 1.5 : 0.9;
            let i = sp.idx0 + bi * sp.base.length;
            for (let qi = 0; qi < arr.length; qi++) {
              const q = arr[qi];
              let lx = q[0], ly = q[1];
              if (sp.anda) {
                const leg = sp.hgt * 0.36;
                if (ly < leg) lx += Math.sin(b.gait + (lx > 0 ? 0 : Math.PI)) * 0.6 * (1 - ly / leg);
                ly += Math.abs(Math.sin(b.gait)) * 0.22;
              }
              aPos[i * 3] = b.x + lx * dir;
              aPos[i * 3 + 1] = yb + ly;
              aPos[i * 3 + 2] = b.z + q[2];
              aVis[i] = presenca * foco;
              i++;
            }
            cx += b.x; cy += yb + sp.hgt * 0.5; cz += b.z;
          });
          // o bicho mais perto do cursor ganha nome
          if (presenca > 0.5 && m.tocou) {
            v3.set(cx / sp.n, cy / sp.n, cz / sp.n).project(cam);
            const sx = (v3.x * 0.5 + 0.5) * vw, sy = (-v3.y * 0.5 + 0.5) * vh;
            const d = Math.hypot(sx - m.px, sy - m.py);
            if (d < dm && v3.z < 1) { dm = d; melhor = sp.id; }
          }
        });
        gA.attributes.position.needsUpdate = true;
        gA.attributes.aVis.needsUpdate = true;
      }
      const nb = presenca > 0.5 ? melhor : null;
      if (nb !== bichoRef.current) {
        bichoRef.current = nb;
        setBicho(nb);
      }
      animais.visible = presenca > 0.02;

      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onMove);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", vis);
      geoT.dispose();
      gA.dispose();
      mat.dispose();
      mA.dispose();
      renderer.dispose();
      document.documentElement.style.cssText = antes[0];
      document.body.style.cssText = antes[1];
    };
  }, []);

  const cap = (i) => (n) => (caps.current[i] = n);
  const obra = sel >= 0 ? DISCO[sel] : null;
  const A = ANOS[ano];
  const anoDisco = ANOS_DISCO[disco];
  const itens = DISCO.map((d, i) => [d, i]).filter(([d]) => d.ano === anoDisco);
  const esp = ESPECIES.find((e) => e.id === bicho) || null;

  return (
    <main className={styles.raiz}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap"
      />
      <canvas ref={cv} className={styles.tela} aria-hidden="true" />
      <VoltarJodo />

      <div className={styles.palco}>
        <nav className={styles.menu} aria-label="Capítulos">
          {CAPS.map((c, i) => (
            <button key={c.id} type="button" ref={(n) => (menuRef.current[i] = n)} onClick={() => vaiPara(i, c.hold > 0 ? 0.12 : 0.02)}>
              <i>{String(i + 1).padStart(2, "0")}</i>
              {c.nome}
            </button>
          ))}
        </nav>

        {/* ============ 1. capa ============ */}
        <section ref={cap(0)} className={`${styles.cap} ${styles.capa}`} data-cap="capa">
          <div className={styles.heroTxt}>
            <Rv k={0} as="span" className={styles.rot}>vblxw</Rv>
            <Rv k={1} as="h1" className={styles.nome}>Vicente Blow</Rv>
            <Rv k={2} as="p" className={styles.sub}>rapper de Manaus · Bruxos do Norte · desde 2013</Rv>
            <Rv k={3} className={styles.cta}>
              <a className={styles.btn} href={PERFIS.spotify} target="_blank" rel="noreferrer">ouvir no Spotify ↗</a>
              <button type="button" className={styles.btn2} onClick={() => vaiPara(2, 0.12)}>ver o mapa ↓</button>
            </Rv>
          </div>
          <Rv k={4} as="p" className={styles.rolar}>role</Rv>
        </section>

        {/* ============ 2. quem é ============ */}
        <section ref={cap(1)} className={`${styles.cap} ${styles.quem}`} data-cap="quem">
          <div className={styles.quemGrid}>
            <h2 className={styles.quemT}>
              <Rv k={0} as="span">nasceu</Rv>
              <Rv k={1} as="span">marcado.</Rv>
              <Rv k={2} as="em">sobreviveu</Rv>
              <Rv k={3} as="em">rimando.</Rv>
            </h2>
            <div className={styles.quemTxt}>
              <Rv k={2} as="span" className={styles.rot}>nascido em 99</Rv>
              <Rv k={3} as="p" className={styles.capitular}>
                Nascido em 99, com o cordão umbilical enrolado no pescoço. Marcado para morrer, <mark>desafiou Deus e matou o próprio senhor destino.</mark>
              </Rv>
              <Rv k={4} as="p">Ver o mundo pelo pior lado foi sua terapia. Desenhar com sangue, seu primeiro ofício.</Rv>
              <Rv k={5} as="p">
                O rap acendeu a consciência política: o ódio bruto virou <mark>munição organizada</mark> e a caneta, uma mira a laser apontada para o alvo mais forte, o Capital.
              </Rv>
              <Rv k={6} as="p" className={styles.epi}>a.k.a. inimigo número 1 do estado</Rv>
            </div>
          </div>
          <ul className={styles.ficha}>
            {[["2013", "começa como bboy, aos 14 anos"], ["2017", "desperta para o rap · primeiro grupo, Interligados"], ["2020", "“Amazônia pega fogo”, o primeiro single"], ["13", "lançamentos, de 2020 a 2025"]].map(([b, s], i) => (
              <Rv key={b} k={5 + i} as="li"><b>{b}</b><span>{s}</span></Rv>
            ))}
          </ul>
        </section>

        {/* ============ 3. mapa ============ */}
        <section ref={cap(2)} className={`${styles.cap} ${styles.mapa}`} data-cap="mapa">
          <div className={styles.mapaTopo}>
            <Rv k={0} as="span" className={styles.rot}>o mapa</Rv>
            <Rv k={1} as="h2">cada marca no chão é uma obra dele.</Rv>
            <Rv k={2} as="p">Passe o cursor sobre as marcas. Mude o ano para ver o que acontecia com a mata enquanto ele gravava.</Rv>
          </div>
          <div className={`${styles.carta} ${obra ? styles.cartaOn : ""}`} data-ui>
            {obra ? (
              <>
                <div className={styles.cartaCapa}>{obra.capa && <img src={`/vb/capas/${obra.capa}.webp`} alt={`Capa de ${obra.t}`} />}</div>
                <div className={styles.cartaTxt}>
                  <small>{obra.ano} · {obra.data} · {obra.tag}</small>
                  <h3>{obra.t}</h3>
                  {obra.nota && <p>{obra.nota}</p>}
                  <div className={styles.cartaLinks}>
                    <a href={obra.url} target="_blank" rel="noreferrer">ouvir ↗</a>
                    {obra.falha && <a href={FALHA} target="_blank" rel="noreferrer">canal Falha ↗</a>}
                    {obra.com && obra.com.map((id) => (NOS[id] && NOS[id].rota ? <a key={id} href={NOS[id].rota}>{NOS[id].curto || NOS[id].nome} ↗</a> : null))}
                  </div>
                </div>
              </>
            ) : (
              <p className={styles.cartaVazia}>Passe o cursor sobre uma marca para ver a obra.</p>
            )}
          </div>
          <div className={styles.tempo} data-ui>
            <div className={styles.tempoAnos} role="tablist" aria-label="Ano">
              {ANOS.map((a, i) => (
                <button key={a.ano} type="button" role="tab" aria-selected={i === ano} className={i === ano ? styles.anoOn : i < ano ? styles.anoPassou : ""} onClick={() => escolheAno(i)}>
                  {a.ano}
                </button>
              ))}
            </div>
            <div className={styles.tempoTxt}>
              <b>{A.estado}</b>
              <p>{A.txt}</p>
            </div>
          </div>
        </section>

        {/* ============ 4. a mata viva ============ */}
        <section ref={cap(3)} className={`${styles.cap} ${styles.mata}`} data-cap="mata">
          <div className={styles.mataTopo}>
            <Rv k={0} as="span" className={styles.rot}>a mata viva</Rv>
            <Rv k={1} as="h2">a mata volta, e com ela <em>quem vive nela.</em></Rv>
          </div>
          <div className={styles.mataLegenda}>
            {esp ? (
              <>
                <b>{esp.nome}</b>
                <em>{esp.cient}</em>
                <p>{esp.fato}</p>
              </>
            ) : (
              <p className={styles.dicaBicho}>passe o cursor sobre os bichos</p>
            )}
          </div>
        </section>

        {/* ============ 5. discografia ============ */}
        <section ref={cap(4)} className={`${styles.cap} ${styles.discos}`} data-cap="discos">
          <div className={styles.discosEsq}>
            <Rv k={0} as="span" className={styles.rot}>discografia</Rv>
            <h2 key={anoDisco} className={styles.anoGrande}>{anoDisco}</h2>
            <div className={styles.passos} data-ui>
              {ANOS_DISCO.map((a, i) => (
                <button key={a} type="button" className={i === disco ? styles.passoOn : ""} onClick={() => vaiPara(4, ((i + 0.5) / ANOS_DISCO.length) * 0.97)}>{a}</button>
              ))}
            </div>
            <Rv k={2} as="p" className={styles.discosDica}>Cada cartão é uma marca do mapa. Role para passar de ano.</Rv>
          </div>
          <ul key={anoDisco} className={`${styles.itens} ${itens.length > 3 ? styles.itensMuitos : ""}`} data-ui onMouseLeave={() => (listaRef.current = -1)}>
            {itens.map(([d, i], k) => (
              <li key={d.t + d.data} style={{ "--k": k }} onMouseEnter={() => (listaRef.current = i)}>
                <a href={d.url} target="_blank" rel="noreferrer">
                  {d.capa && <img src={`/vb/capas/${d.capa}.webp`} alt={`Capa de ${d.t}`} />}
                  <span className={styles.itTxt}>
                    <small>{d.data} · {d.tag}</small>
                    <b>{d.t}</b>
                    {d.nota && <em>{d.nota}</em>}
                  </span>
                  <span className={styles.itSeta}>↗</span>
                </a>
                {(d.falha || (d.com && d.com.some((id) => NOS[id] && NOS[id].rota))) && (
                  <p className={styles.itLinks}>
                    {d.falha && <a href={FALHA} target="_blank" rel="noreferrer">canal Falha ↗</a>}
                    {d.com && d.com.map((id) => (NOS[id] && NOS[id].rota ? <a key={id} href={NOS[id].rota}>{NOS[id].curto || NOS[id].nome} ↗</a> : null))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ============ 6. ouvir ============ */}
        <section ref={cap(5)} className={`${styles.cap} ${styles.ouvir}`} data-cap="ouvir">
          <Rv k={0} as="span" className={styles.rot}>onde ouvir</Rv>
          <Rv k={1} as="h2">acende<br />o som.</Rv>
          <Rv k={2} as="p" className={styles.volta}>o caminho de volta pra casa.</Rv>
          <ul className={styles.plats}>
            {[
              ["Spotify", "artista e discografia", PERFIS.spotify],
              ["Deezer", "12 lançamentos", PERFIS.deezer],
              ["YouTube", "Ruído das Águas, o álbum completo", PERFIS.youtubeAlbum],
              ["SoundCloud", "o perfil do Bruxos do Norte", PERFIS.soundcloudGrupo],
              ["Instagram", "@bruxobuya", PERFIS.instagram],
            ].map(([nome, sub, u], i) => (
              <Rv key={nome} k={3 + i} as="li">
                <a href={u} target="_blank" rel="noreferrer">
                  <span className={styles.ic}><Icone r={nome} /></span>
                  <b>{nome}</b>
                  <em>{sub}</em>
                </a>
              </Rv>
            ))}
          </ul>
          <Rv k={8} as="p" className={styles.nota}>
            A paisagem é uma ilustração gerada em código: o relevo, o rio, as obras de terra e os bichos são inventados. Os números vêm de fontes públicas: INPE e IBGE.
          </Rv>
          <Rv k={9} as="button" type="button" className={styles.topo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            ↑ voltar ao início
          </Rv>
        </section>
      </div>

      <div ref={trilha} className={styles.trilha} />
    </main>
  );
}
