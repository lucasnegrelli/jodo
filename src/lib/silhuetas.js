// Silhuetas de perfil dos bichos do censo, desenhadas em canvas 2D (virada para a direita) e depois amostradas em pontos.
// Cada silhueta tem `w` (largura em unidades do mundo) e uma ou duas poses (asas para cima / para baixo).
const C = 200, A = 100; // área de desenho: 200 x 100

const el = (g, cx, cy, rx, ry, rot = 0) => {
  g.beginPath();
  g.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  g.fill();
};
const pl = (g, pts) => {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fill();
};
const ln = (g, pts, w) => {
  g.lineWidth = w;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.stroke();
};
const furo = (g, fn) => {
  g.save();
  g.globalCompositeOperation = "destination-out";
  fn();
  g.restore();
};
const patas = (g, xs, y0, y1, w) => xs.forEach((x) => ln(g, [[x, y0], [x + (y1 > y0 ? 1 : -1), y1]], w));

export const SIL = {
  onca: { w: 12, d: (g) => {
    el(g, 95, 50, 56, 19); el(g, 150, 38, 15, 13); pl(g, [[140, 27], [144, 16], [152, 26]]); pl(g, [[152, 26], [160, 16], [162, 28]]);
    el(g, 166, 44, 9, 6); pl(g, [[120, 44], [142, 34], [142, 52]]);
    patas(g, [128, 140, 62, 52], 58, 93, 9);
    ln(g, [[42, 44], [22, 32], [10, 40], [12, 56]], 7);
    furo(g, () => [[80, 44], [96, 50], [110, 42], [70, 56], [118, 56], [88, 58], [60, 46]].forEach(([x, y]) => el(g, x, y, 4, 3)));
  } },
  anta: { w: 13, d: (g) => {
    el(g, 98, 46, 54, 27); el(g, 150, 40, 14, 16, -0.3); pl(g, [[150, 34], [186, 50], [190, 62], [172, 64], [148, 58]]); el(g, 188, 57, 9, 6);
    pl(g, [[142, 22], [150, 12], [154, 26]]); el(g, 34, 46, 8, 6);
    patas(g, [122, 134, 72, 62], 66, 94, 10);
  } },
  capivara: { w: 8, d: (g) => {
    el(g, 92, 56, 50, 26); el(g, 148, 50, 20, 17); pl(g, [[150, 34], [172, 40], [174, 62], [150, 68]]); pl(g, [[138, 32], [142, 22], [148, 33]]);
    patas(g, [118, 130, 66, 54], 68, 94, 10);
  } },
  tamandua: { w: 14, d: (g) => {
    el(g, 90, 52, 42, 19); el(g, 128, 46, 11, 9);
    ln(g, [[134, 46], [190, 66]], 7); el(g, 60, 36, 32, 14, -0.55); pl(g, [[62, 46], [4, 12], [0, 56], [40, 62]]);
    patas(g, [110, 122, 66, 78], 62, 93, 8);
  } },
  guariba: { w: 7, d: (g) => {
    el(g, 90, 52, 20, 28, -0.15); el(g, 96, 20, 13, 13); el(g, 106, 24, 8, 6); pl(g, [[86, 8], [96, 2], [104, 10]]);
    ln(g, [[84, 40], [60, 26]], 7); ln(g, [[100, 44], [122, 34]], 7); ln(g, [[78, 76], [66, 96]], 8); ln(g, [[100, 76], [112, 96]], 8);
    ln(g, [[84, 72], [58, 88], [34, 80], [30, 56], [46, 46]], 6);
  } },
  preguica: { w: 14, d: (g) => {
    ln(g, [[10, 10], [190, 12]], 6); el(g, 100, 40, 38, 20); el(g, 150, 52, 11, 11);
    ln(g, [[82, 30], [70, 12]], 8); ln(g, [[126, 30], [140, 12]], 8); ln(g, [[100, 56], [96, 74]], 8); ln(g, [[118, 54], [124, 74]], 8);
    furo(g, () => { el(g, 152, 50, 3, 3); el(g, 146, 56, 2, 2); });
  } },
  harpia: { w: 15, poses: 2, d: (g, p) => {
    const y = p ? 12 : 0;
    el(g, 100, 58, 11, 24); el(g, 100, 30, 8, 8); pl(g, [[94, 26], [86, 14], [98, 22]]); pl(g, [[106, 26], [114, 14], [102, 22]]); pl(g, [[104, 32], [114, 38], [104, 38]]);
    pl(g, [[91, 48], [50, 30 + y], [6, 36 + y * 1.4], [28, 46 + y], [8, 56 + y], [42, 58], [72, 68], [92, 66]]);
    pl(g, [[109, 48], [150, 30 + y], [194, 36 + y * 1.4], [172, 46 + y], [192, 56 + y], [158, 58], [128, 68], [108, 66]]);
    pl(g, [[90, 78], [110, 78], [114, 98], [86, 98]]);
  } },
  arara: { w: 10, poses: 2, d: (g, p) => {
    el(g, 100, 52, 24, 9, 0.12); el(g, 128, 44, 9, 9); pl(g, [[134, 40], [144, 46], [140, 54], [132, 50]]);
    pl(g, [[80, 52], [8, 70], [14, 62], [80, 46]]);
    if (!p) pl(g, [[92, 46], [58, 8], [84, 4], [112, 40]]);
    else pl(g, [[92, 56], [62, 94], [92, 94], [114, 58]]);
    furo(g, () => el(g, 128, 42, 2, 2));
  } },
  tucano: { w: 11, d: (g) => {
    ln(g, [[10, 84], [150, 80]], 5); el(g, 64, 58, 28, 16, -0.2); el(g, 106, 42, 12, 12);
    pl(g, [[112, 34], [184, 44], [182, 56], [150, 62], [112, 54]]); ln(g, [[40, 68], [8, 82]], 8); ln(g, [[70, 72], [70, 82]], 4); ln(g, [[84, 70], [86, 82]], 4);
    furo(g, () => el(g, 108, 40, 2, 2));
  } },
  morcego: { w: 9, poses: 2, d: (g, p) => {
    const L = p ? [[94, 50], [66, 70], [34, 92], [54, 74], [24, 76], [50, 64], [36, 60], [64, 58], [94, 62]] : [[94, 46], [70, 10], [40, 4], [52, 22], [26, 22], [48, 36], [34, 46], [64, 46], [94, 58]];
    el(g, 100, 54, 7, 14); pl(g, [[95, 42], [92, 28], [100, 38]]); pl(g, [[105, 42], [108, 28], [100, 38]]);
    pl(g, L); pl(g, L.map(([x, y]) => [200 - x, y]));
  } },
  morpho: { w: 5.5, poses: 2, d: (g, p) => {
    const k = p ? 0.55 : 1;
    g.save(); g.translate(100, 50); g.scale(k, 1);
    el(g, -34, -10, 36, 22, -0.45); el(g, -30, 20, 24, 15, 0.3); el(g, 34, -10, 36, 22, 0.45); el(g, 30, 20, 24, 15, -0.3);
    g.restore();
    ln(g, [[100, 28], [100, 74]], 4); ln(g, [[100, 28], [90, 12]], 2); ln(g, [[100, 28], [110, 12]], 2);
  } },
  boto: { w: 14, d: (g) => {
    el(g, 92, 50, 58, 16, -0.12); el(g, 146, 42, 17, 14); ln(g, [[156, 44], [190, 54]], 6);
    pl(g, [[86, 36], [98, 10], [112, 38]]); pl(g, [[128, 58], [118, 82], [140, 64]]); pl(g, [[40, 52], [6, 36], [14, 52], [6, 68]]);
    furo(g, () => el(g, 150, 38, 2.4, 2.4));
  } },
  ariranha: { w: 9, d: (g) => {
    el(g, 86, 62, 46, 14); el(g, 138, 50, 13, 12); el(g, 150, 54, 8, 6); ln(g, [[42, 66], [4, 76]], 9);
    ln(g, [[112, 72], [114, 90]], 8); ln(g, [[70, 74], [66, 90]], 8); pl(g, [[128, 40], [132, 30], [140, 38]]);
    furo(g, () => el(g, 142, 48, 2, 2));
  } },
  peixeboi: { w: 15, d: (g) => {
    el(g, 92, 54, 56, 28); el(g, 146, 56, 18, 17); el(g, 160, 62, 9, 8); pl(g, [[48, 54], [8, 34], [2, 56], [8, 78]]);
    el(g, 128, 82, 18, 6, 0.55);
    furo(g, () => el(g, 150, 50, 2.4, 2.4));
  } },
  pirarucu: { w: 18, poses: 1, d: (g) => {
    el(g, 98, 50, 82, 18, 0); pl(g, [[172, 40], [196, 52], [172, 62]]); pl(g, [[30, 50], [0, 28], [0, 72]]);
    pl(g, [[40, 36], [70, 26], [58, 40]]); pl(g, [[110, 64], [96, 82], [126, 68]]);
    furo(g, () => { for (let x = 60; x < 150; x += 12) for (let y = 40; y < 62; y += 10) el(g, x + ((y / 10) % 2) * 6, y, 2.2, 2.2); el(g, 172, 46, 2.4, 2.4); });
  } },
  jacare: { w: 18, d: (g) => {
    el(g, 92, 58, 56, 13); pl(g, [[36, 56], [0, 66], [36, 66]]); pl(g, [[136, 52], [196, 58], [196, 64], [136, 66]]);
    patas(g, [112, 124, 66, 52], 66, 80, 8);
    furo(g, () => { for (let x = 50; x < 130; x += 11) el(g, x, 46, 3, 3); });
  } },
};

// Amostra os pontos de uma silhueta: preenche o interior e reforça o contorno. Devolve [x, y] em unidades do mundo, com y=0 na base.
export function amostraSilhueta(id, pose = 0, passo = 2.6, seed = 1) {
  const s = SIL[id];
  if (!s) return [];
  const cv = document.createElement("canvas");
  cv.width = C;
  cv.height = A;
  const g = cv.getContext("2d", { willReadFrequently: true });
  g.fillStyle = "#fff";
  g.strokeStyle = "#fff";
  s.d(g, pose);
  const d = g.getImageData(0, 0, C, A).data;
  const dentro = (x, y) => x >= 0 && y >= 0 && x < C && y < A && d[(y * C + x) * 4 + 3] > 128;
  let rs = seed * 9301 + 49297;
  const rnd = () => {
    rs = (rs * 9301 + 49297) % 233280;
    return rs / 233280;
  };
  let minX = C, maxX = 0, maxY = 0;
  for (let y = 0; y < A; y++) for (let x = 0; x < C; x++) if (dentro(x, y)) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y > maxY) maxY = y; }
  const esc = s.w / Math.max(1, maxX - minX);
  const out = [];
  for (let y = 0; y < A; y += passo)
    for (let x = 0; x < C; x += passo) {
      const px = Math.floor(x + rnd() * passo), py = Math.floor(y + rnd() * passo);
      if (!dentro(px, py)) continue;
      const borda = !dentro(px + 3, py) || !dentro(px - 3, py) || !dentro(px, py + 3) || !dentro(px, py - 3);
      if (!borda && rnd() < 0.35) continue; // interior mais ralo, contorno cheio
      out.push([(px - (minX + maxX) / 2) * esc, (maxY - py) * esc]);
    }
  return out;
}
