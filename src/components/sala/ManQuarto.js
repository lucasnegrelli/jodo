"use client";

import { useEffect, useRef, useState } from "react";
import { Anton, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import styles from "@/styles/manQuarto.module.css";

/*
  eL Mandarim: "o quarto". A arte do hamster (gerada pelo Lucas, não oficial) vira a página e ganha vida em código:
  WebGL desloca a imagem (respiração, brilho do pelo e olhos que seguem o mouse) e uma camada 2D desenha as lágrimas e a luz da TV.
  Tudo reage ao volume da faixa que está tocando (Web Audio). As faixas são a mixtape inédita "Tô com depressão": por enquanto só
  prévia de 45 s de cada uma. Para liberar a faixa inteira, troque PREVIA por false e coloque os arquivos completos em /public/man/full.
*/
const display = Anton({ subsets: ["latin"], weight: "400", variable: "--mq-disp", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mq-mono", display: "swap" });

const PREVIA = true;
const FAIXAS = ["bipolar", "te amo demais", "pão de alho", "quasi ridh", "particular", "leconha", "compulsivo", "haikaiss", "vitinho avassalador", "maria flopado", "paguem os beats", "sem remédio", "tudo mudou"];
// pedido público: "solta a mixtape". Votar na enquete destranca o play (as prévias). O placar vem de /api/mandarim/pedido.
const META = 500; // meta do placar (número de pedidos), só para a barra; ajuste à vontade
const ENQUETE = [
  { id: "tudo", t: "solta tudo de uma vez" },
  { id: "semana", t: "uma faixa por semana" },
  { id: "clipe", t: "clipe primeiro, depois o resto" },
  { id: "nao", t: "enfia no cu: deixa ele na depressão" },
];
const ASPECTO = 1400 / 1542;
// posições na imagem (fração da largura/altura): olhos, onde nascem as lágrimas
const OLHOS = [[0.483, 0.289], [0.667, 0.294]];
const LAGRIMAS = [[0.437, 0.322, -0.012], [0.69, 0.327, 0.014]];
const pad = (n) => String(n).padStart(2, "0");

// cada faixa tinge o quarto de uma cor (matiz pelo número da faixa)
const hsl = (h) => { const f = (n) => { const k = (n + h * 12) % 12; return 0.5 - 0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }; return [f(0) - 0.5, f(8) - 0.5, f(4) - 0.5]; };
const TINTS = FAIXAS.map((_, n) => hsl(n / FAIXAS.length));
const POEIRA = Array.from({ length: 80 }, (_, n) => ({ x: (n * 0.6180339) % 1, y: (n * 0.3819660 + 0.17) % 1, vx: (((n * 7) % 11) - 5) * 0.0016, vy: -0.004 - ((n * 3) % 7) * 0.0011, s: 0.6 + ((n * 5) % 9) / 9, ph: n }));

const VERT = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = vec2(p.x*0.5+0.5, 0.5-p.y*0.5); gl_Position = vec4(p,0.0,1.0); }";
const FRAG = `precision highp float;
uniform sampler2D uTex; uniform float uT, uLevel, uAmb, uTv, uSq; uniform vec2 uMouse; uniform vec3 uTint; varying vec2 vUv;
const float AR = ${ASPECTO.toFixed(4)};
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 olho(vec2 uv, vec2 e, vec2 look){
  float d = length((uv - e) * vec2(AR, 1.0));
  float w = smoothstep(0.05, 0.018, d);
  return uv - w * look * 0.013;
}
void main(){
  vec2 uv = vUv;
  vec2 d = (uv - vec2(0.47, 0.50)) * vec2(1.0, 0.9);
  float corpo = smoothstep(0.58, 0.16, length(d));
  vec2 cen = vec2(0.50, 0.52);
  uv = cen + (uv - cen) * (1.0 - corpo * uSq * 0.03 * (0.6 + 0.4 * sin(uT * 18.0)));
  uv.y -= corpo * (sin(uT * 1.25) * 0.0032 + uLevel * 0.0075);
  uv.x += corpo * sin(uT * 0.8 + uv.y * 7.0) * 0.0014;
  uv += corpo * 0.0011 * vec2(sin(uv.y * 95.0 + uT * 2.2), cos(uv.x * 85.0 + uT * 1.8)) * (0.45 + uLevel * 1.6);
  vec2 look = clamp(uMouse - vec2(0.57, 0.30), -0.55, 0.55);
  uv = olho(uv, vec2(0.483, 0.289), look);
  uv = olho(uv, vec2(0.667, 0.294), look);
  vec3 c = texture2D(uTex, uv).rgb;
  // lanterna: o quarto fica no escuro e o mouse é a luz; o volume da faixa e a TV ligada acendem o resto
  float dm = length((vUv - uMouse) * vec2(AR, 1.0));
  float beam = smoothstep(0.62, 0.04, dm);
  float amb = uAmb + uTv * 0.26 + uLevel * 0.2;
  c *= amb + (1.0 - amb) * beam;
  // TV ligada: chuvisco azul na tela e luz que escorre pelo quarto
  // a tela da TV aponta para longe da câmera: só se vê uma fina faixa de luz na quina inclinada da TV (dentro dela)
  // e a luz azul batendo no quarto, nunca em cima da TV
  float xl = 0.882 - 0.0453 * (vUv.y - 0.279);
  float dd = vUv.x - xl;
  float noY = smoothstep(0.279, 0.3, vUv.y) * (1.0 - smoothstep(0.81, 0.831, vUv.y));
  float ru = h21(vec2(floor(uT * 14.0), 3.0));
  float borda = smoothstep(0.0, 0.002, dd) * (1.0 - smoothstep(0.003, 0.014, dd)) * noY;
  c += vec3(0.35, 0.7, 1.0) * borda * uTv * (0.55 + 0.35 * ru + uLevel * 0.8);
  float naTv = smoothstep(0.0, 0.003, dd) * noY;
  float spill = smoothstep(0.3, 1.0, vUv.x) * smoothstep(0.08, 0.5, vUv.y) * (1.0 - smoothstep(0.75, 1.0, vUv.y)) * (1.0 - naTv);
  c += vec3(0.05, 0.13, 0.32) * spill * uTv * (0.8 + uLevel * 1.5 + 0.1 * ru);
  c *= 1.0 + uTint * 0.5;
  gl_FragColor = vec4(c, 1.0);
}`;

export default function ManQuarto({ embutido = false, children = null, autoplay = false }) {
  const Raiz = embutido ? "section" : "main";
  const [i, setI] = useState(null);
  const [toca, setToca] = useState(false);
  const [prog, setProg] = useState(0);
  const [tv, setTv] = useState(false);
  const [mexeu, setMexeu] = useState(false);
  const [pedido, setPedido] = useState(null);
  const [chama, setChama] = useState(false);
  const [aviso, setAviso] = useState("");
  const raiz = useRef(null), quadro = useRef(null), gl = useRef(null), lag = useRef(null), audio = useRef(null), tocarRef = useRef(null);
  const est = useRef({ mx: 0.57, my: 0.3, ax: 0.57, ay: 0.3, nivel: 0, ctx: null, an: null, dados: null, fonte: null, tv: 0, tvA: 0, sq: 0, tint: [0, 0, 0], alvoTint: [0, 0, 0], estouro: 0, auto: false });

  useEffect(() => {
    const cv = gl.current, ov = lag.current, box = quadro.current;
    const S = est.current;
    S.vis = true;
    const io = new IntersectionObserver(([e]) => { S.vis = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(box);
    let raf = 0, ok = true, prog2 = null, tex = null, W = 0, H = 0;
    const g = cv.getContext("webgl", { antialias: false, alpha: false });
    const dpr = matchMedia("(pointer: coarse)").matches ? 1.1 : Math.min(2, devicePixelRatio || 1); // celular: menos pixels, rolagem mais lisa
    const c2 = ov.getContext("2d");
    const gotas = [];
    let ultimo = performance.now(), acum = [0, 0];
    // no celular não há mouse para ser lanterna: o quarto fica mais claro
    const amb = matchMedia("(pointer: coarse)").matches ? 0.42 : 0.16;

    const mede = () => {
      const r = box.getBoundingClientRect();
      W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
      cv.width = ov.width = W; cv.height = ov.height = H;
      if (g) g.viewport(0, 0, W, H);
    };
    mede();
    addEventListener("resize", mede);

    if (g) {
      const sh = (t, s) => { const o = g.createShader(t); g.shaderSource(o, s); g.compileShader(o); return o; };
      prog2 = g.createProgram();
      g.attachShader(prog2, sh(g.VERTEX_SHADER, VERT)); g.attachShader(prog2, sh(g.FRAGMENT_SHADER, FRAG));
      g.linkProgram(prog2); g.useProgram(prog2);
      const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
      const loc = g.getAttribLocation(prog2, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
      const img = new Image();
      img.onload = () => {
        tex = g.createTexture(); g.bindTexture(g.TEXTURE_2D, tex);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, img);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        box.dataset.pronto = "1";
      };
      img.src = "/man/quarto.webp";
    }

    const move = (e) => {
      const r = box.getBoundingClientRect();
      S.mx = (e.clientX - r.left) / r.width; S.my = (e.clientY - r.top) / r.height;
    };
    addEventListener("pointermove", move);

    const solta = (ex, ey, vx, forca) => gotas.push({ x: ex, y: ey, vx, vy: 0.02 + Math.random() * 0.03, v: 1, f: forca });

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (t - ultimo) / 1000); ultimo = t;
      if (!S.vis) return;
      // volume da faixa (graves pesam mais)
      if (S.an) {
        S.an.getByteFrequencyData(S.dados);
        let s = 0; for (let k = 1; k < 14; k++) s += S.dados[k];
        const alvo = Math.min(1, s / 14 / 190);
        S.nivel += (alvo - S.nivel) * 0.25;
      } else S.nivel *= 0.94;
      S.ax += (S.mx - S.ax) * 0.07; S.ay += (S.my - S.ay) * 0.07;
      S.tvA += (S.tv - S.tvA) * 0.08; S.sq *= 0.92;
      for (let k = 0; k < 3; k++) S.tint[k] += (S.alvoTint[k] - S.tint[k]) * 0.04;

      if (g && tex) {
        g.uniform1f(g.getUniformLocation(prog2, "uAmb"), amb);
        g.uniform1f(g.getUniformLocation(prog2, "uTv"), S.tvA);
        g.uniform1f(g.getUniformLocation(prog2, "uSq"), S.sq);
        g.uniform3f(g.getUniformLocation(prog2, "uTint"), S.tint[0], S.tint[1], S.tint[2]);
        g.uniform1i(g.getUniformLocation(prog2, "uTex"), 0);
        g.uniform1f(g.getUniformLocation(prog2, "uT"), t / 1000);
        g.uniform1f(g.getUniformLocation(prog2, "uLevel"), S.nivel);
        g.uniform2f(g.getUniformLocation(prog2, "uMouse"), S.ax, S.ay);
        g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      }
      box.style.setProperty("--n", S.nivel.toFixed(3));
      box.style.transform = `translate3d(${(Math.sin(t / 37) * S.nivel * 2.2).toFixed(2)}px,${(Math.cos(t / 41) * S.nivel * 2.2).toFixed(2)}px,0)`;

      // lágrimas: ritmo base calmo, sobe com o volume
      LAGRIMAS.forEach((l, k) => {
        acum[k] += dt * (0.22 + S.nivel * 5.5);
        if (acum[k] >= 1) { acum[k] = 0; solta(l[0], l[1], l[2], 0.6 + S.nivel); }
      });
      // abraço: rajada de lágrimas
      if (S.estouro > 0) {
        for (let k = 0; k < 5; k++) { const l = LAGRIMAS[k % 2]; solta(l[0] + (Math.random() - 0.5) * 0.05, l[1] + Math.random() * 0.02, (Math.random() - 0.5) * 0.08, 1.2); }
        S.estouro--;
      }
      c2.clearRect(0, 0, W, H);
      // poeira no feixe da lanterna (e na luz da TV)
      for (let k = 0; k < POEIRA.length; k++) {
        const m = POEIRA[k];
        m.x += (m.vx + Math.sin(t / 900 + m.ph) * 0.0012) * dt * 60 * 0.5; m.y += m.vy * dt * 0.6 * (1 + S.nivel * 3);
        if (m.y < -0.02) m.y = 1.02; if (m.x < -0.02) m.x = 1.02; if (m.x > 1.02) m.x = -0.02;
        const dm = Math.hypot((m.x - S.ax) * ASPECTO, m.y - S.ay);
        const luz = Math.max(Math.max(0, 1 - dm / 0.62), S.tvA * Math.max(0, (m.x - 0.45) * 1.6) * 0.8);
        if (luz < 0.03) continue;
        c2.fillStyle = `rgba(${S.tvA > 0.5 && m.x > 0.6 ? "190,225,255" : "255,238,214"},${(luz * 0.7 * (0.5 + S.nivel)).toFixed(2)})`;
        c2.beginPath(); c2.arc(m.x * W, m.y * H, (0.7 + m.s * 1.1) * dpr, 0, Math.PI * 2); c2.fill();
      }
      for (let k = gotas.length - 1; k >= 0; k--) {
        const o = gotas[k];
        o.vy += dt * 0.5; o.y += o.vy * dt * 3.2; o.x += o.vx * dt; o.v -= dt * 0.38;
        if (o.v <= 0 || o.y > 0.62) { gotas.splice(k, 1); continue; }
        const x = o.x * W, y = o.y * H, len = (10 + o.vy * 120) * dpr, r = (2.2 + o.f * 1.6) * dpr;
        const gr = c2.createLinearGradient(x, y - len, x, y + r);
        gr.addColorStop(0, "rgba(180,220,255,0)"); gr.addColorStop(1, `rgba(205,235,255,${(0.75 * o.v).toFixed(2)})`);
        c2.fillStyle = gr; c2.beginPath(); c2.ellipse(x, y - len / 2, r * 0.55, len / 2 + r, 0, 0, Math.PI * 2); c2.fill();
        c2.fillStyle = `rgba(235,248,255,${(0.9 * o.v).toFixed(2)})`; c2.beginPath(); c2.arc(x, y, r, 0, Math.PI * 2); c2.fill();
        c2.fillStyle = `rgba(255,255,255,${(0.9 * o.v).toFixed(2)})`; c2.beginPath(); c2.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2); c2.fill();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", mede); removeEventListener("pointermove", move); };
  }, []);

  const tocar = (n) => {
    const a = audio.current, S = est.current;
    if (!a) return;
    if (!liberado) { chamar(); return; }
    if (!S.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      S.ctx = new AC();
      S.fonte = S.ctx.createMediaElementSource(a);
      S.an = S.ctx.createAnalyser(); S.an.fftSize = 512; S.an.smoothingTimeConstant = 0.7;
      S.dados = new Uint8Array(S.an.frequencyBinCount);
      S.fonte.connect(S.an); S.an.connect(S.ctx.destination);
    }
    S.ctx.resume?.();
    S.faixa = n;
    setI(n);
    S.alvoTint = TINTS[n];
    a.src = PREVIA ? `/man/${pad(n + 1)}.mp3` : `/man/full/${pad(n + 1)}.mp3`;
    a.play().catch(() => {});
  };
  tocarRef.current = tocar;

  // placar do pedido: carrega ao entrar; se a API falhar, o play fica liberado (não prende ninguém do lado de fora)
  useEffect(() => {
    let vivo = true;
    fetch("/api/mandarim/pedido", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (vivo) setPedido(j); })
      .catch(() => { if (vivo) setPedido({ erro: true, total: 0, votos: { tudo: 0, semana: 0, clipe: 0 }, meu: null }); });
    return () => { vivo = false; };
  }, []);
  const liberado = !!pedido && (!!pedido.meu || !!pedido.erro);
  const chamar = () => { setChama(true); setTimeout(() => setChama(false), 700); };
  const votar = async (opcao) => {
    try {
      const r = await fetch("/api/mandarim/pedido", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ opcao }) });
      const j = await r.json();
      if (!r.ok) { setAviso(j.erro || "não deu para votar agora"); return; }
      setPedido(j); setAviso(opcao === "nao" ? "anotado. o bicho vai chorar mais um pouco." : ""); abraca();
    } catch { setAviso("sem conexão, tenta de novo"); }
  };
  const compartilhar = async () => {
    const url = location.origin + location.pathname;
    const texto = "Pede pra ele soltar: eL Mandarim, mixtape \"Tô com depressão\".";
    try {
      if (navigator.share) await navigator.share({ title: "eL Mandarim · Tô com depressão", text: texto, url });
      else { await navigator.clipboard.writeText(`${texto} ${url}`); setAviso("link copiado, manda pra galera"); setTimeout(() => setAviso(""), 3000); }
    } catch {}
  };
  // "pedindo" soma só quem quer a mixtape; quem votou "nao" entra na enquete mas não no placar
  const pedindo = pedido ? (pedido.votos.tudo || 0) + (pedido.votos.semana || 0) + (pedido.votos.clipe || 0) : 0;
  const pct = (o) => (pedido && pedido.total ? Math.round(((pedido.votos[o] || 0) / pedido.total) * 100) : 0);

  // com som: a mixtape começa sozinha quando o quarto ocupa a tela (o clique no portão libera o áudio)
  useEffect(() => {
    if (!autoplay || !raiz.current) return;
    const S = est.current;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !S.auto) { S.auto = true; tocarRef.current?.(0); }
    }, { threshold: 0.6 });
    io.observe(raiz.current);
    return () => io.disconnect();
  }, [autoplay]);

  // setas trocam de faixa quando o quarto está na tela
  useEffect(() => {
    const k = (e) => {
      const S = est.current;
      if (!S.vis || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      const n = (S.faixa ?? -1) + (e.key === "ArrowRight" ? 1 : -1);
      if (n >= 0 && n < FAIXAS.length) tocarRef.current?.(n);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  const ligaTv = (e) => { e?.stopPropagation(); const v = !tv; setTv(v); est.current.tv = v ? 1 : 0; setMexeu(true); };
  // clicar no hamster: ele aperta o abraço e chora mais
  const abraca = () => { const S = est.current; S.sq = 1; S.estouro = 4; setMexeu(true); };

  const alterna = () => {
    const a = audio.current; if (!a) return;
    if (i === null) { tocar(0); return; }
    if (a.paused) { est.current.ctx?.resume?.(); a.play(); } else a.pause();
  };

  return (
    <Raiz ref={raiz} id="mixtape" className={`${styles.raiz} ${embutido ? styles.emb : ""} ${display.variable} ${mono.variable}`}>
      {!embutido && <VoltarJodo />}
      {!embutido && <MarcaTopo nome="eL Mandarim" cor="#efe3d8" />}
      <audio ref={audio} onPlay={() => setToca(true)} onPause={() => setToca(false)} onEnded={() => { if (i !== null && i < FAIXAS.length - 1) tocar(i + 1); else setToca(false); }}
        onTimeUpdate={(e) => setProg(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)} preload="none" />

      <div className={styles.fundo} style={{ backgroundImage: "url(/man/quarto.webp)" }} aria-hidden="true" />
      <div className={styles.palco}>
        <aside className={styles.esq}>
          <p className={styles.sel}>mixtape</p>
          {embutido ? <h2 className={styles.h1}>tô com <br />depressão</h2> : <h1>eL<br />Mandarim</h1>}
          <p className={styles.nome}>{embutido ? "eL Mandarim · mixtape" : "tô com depressão"}</p>
          <div className={`${styles.pedido} ${chama ? styles.chama : ""}`}>
            <p className={styles.pedidoNum}>
              <b>{pedido ? pedindo : "·"}</b>
              <span>{pedido && pedindo === 0 ? "ninguém pediu ainda. seja o primeiro" : "pedindo pra ele soltar"}</span>
            </p>
            <div className={styles.meta} aria-hidden="true"><i style={{ width: `${Math.min(100, (pedindo / META) * 100)}%` }} /></div>
            <p className={styles.metaTxt}>meta: {META} pedidos · o placar é público</p>
            {!pedido?.meu && !pedido?.erro ? (
              <>
                <p className={styles.pedidoQ}>Como você quer essa mixtape? Vota pra destrancar o play.</p>
                <ul className={styles.enquete}>
                  {ENQUETE.map((o) => <li key={o.id}><button onClick={() => votar(o.id)} disabled={!pedido}>{o.t}</button></li>)}
                </ul>
              </>
            ) : (
              <>
                {pedido?.meu && (
                  <ul className={styles.resultado}>
                    {ENQUETE.map((o) => (
                      <li key={o.id} className={pedido.meu === o.id ? styles.meu : ""}>
                        <span>{o.t}</span><em>{pct(o.id)}%</em><i style={{ width: `${pct(o.id)}%` }} />
                      </li>
                    ))}
                  </ul>
                )}
                <button className={styles.chamar} onClick={compartilhar}>chamar a galera ↗</button>
              </>
            )}
            {aviso && <p className={styles.aviso}>{aviso}</p>}
          </div>
          <div className={styles.botoes}>
            <button className={styles.play} onClick={alterna}>{!liberado ? "play trancado" : i === null ? "ouvir ▸" : toca ? "pausar ❚❚" : "continuar ▸"}</button>
            <button className={`${styles.play} ${styles.play2}`} onClick={ligaTv} aria-pressed={tv}>{tv ? "desligar a TV" : "ligar a TV"}</button>
          </div>
          <p className={styles.dica}>tá escuro, o mouse é a lanterna. clica no bicho.{liberado ? " setas ← → trocam a faixa." : ""}</p>
        </aside>

        <div className={styles.quadroBox}>
          <div ref={quadro} className={styles.quadro} role="img" onClick={abraca} aria-label="Um hamster gigante e molhado de lágrimas abraça um homem assustado num colchão sujo, num quarto mofado e escuro, de frente para uma TV">
            <canvas ref={gl} className={styles.gl} />
            <canvas ref={lag} className={styles.lag} />
            <div className={styles.luz} aria-hidden="true" />
            <button className={`${styles.tvHit} ${mexeu ? "" : styles.pulsa}`} onClick={ligaTv} aria-label={tv ? "Desligar a TV" : "Ligar a TV"} aria-pressed={tv}>
              <span>{tv ? "desligar" : "ligar a TV"}</span>
            </button>
          </div>
        </div>

        <div className={styles.listaBox}>
        <ol className={styles.lista}>
          {FAIXAS.map((f, n) => (
            <li key={f}>
              <button className={`${i === n ? styles.on : ""} ${liberado ? "" : styles.trancada}`} onClick={() => (i === n ? alterna() : tocar(n))}>
                <b>{liberado ? pad(n + 1) : "🔒"}</b><span>{f}</span>
                {i === n && <i style={{ transform: `scaleX(${prog})` }} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ol>
        {children}
        </div>
      </div>
    </Raiz>
  );
}
