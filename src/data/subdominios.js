// Artistas com subdomínio próprio. Regra do Lucas: o subdomínio é o slug sem hífens (vicente-blow -> vicenteblow.jodo.com.br);
// Exceções escolhidas por ele: olx, spuri, saull, estranho, vblow. Para um artista novo entrar: acrescentar o slug da rota em /artistas/<slug> aqui (o DNS curinga cobre o resto).
export const RAIZ = "jodo.com.br";
const SLUGS = [
  "1cort3", "1lum3", "82", "alfano", "davzera", "domrafa", "el-mandarim", "headb", "herick-olx", "insyt",
  "isa-katupyryb", "lessa-gustavo", "makalister", "margarida-the-cat", "phineas", "prisma", "rap-delivery",
  "rogdog", "romulo-spuri", "saull-oe", "sergio-estranho", "van-mc", "vicente-blow",
];
const ESPECIAL = { "herick-olx": "olx", "romulo-spuri": "spuri", "saull-oe": "saull", "sergio-estranho": "estranho", "vicente-blow": "vblow" };
export const SLUG_PARA_SUB = { ...Object.fromEntries(SLUGS.map((s) => [s, ESPECIAL[s] || s.replace(/-/g, "")])), olx: "olx" };
export const SUB_PARA_SLUG = Object.fromEntries(SLUGS.map((s) => [ESPECIAL[s] || s.replace(/-/g, ""), s]));
