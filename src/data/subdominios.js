// Artistas com subdomínio próprio. Regra do Lucas: o subdomínio é o slug sem hífens (vicente-blow -> vicenteblow.jodo.com.br);
// Exceções escolhidas por ele: olx, spuri, saull, estranho, vblow, rog. Para um artista novo entrar: acrescentar o slug da rota em /artistas/<slug> aqui (o DNS curinga cobre o resto).
export const RAIZ = "jodo.com.br";
const SLUGS = [
  "1cort3", "1lum3", "82", "alfano", "davzera", "domrafa", "el-mandarim", "headb", "herick-olx", "insyt",
  "isa-katupyryb", "lessa-gustavo", "makalister", "margarida-the-cat", "phineas", "prisma", "rap-delivery",
  "rogdog", "romulo-spuri", "saull-oe", "sergio-estranho", "van-mc", "vicente-blow",
];
const ESPECIAL = { "herick-olx": "olx", "romulo-spuri": "spuri", "saull-oe": "saull", "sergio-estranho": "estranho", "vicente-blow": "vblow", rogdog: "rog" };
export const SLUG_PARA_SUB = { ...Object.fromEntries(SLUGS.map((s) => [s, ESPECIAL[s] || s.replace(/-/g, "")])), olx: "olx" };
export const SUB_PARA_SLUG = Object.fromEntries(SLUGS.map((s) => [ESPECIAL[s] || s.replace(/-/g, ""), s]));

// Apelidos: 1–2 endereços alternativos por artista que redirecionam para o subdomínio principal (apelido -> subdomínio principal).
const APELIDOS_POR_ARTISTA = {
  "1cort3": ["caio", "1corte"], "1lum3": ["lum"], "82": ["by82"], davzera: ["davi", "davizera"], domrafa: ["rafa", "dom"],
  "el-mandarim": ["mandarim"], headb: ["head", "hb"], "herick-olx": ["herickolx", "herick"], insyt: ["dk", "insytdk"],
  "isa-katupyryb": ["isa", "katupyryb"], "lessa-gustavo": ["lessa"], makalister: ["maka", "jovemmaka"],
  "margarida-the-cat": ["margarida"], phineas: ["akaphineas"], "rap-delivery": ["rd", "delivery"], rogdog: ["rogdog"],
  "romulo-spuri": ["romulospuri", "romulo"], "saull-oe": ["saulloe"], "sergio-estranho": ["sergioestranho", "sergio"],
  "van-mc": ["van"], "vicente-blow": ["vicenteblow", "vicente"],
};
export const APELIDO_PARA_SUB = Object.fromEntries(
  Object.entries(APELIDOS_POR_ARTISTA).flatMap(([slug, ap]) => ap.map((a) => [a, SLUG_PARA_SUB[slug]])).filter(([a, sub]) => a !== sub && !SUB_PARA_SLUG[a])
);
