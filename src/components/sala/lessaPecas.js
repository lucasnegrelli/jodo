// As peças do Lessa Gustavo: cada capa vira um palco em canvas 2D e o título do disco acontece em cima da arte.
// Contrato: peca({ ctx, lay, ptr, img, achou }) -> { prep(), quadro(t, dt) }.
//   lay = { w, h, dpr, sx, sy, S } (S = lado do quadrado da capa, em px CSS) · ptr = { x, y, ativo, v } (v = px/s) · achou() abre a gaveta
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const suave = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const semente = (n) => () => { n |= 0; n = (n + 0x6d2b79f5) | 0; let t = Math.imul(n ^ (n >>> 15), 1 | n); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const cria = (w, h = w) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

// textura cinza de ruído (casca, sujeira): três oitavas de ruído de valor
let _tex = null;
function textura() {
  if (_tex) return _tex;
  const n = 256, c = cria(n), g = c.getContext("2d"), id = g.createImageData(n, n), rnd = semente(5);
  const grade = [32, 64, 128].map((m) => Array.from({ length: m * m }, rnd));
  const amostra = (m, G, x, y) => { const fx = x * m, fy = y * m, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy, a = (i, j) => G[((j + m) % m) * m + ((i + m) % m)]; return (a(ix, iy) * (1 - tx) + a(ix + 1, iy) * tx) * (1 - ty) + (a(ix, iy + 1) * (1 - tx) + a(ix + 1, iy + 1) * tx) * ty; };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const v = amostra(32, grade[0], x / n, y / n) * 0.5 + amostra(64, grade[1], x / n, y / n) * 0.3 + amostra(128, grade[2], x / n, y / n) * 0.2;
    const k = (y * n + x) * 4, c8 = 90 + v * 150; id.data[k] = id.data[k + 1] = id.data[k + 2] = c8; id.data[k + 3] = 255;
  }
  g.putImageData(id, 0, 0); _tex = c; return c;
}
// a capa num quadrado de px lado, com filtro e grão de xerox (as capas só têm 300 px: o grão faz parte do look)
function foto(img, px, filtro = "none", grao = 46) {
  const c = cria(px), g = c.getContext("2d");
  g.imageSmoothingQuality = "high"; g.filter = filtro; g.drawImage(img, 0, 0, px, px); g.filter = "none";
  if (grao) {
    const t = cria(160), tg = t.getContext("2d"), id = tg.createImageData(160, 160);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = grao; }
    tg.putImageData(id, 0, 0); g.fillStyle = g.createPattern(t, "repeat"); g.fillRect(0, 0, px, px);
  }
  return c;
}
const dentro = (lay, x, y, m = 0) => x > lay.sx - m && x < lay.sx + lay.S + m && y > lay.sy - m && y < lay.sy + lay.S + m;
const fundo = (ctx, lay, cor = "#0a0a0a") => { ctx.fillStyle = cor; ctx.fillRect(0, 0, lay.w, lay.h); };

/* =============== Muita Ostra e Pouca Pérola: o muro cheio de ostras; a pérola mora numa só =============== */
function contorno(rnd) {
  const n = 46, f1 = rnd() * 6, f2 = rnd() * 6, f3 = rnd() * 6, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    const larg = 0.42 + 0.58 * suave(-1, 0.4, c);
    const ruga = 1 + 0.07 * Math.sin(a * 4 + f1) + 0.045 * Math.sin(a * 9 + f2) + 0.04 * (c > -0.2 ? Math.sin(a * 17 + f3) : 0);
    pts.push([c * ruga, sn * 0.8 * larg * ruga]);
  }
  return pts;
}
function caminho(ctx, pts, k = 1) {
  const n = pts.length; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n], mx = ((p[0] + q[0]) / 2) * k, my = ((p[1] + q[1]) / 2) * k;
    if (i === 0) ctx.moveTo(mx, my); else ctx.quadraticCurveTo(p[0] * k, p[1] * k, mx, my);
  }
  const p = pts[0], q = pts[1]; ctx.quadraticCurveTo(p[0] * k, p[1] * k, ((p[0] + q[0]) / 2) * k, ((p[1] + q[1]) / 2) * k); ctx.closePath();
}
// a casca por fora, desenhada uma vez num sprite: textura de pedra, camadas de crescimento, cracas, líquen e brilho de maresia
function sprite(o, r, dpr, luz) {
  const sz = Math.ceil(r * 2.5 * dpr), c = cria(sz), g = c.getContext("2d"), sc = r * dpr, rnd = semente(Math.floor(o.nx * 9999));
  g.setTransform(sc, 0, 0, sc, sz / 2, sz / 2);
  caminho(g, o.pts);
  const gr = g.createLinearGradient(-1, -0.7, 1, 0.7);
  gr.addColorStop(0, `hsl(${o.tom} 8% ${luz + 14}%)`); gr.addColorStop(0.5, `hsl(${o.tom} 6% ${luz}%)`); gr.addColorStop(1, `hsl(${o.tom} 8% ${luz - 18}%)`);
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.85;
  const pat = g.createPattern(textura(), "repeat"); pat.setTransform(new DOMMatrix().translate(rnd() * 200, rnd() * 200).rotate(rnd() * 360).scale(1.4 + rnd()));
  g.fillStyle = pat; g.fillRect(0, 0, sz, sz); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
  g.setTransform(sc, 0, 0, sc, sz / 2, sz / 2);
  // camadas de crescimento saindo da dobradiça
  g.lineWidth = 0.02;
  for (let i = 1; i <= 11; i++) {
    const k = 0.2 + i * 0.075, j = (rnd() - 0.5) * 0.02;
    g.save(); g.translate(-0.8 * (1 - k) + j, j); caminho(g, o.pts, k); g.strokeStyle = `rgba(0,0,0,${0.5 - i * 0.025})`; g.stroke();
    g.translate(0.012, -0.014); caminho(g, o.pts, k); g.strokeStyle = `rgba(255,255,255,${0.26 - i * 0.015})`; g.stroke(); g.restore();
  }
  // cracas
  for (let i = 0, n = 4 + Math.floor(rnd() * 8); i < n; i++) {
    const a = rnd() * 6.28, d = 0.15 + rnd() * 0.65, x = Math.cos(a) * d * 0.9 + 0.1, y = Math.sin(a) * d * 0.45, rr = 0.025 + rnd() * 0.035;
    const cg = g.createRadialGradient(x - rr * 0.3, y - rr * 0.4, rr * 0.1, x, y, rr);
    cg.addColorStop(0, "#e4e0d6"); cg.addColorStop(0.7, "#a9a399"); cg.addColorStop(1, "#4e4a43");
    g.fillStyle = cg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
    g.fillStyle = "#1a1917"; g.beginPath(); g.arc(x, y, rr * 0.38, 0, 7); g.fill();
  }
  // líquen e manchas de lodo
  for (let i = 0; i < 70; i++) {
    const a = rnd() * 6.28, d = Math.sqrt(rnd()) * 0.95, x = Math.cos(a) * d, y = Math.sin(a) * d * 0.6;
    g.fillStyle = rnd() < 0.5 ? `rgba(40,48,34,${0.25 + rnd() * 0.3})` : `rgba(20,18,15,${0.2 + rnd() * 0.3})`;
    g.beginPath(); g.arc(x, y, 0.006 + rnd() * 0.02, 0, 7); g.fill();
  }
  g.restore();
  // biselado e brilho molhado
  g.lineWidth = 0.05; const bi = g.createLinearGradient(-1, -0.7, 1, 0.7); bi.addColorStop(0, "rgba(255,255,255,.38)"); bi.addColorStop(0.5, "rgba(0,0,0,.35)"); bi.addColorStop(1, "rgba(0,0,0,.8)");
  g.strokeStyle = bi; caminho(g, o.pts); g.stroke();
  g.lineWidth = 0.014; g.strokeStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.ellipse(0.12, -0.2, 0.34, 0.13, -0.2, 3.4, 5.5); g.stroke();
  // dobradiça escura
  const hg = g.createRadialGradient(-0.86, 0, 0, -0.86, 0, 0.2); hg.addColorStop(0, "rgba(0,0,0,.75)"); hg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = hg; g.fillRect(-1.2, -0.3, 0.7, 0.6);
  return c;
}

export function ostras(env) {
  const { ctx, lay, ptr, img } = env;
  let bg, lista = [], pronto = false;
  const prep = () => {
    const { w, h, dpr, sx, sy, S } = lay, rnd = semente(26);
    bg = cria(Math.round(w * dpr), Math.round(h * dpr)); const b = bg.getContext("2d"); b.setTransform(dpr, 0, 0, dpr, 0, 0);
    fundo(b, lay);
    b.drawImage(foto(img, Math.round(S * dpr), "contrast(1.22) brightness(.88)", 50), sx, sy, S, S);
    const v = b.createRadialGradient(w / 2, h / 2, S * 0.35, w / 2, h / 2, S * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.55)");
    b.fillStyle = v; b.fillRect(sx, sy, S, S);
    if (!lista.length) {
      let tent = 0;
      while (lista.length < 26 && tent++ < 6000) {
        const nx = rnd(), ny = 0.12 + rnd() * 0.84, rr = 0.05 + rnd() * rnd() * 0.05;
        if (nx > 0.38 - rr && nx < 0.62 + rr && ny > 0.4 - rr) continue;
        if (nx > 0.26 - rr && nx < 0.74 + rr && ny > 0.47 - rr && ny < 0.58 + rr) continue;
        if (lista.some((o) => Math.hypot(o.nx - nx, o.ny - ny) < (o.rr + rr) * 1.12)) continue;
        lista.push({ nx, ny, rr, rot: (rnd() - 0.5) * 1.6, pts: contorno(rnd), tom: 28 + rnd() * 28, luz: 36 + rnd() * 14, ab: 0, perola: false });
      }
      let melhor = 0, d = 9; lista.forEach((o, i) => { const dd = Math.hypot(o.nx - 0.82, o.ny - 0.74); if (dd < d) { d = dd; melhor = i; } });
      lista[melhor].perola = true; lista[melhor].rr = Math.max(lista[melhor].rr, 0.075);
    }
    lista.forEach((o) => { o.x = sx + o.nx * S; o.y = sy + o.ny * S; o.r = o.rr * S; o.spr = sprite(o, o.r, dpr, o.luz); o.spr2 = sprite(o, o.r, dpr, o.luz + 5); });
    pronto = true;
  };
  const desenha = (o, t) => {
    const r = o.r, ab = o.ab, hx = -0.88 * r, sz = o.spr.width / lay.dpr;
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot);
    ctx.save(); ctx.scale(1, 0.62); ctx.beginPath(); ctx.arc(r * 0.05, r * 0.2, r * 0.98, 0, 7); ctx.fillStyle = "rgba(0,0,0,.42)"; ctx.filter = "blur(5px)"; ctx.fill(); ctx.restore(); ctx.filter = "none";
    if (ab < 0.02) { ctx.drawImage(o.spr, -sz / 2, -sz / 2, sz, sz); ctx.restore(); return; }
    ctx.drawImage(o.spr, -sz / 2, -sz / 2, sz, sz);
    // o interior: madrepérola em camadas, corpo úmido escuro
    ctx.save(); ctx.scale(r, r); caminho(ctx, o.pts, 0.9); ctx.clip();
    const n = ctx.createRadialGradient(0.1, -0.05, 0.05, 0, 0, 1);
    n.addColorStop(0, "#f7f4ff"); n.addColorStop(0.45, "#cfe6ee"); n.addColorStop(0.75, "#e6cfe4"); n.addColorStop(1, "#7f98a6");
    ctx.fillStyle = n; ctx.fillRect(-2, -2, 4, 4);
    ctx.globalCompositeOperation = "soft-light";
    [["#25d0ff", -0.5, -0.2], ["#ff5fc8", 0.1, 0.35], ["#ffd36a", 0.55, -0.15]].forEach(([c, x, y], i) => {
      const gg = ctx.createRadialGradient(x + Math.sin(t * 0.6 + i) * 0.1, y, 0, x, y, 0.65); gg.addColorStop(0, c); gg.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gg; ctx.fillRect(-2, -2, 4, 4);
    });
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath(); ctx.ellipse(0.1, 0.03, 0.6, 0.26, 0.05, 0, 7); const cg = ctx.createRadialGradient(0.05, -0.04, 0.03, 0.1, 0.03, 0.6); cg.addColorStop(0, "#3a3640"); cg.addColorStop(1, "#121114"); ctx.fillStyle = cg; ctx.fill();
    ctx.beginPath(); ctx.ellipse(-0.03, -0.09, 0.34, 0.05, 0.05, 0, 7); ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.fill();
    ctx.restore();
    if (o.perola) {
      const pr = r * 0.15, px = r * 0.12, py = r * 0.02, br = 0.5 + 0.5 * Math.sin(t * 2.2);
      ctx.save(); ctx.globalAlpha = suave(0.45, 0.9, ab);
      const halo = ctx.createRadialGradient(px, py, 0, px, py, pr * 5); halo.addColorStop(0, `rgba(225,242,255,${0.55 + 0.25 * br})`); halo.addColorStop(1, "rgba(225,242,255,0)");
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(px, py, pr * 5, 0, 7); ctx.fill();
      const p = ctx.createRadialGradient(px - pr * 0.35, py - pr * 0.4, pr * 0.05, px, py, pr);
      p.addColorStop(0, "#fff"); p.addColorStop(0.45, "#eef2ff"); p.addColorStop(0.8, "#d3bfe6"); p.addColorStop(1, "#7fa8c2");
      ctx.fillStyle = p; ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${0.5 + 0.4 * br})`; ctx.lineWidth = r * 0.012; ctx.beginPath(); ctx.moveTo(px - pr * 2, py); ctx.lineTo(px + pr * 2, py); ctx.moveTo(px, py - pr * 2); ctx.lineTo(px, py + pr * 2); ctx.stroke();
      ctx.restore();
    }
    // a valva de cima gira na dobradiça
    ctx.save(); ctx.translate(hx, 0); ctx.rotate(-0.95 * ab); ctx.scale(1 - 0.12 * ab, 1); ctx.translate(-hx, 0);
    ctx.shadowColor = "rgba(0,0,0,.75)"; ctx.shadowBlur = 18 * ab; ctx.shadowOffsetY = 8 * ab; ctx.drawImage(o.spr2, -sz / 2, -sz / 2, sz, sz);
    ctx.restore(); ctx.restore();
  };
  return {
    prep,
    quadro(t) {
      if (!pronto) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0); ctx.setTransform(lay.dpr, 0, 0, lay.dpr, 0, 0);
      let mao = false;
      lista.forEach((o) => {
        const d = Math.hypot(ptr.x - o.x, ptr.y - o.y);
        let alvo = ptr.ativo ? 1 - suave(o.r * 0.5, o.r * 4.2, d) : 0;
        o.ab += (alvo - o.ab) * (alvo > o.ab ? 0.09 : 0.035);
        if (o.perola && o.ab > 0.7 && d < o.r * 0.8) mao = true;
      });
      [...lista].sort((a, b) => a.y + a.ab * a.r * 2 - (b.y + b.ab * b.r * 2)).forEach((o) => desenha(o, t));
      env.cursor(mao ? "pointer" : "default");
    },
    clique() { const o = lista.find((q) => q.perola); if (o && o.ab > 0.7 && Math.hypot(ptr.x - o.x, ptr.y - o.y) < o.r * 0.8) env.achou(); },
  };
}

/* =============== Sereno da Via Light: a rua escura, um poste por faixa; eles acendem quando você passa =============== */
export function sereno(env) {
  const { ctx, lay, ptr, img, obra } = env;
  const nomes = obra.faixas, N = nomes.length;
  let ft, esc, postes = [], fios = [], auto = { i: 0, t: 0 };
  const prep = () => {
    const { S, dpr, sx, sy } = lay, px = Math.round(S * dpr), rnd = semente(41);
    ft = foto(img, px, "contrast(1.15) brightness(.9)", 38); esc = cria(px);
    postes = nomes.map((nm, k) => {
      const f = N === 1 ? 0.5 : k / (N - 1), prof = 0.82 + rnd() * 0.18;
      return { nm, x: sx + S * (0.05 + 0.9 * f), base: sy + S * (0.9 - (1 - prof) * 0.08), alt: S * (0.62 * prof + 0.04), lit: 0, prof, lado: k % 2 ? 1 : -1 };
    });
    // o emaranhado de fios entre as pontas (gato de luz)
    fios = [];
    for (let k = 0; k < N - 1; k++) for (let c = 0; c < 3; c++) fios.push({ a: k, b: k + 1, sag: S * (0.02 + rnd() * 0.07), y0: (rnd() - 0.5) * S * 0.03 });
    for (let k = 0; k < N - 2; k += 2) fios.push({ a: k, b: k + 2, sag: S * (0.08 + rnd() * 0.08), y0: 0 });
  };
  const topo = (p) => ({ x: p.x + p.lado * 6 * p.prof, y: p.base - p.alt });
  return {
    prep,
    quadro(t, dt) {
      const { sx, sy, S, dpr } = lay;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fundo(ctx, lay, "#050608");
      ctx.drawImage(ft, sx, sy, S, S);
      // quem acende: o poste mais perto do cursor; sem cursor, um passeio lento
      if (!ptr.ativo) { auto.t += dt; if (auto.t > 1.1) { auto.t = 0; auto.i = (auto.i + 1) % N; } }
      let perto = -1, dm = 1e9;
      postes.forEach((p, k) => { const d = ptr.ativo ? Math.hypot(ptr.x - p.x, (ptr.y - (p.base - p.alt * 0.6)) * 0.35) : Math.abs(k - auto.i) * 40; if (d < dm) { dm = d; perto = k; } });
      postes.forEach((p, k) => {
        const alvo = ptr.ativo ? 1 - suave(S * 0.03, S * 0.2, Math.abs(ptr.x - p.x)) : (k === auto.i ? 0.8 : 0);
        p.lit += (alvo - p.lit) * (alvo > p.lit ? 0.12 : 0.02);
      });
      // a escuridão da rua, furada pelas luzes
      const e = esc.getContext("2d"); e.setTransform(dpr, 0, 0, dpr, 0, 0); e.globalCompositeOperation = "source-over"; e.clearRect(0, 0, S, S);
      e.fillStyle = "rgba(3,4,7,.94)"; e.fillRect(0, 0, S, S); e.globalCompositeOperation = "destination-out";
      postes.forEach((p) => {
        if (p.lit < 0.02) return; const tp = topo(p), fl = p.lit < 0.85 ? 0.82 + 0.18 * Math.sin(t * 53 + p.x) : 1, a = p.lit * fl, cx = tp.x - sx, cy = tp.y - sy;
        const g = e.createRadialGradient(cx, cy + S * 0.18, 0, cx, cy + S * 0.18, S * 0.3 * p.prof); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.55, `rgba(0,0,0,${0.55 * a})`); g.addColorStop(1, "rgba(0,0,0,0)");
        e.fillStyle = g; e.fillRect(0, 0, S, S);
        const c = e.createLinearGradient(cx, cy, cx, p.base - sy); c.addColorStop(0, `rgba(0,0,0,${0.9 * a})`); c.addColorStop(1, `rgba(0,0,0,${0.15 * a})`);
        e.fillStyle = c; e.beginPath(); e.moveTo(cx - 3, cy); e.lineTo(cx + 3, cy); e.lineTo(cx + S * 0.1 * p.prof, p.base - sy); e.lineTo(cx - S * 0.1 * p.prof, p.base - sy); e.closePath(); e.fill();
      });
      ctx.drawImage(esc, sx, sy, S, S);
      // fios
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(12,12,14,.95)";
      fios.forEach((f) => { const A = topo(postes[f.a]), B = topo(postes[f.b]); ctx.beginPath(); ctx.moveTo(A.x, A.y + f.y0); ctx.quadraticCurveTo((A.x + B.x) / 2, Math.max(A.y, B.y) + f.sag + Math.sin(t * 0.6 + f.a) * 1.2, B.x, B.y + f.y0); ctx.stroke(); });
      // chão molhado: a poça de luz
      postes.forEach((p) => { if (p.lit < 0.02) return; const g = ctx.createRadialGradient(p.x, p.base, 0, p.x, p.base, S * 0.1 * p.prof); g.addColorStop(0, `rgba(255,232,170,${0.4 * p.lit})`); g.addColorStop(1, "rgba(255,232,170,0)"); ctx.save(); ctx.translate(0, 0); ctx.scale(1, 1); ctx.fillStyle = g; ctx.fillRect(p.x - S * 0.12, p.base - S * 0.04, S * 0.24, S * 0.08); ctx.restore(); });
      // os postes
      postes.forEach((p, k) => {
        const tp = topo(p), a = p.lit, w = 5.5 * p.prof;
        ctx.fillStyle = "#17181b"; ctx.fillRect(p.x - w / 2, tp.y, w, p.base - tp.y); ctx.fillStyle = `rgba(255,255,255,${0.1 + 0.35 * a})`; ctx.fillRect(p.x - w / 2, tp.y, 1, p.base - tp.y);
        ctx.strokeStyle = "#17181b"; ctx.lineWidth = w * 0.8; ctx.beginPath(); ctx.moveTo(p.x, tp.y + 3); ctx.quadraticCurveTo(p.x, tp.y - 2, tp.x, tp.y - 2); ctx.stroke();
        // aro de luz na lateral do poste aceso
        if (a > 0.05) { ctx.fillStyle = `rgba(255,232,170,${0.55 * a})`; ctx.fillRect(p.x + (p.lado > 0 ? -w / 2 - 0.6 : w / 2), tp.y + 4, 0.8, (p.base - tp.y) * 0.8); }
        // a lâmpada
        ctx.fillStyle = a > 0.05 ? "#2a2823" : "#101113"; ctx.beginPath(); ctx.ellipse(tp.x, tp.y, 10 * p.prof, 4 * p.prof, 0, 0, 7); ctx.fill();
        if (a > 0.02) {
          ctx.globalCompositeOperation = "lighter"; const g = ctx.createRadialGradient(tp.x, tp.y + 3, 0, tp.x, tp.y + 3, S * 0.07); g.addColorStop(0, `rgba(255,236,180,${0.9 * a})`); g.addColorStop(1, "rgba(255,236,180,0)"); ctx.fillStyle = g; ctx.fillRect(tp.x - S * 0.08, tp.y - S * 0.08, S * 0.16, S * 0.16); ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = `rgba(255,246,214,${a})`; ctx.beginPath(); ctx.ellipse(tp.x, tp.y + 2 * p.prof, 7.5 * p.prof, 2.4 * p.prof, 0, 0, 7); ctx.fill();
        }
        // o nome da faixa, escrito no poste (lambe) e visível só com ele aceso
        if (a > 0.25) {
          ctx.save(); ctx.translate(p.x + (p.lado > 0 ? 8 : -3), tp.y + 20); ctx.rotate(Math.PI / 2); ctx.globalAlpha = clamp((a - 0.25) * 1.6);
          ctx.font = `${Math.max(10, Math.min(14, S / 28))}px ui-monospace, Menlo, monospace`; ctx.fillStyle = "#fff6dc"; ctx.textAlign = p.lado > 0 ? "left" : "left";
          let tx = nomes[k]; const max = (p.base - tp.y) * 0.9; while (tx.length > 3 && ctx.measureText(tx).width > max) tx = tx.slice(0, -2); if (tx !== nomes[k]) tx += "…";
          ctx.fillText(tx, 0, 0); ctx.restore();
        }
      });
      // o chão
      const ch = ctx.createLinearGradient(0, sy + S * 0.88, 0, sy + S); ch.addColorStop(0, "rgba(3,4,6,0)"); ch.addColorStop(1, "rgba(3,4,6,.9)"); ctx.fillStyle = ch; ctx.fillRect(sx, sy + S * 0.88, S, S * 0.12);
      env.cursor(perto >= 0 && ptr.ativo && dm < S * 0.06 ? "pointer" : "default"); lastPerto = perto; lastDm = dm;
    },
    clique() { if (ptr.ativo && lastPerto >= 0 && lastDm < S_ref() * 0.06) env.achou(); },
  };
  function S_ref() { return lay.S; }
}
let lastPerto = -1, lastDm = 1e9;

/* =============== Antes Que Vire Carniça: parado, apodrece e as moscas chegam; em movimento, se mantém =============== */
export function carnica(env) {
  const { ctx, lay, ptr, img } = env;
  let pts = [], m = 0, quieto = 0, aviso = false;
  const prep = () => {
    if (pts.length) return;
    const c = cria(300), g = c.getContext("2d"); g.drawImage(img, 0, 0, 300, 300);
    const d = g.getImageData(0, 0, 300, 300).data, rnd = semente(3), todos = [];
    for (let y = 0; y < 300; y += 2) for (let x = 0; x < 300; x += 2) { const k = (y * 300 + x) * 4; if (d[k] > 140 && d[k + 1] < 90 && d[k + 2] < 90) todos.push([x / 300, y / 300]); }
    pts = todos.map(([bx, by]) => ({ bx, by, th: rnd(), vx: (rnd() - 0.5) * 2, vy: -0.4 - rnd() * 1.6, f: rnd() * 6.28 }));
  };
  return {
    prep,
    quadro(t, dt) {
      const { sx, sy, S, dpr } = lay;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fundo(ctx, lay, "#070606");
      const parado = !ptr.ativo || ptr.v < 70;
      m = clamp(m + (parado ? dt * 0.1 : -dt * 0.75)); quieto = m > 0.92 ? quieto + dt : 0;
      if (quieto > 2.2 && !aviso) { aviso = true; env.achou(); }
      if (m < 0.2) aviso = false;
      const px = Math.max(1.3, S / 190);
      // o que ainda é corpo
      ctx.fillStyle = m > 0.5 ? "#d11d17" : "#ee1c14";
      for (const p of pts) { if (m <= p.th) ctx.fillRect(sx + p.bx * S + Math.sin(t * 3 + p.f) * m * 1.4, sy + p.by * S, px, px); }
      // o que se soltou: apodrece, escurece e sobe
      ctx.fillStyle = "#7d130f";
      for (const p of pts) {
        if (m > p.th) {
          const ts = (m - p.th) * 5; if (ts > 3.6) continue;
          ctx.globalAlpha = clamp(1 - ts / 3.6);
          ctx.fillRect(sx + p.bx * S + p.vx * ts * S * 0.05 + Math.sin(t * 2 + p.f) * ts * 3, sy + p.by * S + p.vy * ts * S * 0.045, px * 1.1, px * 1.1);
        }
      }
      ctx.globalAlpha = 1;
      // as moscas
      const nm = Math.floor(m * 110); ctx.fillStyle = "#cfc7b8";
      for (let i = 0; i < nm; i++) {
        const a = t * (0.8 + (i % 7) * 0.22) + i * 1.7, rx = S * (0.1 + (i % 9) * 0.04), ry = S * (0.12 + (i % 5) * 0.06);
        const x = sx + S * 0.5 + Math.cos(a * 1.3 + i) * rx + Math.sin(t * 9 + i) * 3, y = sy + S * 0.5 + Math.sin(a * 0.9) * ry + Math.cos(t * 11 + i * 2) * 3;
        ctx.globalAlpha = 0.9; ctx.fillRect(x, y, 2, 2); ctx.globalAlpha = 0.25; ctx.fillRect(x - 3, y - 1, 3, 1); ctx.fillRect(x + 2, y - 1, 3, 1);
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* =============== Mojica: a mão de unhas compridas arranha a tela por onde passa =============== */
export function mojica(env) {
  const { ctx, lay, ptr, img } = env;
  let ft, ar, comp = 0, prev = null, aviso = false;
  const prep = () => { const px = Math.round(lay.S * lay.dpr); ft = foto(img, px, "contrast(1.2) saturate(1.15) brightness(.95)", 52); if (!ar || ar.width !== px) { ar = cria(px); comp = 0; } };
  return {
    prep,
    quadro(t, dt) {
      const { sx, sy, S, dpr, w, h } = lay;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fundo(ctx, lay, "#060906");
      ctx.drawImage(ft, sx, sy, S, S);
      const a = ar.getContext("2d");
      if (ptr.ativo && dentro(lay, ptr.x, ptr.y)) {
        const cur = { x: ptr.x - sx, y: ptr.y - sy };
        if (prev && ptr.v > 30) {
          const dx = cur.x - prev.x, dy = cur.y - prev.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
          a.setTransform(dpr, 0, 0, dpr, 0, 0); a.lineCap = "round";
          for (let k = -2; k <= 2; k++) {
            const off = k * S * 0.022, j = (Math.random() - 0.5) * 1.2;
            a.strokeStyle = "rgba(0,0,0,.7)"; a.lineWidth = 5; a.beginPath(); a.moveTo(prev.x + nx * off + j, prev.y + ny * off); a.lineTo(cur.x + nx * off + j, cur.y + ny * off); a.stroke();
            a.strokeStyle = `rgba(232,246,228,${0.5 + Math.random() * 0.25})`; a.lineWidth = 2; a.beginPath(); a.moveTo(prev.x + nx * off - 0.8, prev.y + ny * off - 0.8); a.lineTo(cur.x + nx * off - 0.8, cur.y + ny * off - 0.8); a.stroke();
          }
          comp += len;
        }
        prev = cur;
      } else prev = null;
      ctx.drawImage(ar, sx, sy, S, S);
      if (comp > S * 9 && !aviso) { aviso = true; env.achou(); }
      // as unhas na ponta do cursor: crescem com a velocidade
      if (ptr.ativo) {
        const cresc = 0.05 + 0.1 * clamp(ptr.v / 900), L = S * cresc;
        for (let k = -2; k <= 2; k++) {
          const ang = -Math.PI / 2 + k * 0.17, bx = ptr.x + k * S * 0.012, by = ptr.y;
          ctx.save(); ctx.translate(bx, by); ctx.rotate(ang + Math.PI / 2);
          ctx.beginPath(); ctx.moveTo(-2.4, 0); ctx.quadraticCurveTo(-3.5, -L * 0.6, 3 + k * 2, -L); ctx.quadraticCurveTo(4, -L * 0.5, 2.4, 0); ctx.closePath();
          const ng = ctx.createLinearGradient(0, 0, 0, -L); ng.addColorStop(0, "#d7ceb0"); ng.addColorStop(1, "#8d8350");
          ctx.fillStyle = ng; ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
        }
      }
    },
  };
}

/* =============== Cor de Deus Quando Foge: a cor escorre de onde o cursor passa e some =============== */
export function cor(env) {
  const { ctx, lay, ptr, img } = env;
  let cinza, viva, mask, mc, gotas = [], prev = null, aviso = false, tcheck = 0;
  const prep = () => {
    const px = Math.round(lay.S * lay.dpr);
    cinza = foto(img, px, "grayscale(1) contrast(1.15) brightness(.92)", 30); viva = foto(img, px, "saturate(1.15)", 30);
    mask = cria(px); mask.getContext("2d").drawImage(viva, 0, 0); mc = cria(40);
  };
  return {
    prep,
    quadro(t, dt) {
      const { sx, sy, S, dpr, w, h } = lay, m = mask.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fundo(ctx, lay, "#14120d");
      // a cor volta devagar para o lugar
      m.globalCompositeOperation = "source-over"; m.globalAlpha = 0.0018; m.drawImage(viva, 0, 0); m.globalAlpha = 1;
      m.globalCompositeOperation = "destination-out";
      if (ptr.ativo && dentro(lay, ptr.x, ptr.y)) {
        const cx = (ptr.x - sx) * dpr, cy = (ptr.y - sy) * dpr, r = S * 0.07 * dpr;
        const from = prev || { x: cx, y: cy }, n = Math.max(1, Math.ceil(Math.hypot(cx - from.x, cy - from.y) / (r * 0.35)));
        for (let i = 1; i <= n; i++) {
          const x = from.x + ((cx - from.x) * i) / n, y = from.y + ((cy - from.y) * i) / n, g = m.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)"); m.fillStyle = g; m.fillRect(x - r, y - r, r * 2, r * 2);
        }
        if (Math.random() < 0.18 + ptr.v / 2500 && gotas.length < 70) gotas.push({ x: ptr.x + (Math.random() - 0.5) * S * 0.08, y: ptr.y, y0: ptr.y, w: S * (0.004 + Math.random() * 0.01), v: S * (0.12 + Math.random() * 0.4) });
        prev = { x: cx, y: cy };
      } else prev = null;
      // as gotas levam a cor para baixo e a apagam no caminho
      for (let i = gotas.length - 1; i >= 0; i--) {
        const g = gotas[i], yAnt = g.y; g.y += g.v * dt; g.v += S * 0.25 * dt;
        if (g.y < sy + S) { m.fillStyle = "#000"; m.fillRect((g.x - sx - g.w / 2) * dpr, (yAnt - sy) * dpr, g.w * dpr, (g.y - yAnt + 1) * dpr); }
        if (g.y > lay.h + 30) gotas.splice(i, 1);
      }
      m.globalCompositeOperation = "source-over";
      ctx.drawImage(cinza, sx, sy, S, S); ctx.drawImage(mask, sx, sy, S, S);
      for (const g of gotas) {
        const gr = ctx.createLinearGradient(0, g.y0, 0, g.y); gr.addColorStop(0, "rgba(225,38,30,0)"); gr.addColorStop(0.4, "rgba(225,38,30,.8)"); gr.addColorStop(1, "rgba(225,38,30,1)");
        ctx.strokeStyle = gr; ctx.lineWidth = g.w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(g.x, g.y0); ctx.lineTo(g.x, g.y); ctx.stroke();
        ctx.fillStyle = "#e1261e"; ctx.beginPath(); ctx.arc(g.x, g.y, g.w * 0.9, 0, 7); ctx.fill();
      }
      if ((tcheck += dt) > 0.5) {
        tcheck = 0; const c = mc.getContext("2d"); c.clearRect(0, 0, 40, 40); c.drawImage(mask, 0, 0, 40, 40);
        const d = c.getImageData(0, 0, 40, 40).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 90) n++;
        if (n / 1600 > 0.3 && !aviso) { aviso = true; env.achou(); } else if (n / 1600 < 0.1) aviso = false;
      }
    },
  };
}

/* =============== Uma Mão Lava a Outra: duas mãos limpam a capa ao mesmo tempo (a outra é o espelho da sua) =============== */
export function mao(env) {
  const { ctx, lay, ptr, img } = env;
  let ft, suj, mc, bolhas = [], prev = null, aviso = false, tcheck = 0;
  const prep = () => {
    const px = Math.round(lay.S * lay.dpr); ft = foto(img, px, "contrast(1.3) brightness(1.1)", 34);
    suj = cria(px); const g = suj.getContext("2d"), rnd = semente(11);
    g.fillStyle = "#b9b2a3"; g.fillRect(0, 0, px, px);
    for (let i = 0; i < 160; i++) { const x = rnd() * px, y = rnd() * px, r = px * (0.03 + rnd() * 0.11), c = rnd() < 0.5 ? "#8c8576" : "#d8d2c3", gg = g.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, c + "bb"); gg.addColorStop(1, c + "00"); g.fillStyle = gg; g.fillRect(x - r, y - r, r * 2, r * 2); }
    g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.5; g.fillStyle = g.createPattern(textura(), "repeat"); g.fillRect(0, 0, px, px); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    mc = cria(48);
  };
  const lava = (m, x, y, r) => { const g = m.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.6, "rgba(0,0,0,.8)"); g.addColorStop(1, "rgba(0,0,0,0)"); m.fillStyle = g; m.fillRect(x - r, y - r, r * 2, r * 2); };
  return {
    prep,
    quadro(t, dt) {
      const { sx, sy, S, dpr, w, h } = lay, m = suj.getContext("2d"), cx = sx + S / 2, cy = sy + S / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fundo(ctx, lay, "#0b0b0b");
      m.globalCompositeOperation = "destination-out";
      if (ptr.ativo && dentro(lay, ptr.x, ptr.y, S * 0.1)) {
        const r = S * 0.075 * dpr, from = prev || { x: ptr.x, y: ptr.y }, n = Math.max(1, Math.ceil(Math.hypot(ptr.x - from.x, ptr.y - from.y) * dpr / (r * 0.4)));
        for (let i = 1; i <= n; i++) {
          const x = from.x + ((ptr.x - from.x) * i) / n, y = from.y + ((ptr.y - from.y) * i) / n;
          lava(m, (x - sx) * dpr, (y - sy) * dpr, r); lava(m, (2 * cx - x - sx) * dpr, (2 * cy - y - sy) * dpr, r);
        }
        if (ptr.v > 40) for (let k = 0; k < 2 && bolhas.length < 140; k++) { const e = Math.random() < 0.5; bolhas.push({ x: (e ? 2 * cx - ptr.x : ptr.x) + (Math.random() - 0.5) * S * 0.08, y: (e ? 2 * cy - ptr.y : ptr.y) + (Math.random() - 0.5) * S * 0.08, r: 2 + Math.random() * 9, vy: -(8 + Math.random() * 22), vida: 1 }); }
        prev = { x: ptr.x, y: ptr.y };
      } else prev = null;
      m.globalCompositeOperation = "source-over";
      ctx.drawImage(ft, sx, sy, S, S); ctx.drawImage(suj, sx, sy, S, S);
      // espuma
      for (let i = bolhas.length - 1; i >= 0; i--) {
        const b = bolhas[i]; b.y += b.vy * dt; b.vida -= dt * 0.55; if (b.vida <= 0) { bolhas.splice(i, 1); continue; }
        ctx.globalAlpha = clamp(b.vida * 1.4); ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, Math.max(0.6, b.r * 0.18), 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      }
      if (ptr.ativo) { ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1; [[ptr.x, ptr.y], [2 * cx - ptr.x, 2 * cy - ptr.y]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, S * 0.03, 0, 7); ctx.stroke(); }); }
      if ((tcheck += dt) > 0.5) {
        tcheck = 0; const c = mc.getContext("2d"); c.clearRect(0, 0, 48, 48); c.drawImage(suj, 0, 0, 48, 48);
        const d = c.getImageData(0, 0, 48, 48).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 100) n++;
        if (n / 2304 > 0.55 && !aviso) { aviso = true; env.achou(); }
      }
    },
  };
}

/* =============== arquivo: os discos mais antigos, só a capa no palco =============== */
export function quieta(env) {
  const { ctx, lay, ptr, img } = env;
  let bg, ft;
  return {
    prep() { const px = Math.round(lay.S * lay.dpr); ft = foto(img, px, "contrast(1.1)", 40); },
    quadro() {
      const { sx, sy, S, dpr, w, h } = lay; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fundo(ctx, lay, "#0b0b0b");
      const dx = ptr.ativo ? (ptr.x - w / 2) / w : 0, dy = ptr.ativo ? (ptr.y - h / 2) / h : 0;
      ctx.save(); ctx.translate(sx + S / 2 + dx * 14, sy + S / 2 + dy * 10); ctx.rotate(dx * 0.015);
      ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.drawImage(ft, -S * 0.4, -S * 0.4, S * 0.8, S * 0.8); ctx.restore();
    },
  };
}

export const PECAS = { "muita-ostra": ostras, sereno, "antes-carnica": carnica, mojica, "cor-de-deus": cor, "uma-mao": mao };
