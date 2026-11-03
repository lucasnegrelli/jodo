// O território do mapa do Vicente: relevo, rio, copa e as 13 obras de terra (uma para cada lançamento da discografia).
// Tudo é gerado em código e ilustrativo.
const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const lerp = (a, b, t) => a + (b - a) * t;
export const h2 = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const vn = (x, y) => {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(h2(ix, iy), h2(ix + 1, iy), ux), lerp(h2(ix, iy + 1), h2(ix + 1, iy + 1), ux), uy);
};
const fbm = (x, y) => vn(x, y) * 0.5 + vn(x * 2.03, y * 2.03) * 0.25 + vn(x * 4.1, y * 4.1) * 0.125 + vn(x * 8.3, y * 8.3) * 0.0625;

export const LX = 340, LZ = 220;
export const FOGO_I = [175, -12];
export const rioZ = (x) => Math.sin(x * 0.016) * 10 + Math.sin(x * 0.045 + 1) * 3.5;
const TRIB_Z0 = rioZ(-60);
const tribX = (z) => -60 + (z - TRIB_Z0) * 0.28 + Math.sin(z * 0.05) * 8;
const LAGOS = [[95, 85, 13], [-140, -70, 10]];
export const dAgua = (x, z) => {
  let d = Math.abs(z - rioZ(x)) - 8;
  if (z < TRIB_Z0 - 4 && z > -112) d = Math.min(d, Math.abs(x - tribX(z)) - 3);
  for (const [cx, cz, r] of LAGOS) d = Math.min(d, Math.hypot(x - cx, (z - cz) * 1.3) - r);
  return d;
};

// uma obra de terra para cada lançamento, na mesma ordem de DISCO (índice 0 = o mais novo)
export const OBRAS = [
  { tp: "anelG", cx: 0, cz: 78, a: 12, b: 20, c3: 30, R: 30 },        // Ruído das Águas
  { tp: "octo", cx: -62, cz: 80, a: 15, R: 15 },                      // Pode Pá, Ora Pois
  { tp: "fechadura", cx: 74, cz: 68, a: 16, R: 16 },                  // R.E.M.A
  { tp: "u", cx: -112, cz: 72, a: 14, b: 0, R: 14 },                  // Reflexo
  { tp: "zig", cx: 122, cz: 94, a: 26, R: 26 },                       // El Fluxxxo
  { tp: "elipse", cx: 42, cz: -80, a: 22, b: 12, R: 22 },             // Tomando um Chá
  { tp: "quad", cx: -96, cz: -70, a: 12, R: 14 },                     // Zabutre
  { tp: "anel2", cx: 112, cz: -68, a: 11, b: 5, R: 11 },              // Slip Like Time
  { tp: "octo", cx: -40, cz: -48, a: 11, R: 11 },                     // A Vida É um Rio
  { tp: "anel", cx: -138, cz: 30, a: 12, R: 12 },                     // Rua Nova, Velhas Histórias
  { tp: "quad", cx: 138, cz: -8, a: 9, R: 11 },                       // Capital Crime
  { tp: "raios", cx: -30, cz: -88, a: 18, R: 18 },                    // Free$tyle Quarentena
  { tp: "raios", cx: 8, cz: -52, a: 14, R: 14 },                      // Amazônia Pega Fogo
];
const LIGA = [[0, 1], [1, 3], [0, 2], [2, 4], [3, 9], [4, 10], [6, 11], [11, 5], [5, 7], [11, 12], [12, 8], [9, 3]];
const AVENIDAS = LIGA.map(([i, j]) => {
  const A = OBRAS[i], B = OBRAS[j];
  const dx = B.cx - A.cx, dz = B.cz - A.cz, L = Math.hypot(dx, dz) || 1;
  return [A.cx + (dx / L) * A.R, A.cz + (dz / L) * A.R, B.cx - (dx / L) * B.R, B.cz - (dz / L) * B.R];
});
const segDist = (px, pz, ax, az, bx, bz) => {
  const dx = bx - ax, dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz + 1e-6)));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
};
const gauss = (e, w) => Math.exp(-((e / w) ** 2));

// quanto de vala uma obra desenha neste ponto
const contribuicao = (o, x, z) => {
  const dx = x - o.cx, dz = z - o.cz;
  const r = Math.hypot(dx, dz);
  const a = o.a;
  switch (o.tp) {
    case "anel": return 2.6 * gauss(Math.abs(r - a), 1.0);
    case "anel2": return 2.6 * (gauss(Math.abs(r - a), 1.0) + gauss(Math.abs(r - o.b), 1.0));
    case "anelG": {
      const ang = Math.atan2(dz, dx);
      const k = Math.abs((((ang + Math.PI / 4) % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2) - Math.PI / 4);
      const f = k < 0.11 ? 0.06 : 1; // quatro entradas nos eixos
      return 2.6 * (gauss(Math.abs(r - a), 1.0) + gauss(Math.abs(r - o.b), 1.0) + gauss(Math.abs(r - o.c3), 1.0)) * f;
    }
    case "quad": return 2.6 * gauss(Math.abs(Math.max(Math.abs(dx), Math.abs(dz)) - a), 1.0);
    case "octo": return 2.6 * gauss(Math.abs(Math.max(Math.max(Math.abs(dx), Math.abs(dz)), (Math.abs(dx) + Math.abs(dz)) / 1.414) - a), 1.0);
    case "elipse": return 2.6 * gauss(Math.abs(Math.hypot(dx / a, dz / o.b) - 1) * Math.min(a, o.b), 1.0);
    case "fechadura": {
      let d = 2.6 * gauss(Math.abs(r - a), 1.0);
      d += 1.8 * gauss(segDist(x, z, o.cx, o.cz + a, o.cx, o.cz + a * 2.4), 1.0) * (z > o.cz ? 1 : 0);
      d += 1.8 * gauss(segDist(x, z, o.cx - 4, o.cz + a * 2.4, o.cx + 4, o.cz + a * 2.4), 1.0);
      return d;
    }
    case "u": {
      const k = Math.abs(Math.max(Math.abs(dx), Math.abs(dz)) - a);
      const dentro = Math.abs(dx) <= a + 2 && Math.abs(dz) <= a + 2 ? 1 : 0;
      return dz > -a + 1 ? 2.6 * gauss(k, 1.0) * dentro : 0;
    }
    case "raios": {
      let d = 2.6 * gauss(Math.abs(r - a), 1.0);
      const ang = Math.atan2(dz, dx);
      const sp = Math.abs((((ang / (Math.PI / 3)) % 1) + 1) % 1 - 0.5);
      d += 1.6 * gauss((0.5 - sp) * r, 0.9) * (r < a ? 1 : 0);
      return d;
    }
    case "zig": return 2.2 * gauss(dz - Math.sin(dx * 0.45) * 3.2, 1.1) * (Math.abs(dx) < a ? 1 : 0);
    default: return 0;
  }
};

// devolve [profundidade da vala, índice da obra (1..13, 0 = avenida/nenhuma)]
export const vala = (x, z) => {
  let d = 0, id = 0, melhor = 0;
  for (let i = 0; i < OBRAS.length; i++) {
    const o = OBRAS[i];
    if (Math.hypot(x - o.cx, z - o.cz) > o.R * 1.9 + 8) continue;
    const c = contribuicao(o, x, z);
    d += c;
    if (c > melhor) { melhor = c; id = i + 1; }
  }
  let av = 0;
  for (const [ax, az, bx, bz] of AVENIDAS) av += 1.5 * gauss(segDist(x, z, ax, az, bx, bz), 1.0);
  if (av > melhor) id = 0;
  return [Math.min(d + av, 2.8), id];
};

export const solo = (x, z) => {
  let g = 9 + fbm(x * 0.011, z * 0.011) * 10;
  g -= 12 * sm((6 - dAgua(x, z)) / 9);
  g -= vala(x, z)[0];
  return g;
};
export const copaAlt = (x, z) => {
  let c = 0;
  const cs = 5.2, cx = Math.floor(x / cs), cz = Math.floor(z / cs);
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      const a = cx + i, b = cz + j;
      const px = (a + 0.15 + h2(a, b) * 0.7) * cs, pz = (b + 0.15 + h2(b + 7, a + 3) * 0.7) * cs;
      const r = 2.6 + h2(a + 11, b + 5) * 3.8;
      const d = Math.hypot(x - px, z - pz) / r;
      if (d < 1) {
        const hh = 22 + h2(a + 1, b + 9) * 17 + (h2(a + 5, b + 2) > 0.93 ? 12 + h2(a + 3, b + 8) * 10 : 0);
        c = Math.max(c, hh * Math.sqrt(1 - d * d));
      }
    }
  c = Math.max(c, (11 + fbm(x * 0.05, z * 0.05) * 9) * 0.75);
  return c * sm((dAgua(x, z) - 1) / 8);
};

// cada ponto: [x, z, h1(copa), h2(solo), hm(meio), tipo(0 copa,1 solo,2 meio), vala, ruído, água, aberto, obra]
function amostra(P, px, pz, passo) {
  const g = solo(px, pz), c = copaAlt(px, pz);
  const agua = dAgua(px, pz) < -0.5 ? 1 : 0;
  const [dvRaw, obra] = vala(px, pz);
  const dv = Math.min(1, dvRaw / 2.2);
  const rnd = h2(px * 5.3, pz * 4.7);
  if (agua) {
    P.push([px, pz, -2.4, -2.4, -2.4, 0, dv, rnd, 1, 1, 0]);
    const leito = -14 + h2(px * 2.1, pz * 1.7) * 1.6;
    P.push([px, pz, -2.4, leito, leito, 1, 0, rnd, 0, 1, 0]);
  } else {
    P.push([px, pz, g + c, g, g, 0, dv, rnd, 0, c > 1.5 ? 0 : 1, obra]);
    if (c <= 1.5 || rnd < 0.6) P.push([px, pz, g + c, g, g, 1, dv, h2(px * 2.2, pz * 7.1), 0, c > 1.5 ? 0 : 1, obra]);
    if (dv > 0.3) for (let k = 0; k < 3; k++) P.push([px + (h2(px + k, pz) - 0.5) * passo, pz + (h2(px, pz + k) - 0.5) * passo, g + c, g, g, 1, dv, h2(px * 3.3 + k, pz * 1.9), 0, 1, obra]);
    if (c > 8 && h2(px * 9.1, pz * 3.3) < 0.5) {
      const hm = g + c * (0.08 + h2(px * 1.9, pz * 8.3) * 0.82);
      P.push([px + (h2(px, 5) - 0.5) * passo, pz, g + c, g, hm, 2, 0, h2(px * 3.7, pz * 2.1), 0, 0, 0]);
    }
  }
}

export function geraTerreno(passo) {
  const P = [];
  for (let x = -LX / 2; x < LX / 2; x += passo)
    for (let z = -LZ / 2; z < LZ / 2; z += passo)
      amostra(P, x + (h2(x * 3.1, z * 1.7) - 0.5) * passo, z + (h2(x * 1.3, z * 2.9) - 0.5) * passo, passo);
  return P;
}
