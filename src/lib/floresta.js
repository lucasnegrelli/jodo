// Desenho procedural da mata amazônica em 4 camadas de profundidade (silhuetas), para o parallax da página do Vicente Blow.
// Tudo em canvas 2D, com semente fixa (a mata é sempre a mesma). Camada 0 = fundo, 3 = primeiro plano.
export const LARG = 2600;
export const ALT = 1400;

const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const copa = (c, x, y, r, rnd, cor, achata = 0.75, n = 9) => {
  c.fillStyle = cor;
  for (let k = 0; k < n; k++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * r * 0.8;
    const rr = r * (0.34 + rnd() * 0.42);
    c.beginPath();
    c.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * achata, rr, rr * (achata + 0.1), 0, 0, Math.PI * 2);
    c.fill();
  }
};

const tronco = (c, x, yBase, yTopo, wBase, wTopo, rnd, cor, raizes = true) => {
  c.fillStyle = cor;
  const passos = 22;
  const esq = [], dir = [];
  for (let i = 0; i <= passos; i++) {
    const t = i / passos;
    const y = yBase + (yTopo - yBase) * t;
    const w = (wBase + (wTopo - wBase) * t) / 2;
    const bal = (rnd() - 0.5) * 7 + Math.sin(t * 6 + x) * 5;
    esq.push([x - w + bal, y]);
    dir.push([x + w + bal * 0.6, y]);
  }
  c.beginPath();
  c.moveTo(esq[0][0], esq[0][1]);
  esq.forEach(([a, b]) => c.lineTo(a, b));
  for (let i = dir.length - 1; i >= 0; i--) c.lineTo(dir[i][0], dir[i][1]);
  c.closePath();
  c.fill();
  if (raizes) {
    // sapopemas: raízes tabulares abrindo na base
    for (const lado of [-1, 1]) {
      for (let k = 0; k < 2; k++) {
        const aberto = wBase * (0.9 + rnd() * 1.1) * (k ? 0.7 : 1);
        c.beginPath();
        c.moveTo(x + lado * wBase * 0.35, yBase - wBase * (2.4 + rnd() * 1.6));
        c.quadraticCurveTo(x + lado * wBase * 0.45, yBase - wBase * 0.8, x + lado * aberto, yBase + 20);
        c.lineTo(x + lado * wBase * 0.1, yBase + 20);
        c.closePath();
        c.fill();
      }
    }
  }
};

const cipo = (c, x0, y0, comp, rnd, cor, esp) => {
  c.strokeStyle = cor;
  c.lineWidth = esp;
  c.lineCap = "round";
  const dx = (rnd() - 0.5) * 160;
  c.beginPath();
  c.moveTo(x0, y0);
  c.bezierCurveTo(x0 + dx, y0 + comp * 0.35, x0 - dx * 0.7, y0 + comp * 0.7, x0 + dx * 0.3, y0 + comp);
  c.stroke();
  // folhinhas ao longo do cipó
  c.fillStyle = cor;
  for (let k = 0; k < 7; k++) {
    const t = 0.2 + k * 0.11;
    const px = x0 + dx * (t * (1 - t) * 3) * (k % 2 ? 1 : -0.7);
    const py = y0 + comp * t;
    c.beginPath();
    c.ellipse(px + (k % 2 ? 10 : -10), py, 12 + rnd() * 10, 4 + rnd() * 3, (k % 2 ? 0.5 : -0.5), 0, Math.PI * 2);
    c.fill();
  }
};

const palmeira = (c, x, yBase, altura, rnd, cor) => {
  const curva = (rnd() - 0.5) * 180;
  c.strokeStyle = cor;
  c.lineWidth = 12;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x, yBase);
  c.quadraticCurveTo(x + curva * 0.2, yBase - altura * 0.55, x + curva, yBase - altura);
  c.stroke();
  const tx = x + curva, ty = yBase - altura;
  c.fillStyle = cor;
  for (let k = 0; k < 11; k++) {
    const a = -Math.PI + (k / 10) * Math.PI + (rnd() - 0.5) * 0.25;
    const comp = 150 + rnd() * 110;
    const ex = tx + Math.cos(a) * comp, ey = ty + Math.sin(a) * comp * 0.7 + comp * 0.35;
    const cx = tx + Math.cos(a) * comp * 0.5, cy = ty + Math.sin(a) * comp * 0.7 - 30;
    c.beginPath();
    c.moveTo(tx, ty);
    c.quadraticCurveTo(cx, cy - 8, ex, ey);
    c.quadraticCurveTo(cx, cy + 10, tx, ty);
    c.fill();
  }
};

const folhaGrande = (c, x, y, ang, comp, larg, cor, nervura) => {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  c.fillStyle = cor;
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(comp * 0.2, -larg, comp * 0.7, -larg * 0.9, comp, 0);
  c.bezierCurveTo(comp * 0.7, larg * 0.9, comp * 0.2, larg, 0, 0);
  c.fill();
  c.strokeStyle = nervura;
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(comp * 0.96, 0);
  c.stroke();
  c.restore();
};

export function desenhaCamada(canvas, i) {
  const c = canvas.getContext("2d");
  canvas.width = LARG;
  canvas.height = ALT;
  c.clearRect(0, 0, LARG, ALT);
  const rnd = rng(7 + i * 131);

  if (i === 0) {
    // fundo: copas distantes, azul-esverdeadas, e o rio na base
    for (let pass = 0; pass < 2; pass++) {
      const cor = pass ? "rgb(18,58,48)" : "rgb(30,78,70)";
      for (let x = -120; x < LARG + 120; x += 70) {
        const y = ALT * (0.5 + pass * 0.05) + Math.sin(x * 0.004 + pass) * 70 + rnd() * 50;
        copa(c, x, y, 90 + rnd() * 90, rnd, cor, 0.7, 7);
      }
      c.fillStyle = cor;
      c.fillRect(0, ALT * (0.62 + pass * 0.04), LARG, ALT);
    }
    const rio = c.createLinearGradient(0, ALT * 0.84, 0, ALT * 0.96);
    rio.addColorStop(0, "rgba(120,170,150,0.55)");
    rio.addColorStop(1, "rgba(20,60,55,0.95)");
    c.fillStyle = rio;
    c.beginPath();
    c.moveTo(0, ALT * 0.85);
    for (let x = 0; x <= LARG; x += 130) c.lineTo(x, ALT * 0.85 + Math.sin(x * 0.01) * 6);
    c.lineTo(LARG, ALT);
    c.lineTo(0, ALT);
    c.closePath();
    c.fill();
    for (let k = 0; k < 40; k++) {
      c.fillStyle = "rgba(220,240,225,0.18)";
      c.fillRect(rnd() * LARG, ALT * (0.86 + rnd() * 0.09), 60 + rnd() * 160, 3);
    }
    const nev = c.createLinearGradient(0, ALT * 0.35, 0, ALT * 0.7);
    nev.addColorStop(0, "rgba(180,210,190,0)");
    nev.addColorStop(1, "rgba(180,210,190,0.28)");
    c.fillStyle = nev;
    c.fillRect(0, ALT * 0.35, LARG, ALT * 0.4);
  }

  if (i === 1) {
    // plano médio: árvores emergentes, palmeiras
    const cor = "rgb(8,34,26)";
    for (let k = 0; k < 15; k++) {
      const x = (k + 0.2 + rnd() * 0.6) * (LARG / 15);
      const topo = ALT * (0.16 + rnd() * 0.3);
      tronco(c, x, ALT * 0.98, topo, 22 + rnd() * 14, 9 + rnd() * 5, rnd, cor, false);
      copa(c, x, topo, 100 + rnd() * 70, rnd, cor, 0.5, 11);
    }
    for (let k = 0; k < 7; k++) palmeira(c, (k + 0.4 + rnd() * 0.3) * (LARG / 7), ALT * 0.96, 280 + rnd() * 240, rnd, cor);
    c.fillStyle = cor;
    c.fillRect(0, ALT * 0.93, LARG, ALT);
  }

  if (i === 2) {
    // plano próximo: troncos grossos, sapopemas, cipós
    const cor = "rgb(3,15,10)";
    const xs = [0.05, 0.2, 0.37, 0.58, 0.74, 0.93];
    xs.forEach((f, k) => {
      const x = f * LARG + (rnd() - 0.5) * 80;
      tronco(c, x, ALT * 1.02, -80, 110 + rnd() * 90, 60 + rnd() * 40, rnd, cor, true);
    });
    for (let k = 0; k < 16; k++) cipo(c, rnd() * LARG, -20, ALT * (0.35 + rnd() * 0.5), rnd, cor, 3 + rnd() * 5);
    // trepadeiras de folhas largas no topo
    for (let k = 0; k < 9; k++) folhaGrande(c, rnd() * LARG, -10, Math.PI / 2 + (rnd() - 0.5) * 0.9, 240 + rnd() * 280, 40 + rnd() * 40, cor, "rgba(30,60,45,0.5)");
    c.fillStyle = cor;
    c.fillRect(0, ALT * 0.96, LARG, ALT);
  }

  if (i === 3) {
    // primeiro plano: folhas gigantes (helicônia, bananeira) nos cantos
    const cor = "rgb(1,8,5)";
    const nerv = "rgba(40,90,60,0.35)";
    for (let k = 0; k < 9; k++) folhaGrande(c, 0, ALT, -0.35 - k * 0.19 + (rnd() - 0.5) * 0.1, 700 + rnd() * 500, 90 + rnd() * 90, cor, nerv);
    for (let k = 0; k < 9; k++) folhaGrande(c, LARG, ALT, Math.PI + 0.35 + k * 0.19 + (rnd() - 0.5) * 0.1, 700 + rnd() * 500, 90 + rnd() * 90, cor, nerv);
    for (let k = 0; k < 5; k++) folhaGrande(c, 0, 0, 0.35 + k * 0.22, 420 + rnd() * 320, 60 + rnd() * 60, cor, nerv);
    for (let k = 0; k < 5; k++) folhaGrande(c, LARG, 0, Math.PI - 0.35 - k * 0.22, 420 + rnd() * 320, 60 + rnd() * 60, cor, nerv);
  }
}
