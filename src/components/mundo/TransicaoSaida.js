"use client";

import { useEffect, useRef } from "react";

/*
  Transição de saída do mapa para a página de um artista (2026-10-22).
  Cada artista pode ter a sua, que adianta o mundo da página dele; quem não tem usa a "tinta" na cor do pino.
  Para criar outra: escrever uma função (ctx, W, H, x, y, t, cor, ctxExtra) que desenha o quadro em t de 0 a 1,
  terminar cobrindo a tela inteira na cor/fundo da página de destino, e registrar em EFEITOS e TIPO_POR_SLUG.
*/

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// gerador pseudo-aleatório com semente (as rachaduras e os cacos são sempre os mesmos para o mesmo clique)
function sem(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ---------- tinta: mancha irregular na cor do artista, com respingos ---------- */
function tinta(ctx, W, H, x, y, t, cor) {
  const max = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
  const R = max * 1.55 * ease(t);
  const blob = (esc, ox, oy, fase) => {
    ctx.beginPath();
    const n = 220;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = R * esc * (1 + 0.16 * Math.sin(a * 5 + t * 4 + fase) + 0.09 * Math.sin(a * 9 - t * 6 + fase) + 0.05 * Math.sin(a * 17 + t * 9));
      const px = x + ox + Math.cos(a) * r;
      const py = y + oy + Math.sin(a) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  };
  ctx.save();
  ctx.shadowColor = cor;
  ctx.shadowBlur = 26;
  ctx.fillStyle = cor;
  blob(1, 0, 0, 0);
  ctx.restore();
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  blob(0.88, R * 0.03, R * 0.04, 1.7);
  ctx.fillStyle = cor;
  for (let k = 0; k < 16; k++) {
    const a = k * 2.399 + 1;
    const d = R * (1.06 + 0.4 * (((k * 37) % 10) / 10));
    const r = Math.max(0, (5 + ((k * 13) % 10)) * (1 - t) * 1.3);
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (t > 0.97) ctx.fillRect(0, 0, W, H);
}

/* ---------- água (1LUM3): ondas verdes saindo do clique, a piscina escurece até o fundo da página ---------- */
function agua(ctx, W, H, x, y, t) {
  const max = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
  const e = ease(t);
  const R = max * 1.15 * e;
  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, R));
  g.addColorStop(0, "rgba(16, 70, 52, 0.55)");
  g.addColorStop(0.75, "rgba(11, 24, 20, 0.95)");
  g.addColorStop(1, "rgba(11, 11, 11, 1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  for (let k = 0; k < 6; k++) {
    const r = R * (1 - k * 0.15);
    if (r <= 2) continue;
    ctx.strokeStyle = `rgba(140, 240, 168, ${Math.max(0, 0.95 - k * 0.12) * (1 - t * 0.5)})`;
    ctx.lineWidth = Math.max(0.8, 4.2 - k * 0.55);
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI * 2;
      const rr = r + Math.sin(a * 7 + t * 10 + k) * 2.5;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  if (t > 0.97) {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, W, H);
  }
}

/* ---------- rachadura (Van MC): o mapa racha e cacos escuros se fecham por cima, até o preto do muro ---------- */
function rachaduras(x, y, W, H) {
  const r = sem(Math.round(x * 7 + y * 13) + 11);
  const ramos = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    let a = (i / n) * Math.PI * 2 + r() * 0.5;
    let px = x, py = y;
    const seg = [[px, py]];
    const len = 7 + Math.floor(r() * 6);
    for (let k = 0; k < len; k++) {
      a += (r() - 0.5) * 0.9;
      const d = 40 + r() * 70;
      px += Math.cos(a) * d; py += Math.sin(a) * d;
      seg.push([px, py]);
      if (r() < 0.28 && k > 0) {
        const b = a + (r() < 0.5 ? -1 : 1) * (0.7 + r() * 0.5);
        const sub = [[px, py]];
        let qx = px, qy = py;
        for (let j = 0; j < 3 + Math.floor(r() * 3); j++) { qx += Math.cos(b + (r() - 0.5) * 0.8) * (30 + r() * 40); qy += Math.sin(b + (r() - 0.5) * 0.8) * (30 + r() * 40); sub.push([qx, qy]); }
        ramos.push(sub);
      }
    }
    ramos.push(seg);
  }
  return ramos;
}
function cacos(x, y, W, H) {
  const r = sem(Math.round(x * 3 + y * 5) + 5);
  const cols = 14, rows = 9, cw = W / cols, rh = H / rows, V = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) V.push([i * cw + (i === 0 || i === cols ? 0 : (r() - 0.5) * cw * 0.7), j * rh + (j === 0 || j === rows ? 0 : (r() - 0.5) * rh * 0.7)]);
  const out = [], max = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const Q = [V[j * (cols + 1) + i], V[j * (cols + 1) + i + 1], V[(j + 1) * (cols + 1) + i + 1], V[(j + 1) * (cols + 1) + i]];
    const tris = r() < 0.5 ? [[Q[0], Q[1], Q[2]], [Q[0], Q[2], Q[3]]] : [[Q[0], Q[1], Q[3]], [Q[1], Q[2], Q[3]]];
    for (const P of tris) {
      const cx = (P[0][0] + P[1][0] + P[2][0]) / 3, cy = (P[0][1] + P[1][1] + P[2][1]) / 3;
      out.push({ P, cx, cy, d: Math.hypot(cx - x, cy - y) / max + r() * 0.06 });
    }
  }
  return out;
}
function rachadura(ctx, W, H, x, y, t, _cor, cache) {
  if (!cache.ramos) { cache.ramos = rachaduras(x, y, W, H); cache.cacos = cacos(x, y, W, H); }
  const p1 = clamp(t / 0.5);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.35 * p1})`;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(255, 190, 110, 0.9)";
  ctx.shadowBlur = 12;
  ctx.strokeStyle = "rgba(255, 214, 160, 0.95)";
  ctx.lineWidth = 2.2;
  for (const seg of cache.ramos) {
    const total = seg.length - 1;
    const upTo = total * p1;
    ctx.beginPath();
    ctx.moveTo(seg[0][0], seg[0][1]);
    for (let i = 1; i <= Math.ceil(upTo); i++) {
      const f = Math.min(1, upTo - (i - 1));
      const a = seg[i - 1], b = seg[i];
      ctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = "#030303";
  for (const c of cache.cacos) {
    const u = clamp((t - 0.38 - c.d * 0.34) / 0.22);
    if (u <= 0) continue;
    const k = 1.45 - 0.45 * ease(u);
    ctx.globalAlpha = u;
    ctx.beginPath();
    ctx.moveTo(c.cx + (c.P[0][0] - c.cx) * k, c.cy + (c.P[0][1] - c.cy) * k);
    ctx.lineTo(c.cx + (c.P[1][0] - c.cx) * k, c.cy + (c.P[1][1] - c.cy) * k);
    ctx.lineTo(c.cx + (c.P[2][0] - c.cx) * k, c.cy + (c.P[2][1] - c.cy) * k);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (t > 0.8) {
    ctx.fillStyle = `rgba(3, 3, 3, ${clamp((t - 0.8) / 0.15)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

/* ---------- 82: linha do tempo de editor; a agulha varre e os clipes verdes ficam no lugar ---------- */
function timeline(ctx, W, H, x, y, t, cor, cache) {
  const rows = 7, rh = H / rows, base = "#0a120a";
  if (!cache.clips) {
    const r = sem(82);
    cache.clips = [];
    for (let i = 0; i < rows; i++) {
      const arr = []; let px = 0;
      while (px < W) { const w = 90 + r() * 280; arr.push([px, Math.min(w, W - px)]); px += w + (r() < 0.5 ? 0 : 24); }
      cache.clips.push(arr);
    }
  }
  const head = W * 1.04 * ease(t);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, head, H);
  ctx.fillStyle = "rgba(138, 208, 106, 0.8)";
  cache.clips.forEach((arr, i) => arr.forEach(([cx, cw]) => {
    const w = Math.min(cw, head - cx);
    if (w > 0) ctx.fillRect(cx + 2, i * rh + rh * 0.18, w - 4 > 0 ? w - 4 : w, rh * 0.64);
  }));
  ctx.fillStyle = "#fff";
  ctx.fillRect(head - 1, 0, 2, H);
  ctx.beginPath(); ctx.moveTo(head - 8, 0); ctx.lineTo(head + 8, 0); ctx.lineTo(head, 12); ctx.closePath(); ctx.fill();
  if (t > 0.97) { ctx.fillStyle = base; ctx.fillRect(0, 0, W, H); }
}

/* ---------- Isa Katupyryb: folha de contato; os quadros acendem em sequência a partir do clique ---------- */
function contato(ctx, W, H, x, y, t, cor, cache) {
  const cols = 8, rows = 5, cw = W / cols, rh = H / rows, max = Math.hypot(W, H), base = "#120a0e";
  if (!cache.tons) { const r = sem(61); cache.tons = Array.from({ length: cols * rows }, () => 0.35 + r() * 0.6); }
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = (i + 0.5) * cw, cy = (j + 0.5) * rh, d = Math.hypot(cx - x, cy - y) / max;
    const u = clamp((t - d * 0.5) / 0.32);
    if (u <= 0) continue;
    const e = ease(u), w = (cw - 8) * e, h = (rh - 8) * e;
    ctx.fillStyle = base;
    ctx.fillRect(cx - cw / 2, cy - rh / 2, cw, rh);
    ctx.fillStyle = cor;
    ctx.globalAlpha = cache.tons[j * cols + i] * 0.85;
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  }
  if (t > 0.78) { ctx.fillStyle = `rgba(18, 10, 14, ${clamp((t - 0.78) / 0.2)})`; ctx.fillRect(0, 0, W, H); }
}

/* ---------- Rômulo Spuri: estrada; riscos correndo de um ponto de fuga no clique ---------- */
function estrada(ctx, W, H, x, y, t, cor) {
  const max = Math.hypot(W, H);
  ctx.fillStyle = `rgba(14, 10, 28, ${clamp(t * 1.7)})`;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.lineCap = "round";
  const rays = 22;
  for (let k = 0; k < rays; k++) {
    const a = (k / rays) * Math.PI * 2 + 0.13;
    for (let i = 0; i < 7; i++) {
      const z = (i / 7 + t * 1.5) % 1;
      const r0 = z * z * max * 0.9, r1 = r0 + (0.02 + z * 0.16) * max * 0.5;
      ctx.strokeStyle = `rgba(169, 140, 255, ${(0.15 + z * 0.8) * (1 - clamp((t - 0.7) / 0.3))})`;
      ctx.lineWidth = 1 + z * 6;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
      ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.stroke();
    }
  }
  ctx.restore();
  if (t > 0.72) { ctx.fillStyle = `rgba(14, 10, 28, ${clamp((t - 0.72) / 0.25)})`; ctx.fillRect(0, 0, W, H); }
}

/* ---------- Rap Delivery: a caixa amarela desce de cima, com fita ---------- */
function caixa(ctx, W, H, x, y, t, cor) {
  const e = ease(t), h = H * 1.04 * e;
  ctx.fillStyle = cor;
  ctx.fillRect(0, 0, W, h);
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 2;
  for (let yy = 0; yy < h; yy += 14) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
  ctx.fillStyle = "rgba(120, 78, 20, 0.5)";
  ctx.fillRect(W / 2 - 26, 0, 52, h);
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(0, Math.max(0, h - 7), W, 7);
  if (t > 0.97) { ctx.fillStyle = cor; ctx.fillRect(0, 0, W, H); }
}

/* ---------- 1cort3: glitch; faixas azuis deslocadas, com separação de cor ---------- */
function glitch(ctx, W, H, x, y, t, cor, cache) {
  const bands = 26, bh = H / bands, base = "#08111f";
  if (!cache.f) { const r = sem(23); cache.f = Array.from({ length: bands }, () => [r(), r()]); }
  for (let i = 0; i < bands; i++) {
    const [a, b] = cache.f[i];
    const u = clamp((t - a * 0.5) / 0.35);
    if (u <= 0) continue;
    const desl = (b - 0.5) * W * 0.5 * (1 - u);
    const col = i % 3 === 0 ? cor : i % 3 === 1 ? "#0e2a52" : "#142b4a";
    ctx.fillStyle = "rgba(255, 45, 111, 0.55)";
    ctx.fillRect(desl + 6, i * bh, W, bh + 1);
    ctx.fillStyle = "rgba(0, 235, 255, 0.5)";
    ctx.fillRect(desl - 6, i * bh, W, bh + 1);
    ctx.fillStyle = col;
    ctx.fillRect(desl, i * bh, W, bh + 1);
  }
  if (t > 0.8) { ctx.fillStyle = `rgba(8, 17, 31, ${clamp((t - 0.8) / 0.18)})`; ctx.fillRect(0, 0, W, H); }
}

/* ---------- Sergio Estranho: íris de cinema que se fecha no ponto do clique, anel coral ---------- */
function iris(ctx, W, H, x, y, t, cor) {
  const max = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)), R = max * (1 - ease(t));
  ctx.fillStyle = "#050505";
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.arc(x, y, Math.max(0, R), 0, Math.PI * 2);
  ctx.fill("evenodd");
  if (R > 1) {
    ctx.save();
    ctx.shadowColor = cor; ctx.shadowBlur = 18;
    ctx.strokeStyle = cor; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (t > 0.97) { ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, W, H); }
}

/* ---------- Margarida The Cat: três arranhões de garra em vermelho ---------- */
function garra(ctx, W, H, x, y, t, cor) {
  for (let k = 0; k < 3; k++) {
    const u = clamp((t - k * 0.1) / 0.38);
    if (u <= 0) continue;
    const ax = W * (0.12 + k * 0.2) - 40, ay = -30, bx = W * (0.5 + k * 0.2) + 60, by = H + 30;
    const n = 30, lim = Math.floor(n * ease(u));
    ctx.save();
    ctx.shadowColor = cor; ctx.shadowBlur = 16; ctx.fillStyle = cor;
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    const esq = [], dir = [];
    for (let i = 0; i <= lim; i++) {
      const s = i / n, w = Math.sin(Math.PI * s) * 20 + 2;
      const px = ax + dx * s, py = ay + dy * s;
      esq.push([px + nx * w, py + ny * w]); dir.push([px - nx * w, py - ny * w]);
    }
    ctx.beginPath();
    esq.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    for (let i = dir.length - 1; i >= 0; i--) ctx.lineTo(dir[i][0], dir[i][1]);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if (t > 0.5) { ctx.fillStyle = `rgba(26, 6, 6, ${clamp((t - 0.5) / 0.4)})`; ctx.fillRect(0, 0, W, H); }
}

/* ---------- Phineas: tira de filme que se abre da horizontal até a tela cheia ---------- */
function filme(ctx, W, H, x, y, t, cor) {
  const e = ease(t), h = H * (0.18 + 0.86 * e), top = H / 2 - h / 2;
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, top, W, h);
  const off = (t * W * 1.6) % 34;
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let xx = -34 + off; xx < W; xx += 34) {
    ctx.fillRect(xx, top + 7, 14, 10);
    ctx.fillRect(xx, top + h - 17, 14, 10);
  }
  const fw = 230, gap = 18, o2 = (t * W * 2.2) % (fw + gap);
  for (let xx = -fw + o2; xx < W; xx += fw + gap) {
    ctx.fillStyle = "rgba(255, 111, 216, 0.22)";
    ctx.fillRect(xx, top + 28, fw, Math.max(0, h - 56));
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.strokeRect(xx, top + 28, fw, Math.max(0, h - 56));
  }
  if (t > 0.9) { ctx.fillStyle = `rgba(10,10,10,${clamp((t - 0.9) / 0.08)})`; ctx.fillRect(0, 0, W, H); }
}

/* ---------- Prisma: luz que se abre em leque de espectro a partir do clique ---------- */
function prisma(ctx, W, H, x, y, t, cor) {
  const max = Math.hypot(W, H), e = ease(t), R = max * 1.25 * e;
  ctx.fillStyle = `rgba(13, 10, 10, ${clamp(t * 2)})`;
  ctx.fillRect(0, 0, W, H);
  const n = 16, passo = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * passo + t * 1.3;
    ctx.fillStyle = `hsla(${(i * 360) / n}, 88%, 62%, ${0.9 * (1 - clamp((t - 0.6) / 0.35))})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
    ctx.lineTo(x + Math.cos(a + passo * 0.92) * R, y + Math.sin(a + passo * 0.92) * R);
    ctx.closePath();
    ctx.fill();
  }
  if (t > 0.6) { ctx.fillStyle = `rgba(13, 10, 10, ${clamp((t - 0.6) / 0.35)})`; ctx.fillRect(0, 0, W, H); }
}

/* ---------- Vicente Blow: frente de brasa queimando o mapa a partir do clique, com fagulhas ---------- */
function brasa(ctx, W, H, x, y, t, cor) {
  const max = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)), R = max * 1.5 * ease(t);
  const pts = [];
  for (let i = 0; i <= 260; i++) {
    const a = (i / 260) * Math.PI * 2;
    const r = R * (1 + 0.1 * Math.sin(a * 7 + t * 5) + 0.07 * Math.sin(a * 19 - t * 9) + 0.04 * Math.sin(a * 41 + t * 14));
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  const traco = () => { ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); };
  ctx.fillStyle = "#070403";
  traco(); ctx.fill();
  ctx.save();
  ctx.shadowColor = cor; ctx.shadowBlur = 28;
  ctx.strokeStyle = cor; ctx.lineWidth = 6; traco(); ctx.stroke();
  ctx.shadowBlur = 8; ctx.strokeStyle = "#ffd9a0"; ctx.lineWidth = 2; traco(); ctx.stroke();
  ctx.restore();
  const r = sem(97);
  for (let k = 0; k < 60; k++) {
    const p = pts[Math.floor(r() * pts.length)], v = r(), subida = t * (30 + v * 90);
    ctx.fillStyle = `rgba(255, ${150 + Math.floor(v * 90)}, 60, ${(1 - t) * (0.4 + v * 0.6)})`;
    ctx.beginPath(); ctx.arc(p[0] + (v - 0.5) * 40, p[1] - subida, 1.2 + v * 2.4, 0, Math.PI * 2); ctx.fill();
  }
  if (t > 0.97) { ctx.fillStyle = "#070403"; ctx.fillRect(0, 0, W, H); }
}

/* ---------- domrafa: sequenciador de 16 passos; os pads acendem no ritmo e inundam a tela ---------- */
function batida(ctx, W, H, x, y, t, cor) {
  const cols = 16, rows = 9, cw = W / cols, rh = H / rows, base = "#06201c";
  const passo = clamp(t / 0.6) * cols;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const forte = (i * 7 + j * 3) % 5 < 2;
    const u = clamp((passo - i - (j % 3) * 0.25) / 1.2);
    if (u <= 0) continue;
    ctx.fillStyle = base;
    ctx.fillRect(i * cw, j * rh, cw + 1, rh + 1);
    ctx.fillStyle = cor;
    ctx.globalAlpha = u * (forte ? 0.95 : 0.5);
    ctx.fillRect(i * cw + 3, j * rh + 3, cw - 6, rh - 6);
    ctx.globalAlpha = 1;
  }
  if (t < 0.7) { ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(Math.floor(passo) * cw, 0, 3, H); }
  if (t > 0.72) { ctx.fillStyle = `rgba(6, 32, 28, ${clamp((t - 0.72) / 0.25)})`; ctx.fillRect(0, 0, W, H); }
}

export const EFEITOS = { tinta, agua, rachadura, timeline, contato, estrada, caixa, glitch, iris, garra, filme, prisma, brasa, batida };
const DURACAO = { tinta: 700, agua: 780, rachadura: 800, timeline: 760, contato: 800, estrada: 780, caixa: 700, glitch: 760, iris: 720, garra: 800, filme: 760, prisma: 800, brasa: 800, batida: 800 };
// Só a Margarida tem transição própria (garras). Os demais usam a mancha de tinta (Lucas, 2026-10-22: "voltar pra mancha de tinta").
// Os outros efeitos continuam prontos em EFEITOS; para ligar um de novo, é só pôr o slug aqui (ex.: "van-mc": "rachadura", "1lum3": "agua", "82": "timeline", ...).
const TIPO_POR_SLUG = { "margarida-the-cat": "garra" };

export const tipoDeTransicao = (slug) => TIPO_POR_SLUG[slug] || "tinta";
export const duracaoTransicao = (tipo) => DURACAO[tipo] || 700;

// x, y: ponto do clique (px); cor: cor do pino (hex); tipo: chave de EFEITOS; tFixo: congela em t (só para teste)
export default function TransicaoSaida({ x, y, cor, tipo = "tinta", tFixo = null }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const W = (c.width = window.innerWidth);
    const H = (c.height = window.innerHeight);
    const ctx = c.getContext("2d");
    const fn = EFEITOS[tipo] || tinta;
    const dur = duracaoTransicao(tipo);
    const cache = {};
    const reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    const quadro = (t) => {
      ctx.clearRect(0, 0, W, H);
      fn(ctx, W, H, x, y, t, cor || "#cfcfe8", cache);
    };
    if (tFixo !== null) {
      quadro(tFixo);
      return;
    }
    if (reduz) {
      quadro(1);
      return;
    }
    const ini = performance.now();
    const loop = (agora) => {
      const t = clamp((agora - ini) / dur);
      quadro(t);
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [x, y, cor, tipo, tFixo]);
  return <canvas ref={ref} aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 60, pointerEvents: "none" }} />;
}
