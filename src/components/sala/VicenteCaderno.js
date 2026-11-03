"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef } from "react";
import styles from "@/styles/vicenteCaderno.module.css";
import { PERFIS } from "@/data/vicenteBlow";

/*
 * VBLXW · caderno.
 * A página é o caderno dele: papel xerox, tinta vermelha, letra à mão. Para virar a página, a folha queima de verdade.
 * Na seção "Amazônia pega fogo" a floresta é um desenho a carvão: traçada à mão, depois queima e cai em cinza
 * (a tinta feita de cinza de árvore queimada é o que o artista Mundano usa na "Brigada da Floresta").
 */

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const CAPS = [
  { id: "capa", L: 1.5, papel: 0 },
  { id: "quem", L: 1.8, papel: 1 },
  { id: "fogo", L: 3.6, papel: 2 },
];

// ---------- a folha que queima ----------
const VERT_Q = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
const FRAG_Q = `precision highp float;
varying vec2 uv;uniform vec2 uRes;uniform float uT,uP,uPa,uPb;uniform vec2 uIg;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n2(p);p*=2.03;a*=.5;}return s;}
// papel: 0 e 1 = xerox escuro; 2 = papel claro de caderno
vec3 papel(float idx,vec2 p){
  float fib=fbm(p*vec2(9.,22.));
  float mancha=fbm(p*2.2+idx*7.);
  float toner=step(.985,h21(floor(p*vec2(420.,260.))+idx));
  if(idx>1.5){
    vec3 c=vec3(.84,.8,.7)*(.9+.2*fib)*(.9+.14*mancha);
    c-=toner*.25;
    return c;
  }
  vec3 base=mix(vec3(.055,.05,.045),vec3(.075,.055,.05),idx);
  vec3 c=base*(.85+.5*fib)*(.8+.6*mancha)+toner*.12;
  c+=vec3(.05,.01,.0)*smoothstep(.55,.85,mancha)*idx;
  return c;
}
void main(){
  float asp=uRes.x/uRes.y;
  vec2 p=uv*vec2(asp,1.);
  vec3 A=papel(uPa,p),B=papel(uPb,p);
  float d=distance(uv*vec2(asp,1.),uIg*vec2(asp,1.))/(asp*.9+.5);
  float ruido=fbm(p*3.2+uT*.02)*.55+fbm(p*9.)*.12;
  float x=(ruido*.55+d*.7)-(uP*1.55-.12);
  float queimou=smoothstep(.0,-.015,x);
  float h=exp(-pow((x+.012)/.05,2.));
  float carvao=smoothstep(.0,.04,x)*(1.-smoothstep(.1,.28,x));
  vec3 col=mix(A,vec3(0.),carvao*.92);
  col=mix(col,B,queimou);
  float k=h*step(.001,uP)*(1.-step(.999,uP));
  vec3 ember=mix(vec3(1.,.2,.03),vec3(1.,.86,.46),h*h);
  vec3 emis=ember*k*(1.3+fbm(p*30.+uT*3.));
  gl_FragColor=vec4(col+emis,1.);
}`;

const Rv = ({ k = 0, as: T = "div", className = "", children, ...r }) => (
  <T className={`${styles.rv} ${className}`} style={{ "--k": k }} {...r}>
    {children}
  </T>
);

export default function VicenteCaderno() {
  const cvQ = useRef(null);
  const cvC = useRef(null);
  const trilha = useRef(null);
  const caps = useRef([]);
  const geo = useRef({ B: [], total: 0 });
  const focos = useRef(null);

  useEffect(() => {
    const antes = [document.documentElement.style.cssText, document.body.style.cssText];
    document.documentElement.style.overflow = "visible";
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflow = "visible";
    document.body.style.overflowX = "clip";
    const mobile = innerWidth < 860;

    // ----- folha (webgl cru) -----
    const cq = cvQ.current;
    const gl = cq.getContext("webgl", { antialias: false, alpha: false });
    let UQ = null;
    if (gl) {
      const sh = (t, s) => {
        const o = gl.createShader(t);
        gl.shaderSource(o, s);
        gl.compileShader(o);
        if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o));
        return o;
      };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT_Q));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG_Q));
      gl.linkProgram(pr);
      gl.useProgram(pr);
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const l = gl.getAttribLocation(pr, "p");
      gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
      UQ = {};
      ["uRes", "uT", "uP", "uPa", "uPb", "uIg"].forEach((n) => (UQ[n] = gl.getUniformLocation(pr, n)));
    }
    const dimQ = () => {
      cq.width = Math.floor(innerWidth * 0.7);
      cq.height = Math.floor(innerHeight * 0.7);
      if (gl) gl.viewport(0, 0, cq.width, cq.height);
    };
    dimQ();

    // ----- o desenho a carvão da floresta -----
    const cc = cvC.current;
    const c2 = cc.getContext("2d");
    let CW = 0, CH = 0;
    const dimC = () => {
      CW = cc.width = innerWidth;
      CH = cc.height = innerHeight;
    };
    dimC();
    let sd = 11;
    const rn = () => {
      sd = (sd * 16807) % 2147483647;
      return (sd - 1) / 2147483646;
    };
    const hj = (n) => {
      const s = Math.sin(n * 127.1) * 43758.5453;
      return s - Math.floor(s);
    };
    const NA = mobile ? 9 : 15;
    const arvores = Array.from({ length: NA }, (_, i) => {
      const xn = (mobile ? 0.1 : 0.37) + (i / (NA - 1)) * (mobile ? 0.88 : 0.61) + (rn() - 0.5) * 0.03;
      const pts = [];
      for (let k = 0; k <= 14; k++) pts.push([(rn() - 0.5) * 0.012 + Math.sin(k * 0.5 + i) * 0.01, k / 14]);
      return {
        xn,
        hn: 0.34 + rn() * 0.36,
        pts,
        w: 4 + rn() * 9,
        ini: rn() * 0.1,
        galhos: Array.from({ length: 4 + ((rn() * 3) | 0) }, () => ({ t: 0.42 + rn() * 0.45, dir: rn() > 0.5 ? 1 : -1, len: 0.05 + rn() * 0.1, ang: 0.4 + rn() * 0.7 })),
        folhas: Array.from({ length: 48 }, () => ({ a: rn() * 6.283, r: Math.sqrt(rn()), s: 0.014 + rn() * 0.03, rot: rn() * 6.283 })),
        inicioFogo: 0.34 + (1 - (xn - 0.1) / 0.9) * 0.36,
      };
    });
    const brasas = [];
    const cinzas = [];
    const CARV = "26,23,20";
    // um traço de carvão: três passadas com um tremor que não muda de quadro para quadro
    const traco = (x1, y1, x2, y2, w, a, cor, seed) => {
      for (let k = 0; k < 3; k++) {
        const j = (hj(seed * 7.1 + k * 3.3) - 0.5) * 2.4, j2 = (hj(seed * 3.7 + k) - 0.5) * 2.4;
        c2.strokeStyle = `rgba(${cor},${(a * (k === 0 ? 1 : 0.55)).toFixed(3)})`;
        c2.lineWidth = Math.max(0.8, w * (1 - k * 0.32));
        c2.beginPath();
        c2.moveTo(x1 + j, y1 + j2);
        c2.lineTo(x2 + j2, y2 + j);
        c2.stroke();
      }
    };

    const desenhaCarvao = (p, t, alpha) => {
      c2.clearRect(0, 0, CW, CH);
      if (alpha < 0.01) return;
      c2.globalAlpha = alpha;
      c2.lineCap = "round";
      const by = CH * 0.9;
      for (let x = 0; x < CW; x += 14) traco(x, by + (hj(x) - 0.5) * 3, x + 16, by + (hj(x + 1) - 0.5) * 3, 3, 0.55 * sm(p / 0.08), CARV, x);
      arvores.forEach((a, ai) => {
        const bx = a.xn * CW, H = a.hn * CH;
        const r = sm((p - a.ini - 0.02) / 0.16);
        if (r <= 0) return;
        const b = sm((p - a.inicioFogo) / 0.22);
        const hf = b * 1.2; // altura (0..1.2) onde a frente de fogo está
        const estado = (tn) => {
          if (b <= 0 || tn > hf) return 0; // intacto
          return hf - tn < 0.13 ? 1 : 2; // 1 chama, 2 cinza
        };
        const corte = (tn) => {
          const s = estado(tn);
          if (s === 0) return [CARV, 0.8];
          if (s === 1) return ["255,90,42", 0.95];
          return ["168,160,146", Math.max(0.16, 0.5 - (hf - tn) * 0.7)];
        };
        const p0 = a.pts;
        const nSeg = Math.floor(r * 14);
        for (let k = 0; k < nSeg; k++) {
          const tn = p0[k][1];
          const x1 = bx + p0[k][0] * CH, y1 = by - tn * H, x2 = bx + p0[k + 1][0] * CH, y2 = by - p0[k + 1][1] * H;
          const [cor, al] = corte(tn);
          traco(x1, y1, x2, y2, a.w * (1 - tn * 0.6), al, cor, ai * 100 + k);
          if (estado(tn) === 1) {
            const fl = 18 + hj(ai * 31 + k + Math.floor(t * 9)) * 46;
            c2.strokeStyle = `rgba(255,${150 + (hj(k + Math.floor(t * 12)) * 80 | 0)},40,0.85)`;
            c2.lineWidth = 3 + hj(ai + k + Math.floor(t * 10)) * 5;
            c2.beginPath();
            c2.moveTo(x1 + (hj(k * 1.7 + t) - 0.5) * 8, y1);
            c2.lineTo(x1 + (hj(k * 2.3 + t * 1.3) - 0.5) * 16, y1 - fl);
            c2.stroke();
            if (rn() < 0.12 && brasas.length < 160) brasas.push({ x: x1, y: y1, vx: (rn() - 0.5) * 0.8, vy: -(0.6 + rn() * 1.6), l: 1 });
          }
          if (estado(tn) === 2 && rn() < 0.05 && cinzas.length < 260) cinzas.push({ x: x1 + (rn() - 0.5) * 10, y: y1, vx: (rn() - 0.5) * 0.4, vy: 0.3 + rn() * 0.8, l: 1, s: 1 + rn() * 2 });
        }
        if (r > 0.55) {
          a.galhos.forEach((g, gi) => {
            const k = Math.floor(g.t * 14);
            if (k >= nSeg) return;
            const x1 = bx + p0[k][0] * CH, y1 = by - g.t * H;
            const [cor, al] = corte(g.t);
            traco(x1, y1, x1 + g.dir * g.len * CH, y1 - g.len * CH * g.ang, a.w * 0.34, al, cor, ai * 100 + 40 + gi);
          });
        }
        if (r > 0.8) {
          const topY = by - H * 0.95, topX = bx + p0[13][0] * CH;
          a.folhas.forEach((f, fi) => {
            const cx = topX + Math.cos(f.a) * f.r * CH * 0.1, cy = topY + Math.sin(f.a) * f.r * CH * 0.075;
            const [cor, al] = corte(0.9 + (1 - (cy - (topY - CH * 0.08)) / (CH * 0.16)) * 0.3);
            traco(cx, cy, cx + Math.cos(f.rot) * f.s * CH, cy + Math.sin(f.rot) * f.s * CH, 2.4, al * 0.75, cor, ai * 100 + 60 + fi);
          });
        }
        // mancha de queimado no papel, onde a árvore já virou cinza
        if (b > 0.6) {
          const g = c2.createRadialGradient(bx, by, 2, bx, by, 70);
          g.addColorStop(0, `rgba(${CARV},${0.2 * b})`);
          g.addColorStop(1, `rgba(${CARV},0)`);
          c2.fillStyle = g;
          c2.fillRect(bx - 70, by - 70, 140, 140);
        }
      });
      // brasas sobem; cinzas caem
      for (let i = brasas.length - 1; i >= 0; i--) {
        const q = brasas[i];
        q.x += q.vx + Math.sin(t * 3 + i) * 0.3;
        q.y += q.vy;
        q.l -= 0.012;
        if (q.l <= 0) { brasas.splice(i, 1); continue; }
        c2.fillStyle = `rgba(255,${120 + (q.l * 90 | 0)},30,${q.l.toFixed(2)})`;
        c2.fillRect(q.x, q.y, 2.5, 2.5);
      }
      for (let i = cinzas.length - 1; i >= 0; i--) {
        const q = cinzas[i];
        q.x += q.vx + Math.sin(t * 1.5 + i) * 0.25;
        q.y += q.vy;
        q.l -= 0.006;
        if (q.l <= 0 || q.y > CH) { cinzas.splice(i, 1); continue; }
        c2.fillStyle = `rgba(120,112,100,${(q.l * 0.6).toFixed(2)})`;
        c2.fillRect(q.x, q.y, q.s, q.s);
      }
      c2.globalAlpha = 1;
    };

    const mede = () => {
      const vh = innerHeight;
      const B = [0];
      CAPS.forEach((c) => B.push(B[B.length - 1] + c.L * vh));
      geo.current = { B, total: B[B.length - 1] };
      if (trilha.current) trilha.current.style.height = `${B[B.length - 1] + vh}px`;
    };
    mede();
    const onResize = () => {
      dimQ();
      dimC();
      mede();
    };
    addEventListener("resize", onResize);

    const ignicoes = [[0.82, 0.3], [0.2, 0.7], [0.5, 0.5]];
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) / 1000;
      const { B, total } = geo.current;
      const y = Math.min(total, Math.max(0, scrollY));
      let ic = 0;
      while (ic < CAPS.length - 1 && y >= B[ic + 1]) ic++;
      const meia = innerHeight * 0.3;
      caps.current.forEach((el, i) => {
        if (!el) return;
        const ent = i === 0 ? 1 : sm((y - (B[i] - meia * 0.4)) / meia);
        const sai = i === CAPS.length - 1 ? 1 : 1 - sm((y - (B[i + 1] - meia * 1.1)) / meia);
        const o = Math.min(ent, sai);
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.classList.toggle(styles.on, o > 0.55);
      });
      let P = 0;
      if (ic < CAPS.length - 1) P = sm((y - (B[ic + 1] - meia * 1.3)) / (meia * 1.5));
      const iF = 2;
      const pf = Math.min(1, Math.max(0, (y - B[iF]) / Math.max(1, B[iF + 1] - B[iF])));
      desenhaCarvao(pf * 1.05, t, sm((y - (B[iF] - meia * 0.2)) / (meia * 0.8)));
      if (focos.current) {
        const txt = Math.round(89178 * sm((pf - 0.3) / 0.45)).toLocaleString("pt-BR");
        if (focos.current.textContent !== txt) focos.current.textContent = txt;
      }
      if (gl && UQ) {
        gl.uniform2f(UQ.uRes, cq.width, cq.height);
        gl.uniform1f(UQ.uT, t);
        gl.uniform1f(UQ.uP, P);
        gl.uniform1f(UQ.uPa, CAPS[ic].papel);
        gl.uniform1f(UQ.uPb, CAPS[Math.min(CAPS.length - 1, ic + 1)].papel);
        const ig = ignicoes[ic % ignicoes.length];
        gl.uniform2f(UQ.uIg, ig[0], ig[1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
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
        href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Reenie+Beanie&family=Special+Elite&family=Space+Mono:wght@400;700&display=swap"
      />
      <canvas ref={cvQ} className={styles.folha} aria-hidden="true" />
      <VoltarJodo />

      <div className={styles.palco}>
        {/* ============ capa ============ */}
        <section ref={cap(0)} className={`${styles.cap} ${styles.capa}`}>
          <Rv k={0} as="p" className={styles.digital}>vblxw · manaus · amazonas · desde 2013</Rv>
          <div className={styles.tituloBox}>
            <Rv k={1} as="h1" className={styles.nome}>
              <span>Vicente</span>
              <span>Blow</span>
            </Rv>
            <Rv k={2} className={styles.rabisco} aria-hidden="true">
              <svg viewBox="0 0 400 30" preserveAspectRatio="none"><path d="M4 18 C 60 6, 90 28, 150 14 S 260 4, 300 18 S 370 24, 396 8" fill="none" stroke="#e8352a" strokeWidth="5" strokeLinecap="round" /></svg>
            </Rv>
          </div>
          <Rv k={3} as="p" className={styles.mao}>rapper · Bruxos do Norte · <b>“el camiño de cobra”</b></Rv>
          <Rv k={4} as="div" className={styles.carimbo}>inimigo<br />número 1<br />do estado</Rv>
          <Rv k={5} className={styles.cta}>
            <a className={styles.btn} href={PERFIS.spotify} target="_blank" rel="noreferrer">ouvir no Spotify ↗</a>
            <a className={styles.btn2} href={PERFIS.instagram} target="_blank" rel="noreferrer">@bruxobuya ↗</a>
          </Rv>
          <Rv k={6} as="p" className={styles.virar}>vira a página ↓</Rv>
        </section>

        {/* ============ quem é ============ */}
        <section ref={cap(1)} className={`${styles.cap} ${styles.quem}`}>
          <div className={styles.quemEsq}>
            <Rv k={0} as="h2" className={styles.manchete}>
              <span>nasceu</span>
              <span>marcado.</span>
            </Rv>
            <Rv k={1} as="p" className={styles.mao}>sobreviveu <u>rimando</u>.</Rv>
            <Rv k={2} as="p" className={styles.anotacao}>1999 ↗ cordão no pescoço</Rv>
          </div>
          <div className={styles.quemDir}>
            <Rv k={1} as="p" className={styles.datilo}>
              Nascido em 99, com o cordão umbilical enrolado no pescoço. Marcado para morrer, <mark>desafiou Deus e matou o próprio senhor destino.</mark>
            </Rv>
            <Rv k={2} as="p" className={styles.datilo}>Ver o mundo pelo pior lado foi sua terapia. <mark>Desenhar com sangue</mark>, seu primeiro ofício.</Rv>
            <Rv k={3} as="p" className={styles.datilo}>
              O rap acendeu a consciência política: o ódio bruto virou <mark>munição organizada</mark> e a caneta, uma mira a laser apontada para o alvo mais forte, o Capital.
            </Rv>
            <Rv k={4} as="p" className={styles.mao}>a.k.a. inimigo número 1 do estado</Rv>
          </div>
        </section>

        {/* ============ amazônia pega fogo ============ */}
        <section ref={cap(2)} className={`${styles.cap} ${styles.fogo}`}>
          <canvas ref={cvC} className={styles.carvao} aria-hidden="true" />
          <div className={styles.fogoTxt}>
            <Rv k={0} as="p" className={styles.digitalEscuro}>29.02.2020 · o primeiro single</Rv>
            <Rv k={1} as="h2" className={styles.fogoTit}>
              <span>Amazônia</span>
              <span>pega fogo.</span>
            </Rv>
            <Rv k={2} as="p" className={styles.maoEscura}>alguém riscou o fósforo.</Rv>
            <Rv k={3} as="p" className={styles.datiloEscuro}>
              Em 2019, o INPE contou <mark>89.178 focos</mark> de queimada na Amazônia, 30% a mais que em 2018. Cerca de 45% dos focos de agosto de 2019 a setembro de 2020 estavam em áreas recém-desmatadas.
            </Rv>
            <Rv k={4} as="p" className={styles.contador}>
              <b ref={focos}>0</b>
              <span>focos de calor, 2019 (INPE)</span>
            </Rv>
            <Rv k={5} as="a" className={styles.link} href="https://www.youtube.com/watch?v=tocLEg0aDbs" target="_blank" rel="noreferrer">ouvir “Amazônia pega fogo” ↗</Rv>
          </div>
        </section>
      </div>

      <div ref={trilha} className={styles.trilha} />
    </main>
  );
}
