"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "@/styles/vicenteVarredura.module.css";
import { DISCO, PERFIS, FALHA } from "@/data/vicenteBlow";
import { NOS } from "@/data/conexoes";
import { SIL, amostraSilhueta } from "@/lib/silhuetas";
import { criaSom } from "@/lib/somMata";

/*
 * VBLXW · varredura.
 * A página é um scanner sobre o território: uma nuvem de pontos (LiDAR) gerada em código; o cursor é o feixe.
 *   retorno 1 = copa · retorno 2 = solo (valas e círculos de terra por baixo da floresta) · retornos do meio = estratos.
 * O censo é um transecto em corte lateral: 18 espécies aparecem como assinaturas de calor e o feixe as identifica.
 * Depois a câmera vira sensor térmico e o fogo apaga a copa e as assinaturas, deixando o chão.
 * Tudo é ilustrativo e feito em código; os números citados vêm de fontes públicas (IBGE, INPE, PNAS, estudos de LiDAR).
 */

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const lerp = (a, b, t) => a + (b - a) * t;
const h2 = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const vn = (x, y) => {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(h2(ix, iy), h2(ix + 1, iy), ux), lerp(h2(ix, iy + 1), h2(ix + 1, iy + 1), ux), uy);
};
const fbm = (x, y) => vn(x, y) * 0.5 + vn(x * 2.03, y * 2.03) * 0.25 + vn(x * 4.1, y * 4.1) * 0.125 + vn(x * 8.3, y * 8.3) * 0.0625;

// ---------- o território ----------
const LX = 340, LZ = 220;
const FOGO_I = [175, -12];
const rioZ = (x) => Math.sin(x * 0.016) * 10 + Math.sin(x * 0.045 + 1) * 3.5;
const TRIB_Z0 = rioZ(-60);
const tribX = (z) => -60 + (z - TRIB_Z0) * 0.28 + Math.sin(z * 0.05) * 8;
const LAGOS = [[95, 85, 13], [-140, -70, 10]];
const dAgua = (x, z) => {
  let d = Math.abs(z - rioZ(x)) - 8; // <0 dentro do rio principal
  if (z < TRIB_Z0 - 4 && z > -112) d = Math.min(d, Math.abs(x - tribX(z)) - 3);
  for (const [cx, cz, r] of LAGOS) d = Math.min(d, Math.hypot(x - cx, (z - cz) * 1.3) - r);
  return d;
};
// obras de terra: formas diferentes entre si (anel, octógono, fechadura, "U", raios, elipse, zigue-zague, avenidas curvas)
const OBRAS = [
  ["anelG", 0, 78, 12, 20, 30], ["octo", -62, 80, 15], ["fechadura", 74, 68, 16], ["u", -112, 72, 14, 0], ["zig", 122, 94, 26],
  ["raios", -30, -78, 18], ["elipse", 42, -80, 22, 12], ["quad", -96, -70, 12], ["anel", 112, -68, 11], ["anel", 112, -68, 5], ["octo", 0, -100, 8],
  ["anel", -140, 20, 12], ["quad", 140, -10, 9],
];
const AVENIDAS = [[-112, 72, -62, 80], [-62, 80, -30, 80], [30, 78, 74, 68], [74, 68, 122, 94], [-96, -70, -30, -78], [-30, -78, 42, -80], [42, -80, 112, -68], [0, -80, 0, -100], [-140, 20, -140, 60], [140, -10, 140, 40]];
const segDist = (px, pz, ax, az, bx, bz) => {
  const dx = bx - ax, dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
};
const gauss = (e, w) => Math.exp(-((e / w) ** 2));
const vala = (x, z) => {
  let d = 0;
  for (const [tp, cx, cz, a, b, c3] of OBRAS) {
    const dx = x - cx, dz = z - cz;
    const r = Math.hypot(dx, dz);
    if (r > a * 1.9 + 8) continue;
    if (tp === "anel") d += 2.6 * gauss(Math.abs(r - a), 1.0);
    else if (tp === "anelG") {
      // três anéis concêntricos com quatro entradas (calçadas) nos eixos
      const ang = Math.atan2(dz, dx);
      const k = Math.abs((((ang + Math.PI / 4) % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2) - Math.PI / 4);
      const f = k < 0.11 ? 0.06 : 1;
      for (const rad of [a, b, c3]) d += 2.6 * gauss(Math.abs(r - rad), 1.0) * f;
    }
    else if (tp === "quad") d += 2.6 * gauss(Math.abs(Math.max(Math.abs(dx), Math.abs(dz)) - a), 1.0);
    else if (tp === "octo") d += 2.6 * gauss(Math.abs(Math.max(Math.max(Math.abs(dx), Math.abs(dz)), (Math.abs(dx) + Math.abs(dz)) / 1.414) - a), 1.25);
    else if (tp === "elipse") d += 2.6 * gauss(Math.abs(Math.hypot(dx / a, dz / b) - 1) * Math.min(a, b), 1.25);
    else if (tp === "fechadura") {
      d += 2.6 * gauss(Math.abs(r - a), 1.25);
      d += 1.8 * gauss(segDist(x, z, cx, cz + a, cx, cz + a * 2.4), 1.0) * (z > cz ? 1 : 0);
      d += 1.8 * gauss(segDist(x, z, cx - 4, cz + a * 2.4, cx + 4, cz + a * 2.4), 1.0);
    } else if (tp === "u") {
      const k = Math.abs(Math.max(Math.abs(dx), Math.abs(dz)) - a);
      const lado = b === 0 ? dz > -a + 1 : b === 1 ? dx < a - 1 : dz < a - 1;
      if (lado || Math.abs(dx) > a || Math.abs(dz) > a) d += 2.6 * gauss(k, 1.25) * (Math.abs(dx) <= a + 2 && Math.abs(dz) <= a + 2 ? 1 : 0) * (b === 2 ? (dz < a - 2 ? 1 : 0) : 1);
    } else if (tp === "raios") {
      d += 2.6 * gauss(Math.abs(r - a), 1.25);
      const ang = Math.atan2(dz, dx);
      const sp = Math.abs(((ang / (Math.PI / 3)) % 1 + 1) % 1 - 0.5);
      d += 1.6 * gauss((0.5 - sp) * r, 0.9) * (r < a ? 1 : 0);
    } else if (tp === "zig") {
      const zz = Math.sin(dx * 0.45) * 3.2;
      d += 2.2 * gauss(dz - zz, 1.1) * (Math.abs(dx) < a ? 1 : 0);
    }
  }
  for (const [ax, az, bx, bz] of AVENIDAS) d += 1.5 * gauss(segDist(x, z, ax, az, bx, bz), 1.0);
  return Math.min(d, 2.8);
};
const solo = (x, z) => {
  let g = 9 + fbm(x * 0.011, z * 0.011) * 10;
  const da = dAgua(x, z);
  g -= 12 * sm((6 - da) / 9);
  g -= vala(x, z);
  return g;
};
const copaAlt = (x, z) => {
  let c = 0;
  const cs = 5.2, cx = Math.floor(x / cs), cz = Math.floor(z / cs);
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      const a = cx + i, b = cz + j;
      const px = (a + 0.15 + h2(a, b) * 0.7) * cs, pz = (b + 0.15 + h2(b + 7, a + 3) * 0.7) * cs;
      const r = 2.6 + h2(a + 11, b + 5) * 3.8;
      const d = Math.hypot(x - px, z - pz) / r;
      if (d < 1) {
        const hh = 22 + h2(a + 1, b + 9) * 17 + (h2(a + 5, b + 2) > 0.93 ? 12 + h2(a + 3, b + 8) * 10 : 0);
        c = Math.max(c, hh * Math.sqrt(1 - d * d));
      }
    }
  c = Math.max(c, (11 + fbm(x * 0.05, z * 0.05) * 9) * 0.75);
  return c * sm((dAgua(x, z) - 1) / 8);
};

function amostra(P, px, pz, passo) {
  const g = solo(px, pz), c = copaAlt(px, pz);
  const agua = dAgua(px, pz) < -0.5 ? 1 : 0;
  const dv = Math.min(1, vala(px, pz) / 2.2);
  const rnd = h2(px * 5.3, pz * 4.7);
  if (agua) {
    P.push([px, pz, -2.4, -2.4, -2.4, 0, dv, rnd, 1, 1]);
    const leito = -14 + h2(px * 2.1, pz * 1.7) * 1.6;
    P.push([px, pz, -2.4, leito, leito, 1, 0, rnd, 0, 1]);
  } else {
    P.push([px, pz, g + c, g, g, 0, dv, rnd, 0, c > 1.5 ? 0 : 1]);
    if (c <= 1.5 || rnd < 0.6) P.push([px, pz, g + c, g, g, 1, dv, h2(px * 2.2, pz * 7.1), 0, c > 1.5 ? 0 : 1]);
    if (dv > 0.3) for (let k = 0; k < 3; k++) P.push([px + (h2(px + k, pz) - 0.5) * passo, pz + (h2(px, pz + k) - 0.5) * passo, g + c, g, g, 1, dv, h2(px * 3.3 + k, pz * 1.9), 0, 1]);
    // retornos intermediários (troncos, sub-bosque): dão profundidade quando a câmera chega perto
    if (c > 8 && h2(px * 9.1, pz * 3.3) < 0.6) {
      const hm = g + c * (0.08 + h2(px * 1.9, pz * 8.3) * 0.82);
      P.push([px + (h2(px, 5) - 0.5) * passo, pz, g + c, g, hm, 2, 0, h2(px * 3.7, pz * 2.1), 0, 0]);
    }
  }
}

function geraTerreno(passo, fino) {
  const P = [];
  for (let x = -LX / 2; x < LX / 2; x += passo)
    for (let z = -LZ / 2; z < LZ / 2; z += passo)
      amostra(P, x + (h2(x * 3.1, z * 1.7) - 0.5) * passo, z + (h2(x * 1.3, z * 2.9) - 0.5) * passo, passo);
  // malha fina em volta de cada ambiente do censo, para o zoom de perto
  for (const h of HABS)
    if (!h.semFino) for (let x = h.cx - 34; x < h.cx + 34; x += fino)
      for (let z = h.cz - 21; z < h.cz + 21; z += fino)
        amostra(P, x + (h2(x * 3.1, z * 1.7) - 0.5) * fino, z + (h2(x * 1.3, z * 2.9) - 0.5) * fino, fino);
  return P;
}

// ---------- shaders do terreno ----------
const VERT = `
attribute float aH1,aH2,aHm,aKind,aDitch,aRnd,aWater,aOpen;
uniform float uT,uPeel,uFire,uSweep,uPx,uTherm,uSlab,uStr,uSlabC,uDraw,uGrow,uWipe;
uniform vec3 uTint;
uniform vec2 uI;
uniform vec3 uB[16];
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
  float hab=h-aH2;                 // altura acima do chão
  float alt=aH1-aH2;               // espessura da copa
  // feixe: no corte lateral ele mede em (x, altura); na vista de cima, em (x, z)
  vec2 q=mix(p,vec2(p.x,h),step(.5,uSlab));
  float scan=0.;
  for(int i=0;i<16;i++){float d=length(q-uB[i].xy);scan=max(scan,uB[i].z*(1.-smoothstep(1.5,16.,d)));}
  float sw=exp(-pow((p.x-uSweep)/3.2,2.));
  float wp=exp(-pow((p.x-uWipe)/5.,2.))*step(uWipe,9000.)*uSlab;
  float lit=max(max(max(scan,sw*.9),uSlab*.12),wp);
  float peel=clamp(uPeel+scan*.95*(1.-step(.5,uSlab)),0.,1.);
  // fogo: frente irregular vinda do leste
  float fd=length(p-uI)+(n2(p*.07+3.)-.5)*52.;
  float R=uFire*470.-20.;
  float queimado=smoothstep(R-40.,R-76.,fd);
  float quente=smoothstep(R+6.,R-16.,fd)*(1.-smoothstep(R-16.,R-66.,fd));
  float brota=step(aRnd,uGrow)*uGrow;
  float ditch=aDitch*(1.-smoothstep(uDraw*340.-80.,uDraw*340.,length(p)));
  vec3 pos=vec3(p.x,h,p.y);
  vec3 col;float a;
  if(aKind<.5){
    // retorno 1: copa, fria e verde-água, mais clara quanto mais alta
    col=mix(vec3(.05,.42,.36),vec3(.55,.95,.78),smoothstep(2.,32.,alt));
    col=mix(col,vec3(.9,1.,.95),smoothstep(32.,46.,alt));
    if(aWater>.5)col=vec3(.35,.62,.8);
    float vis=aWater>.5?1.:(1.-peel)*(1.-queimado*(1.-brota));
    a=vis*(.3+.7*lit);
    pos.y=mix(pos.y,aH2+(h-aH2)*uGrow,queimado*brota);
    pos.y+=quente*aRnd*24.*(.4+.6*fract(uT*.25+aRnd*5.));
    col=mix(col,vec3(.5,1.,.62),queimado*brota*.45);
  }else if(aKind<1.5){
    // retorno 2: solo em areia; as valas em urucum
    col=mix(vec3(.28,.2,.12),vec3(.93,.82,.6),smoothstep(-2.,16.,aH2));
    col=mix(col,vec3(1.,.36,.14),ditch*(.45+.55*peel));
    float vis=max(max(max(peel,queimado),aOpen*.55),uSlab*.3);
    a=vis*(.7+.3*lit)*(1.+ditch*2.2)+queimado*.3;
    col=mix(col,vec3(.22,.06,.03),queimado*.55*(1.-ditch));
  }else{
    // retornos do meio: troncos e sub-bosque
    col=mix(vec3(.62,.66,.16),vec3(.2,.7,.52),smoothstep(0.,alt*.9,hab));
    float vis=(1.-peel*.92)*(1.-queimado*(1.-brota));
    a=vis*(.22+.55*lit);
    pos.y=mix(pos.y,aH2+(h-aH2)*uGrow,queimado*brota);
    pos.y+=quente*aRnd*14.*(.4+.6*fract(uT*.3+aRnd*7.));
  }
  // estratos: cor por faixa de altura (corte lateral)
  vec3 cs=vec3(.93,.78,.4);
  cs=mix(cs,vec3(.78,.9,.28),smoothstep(4.,8.,hab));
  cs=mix(cs,vec3(.32,.9,.8),smoothstep(25.,29.,hab));
  cs=mix(cs,vec3(.7,.55,1.),smoothstep(41.,45.,hab));
  if(aWater>.5)cs=vec3(.4,.65,.95);
  col=mix(col,cs,uStr*(aKind>1.5?.95:.8));
  // modo térmico: tudo vira ironbow, o fogo é branco
  float ht=aKind<.5?(.1+smoothstep(0.,40.,alt)*.2):(aKind<1.5?(.22+smoothstep(-2.,16.,aH2)*.12):(.15+smoothstep(0.,40.,hab)*.15));
  float heat=clamp(ht+quente*.9+queimado*.12,0.,1.);
  vec3 th=iron(heat);
  if(ditch>.3&&aKind>.5&&aKind<1.5)th=mix(th,iron(.55),.7);
  col=mix(col,th,uTherm*(aWater>.5?.4:.85));
  col=mix(col,vec3(1.,.9,.5),quente*.5);
  a=max(a,quente*.9*(aKind<.5?1.:.4));
  a=max(a,wp*.55);
  // transecto: só uma faixa de 40 m fica visível no corte
  float slab=1.-smoothstep(17.,25.,abs(p.y-uSlabC));
  a*=mix(1.,slab*.34,uSlab);
  col*=mix(vec3(1.),uTint,uSlab);
  vec4 mv=modelViewMatrix*vec4(pos,1.);
  gl_Position=projectionMatrix*mv;
  float dist=-mv.z;
  float sz=(aKind<.5?2.4:(aKind<1.5?2.0+ditch*2.4:1.6))*(1.+lit*.7+quente*.6);
  gl_PointSize=clamp(sz*uPx*(150./dist),1.,mix(7.,3.2,uSlab)*uPx);
  vCol=col;vA=a*exp(-dist*.0036);
}`;
const FRAG = `precision mediump float;varying vec3 vCol;varying float vA;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.26,d)*vA;if(a<.01)discard;gl_FragColor=vec4(vCol,a);}`;
const VERT_A = `uniform float uPx,uT;attribute float aR,aHue,aVis;varying float vA;varying float vH;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
gl_PointSize=clamp(2.2*uPx*(150./-mv.z)*(.8+aR*.4)*(1.+max(aVis-1.,0.)*.5),1.8,5.5*uPx);
vA=min(aVis,1.3)*(.62+.38*aR)*(.86+.14*sin(uT*3.+aR*20.));vH=aHue;}`;
const FRAG_A = `precision mediump float;varying float vA;varying float vH;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.1,d)*vA;if(a<.01)discard;
vec3 w=mix(vec3(1.,.52,.12),vec3(1.,.97,.82),smoothstep(.34,0.,d));
vec3 l=mix(vec3(.55,.95,.15),vec3(.95,1.,.7),smoothstep(.34,0.,d));
vec3 b=mix(vec3(.2,.55,1.),vec3(.8,.92,1.),smoothstep(.34,0.,d));
vec3 c=vH<.5?w:(vH<1.5?l:b);gl_FragColor=vec4(c,a);}`;

// ---------- o censo: 18 espécies, só como assinaturas de calor ----------
const rr = (s) => () => {
  s = (s * 16807) % 2147483647;
  return (s - 1) / 2147483646;
};
const quad = (L, H, W, leg, extra = []) => [
  [0, 0, 0, L, H, W, Math.round(L * 10)],
  [L * 1.28, H * 0.55, 0, L * 0.36, H * 0.55, W * 0.55, 8],
  [-L * 1.3, H * 0.4, 0, L * 0.55, H * 0.18, W * 0.18, 5],
  ...[0.62, -0.62].flatMap((sx) => [1, -1].map((sz) => [L * sx, -H - leg * 0.5, W * sz * 0.7, 0.25, leg * 0.5, 0.25, 3])),
  ...extra,
];
const ESPECIES = [
  { id: "onca", nome: "onça-pintada", cient: "Panthera onca", est: "chão", fato: "O maior felino das Américas. Caça sozinha, de noite, perto da água.", tipo: "chao", partes: quad(2.4, 0.95, 0.9, 0.9), n: 1, v: 1.7, hy: 2.0 },
  { id: "anta", nome: "anta", cient: "Tapirus terrestris", est: "chão", fato: "O maior mamífero terrestre da América do Sul. Planta a floresta: espalha as sementes que come.", tipo: "chao", partes: quad(2.2, 1.1, 1.0, 0.8, [[3.0, 0.2, 0, 0.9, 0.5, 0.45, 6]]), n: 1, v: 1.3, hy: 1.9 },
  { id: "capivara", nome: "capivara", cient: "Hydrochoerus hydrochaeris", est: "margem", fato: "O maior roedor do mundo. Anda em grupo e vive colada à água.", tipo: "margem", partes: quad(1.5, 0.8, 0.8, 0.5), n: 3, v: 0.7, hy: 1.2 },
  { id: "tamandua", nome: "tamanduá-bandeira", cient: "Myrmecophaga tridactyla", est: "chão", fato: "Não tem dentes. Passa o dia lambendo formigueiros com uma língua de mais de meio metro.", tipo: "chao", partes: quad(1.9, 0.8, 0.6, 0.8, [[3.4, 0.0, 0, 1.3, 0.22, 0.22, 7], [-3.0, 0.9, 0, 2.1, 0.9, 0.35, 10]]), n: 1, v: 1.0, hy: 1.5 },
  { id: "guariba", nome: "guariba", cient: "Alouatta sp.", est: "dossel", fato: "O rugido do macho se ouve a quilômetros. Anda em bando pela copa.", tipo: "dossel", partes: [[0, 0, 0, 0.8, 1.0, 0.6, 10], [0.2, 1.3, 0, 0.5, 0.5, 0.5, 5], [-1.1, 0.2, 0, 1.6, 0.18, 0.18, 6]], n: 4, v: 0.9, hy: 0.4 },
  { id: "preguica", nome: "preguiça-real", cient: "Choloepus didactylus", est: "dossel", fato: "Vive pendurada nas copas e quase não desce. Move-se tão devagar que cresce alga no pelo.", tipo: "dossel", partes: [[0, 0, 0, 0.9, 0.6, 0.6, 10], [0.9, 0.5, 0, 0.4, 0.4, 0.4, 4], [0, 0.2, 0.8, 0.2, 1.0, 0.2, 3], [0, 0.2, -0.8, 0.2, 1.0, 0.2, 3]], n: 1, v: 0.15, hy: 0.2 },
  { id: "harpia", nome: "harpia", cient: "Harpia harpyja", est: "emergente", fato: "Uma das maiores águias do mundo. Caça macacos e preguiças acima da copa.", tipo: "planar", partes: [[0, 0, 0, 0.9, 0.5, 0.4, 6], [0, 0.2, 2.0, 1.1, 0.1, 2.1, 10, 1], [0, 0.2, -2.0, 1.1, 0.1, 2.1, 10, 1]], n: 1, v: 0.12, hy: 72 },
  { id: "arara", nome: "arara-vermelha", cient: "Ara chloropterus", est: "voo", fato: "Voa em casais, quase sempre de dois em dois. Cruza a mata em bandos ao amanhecer.", tipo: "voo", partes: [[0, 0, 0, 0.8, 0.25, 0.25, 4], [0, 0.1, 0.95, 0.45, 0.08, 1.0, 3, 1], [0, 0.1, -0.95, 0.45, 0.08, 1.0, 3, 1], [-1.4, 0, 0, 0.8, 0.08, 0.08, 3]], n: 7, v: 10, hy: 52 },
  { id: "tucano", nome: "tucano", cient: "Ramphastos sp.", est: "dossel", fato: "O bico enorme é leve e oco. Ele engole frutos inteiros e semeia a mata.", tipo: "dossel", partes: [[0, 0, 0, 0.7, 0.4, 0.3, 6], [1.2, 0, 0, 0.8, 0.15, 0.15, 5]], n: 2, v: 0.25, hy: 0.6 },
  { id: "morcego", nome: "morcegos", cient: "Chiroptera", est: "sub-bosque", fato: "Dispersam sementes e polinizam. Saem ao escurecer e se orientam pelo eco.", tipo: "enxame", partes: [[0, 0, 0, 0.3, 0.2, 0.2, 2], [0, 0, 0.7, 0.3, 0.05, 0.7, 2, 1], [0, 0, -0.7, 0.3, 0.05, 0.7, 2, 1]], n: 8, v: 6, hy: 16, hue: 0 },
  { id: "vagalume", nome: "vagalumes", cient: "Lampyridae", est: "sub-bosque", fato: "Produzem luz fria: quase nenhum calor sai dela. Por isso só aparecem no feixe, não no térmico.", tipo: "enxame", partes: [[0, 0, 0, 5, 3, 5, 36]], n: 1, v: 0.4, hy: 12, hue: 1, pontos: true },
  { id: "morpho", nome: "borboleta-morfo", cient: "Morpho sp.", est: "sub-bosque", fato: "O azul não é pigmento: vem da estrutura microscópica da asa, que reflete a luz.", tipo: "enxame", partes: [[0, 0, 0.5, 0.4, 0.05, 0.55, 3, 1], [0, 0, -0.5, 0.4, 0.05, 0.55, 3, 1]], n: 4, v: 1.6, hy: 9, hue: 2 },
  { id: "sauva", nome: "saúvas", cient: "Atta sp.", est: "chão", fato: "Carregam folhas para cultivar um fungo, o único alimento da colônia. Fazem agricultura há milhões de anos.", tipo: "trilha", partes: [[0, 0, 0, 0.3, 0.1, 0.3, 1]], n: 26, v: 1.1, hy: 0.3, hue: 1 },
  { id: "boto", nome: "boto-cor-de-rosa", cient: "Inia geoffrensis", est: "rio", fato: "O maior golfinho de rio do mundo. A cor rosa vem da idade e da cicatrização.", tipo: "rio", partes: [[0, 0, 0, 2.2, 0.6, 0.6, 16], [2.6, 0, 0, 0.8, 0.1, 0.1, 4], [-0.3, 0.9, 0, 0.35, 0.35, 0.1, 3], [-2.8, 0.1, 0, 0.7, 0.1, 0.8, 5]], n: 2, v: 4, hy: -1 },
  { id: "ariranha", nome: "ariranha", cient: "Pteronura brasiliensis", est: "rio", fato: "A maior lontra do mundo. Vive em família e pesca em grupo.", tipo: "rio", partes: quad(0.9, 0.35, 0.35, 0.2, [[-2.2, 0, 0, 1.1, 0.12, 0.2, 4]]), n: 3, v: 1.4, hy: -0.6 },
  { id: "peixeboi", nome: "peixe-boi-da-amazônia", cient: "Trichechus inunguis", est: "rio", fato: "O único peixe-boi que vive só em água doce. Come plantas aquáticas e sobe para respirar.", tipo: "rio", partes: [[0, 0, 0, 2.4, 0.9, 0.9, 22], [-3.2, 0, 0, 0.9, 0.1, 0.9, 6]], n: 1, v: 0.7, hy: -4 },
  { id: "pirarucu", nome: "pirarucu", cient: "Arapaima gigas", est: "rio", fato: "Um dos maiores peixes de água doce do mundo. Sobe à superfície para respirar ar.", tipo: "rio", partes: [[0, 0, 0, 2.6, 0.45, 0.4, 12], [-3.1, 0, 0, 0.8, 0.5, 0.12, 4]], n: 3, v: 1.2, hy: -3.4 },
  { id: "jacare", nome: "jacaré-açu", cient: "Melanosuchus niger", est: "margem", fato: "O maior jacaré da Amazônia. Espera imóvel na margem, quase sem calor.", tipo: "margem", partes: [[0, 0, 0, 3.4, 0.45, 0.6, 24], [-4.7, 0, 0, 2.0, 0.2, 0.3, 10], [4.0, 0, 0, 0.9, 0.2, 0.3, 6]], n: 2, v: 0.25, hy: 0.4 },
];

const ESC = 3.1;
const HABS = [
  { id: "copa", nome: "a copa", sub: "de 30 a 45 m acima do chão, onde a luz bate primeiro", cx: -70, cz: 0, dy: 30, off: [0, 3, 60], tint: [1.06, 1.0, 0.8] },
  { id: "sub", nome: "o sub-bosque", sub: "à sombra, com o ar parado e pouca luz", cx: -25, cz: 0, dy: 10, off: [0, 1, 46], tint: [0.76, 1.0, 0.86] },
  { id: "chao", nome: "o chão", sub: "serapilheira, raízes e trilhas", cx: 22, cz: -4, dy: 3, off: [0, -1, 42], tint: [1.1, 0.9, 0.66] },
  { id: "margem", nome: "a margem", sub: "onde a mata encontra a água", cx: 62, cz: rioZ(62), dy: 4, off: [0, 5, 46], tint: [1.04, 0.98, 0.86] },
  { id: "rio", nome: "o rio", sub: "a superfície, onde quem respira precisa subir", cx: 105, cz: rioZ(105), dy: 1.5, abs: true, off: [0, 4, 44], tint: [0.72, 0.92, 1.22] },
  { id: "fundo", nome: "o fundo", sub: "onde o rio pesa e a luz não chega", cx: 105, cz: rioZ(105), dy: -8.5, abs: true, off: [0, 0, 38], tint: [0.6, 0.84, 1.28], semFino: true },
];
HABS.forEach((h) => (h.ty = h.abs ? h.dy : solo(h.cx, h.cz) + h.dy));
const HABDE = { guariba: 0, preguica: 0, tucano: 0, arara: 0, harpia: 0, morcego: 1, vagalume: 1, morpho: 1, onca: 2, anta: 2, tamandua: 2, sauva: 2, capivara: 3, jacare: 3, boto: 4, ariranha: 4, peixeboi: 5, pirarucu: 5 };
const HYDE = { arara: 6, harpia: 14, morcego: 11, vagalume: 6, morpho: 5, boto: -0.6, ariranha: -0.3, peixeboi: -9.5, pirarucu: -5 };
const LAY = {
  guariba: { dx: -30, gap: 9, A: 3 }, tucano: { dx: -6, gap: 14, A: 2 }, preguica: { dx: 22, gap: 0, A: 0.5 }, harpia: { dx: 36, gap: 0, A: 0 }, arara: { dx: 0, gap: 12, A: 0 },
  morcego: { dx: -22, gap: 7, A: 6 }, vagalume: { dx: 0, gap: 0, A: 0 }, morpho: { dx: 22, gap: 8, A: 6 },
  onca: { dx: -22, gap: 0, A: 5 }, anta: { dx: 2, gap: 0, A: 5 }, tamandua: { dx: 26, gap: 0, A: 4 }, sauva: { dx: 0, gap: 0, A: 0 },
  capivara: { dx: -24, gap: 11, A: 3 }, jacare: { dx: 18, gap: 24, A: 2 },
  boto: { dx: -22, gap: 18, A: 5 }, ariranha: { dx: 20, gap: 11, A: 3 }, peixeboi: { dx: -18, gap: 0, A: 6 }, pirarucu: { dx: 16, gap: 0, A: 4 },
};
const ANDA = new Set(["onca", "anta", "tamandua", "capivara", "ariranha"]);
const LIFT = { guariba: 0.5, preguica: 4.5, tucano: 0.6 };
ESPECIES.forEach((e) => {
  e.hab = HABDE[e.id];
  if (HYDE[e.id] !== undefined) e.hy = HYDE[e.id];
  e.lift = LIFT[e.id] || 0;
});
const rodaXZ = (lx, lz, c, s) => [lx * c - lz * s, lx * s + lz * c];

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

// número que sobe até o valor quando entra na tela
function Conta({ fim, fmt = (v) => Math.round(v).toLocaleString("pt-BR"), sufixo = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.textContent = fmt(0) + sufixo;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const passo = (n) => {
          const k = Math.min(1, (n - t0) / 1400);
          el.textContent = fmt(fim * (1 - (1 - k) ** 3)) + sufixo;
          if (k < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fim]);
  return <span ref={ref}>{fim}</span>;
}

export default function VicenteVarredura() {
  const cv = useRef(null);
  const secs = useRef([]);
  const hud = useRef({});
  const rotulos = useRef({});
  const marcas = useRef({});
  const reticula = useRef(null);
  const calorSec = useRef(null);
  const toast = useRef(null);
  const menuRef = useRef([]);
  const [capaSel, setCapaSel] = useState(null);
  const [reg, setReg] = useState([]);
  const [foco, setFoco] = useState(null);
  const [hab, setHab] = useState(0);
  const [perdReg, setPerdReg] = useState(0);
  const perdRef = useRef(0);
  const somRef = useRef(null);
  const somLigado = useRef(false);
  const [somOn, setSomOn] = useState(false);
  const eqRef = useRef(null);
  const alternaSom = () => {
    if (!somRef.current) somRef.current = criaSom();
    const sm2 = somRef.current;
    if (!sm2) return;
    if (somLigado.current) { sm2.desligar(); somLigado.current = false; setSomOn(false); }
    else { sm2.ligar(); somLigado.current = true; setSomOn(true); }
  };
  const habRef = useRef(-1);
  const capaFlut = useRef(null);
  const regRef = useRef(new Set());
  const mouse = useRef({ x: 0, y: 0, cx: 0, cy: 0, tocou: 0, px: -999, py: -999 });

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
    const cam = new THREE.PerspectiveCamera(mobile ? 60 : 46, innerWidth / innerHeight, 1, 1200);
    renderer.setSize(innerWidth, innerHeight, false);

    // ===== nuvem de pontos =====
    const pts = geraTerreno(mobile ? 1.25 : 0.72, mobile ? 0.62 : 0.4);
    const N = pts.length;
    const pos = new Float32Array(N * 3);
    const A = { aH1: 3, aH2: 4, aHm: 5, aKind: 6, aDitch: 7, aRnd: 8, aWater: 9, aOpen: 10 };
    // q = [x, z, h1, h2, hm, kind, ditch, rnd, water, open]
    const att = {};
    Object.keys(A).forEach((k) => (att[k] = new Float32Array(N)));
    const cols = { aH1: 2, aH2: 3, aHm: 4, aKind: 5, aDitch: 6, aRnd: 7, aWater: 8, aOpen: 9 };
    pts.forEach((q, i) => {
      pos[i * 3] = q[0];
      pos[i * 3 + 2] = q[1];
      for (const k in cols) att[k][i] = q[cols[k]];
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    Object.entries(att).forEach(([k, v]) => geo.setAttribute(k, new THREE.BufferAttribute(v, 1)));
    const B = Array.from({ length: 16 }, () => new THREE.Vector3(999, 999, 0));
    const U = {
      uT: { value: 0 }, uPeel: { value: 0 }, uFire: { value: 0 }, uSweep: { value: -200 }, uPx: { value: dpr }, uTherm: { value: 0 },
      uSlab: { value: 0 }, uStr: { value: 0 }, uSlabC: { value: 0 }, uDraw: { value: 0 }, uGrow: { value: 0 }, uWipe: { value: -99999 }, uTint: { value: new THREE.Vector3(1, 1, 1) }, uI: { value: new THREE.Vector2(FOGO_I[0], FOGO_I[1]) }, uB: { value: B },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const nuvem = new THREE.Points(geo, mat);
    nuvem.frustumCulled = false;
    scene.add(nuvem);

    // ===== o censo =====
    const rnd = rr(20261018);
    const todos = [];
    ESPECIES.forEach((sp, si) => {
      let base = [];
      sp.base1 = null;
      sp.sil = !!SIL[sp.id];
      if (sp.sil) {
        // silhueta de perfil amostrada em pontos (e uma segunda pose para quem bate asa)
        const passo = sp.n >= 4 ? 3.8 : sp.n >= 2 ? 3.0 : 2.4;
        const f0 = amostraSilhueta(sp.id, 0, passo, si + 3);
        base = f0.map(([x, y]) => [x, y, (rnd() - 0.5) * 0.9, 0, rnd()]);
        if (SIL[sp.id].poses > 1) {
          const f1 = amostraSilhueta(sp.id, 1, passo, si + 11);
          sp.base1 = base.map((q, k) => [f1[k % f1.length][0], f1[k % f1.length][1], q[2], 0, q[4]]);
        }
      } else {
        const denso = sp.pontos || sp.tipo === "trilha" ? 1.6 : 3.2;
        sp.partes.forEach(([cx, cy, cz, rx, ry, rz, n, asa]) => {
          const nn = Math.max(1, Math.round(n * denso));
          for (let k = 0; k < nn; k++) {
            const a = rnd() * 6.283, bb = Math.acos(2 * rnd() - 1), r = Math.cbrt(rnd());
            base.push([cx + rx * r * Math.sin(bb) * Math.cos(a), cy + ry * r * Math.cos(bb), cz + rz * r * Math.sin(bb) * Math.sin(a), asa ? 1 : 0, rnd()]);
          }
        });
      }
      sp.base = base;
      sp.foot = 0;
      sp.hgt = Math.max(1, ...base.map((q) => q[1]));
      sp.anda = ANDA.has(sp.id);
      sp.inds = [];
      const H = HABS[sp.hab];
      for (let k = 0; k < sp.n; k++) {
        let x = H.cx + (rnd() - 0.5) * 34, z = H.cz + (rnd() - 0.5) * 14;
        if (sp.tipo === "rio") { x = H.cx + (rnd() - 0.5) * 44; z = rioZ(x); }
        if (sp.tipo === "margem") { x = H.cx + (rnd() - 0.5) * 36; z = rioZ(x) + (k % 2 ? 10.5 : -10.5); }
        if (sp.tipo === "voo") { x = H.cx - 70 - k * 7; z = H.cz + (rnd() - 0.5) * 12; }
        if (sp.tipo === "trilha") { x = H.cx - 20; z = H.cz + 3; }
        if (sp.id === "preguica") { x = H.cx + 8; z = H.cz + 2; }
        sp.inds.push({ x, z, hd: rnd() * 6.283, ph: rnd() * 6.283, fuga: 0, oculto: false, dir: rnd() > 0.5 ? 1 : -1 });
      }
      sp.idx0 = todos.length;
      sp.total = sp.inds.length * base.length;
      sp.inds.forEach((ind) => base.forEach((b) => todos.push({ si, ind, b })));
    });
    const M = todos.length;
    const aPos = new Float32Array(M * 3), aR = new Float32Array(M), aHue = new Float32Array(M), aVis = new Float32Array(M);
    todos.forEach((p, i) => {
      aR[i] = p.b[4];
      aHue[i] = ESPECIES[p.si].hue || 0;
    });
    const gA = new THREE.BufferGeometry();
    gA.setAttribute("position", new THREE.BufferAttribute(aPos, 3));
    gA.setAttribute("aR", new THREE.BufferAttribute(aR, 1));
    gA.setAttribute("aHue", new THREE.BufferAttribute(aHue, 1));
    gA.setAttribute("aVis", new THREE.BufferAttribute(aVis, 1));
    const mA = new THREE.ShaderMaterial({ vertexShader: VERT_A, fragmentShader: FRAG_A, uniforms: { uPx: { value: dpr }, uT: { value: 0 } }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const animais = new THREE.Points(gA, mA);
    animais.frustumCulled = false;
    scene.add(animais);

    // anel do feixe
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.88, 1, 56),
      new THREE.MeshBasicMaterial({ color: 0x7cf2d0, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthTest: false, side: THREE.DoubleSide })
    );
    scene.add(ring);

    // câmera: um quadro por seção (posição, alvo)
    const KEYS = [
      [[12, 78, 170], [0, 10, 0]],
      [[-110, 62, 120], [-10, 10, -10]],
      [[0, 230, 56], [0, 0, 0]],
      [[0, 16, 185], [0, 16, 0]],
      [[-150, 56, 80], [70, 10, -8]],
      [[-70, 118, 140], [60, 4, 0]],
      [[0, 270, 70], [0, 0, 0]],
      [[14, 285, 86], [0, 0, 0]],
    ];
    const ray = new THREE.Raycaster();
    const planoXZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), -6);
    const planoXY = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3(), v3 = new THREE.Vector3();
    const camPos = new THREE.Vector3(), camAlvo = new THREE.Vector3();
    const rastro = [];
    let ultRastro = 0, ultMouse = performance.now();
    const beam = { x: 0, z: 0, y: 0 };
    const trava = { id: null, t: 0 };

    const onMove = (e) => {
      const m = mouse.current;
      m.x = (e.clientX / innerWidth) * 2 - 1;
      m.y = -(e.clientY / innerHeight) * 2 + 1;
      m.tocou = 1;
      ultMouse = performance.now();
      m.px = e.clientX;
      m.py = e.clientY;
    };
    let clique = false;
    const onDown = (e) => {
      onMove(e);
      clique = true;
      const now = performance.now();
      for (let k = 0; k < 6; k++) rastro.push({ x: beam.x + (Math.random() - 0.5) * 16, z: beam.z + (Math.random() - 0.5) * 16, t: now, f: 1.3 });
    };
    const onResize = () => {
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight, false);
    };
    addEventListener("pointermove", onMove);
    addEventListener("pointerdown", onDown);
    addEventListener("resize", onResize);

    let raf, t0 = performance.now(), ult = t0, ativo = true, toastT = 0, wipeT = 1, ihabAnt = -1;
    const vis = () => (ativo = !document.hidden);
    document.addEventListener("visibilitychange", vis);
    const txt = (k, v) => {
      const el = hud.current[k];
      if (el && el.textContent !== v) el.textContent = v;
    };
    const registra = (sp) => {
      if (regRef.current.has(sp.id)) return;
      regRef.current.add(sp.id);
      setReg([...regRef.current]);
      setFoco(sp.id);
      if (somRef.current && somLigado.current) somRef.current.chama(sp.id);
      if (toast.current) {
        toast.current.textContent = `identificado: ${sp.nome}  ·  ${regRef.current.size}/${ESPECIES.length}`;
        toast.current.style.opacity = "1";
        toastT = 2.6;
      }
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!ativo) return;
      const dt = Math.min(0.05, (now - ult) / 1000);
      ult = now;
      const t = (now - t0) / 1000;
      const vh = innerHeight, vw = innerWidth;

      // onde estamos na página (u = seção + fração)
      const S = secs.current.filter(Boolean);
      let u = 0;
      const mid = vh * 0.5;
      for (let i = 0; i < S.length; i++) {
        const r = S[i].getBoundingClientRect();
        if (mid < r.bottom || i === S.length - 1) {
          u = i + Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
          break;
        }
      }
      const slab = sm((u - 2.85) / 0.2) * (1 - sm((u - 3.82) / 0.15));
      // a câmera: de cima no solo; no censo, um ambiente por vez, de perto; depois volta para o fogo
      const camHab = (i) => {
        const h = HABS[i];
        return [[h.cx - 14 + h.off[0], h.ty + h.off[1], h.cz + h.off[2]], [h.cx - 14, h.ty, h.cz]];
      };
      let A, Bz, f, ia = 0, ib = 0, hf = 0;
      if (u < 2) {
        const i0 = Math.floor(u);
        A = KEYS[i0]; Bz = KEYS[i0 + 1]; f = sm(u - i0);
      } else if (u < 2.8) {
        A = KEYS[2]; Bz = KEYS[2]; f = 0;
      } else if (u < 3) {
        A = KEYS[2]; Bz = camHab(0); f = sm((u - 2.8) / 0.2);
      } else if (u < 3.85) {
        const hp = ((u - 3) / 0.85) * HABS.length;
        ia = Math.min(HABS.length - 1, Math.floor(hp));
        ib = Math.min(HABS.length - 1, ia + 1);
        hf = ia < HABS.length - 1 ? sm((hp - ia - 0.72) / 0.28) : 0;
        A = camHab(ia); Bz = camHab(ib); f = hf;
      } else if (u < 4) {
        ia = HABS.length - 1; ib = ia;
        A = camHab(ia); Bz = KEYS[4]; f = sm((u - 3.85) / 0.15);
      } else {
        const i0 = Math.min(KEYS.length - 2, Math.floor(u));
        A = KEYS[i0]; Bz = KEYS[i0 + 1]; f = sm(u - i0);
      }
      const pa = A[0], ta = A[1], pb = Bz[0], tb = Bz[1];
      const ihab = u < 3 ? 0 : u >= 3.85 ? HABS.length - 1 : ia + (hf > 0.5 ? 1 : 0);
      if (habRef.current !== ihab) { habRef.current = ihab; setHab(ihab); }
      const slabC = lerp(HABS[ia].cz, HABS[ib].cz, hf);
      const tA = HABS[ia].tint, tB = HABS[ib].tint;
      U.uTint.value.set(lerp(tA[0], tB[0], hf), lerp(tA[1], tB[1], hf), lerp(tA[2], tB[2], hf));
      U.uSlabC.value = slabC;
      planoXY.constant = -slabC;
      const m = mouse.current;
      m.cx += (m.x - m.cx) * 0.05;
      m.cy += (m.y - m.cy) * 0.05;
      const asp = vw / vh;
      const k = asp < 1 ? lerp(1.12, 1.55, slab) : asp < 1.4 ? lerp(1.25, 1.1, slab) : 1;
      camAlvo.set(lerp(ta[0], tb[0], f), lerp(ta[1], tb[1], f), lerp(ta[2], tb[2], f));
      camPos.set(lerp(pa[0], pb[0], f) + m.cx * 5 + Math.sin(t * 0.1) * 1.5, lerp(pa[1], pb[1], f) + m.cy * 3, lerp(pa[2], pb[2], f));
      camPos.sub(camAlvo).multiplyScalar(k).add(camAlvo);
      cam.position.copy(camPos);
      cam.lookAt(camAlvo);
      if (ihab !== ihabAnt) { if (ihabAnt >= 0 && slab > 0.5) wipeT = 0; ihabAnt = ihab; }
      wipeT = Math.min(1, wipeT + dt / 1.1);
      U.uWipe.value = slab > 0.5 && wipeT < 1 ? camAlvo.x - 55 + wipeT * 110 : -99999;

      // estados guiados pela rolagem (7 seções: hero, quem, solo, censo, calor, registros, ouvir)
      const peel = sm((u - 1.55) / 0.5) * (1 - sm((u - 2.6) / 0.25));
      const fogo = sm((u - 4.0) / 1.1);
      const grow = sm((u - 5.0) / 1.0);
      const therm = sm((u - 3.9) / 0.3) * (1 - sm((u - 5.0) / 0.8));
      U.uDraw.value = sm((u - 1.85) / 0.8);
      U.uGrow.value = grow;
      U.uT.value = t;
      mA.uniforms.uT.value = t;
      U.uPeel.value = peel;
      U.uSlab.value = slab;
      U.uStr.value = slab * 0.25;
      U.uFire.value = fogo;
      U.uTherm.value = therm;
      U.uSweep.value = ((t * 9) % (LX + 80)) - LX / 2 - 40;

      // feixe: cursor sobre o terreno (ou sobre o plano do corte); sem mouse, um feixe passeia sozinho
      const ocioso = now - ultMouse > 3500 || !m.tocou;
      const lateral = slab > 0.5;
      if (ocioso) {
        const Hh = HABS[ihab];
        beam.x = lateral ? Hh.cx + Math.sin(t * 0.4) * 20 : Math.sin(t * 0.21) * 100;
        beam.z = lateral ? Hh.ty + Math.sin(t * 0.55) * 9 : Math.sin(t * 0.37 + 1) * 50;
        beam.y = beam.z;
      } else {
        ray.setFromCamera({ x: m.x, y: m.y }, cam);
        if (lateral) {
          if (ray.ray.intersectPlane(planoXY, hit)) {
            beam.x = Math.max(-LX / 2, Math.min(LX / 2, hit.x));
            beam.y = Math.max(-8, Math.min(90, hit.y));
            beam.z = beam.y;
          }
        } else if (ray.ray.intersectPlane(planoXZ, hit)) {
          beam.x = Math.max(-LX / 2, Math.min(LX / 2, hit.x));
          beam.z = Math.max(-LZ / 2, Math.min(LZ / 2, hit.z));
        }
      }
      if (now - ultRastro > 45) {
        ultRastro = now;
        rastro.push({ x: beam.x, z: beam.z, t: now, f: 1 });
      }
      while (rastro.length > 16) rastro.shift();
      for (let i = 0; i < 16; i++) {
        const q = rastro[rastro.length - 1 - i];
        if (!q) B[i].set(999, 999, 0);
        else B[i].set(q.x, q.z, q.f * Math.exp(-(now - q.t) / 1500));
      }
      if (lateral) {
        ring.rotation.set(0, 0, 0);
        ring.position.set(beam.x, beam.y, slabC + 0.5);
      } else {
        ring.rotation.set(-Math.PI / 2, 0, 0);
        ring.position.set(beam.x, solo(beam.x, beam.z) + 2, beam.z);
      }
      const rs = (lateral ? 4.5 : 13) + Math.sin(t * 3) * (lateral ? 0.5 : 1.2);
      ring.scale.set(rs, rs, 1);
      ring.material.opacity = 0.2 + 0.45 * (1 - fogo * 0.8);

      // ===== bichos =====
      const Rf = fogo * 470 - 20;
      let perdidos = 0;
      const presenca = sm((u - 2.6) / 0.3) * (1 - sm((u - 5.5) / 0.4));
      ESPECIES.forEach((sp, si) => {
        const H = HABS[sp.hab];
        let nOcult = 0;
        sp.inds.forEach((b, bi) => {
          const dI = Math.hypot(b.x - FOGO_I[0], b.z - FOGO_I[1]);
          const aquatico = sp.tipo === "rio";
          if (fogo > 0.02 && Rf > dI - 80 && !aquatico) b.fuga = Math.min(1, b.fuga + dt * 0.7);
          if (b.fuga > 0) {
            const vf = sp.tipo === "voo" || sp.tipo === "planar" ? 40 : 18 + b.fuga * 26;
            b.x -= dt * vf;
            b.z += dt * Math.sin(t + bi) * 5;
            b.hd = Math.PI;
          } else {
            const Lay = LAY[sp.id] || { dx: 0, gap: 0, A: 0 };
            const c0 = H.cx - 14 + Lay.dx + (bi - (sp.inds.length - 1) / 2) * Lay.gap;
            const ang = t * (0.3 + 0.04 * (bi % 3)) + b.ph;
            const xAnt = b.x;
            switch (sp.tipo) {
              case "chao": {
                b.x = c0 + Math.sin(ang) * Lay.A;
                b.z = H.cz + (bi % 2 ? 1.5 : -1.5);
                b.hd = Math.cos(ang) >= 0 ? 0 : Math.PI;
                break;
              }
              case "margem": {
                b.x = c0 + Math.sin(ang) * Lay.A;
                b.z = rioZ(b.x) + (bi % 2 ? 1 : -1) * (sp.id === "jacare" ? 9.6 : 10.5);
                b.hd = Math.cos(ang) >= 0 ? 0 : Math.PI;
                break;
              }
              case "rio": {
                b.x = c0 + Math.sin(ang) * Lay.A;
                b.z = rioZ(b.x) + (bi % 2 ? 2.5 : -2.5);
                b.hd = Math.cos(ang) >= 0 ? 0 : Math.PI;
                break;
              }
              case "dossel": {
                b.x = c0 + Math.sin(ang) * Lay.A;
                b.z = H.cz + (bi % 2 ? 2 : -2);
                b.hd = Math.cos(ang) >= 0 ? 0 : Math.PI;
                break;
              }
              case "voo": {
                b.x += sp.v * dt;
                if (b.x > H.cx - 14 + 64) b.x = H.cx - 14 - 64 - bi * 6;
                b.z = H.cz + Math.sin(b.x * 0.05 + bi) * 6 + (bi % 2 ? 3 : -3);
                b.hd = 0;
                break;
              }
              case "planar": {
                b.ph += dt * sp.v * 3;
                b.x = H.cx - 14 + Lay.dx + Math.cos(b.ph) * 12;
                b.z = H.cz + Math.sin(b.ph) * 6;
                b.hd = Math.sin(b.ph) >= 0 ? Math.PI : 0;
                break;
              }
              case "enxame": {
                b.x = c0 + Math.sin(t * 0.5 + b.ph) * Lay.A;
                b.z = H.cz + Math.cos(t * 0.4 + b.ph * 2) * 5;
                b.hd = Math.cos(t * 0.5 + b.ph) >= 0 ? 0 : Math.PI;
                break;
              }
              default:
            }
            b.vx = (b.x - xAnt) / Math.max(dt, 0.001);
            if (sp.anda) b.gait = (b.gait || 0) + Math.abs(b.vx) * dt * 1.35;
          }
          if (b.x < -LX / 2 - 40) b.oculto = true;
          if (b.oculto) nOcult++;
        });
        if (nOcult === sp.inds.length) perdidos++;

        const amb = sp.id === "arara" || sp.id === "harpia" || sp.id === "boto" ? 0.9 * (1 - sm((u - 1.6) / 0.4)) : 0;
        const pres = Math.max(presenca, amb) * (sp.id === "vagalume" || sp.id === "morpho" ? 1 - therm * 0.9 : 1);
        const reg1 = regRef.current.has(sp.id);
        const emFoco = trava.id === sp.id;
        const emHab = slab > 0.5 ? (sp.hab === ihab ? sm(wipeT * 1.6) : 0.08) : 1;
        const brilho = pres * emHab * (reg1 ? 1.15 : 0.95) * (emFoco ? 1.4 : 1);
        let i = sp.idx0;
        sp.inds.forEach((b, bi) => {
          let y;
          const c = Math.cos(b.hd), s = Math.sin(b.hd);
          const gy = solo(b.x, b.z);
          switch (sp.tipo) {
            case "chao":
            case "margem": y = gy; break;
            case "rio": y = -2.4 + sp.hy - (sp.id === "pirarucu" ? bi * 2.8 : 0) + (sp.id === "boto" ? Math.max(0, Math.sin(t * 0.9 + b.x * 0.05 + bi * 2)) * 5 : Math.sin(t * 0.6 + b.ph) * 0.3); break;
            case "dossel": y = gy + copaAlt(b.x, b.z) + sp.lift; break;
            case "voo": y = H.ty + sp.hy + (bi % 3) * 3 + Math.sin(t * 0.8 + bi) * 1.5 + (b.fuga > 0 ? b.fuga * 30 : 0); break;
            case "planar": y = H.ty + sp.hy + Math.sin(t * 0.3) * 2; break;
            case "enxame": y = gy + sp.hy + Math.sin(t * 0.9 + b.ph) * 2.5; break;
            default: y = gy + sp.foot;
          }
          const pose = sp.base1 && Math.sin(t * (sp.tipo === "planar" ? 2.5 : 14) + b.ph) > 0 ? 1 : 0;
          const arrB = pose ? sp.base1 : sp.base;
          const dir = Math.cos(b.hd) >= 0 ? 1 : -1;
          arrB.forEach((q, qi) => {
            let lx = q[0], ly = q[1], lz = q[2];
            let wx, wz;
            if (sp.tipo === "trilha") {
              // fila de formigas: cada ponto é uma saúva andando numa linha reta no chão
              const k2 = (qi / sp.base.length + t * 0.04 * sp.v + bi * 0.37) % 1;
              wx = H.cx - 20 + k2 * 40 - 30 * b.fuga;
              wz = H.cz + 3 + Math.sin(k2 * 7 + qi) * 0.9;
              aPos[i * 3] = wx; aPos[i * 3 + 1] = solo(wx, wz) + 0.5; aPos[i * 3 + 2] = wz;
            } else if (sp.pontos) {
              // enxame de pontos de luz fria
              wx = b.x + lx + Math.sin(t * 0.7 + qi * 1.3) * 2.2;
              wz = b.z + lz + Math.cos(t * 0.6 + qi * 2.1) * 2.2;
              aPos[i * 3] = wx; aPos[i * 3 + 1] = y + ly + Math.sin(t * 1.1 + qi) * 1.6; aPos[i * 3 + 2] = wz;
            } else if (sp.sil) {
              if (sp.anda) {
                const gp = b.gait || 0, leg = sp.hgt * 0.36;
                if (ly < leg) lx += Math.sin(gp + (lx > 0 ? 0 : Math.PI)) * 0.6 * (1 - ly / leg);
                ly += Math.abs(Math.sin(gp)) * 0.22;
              }
              aPos[i * 3] = b.x + lx * dir;
              aPos[i * 3 + 1] = y + ly;
              aPos[i * 3 + 2] = b.z + lz;
            } else {
              if (q[3]) ly += Math.sin(t * (sp.tipo === "planar" ? 1.2 : 9) + b.ph + qi) * Math.abs(lz) * 0.55;
              [wx, wz] = rodaXZ(lx, lz, c, s);
              aPos[i * 3] = b.x + wx;
              aPos[i * 3 + 1] = y + ly;
              aPos[i * 3 + 2] = b.z + wz;
            }
            let v = brilho * (b.oculto ? 0 : 1);
            if (sp.pontos) v *= Math.max(0, Math.sin(t * 2 + qi * 2.7)) * 1.2;
            aVis[i] = v;
            i++;
          });
        });
        // marcador na tela: só no ambiente em que a câmera está
        const el = rotulos.current[sp.id];
        if (el) {
          let rx = 0, ry = 0, rz = 0, nr = 0;
          sp.inds.forEach((b, bi) => {
            if (b.oculto) return;
            const j = (sp.idx0 + bi * sp.base.length) * 3;
            rx += aPos[j]; ry += aPos[j + 1]; rz += aPos[j + 2]; nr++;
          });
          if (nr) {
            v3.set(rx / nr, ry / nr + 5, rz / nr).project(cam);
            sp._sx = (v3.x * 0.5 + 0.5) * vw;
            sp._sy = (-v3.y * 0.5 + 0.5) * vh;
            sp._ok = v3.z < 1 && v3.x > -1.02 && v3.x < 1.02 && v3.y > -1.02 && v3.y < 1.02;
          } else sp._ok = false;
          const censo = slab > 0.5 && sp.hab === ihab;
          const on = sp._ok && pres > 0.4 && (censo || trava.id === sp.id);
          el.style.opacity = on ? (reg1 ? 0.95 : 0.6).toString() : "0";
          el.style.transform = `translate3d(${(sp._sx || 0).toFixed(0)}px,${(sp._sy || 0).toFixed(0)}px,0)`;
          el.dataset.r = reg1 ? "1" : emFoco ? "2" : "0";
        }
      });
      gA.attributes.position.needsUpdate = true;
      gA.attributes.aVis.needsUpdate = true;

      // ===== identificação: o alvo é a espécie mais perto do cursor (ou do centro, sem mouse) =====
      const px = !ocioso || m.px > -900 ? m.px : vw / 2, py = !ocioso || m.py > -900 ? m.py : vh / 2;
      let melhor = null, dm = 110;
      if (presenca > 0.5 && slab > 0.5) {
        ESPECIES.forEach((sp) => {
          if (!sp._ok || sp.hab !== ihab) return;
          const d = Math.hypot(sp._sx - px, sp._sy - py);
          if (d < dm) { dm = d; melhor = sp; }
        });
      }
      if (melhor && (!ocioso || clique)) {
        if (trava.id !== melhor.id) { trava.id = melhor.id; trava.t = 0; trava.vis = false; }
        trava.t += dt;
        if (clique) trava.t = 1;
        if (trava.t >= 0.9) registra(melhor);
        if (regRef.current.has(melhor.id) && trava.t > 0.12 && !trava.vis) { trava.vis = true; setFoco(melhor.id); }
        if (reticula.current) {
          reticula.current.style.opacity = "1";
          reticula.current.style.transform = `translate3d(${melhor._sx.toFixed(0)}px,${melhor._sy.toFixed(0)}px,0)`;
          reticula.current.style.setProperty("--p", `${Math.min(1, trava.t / 0.9) * 360}deg`);
        }
      } else {
        trava.id = null;
        trava.t = 0;
        if (reticula.current) reticula.current.style.opacity = "0";
      }
      clique = false;
      if (toastT > 0) {
        toastT -= dt;
        if (toastT <= 0 && toast.current) toast.current.style.opacity = "0";
      }

      // quantos dos bichos identificados já fugiram do fogo
      let pr = 0;
      ESPECIES.forEach((sp) => {
        if (regRef.current.has(sp.id) && sp.inds.every((b) => b.oculto)) pr++;
      });
      if (pr !== perdRef.current) { perdRef.current = pr; setPerdReg(pr); }
      // som: a vida some com o fogo e volta com a discografia; as barras mostram o espectro de verdade
      const S2 = somRef.current;
      if (S2 && somLigado.current) {
        S2.estado({ vida: Math.min(1, Math.max(0.03, 1 - fogo * 0.97 + grow * 0.9)), fogo: fogo * (1 - grow * 0.85), volta: grow, hab: ihab });
        if (eqRef.current) {
          const esp = S2.espectro(30);
          eqRef.current.style.setProperty("--q", "0");
          for (let k = 0; k < eqRef.current.children.length; k++) eqRef.current.children[k].style.setProperty("--h", String(Math.max(3, esp[k] * 100)));
        }
      } else if (eqRef.current) eqRef.current.style.removeProperty("--q");
      // calor: o som da mata cai (barras) conforme o fogo avança
      if (calorSec.current) calorSec.current.style.setProperty("--q", fogo.toFixed(3));
      // menu: seção ativa
      const ativa = Math.min(menuRef.current.length - 1, Math.floor(u + 0.0001));
      menuRef.current.forEach((a, i) => a && a.classList.toggle(styles.menuOn, i === ativa));

      // capa flutuante dos discos
      const cf = capaFlut.current;
      if (cf && m.px > -900) cf.style.transform = `translate3d(${(m.px + 28).toFixed(0)}px,${(m.py - 120).toFixed(0)}px,0)`;

      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", vis);
      geo.dispose();
      mat.dispose();
      gA.dispose();
      mA.dispose();
      renderer.dispose();
      if (somRef.current) somRef.current.fim();
      document.documentElement.style.cssText = antes[0];
      document.body.style.cssText = antes[1];
    };
  }, []);

  const sel = capaSel != null ? DISCO[capaSel] : null;
  const sec = (i) => (n) => (secs.current[i] = n);
  const anos = [...new Set(DISCO.map((d) => d.ano))];
  const espFoco = ESPECIES.find((e) => e.id === foco) || null;
  const SECOES = [["inicio", "vblxw"], ["quem", "quem"], ["estrato", "território"], ["censo", "vida"], ["calor", "fogo"], ["registros", "volta"], ["ouvir", "ouvir"]];
  const barras = Array.from({ length: 30 }, (_, i) => [28 + ((i * 37) % 70), 0.7 + ((i * 13) % 10) / 12]);

  return (
    <main className={styles.raiz}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap"
      />
      <canvas ref={cv} className={styles.tela} aria-hidden="true" />
      <VoltarJodo />

      {/* marcadores das assinaturas de calor (seguem os bichos na tela) */}
      {ESPECIES.map((sp) => (
        <div key={sp.id} ref={(n) => (rotulos.current[sp.id] = n)} className={styles.rotulo} aria-hidden="true">
          <i />
          <span><b>{sp.nome}</b></span>
        </div>
      ))}
      <div ref={reticula} className={styles.reticula} aria-hidden="true">
        <i />
      </div>
      <div ref={toast} className={styles.toast} role="status" />

      <button type="button" className={`${styles.som} ${somOn ? styles.somOn : ""}`} onClick={alternaSom} aria-pressed={somOn}>
        <i /><i /><i /><i />
        {somOn ? "som ligado" : "ligar o som"}
      </button>

      <nav className={styles.menu} aria-label="Seções">
        {SECOES.map(([id, t], i) => (
          <a key={id} href={`#${id}`} ref={(n) => (menuRef.current[i] = n)}>
            <i>{String(i + 1).padStart(2, "0")}</i>
            {t}
          </a>
        ))}
      </nav>

      {/* ============ 1. hero ============ */}
      <section id="inicio" ref={sec(0)} className={`${styles.sec} ${styles.hero}`}>
        <div className={styles.heroTxt}>
          <span className={styles.rot}>vblxw</span>
          <h1 className={styles.nome}>Vicente Blow</h1>
          <p className={styles.sub}>rapper de Manaus · Bruxos do Norte · desde 2013</p>
        </div>
        <p className={styles.dica}>mova o cursor sobre a mata · role para descer</p>
      </section>

      {/* ============ 2. quem é ============ */}
      <section id="quem" ref={sec(1)} className={`${styles.sec} ${styles.quem}`}>
        <span className={styles.num} aria-hidden="true">01</span>
        <div className={styles.quemGrid}>
          <h2 className={styles.quemT}>
            <span>nasceu</span>
            <span>marcado.</span>
            <em>sobreviveu</em>
            <em>rimando.</em>
          </h2>
          <div className={styles.quemTxt}>
            <span className={styles.rot}>nascido em 99</span>
            <p className={styles.capitular}>
              Nascido em 99, com o cordão umbilical enrolado no pescoço. Marcado para morrer, <mark>desafiou Deus e matou o próprio senhor destino.</mark>
            </p>
            <p>Ver o mundo pelo pior lado foi sua terapia. Desenhar com sangue, seu primeiro ofício.</p>
            <p>
              O rap acendeu a consciência política: o ódio bruto virou <mark>munição organizada</mark> e a caneta, uma mira a laser apontada para o alvo mais forte, o Capital.
            </p>
          </div>
        </div>
      </section>

      {/* ============ 3. solo ============ */}
      <section id="estrato" ref={sec(2)} className={`${styles.sec} ${styles.solo}`}>
        <span className={styles.num} aria-hidden="true">02</span>
        <div className={styles.soloA}>
          <span className={styles.rot}>território · por baixo da mata</span>
          <h2>por baixo<br />da <em>copa.</em></h2>
          <p>
            O laser atravessa as folhas e mede o chão. O que volta não é mata virgem: são <mark>valas, círculos e avenidas desenhados por gente</mark>, milhares deles, ainda aparecendo sob a floresta.
          </p>
          <p className={styles.fonte}>Varreduras de LiDAR na Amazônia vêm revelando obras de terra geométricas escondidas pela copa (estudo na Nature, 2026, segundo a imprensa).</p>
        </div>
        <blockquote className={styles.citacao}>
          Manaus é<br />território<br /><em>ancestral.</em>
        </blockquote>
        <div className={styles.soloB}>
          <span className={styles.rot}>quem já estava aqui</span>
          <ul className={styles.gigantes}>
            <li><b><Conta fim={391} /></b><span>etnias no Brasil, falando <strong>295 línguas</strong> (IBGE, Censo 2022)</span></li>
            <li><b><Conta fim={259} /></b><span>etnias só no Amazonas, o maior número depois de São Paulo</span></li>
            <li><b><Conta fim={438} /></b><span>das 718 línguas da Amazônia brasileira já foram extintas</span></li>
          </ul>
          <div className={styles.descr}>
            <span className={styles.rot}>o que o scanner não vê</span>
            <div className={styles.barra} role="img" aria-label="A ciência descreveu só de 10% a 20% da biodiversidade amazônica">
              <i className={styles.b1} />
              <i className={styles.b2} />
            </div>
            <div className={styles.barraL}>
              <span><b>10–20%</b> descrito pela ciência</span>
              <span><b>80–90%</b> ainda sem nome</span>
            </div>
            <p className={styles.fonte}>Cerca de 1.300 aves, 2.400 peixes, 430 mamíferos e de 2,5 a 5 milhões de insetos, dos quais só uns 150 mil foram catalogados. Estimativas variam por fonte.</p>
          </div>
        </div>
      </section>

      {/* ============ 4. censo ============ */}
      <section id="censo" ref={sec(3)} className={`${styles.sec} ${styles.censo}`}>
        <div className={styles.censoPalco}>
          <div className={styles.censoTopo}>
            <span className={styles.num} aria-hidden="true">03</span>
            <span className={styles.rot}>vida · o censo · {hab + 1} de {HABS.length}</span>
            <h2 key={hab} className={styles.habT}>{HABS[hab].nome}</h2>
            <p className={styles.habSub}>{HABS[hab].sub}</p>
            <div className={styles.habDots} aria-hidden="true">
              {HABS.map((h, i) => (
                <i key={h.id} className={i === hab ? styles.dotOn : ""} />
              ))}
            </div>
            <p className={styles.habDica}>role para mudar de ambiente ↓</p>
          </div>
          <div className={styles.contador}>
            <b>{String(reg.length).padStart(2, "0")}</b>
            <span>/ {ESPECIES.length} bichos identificados</span>
            <div className={styles.contBarra}><i style={{ width: `${(reg.length / ESPECIES.length) * 100}%` }} /></div>
            <p>Passe o cursor sobre os pontos de calor. Segure um segundo, ou toque, para identificar cada bicho.</p>
          </div>
          <ul className={styles.lstEsp}>
            {ESPECIES.filter((sp) => sp.hab === hab).map((s) => (
              <li key={s.id}>
                <button type="button" className={`${reg.includes(s.id) ? styles.feito : ""} ${foco === s.id ? styles.emFoco : ""}`} onClick={() => reg.includes(s.id) && setFoco(s.id)} aria-label={reg.includes(s.id) ? s.nome : "bicho ainda não identificado"}>
                  <i />
                  {reg.includes(s.id) ? s.nome : "· · ·"}
                </button>
              </li>
            ))}
          </ul>
          <div className={`${styles.cartao} ${espFoco ? styles.cartaoOn : ""}`}>
            {espFoco ? (
              <>
                <small>{HABS[espFoco.hab].nome} · n.º {String(reg.indexOf(espFoco.id) + 1).padStart(2, "0")}</small>
                <h3>{espFoco.nome}</h3>
                <em>{espFoco.cient}</em>
                <p>{espFoco.fato}</p>
              </>
            ) : (
              <p className={styles.vazio}>nenhum bicho identificado ainda</p>
            )}
          </div>
        </div>
      </section>

      {/* ============ 5. calor ============ */}
      <section id="calor" ref={(n) => { secs.current[4] = n; calorSec.current = n; }} className={`${styles.sec} ${styles.calor}`}>
        <span className={styles.num} aria-hidden="true">04</span>
        <div className={styles.calorTopo}>
          <span className={styles.rot}>fogo · 2019 e 2020</span>
          <h2>alguém riscou<br />o fósforo.</h2>
          <p className={styles.lede}>Em 29 de fevereiro de 2020, Vicente soltou o primeiro single, “Amazônia pega fogo”, no meio de uma das maiores temporadas de queimadas do Amazonas. A música nasceu com o fogo.</p>
        </div>
        <ul className={styles.calorNum}>
          <li>
            <b><Conta fim={89178} /></b>
            <span>focos de queimada em 2019, segundo o INPE: 30% a mais que em 2018</span>
          </li>
          <li>
            <b><Conta fim={45} sufixo="%" /></b>
            <span>dos focos entre agosto de 2019 e setembro de 2020 estavam em áreas recém-desmatadas</span>
          </li>
          <li>
            <b>1998</b>
            <span>a última vez que a temporada de fogo no Amazonas foi tão forte quanto a de 2020</span>
          </li>
        </ul>
        <p className={styles.perda}>
          {reg.length === 0
            ? "Você não identificou nenhum bicho. O fogo também não esperou."
            : perdReg === 0
              ? `Você identificou ${reg.length} ${reg.length === 1 ? "bicho" : "bichos"}. Role mais: o fogo ainda não chegou neles.`
              : `Dos ${reg.length} ${reg.length === 1 ? "bicho que você identificou" : "bichos que você identificou"}, ${perdReg} já não ${perdReg === 1 ? "está" : "estão"} aqui.`}
        </p>
        <div className={styles.silencio}>
          <div ref={eqRef} className={styles.eq} aria-hidden="true">
            {barras.map(([h, s], i) => (
              <i key={i} style={{ "--h": h, "--s": s, "--i": i }} />
            ))}
          </div>
          <p>
            <b>fogo também é silêncio.</b> Um estudo do PNAS mediu o som da mata e viu que as queimadas deixam mais nichos acústicos vazios do que a extração de madeira. Cada barra aqui é uma voz da floresta; conforme o fogo avança, elas caem. Ligue o som (canto inferior esquerdo) e ouça a mata se calar.
          </p>
        </div>
        <a className={styles.grande} href="https://www.youtube.com/watch?v=tocLEg0aDbs" target="_blank" rel="noreferrer">
          <small>29.02.2020 · o primeiro single ▶</small>
          <span>amazônia</span>
          <span>pega fogo.</span>
          <em>o que sobra no chão é o território.</em>
        </a>
      </section>

      {/* ============ 6. registros ============ */}
      <section id="registros" ref={sec(5)} className={`${styles.sec} ${styles.reg}`}>
        <span className={styles.num} aria-hidden="true">05</span>
        <div className={styles.regCab}>
          <span className={styles.rot}>volta · discografia</span>
          <h2>o que ele<br />gravou.</h2>
          <p>A cada lançamento, a mata volta um pouco. De 2020 até hoje, do mais novo ao mais antigo.</p>
        </div>
        <div onMouseLeave={() => setCapaSel(null)}>
          {anos.map((ano) => (
            <div key={ano} className={styles.anoBloco}>
              <h3 className={styles.anoG}>{ano}</h3>
              <ul className={styles.lista}>
                {DISCO.map((d, i) =>
                  d.ano !== ano ? null : (
                    <li key={d.t + d.data} className={`${capaSel === i ? styles.liOn : ""} ${i === 0 ? styles.liTop : ""}`} onMouseEnter={() => d.capa && setCapaSel(i)}>
                      <a href={d.url} target="_blank" rel="noreferrer">
                        <span className={styles.dId}>{d.data}</span>
                        <span className={styles.dT}>{d.t}</span>
                        <span className={styles.dTag}>{d.tag}</span>
                        {d.capa && <img className={styles.dThumb} src={`/vb/capas/${d.capa}.webp`} alt={`Capa de ${d.t}`} loading="lazy" />}
                        <span className={styles.dSeta}>↗</span>
                      </a>
                      {(d.nota || d.com || d.falha) && (
                        <p className={styles.dNota}>
                          {d.nota}
                          {d.falha && <a href={FALHA} target="_blank" rel="noreferrer"> canal Falha ↗</a>}
                          {d.com &&
                            d.com.map((id) => {
                              const n = NOS[id];
                              if (!n || !n.rota) return null;
                              return <a key={id} href={n.rota}> {n.curto || n.nome} ↗</a>;
                            })}
                        </p>
                      )}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
        <div ref={capaFlut} className={`${styles.capaFlut} ${sel ? styles.capaOn : ""}`} aria-hidden="true">
          {sel && sel.capa && <img src={`/vb/capas/${sel.capa}.webp`} alt="" />}
        </div>
      </section>

      {/* ============ 7. ouvir ============ */}
      <section id="ouvir" ref={sec(6)} className={`${styles.sec} ${styles.ouvir}`}>
        <span className={styles.num} aria-hidden="true">06</span>
        <span className={styles.rot}>onde ouvir</span>
        <h2>acende<br />o som.</h2>
        <p className={styles.volta}>o caminho de volta pra casa.</p>
        <ul className={styles.plats}>
          {[
            ["Spotify", "artista e discografia", PERFIS.spotify],
            ["Deezer", "12 lançamentos", PERFIS.deezer],
            ["YouTube", "Ruído das Águas, o álbum completo", PERFIS.youtubeAlbum],
            ["SoundCloud", "o perfil do Bruxos do Norte", PERFIS.soundcloudGrupo],
            ["Instagram", "@bruxobuya", PERFIS.instagram],
          ].map(([nome, sub, u]) => (
            <li key={nome}>
              <a href={u} target="_blank" rel="noreferrer">
                <span className={styles.ic}><Icone r={nome} /></span>
                <b>{nome}</b>
                <em>{sub}</em>
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.nota}>
          Ilustração gerada em código: o relevo, as obras de terra e os bichos são inventados. Os números vêm de fontes públicas: IBGE (Censo 2022), INPE, PNAS (Rappaport et al., 2022) e estudos de LiDAR na Amazônia.
        </p>
        <button type="button" className={styles.topo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          ↑ nova varredura
        </button>
      </section>
    </main>
  );
}
