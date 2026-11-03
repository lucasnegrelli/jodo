/*
  MOTOR DO ESTÚDIO (domrafa): todos os sons são sintetizados em código com Web Audio, sem amostras nem arquivos.
  É o "kit do site", não os sons do domrafa. Se ele mandar loops ou stems, dá para tocar os dele no lugar destes.
  Padrão = 5 vozes x 16 passos. kick/caixa/hat: 0 ou 1. baixo/assobio: 0 (vazio) ou 1 a 4 (nota da escala).
*/

export const VOZES = [
  { k: "k", nome: "KICK", tecla: "A" },
  { k: "s", nome: "CAIXA", tecla: "S" },
  { k: "h", nome: "HAT", tecla: "D" },
  { k: "b", nome: "BAIXO", tecla: "F" },
  { k: "l", nome: "ASSOBIO", tecla: "G" },
];

const BAIXO = [49, 58.27, 65.41, 73.42]; // sol, sib, dó, ré (grave)
const LEAD = [587.33, 698.46, 783.99, 880]; // ré, fá, sol, lá (agudo)

export const passoVazio = () => ({ k: Array(16).fill(0), s: Array(16).fill(0), h: Array(16).fill(0), b: Array(16).fill(0), l: Array(16).fill(0) });

// ponto de partida: uma batida de fim de tarde
export const padraoInicial = () => {
  const p = passoVazio();
  [0, 6, 10].forEach((i) => (p.k[i] = 1));
  [4, 12].forEach((i) => (p.s[i] = 1));
  for (let i = 0; i < 16; i += 2) p.h[i] = 1;
  p.b[0] = 1; p.b[3] = 1; p.b[6] = 3; p.b[8] = 1; p.b[11] = 2; p.b[14] = 4;
  p.l[8] = 2; p.l[12] = 3; p.l[14] = 2;
  return p;
};

export const copia = (p) => JSON.parse(JSON.stringify(p));

function ruidoBuf(ctx) {
  const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

// toca uma voz no instante t, no destino dest
function voz(ctx, dest, ruido, v, nota, t, dur) {
  const g = ctx.createGain();
  g.connect(dest);
  if (v === "k") {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g); o.start(t); o.stop(t + 0.45);
  } else if (v === "s") {
    const n = ctx.createBufferSource(); n.buffer = ruido;
    const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400;
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    n.connect(f); f.connect(g); n.start(t, Math.random() * 0.5, 0.25);
    const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(190, t);
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.35, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(g2); g2.connect(dest); o.start(t); o.stop(t + 0.12);
  } else if (v === "h") {
    const n = ctx.createBufferSource(); n.buffer = ruido;
    const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7500;
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    n.connect(f); f.connect(g); n.start(t, Math.random() * 0.5, 0.08);
  } else if (v === "b") {
    const hz = BAIXO[(nota || 1) - 1];
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(hz * 1.04, t);
    o.frequency.exponentialRampToValueAtTime(hz, t + 0.05);
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 420;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.015);
    g.gain.setValueAtTime(0.9, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.5);
    o.connect(f); f.connect(g); o.start(t); o.stop(t + dur * 1.6);
  } else if (v === "l") {
    const hz = LEAD[(nota || 1) - 1];
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(hz * 0.96, t);
    o.frequency.exponentialRampToValueAtTime(hz, t + 0.09);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.5;
    const lg = ctx.createGain(); lg.gain.value = hz * 0.012;
    lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur * 2.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur * 2);
    o.connect(g); o.start(t); o.stop(t + dur * 2.2);
  }
}

export function criaMotor(aoPasso) {
  let ctx = null;
  let saida = null;
  let ruido = null;
  let timer = null;
  let proximo = 0;
  let i = 0;
  const m = { pat: padraoInicial(), bpm: 92, swing: 0.12, ultimoT: 0, ultimoI: 0, rodando: false };

  const garante = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor();
      saida = ctx.createGain();
      saida.connect(comp);
      comp.connect(ctx.destination);
      ruido = ruidoBuf(ctx);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const dur = () => 60 / m.bpm / 4;

  const agenda = () => {
    while (proximo < ctx.currentTime + 0.12) {
      const sw = i % 2 ? dur() * m.swing : 0;
      const t = proximo + sw;
      const p = m.pat;
      ["k", "s", "h", "b", "l"].forEach((v) => {
        if (p[v][i]) voz(ctx, saida, ruido, v, p[v][i], t, dur());
      });
      m.ultimoT = t; m.ultimoI = i;
      const idx = i;
      setTimeout(() => aoPasso && aoPasso(idx), Math.max(0, (t - ctx.currentTime) * 1000));
      proximo += dur();
      i = (i + 1) % 16;
    }
  };

  m.liga = () => {
    garante();
    if (m.rodando) return;
    m.rodando = true; i = 0; proximo = ctx.currentTime + 0.06;
    agenda();
    timer = setInterval(agenda, 25);
  };
  m.para = () => {
    m.rodando = false;
    clearInterval(timer);
    aoPasso && aoPasso(-1);
  };
  m.bate = (v, nota = 1) => {
    garante();
    voz(ctx, saida, ruido, v, nota, ctx.currentTime + 0.005, dur());
  };
  // passo em que um toque ao vivo cai (o mais próximo da batida)
  m.passoAgora = () => {
    if (!ctx) return 0;
    return ctx.currentTime - m.ultimoT > dur() / 2 ? (m.ultimoI + 1) % 16 : m.ultimoI;
  };
  m.volume = (v) => { garante(); saida.gain.value = v; };

  // renderiza 4 compassos do padrão e devolve um WAV 16 bits
  m.exporta = async (pat, bpm, swing) => {
    const sr = 44100;
    const d = 60 / bpm / 4;
    const seg = d * 64 + 1.2;
    const off = new OfflineAudioContext(1, Math.ceil(seg * sr), sr);
    const comp = off.createDynamicsCompressor();
    comp.connect(off.destination);
    const rb = ruidoBuf(off);
    for (let n = 0; n < 64; n++) {
      const j = n % 16;
      const t = n * d + (j % 2 ? d * swing : 0);
      ["k", "s", "h", "b", "l"].forEach((v) => { if (pat[v][j]) voz(off, comp, rb, v, pat[v][j], t, d); });
    }
    const buf = await off.startRendering();
    const x = buf.getChannelData(0);
    const out = new DataView(new ArrayBuffer(44 + x.length * 2));
    const txt = (o, s) => { for (let q = 0; q < s.length; q++) out.setUint8(o + q, s.charCodeAt(q)); };
    txt(0, "RIFF"); out.setUint32(4, 36 + x.length * 2, true); txt(8, "WAVEfmt ");
    out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
    out.setUint32(24, sr, true); out.setUint32(28, sr * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true);
    txt(36, "data"); out.setUint32(40, x.length * 2, true);
    for (let q = 0; q < x.length; q++) out.setInt16(44 + q * 2, Math.max(-1, Math.min(1, x[q])) * 0x7fff, true);
    return new Blob([out], { type: "audio/wav" });
  };
  return m;
}
