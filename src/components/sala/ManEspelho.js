"use client";

import { useEffect, useRef } from "react";
import styles from "@/styles/manPagina.module.css";

/*
  eL Mandarim: abertura "espelho vivo", agora no talo.
  A capa de P*Taria Me Fez Bem já é uma colagem espelhada; aqui o rosto dele entra num caleidoscópio ao vivo e num túnel de zoom infinito:
  - o mouse na vertical manda na doideira (2 espelhos = calmo; 9 espelhos = surto), na horizontal gira tudo;
  - quanto mais rápido o mouse, mais a imagem ondula, racha em faixas e separa as cores (e as letras do nome tremem junto);
  - clique/toque = explosão: salta o zoom, troca a cor e muda o giro. Parado, ele delira sozinho.
  Só o rosto dele aparece (nada de capas soltas, que é o jeito da página do Sergio).
*/
const VERT = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = vec2(p.x*0.5+0.5, 0.5-p.y*0.5); gl_Position = vec4(p,0.0,1.0); }";
const FRAG = `precision highp float;
uniform sampler2D uTex; uniform float uT, uZ, uRot, uSeg, uVel, uBoom, uHue, uAsp, uPsi; varying vec2 vUv;
const vec2 ROSTO = vec2(0.235, 0.125);
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 gira(vec3 c, float a){
  float s = sin(a), k = cos(a);
  vec3 ax = vec3(0.57735);
  return c * k + cross(ax, c) * s + ax * dot(ax, c) * (1.0 - k);
}
vec2 espelha(vec2 uv){ return vec2(abs(mod(uv.x + 1.0, 2.0) - 1.0), abs(mod(uv.y + 1.0, 2.0) - 1.0)); }
vec3 amostra(vec2 c, float seg, float esc, float vel, float desloca){
  float r = length(c);
  float a = atan(c.y, c.x) + uRot;
  float f = 6.2831853 / seg;
  a = abs(mod(a, f) - f * 0.5);
  vec2 q = vec2(cos(a), sin(a)) * r;
  q += 0.035 * vec2(sin(q.y * 9.0 + uT * 1.4), cos(q.x * 9.0 - uT * 1.1)) * (0.06 + uPsi * 0.3 + vel * 2.2 * uPsi + uBoom * 3.0);
  q.x += desloca;
  return texture2D(uTex, espelha(ROSTO + q * esc)).rgb;
}
vec3 tunel(vec2 c, float seg, float vel, float desloca){
  float t = fract(uZ + uBoom * 0.15);
  float e1 = 0.22 * exp2(t), e2 = 0.22 * exp2(t - 1.0);
  return mix(amostra(c, seg, e2, vel, desloca), amostra(c, seg, e1, vel, desloca), 1.0 - t);
}
vec3 caleido(vec2 c, float vel, float desloca){
  float s0 = floor(uSeg), fr = fract(uSeg);
  s0 = max(2.0, s0);
  return mix(tunel(c, s0, vel, desloca), tunel(c, s0 + 1.0, vel, desloca), smoothstep(0.0, 1.0, fr));
}
void main(){
  vec2 p = vUv;
  p.x += step(0.97, h21(vec2(floor(p.y * 36.0), floor(uT * 4.0)))) * 0.06 * (0.5 + uVel);
  vec2 c = (p - 0.5) * vec2(uAsp, 1.0);
  float band = floor(p.y * 18.0);
  float n = h21(vec2(band, floor(uT * 8.0)));
  float rachou = step(0.6, h21(vec2(band * 3.7, floor(uT * 6.0)))) * (uVel * uPsi + uBoom * 0.8);
  float desloca = (n - 0.5) * 0.12 * rachou;
  float s = (0.0015 + uVel * 0.02 * uPsi + uBoom * 0.03) * (0.4 + uPsi);
  vec3 cr = caleido(c + vec2(s, 0.0), uVel, desloca);
  vec3 cg = caleido(c, uVel, desloca);
  vec3 cb = caleido(c - vec2(s, 0.0), uVel, desloca);
  vec3 col = vec3(cr.r, cg.g, cb.b);
  col = gira(col, (uHue + uPsi * 0.12) * 6.2831853 + uVel * 1.2 * uPsi);
  col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, 0.5 + 0.5 * uPsi);
  col = mix(col, floor(col * 4.0) / 4.0, clamp(uBoom * 1.4, 0.0, 1.0));
  col = mix(col, 1.0 - col, step(0.86, uBoom) * 0.9);
  col *= 1.3;
  float lvl = 6.0;
  float dith = (h21(floor(p * vec2(uAsp, 1.0) * 300.0)) - 0.5) / lvl;
  col = floor((col + dith) * lvl + 0.5) / lvl;
  col *= 0.92;
  col += (h21(p * vec2(uAsp, 1.0) * 700.0 + uT) - 0.5) * (0.035 + 0.04 * uPsi);
  col *= 0.93 + 0.07 * sin(p.y * 900.0);
  col *= 1.0 - 0.3 * smoothstep(0.6, 1.2, length(c));
  gl_FragColor = vec4(col, 1.0);
}`;

export default function ManEspelho() {
  const cv = useRef(null);

  useEffect(() => {
    const el = cv.current;
    const pai = el.parentElement;
    const g = el.getContext("webgl", { antialias: false, alpha: false });
    if (!g) return;
    const sh = (t, s) => { const o = g.createShader(t); g.shaderSource(o, s); g.compileShader(o); return o; };
    const prog = g.createProgram();
    g.attachShader(prog, sh(g.VERTEX_SHADER, VERT)); g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
    g.linkProgram(prog); g.useProgram(prog);
    const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = (n) => g.getUniformLocation(prog, n);

    let tex = null, W = 1, H = 1, raf = 0, vis = true;
    const img = new Image();
    img.onload = () => {
      tex = g.createTexture(); g.bindTexture(g.TEXTURE_2D, tex);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, img);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    };
    img.src = "/man/v/espelho.webp";

    const mede = () => {
      const r = el.getBoundingClientRect();
      // resolução baixa de propósito (câmera velha): 300 pixels de altura, esticados sem suavizar
      H = matchMedia("(pointer: coarse)").matches ? 200 : 300; W = Math.max(2, Math.round((r.width / Math.max(1, r.height)) * H));
      el.width = W; el.height = H; g.viewport(0, 0, W, H);
    };
    mede();
    const ro = new ResizeObserver(mede); ro.observe(el);
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0.02 });
    io.observe(el);

    const S = { tx: 0.5, ty: 0.5, ax: 0.5, ay: 0.5, vel: 0, boom: 0, hue: 0, kick: 0, ult: -9, psi: 0.08, z: 0, rot: 0, ant: 0 };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      S.tx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); S.ty = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      S.ult = performance.now() / 1000;
    };
    const clica = (e) => {
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom || e.target.closest("a, button")) return;
      S.boom = 1; S.hue += 0.22 + Math.random() * 0.2; S.kick += (Math.random() - 0.5) * 3; S.psi = Math.min(1, S.psi + 0.22);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerdown", clica);

    const loop = (ms) => {
      raf = requestAnimationFrame(loop);
      if (!vis || !tex) return;
      const t = ms / 1000;
      const dt = Math.min(0.1, t - S.ant); S.ant = t;
      const solto = t - S.ult > 2.5;
      // solto, ele delira sozinho: o número de espelhos sobe e desce e o giro passeia
      const alvoX = solto ? 0.5 + 0.35 * Math.sin(t * 0.37) : S.tx;
      const alvoY = solto ? 0.5 + 0.4 * Math.sin(t * 0.23 + 1) : S.ty;
      const ax0 = S.ax, ay0 = S.ay;
      S.ax += (alvoX - S.ax) * 0.07; S.ay += (alvoY - S.ay) * 0.07;
      S.vel = Math.min(1, S.vel * 0.9 + (Math.abs(S.ax - ax0) + Math.abs(S.ay - ay0)) * 7);
      S.boom *= 0.93;
      const v = Math.max(S.vel, S.boom);
      // psicodelia: começa calma (espelho simples, cor apagada) e sobe com o mouse e os cliques; parado, volta devagar
      S.psi = Math.max(0.08, Math.min(1, S.psi + S.vel * dt * 0.35 - dt * 0.04));
      S.z = (S.z + dt * (0.015 + 0.06 * S.psi)) % 1000;
      S.rot += dt * (0.015 + 0.1 * S.psi);
      const seg = 2 + S.ay * 7.5 * S.psi;
      const rot = S.rot + (S.ax - 0.5) * 2.4 * (0.25 + 0.75 * S.psi) + S.kick;
      g.uniform1i(U("uTex"), 0);
      g.uniform1f(U("uT"), t); g.uniform1f(U("uZ"), S.z % 1); g.uniform1f(U("uPsi"), S.psi); g.uniform1f(U("uRot"), rot); g.uniform1f(U("uSeg"), seg);
      g.uniform1f(U("uVel"), S.vel); g.uniform1f(U("uBoom"), S.boom); g.uniform1f(U("uHue"), S.hue);
      g.uniform1f(U("uAsp"), W / H);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      pai.style.setProperty("--vel", v.toFixed(3));
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener("pointermove", move); removeEventListener("pointerdown", clica); };
  }, []);

  return <canvas ref={cv} className={styles.espelho} aria-hidden="true" />;
}
