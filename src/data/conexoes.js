// Mapa de conexões entre artistas da JODO (fatos verificados em Spotify/Deezer/YouTube). Serve para:
// 1) links internos entre páginas de artista (SEO e navegação), 2) o grafo "conexões" de cada página, 3) JSON-LD.
// `rota` só existe para quem já tem página no site; os demais entram no grafo como nó sem link.
export const NOS = {
  "82": { nome: "82 (Krapnek82 / Altamente 82)", curto: "82", rota: "/artistas/82" },
  "vicente-blow": { nome: "Vicente Blow (VBLXW)", curto: "VBLXW", rota: "/artistas/vicente-blow", grupo: "bruxos-do-norte" },
  prisma: { nome: "PRISM∆ (Prism4)", curto: "PRISM∆", rota: "/artistas/prisma", grupo: "bruxos-do-norte" },
  lf: { nome: "LF", grupo: "bruxos-do-norte" },
  "dom-brawl": { nome: "Dom Brawl", curto: "Dom Brawl", grupo: "bruxos-do-norte" },
  "sergio-estranho": { nome: "Sergio Estranho", curto: "Sergio", rota: "/artistas/sergio-estranho", grupo: "rap-delivery" },
  "1cort3": { nome: "1cort3", rota: "/artistas/1cort3", grupo: "rap-delivery" },
  "1lum3": { nome: "1LUM3" },
  cevas: { nome: "Cevas" },
};

export const GRUPOS = {
  "bruxos-do-norte": { nome: "Bruxos do Norte", cidade: "Manaus, AM" },
  "rap-delivery": { nome: "Rap Delivery", cidade: "São Paulo, SP" },
};

// cada conexão: obra (faixa/álbum), ano, quem participa, fonte
export const CONEXOES = [
  { obra: "Pode Pá, Ora Pois", em: "Mundo Estranho (Altamente 82 e Cevas)", ano: 2023, com: ["82", "vicente-blow"], fonte: "Spotify" },
  { obra: "Zabutre", ano: 2021, com: ["82", "vicente-blow"], fonte: "Lucas (82); single na Deezer/Spotify de Vicente Blow" },
  { obra: "Pão de Batata", em: "Mundo Estranho", ano: 2023, com: ["82", "1cort3"], fonte: "Spotify" },
  { obra: "Céloko", em: "Mundo Estranho", ano: 2023, com: ["82", "sergio-estranho"], fonte: "Spotify" },
  { obra: "A Vida É um Rio", ano: 2021, com: ["vicente-blow", "sergio-estranho"], fonte: "Deezer, SoundCloud Bruxos do Norte" },
  { obra: "Ruído das Águas", ano: 2025, com: ["vicente-blow", "prisma", "lf"], fonte: "Spotify, YouTube" },
  { obra: "Vazante 2", ano: 2024, com: ["prisma", "vicente-blow", "lf"], fonte: "Spotify, YouTube" },
  { obra: "Slip Like Time", ano: 2021, com: ["vicente-blow", "dom-brawl"], fonte: "Deezer" },
  { obra: "Chesterfield", ano: 2023, com: ["vicente-blow", "dom-brawl", "lf"], fonte: "Spotify" },
  { obra: "Flames (guia 03)", ano: 2026, com: ["prisma", "1lum3"], fonte: "SoundCloud" },
];

export const vizinhos = (id) => {
  const out = new Map();
  CONEXOES.filter((c) => c.com.includes(id)).forEach((c) =>
    c.com.filter((x) => x !== id).forEach((x) => {
      const e = out.get(x) || { id: x, ...NOS[x], obras: [] };
      e.obras.push({ obra: c.obra, ano: c.ano, em: c.em });
      out.set(x, e);
    })
  );
  return [...out.values()];
};
