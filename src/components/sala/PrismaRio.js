"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import useContrasteLogo from "@/lib/useContrasteLogo";
import styles from "@/styles/prismaRio.module.css";
import { CAPITULOS, HOJE, PERFIS, FUNDO_TITULO } from "@/data/prisma";
import SC_TODAS from "@/data/prSc.json";
import FEED from "@/data/prFeed.json";
const FAIXAS_SC = SC_TODAS.slice(0, 10);

/*
 * PRISM∆ · cheia e vazante.
 * A rolagem é o mergulho: começa na superfície do Rio Negro ao entardecer e desce capítulo a capítulo, do mais novo
 * ao mais antigo. A régua mostra a cota REAL do rio no porto de Manaus no dia de cada capítulo (ANA, estação 14990000).
 * Quanto mais baixo o rio, mais o leito aparece.
 */

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uT,uM,uN;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
vec3 sky(float y){
 vec3 hor=vec3(.86,.20,.42),mid=vec3(.97,.55,.25),top=vec3(.035,.025,.11);
 vec3 c=mix(mid,hor,smoothstep(0.,.12,y));
 return mix(c,top,smoothstep(.06,.78,y));
}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;
 float base=asp<1.?.28:.50;float surf=mix(base,1.45,smoothstep(.03,.30,uM));
 float wave=.010*sin(uv.x*11.+uT*.7)+.006*sin(uv.x*23.-uT*1.1)+.012*(fbm(vec2(uv.x*4.,uT*.15))-.5);
 float s=surf+wave;
 vec3 col;
 if(uv.y>s){
  float y=(uv.y-s)/(1.05-min(s,.98));
  col=sky(y);
  float g=exp(-pow((uv.x-.68)*asp*2.2,2.)-pow((uv.y-s-.05)*5.,2.));
  col+=vec3(1.,.6,.3)*g*.55*(1.-smoothstep(.15,.5,uM));
 }else{
  float d=s-uv.y;
  float depth=d+uM*.9;
  vec3 top=vec3(.30,.12,.14),mid=vec3(.07,.035,.03),deep=vec3(.010,.007,.008);
  col=mix(top,mid,smoothstep(0.,.35,d));
  col=mix(col,deep,smoothstep(.1,1.3,depth));
  col+=sky(0.)*.35*exp(-d*9.)*(.5+.5*fbm(vec2(uv.x*6.,uv.y*20.+uT*.3)));
  float rx=uv.x*asp*3.+uv.y*.6;
  float rays=smoothstep(.45,.85,fbm(vec2(rx*1.5+uT*.03,uT*.05)))*exp(-d*1.5);
  col+=vec3(.95,.55,.30)*rays*.34*(1.-smoothstep(.55,1.,uM*1.3));
  vec2 q=uv*vec2(asp,1.)*6.;
  float c1=abs(n(q+vec2(uT*.1,uT*.07))-n(q*1.7-vec2(uT*.08,0.)));
  col+=vec3(1.,.7,.5)*pow(1.-smoothstep(0.,.09,c1),3.)*exp(-d*2.4)*.25;
  vec2 gq=uv*vec2(asp,1.)*vec2(44.,24.);gq.y-=uT*.35;
  vec2 id=floor(gq),f=fract(gq)-.5;
  float sp=smoothstep(.09,0.,length(f+(vec2(h(id+7.1),h(id+3.3))-.5)*.6))*step(.84,h(id));
  col+=vec3(.9,.8,.7)*sp*.35*exp(-d*.7);
  float low=smoothstep(0.,1.,uM*3.);
  col+=vec3(.0,.05,.045)*(1.-uN)*low*(.6+.4*fbm(uv*3.+uT*.02));
  float bed=mix(-.12,.34,uN)+.05*fbm(vec2(uv.x*2.6,3.1))+.012*sin(uv.x*17.+1.3);
  float k=1.-smoothstep(-.012,.012,uv.y-bed);
  vec3 sand=vec3(.20,.12,.075)*(.55+.9*fbm(uv*vec2(asp,1.)*38.))+vec3(.03,.012,.015);
  sand*=.5+.5*smoothstep(-.1,.4,uv.y-bed+.25);
  col=mix(col,sand,k*low);
  col+=vec3(.75,.42,.22)*smoothstep(.02,0.,abs(uv.y-bed))*.35*low*uN;
 }
 col+=vec3(1.,.85,.7)*smoothstep(.004,0.,abs(uv.y-s))*.45;
 float v=smoothstep(1.35,.3,length((uv-.5)*vec2(asp,1.)));
 col*=.55+.6*v;
 float gr=fract(52.9829189*fract(dot(gl_FragCoord.xy+floor(uT*24.)*vec2(17.,31.),vec2(.06711056,.00583715))));
 col+=(gr-.5)*.05;
 gl_FragColor=vec4(col,1.);
}`;

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const NOMES = { spotify: "Ouvir no Spotify", youtube: "Assistir no YouTube", soundcloud: "Ouvir no SoundCloud", instagram: "Ver no Instagram" };

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
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA77" />
          <stop offset="0.45" stopColor="#F5436B" />
          <stop offset="1" stopColor="#7B3FE4" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig)" />
      <rect x="5.2" y="5.2" width="13.6" height="13.6" rx="4" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="16.4" cy="7.6" r="1" fill="#fff" />
    </svg>
  );
}

function Links({ links }) {
  if (!links || !links.length) return null;
  return (
    <p className={styles.icones}>
      {links.map(([r, u]) => (
        <a key={u} href={u} target="_blank" rel="noreferrer" aria-label={NOMES[r] || r} title={NOMES[r] || r}>
          <Icone r={r} />
        </a>
      ))}
    </p>
  );
}

const PEIXES = [
  { y: 0.26, w: 15, v: 11, f: 0.0, d: 1, o: 0.75, b: 0 },
  { y: 0.70, w: 11, v: 17, f: 0.42, d: -1, o: 0.6, b: 1 },
  { y: 0.84, w: 8, v: 24, f: 0.7, d: 1, o: 0.5, b: 2 },
  { y: 0.12, w: 6, v: 30, f: 0.15, d: -1, o: 0.4, b: 3 },
  { y: 0.52, w: 9, v: 20, f: 0.86, d: 1, o: 0.45, b: 2 },
];


const mmss = (t) => {
  if (!t) return "";
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = String(t % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};
const dmy = (d) => (d ? d.split("-").reverse().join(".") : "");
const linhaDesc = (d) => {
  const l = (d || "").split("\n")[0].trim();
  return l && l.toLowerCase() !== "preferi viver imerso no rio" ? l.slice(0, 110) : "";
};

function Leito() {
  const [i, setI] = useState(0);
  const f = FAIXAS_SC[i];
  return (
    <div className={styles.leito}>
      <ul className={styles.pedras}>
        {FAIXAS_SC.map((x, k) => (
          <li key={x.slug} className={k === i ? styles.ativa : ""} onMouseEnter={() => setI(k)} onFocus={() => setI(k)}>
            <a href={`https://soundcloud.com/prisma-874307651/${x.slug}`} target="_blank" rel="noreferrer">
              <span>{x.titulo}</span>
              <em>{x.data.slice(0, 4)} · {mmss(x.dur)}</em>
            </a>
          </li>
        ))}
      </ul>
      <div className={styles.visor}>
        <div className={styles.capa}>
          {FAIXAS_SC.map((x, k) => (
            <img key={x.slug} className={k === i ? styles.vOn : ""} src={`/pr/sc/${x.slug}.jpg`} alt={`Capa de ${x.titulo}`} loading="lazy" />
          ))}
        </div>
        <div className={styles.vInfo}>
          <b>{f.titulo}</b>
          <small>{dmy(f.data)} · {mmss(f.dur)} · {f.plays} plays</small>
          {linhaDesc(f.desc) && <p>{linhaDesc(f.desc)}</p>}
        </div>
      </div>
    </div>
  );
}


function Feed() {
  return (
    <div className={styles.feed}>
      <div className={styles.feedTopo}>
        <i aria-hidden="true" />
        <b>_jodo</b>
        <small>posts reais · toque pra abrir</small>
      </div>
      <div className={styles.feedGrade}>
        {FEED.map((f, k) => (
          <a key={f.code} href={`https://www.instagram.com/p/${f.code}/`} target="_blank" rel="noreferrer" style={{ "--k": k }} aria-label={f.legenda || "post da JODO"}>
            <img src={`/pr/jodo/${f.code}.webp`} alt="" loading="lazy" />
            <span>
              <em>{f.data.split("-").reverse().join(".")}</em>
              {f.legenda}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}


function Colagem({ fotos }) {
  return (
    <>
      <div className={styles.colagem}>
        {fotos.slice(0, 3).map((f, k) => (
          <img key={f.src} className={styles["col" + k]} src={`/pr/fotos/${f.src}.webp`} alt={f.alt} loading="lazy" />
        ))}
      </div>
      <div className={styles.carrossel} aria-hidden="true">
        {fotos.map((f, k) => (
          <img key={f.src} style={{ "--k": k, "--n": fotos.length }} src={`/pr/fotos/${f.src}.webp`} alt="" loading="lazy" />
        ))}
      </div>
    </>
  );
}

function Ciclo({ itens }) {
  return (
    <div className={styles.ciclo} aria-label="Capas de beat tapes e instrumentais que ele produziu">
      {itens.map((sl, k) => (
        <img key={sl} style={{ "--k": k, "--n": itens.length }} src={`/pr/sc/${sl}.jpg`} alt="" loading="lazy" />
      ))}
    </div>
  );
}

function Trio({ itens }) {
  return (
    <div className={styles.trio}>
      {itens.map((it, k) => (
        <figure key={it.src} style={{ "--k": k }}>
          <img src={`/pr/fotos/${it.src}.webp`} alt={it.titulo} loading="lazy" />
          <figcaption>
            <em>{it.data}</em>
            <b>{it.titulo}</b>
            <span>{it.texto}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function PrismaRio() {
  useContrasteLogo();
  const [aberta, setAberta] = useState(false);
  const [atual, setAtual] = useState(-1); // -1 = superfície
  const cv = useRef(null);
  const trilha = useRef(null);
  const el = useRef({});
  const caps = useRef([]);
  const peixes = useRef([]);
  const leitura = useRef(null);
  const ultimo = useRef(-2);
  const [hoje, setHoje] = useState(HOJE);
  const hojeRef = useRef(HOJE);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raiz = useRef(null);
  const desvio = useRef(PEIXES.map(() => ({ x: 0, y: 0 })));

  // cota do dia, buscada na ANA pela rota /api/rio-negro (atualiza sozinha, sem ninguém mexer na página)
  useEffect(() => {
    let vivo = true;
    fetch("/api/rio-negro")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (vivo && d && d.nivel) {
          hojeRef.current = { nivel: d.nivel, data: d.data };
          setHoje(hojeRef.current);
        }
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  // mouse: parallax no fundo, fotos que inclinam, peixes que desviam e marolas no clique
  useEffect(() => {
    const mv = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      const r = raiz.current;
      if (r) {
        r.style.setProperty("--mx", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        r.style.setProperty("--my", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      }
    };
    const dn = (e) => {
      const r = raiz.current;
      if (!r || e.target.closest("a,button")) return;
      const m = document.createElement("i");
      m.className = styles.marola;
      m.style.left = e.clientX + "px";
      m.style.top = e.clientY + "px";
      r.appendChild(m);
      setTimeout(() => m.remove(), 1600);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerdown", dn);
    return () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerdown", dn);
    };
  }, []);

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
      ["uRes", "uT", "uM", "uN"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    }
    const redim = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1.25) * 0.6;
      canvas.width = Math.max(2, Math.round(window.innerWidth * k));
      canvas.height = Math.max(2, Math.round(window.innerHeight * k));
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    };
    redim();
    window.addEventListener("resize", redim);

    let raf, y = 0, nivel = hojeRef.current.nivel;
    let peixeK = 1;
    const t0 = performance.now();
    const E = el.current;
    const centros = (vh) => CAPITULOS.map((c, i) => (i === 0 ? vh * 1.0 : vh * 2.0 + (i - 1) * vh * 1.4));

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const C = centros(vh);
      const total = Math.round(C[C.length - 1] + vh * 0.6);
      if (trilha.current && trilha.current.dataset.h !== String(total)) {
        trilha.current.dataset.h = String(total);
        trilha.current.style.setProperty("height", total + vh + "px", "important");
      }
      const alvo = Math.max(0, Math.min(total, window.scrollY));
      y += (alvo - y) * 0.09;
      if (Math.abs(alvo - y) < 0.4) y = alvo;
      const t = (performance.now() - t0) / 1000;

      // cota do rio: interpola entre as paradas que têm cota
      const pts = [[0, hojeRef.current.nivel]];
      CAPITULOS.forEach((c, i) => {
        if (c.nivel != null) pts.push([C[i], c.nivel]);
      });
      let alvoNivel = pts[pts.length - 1][1];
      if (y <= pts[0][0]) alvoNivel = pts[0][1];
      else
        for (let i = 0; i < pts.length - 1; i++) {
          if (y >= pts[i][0] && y <= pts[i + 1][0]) {
            const k = sm((y - pts[i][0]) / (pts[i + 1][0] - pts[i][0]));
            alvoNivel = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k;
            break;
          }
        }
      nivel += (alvoNivel - nivel) * 0.12;

      const m = Math.min(1, y / (vh * 1.5));
      const n = Math.max(0, Math.min(1, (30 - nivel) / 18));
      if (gl) {
        gl.uniform2f(U.uRes, canvas.width, canvas.height);
        gl.uniform1f(U.uT, t);
        gl.uniform1f(U.uM, m);
        gl.uniform1f(U.uN, n);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      const oT = 1 - sm(y / (vh * 0.8));
      if (E.titulo) {
        E.titulo.style.opacity = oT.toFixed(3);
        E.titulo.style.transform = `translate3d(0, ${(-y * 0.35).toFixed(1)}px, 0)`;
        E.titulo.style.filter = `blur(${((1 - oT) * 10).toFixed(1)}px)`;
        E.titulo.style.visibility = oT < 0.01 ? "hidden" : "visible";
      }

      let idx = -1;
      let melhor = 1e9;
      CAPITULOS.forEach((c, i) => {
        const nd = caps.current[i];
        if (!nd) return;
        const d = Math.abs(y - C[i]);
        if (d < melhor) {
          melhor = d;
          idx = i;
        }
        const o = 1 - sm((d - vh * 0.36) / (vh * 0.3));
        nd.style.opacity = o.toFixed(3);
        nd.style.visibility = o < 0.01 ? "hidden" : "visible";
        nd.style.pointerEvents = o > 0.5 ? "auto" : "none";
        nd.style.setProperty("--p", ((y - C[i]) / vh).toFixed(3));
        nd.classList.toggle(styles.on, o > 0.35);
      });
      if (y < vh * 0.35) idx = -1;
      if (ultimo.current !== idx) {
        ultimo.current = idx;
        setAtual(idx);
      }

      const oR = sm((y - vh * 0.25) / (vh * 0.4));
      if (E.regua) E.regua.style.opacity = oR.toFixed(3);
      if (E.marcador) E.marcador.style.top = `${(n * 100).toFixed(2)}%`;
      if (leitura.current) {
        const semCota = idx >= 0 && CAPITULOS[idx].nivel == null;
        leitura.current.textContent = semCota ? "—" : nivel.toFixed(2).replace(".", ",");
      }

      const comRosto = idx >= 0 && CAPITULOS[idx].imgs && CAPITULOS[idx].imgs.some((im) => (im.forma === "rosto" || im.forma === "recorte"));
      peixeK += ((comRosto ? 0 : 1) - peixeK) * 0.08;
      const oF = sm((y - vh * 0.5) / (vh * 0.5)) * 0.85 * peixeK;
      peixes.current.forEach((img, i) => {
        if (!img) return;
        const f = PEIXES[i];
        const w = (f.w / 100) * vw;
        const ciclo = vw + w * 2;
        let x = ((t * f.v * 3 + f.f * ciclo + y * 0.35 * f.v / 20) % ciclo) - w;
        if (f.d < 0) x = vw - x - w;
        const py = f.y * vh + Math.sin(t * 0.8 + i * 1.7) * 14 - y * 0.05 * (f.b + 1);
        const rot = Math.sin(t * 0.9 + i) * 3;
        const dv = desvio.current[i];
        const cx = x + w / 2, cy = py + w * 0.25;
        const ddx = cx - mouse.current.x, ddy = cy - mouse.current.y;
        const dist = Math.hypot(ddx, ddy) || 1;
        const forca = dist < 200 ? Math.pow((200 - dist) / 200, 2) : 0;
        dv.x += (((ddx / dist) * forca * 46) - dv.x) * 0.035;
        dv.y += (((ddy / dist) * forca * 34) - dv.y) * 0.035;
        img.style.width = w + "px";
        img.style.opacity = (oF * f.o).toFixed(3);
        img.style.filter = f.b > 1 ? `blur(${(f.b - 1) * 1.6}px) saturate(0.9)` : "";
        img.style.transform = `translate3d(${(x + dv.x).toFixed(1)}px, ${(py + dv.y).toFixed(1)}px, 0) scaleX(${f.d}) rotate(${rot.toFixed(2)}deg)`;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", redim);
    };
  }, []);

  const marcas = [];
  for (let c = 30; c >= 12; c--) marcas.push(c);
  const capAtual = atual >= 0 ? CAPITULOS[atual] : null;
  const rotuloData = capAtual ? (capAtual.nivel != null ? capAtual.data : capAtual.ano || "") : `hoje · ${hoje.data}`;
  const semNivel = capAtual && capAtual.nivel == null;

  return (
    <main ref={raiz} className={styles.raiz}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Covered+By+Your+Grace&display=swap" />
      <VoltarJodo />
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <filter id="onda" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.018" numOctaves="2" seed="4" result="n">
            <animate attributeName="baseFrequency" dur="16s" values="0.006 0.018;0.010 0.026;0.006 0.018" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className={styles.palco}>
        <canvas ref={cv} className={styles.agua} aria-hidden="true" />

        <header className={styles.topo}>
          <div data-logo-zona className={`${styles.marcaCx} ${aberta ? styles.aberta : ""}`} onClick={() => setAberta((v) => !v)} onMouseLeave={() => setAberta(false)}>
            <a
              href="/"
              className={styles.marca}
              aria-label="PRISM∆: voltar ao topo"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <i />
              <span className={styles.mAk}>prism∆</span>
            </a>
          </div>
        </header>

        {PEIXES.map((f, i) => (
          <img key={i} ref={(n) => (peixes.current[i] = n)} className={styles.peixe} src="/pr/peixes/p1.webp" alt="" aria-hidden="true" />
        ))}

        <div ref={(n) => (el.current.titulo = n)} className={styles.titulo}>
          <small className={styles.lugar}>manaus · amazonas · 3°07′ S 60°01′ O</small>
          <h1>PRISM∆</h1>
          <p className={styles.funcao}>rapper</p>
          <p className={styles.funcao2}>cantor e produtor musical</p>
          <div className={styles.cotaHoje}>
            <small>rio negro · porto de manaus<br />hoje, {hoje.data}</small>
            <b>{String(hoje.nivel.toFixed(2)).replace(".", ",")}<i> m</i></b>
          </div>
          <span>desce devagar ↓</span>
        </div>

        {CAPITULOS.map((c, i) => (
          <section key={c.id} data-cap={c.id} ref={(n) => (caps.current[i] = n)} className={`${styles.cap} ${styles["t_" + (c.tipo || "obra")]} ${styles["e_" + (c.est || "serif")]} ${i % 2 ? styles.inv : ""}`}>
            <div className={styles.fundo} aria-hidden="true">
              {(c.fundo || []).map((f, k) => (
                <img key={f} className={k ? styles.fundoB : styles.fundoA} src={`/pr/fotos/${f}.webp`} alt="" loading="lazy" />
              ))}
            </div>
            {c.tipo === "verso" ? (
              <div className={styles.versoBox}>
                <p>
                  {c.texto[0]}
                  <br />
                  <em>{c.texto[1]}</em>
                  <br />
                  {c.texto[2]}
                </p>
                {c.nota && <small>{c.nota}</small>}
              </div>
            ) : (
              <>
                <div className={styles.capTxt}>
                  <span className={styles.sel}>{[c.ano, c.sel].filter(Boolean).join(" · ")}</span>
                  <h2>{c.titulo}</h2>
                  {c.lide && <p className={styles.lide}>{c.lide}</p>}
                  {c.texto.map((t, k) => (
                    <p key={k} className={c.tipo === "poema" ? styles.poema : ""}>{t}</p>
                  ))}
                  {c.falas &&
                    c.falas.map((b, k) => (
                      <p key={k} className={styles.fala}>{b.t}</p>
                    ))}
                  {c.tags && (
                    <>
                      {c.tagsTitulo && <span className={styles.tagsT}>{c.tagsTitulo}</span>}
                      <ul className={styles.tags}>
                        {c.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {c.faixas && (
                    <ol className={styles.faixas}>
                      {c.faixas.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ol>
                  )}
                  {c.detalhe && <p className={styles.detalhe}>{c.detalhe}</p>}
                  {c.credito && (
                    <p className={styles.credito}>
                      {c.credito.t}: <a href={c.credito.url} target="_blank" rel="noreferrer">{c.credito.nome}</a>
                    </p>
                  )}
                  {c.lineup && (
                    <ol className={styles.lineup}>
                      {c.lineup.map((n, k) => (
                        <li key={n} style={{ "--k": k }}>{n}</li>
                      ))}
                    </ol>
                  )}
                  {c.data && <p className={styles.data}>{c.data}</p>}
                  {c.coletivos && (
                    <ul className={styles.coletivos}>
                      {c.coletivos.map(([n, u]) => (
                        <li key={n}>
                          <a href={u} target="_blank" rel="noreferrer">{n}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {c.email && (
                    <div className={styles.contato}>
                      <a href={`mailto:${c.email}`}>{c.email}</a>
                      <a
                        href={`https://wa.me/${c.tel.replace(/\D/g, "")}?text=${encodeURIComponent("Oi, Prism4! Vi o seu portfólio na JODO e quero conversar com você.")}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Chamar no WhatsApp"
                      >
                        {c.telefone} <small className={styles.zap}>· whatsapp</small>
                      </a>
                      <ul className={styles.plats}>
                        {[
                          ["spotify", "Spotify", "artista e o álbum Ruído das Águas", PERFIS.spotify],
                          ["soundcloud", "SoundCloud", "40 faixas: beat tapes, guias e remixes", PERFIS.soundcloud],
                          ["youtube", "YouTube", "Ruído das Águas, o álbum completo", "https://www.youtube.com/watch?v=AyMgXCTz8wQ"],
                          ["instagram", "Instagram", "@prism4__", PERFIS.instagram],
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
                        ↑ voltar ao topo
                      </button>
                    </div>
                  )}
                  <Links links={c.links} />
                </div>
                <div className={styles.midia}>
                  {c.pedras && <Leito />}
                  {c.tipo === "ruido" && (
                    <div className={styles.ruidoArte}>
                      <img className={styles.pintura} src={`/pr/fotos/${c.pintura}.webp`} alt="Capa do álbum Ruído das Águas" loading="lazy" />
                      <img className={styles.lista} src={`/pr/fotos/${c.lista}.webp`} alt="Contracapa do álbum com a lista das faixas escrita à mão: 1 Bruxaria, O alquimista; 2 Buya; 3 Cryá de Ryo; 4 Nunca no Brazil; 5 Ruído das Águas; 6 Território; 7 Tipo JODO; faixa bônus" loading="lazy" />
                    </div>
                  )}
                  {c.tipo === "feed" && <Feed />}
                  {c.tipo === "palcos" && <Colagem fotos={c.fotos} />}
                  {c.ciclo && <Ciclo itens={c.ciclo} />}
                  {c.tipo === "cena" && <Trio itens={c.itens} />}
                  {!c.pedras && c.clip && (
                    <video className={`${styles.clip} ${c.clip.vertical ? styles.clipV : ""}`} src={`/pr/clips/${c.clip.src}.mp4`} poster={`/pr/clips/${c.clip.src}.jpg`} muted loop playsInline autoPlay preload="none" aria-label={c.clip.alt} />
                  )}
                  {!c.pedras && c.imgs && c.tipo !== "feed" && (
                    <div className={`${styles.pilha} ${c.imgs.length > 1 ? styles.dupla : ""}`}>
                      {c.imgs.map((im, k) => (
                        <div key={im.src} className={`${styles.foto} ${styles["f_" + im.forma]} ${k === 0 ? styles.flutua : styles.segunda}`}>
                          <img src={`/pr/fotos/${im.src}.webp`} alt={im.alt} loading="lazy" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        ))}

        <aside ref={(n) => (el.current.regua = n)} className={styles.regua} aria-label="Régua de cota do Rio Negro em Manaus">
          <div className={styles.reguaTopo}>
            <b>30,02 m</b>
            <small>cheia recorde<br />17.06.2021</small>
          </div>
          <div className={styles.fita}>
            {marcas.map((c) => (
              <i key={c} className={c % 2 === 0 ? styles.lg : ""}>{c % 2 === 0 ? c : ""}</i>
            ))}
            <div ref={(n) => (el.current.marcador = n)} className={`${styles.marcador} ${semNivel ? styles.sem : ""}`}>
              <span>
                <em ref={leitura}>{hoje.nivel.toFixed(2).replace(".", ",")}</em> m
                <small>{rotuloData}</small>
              </span>
            </div>
          </div>
          <div className={styles.reguaBase}>
            <b>12,11 m</b>
            <small>vazante recorde<br />02.11.2024</small>
          </div>
        </aside>
      </div>

      <div ref={trilha} className={styles.trilha} />
    </main>
  );
}
