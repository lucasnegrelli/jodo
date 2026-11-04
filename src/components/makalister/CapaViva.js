"use client";
// Capa com a própria textura em movimento: o shader deforma as cores da capa com ruído lento (as manchas e o giz "respiram").
// Sem WebGL ou com prefers-reduced-motion, mostra a imagem parada. Só anima enquanto está na tela.
import { useEffect, useRef, useState } from "react";

const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*0.5+0.5; uv.y = 1.0-uv.y; gl_Position = vec4(p,0.0,1.0); }`;
const FS = `precision mediump float; varying vec2 uv; uniform sampler2D tex; uniform float t;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<4;i++){ v+=a*n(p); p*=2.03; a*=0.5; } return v; }
void main(){
  vec2 q = uv*2.4;
  vec2 w = vec2(fbm(q + vec2(t*0.22, t*0.05)), fbm(q + vec2(5.2, 1.3 - t*0.19))) - 0.5;
  vec2 u = uv + w*(0.13 + 0.05*sin(t*0.9));
  // leve deriva de cor: canais lidos com deslocamentos diferentes, como tinta que não seca
  float r = texture2D(tex, u + w*0.035).r;
  float g = texture2D(tex, u).g;
  float b = texture2D(tex, u - w*0.035).b;
  gl_FragColor = vec4(r,g,b,1.0);
}`;

export default function CapaViva({ src, alt, className }) {
  const cv = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setFallback(true); return; }
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false });
    if (!gl) { setFallback(true); return; }
    let raf = 0, vivo = true, visivel = true, tex = null, prog = null, buf = null;
    const sh = (tipo, fonte) => { const o = gl.createShader(tipo); gl.shaderSource(o, fonte); gl.compileShader(o); return o; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFallback(true); return; }
    gl.useProgram(prog);
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(prog, "t");
    const img = new Image();
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);
    img.onload = () => {
      if (!vivo) return;
      const lado = Math.min(img.naturalWidth || 900, 900);
      canvas.width = lado; canvas.height = lado;
      gl.viewport(0, 0, lado, lado);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const t0 = performance.now();
      const laco = () => {
        if (!vivo) return;
        if (visivel && !document.hidden) {
          gl.uniform1f(uT, (performance.now() - t0) / 1000);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        raf = requestAnimationFrame(laco);
      };
      laco();
    };
    img.onerror = () => setFallback(true);
    img.src = src;
    return () => { vivo = false; cancelAnimationFrame(raf); io.disconnect(); };
  }, [src]);

  if (fallback) return <img className={className} src={src} alt={alt} />;
  return <canvas ref={cv} className={className} aria-hidden={alt ? undefined : "true"} role={alt ? "img" : undefined} aria-label={alt || undefined} width="900" height="900" />;
}
