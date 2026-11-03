/*
  PAINEL do 82: transforma a lista de vídeos confirmados (playlist By82 ou nome na ficha) em dados de dashboard.
  - categoria: Clipe, Beattape, Live, Disco/EP/Mixtape, Série, Making of, Curta/filme, Lyric/visualizer
  - artista(s): pelo canal (quando é de artista) ou pelo título ("Artista - Título"); sem balde "avulso"
  - cidade/UF: tabela abaixo (confirmada nas memórias do projeto); o que ainda não foi mapeado fica em "A mapear"
*/

const sem = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9$]+/g, "");

/* canais que reúnem vários artistas: o nome vem do título */
const CANAIS = new Set(
  [
    "JODO", "by JODO", "Straditerra", "Almanak", "Qua$imorto", "Rancho Mont Gomer", "Studio Setor",
    "Quartel dos Loucos", "Resilientes", "Cactu", "Vivemos Livres", "Ordem Natural", "Trezemeia9",
    "TRASHTREVASGANG", "FADE Clã", "CalMob", "Bruxos do Norte", "Novíssimo Edgar", "Sushi Humano",
    "Zumbi Studio", "Origem MC's", "doburro", "pastoretreze", "Hericlis", "2DE1", "Medulla", "NxnoficiaL",
  ].map(sem)
);

/* apelidos e grafias diferentes da mesma pessoa */
const ALIAS = {
  canguruzurado: "Herick OLX", coalafreak: "DK", insyt: "DK",
  treze69: "Treze69", msor: "Msor", jaybeats: "JayBeatzz", jaybeatzz011: "JayBeatzz",
  "1lum3s01ep01": "1LUM3",
  d4crvz: "d4crvz", d4crvzx: "d4crvz",
  "1lum3": "1LUM3", "1lume": "1LUM3",
  sergioestranho: "Sergio Estranho", ergioestranho: "Sergio Estranho", estranho: "Sergio Estranho", "&ergioestranho": "Sergio Estranho",
  lessagustavo: "Lessa Gustavo", gessalustavo: "Lessa Gustavo", lessa: "Lessa Gustavo",
  victorxama: "Victor Xamã", vxama: "Victor Xamã", vxamã: "Victor Xamã",
  davzera: "Davi Nadier", davinadier: "Davi Nadier", davinadier: "Davi Nadier",
  dk: "DK", insyt: "DK", prodDk: "DK", _proddk: "DK", proddk: "DK", insytilusion: "DK",
  olx: "Herick OLX", herickolx: "Herick OLX", herick: "Herick OLX",
  saulloe: "Saull OE", saul: "Saull OE", saull: "Saull OE",
  vblow: "VBLOW", vicenteblow: "VBLOW",
  nixonsilva: "Nixon $ilva", nxn: "Nixon $ilva", "nixon$ilva": "Nixon $ilva", nxnoficial: "Nixon $ilva",
  mctola: "Mc Tola", tola: "Mc Tola",
  vanmc: "Van MC",
  makalister: "Makalister",
  matheuscoringa: "Matheus Coringa",
  "1cort3": "1cort3", "1corte": "1cort3",
  elmandarim: "El Mandarim",
  edgar: "Edgar", novissimoedgar: "Edgar",
  phinea$: "PHINEA$", akaphineas: "PHINEA$", phineas: "PHINEA$",
  "82": "82", krapnek82: "82", krapnek: "82", visceras82: "82", altamente82: "82",
  kinghurbano: "King Hurbano", hurbano: "King Hurbano",
  ianlecter: "Ian Lecter", ianlect: "Ian Lecter",
};

/* cidade/UF confirmadas nas memórias do projeto */
const LOCAIS = {
  "Brisa Flow": ["São Paulo", "SP"],
  "Lumbriga": ["São Paulo", "SP"],
  "Loucos Vivos": ["Maravilha", "SC"],
  "RaizK": ["Maravilha", "SC"],
  "Espontâneo": ["Maravilha", "SC"],
  "Arkano": ["Manaus", "AM"],
  "Bartira": ["Pelotas", "RS"],
  "GÁBE": ["Cassino", "RS"],
  "Hericlis": ["Santos", "SP"],
  "Medulla": ["Rio de Janeiro", "RJ"],
  "JayBeatzz": ["Guarulhos", "SP"],
  "Victor VL": ["Manaus", "AM"],
  "RBM": ["Guarulhos", "SP"],
  "Leozinho do B.A.": ["Rio de Janeiro", "RJ"],
  "Tota Infamous Destruction": ["Guarulhos", "SP"],
  "Ramiro Mart": ["Volta Redonda", "RJ"],
  "Arit": ["Lages", "SC"],
  "$onic": ["Santos", "SP"],
  "Nalesso": ["São Paulo", "SP"],
  "Dandy": ["São Paulo", "SP"],
  "chinedu": ["São Paulo", "SP"],
  "NOUA": ["Guarulhos", "SP"],
  "Karmo": ["São Paulo", "SP"],
  "DC CalMob": ["Volta Redonda", "RJ"],
  "Sedex": ["Volta Redonda", "RJ"],
  "Origem MC's": ["São Paulo", "SP"],
  "Jhonny": ["Manaus", "AM"],
  "Sarau do Burro": ["São Paulo", "SP"],
  "Treze69": ["Manaus", "AM"],
  "Msor": ["São Paulo", "SP"],
  "Cevas": ["Fundão", "PT"],
  "OG GU7O": ["Guarulhos", "SP"],
  "Bruxos do Norte": ["Manaus", "AM"],
  "JODAM": ["Manaus", "AM"],
  "Sushi Humano": ["Guarulhos", "SP"],
  "Davi Nadier": ["Salvador", "BA"],
  "Matheus Coringa": ["São Paulo", "SP"],
  "Dro": ["São Bernardo do Campo", "SP"],
  "Rodrigo Dro": ["São Bernardo do Campo", "SP"],
  "Nill": ["Jundiaí", "SP"],
  "2DE1": ["São Paulo", "SP"],
  "2de1": ["São Paulo", "SP"],
  "King": ["Manaus", "AM"],
  "King Hurbano": ["Manaus", "AM"],
  "Angela Polícia": ["Portugal", "PT"],
  "Angela Policia": ["Portugal", "PT"],
  "Concha": ["Guarulhos", "SP"],
  "Gustrago": ["Guarulhos", "SP"],
  "Total Infamous": ["Guarulhos", "SP"],
  "Kurt Sutil": ["Manaus", "AM"],
  "Lvks": ["Volta Redonda", "RJ"],
  "Gu7o": ["Guarulhos", "SP"],
  "Locaut": ["Guarulhos", "SP"],
  "Rodrigo Locaut": ["Guarulhos", "SP"],
  "HeadB": ["Salvador", "BA"],
  "headB": ["Salvador", "BA"],
  "Strads": ["Alfenas", "MG"],
  "Straditerra": ["Alfenas", "MG"],
  "Makalister": ["São José", "SC"],
  "Lessa Gustavo": ["Nova Iguaçu", "RJ"],
  "d4crvz": ["Mesquita", "RJ"],
  "Edgar": ["Guarulhos", "SP"],
  "Matagal Hi-Tek": ["Guarulhos", "SP"],
  "Victor Xamã": ["Manaus", "AM"],
  "Van MC": ["Manaus", "AM"],
  "Mc Tola": ["Manaus", "AM"],
  "DK": ["Manaus", "AM"],
  "Herick OLX": ["Manaus", "AM"],
  "Saull OE": ["Manaus", "AM"],
  "Ian Lecter": ["Manaus", "AM"],
  "Nixon $ilva": ["Manaus", "AM"],
  "VBLOW": ["Manaus", "AM"],
  "Prisma": ["Manaus", "AM"],
  "Luiz Caqui": ["Manaus", "AM"],
  "Treze 69": ["Manaus", "AM"],
  "FP Swag": ["Manaus", "AM"],
  "Sergio Estranho": ["São Paulo", "SP"],
  "1cort3": ["São Paulo", "SP"],
  "El Mandarim": ["São Paulo", "SP"],
  "domrafa": ["São Paulo", "SP"],
  "Trinca": ["São Paulo", "SP"],
  "Msor": ["São Paulo", "SP"],
  "Eloy Polemico": ["São Paulo", "SP"],
  "DJ Tadela": ["São Paulo", "SP"],
  "1LUM3": ["Guaratinguetá", "SP"],
  "PHINEA$": ["Rio de Janeiro", "RJ"],
  "82": ["São Paulo", "SP"],
  "Margarida The Cat": ["São Paulo", "SP"],
  "Matheus Coringa": ["São Paulo", "SP"],
};

/* canais regionais: o lugar do canal vale para quem aparece nele (evidência nas memórias do projeto) */
const CANAL_LOCAL = {
  [sem("Straditerra")]: ["Alfenas", "MG"],
  [sem("Almanak")]: ["Santa Catarina", "SC"],
  [sem("Qua$imorto")]: ["Manaus", "AM"],
  [sem("Trezemeia9")]: ["Manaus", "AM"],
  [sem("Zumbi Studio")]: ["Manaus", "AM"],
  [sem("Rancho Mont Gomer")]: ["São Paulo", "SP"],
};

const LOCAIS_N = Object.fromEntries(Object.entries(LOCAIS).map(([k, v]) => [sem(k), v]));
const localDe = (nome) => LOCAIS[nome] || LOCAIS_N[sem(nome)] || null;


/* artistas por vídeo, corrigidos à mão (o título sozinho engana) */
const ARTISTAS_VIDEO = {
  "3U8D4AXPHhI": ["Matheus Coringa", "Sergio Estranho", "João Alquímico", "Herick OLX"],
  "Ct-6xkRXAmw": ["Nalesso", "Dandy"],
  "sbAko4AgcYo": ["Herick OLX", "Arkano"],
  "ht3FR__2uqM": ["DK", "Herick OLX"],
  "iIBr_rFL7NM": ["82"],
  "7OK8bTXpwro": ["82"],
  "lCTAB4UxTBA": ["82"],
  "5bcjkv3Ij-w": ["82"],
  "LatBNx224Os": ["JayBeatzz", "Lessa Gustavo"],
  "VtHcmaF11r8": ["Lessa Gustavo", "Makalister"],
  "l6Kr5I9jRpI": ["d4crvz", "Herick OLX"],
  "RonHlBQJ8S4": ["Brisa Flow", "Bartira"],
  "qfrTjgHLwJo": ["Treze69"],
  "afswxaFVMAU": ["Herick OLX", "DK"],
  "8J2TXv7vBaI": ["King Hurbano", "El Mandarim", "Sergio Estranho"],
  "D--GM1CJg5g": ["Van MC"],
  "s0SZfnLEoR4": ["1LUM3"],
  "uM5QR6dlq3g": ["Msor"],
  "PSFPoGXHjwA": ["Lumbriga", "Makalister", "Victor Xamã"],
  "PGsY1adk2SU": ["Sarau do Burro"],
  "EksDroSBzkE": ["Lessa Gustavo", "Victor Xamã", "Lumbriga", "Makalister"],
  "PvLPXBbQKG0": ["82", "Sergio Estranho"],
  "sGjH_BQ3uno": ["82", "1cort3"],
  "vuHVgBhz2SI": ["82", "1cort3"],
  "nWmZSkgxwKM": ["Loucos Vivos", "RaizK", "Espontâneo"],
  "2-Fjvx7X4aY": ["JayBeatzz"],
};
/* vídeos que não entram (o Lucas não fez ou não quer associado) */
const REMOVER = new Set(["URYozhL5CIg", "EksDroSBzkE"]);
/* nomes que não entram como artista */
const NOMES_FORA = new Set(["cayocarig", "jeanlobo", "ybl ef".replace(/ /g, ""), "yblef"]);



/* o que o Lucas fez em cada um (quando não é "imagem e edição"), conferido por ele em 15/10/2026 */
const PAPEL_VIDEO = {
  "uM5QR6dlq3g": "diagramação e design",
  "enqXMOyIVSI": "produção executiva",
};

/* categoria por vídeo, conferida pelo Lucas (15/10/2026) */
const CATEGORIA_VIDEO = {
  "8E3d0J1UoRA": "Beattape", "nac9cXdL15c": "Beattape", "2YRY50fg1O4": "Beattape", // No Meio (série de 3 beattapes)
  "sGjH_BQ3uno": "Beattape", "nWmZSkgxwKM": "Beattape",
  "7OK8bTXpwro": "Série",
  "taX3TlV3b14": "Single", "F2iYy4h-_7U": "Single", "ZBYOJDHv2fA": "Single", "gM1-pOvLtC4": "Single",
  "IPQMiwySfjE": "Single", "glCdBWhbeRY": "Single", "vuHVgBhz2SI": "Single",
  "0SgFvnGo5Ts": "Clipe", "z3B8uQyoDK8": "Clipe", "z5jI9H2ZMks": "Clipe",
  "tcKUD1A4P7k": "Curta · filme", "PvLPXBbQKG0": "Curta · filme", "cu1sTA7JOz8": "Curta · filme",
  "K4Uk39uNDmY": "Curta · filme", "3QPN7v6emJA": "Curta · filme",
  "EksDroSBzkE": "Live", "MC_RX-io2JM": "Live", "sXFxy_y1xDA": "Live", "nyq8G7GEJAY": "Live", "zLd4fo25vVY": "Live",
  "I6cvxEs1otg": "Visualizer · capa", "IDpYmEUT5rY": "Visualizer · capa", "fB4r6Ggm1p4": "Visualizer · capa",
  "QwaWUmaIjq8": "Visualizer · capa", "gcTz6i2nwII": "Visualizer · capa",
};

const CATEGORIAS = [
  ["Beattape", /beat\s?-?tape|beattape|ttape|lofirefogo|beatzz|beat\s?session|prima?ta\b/i],
  ["Live", /\blive\b|ao vivo|\(live\)|performance|posse cutz|show d|sess[ãa]o\b/i],
  ["Making of", /making of|bastidor/i],
  ["Disco · EP · mixtape", /mixtape|full album|full ep|\bep\b|\(ep\)|álbum|album|lowquality|\btape\b/i],
  ["Série", /epis[óo]dio|\bep\.\s?\d|\bep\d|s[ée]rie|#\d|pilulaspoken|no meio \(|vivência|vvch|vvcs|corre criativo|nolombo|conhecendo de perto/i],
  ["Curta · filme", /curta|\bfilme\b|short film|document[áa]rio|minidoc|hibrido/i],
  ["Visualizer · capa", /lyric|visualizer|lyricgif/i],
];

function categoria(titulo) {
  for (const [nome, re] of CATEGORIAS) if (re.test(titulo)) return nome;
  return "Clipe";
}

function limpaTitulo(t) {
  return t.replace(/\((?:prod|beat)[^)]*\)/gi, " ").replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
}

function normNome(n) {
  const c = n.replace(/^@/, "").replace(/\s+/g, " ").trim();
  const k = sem(c);
  return ALIAS[k] || c;
}

const SEP = /\s*(?:,|\se\s|\sx\s|\s\+\s|\s&\s|\spart\.?\s|\sfeat\.?\s|\sft\.?\s)\s*/i;

function artistasDe(v) {
  const quem = (v.quem || "").trim();
  const t = limpaTitulo(v.titulo || "");
  let fonte = "";
  if (quem && !CANAIS.has(sem(quem))) {
    fonte = quem;
  } else {
    // "Artista - Título" ou "Artista | Título"
    const m = t.split(/\s[-–|]\s/);
    if (m.length > 1 && m[0].length <= 60) fonte = m[0];
  }
  if (!fonte) fonte = quem && quem !== "JODO" ? quem : "";
  if (!fonte) return ["82"]; // vídeo próprio (sem artista no título)
  fonte = fonte.replace(/\((?:prod|beat)[^)]*\)/gi, "").replace(/\bprod\.?\s.*$/i, "").replace(/·.*$/, "");
  const lista = fonte
    .split(SEP)
    .map((x) => normNome(x))
    .filter((x) => x && x.length > 1 && !/^(jodo|prod|beat|vídeo|video|oficial|clipe)$/i.test(x));
  return [...new Set(lista)].slice(0, 4).length ? [...new Set(lista)].slice(0, 4) : ["82"];
}

export function montarPainel(videosBrutos) {
  const vistos = new Set();
  const videos = [];
  const porCanal = new Map();
  for (const v of videosBrutos) {
    if (!v.yt || vistos.has(v.yt) || REMOVER.has(v.yt)) continue;
    vistos.add(v.yt);
    let artistas = ARTISTAS_VIDEO[v.yt] ? [...ARTISTAS_VIDEO[v.yt]] : artistasDe(v);
    artistas = artistas.filter((a) => !NOMES_FORA.has(sem(a)));
    if (!artistas.length) artistas = ["82"];
    const cat = CATEGORIA_VIDEO[v.yt] || categoria(v.titulo || "");
    const principal = artistas[0];
    const canalLoc = CANAL_LOCAL[sem(v.quem || "")] || null;
    const loc = localDe(principal) || artistas.map((a) => localDe(a)).find(Boolean) || canalLoc || null;
    if (canalLoc) artistas.forEach((a) => { if (!localDe(a) && !porCanal.has(a)) porCanal.set(a, canalLoc); });
    videos.push({
      yt: v.yt,
      titulo: v.titulo,
      data: v.data,
      ano: String(v.data || "").slice(0, 4),
      views: v.views || 0,
      artistas,
      categoria: cat,
      cidade: loc ? loc[0] : "A mapear",
      uf: loc ? loc[1] : "—",
      quem: v.quem || "",
      papel: PAPEL_VIDEO[v.yt] || v.papel || "",
    });
  }

  // agrega por artista (um vídeo conta para cada artista envolvido)
  const mapa = new Map();
  for (const v of videos) {
    for (const a of v.artistas) {
      if (!mapa.has(a)) mapa.set(a, { nome: a, videos: [], views: 0 });
      const o = mapa.get(a);
      o.videos.push(v.yt);
      o.views += v.views;
    }
  }
  const artistas = [...mapa.values()].map((o) => {
    const loc = localDe(o.nome) || porCanal.get(o.nome) || null;
    return { nome: o.nome, videos: o.videos, views: o.views, cidade: loc ? loc[0] : "A mapear", uf: loc ? loc[1] : "—" };
  });

  const total = videos.reduce((s, v) => s + v.views, 0);
  return {
    videos,
    artistas,
    totais: {
      views: total,
      videos: videos.length,
      artistas: artistas.length,
      cidades: new Set(artistas.filter((a) => a.uf !== "—").map((a) => `${a.cidade}-${a.uf}`)).size,
      ufs: new Set(artistas.filter((a) => a.uf !== "—").map((a) => a.uf)).size,
      anoInicio: Math.min(...videos.map((v) => +v.ano || 9999)),
      anoFim: Math.max(...videos.map((v) => +v.ano || 0)),
    },
  };
}
