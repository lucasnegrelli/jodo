"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef } from "react";
import styles from "@/styles/vicenteLosango.module.css";
import { PERFIS } from "@/data/vicenteBlow";

/*
 * VBLXW · losango (capa + quem é).
 * Uma pele de padrões geométricos (jenipapo, urucum, osso). O retrato dele existe ali como meio-tom de losangos, bem fraco;
 * a lanterna do cursor revela a foto de verdade. Na troca de capítulo a foto se desfaz em losangos e vira a próxima.
 */

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const CAPS = [
  { id: "capa", L: 1.5 },
  { id: "quem", L: 2.0 },
];

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uT,uMix,uOk;uniform vec2 uTr[12];uniform vec2 uPc;uniform float uPs;uniform vec2 uAsp;
uniform sampler2D uA;uniform sampler2D uB;
const vec3 BONE=vec3(.914,.875,.788);const vec3 INK=vec3(.043,.039,.063);const vec3 URU=vec3(.824,.22,.102);
float h11(float n){return fract(sin(n*127.1)*43758.5453);}
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float tri(float x){return abs(fract(x)-.5)*2.;}
float m0(vec2 q){float z=tri(q.x*.5);return step(abs(fract(q.y*2.+z*.9)-.5),.12);}
float m1(vec2 q){vec2 f=vec2(fract(q.x)-.5,q.y-.5);float d=abs(f.x)+abs(f.y);return step(.62,fract(d*3.2));}
float m2(vec2 q){float k=floor(q.y*4.);return step(.5,fract((q.x+k)*.25))*step(.3,fract(q.y*4.))*step(fract(q.y*4.),.7);}
float m3(vec2 q,float t){return step(abs(fract(q.y*3.+sin(q.x*2.2+t*.4)*.35)-.5),.1);}
float m4(vec2 q){vec2 f=vec2(fract(q.x)-.5,q.y-.5);float d=abs(f.x)+abs(f.y);return max(step(d,.14),step(.42,d)*step(d,.5));}
float motivo(float id,vec2 q,float t){float k=mod(floor(h11(id)*5.),5.);if(k<.5)return m0(q);if(k<1.5)return m1(q);if(k<2.5)return m2(q);if(k<3.5)return m3(q,t);return m4(q);}
// o retrato: coordenada da foto e máscara de borda suave
vec2 foto(vec2 pc){return (pc-uPc)/vec2(uPs*uAsp.x,uPs)+.5;}
float borda(vec2 u){return smoothstep(0.,.12,u.x)*smoothstep(0.,.12,1.-u.x)*smoothstep(0.,.1,u.y)*smoothstep(0.,.1,1.-u.y);}
vec3 amostra(vec2 u,float usaB){vec2 uv=vec2(u.x,1.-u.y);return usaB>.5?texture2D(uB,uv).rgb:texture2D(uA,uv).rgb;}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float asp=uRes.x/uRes.y;
  // pele de padrões, em faixas simétricas
  vec2 s=vec2(abs(p.x),p.y);
  float yb=s.y*6.+uT*.04+sin(s.x*1.5+uT*.12)*.15;
  float id=floor(yb);
  vec2 q=vec2(s.x*6.+(h11(id+3.)-.5)*3.+uT*.2*(h11(id)>.5?1.:-1.)*.4,fract(yb));
  float v=motivo(id,q,uT);
  float sep=step(.955,fract(yb))+step(fract(yb),.03);
  // a lanterna: distância ao rastro do cursor
  float dm=9.;for(int i=0;i<12;i++){dm=min(dm,length(p-uTr[i]));}
  float L=smoothstep(.34,.04,dm);
  float faixa=mod(id,2.);
  vec3 col=INK*1.25;
  vec3 traco=mix(mix(INK,BONE,.13),mix(BONE,URU,faixa),L);
  col=mix(col,traco,v);
  col=mix(col,URU,sep*(.12+.5*L));
  // o retrato em meio-tom de losangos, bem fraco
  float cells=uRes.y/8.;
  vec2 g=rot(.7853982)*(p*cells);
  vec2 c=floor(g);vec2 f=fract(g)-.5;
  vec2 pc=rot(-.7853982)*((c+.5)/cells);
  vec2 u=foto(pc);
  float dentro=step(0.,u.x)*step(u.x,1.)*step(0.,u.y)*step(u.y,1.);
  float mask=dentro*borda(u);
  float cellB=step(h21(c),uMix);
  vec3 tx=amostra(u,cellB);
  float lum=clamp(pow(dot(tx,vec3(.45,.4,.15)),.5)*1.5-.12,0.,1.);
  float dd=max(abs(f.x),abs(f.y));
  float tinta=step(dd,lum*.47);
  vec3 pontoC=mix(URU,BONE,smoothstep(.2,.65,lum));
  vec3 mos=mix(INK,pontoC,tinta);
  col=mix(col,mos,mask*mix(.38,.8,L)*uOk);
  // a foto de verdade, revelada pela lanterna (a troca também é em losangos)
  vec2 u2=foto(p);
  float dentro2=step(0.,u2.x)*step(u2.x,1.)*step(0.,u2.y)*step(u2.y,1.);
  float cB=step(h21(floor(rot(.7853982)*(p*cells))),uMix);
  vec3 real=amostra(u2,cB);
  real=pow(real,vec3(.92))*1.12;
  float rev=dentro2*borda(u2)*smoothstep(.0,.9,L)*uOk;
  col=mix(col,real,rev);
  col*=1.-.28*dot(p/asp,p/asp)*2.;
  gl_FragColor=vec4(col,1.);
}`;

const Rv = ({ k = 0, as: T = "div", className = "", children, ...r }) => (
  <T className={`${styles.rv} ${className}`} style={{ "--k": k }} {...r}>
    {children}
  </T>
);

export default function VicenteLosango() {
  const cv = useRef(null);
  const trilha = useRef(null);
  const caps = useRef([]);
  const geo = useRef({ B: [], total: 0 });

  useEffect(() => {
    const antes = [document.documentElement.style.cssText, document.body.style.cssText];
    document.documentElement.style.overflow = "visible";
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflow = "visible";
    document.body.style.overflowX = "clip";

    const canvas = cv.current;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return undefined;
    const sh = (t, s) => {
      const o = gl.createShader(t);
      gl.shaderSource(o, s);
      gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o));
      return o;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    gl.useProgram(pr);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const l = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(l);
    gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["uRes", "uT", "uMix", "uOk", "uTr", "uPc", "uPs", "uAsp", "uA", "uB"].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));

    // as duas fotos
    const fotos = [null, null];
    const asp = [0.8, 0.8];
    let prontas = 0;
    const carrega = (i, src) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
      [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([a, c]) => gl.texParameteri(gl.TEXTURE_2D, a, c));
      fotos[i] = tex;
      const img = new Image();
      img.onload = () => {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        asp[i] = img.naturalWidth / img.naturalHeight;
        prontas++;
      };
      img.src = src;
    };
    carrega(0, "/vb/f/hero.webp");
    carrega(1, "/vb/f/colar.webp");

    let vw = innerWidth, vh = innerHeight;
    const dim = () => {
      vw = innerWidth;
      vh = innerHeight;
      const d = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(vw * d);
      canvas.height = Math.floor(vh * d);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    dim();
    const mede = () => {
      const B = [0];
      CAPS.forEach((c) => B.push(B[B.length - 1] + c.L * vh));
      geo.current = { B, total: B[B.length - 1] };
      if (trilha.current) trilha.current.style.height = `${B[B.length - 1] + vh}px`;
    };
    mede();

    const trail = Array.from({ length: 12 }, () => [9, 9]);
    let ultTr = 0, tocou = false;
    const toP = (e) => [(e.clientX - vw / 2) / vh, -(e.clientY - vh / 2) / vh];
    const onMove = (e) => {
      tocou = true;
      const now = performance.now();
      if (now - ultTr > 40) {
        ultTr = now;
        trail.pop();
        trail.unshift(toP(e));
      } else trail[0] = toP(e);
    };
    const onResize = () => {
      dim();
      mede();
    };
    addEventListener("pointermove", onMove);
    addEventListener("resize", onResize);

    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) / 1000;
      const { B, total } = geo.current;
      const y = Math.min(total, Math.max(0, scrollY));
      let ic = 0;
      while (ic < CAPS.length - 1 && y >= B[ic + 1]) ic++;
      const meia = vh * 0.3;
      caps.current.forEach((el, i) => {
        if (!el) return;
        const ent = i === 0 ? 1 : sm((y - (B[i] - meia * 0.5)) / meia);
        const sai = i === CAPS.length - 1 ? 1 : 1 - sm((y - (B[i + 1] - meia * 1.2)) / meia);
        const o = Math.min(ent, sai);
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.classList.toggle(styles.on, o > 0.55);
      });
      const mix = sm((y - (B[1] - meia * 1.4)) / (meia * 1.8));
      // sem mouse (ou no toque), a lanterna passeia sozinha pelo rosto
      const a = vw / vh, mobile = a < 0.9;
      if (!tocou) {
        const cx = mobile ? 0 : a * 0.2, cy = mobile ? 0.1 : 0.0;
        trail.pop();
        trail.unshift([cx + Math.sin(t * 0.5) * 0.2 * (mobile ? 0.6 : 1), cy + Math.cos(t * 0.37) * 0.28]);
      }
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uT, t);
      gl.uniform1f(U.uMix, mix);
      gl.uniform1f(U.uOk, prontas >= 2 ? 1 : 0);
      gl.uniform2fv(U.uTr, new Float32Array(trail.flat()));
      gl.uniform2f(U.uPc, mobile ? 0 : a * 0.2, mobile ? 0.12 : 0.0);
      gl.uniform1f(U.uPs, mobile ? Math.min(0.9 * a / asp[0], 0.8) : 0.98);
      gl.uniform2f(U.uAsp, asp[0], asp[1]);
      gl.uniform1i(U.uA, 0);
      gl.uniform1i(U.uB, 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", onResize);
      document.documentElement.style.cssText = antes[0];
      document.body.style.cssText = antes[1];
    };
  }, []);

  const cap = (i) => (n) => (caps.current[i] = n);

  return (
    <main className={styles.raiz}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap"
      />
      <canvas ref={cv} className={styles.tela} aria-hidden="true" />
      <VoltarJodo />
      <div className={styles.palco}>
        {/* ============ capa ============ */}
        <section ref={cap(0)} className={`${styles.cap} ${styles.capa}`}>
          <div className={styles.capaTxt}>
            <Rv k={0} as="span" className={styles.rot}>vblxw · manaus · desde 2013</Rv>
            <Rv k={1} as="h1" className={styles.nome}>Vicente<br />Blow</Rv>
            <Rv k={2} as="p" className={styles.sub}>rapper · Bruxos do Norte · “el camiño de cobra”</Rv>
            <Rv k={3} className={styles.cta}>
              <a className={styles.btn} href={PERFIS.spotify} target="_blank" rel="noreferrer">ouvir no Spotify ↗</a>
              <a className={styles.btn2} href={PERFIS.instagram} target="_blank" rel="noreferrer">@bruxobuya ↗</a>
            </Rv>
          </div>
          <Rv k={5} as="p" className={styles.dica}>passe o cursor sobre o rosto</Rv>
        </section>

        {/* ============ quem é ============ */}
        <section ref={cap(1)} className={`${styles.cap} ${styles.quem}`}>
          <div className={styles.quemTxt}>
            <Rv k={0} as="span" className={styles.rot}>nascido em 99</Rv>
            <Rv k={1} as="h2" className={styles.manchete}>
              nasceu marcado.<br />
              <em>sobreviveu rimando.</em>
            </Rv>
            <Rv k={2} as="p" className={styles.corpo}>
              Nascido em 99, com o cordão umbilical enrolado no pescoço. Marcado para morrer, <mark>desafiou Deus e matou o próprio senhor destino.</mark>
            </Rv>
            <Rv k={3} as="p" className={styles.corpo}>Ver o mundo pelo pior lado foi sua terapia. Desenhar com sangue, seu primeiro ofício.</Rv>
            <Rv k={4} as="p" className={styles.corpo}>
              O rap acendeu a consciência política: o ódio bruto virou <mark>munição organizada</mark> e a caneta, uma mira a laser apontada para o alvo mais forte, o Capital.
            </Rv>
            <Rv k={5} as="p" className={styles.epi}>a.k.a. inimigo número 1 do estado</Rv>
          </div>
        </section>
      </div>
      <div ref={trilha} className={styles.trilha} />
    </main>
  );
}
