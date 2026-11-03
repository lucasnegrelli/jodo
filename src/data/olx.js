/*
  Herick OLX (também Canguru Zurado e Zumbi Studio). Fonte: PDF "YOUTUBE MUSICAS LANÇADAS" (anothers/OLX), canais do YouTube,
  Spotify (artista 1ToF30sj92RBSHAV3fhzqa) e SoundCloud. IDs conferidos nas páginas públicas.
*/
export const LINKS = {
  instagram: "https://www.instagram.com/olxherick/",
  youtube: "https://www.youtube.com/@olxherick",
  spotify: "https://open.spotify.com/intl-pt/artist/1ToF30sj92RBSHAV3fhzqa",
  soundcloud: "https://soundcloud.com/olxherick",
  lojaBeats: "https://www.youtube.com/watch?v=L2syOqUd3SY",
  coffee1: "https://soundcloud.com/olxherick/sets/coffee-beats-1",
  coffee2: "https://soundcloud.com/olxherick/sets/coffee-beats-2",
  jodoYoutube: "https://www.youtube.com/@jodo",
};

// os EPs (viram planetas)
export const EPS = [
  {
    id: "teoria", nome: "Teoria dos Versos", sub: "EP · Herick OLX", img: "/ol/teoria.webp", full: "5GEBf3ON5SQ",
    faixas: [
      { id: "BHWF4ZH8dpY", t: "Olho Aberto" },
      { id: "i2JI_FpyKdM", t: "Não Dependo de Ninguém" },
      { id: "IAWMbj7tBc0", t: "Tempo Perdido" },
      { id: "nbcnfG3YtFY", t: "O Excesso Contamina" },
    ],
  },
  {
    id: "mesa", nome: "Conversas para Mesa de Bar", sub: "EP · d4crvz, MaZéli e Herick OLX", img: "/ol/mesa.webp", full: "R0o9CEAOnsw",
    faixas: [
      { id: "R0o9CEAOnsw", t: "Conto do Peixeiro (Intro)" },
      { id: "unglgx6Owjg", t: "Aconchego do Bar" },
      { id: "KhI721igOLs", t: "Jardim de Breja" },
      { id: "8tQThdf2UYM", t: "Lembranças Alcoólicas" },
      { id: "p0u0bOR9KiY", t: "1 Gole, 4 Linhas" },
      { id: "NDeVv08aAwY", t: "A Saideira" },
    ],
  },
  {
    id: "marsupio", nome: "Marsúpio", sub: "EP · Canguru Zurado", img: "/ol/marsupio.webp", full: "okn1puugUIw",
    faixas: [
      { id: "YX5-_gCq6u8", t: "Pague pra Ver" },
      { id: "aOGflFL0fk0", t: "Pontes Analógicas" },
      { id: "DurFexAN4F8", t: "Tá Fácil" },
      { id: "SIya9YxCYKQ", t: "1 Minuto" },
      { id: "VuNewsRLCnA", t: "Cortando pela Raiz" },
      { id: "8CY2SjickOk", t: "Desgastado$" },
    ],
  },
];

// as três faces
export const NOMES = [
  { n: "01", nome: "Herick OLX", txt: "MC. Os EPs Teoria dos Versos e Conversas para Mesa de Bar, e faixas com a cena.", alvo: "orbita" },
  { n: "02", nome: "Canguru Zurado", txt: "O outro nome dele. O álbum Marsúpio.", alvo: "orbita" },
  { n: "03", nome: "Zumbi Studio", txt: "Beats e mixagem para outros artistas.", alvo: "estudio" },
];

// constelação: quem divide a faixa com ele (x, y em um quadro de 1000 x 640)
export const ESTRELAS = [
  { n: "DK", x: 150, y: 150, jodo: true, faixas: [{ id: "KLLR-Eg2vkA", t: "LANÇA" }, { id: "wJdbpCSg5Ck", t: "Isso aqui é o Inferno" }, { id: "nyq8G7GEJAY", t: "BeatZzSessionZz #2" }, { id: "zLd4fo25vVY", t: "BeatZzSessionZz #3" }, { id: "RSyMihkWSDA", t: "Teia no Teto" }] },
  { n: "Arkano", x: 330, y: 70, faixas: [{ id: "sbAko4AgcYo", t: "Ruído Final" }] },
  { n: "Arkaica", x: 690, y: 60, faixas: [{ id: "5yxydm5KkD4", t: "Por fora dos padrões" }] },
  { n: "Nixon $ilva", x: 860, y: 140, faixas: [{ id: "YMiN7_b2AFo", t: "Guerras" }, { id: "07hD-6JfWzk", t: "Linhas do Santo" }] },
  { n: "Saull OE", x: 930, y: 300, faixas: [{ id: "07hD-6JfWzk", t: "Linhas do Santo" }] },
  { n: "d4crvz", x: 840, y: 470, faixas: [{ id: "R0o9CEAOnsw", t: "Conversas para Mesa de Bar" }, { id: "l6Kr5I9jRpI", t: "Só Faço Ideia" }] },
  { n: "MaZéli", x: 660, y: 580, faixas: [{ id: "unglgx6Owjg", t: "Conversas para Mesa de Bar" }] },
  { n: "Y. bleF", x: 520, y: 520, faixas: [{ id: "l6Kr5I9jRpI", t: "Só Faço Ideia" }] },
  { n: "Strads", x: 340, y: 590, faixas: [{ id: "5ChbekpiQbQ", t: "Casamento da Sombra com a Imensidão" }] },
  { n: "Master Mind", x: 150, y: 520, faixas: [{ id: "5ChbekpiQbQ", t: "Casamento da Sombra com a Imensidão" }] },
  { n: "Wez Substrato", x: 60, y: 360, faixas: [{ id: "5ChbekpiQbQ", t: "Casamento da Sombra com a Imensidão" }] },
  { n: "D'Régiz", x: 250, y: 330, faixas: [{ id: "wJdbpCSg5Ck", t: "Isso aqui é o Inferno" }] },
  { n: "Mano James", x: 220, y: 430, faixas: [{ id: "wJdbpCSg5Ck", t: "Isso aqui é o Inferno" }] },
  { n: "Shablinblin", x: 740, y: 330, faixas: [{ id: "RzT4bJZfM_U", t: "Até Melhor" }] },
  { n: "Ian Lecter", x: 470, y: 130, faixas: [{ id: "RSyMihkWSDA", t: "Teia no Teto" }] },
];

// Zumbi Studio: o que produziu/mixou (títulos como estão nos vídeos)
export const PRODUCOES = [
  { id: "bh05Xqzu6Qo", a: "augúrio", t: "UNMASTERED" },
  { id: "9GHg_Ry5prI", a: "Saull OE", t: "Hemisfério" },
  { id: "glbz5V6-HjA", a: "Mayer & Kaemizé", t: "Corre de Virar" },
  { id: "XvJcSiN--cQ", a: "Monsay, yungmxch & HOPE", t: "Vida Distante" },
  { id: "Eifav9yrvbc", a: "1LUM3", t: "exílio", pagina: "/artistas/1lum3" },
  { id: "44YxB_V5qQo", a: "Igor Muniz", t: "Retórica" },
  { id: "f43MBwG5o9g", a: "Êxodo part. Quatorze", t: "Quanto tempo" },
  { id: "5qtjBQGIbQ0", a: "maGREEN666", t: "A Volta" },
  { id: "CoUwX868cKc", a: "SV MC", t: "Eu Que Tô Errado" },
  { id: "vYYhCPcjVxM", a: "Cardoso part. Arkaica", t: "Contra Reforma" },
];

// beats por estilo (SoundCloud), em ordem de BPM
export const BEATS = [
  { bpm: 82, nome: "lofi chill", url: "https://soundcloud.com/olxherick/estilo-lofichill-82bpm-6" },
  { bpm: 86, nome: "boombapada", url: "https://soundcloud.com/olxherick/estilo-boombapada-86bpm-2" },
  { bpm: 110, nome: "darkbap", url: "https://soundcloud.com/olxherick/estilo-darkbap-110bpm-3" },
  { bpm: 120, nome: "trapzin moderno", url: "https://soundcloud.com/olxherick/estilo-trapzin-moderno-120bpm-8" },
  { bpm: 128, nome: "new jazz", url: "https://soundcloud.com/olxherick/estilo-new-jazz-128bpm-7" },
  { bpm: 140, nome: "littlehair", url: "https://soundcloud.com/olxherick/estilo-littlehair-140bpm-5" },
  { bpm: 140, nome: "drillzada", url: "https://soundcloud.com/olxherick/estilo-drillzada-140bpm-4" },
];

// na JODO (canal da JODO no YouTube)
export const NA_JODO = [
  { id: "nyq8G7GEJAY", t: "BeatZzSessionZz #2", c: "DK e Herick OLX" },
  { id: "zLd4fo25vVY", t: "BeatZzSessionZz #3", c: "DK e Herick OLX" },
  { id: "RSyMihkWSDA", t: "Teia no Teto", c: "DK, Ian Lecter e Herick OLX" },
  { id: "KLLR-Eg2vkA", t: "LANÇA", c: "DK e Herick OLX" },
];

// melhor miniatura existente de cada vídeo (o YouTube responde 404 com imagem cinza quando a maior não existe)
export const MINI = {"07hD-6JfWzk": "maxresdefault", "44YxB_V5qQo": "maxresdefault", "5ChbekpiQbQ": "maxresdefault", "5qtjBQGIbQ0": "maxresdefault", "5yxydm5KkD4": "maxresdefault", "8CY2SjickOk": "maxresdefault", "8tQThdf2UYM": "maxresdefault", "9GHg_Ry5prI": "maxresdefault", "BHWF4ZH8dpY": "maxresdefault", "CoUwX868cKc": "sddefault", "DurFexAN4F8": "maxresdefault", "Eifav9yrvbc": "maxresdefault", "IAWMbj7tBc0": "maxresdefault", "KLLR-Eg2vkA": "maxresdefault", "KhI721igOLs": "maxresdefault", "NDeVv08aAwY": "maxresdefault", "R0o9CEAOnsw": "maxresdefault", "RSyMihkWSDA": "sddefault", "RzT4bJZfM_U": "maxresdefault", "SIya9YxCYKQ": "maxresdefault", "VuNewsRLCnA": "maxresdefault", "XvJcSiN--cQ": "maxresdefault", "YMiN7_b2AFo": "maxresdefault", "YX5-_gCq6u8": "maxresdefault", "aOGflFL0fk0": "maxresdefault", "bh05Xqzu6Qo": "maxresdefault", "f43MBwG5o9g": "sddefault", "glbz5V6-HjA": "maxresdefault", "i2JI_FpyKdM": "maxresdefault", "l6Kr5I9jRpI": "maxresdefault", "nbcnfG3YtFY": "maxresdefault", "nyq8G7GEJAY": "maxresdefault", "p0u0bOR9KiY": "maxresdefault", "sbAko4AgcYo": "maxresdefault", "unglgx6Owjg": "maxresdefault", "vYYhCPcjVxM": "maxresdefault", "wJdbpCSg5Ck": "maxresdefault", "zLd4fo25vVY": "hqdefault"};
export const mini = (id) => `https://i.ytimg.com/vi/${id}/${MINI[id] || "mqdefault"}.jpg`;

// faixas e sessões com outros artistas (fora dos EPs), só como crédito e link
export const FEATS = (() => {
  const noEp = new Set(EPS.flatMap((e) => e.faixas.map((f) => f.id)));
  const m = new Map();
  ESTRELAS.forEach((s) => s.faixas.forEach((f) => {
    if (noEp.has(f.id)) return;
    const o = m.get(f.id) || { id: f.id, t: f.t, com: [] };
    o.com.push(s.n);
    m.set(f.id, o);
  }));
  return [...m.values()];
})();
