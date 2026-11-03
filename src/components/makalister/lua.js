"use client";
// A lua do almanaque: fase REAL de uma data (suncalc), vista do hemisfério sul (São José, SC), então a lua crescente acende pela esquerda.
import { useEffect, useRef } from "react";
import { getMoonIllumination } from "suncalc";
import gsap from "gsap";

export const SUL = true;

// fase de uma data "AAAA-MM-DD" (ou só "AAAA"): p = 0 nova, .5 cheia, 1 nova; f = fração iluminada
export function faseDe(iso) {
  const d = iso.length === 4 ? new Date(`${iso}-07-01T15:00:00Z`) : new Date(`${iso}T15:00:00Z`);
  const m = getMoonIllumination(d);
  return { p: m.phase, f: m.fraction };
}
export function nomeFase(p) {
  if (p < 0.03 || p >= 0.97) return "lua nova";
  if (p < 0.22) return "lua crescente";
  if (p < 0.28) return "quarto crescente";
  if (p < 0.47) return "gibosa crescente";
  if (p < 0.53) return "lua cheia";
  if (p < 0.72) return "gibosa minguante";
  if (p < 0.78) return "quarto minguante";
  return "lua minguante";
}

// o contorno da parte iluminada, para os selos pequenos (SVG, viewBox 24)
export function caminhoLua(p) {
  const r = 10, c = 12, k = Math.cos(p * Math.PI * 2), rx = Math.abs(k) * r;
  const cresce = p < 0.5, claraDireita = SUL ? !cresce : cresce;
  const exterior = claraDireita ? 1 : 0;
  const interior = (k > 0) === claraDireita ? 0 : 1;
  return `M ${c} ${c - r} A ${r} ${r} 0 0 ${exterior} ${c} ${c + r} A ${rx.toFixed(2)} ${r} 0 0 ${interior} ${c} ${c - r} Z`;
}
export function SeloLua({ p, tamanho = 20, className }) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".16" />
      <path d={caminhoLua(p)} fill="currentColor" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth=".8" />
    </svg>
  );
}

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uA,uSg,uT;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 q=(gl_FragCoord.xy/uRes)*2.-1.;float r2=dot(q,q);
  if(r2>1.){gl_FragColor=vec4(0.);return;}
  vec3 sky=mix(vec3(.035,.06,.085),vec3(.06,.09,.12),q.y*.5+.5);
  float st=step(.992,h(floor(gl_FragCoord.xy/2.)))*(.5+.5*sin(uT*1.3+h(floor(gl_FragCoord.xy/2.))*40.));
  sky+=vec3(.8,.85,.95)*st*.55;
  vec2 m=q/.74;float mr=dot(m,m);
  vec3 col=sky;
  if(mr<1.){
    vec3 N=vec3(m,sqrt(1.-mr));
    vec3 L=normalize(vec3(uSg*sin(uA),0.,-cos(uA)));
    float lam=max(dot(N,L),0.);
    float tex=fbm(m*3.4+vec2(3.1,1.7)),mar=smoothstep(.46,.64,fbm(m*1.6+2.));
    vec3 base=mix(vec3(.86,.84,.78),vec3(.52,.53,.56),mar*.85)*(.78+.45*tex);
    float cr=smoothstep(.55,.62,n(m*9.)+.25*n(m*21.));base*=1.-.18*cr;
    vec3 c2=base*pow(lam,.85)*pow(N.z,.3)*1.18+vec3(.045,.06,.09)*(1.-lam)*N.z;
    col=mix(sky,c2,smoothstep(1.,.985,mr));
  }
  float rim=smoothstep(.9,1.,r2);col=mix(col,vec3(.85,.78,.62),rim*.55);
  gl_FragColor=vec4(col,1.);}`;

// medalhão: um disco de céu com a lua dentro. `fase` (0..1) pode mudar; a transição é suave.
export function Lua({ fase = 0, tamanho = 120, className }) {
  const ref = useRef(null), est = useRef({ a: fase, desenha: null });
  useEffect(() => {
    const cv = ref.current, gl = cv.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = cv.height = Math.round(tamanho * dpr);
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr); gl.viewport(0, 0, cv.width, cv.height);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(["uRes", "uA", "uSg", "uT"].map((n) => [n, gl.getUniformLocation(pr, n)]));
    let vivo = true, vis = true, t0 = performance.now(), raf = 0;
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { rootMargin: "10%" }); io.observe(cv);
    const desenha = () => {
      gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform1f(U.uA, est.current.a * Math.PI * 2); gl.uniform1f(U.uSg, SUL ? -1 : 1); gl.uniform1f(U.uT, (performance.now() - t0) / 1000);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    est.current.desenha = desenha;
    const loop = () => { if (!vivo) return; raf = requestAnimationFrame(loop); if (vis) desenha(); };
    loop();
    return () => { vivo = false; cancelAnimationFrame(raf); io.disconnect(); };
  }, [tamanho]);
  useEffect(() => {
    // gira pelo caminho mais curto do ciclo lunar (0 e 1 são a mesma lua)
    const e = est.current; let alvo = fase; const d = alvo - (e.a % 1); if (Math.abs(d) > 0.5) alvo = e.a + (d > 0 ? d - 1 : d + 1); else alvo = e.a + d;
    const tw = gsap.to(e, { a: alvo, duration: 1.1, ease: "power2.out", overwrite: true });
    return () => tw.kill();
  }, [fase]);
  return <canvas ref={ref} className={className} style={{ width: tamanho, height: tamanho, borderRadius: "50%" }} aria-hidden="true" />;
}
