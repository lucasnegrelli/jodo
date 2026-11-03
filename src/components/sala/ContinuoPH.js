"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/continuoPH.module.css";

const capa = (id) => `/ph/capas/${id}.webp`;
const yt = (id) => `/ph/yt/${id}.jpg`;
const foto = (k) => `/ph/fotos/${k}.webp`;
const YT = (id) => `https://www.youtube.com/watch?v=${id}`;
const SP = (id) => `https://open.spotify.com/album/${id}`;
const ARTISTA = "https://open.spotify.com/artist/4O9G2L1B557p5lkZBoayK6";

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

// cada cena tem sua própria luz (3 cores do campo) e, quando existe, sua trilha
const CENAS = [
  { id: "abertura", ano: "hoje", rot: "phinea$", pal: ["#070b24", "#3a1f6e", "#d98a43"] },
  { id: "intravenal", ano: "2026", rot: "intravenal", pal: ["#02141a", "#0b5a60", "#74f0d0"], faixa: "engrenagem" },
  { id: "relicario", ano: "2025", rot: "relicário", pal: ["#150c04", "#6d4512", "#e6b862"], faixa: "relicario" },
  { id: "jardim", ano: "2025", rot: "jardim · ícaro · corre", pal: ["#04120a", "#1d5a30", "#b6e27a"], faixa: "icaro" },
  { id: "estrada", ano: "2024", rot: "estrada", pal: ["#16081b", "#6a2a66", "#f2a9cb"] },
  { id: "fisica", ano: "2024", rot: "fisica", pal: ["#050724", "#2a30d8", "#dfe24a"], faixa: "fisica" },
  { id: "singles", ano: "2023", rot: "entre um ep e outro", pal: ["#05101a", "#16415c", "#78bfe0"], faixa: "fimdesemana" },
  { id: "atemporal", ano: "2020–21", rot: "atemporal", pal: ["#04021a", "#3a1b7c", "#c690ff"] },
  { id: "comeco", ano: "2019", rot: "o começo", pal: ["#0d0a07", "#40301c", "#c0a06e"] },
  { id: "final", ano: "2025", rot: "madrugada de 14.03", pal: ["#01020a", "#0a1c3c", "#a8c0f0"] },
];
const LEN = 1.25;

const FAIXAS = {
  engrenagem: { src: "/ph/audio/engrenagem.mp3", t: "engrenagem", s: "intravenal, 2026" },
  relicario: { src: "/ph/audio/relicario.mp3", t: "relicário", s: "mix, 2025" },
  icaro: { src: "/ph/audio/icaro.mp3", t: "sonhos de ícaro", s: "com 1lum3, 2025" },
  fisica: { src: "/ph/audio/fisica.mp3", t: "fisica", s: "com aura soul, 2024" },
  fimdesemana: { src: "/ph/audio/fimdesemana.mp3", t: "fim de semana", s: "com diego amani, 2024" },
};

const INTRA = [
  { n: 1, t: "sinais", y: "I6cvxEs1otg" },
  { n: 2, t: "aporte", y: "IDpYmEUT5rY" },
  { n: 3, t: "engrenagem", y: "fB4r6Ggm1p4" },
  { n: 4, t: "inverso", y: "QwaWUmaIjq8" },
  { n: 5, t: "manual", y: "gcTz6i2nwII" },
];
const SINGLES = [
  { id: "2GdmrW054KTxoiLBU2CKSd", t: "copyright", a: "2024" },
  { id: "7oQf1VMKayrNjkfZXZkhjX", t: "fim de semana", a: "2024" },
  { id: "703p7KksYkzCMscPct48F1", t: "fisica", a: "2024" },
  { id: "4mDDJLhuRmRFper7gxsieR", t: "phillip bankz", a: "2023" },
  { id: "4e7PD5MuyIj9JI914VYlvJ", t: "só mais um...", a: "2023" },
];
const VELHOS = [
  { id: "3T8WOWOi137WhE6Oq59h8T", t: "mais tarde...", a: "2020" },
  { id: "4LZJ14orPgLjmEuJhtNry4", t: "vultos", a: "2021" },
  { id: "6TPkC47nzSJQOsp59MmBri", t: "dispô", a: "2021" },
  { id: "2XskvdEGHYA9TfDS86wc4k", t: "oasis", a: "2021" },
];
const COMECO = [
  { y: "33_n6HoOZAY", t: "não me importo com as cinzas pt. jardim", s: "rogdog · dez/2018" },
  { y: "F6gGI2KJOng", t: "fora da linha", s: "must, feat. phinea$, aurasoul, rogdog · abr/2019" },
  { y: "-nq8ZxEA-O8", t: "quanto tempo mais", s: "apelidadowell, phinea$, roggdoggbelga · mai/2019" },
];

/* ---------- campo de luz (WebGL cru, sem dependência) ---------- */
const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime,uScroll,uLevel;uniform vec3 uA,uB,uC;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.);
 float t=uTime*.03+uScroll*.12;
 vec2 q=vec2(fbm(p*1.3+t),fbm(p*1.3-t+3.1));
 vec2 r=vec2(fbm(p*1.7+q*2.1+vec2(1.7,9.2)+t*1.3),fbm(p*1.7+q*2.1+vec2(8.3,2.8)-t));
 float f=fbm(p*1.2+r*2.);
 vec3 c=mix(uA,uB,smoothstep(.12,.78,f));
 c=mix(c,uC,smoothstep(.5,1.,length(q))*(.5+uLevel*1.2));
 float v=smoothstep(1.3,.2,length(p));
 c*=.3+.95*v;
 float g=fract(52.9829189*fract(dot(gl_FragCoord.xy+floor(uTime*24.)*vec2(17.,31.),vec2(.06711056,.00583715))));
 c+=(g-.5)*.055;
 gl_FragColor=vec4(c,1.);
}`;

export default function ContinuoPH() {
  const trilha = useRef(null);
  const palco = useRef(null);
  const canvas = useRef(null);
  const estado = useRef({ som: false, atual: 0 });
  const audios = useRef({});
  const [entrou, setEntrou] = useState(false);
  const [som, setSom] = useState(false);
  const [atual, setAtual] = useState(0);
  const [tocando, setTocando] = useState(null);

  useEffect(() => {
    estado.current.som = som;
  }, [som]);

  // motor: rolagem suavizada, cenas, campo de luz e trilhas
  useEffect(() => {
    const el = palco.current;
    const cv = canvas.current;
    const gl = cv.getContext("webgl", { antialias: false, alpha: false });
    let prog, U = {};
    if (gl) {
      const sh = (t, s) => {
        const o = gl.createShader(t);
        gl.shaderSource(o, s);
        gl.compileShader(o);
        return o;
      };
      prog = gl.createProgram();
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
      ["uRes", "uTime", "uScroll", "uLevel", "uA", "uB", "uC"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    }
    const PAL = CENAS.map((c) => c.pal.map(hex));
    const cor = [PAL[0][0].slice(), PAL[0][1].slice(), PAL[0][2].slice()];
    let raf, y = 0, alvo = 0, level = 0, t0 = performance.now();
    let ctx, analyser, buf;
    const vols = {};

    const redim = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1) * 0.5;
      cv.width = Math.max(2, Math.round(window.innerWidth * k));
      cv.height = Math.max(2, Math.round(window.innerHeight * k));
      if (gl) gl.viewport(0, 0, cv.width, cv.height);
    };
    redim();
    window.addEventListener("resize", redim);

    // contexto de áudio só depois do clique do visitante
    estado.current.ligarAnalise = () => {
      if (ctx) return;
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        buf = new Uint8Array(analyser.frequencyBinCount);
        Object.values(audios.current).forEach((a) => {
          const s = ctx.createMediaElementSource(a);
          s.connect(analyser);
        });
        analyser.connect(ctx.destination);
      } catch (e) {
        ctx = null;
      }
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const total = Math.round(vh * (CENAS.length - 1) * LEN + vh);
      if (trilha.current && trilha.current.dataset.h !== String(total)) {
        trilha.current.dataset.h = String(total);
        trilha.current.style.setProperty("height", total + "px", "important");
      }
      alvo = window.scrollY / (vh * LEN);
      y += (alvo - y) * 0.085;
      if (Math.abs(alvo - y) < 0.0005) y = alvo;

      CENAS.forEach((c, i) => {
        const n = el.querySelector(`[data-cena="${c.id}"]`);
        if (!n) return;
        const d = Math.abs(y - i);
        const o = sm(1 - (d - 0.16) / 0.34);
        n.style.opacity = o.toFixed(3);
        n.style.visibility = o < 0.004 ? "hidden" : "visible";
        n.style.pointerEvents = o > 0.5 ? "auto" : "none";
        n.style.setProperty("--p", (y - i).toFixed(3));
        n.classList.toggle(styles.on, o > 0.3);
      });
      const idx = Math.max(0, Math.min(CENAS.length - 1, Math.round(y)));
      if (estado.current.atual !== idx) {
        estado.current.atual = idx;
        setAtual(idx);
      }

      // cores do campo: mistura entre a cena de cima e a de baixo
      const a = Math.max(0, Math.min(CENAS.length - 1, Math.floor(y)));
      const bI = Math.min(CENAS.length - 1, a + 1);
      const m = sm(y - a);
      for (let k = 0; k < 3; k++)
        for (let j = 0; j < 3; j++) {
          const want = PAL[a][k][j] * (1 - m) + PAL[bI][k][j] * m;
          cor[k][j] += (want - cor[k][j]) * 0.12;
        }

      // trilhas: cada fase com a sua, o resto em silêncio
      const tr = CENAS[idx].faixa || null;
      let lv = 0;
      if (analyser) {
        analyser.getByteFrequencyData(buf);
        let s = 0;
        for (let i = 0; i < 24; i++) s += buf[i];
        lv = s / (24 * 255);
      }
      level += (lv - level) * 0.1;
      Object.keys(audios.current).forEach((k) => {
        const a2 = audios.current[k];
        const want = estado.current.som && tr === k ? 0.85 : 0;
        vols[k] = (vols[k] || 0) + (want - (vols[k] || 0)) * 0.035;
        const v = Math.max(0, Math.min(1, vols[k]));
        a2.volume = v;
        if (v > 0.01 && a2.paused) a2.play().catch(() => {});
        if (v <= 0.01 && !a2.paused && want === 0) a2.pause();
      });
      const novo = estado.current.som && tr ? tr : null;
      if (estado.current.ult !== novo) {
        estado.current.ult = novo;
        setTocando(novo);
      }

      if (gl) {
        gl.uniform2f(U.uRes, cv.width, cv.height);
        gl.uniform1f(U.uTime, (performance.now() - t0) / 1000);
        gl.uniform1f(U.uScroll, y);
        gl.uniform1f(U.uLevel, level);
        gl.uniform3fv(U.uA, cor[0]);
        gl.uniform3fv(U.uB, cor[1]);
        gl.uniform3fv(U.uC, cor[2]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
    raf = requestAnimationFrame(tick);

    // trilhas carregam só quando o visitante entra
    Object.entries(FAIXAS).forEach(([k, f]) => {
      const a = new Audio();
      a.src = f.src;
      a.loop = true;
      a.preload = "none";
      a.volume = 0;
      audios.current[k] = a;
    });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", redim);
      Object.values(audios.current).forEach((a) => a.pause());
      if (ctx) ctx.close();
    };
  }, []);

  const entrar = (comSom) => {
    setEntrou(true);
    setSom(comSom);
    estado.current.som = comSom;
    if (comSom) {
      estado.current.ligarAnalise && estado.current.ligarAnalise();
      Object.values(audios.current).forEach((a) => (a.preload = "auto"));
    }
  };
  const alternar = () => {
    const v = !estado.current.som;
    estado.current.som = v;
    setSom(v);
    if (v) estado.current.ligarAnalise && estado.current.ligarAnalise();
  };

  const cena = CENAS[atual];
  const faixa = tocando ? FAIXAS[tocando] : null;

  return (
    <main className={styles.raiz}>
      <VoltarJodo />
      <header className={styles.topo}>
        <a
          href="/"
          className={styles.marca}
          aria-label="Phinea$: voltar ao topo"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <i />
        </a>
      </header>

      <div ref={palco} className={styles.palco}>
        <canvas ref={canvas} className={styles.campo} />

        {/* 0 · abertura */}
        <section className={`${styles.cena} ${styles.abertura}`} data-cena="abertura">
          <div className={styles.aberturaTxt}>
            <h1 className={styles.rev} style={{ "--i": 0 }}>phinea$</h1>
            <p className={styles.rev} style={{ "--i": 3 }}>poeta de são paulo. boombap e rnb, curtas e beat tapes.</p>
            <span className={`${styles.dica} ${styles.rev}`} style={{ "--i": 5 }}>desce devagar ↓</span>
          </div>
        </section>

        {/* 1 · intravenal */}
        <section className={`${styles.cena} ${styles.intra}`} data-cena="intravenal">
          <div className={styles.intraTxt}>
            <span className={`${styles.sel} ${styles.rev}`}>ep · 30.01.2026 · com krapnek82</span>
            <h2 className={styles.rev} style={{ "--i": 1 }}>intravenal</h2>
            <ol>
              {INTRA.map((f, i) => (
                <li key={f.y} className={styles.rev} style={{ "--i": 2 + i }}>
                  <a href={YT(f.y)} target="_blank" rel="noreferrer">
                    <img src={yt(f.y)} alt="" loading="lazy" />
                    <b>{String(f.n).padStart(2, "0")}</b>
                    <span>{f.t}</span>
                    <em>vídeo ↗</em>
                  </a>
                </li>
              ))}
            </ol>
            <div className={`${styles.links} ${styles.rev}`} style={{ "--i": 8 }}>
              <a href={SP("52wRSFms6UCZ55l8DjfthN")} target="_blank" rel="noreferrer">ouvir ↗</a>
              <a href={YT("cu1sTA7JOz8")} target="_blank" rel="noreferrer">curta “intravenoso” ↗</a>
            </div>
          </div>
          <div className={styles.intraFoto}>
            <div className={styles.par} style={{ "--k": 40 }}>
              <img className={`${styles.suave} ${styles.rev}`} src={foto("f12")} alt="Phinea$ acendendo um isqueiro, luz azul" />
            </div>
            <div className={styles.par} style={{ "--k": -70 }}>
              <img className={`${styles.capinha} ${styles.rev}`} style={{ "--i": 4 }} src={capa("52wRSFms6UCZ55l8DjfthN")} alt="Capa de Intravenal" />
            </div>
          </div>
        </section>

        {/* 2 · relicário */}
        <section className={`${styles.cena} ${styles.relic}`} data-cena="relicario">
          <div className={styles.relicTxt}>
            <span className={`${styles.sel} ${styles.rev}`}>single + curta · 2025</span>
            <h2 className={styles.rev} style={{ "--i": 1 }}>relicário</h2>
            <p className={styles.rev} style={{ "--i": 2 }}>um oratório e uma voz. o curta foi dirigido e editado por ele.</p>
            <div className={`${styles.links} ${styles.rev}`} style={{ "--i": 3 }}>
              <a href={YT("f6McxgV9Jfg")} target="_blank" rel="noreferrer">assistir o curta ↗</a>
              <a href={SP("41rfDG3WkuFMsN5BgXFsSL")} target="_blank" rel="noreferrer">ouvir ↗</a>
            </div>
          </div>
          <div className={styles.par} style={{ "--k": 60 }}>
            <img className={`${styles.oratorio} ${styles.rev}`} style={{ "--i": 2 }} src="/ph/assets/relicario-oratorio.webp" alt="Oratório da capa de Relicário" />
          </div>
        </section>

        {/* 3 · jardim, ícaro, corre */}
        <section className={`${styles.cena} ${styles.jardim}`} data-cena="jardim">
          <div className={styles.tresTxt}>
            <span className={`${styles.sel} ${styles.rev}`}>2025</span>
            <h2 className={styles.rev} style={{ "--i": 1 }}>três trilhas no mesmo ano</h2>
          </div>
          <div className={styles.tres}>
            {[
              { id: "5lZpF1TGqiW9LrRJJiWke9", t: "jardim", s: "ep com karmo", y: "UZ4fFpaYcNM", k: 30 },
              { id: "6xEySYREet3pKFNvXr3VN6", t: "sonhos de ícaro", s: "com 1lum3", y: "Bi9I-xs-lXQ", k: -50 },
              { id: "2KOh3IBjjtFR3p6KuVXfYv", t: "corre", s: "beat tape", y: "2A0vztDeAB8", k: 80 },
            ].map((x, i) => (
              <div key={x.id} className={styles.par} style={{ "--k": x.k }}>
                <a href={YT(x.y)} target="_blank" rel="noreferrer" className={`${styles.cartao} ${styles.rev}`} style={{ "--i": 2 + i }}>
                  <img src={capa(x.id)} alt={`Capa de ${x.t}`} loading="lazy" />
                  <b>{x.t}</b>
                  <span>{x.s} · vídeo ↗</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 4 · estrada */}
        <section className={`${styles.cena} ${styles.estrada}`} data-cena="estrada">
          <div className={styles.estradaTxt}>
            <span className={`${styles.sel} ${styles.rev}`}>ep · 12.11.2024 · 5 faixas</span>
            <h2 className={styles.rev} style={{ "--i": 1 }}>estrada</h2>
            <p className={styles.rev} style={{ "--i": 2 }}>lançado pelo rancho mont gomer. a beat tape ganhou vídeo.</p>
            <div className={`${styles.links} ${styles.rev}`} style={{ "--i": 3 }}>
              <a href={SP("4fzXl934NlMK56eXlsB9Qb")} target="_blank" rel="noreferrer">ouvir ↗</a>
              <a href={YT("5bcjkv3Ij-w")} target="_blank" rel="noreferrer">beat tape ↗</a>
            </div>
          </div>
          <div className={styles.par} style={{ "--k": 50 }}>
            <img className={`${styles.estradaImg} ${styles.rev}`} style={{ "--i": 2 }} src="/ph/assets/estrada-vetor.webp" alt="Capa de Estrada" />
          </div>
        </section>

        {/* 5 · fisica: a sessão de fotos */}
        <section className={`${styles.cena} ${styles.fisica}`} data-cena="fisica">
          {[
            { k: "f07", c: styles.fa, p: 30 },
            { k: "f03", c: styles.fb, p: -60 },
            { k: "f13", c: styles.fc, p: 90 },
            { k: "f14", c: styles.fd, p: -30 },
            { k: "f10", c: styles.fe, p: 50 },
          ].map((f, i) => (
            <div key={f.k} className={`${styles.frag} ${f.c} ${styles.par}`} style={{ "--k": f.p }}>
              <img className={styles.rev} style={{ "--i": 1 + i }} src={foto(f.k)} alt="" loading="lazy" />
            </div>
          ))}
          <div className={styles.fisicaTxt}>
            <span className={`${styles.sel} ${styles.rev}`}>single · 2024 · com aura soul</span>
            <h2 className={styles.rev} style={{ "--i": 1 }}>fisica</h2>
            <div className={`${styles.links} ${styles.rev}`} style={{ "--i": 2 }}>
              <a href={SP("703p7KksYkzCMscPct48F1")} target="_blank" rel="noreferrer">ouvir ↗</a>
            </div>
          </div>
        </section>

        {/* 6 · singles */}
        <section className={`${styles.cena} ${styles.singles}`} data-cena="singles">
          <div className={styles.tresTxt}>
            <span className={`${styles.sel} ${styles.rev}`}>2023–2024</span>
            <h2 className={styles.rev} style={{ "--i": 1 }}>entre um ep e outro</h2>
          </div>
          <ul className={styles.fila}>
            {SINGLES.map((s, i) => (
              <li key={s.id} className={styles.rev} style={{ "--i": 2 + i }}>
                <a href={SP(s.id)} target="_blank" rel="noreferrer">
                  <img src={capa(s.id)} alt={`Capa de ${s.t}`} loading="lazy" />
                  <b>{s.t}</b>
                  <span>{s.a}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* 7 · atemporal */}
        <section className={`${styles.cena} ${styles.atemp}`} data-cena="atemporal">
          <div className={styles.par} style={{ "--k": 40 }}>
            <a className={`${styles.atempCapa} ${styles.rev}`} href={SP("4fGjMgHXZmVc69kCPVuSJG")} target="_blank" rel="noreferrer">
              <img src={capa("4fGjMgHXZmVc69kCPVuSJG")} alt="Capa de Atemporal" />
            </a>
          </div>
          <div className={styles.atempTxt}>
            <span className={`${styles.sel} ${styles.rev}`}>ep · 20.07.2020 · 7 faixas</span>
            <h2 className={styles.rev} style={{ "--i": 1 }}>atemporal</h2>
            <ul className={styles.mini}>
              {VELHOS.map((s, i) => (
                <li key={s.id} className={styles.rev} style={{ "--i": 2 + i }}>
                  <a href={SP(s.id)} target="_blank" rel="noreferrer">
                    <img src={capa(s.id)} alt="" loading="lazy" />
                    <b>{s.t}</b>
                    <span>{s.a}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 8 · o começo */}
        <section className={`${styles.cena} ${styles.comeco}`} data-cena="comeco">
          <div className={styles.comecoTxt}>
            <span className={`${styles.sel} ${styles.rev}`}>2018–2019</span>
            <h2 className={styles.rev} style={{ "--i": 1 }}>sobre você...<br />final · divina</h2>
            <div className={styles.tri}>
              {["4FvFzfyK9NcbRdTkeulhy6", "2HflNhmjtUgaEktbKBTaQx", "2vmhdx7BocAmLTDwlXx1rH"].map((id, i) => (
                <a key={id} href={SP(id)} target="_blank" rel="noreferrer" className={styles.rev} style={{ "--i": 2 + i }}>
                  <img src={capa(id)} alt="" loading="lazy" />
                </a>
              ))}
            </div>
          </div>
          <ul className={styles.velhos}>
            {COMECO.map((v, i) => (
              <li key={v.y} className={styles.rev} style={{ "--i": 2 + i }}>
                <a href={YT(v.y)} target="_blank" rel="noreferrer">
                  <img src={yt(v.y)} alt="" loading="lazy" />
                  <span><b>{v.t}</b><em>{v.s}</em></span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* 9 · madrugada */}
        <section className={`${styles.cena} ${styles.final}`} data-cena="final">
          <div className={styles.par} style={{ "--k": 40 }}>
            <img className={`${styles.ceu} ${styles.rev}`} src={foto("e2")} alt="Céu da madrugada visto através de uma tela" />
          </div>
          <div className={styles.finalTxt}>
            <h2 className={styles.rev} style={{ "--i": 1 }}>phinea$</h2>
            <a href={ARTISTA} target="_blank" rel="noreferrer" className={`${styles.cta} ${styles.rev}`} style={{ "--i": 2 }}>ouvir tudo no spotify ↗</a>
            <span className={`${styles.rodape} ${styles.rev}`} style={{ "--i": 3 }}>© jodojodojodo</span>
          </div>
        </section>

        {/* continuidade: o ano que troca + a trilha que toca */}
        <div className={styles.ano} aria-hidden="true">
          <span key={cena.ano}>{cena.ano}</span>
          <small>{cena.rot}</small>
        </div>
        <div className={styles.som}>
          <button type="button" onClick={alternar} aria-pressed={som} aria-label={som ? "Pausar o som" : "Ligar o som"}>
            <span className={`${styles.barras} ${som ? styles.tocaBarras : ""}`}><i /><i /><i /><i /></span>
            {som ? "pausar" : "ligar o som"}
          </button>
          <small>{faixa ? `${faixa.t} · ${faixa.s}` : som ? "silêncio" : ""}</small>
        </div>
      </div>

      <div className={`${styles.portao} ${entrou ? styles.portaoFora : ""}`}>
        <h1>phinea$</h1>
        <p>melhor com som.</p>
        <div>
          <button type="button" onClick={() => entrar(true)}>entrar com som</button>
          <button type="button" className={styles.sem} onClick={() => entrar(false)}>entrar sem som</button>
        </div>
      </div>

      <div ref={trilha} className={styles.trilha} />
    </main>
  );
}
