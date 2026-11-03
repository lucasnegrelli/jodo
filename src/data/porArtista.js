/*
  Agrupa os clipes/vídeos que o 82 fez POR ARTISTA (o "portfólio de banca").
  Junta a curadoria manual (fases) com os vídeos gerados do YouTube (extras).
*/
const SEPARADORES = /\s*(?:,| e | x | \+ | & |\bpart\.?\b|\bfeat\.?\b|\bft\.?\b|\(|\[)\s*/i;

function limpar(n) {
  return n.replace(/^@/, "").replace(/\s+/g, " ").trim();
}

function artistaDe(i) {
  const quem = (i.quem || "").trim();
  // canais que reúnem vários artistas: o artista vem do título ("Artista - Título")
  if (!quem || CANAIS.has(quem)) {
    const m = (i.titulo || "").split(/\s[-–|]\s/);
    if (m.length > 1 && m[0].length <= 34) return limpar(m[0].split(SEPARADORES)[0]);
    return "Outros";
  }
  return limpar(quem.split(SEPARADORES)[0]) || "Outros";
}

const CANAIS = new Set([
  "JODO", "by JODO", "Straditerra", "Almanak", "Qua$imorto", "Rancho Mont Gomer", "Studio Setor",
  "Quartel dos Loucos", "Resilientes", "Cactu", "Vivemos Livres", "Ordem Natural", "Trezemeia9",
  "TRASHTREVASGANG", "FADE Clã", "CalMob", "Bruxos do Norte",
]);

const IGNORAR = new Set(["82", "KRAPNEK82", "Rap Delivery", "Sushi Humano", "akaphineas", "Outros"]);

export function gruposPorArtista(fases, extras) {
  const curados = fases
    .filter((f) => f.faixa !== "arquivo")
    .flatMap((f) => f.itens.map((i) => ({ ...i, projeto: f.titulo, faixa: f.faixa })));
  const todos = [...curados, ...extras].filter((i) => i.yt);

  const mapa = new Map();
  for (const i of todos) {
    // trabalho sonoro do próprio 82 não entra aqui (vai nos drops)
    if (i.faixa === "som") continue;
    const nome = artistaDe(i);
    if (IGNORAR.has(nome)) continue;
    const k = nome.toLowerCase();
    if (!mapa.has(k)) mapa.set(k, { artista: nome, itens: [] });
    mapa.get(k).itens.push(i);
  }
  const grupos = [...mapa.values()].map((g) => ({
    ...g,
    itens: g.itens.sort((a, b) => (b.views || 0) - (a.views || 0)),
    views: g.itens.reduce((s, i) => s + (i.views || 0), 0),
  }));
  grupos.sort((a, b) => b.itens.length - a.itens.length || b.views - a.views);
  const fortes = grupos.filter((g) => g.itens.length >= 2);
  const soltos = grupos.filter((g) => g.itens.length < 2).flatMap((g) => g.itens);
  if (soltos.length) fortes.push({ artista: "Avulsos", itens: soltos.sort((a, b) => (b.views || 0) - (a.views || 0)), views: 0, avulsos: true });
  return fortes;
}
