"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/vicenteFogo.module.css";
import { CAPITULOS, PERFIS } from "@/data/vicenteBlow";
import { NOS, CONEXOES } from "@/data/conexoes";
import { desenhaCamada } from "@/lib/floresta";
import { Arara, Onca, Tucano, Boto, Vagalumes } from "./FaunaMata";

/*
 * VBLXW · pega fogo.
 * O fundo é um campo de fogo em shader. A rolagem é a queimada: cada capítulo tem a sua intensidade (`fogo`) e o quanto o rio
 * apaga as chamas (`agua`, no Ruído das Águas). O cursor é uma tocha: o fogo sobe na direção dele, e o clique solta fagulhas.
 * Os textos acendem palavra por palavra.
 */

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision highp float;
uniform vec2 uRes,uM;uniform float uT,uB,uW,uH,uD;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;
 vec2 d=(uv-uM)*vec2(asp,1.);float md=length(d);
 vec2 p=vec2(uv.x*asp,uv.y);
 p+=vec2(sin(uT*2.+uv.y*18.),cos(uT*1.7+uv.x*18.))*.007*exp(-md*3.);
 vec3 col=mix(vec3(.008,.03,.015),vec3(.035,.1,.05),smoothstep(0.,1.,uv.y));
 col+=vec3(.0,.03,.015)*fbm(p*3.+uT*.02);
 vec3 dawn=mix(vec3(.62,.46,.16),vec3(.03,.14,.10),smoothstep(.02,.85,uv.y));
 float rr=smoothstep(.45,.9,fbm(vec2((uv.x+uv.y*.55)*3.2,uT*.04)))*(1.-uv.y*.8);
 dawn+=vec3(.55,.42,.14)*rr*.38;
 dawn+=vec3(.08,.10,.05)*fbm(p*2.2+uT*.03);
 col=mix(col,dawn,uD);
 float lvl=mix(.06,.7,uB);
 float q=fbm(vec2(p.x*2.1,p.y*1.5-uT*(.42+uH*.5)));
 float q2=fbm(vec2(p.x*4.6+3.1,p.y*3.1-uT*(.95+uH)));
 float fl=q*.62+q2*.38;
 float front=lvl-uv.y*.95+exp(-md*4.5)*.55*(.6+uH*.8);
 float f=smoothstep(.18,.9,fl+front*.95-.16);
 vec3 fire=mix(vec3(.30,.015,.0),vec3(1.,.36,.02),smoothstep(.25,.68,f));
 fire=mix(fire,vec3(1.,.7,.25),smoothstep(.8,1.,f)*.8);fire*=.9;
 fire=mix(fire,vec3(.04,.5,.55)*(.4+f),uW*.75);
 col=mix(col,fire,f*smoothstep(0.,.2,uB+.12)*(1.-uD*.96));
 col+=vec3(.06,.05,.045)*smoothstep(.45,1.,uv.y)*uB*fbm(vec2(p.x*1.4,uv.y*2.-uT*.12));
 col+=vec3(.0,.18,.2)*uW*smoothstep(.3,.9,uv.y)*fbm(vec2(p.x*2.,uv.y*3.+uT*.1))*.5;
 vec2 g=vec2(uv.x*asp*24.,uv.y*13.-uT*(1.1+uH*.8));vec2 id=floor(g),f2=fract(g)-.5;
 float r=h(id);
 float em=smoothstep(.09,0.,length(f2+(vec2(h(id+3.1),h(id+7.7))-.5)*.55))*step(.87-uH*.1,r)*(.45+.55*sin(uT*3.+r*40.));
 vec3 emc=mix(vec3(1.,.55,.15),vec3(.4,.95,.95),uW);
 col+=emc*em*(.3+uB*.9);
 col+=mix(vec3(1.,.28,.06),vec3(.2,.8,.9),uW)*exp(-md*11.)*.22;
 float v=smoothstep(1.3,.25,length((uv-.5)*vec2(asp,1.)));
 col*=.5+.65*v;
 float gr=fract(52.98*fract(dot(gl_FragCoord.xy+floor(uT*24.)*vec2(17.,31.),vec2(.0671,.00583))));
 col+=(gr-.5)*.045;
 gl_FragColor=vec4(col,1.);
}`;

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const NOMES = { spotify: "Spotify", youtube: "YouTube", deezer: "Deezer", soundcloud: "SoundCloud", instagram: "Instagram" };

function Icone({ r }) {
  if (r === "spotify")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#1DB954" />
        <path d="M5.2 8.7c4.3-1.3 9.5-1 13.4 1.3" fill="none" stroke="#000" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M5.9 12.2c3.6-1 7.7-.7 10.8 1.1" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.7 15.4c2.9-.7 5.9-.5 8.4.9" fill="none" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  if (r === "youtube")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="0.5" y="4" width="23" height="16" rx="4.5" fill="#FF0000" />
        <path d="M9.7 8.6v6.8l5.9-3.4z" fill="#fff" />
      </svg>
    );
  if (r === "soundcloud")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#FF5500" />
        <path d="M4 15.5v-3M6.2 16v-5M8.4 16v-6.2M10.6 16V9.2M12 16h6.2a2.4 2.4 0 0 0 .3-4.8 4.1 4.1 0 0 0-6.5-1.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  if (r === "deezer")
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

/* texto que acende palavra por palavra */
function Acende({ t, i0 = 0 }) {
  const ps = String(t).split(/(\s+)/);
  let k = i0;
  return ps.map((p, j) =>
    /^\s+$/.test(p) || p === "" ? (
      p
    ) : (
      <span key={j} className={styles.w} style={{ "--i": Math.min(k++, 70) }}>
        {p}
      </span>
    )
  );
}

const ARESTAS = CONEXOES.filter((c) => c.com.includes("vicente-blow"));
const VIZ = [...new Set(ARESTAS.flatMap((c) => c.com).filter((x) => x !== "vicente-blow"))];

function Grafo() {
  const [foco, setFoco] = useState(null);
  const cx = 300, cy = 255;
  const pos = (k) => {
    const a = -Math.PI / 2 + (k / VIZ.length) * Math.PI * 2;
    return [cx + Math.cos(a) * 212, cy + Math.sin(a) * 171];
  };
  const obras = foco ? ARESTAS.filter((c) => c.com.includes(foco)) : [];
  return (
    <div className={styles.grafo}>
      <svg viewBox="20 50 560 430" role="img" aria-label="Mapa de quem já fez música com o Vicente Blow">
        {VIZ.map((id, k) => {
          const [x, y] = pos(k);
          return <line key={id} x1={cx} y1={cy} x2={x} y2={y} className={foco === id ? styles.arOn : styles.ar} />;
        })}
        <circle cx={cx} cy={cy} r="62" className={styles.noC} />
        <text x={cx} y={cy + 8} textAnchor="middle" className={styles.noCT}>VBLXW</text>
        {VIZ.map((id, k) => {
          const [x, y] = pos(k);
          const n = NOS[id] || { nome: id };
          const inner = (
            <>
              <circle cx={x} cy={y} r="40" className={`${styles.no} ${n.grupo === "bruxos-do-norte" ? styles.noB : ""} ${foco === id ? styles.noOn : ""}`} />
              <text x={x} y={y + 4} textAnchor="middle" className={styles.noT}>{n.curto || n.nome.split(" ")[0]}</text>
              {n.rota && <text x={x} y={y + 60} textAnchor="middle" className={styles.noL}>abrir página ↗</text>}
            </>
          );
          return n.rota ? (
            <a key={id} href={n.rota} onMouseEnter={() => setFoco(id)} onFocus={() => setFoco(id)} onMouseLeave={() => setFoco(null)}>
              {inner}
            </a>
          ) : (
            <g key={id} onMouseEnter={() => setFoco(id)} onMouseLeave={() => setFoco(null)} tabIndex={0} onFocus={() => setFoco(id)} onBlur={() => setFoco(null)}>
              {inner}
            </g>
          );
        })}
      </svg>
      <p className={styles.grafoL} aria-live="polite">
        {foco ? obras.map((o) => `${o.obra} (${o.ano})`).join("  ·  ") : "em laranja, o Bruxos do Norte; em creme, quem vem de fora"}
      </p>
    </div>
  );
}

export default function VicenteFogo() {
  const cv = useRef(null);
  const trilha = useRef(null);
  const caps = useRef([]);
  const marcaRef = useRef(null);
  const raiz = useRef(null);
  const heroRef = useRef(null);
  const camadas = useRef([]);
  const telas = useRef([]);
  const fauna = useRef({});
  const legendas = useRef([]);
  const mataRef = useRef(null);
  const [atual, setAtual] = useState(-1);
  const ultimo = useRef(-2);
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, ativo: false, calor: 0 });

  useEffect(() => {
    const canvas = cv.current;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    const U = {};
    if (gl) {
      const sh = (t, s) => {
        const o = gl.createShader(t);
        gl.shaderSource(o, s);
        gl.compileShader(o);
        return o;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ["uRes", "uM", "uT", "uB", "uW", "uH", "uD"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    }
    telas.current.forEach((cvs, i) => cvs && desenhaCamada(cvs, i));
    const redim = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1.25) * 0.6;
      canvas.width = Math.max(2, Math.round(window.innerWidth * k));
      canvas.height = Math.max(2, Math.round(window.innerHeight * k));
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    };
    redim();
    window.addEventListener("resize", redim);

    const mv = (e) => {
      mouse.current.tx = e.clientX / window.innerWidth;
      mouse.current.ty = e.clientY / window.innerHeight;
      mouse.current.ativo = true;
    };
    const dn = (e) => {
      const r = raiz.current;
      mouse.current.calor = 1;
      if (!r || e.target.closest("a,button,svg")) return;
      for (let k = 0; k < 14; k++) {
        const f = document.createElement("i");
        f.className = styles.fagulha;
        f.style.left = e.clientX + "px";
        f.style.top = e.clientY + "px";
        f.style.setProperty("--dx", `${(Math.random() - 0.5) * 220}px`);
        f.style.setProperty("--dy", `${-60 - Math.random() * 220}px`);
        f.style.animationDuration = `${0.8 + Math.random() * 0.9}s`;
        r.appendChild(f);
        setTimeout(() => f.remove(), 1800);
      }
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerdown", dn);

    const centros = (vh) => CAPITULOS.map((c, i) => vh * 5.7 + i * vh * 1.4);
    let raf, y = 0, fogo = 0, agua = 0, brAnt = 1;
    const t0 = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const C = centros(vh);
      const total = Math.round(C[C.length - 1] + vh * 0.7);
      if (trilha.current && trilha.current.dataset.h !== String(total)) {
        trilha.current.dataset.h = String(total);
        trilha.current.style.setProperty("height", total + vh + "px", "important");
      }
      const alvo = Math.max(0, Math.min(total, window.scrollY));
      y += (alvo - y) * 0.09;
      if (Math.abs(alvo - y) < 0.4) y = alvo;
      const t = (performance.now() - t0) / 1000;

      // intensidade do fogo e do rio: interpola entre os capítulos
      const pts = [[0, 0, 0], [vh * 2.7, 0, 0], [vh * 4.7, 0.55, 0], ...CAPITULOS.map((c, i) => [C[i], c.fogo, c.agua])];
      let aF = pts[pts.length - 1][1], aA = pts[pts.length - 1][2];
      if (y <= pts[0][0]) { aF = pts[0][1]; aA = pts[0][2]; }
      else
        for (let i = 0; i < pts.length - 1; i++)
          if (y >= pts[i][0] && y <= pts[i + 1][0]) {
            const k = sm((y - pts[i][0]) / (pts[i + 1][0] - pts[i][0]));
            aF = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k;
            aA = pts[i][2] + (pts[i + 1][2] - pts[i][2]) * k;
            break;
          }
      fogo += (aF - fogo) * 0.1;
      agua += (aA - agua) * 0.1;

      const m = mouse.current;
      if (!m.ativo) {
        m.tx = 0.5 + Math.sin(t * 0.45) * 0.3;
        m.ty = 0.72 + Math.sin(t * 0.33 + 1.3) * 0.12;
      }
      m.x += (m.tx - m.x) * 0.1;
      m.y += (m.ty - m.y) * 0.1;
      m.calor += (0 - m.calor) * 0.04;

      if (gl) {
        gl.uniform2f(U.uRes, canvas.width, canvas.height);
        gl.uniform2f(U.uM, m.x, 1 - m.y);
        gl.uniform1f(U.uT, t);
        gl.uniform1f(U.uB, Math.min(1, fogo));
        gl.uniform1f(U.uW, agua);
        gl.uniform1f(U.uH, m.calor);
        gl.uniform1f(U.uD, 1 - sm((y - vh * 2.8) / (vh * 1.6)));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      // mata: parallax em profundidade (a câmera entra na floresta), o mouse desloca cada plano
      const fp = Math.min(1, Math.max(0, (y - vh * 0.4) / (vh * 4.2)));
      const op = 1 - 0.72 * sm((y - vh * 4.9) / (vh * 0.9));
      const Z = [0.12, 0.3, 0.65, 1.25], TY = [10, 30, 62, 120], MX = [10, 22, 40, 74], MY = [6, 12, 22, 36];
      camadas.current.forEach((el, i) => {
        if (!el) return;
        const mx = (m.x - 0.5) * MX[i], my = (m.y - 0.5) * MY[i];
        if (i < 2) el.style.opacity = (1 - sm((fp - 0.5) / 0.4) * (i ? 0.78 : 0.9)).toFixed(3);
        el.style.transform = `translate3d(${(-mx).toFixed(1)}px, ${(-fp * TY[i] - my).toFixed(1)}px, 0) scale(${(1 + fp * Z[i]).toFixed(4)})`;
      });
      if (mataRef.current) {
        mataRef.current.style.opacity = op.toFixed(3);
        const br = Math.max(0.28, 1 - sm((fp - 0.45) / 0.35) * 0.72);
        if (Math.abs(br - brAnt) > 0.02) {
          brAnt = br;
          mataRef.current.style.setProperty("--br", br.toFixed(3));
        }
        mataRef.current.style.setProperty("--ig", sm((fp - 0.5) / 0.4).toFixed(3));
      }
      const F = fauna.current;
      if (F.aves) {
        F.aves.style.opacity = (1 - sm((fp - 0.48) / 0.14)).toFixed(3);
        F.aves.style.transform = `translate3d(0, ${(-sm((fp - 0.48) / 0.25) * vh * 0.7).toFixed(1)}px, 0)`;
      }
      if (F.onca) F.onca.style.opacity = (sm((fp - 0.22) / 0.12) * (1 - sm((fp - 0.56) / 0.1))).toFixed(3);
      if (F.tucano) F.tucano.style.opacity = (sm((fp - 0.1) / 0.1) * (1 - sm((fp - 0.5) / 0.1))).toFixed(3);
      if (F.vaga) F.vaga.style.opacity = (1 - sm((fp - 0.42) / 0.12)).toFixed(3);
      const jan = (a, b, c2, d) => sm((y / vh - a) / (b - a)) * (1 - sm((y / vh - c2) / (d - c2)));
      const J = [jan(1.15, 1.6, 2.3, 2.7), jan(2.75, 3.1, 3.6, 3.95), jan(3.95, 4.35, 5.0, 5.4)];
      legendas.current.forEach((el, q) => {
        if (!el) return;
        el.style.opacity = J[q].toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - J[q]) * 24).toFixed(1)}px, 0)`;
      });
      if (F.fosforo) {
        const o = jan(3.0, 3.25, 3.75, 4.0);
        F.fosforo.style.opacity = o.toFixed(3);
      }

      const oH = 1 - sm(y / (vh * 0.9));
      if (heroRef.current) {
        heroRef.current.style.opacity = oH.toFixed(3);
        heroRef.current.style.transform = `translate3d(0, ${(-y * 0.3).toFixed(1)}px, 0)`;
        heroRef.current.style.filter = `blur(${((1 - oH) * 9).toFixed(1)}px)`;
        heroRef.current.style.visibility = oH < 0.01 ? "hidden" : "visible";
      }

      let idx = -1, melhor = 1e9;
      CAPITULOS.forEach((c, i) => {
        const nd = caps.current[i];
        if (!nd) return;
        const d = Math.abs(y - C[i]);
        if (d < melhor) { melhor = d; idx = i; }
        const o = 1 - sm((d - vh * 0.36) / (vh * 0.3));
        nd.style.opacity = o.toFixed(3);
        nd.style.visibility = o < 0.01 ? "hidden" : "visible";
        nd.style.pointerEvents = o > 0.5 ? "auto" : "none";
        nd.style.setProperty("--p", ((y - C[i]) / vh).toFixed(3));
        nd.classList.toggle(styles.on, o > 0.35);
      });
      if (y < C[0] - vh * 0.9) idx = -1;
      if (ultimo.current !== idx) { ultimo.current = idx; setAtual(idx); }
      if (marcaRef.current) marcaRef.current.style.top = `${(100 - Math.min(1, y / total) * 100).toFixed(1)}%`;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", redim);
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerdown", dn);
    };
  }, []);

  const cap = atual >= 0 ? CAPITULOS[atual] : null;

  return (
    <main ref={raiz} className={styles.raiz}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Space+Mono:wght@400;700&display=swap"
      />
      <VoltarJodo />
      <div className={styles.palco}>
        <canvas ref={cv} className={styles.fogo} aria-hidden="true" />

        <div ref={mataRef} className={styles.mata} aria-hidden="true">
          <div className={styles.camada} ref={(n) => (camadas.current[0] = n)}>
            <canvas ref={(n) => (telas.current[0] = n)} />
            <Boto s={styles} />
          </div>
          <div className={styles.camada} ref={(n) => (camadas.current[1] = n)}>
            <canvas ref={(n) => (telas.current[1] = n)} />
            <div ref={(n) => (fauna.current.tucano = n)} className={styles.ancTucano}><Tucano s={styles} /></div>
          </div>
          <div ref={(n) => (fauna.current.aves = n)} className={styles.aves}>
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <div key={k} className={styles.arara} style={{ "--k": k, animationDelay: `${[-1, -9.5, -4.2, -13, -6.8, -11.4][k]}s`, animationDuration: `${[15, 18.5, 21, 16.5, 23, 19][k]}s` }}>
                <Arara s={styles} />
              </div>
            ))}
          </div>
          <div className={styles.camada} ref={(n) => (camadas.current[2] = n)}>
            <canvas ref={(n) => (telas.current[2] = n)} />
            <div ref={(n) => (fauna.current.onca = n)} className={styles.ancOnca}><Onca s={styles} /></div>
          </div>
          <div className={styles.camada} ref={(n) => (camadas.current[3] = n)}>
            <canvas ref={(n) => (telas.current[3] = n)} />
            <div ref={(n) => (fauna.current.vaga = n)} className={styles.vagas}><Vagalumes s={styles} /></div>
          </div>
          <div className={styles.brilho} />
        </div>

        <div ref={(n) => (fauna.current.fosforo = n)} className={styles.fosforo} aria-hidden="true" />
        {[
          ["a mata de pé.", "antes"],
          ["alguém riscou o fósforo.", "o estopim"],
          ["amazônia pega fogo.", "depois"],
        ].map(([t, k], q) => (
          <div key={t} ref={(n) => (legendas.current[q] = n)} className={styles.legenda}>
            <small>{k}</small>
            <b>{t}</b>
          </div>
        ))}

        <header className={styles.topo}>
          <a href="/" className={styles.marca} aria-label="VBLXW: voltar ao topo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <i />
            <span>vblxw</span>
          </a>
        </header>

        <div ref={heroRef} className={styles.hero}>
          <small className={styles.kick}>manaus · amazonas · desde 2013</small>
          <h1>VBLXW</h1>
          <p className={styles.nome}>vicente blow</p>
          <p className={styles.epi}>a.k.a. inimigo número 1 do estado</p>
          <span className={styles.desce}>desce e deixa queimar ↓</span>
        </div>

        {CAPITULOS.map((c, i) => {
          let k = 0;
          const ac = (t) => {
            const el = <Acende t={t} i0={k} />;
            k += String(t).split(/\s+/).length;
            return el;
          };
          return (
            <section key={c.id} data-cap={c.id} ref={(n) => (caps.current[i] = n)} className={`${styles.cap} ${i % 2 === 0 ? "" : styles.inv} ${c.est === "cond" ? styles.cond : ""}`}>
              {c.ano && <div className={styles.fantasma} aria-hidden="true">{c.ano}</div>}
              <div className={styles.capTxt}>
                <span className={styles.sel}>{c.rotulo ? `${c.rotulo} · ${c.sel}` : c.sel}</span>
                <h2>{ac(c.titulo)}</h2>
                {c.lide && <p className={styles.lide}>{ac(c.lide)}</p>}
                {c.bio &&
                  c.bio.map((linha, q) => (
                    <p key={q} className={styles.bio}>
                      {linha.map((trecho, j) => (j % 2 === 1 ? <mark key={j}>{ac(trecho)}</mark> : <span key={j}>{ac(trecho)}</span>))}
                    </p>
                  ))}
                {c.fecho && <p className={styles.fecho}>{c.fecho}</p>}
                {c.texto && c.texto.map((t, q) => <p key={q}>{ac(t)}</p>)}
                {c.credito && (
                  <p className={styles.credito}>
                    {c.credito.t}: <a href={c.credito.url} target="_blank" rel="noreferrer">{c.credito.nome}</a>
                  </p>
                )}
                {c.com && (
                  <div className={styles.chips}>
                    <span>com</span>
                    {c.com.map((id) => {
                      const n = NOS[id];
                      const nome = n ? n.curto || n.nome : id;
                      return n && n.rota ? (
                        <a key={id} href={n.rota}>{nome} ↗</a>
                      ) : (
                        <b key={id}>{nome}</b>
                      );
                    })}
                  </div>
                )}
                {c.links && (
                  <p className={styles.icones}>
                    {c.links.map(([r, u]) => (
                      <a key={u} href={u} target="_blank" rel="noreferrer" aria-label={NOMES[r]} title={NOMES[r]}>
                        <Icone r={r} />
                      </a>
                    ))}
                  </p>
                )}
                {c.tipo === "plataformas" && (
                  <>
                    <ul className={styles.plats}>
                      {[
                        ["spotify", "Spotify", "artista e discografia", PERFIS.spotify],
                        ["deezer", "Deezer", "12 lançamentos", PERFIS.deezer],
                        ["youtube", "YouTube", "Ruído das Águas, o álbum completo", PERFIS.youtubeAlbum],
                        ["soundcloud", "SoundCloud", "o perfil do Bruxos do Norte", PERFIS.soundcloudGrupo],
                        ["instagram", "Instagram", "@bruxobuya", PERFIS.instagram],
                      ].map(([r, nome, sub, u]) => (
                        <li key={r}>
                          <a href={u} target="_blank" rel="noreferrer">
                            <span className={styles.platIc}><Icone r={r} /></span>
                            <b>{nome}</b>
                            <em>{sub}</em>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className={styles.paraTopo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                      ↑ voltar ao fogo
                    </button>
                  </>
                )}
              </div>
              <div className={styles.midia}>
                {c.retrato && <img className={styles.retrato} src="/vb/retrato.webp" alt="Vicente Blow de trança, camiseta laranja, com a mão no rosto" loading="lazy" />}
                {c.capa && (
                  <div className={styles.moldura}>
                    <img src={`/vb/capas/${c.capa}.webp`} alt={`Capa de ${c.titulo}`} loading="lazy" />
                  </div>
                )}
                {c.capas && (
                  <div className={`${styles.pilha} ${c.capas.length < 4 ? styles.pilha2 : ""}`}>
                    {c.capas.map((s, q) => (
                      <img key={s} style={{ "--k": q }} src={`/vb/capas/${s}.webp`} alt={`Capa de ${s.replaceAll("-", " ")}`} loading="lazy" />
                    ))}
                  </div>
                )}
                {c.fatos && (
                  <ol className={styles.fatos}>
                    {c.fatos.map(([a, t]) => (
                      <li key={a}>
                        <b>{a}</b>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {c.tipo === "grafo" && <Grafo />}
              </div>
            </section>
          );
        })}

        <aside className={styles.regua} aria-label="Linha do tempo">
          <b>hoje</b>
          <div className={styles.fita}>
            <i ref={marcaRef} className={styles.marcaAno} />
          </div>
          <b>1999</b>
          <span className={styles.anoAtual}>{cap && cap.ano ? cap.ano : ""}</span>
        </aside>
      </div>
      <div ref={trilha} className={styles.trilha} />
    </main>
  );
}
