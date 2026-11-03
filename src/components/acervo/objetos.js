// Objetos reativos das capas do Lessa Gustavo: cada um transforma a própria capa num objeto que responde ao cursor ou ao toque.
// Contrato: objeto(env) -> { prep(), quadro(t, dt), clique?() }
//   env = { ctx, lay: { w, h, dpr, sx, sy, S }, ptr: { x, y, ativo }, img, cursor(c), achou(), luz(0..1) }
// A capa ocupa o canvas inteiro (S = lado em px CSS). As ostras vêm da peça aprovada (lessaPecas.js).
import { ostras } from "@/components/sala/lessaPecas";

const cria = (w, h = w) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ===== Almojanta: doze interruptores. Cada clique vira a placa e acende uma luz quente; a luz da página acompanha ===== */
const PLACAS = (() => { const xs = [38, 280, 546, 800], ys = [26, 358, 692], r = []; ys.forEach((y) => xs.forEach((x) => r.push({ x, y, w: 166, h: 282 }))); return r; })();
function almojanta(env) {
  const { ctx, lay, ptr, img } = env, est = PLACAS.map(() => ({ v: 0, alvo: 0 }));
  let U = 1, achou = false;
  const sobre = (x, y) => PLACAS.findIndex((c) => x >= c.x * U && x <= (c.x + c.w) * U && y >= c.y * U && y <= (c.y + c.h) * U);
  return {
    prep() { U = lay.S / 1000; },
    quadro(t, dt) {
      const S = lay.S, h = sobre(ptr.x, ptr.y);
      ctx.setTransform(lay.dpr, 0, 0, lay.dpr, 0, 0); ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, 0, 0, S, S);
      env.cursor(h >= 0 ? "pointer" : "default");
      PLACAS.forEach((c, i) => {
        const e = est[i]; e.v += (e.alvo - e.v) * (1 - Math.exp(-dt * 9));
        if (Math.abs(e.alvo - e.v) < 0.002) e.v = e.alvo;
        if (e.v > 0.001) {
          const x = c.x * U, y = c.y * U, w = c.w * U, hh = c.h * U;
          ctx.save(); ctx.fillStyle = "#fefefe"; ctx.fillRect(x, y, w, hh);
          ctx.translate(x + w / 2, y + hh / 2); ctx.scale(1, Math.cos(Math.PI * e.v));
          ctx.drawImage(img, c.x, c.y, c.w, c.h, -w / 2, -hh / 2, w, hh); ctx.restore();
        }
      });
      // a luz quente em volta de cada placa acesa (multiplica sobre o papel branco)
      ctx.globalCompositeOperation = "multiply";
      PLACAS.forEach((c, i) => {
        const a = Math.max(est[i].v, h === i ? 0.16 : 0); if (a < 0.01) return;
        const cx = (c.x + c.w / 2) * U, cy = (c.y + c.h / 2) * U, r = Math.max(c.w, c.h) * U * 0.95;
        const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r); g.addColorStop(0, `rgba(255,190,70,${0.9 * a})`); g.addColorStop(1, "rgba(255,190,70,0)");
        ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      });
      ctx.globalCompositeOperation = "source-over";
    },
    clique() {
      const i = sobre(ptr.x, ptr.y); if (i < 0) return;
      est[i].alvo = est[i].alvo ? 0 : 1;
      const n = est.filter((e) => e.alvo).length; env.luz(n / PLACAS.length);
      if (n === PLACAS.length && !achou) { achou = true; env.achou(); }
    },
  };
}

/* ===== Catarina: a radiografia no escuro; uma lanterna passeia (ou segue o cursor) e revela o que está por dentro ===== */
function catarina(env) {
  const { ctx, lay, ptr, img } = env;
  let escuro, claro, cg, px = 1, lx = 0, ly = 0, pronto = false;
  return {
    prep() {
      px = Math.round(lay.S * lay.dpr); escuro = cria(px); claro = cria(px); cg = claro.getContext("2d");
      const g = escuro.getContext("2d"); g.filter = "brightness(.14) saturate(.5)"; g.drawImage(img, 0, 0, px, px);
      if (!pronto) { lx = lay.S / 2; ly = lay.S / 2; pronto = true; }
    },
    quadro(t, dt) {
      const S = lay.S, k = 1 - Math.exp(-dt * 7);
      const ax = ptr.ativo ? ptr.x : S * (0.5 + 0.3 * Math.sin(t * 0.45)), ay = ptr.ativo ? ptr.y : S * (0.5 + 0.38 * Math.sin(t * 0.31 + 1));
      lx += (ax - lx) * k; ly += (ay - ly) * k;
      const R = S * 0.24 * (1 + 0.025 * Math.sin(t * 23) * Math.sin(t * 3.1));
      cg.globalCompositeOperation = "source-over"; cg.clearRect(0, 0, px, px);
      cg.filter = "brightness(1.35) contrast(1.15)"; cg.drawImage(img, 0, 0, px, px); cg.filter = "none";
      cg.globalCompositeOperation = "destination-in";
      const c = lx * lay.dpr, d = ly * lay.dpr, r = R * lay.dpr, g = cg.createRadialGradient(c, d, r * 0.12, c, d, r);
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.55, "rgba(0,0,0,.85)"); g.addColorStop(1, "rgba(0,0,0,0)");
      cg.fillStyle = g; cg.fillRect(0, 0, px, px);
      ctx.setTransform(lay.dpr, 0, 0, lay.dpr, 0, 0); ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(escuro, 0, 0, S, S); ctx.drawImage(claro, 0, 0, S, S);
      ctx.globalCompositeOperation = "screen";
      const h = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 1.1); h.addColorStop(0, "rgba(120,200,255,.16)"); h.addColorStop(1, "rgba(120,200,255,0)");
      ctx.fillStyle = h; ctx.fillRect(0, 0, S, S); ctx.globalCompositeOperation = "source-over";
    },
  };
}

/* ===== Agora: a constelação. Passar o cursor de estrela em estrela risca a linha entre elas, e ela some devagar ===== */
const ESTRELAS = [[0.628, 0.736], [0.724, 0.768], [0.592, 0.812], [0.78, 0.868], [0.804, 0.648], [0.564, 0.772], [0.508, 0.812], [0.516, 0.68], [0.712, 0.808], [0.852, 0.916], [0.624, 0.86], [0.8, 0.896], [0.724, 0.84], [0.752, 0.792], [0.792, 0.712], [0.896, 0.86], [0.904, 0.816], [0.852, 0.868], [0.536, 0.788], [0.94, 0.816], [0.724, 0.924], [0.588, 0.844]];
function agora(env) {
  const { ctx, lay, ptr, img } = env;
  let arestas = [], ultimo = -1, achou = false;
  return {
    prep() {},
    quadro(t) {
      const S = lay.S;
      ctx.setTransform(lay.dpr, 0, 0, lay.dpr, 0, 0); ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, 0, 0, S, S);
      let perto = -1, dm = 1e9;
      ESTRELAS.forEach((s, i) => { const d = Math.hypot(ptr.x - s[0] * S, ptr.y - s[1] * S); if (d < dm) { dm = d; perto = i; } });
      if (ptr.ativo && dm < S * 0.055) {
        if (perto !== ultimo) { if (ultimo >= 0 && !arestas.some((a) => (a.a === ultimo && a.b === perto) || (a.b === ultimo && a.a === perto))) arestas.push({ a: ultimo, b: perto, t0: t }); ultimo = perto; if (arestas.length > 34) arestas.shift(); }
      }
      if (!ptr.ativo) ultimo = -1;
      if (arestas.length >= 10 && !achou) { achou = true; env.achou(); }
      arestas = arestas.filter((a) => t - a.t0 < 16);
      ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
      arestas.forEach((a) => {
        const A = ESTRELAS[a.a], B = ESTRELAS[a.b], idade = t - a.t0, al = clamp(idade / 0.4) * clamp((16 - idade) / 6);
        ctx.strokeStyle = `rgba(190,200,255,${0.8 * al})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(A[0] * S, A[1] * S); ctx.lineTo(B[0] * S + (A[0] - B[0]) * S * (1 - clamp(idade / 0.4)), B[1] * S + (A[1] - B[1]) * S * (1 - clamp(idade / 0.4))); ctx.stroke();
      });
      ESTRELAS.forEach((s, i) => {
        const x = s[0] * S, y = s[1] * S, d = Math.hypot(ptr.x - x, ptr.y - y), prox = ptr.ativo ? clamp(1 - d / (S * 0.2)) : 0;
        const r = S * (0.012 + 0.028 * prox + 0.004 * Math.sin(t * 2 + i * 1.7)), al = 0.35 + 0.55 * prox + (i === ultimo ? 0.3 : 0);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(235,238,255,${al})`); g.addColorStop(1, "rgba(150,160,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
      env.cursor(ptr.ativo && dm < S * 0.055 ? "pointer" : "crosshair");
    },
  };
}

/* ===== Radar de um Filme Sujo: um feixe varre a rua e só ilumina o que ele passa ===== */
function radar(env) {
  const { ctx, lay, ptr, img } = env;
  let escuro, claro, cg, px = 1, cx = 0, cy = 0, ini = false;
  return {
    prep() {
      px = Math.round(lay.S * lay.dpr); escuro = cria(px); claro = cria(px); cg = claro.getContext("2d");
      const g = escuro.getContext("2d"); g.filter = "brightness(.38) contrast(1.05) saturate(.7)"; g.drawImage(img, 0, 0, px, px);
      if (!ini) { cx = lay.S * 0.5; cy = lay.S * 0.58; ini = true; }
    },
    quadro(t, dt) {
      const S = lay.S, k = 1 - Math.exp(-dt * 4), a = (t * 1.05) % (Math.PI * 2);
      const tx = ptr.ativo ? ptr.x : lay.S * 0.5, ty = ptr.ativo ? ptr.y : lay.S * 0.58;
      cx += (tx - cx) * k; cy += (ty - cy) * k;
      ctx.setTransform(lay.dpr, 0, 0, lay.dpr, 0, 0); ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(escuro, 0, 0, S, S);
      if (cg.createConicGradient) {
        cg.globalCompositeOperation = "source-over"; cg.clearRect(0, 0, px, px); cg.filter = "brightness(1.12) contrast(1.05)"; cg.drawImage(img, 0, 0, px, px); cg.filter = "none";
        cg.globalCompositeOperation = "destination-in";
        const g = cg.createConicGradient(a, cx * lay.dpr, cy * lay.dpr);
        g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.7, "rgba(0,0,0,0)"); g.addColorStop(0.995, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
        cg.fillStyle = g; cg.fillRect(0, 0, px, px); ctx.drawImage(claro, 0, 0, S, S);
      } else ctx.drawImage(img, 0, 0, S, S);
      const R = S * 1.2, ex = cx + Math.cos(a) * R, ey = cy + Math.sin(a) * R;
      ctx.strokeStyle = "rgba(150,255,170,.55)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = "rgba(150,255,170,.16)"; ctx.lineWidth = 1;
      [0.18, 0.36, 0.54].forEach((f) => { ctx.beginPath(); ctx.arc(cx, cy, S * f, 0, 7); ctx.stroke(); });
      ctx.fillStyle = "rgba(150,255,170,.9)"; ctx.beginPath(); ctx.arc(cx, cy, 2.4, 0, 7); ctx.fill();
    },
  };
}

// as ostras: a peça aprovada, rodando no quadrado da capa
function ostrasCapa(env) {
  const o = ostras({ ...env, obra: {} });
  return o;
}

export const OBJETOS = { "muita-ostra": ostrasCapa, almojanta, catarina, agora, "radar-filme-sujo": radar };
