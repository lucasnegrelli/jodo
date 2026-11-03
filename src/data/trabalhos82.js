/*
  TRABALHOS DO 82. Duas trilhas:
    - SOM: o trampo sonoro do 82 (discos, mixtapes, EPs, singles).
    - VISUAL: o que o 82 filmou/editou para outros artistas (clipes, séries, curtas).
  Mais obras à parte: O Retrato da Loucura (filme), Visceras (foto e arte), Rap Delivery (projeto próprio).

  Fonte: playlist "VydeoZz byy 82", canal JODO, canais Sushi Humano e Rap Delivery (_infos/youtube*),
  linha do tempo (_memoria/linha-do-tempo.md) e correções do Lucas em 14/10/2026.
  Datas = publicação no YouTube. 'confirmar' marca o que o Lucas ainda precisa checar.
*/

const v = (yt, data, titulo, quem, papel, views, nota) => ({ yt, data, titulo, quem, papel, views, nota });

export const identidades = [
  { nome: "SLIM", anos: "2008 → 2015", texto: "O nome das ruas: pixo, graffiti e stickers. Começou assim, em 2008. Na época da Sushi Humano ainda era o Slim, e segue sendo um dos nomes." },
  { nome: "VÍSCERAS82", anos: "2015 → 2019", texto: "Nasce em 2015. O olhar por trás da câmera: fotografia, clipes e o arquivo dos bastidores." },
  { nome: "ALTAMENTE82", anos: "2020 → 2023", texto: "O esquizorancheiro. Dog House, rimas e a origem do Rap Delivery. Aposentado ao sair do Rancho." },
  { nome: "KRAPNEK82", anos: "2024 → hoje", texto: "Rap, horrorcore e produção suja sem filtro. Häxan, Intravenal e o que vem." },
];

export const faixas = {
  arquivo: { id: "arquivo", titulo: "Arquivo", subtitulo: "O que sobrou do começo.", cor: "var(--jodo-amarelo)" },
  som: {
    id: "som",
    titulo: "Som",
    subtitulo: "O trampo sonoro do 82: o que ele escreveu, rimou e lançou.",
    cor: "var(--jodo-verde)",
  },
  visual: {
    id: "visual",
    titulo: "Visual",
    subtitulo: "O trampo visual: o que o 82 filmou e editou para outros artistas.",
    cor: "var(--jodo-azul)",
  },
};

export const fases = [
  /* ===================== ARQUIVO (SLIM) ===================== */
  {
    faixa: "arquivo",
    id: "slim",
    anos: "2007 — 2015",
    titulo: "SLIM: pixo, graffiti e stickers",
    cor: "var(--jodo-amarelo)",
    resumo: "O nome das ruas. Do que sobrou nos CDs e HDs: bmps de 2008, graffitis, os stickers de 2010 e os escritos.",
    itens: [
      { img: "/82/arquivo/graffiti-2007.jpg", data: "2007-09", titulo: "Graffiti.BMP", quem: "CD Backup", papel: "arquivo", views: null },
      { img: "/82/arquivo/slim-2008-a.jpg", data: "2008-08", titulo: "..SLIM...bmp", quem: "SLIM · CD Backup", papel: "arquivo", views: null, pixel: true },
      { img: "/82/arquivo/slim-2008-b.jpg", data: "2008-08", titulo: "0_~ SLIM 0_~.BMP", quem: "SLIM · CD Backup", papel: "arquivo", views: null, pixel: true },
      { img: "/82/arquivo/sticker-2010-a.jpg", data: "2010-09", titulo: "Stickers SLIM", quem: "SLIM · HD Recover", papel: "arquivo", views: null },
      { img: "/82/arquivo/sticker-2010-b.jpg", data: "2010-09", titulo: "Stickers SLIM (2)", quem: "SLIM · HD Recover", papel: "arquivo", views: null },
      { img: "/82/arquivo/sticker-2010-vetor.jpg", data: "2010-09", titulo: "Sticker vetorizado", quem: "SLIM · HD Recover", papel: "arquivo", views: null },
      { texto: "jamais esperemos a coisa mudar por si só / através das lentes assistiremos o maior show de nossas vidas / ... / não espere a coisa mudar / to louco / LOUCO", data: "2015-08", titulo: "SLIM.txt", quem: "Escritos inacabados", papel: "texto", views: null },
      { img: "/82/arquivo/slim-x-phineas-2025.jpg", data: "2025-03", titulo: "SLIM x PHINEA$", quem: "arte de 2025", papel: "arquivo", views: null, nota: "O nome volta." },
    ],
  },
  /* ===================== SOM ===================== */
  {
    faixa: "som",
    id: "primeiros-sons",
    anos: "2019",
    titulo: "Primeiros sons",
    cor: "var(--jodo-amarelo)",
    resumo:
      "Em Manaus, o 82 começa a fazer som. O primeiro projeto é com o 1LUM3 (Ilume) e o OLX. Depois vêm o Saull e o DK.",
    itens: [
      v("RYqfqbxcpX8", "2019-02", "$OMBRA$", "82 x 1LUM3 x OLX (beat Primata, mix Insyt)", "artista", 782, "Primeiro som do 82. Imagens e edição: 82."),
      v("taX3TlV3b14", "2019-03", "escutandoocéu (trinco ep.01)", "82 x Saull · imagem e edição: Insyt", "artista", 947, "Voz captada no Zumbi Studio."),
    ],
  },
  {
    faixa: "som",
    id: "dog-house",
    anos: "2020 — 2021",
    titulo: "Mixtape Dog House",
    cor: "var(--jodo-laranja)",
    resumo:
      "Uma única faixa: a mixtape que o DK produziu inteira, no Zumbi Studio, a casa do OLX, em Manaus.",
    itens: [
      v("louukt1mDTg", "2021-01", "mixtape doghouse", "82 + DK (prod. DK, Zumbi Studio)", "artista", 276, "A mixtape inteira, numa faixa só."),
    ],
  },
  {
    faixa: "som",
    id: "altamente-meninos",
    anos: "2020 — 2021",
    titulo: "Altamente82 e os meninos",
    cor: "var(--jodo-amarelo)",
    resumo:
      "Antes do Rap Delivery ter nome de disco: parcerias com o Sergio Estranho e o 1cort3 (beats deles), o Vblow e o Ian Lecter. A faixa IOURGUTE tem produção musical do Rancho Mont Gomer.",
    itens: [
      v("o3uYzhP1NzA", "2020-12", "continua", "82 (prod. DK)", "artista", 147),
      v("F2iYy4h-_7U", "2020-12", "RASCUNHO", "82 + Sergio Estranho", "artista", 691),
      v("IV30_dZ_dm8", "2020-12", "carcaça", "82 (beat 1cort3)", "artista", 91),
      v("ZBYOJDHv2fA", "2021-01", "Expresso", "Sergio Estranho + 82", "artista", 353),
      v("gM1-pOvLtC4", "2021-01", "PORTAL", "82, Sergio Estranho e Ian Lecter (prod. 1cort3)", "artista", 505),
      v("IPQMiwySfjE", "2021-01", "IOURGUTE TOP THERM", "82, 1cort3 e Estranho (prod. Rancho Mont Gomer)", "artista", 499),
      v("ytHHKm_wKDc", "2021-03", "ZABUTRE", "VBLOW + 82", "artista", 290),
      v("glCdBWhbeRY", "2021-06", "DÉCADAS", "82 e Sergio Estranho (beat do Sergio)", "artista", 375),
    ],
  },
  {
    faixa: "som",
    id: "mundo-estranho",
    anos: "2023",
    titulo: "Mundo Estranho",
    cor: "var(--jodo-azul)",
    resumo: "Saída do Rancho, mixtape 82 x Cevas e o EP Mundo Estranho. O Altamente82 é aposentado.",
    itens: [v("z5jI9H2ZMks", "2023-09", "Memória de Peixe", "82 e Cevas (prod. Sergio Estranho)", "artista", 458)],
  },
  {
    faixa: "som",
    id: "haxan",
    anos: "2025",
    titulo: "Häxan",
    cor: "var(--jodo-roxo)",
    resumo:
      "O primeiro EP do KRAPNEK82. Beats do Msor e do HeadB, capa do avatar do 82 por @rodolfo_keoma, motion do gxbrl_0. Lançado na Matilha Cultural.",
    itens: [
      v("kAw_1UgNqVg", "2025-03", "Se Eu Rir", "KRAPNEK82 · Häxan", "artista", 244),
      v("TabOu0jvAb4", "2025-03", "Realeza (prod. Msor)", "KRAPNEK82 · Häxan", "artista", 235),
      v("DRkCBHQyi00", "2025-03", "Abençoa", "KRAPNEK82 · Häxan", "artista", 101),
      v("2o5OWoEM_tA", "2025-05", "Vertigem (prod. HeadB)", "KRAPNEK82 · Häxan", "artista", 101),
      v("HGyUqv0Vda0", "2025-03", "Coisas Transparentes", "KRAPNEK82 · Häxan", "artista", 76),
    ],
  },
  {
    faixa: "som",
    id: "intravenal",
    anos: "2026",
    titulo: "Intravenal",
    cor: "var(--jodo-verde)",
    resumo: "EP com o PHINEA$, em cinco faixas. Rap, horrorcore e produção suja, sem filtro. O último lançamento é o K-OS.",
    itens: [
      v("gcTz6i2nwII", "2026-01", "5. MANUAL", "akaphineas e KRAPNEK82", "artista", 331),
      v("I6cvxEs1otg", "2026-01", "1. SINAIS", "akaphineas e KRAPNEK82", "artista", 111),
      v("fB4r6Ggm1p4", "2026-01", "3. ENGRENAGEM", "akaphineas e KRAPNEK82", "artista", 79),
      v("IDpYmEUT5rY", "2026-01", "2. APORTE", "akaphineas e KRAPNEK82", "artista", 59),
      v("QwaWUmaIjq8", "2026-01", "4. INVERSO", "akaphineas e KRAPNEK82", "artista", 48),
    ],
  },

  /* ===================== VISUAL ===================== */
  {
    faixa: "visual",
    id: "sushi-humano",
    anos: "2013 — 2016",
    titulo: "Sushi Humano",
    cor: "var(--jodo-azul)",
    resumo:
      "Época do Slim. Faculdade de design, câmera na mão e a primeira produtora. Estrela Morta, do Edgar, inaugura a Sushi Humano em abril de 2014 (gravado em 2013).",
    itens: [
      v("VMSJayrCWks", "2014-04", "Estrela Morta", "Edgar", "imagem e edição", 252711, "O primeiro clipe. Inaugura a Sushi Humano."),
      v("uSLarG1InvA", "2014-10", "Vai José", "Concha", "imagem e edição", 4996),
      v("-h4r8s1HAfc", "2014-12", "Conchativa", "Concha", "imagem e edição", 1435),
      v("tcKUD1A4P7k", "2014-10", "Nolombo #Curta", "Sushi Humano", "produção", 487, "Série de performances registradas em 2014."),
      v("rPRaEa0VNr8", "2015-12", "Psilocibinas Alinhadas (full album)", "Matagal Hi-Tek", "imagem e edição", 14914),
      v("cJCTYPAQQIw", "2015-12", "Terreiro Digital (full album)", "Matagal Hi-Tek", "imagem e edição", 4548),
      v("S1eDrT02lzA", "2016-06", "A Intera Decisina", "Matagal Hi-Tek", "imagem e edição", 1526),
      v("0d5Te6mEqFI", "2016-07", "APelo", "2DE1", "imagem e edição", 11292),
      v("vDbodjoA7gA", "2016-09", "Deus e o Átomo (Making of #5)", "Medulla", "imagem e edição", 2591),
    ],
  },
  {
    faixa: "visual",
    id: "jodo",
    anos: "2017 — 2018",
    titulo: "JODO",
    cor: "var(--jodo-verde)",
    resumo:
      "2016 foi o ano sóbrio. Em 2017, a JODO: um clipe por semana, uma casa por vez, pelo Brasil. Primeiro vídeo do canal em abril de 2017, e os maiores números do arquivo.",
    itens: [
      v("2BdVAm7qvk0", "2018-01", "Da Era do Amor Virtual", "Makalister", "imagem e edição", 435689, "O vídeo mais visto da trajetória."),
      v("TEZQQn8MSJo", "2017-10", "Breaking the Waves", "Makalister", "imagem e edição", 186075),
      v("a3wOIAFp9vk", "2017-03", "d'iolho nas blitz (remix)", "davzera", "imagem e edição", 154825),
      v("3U8D4AXPHhI", "2017-06", "ARISCO", "Matheus Coringa, Sergio Estranho, Cayo Carig, João Alquímico e OLX", "imagem e edição", 145384),
      v("27IRwt0lclw", "2017-11", "tipo dracula", "davzera", "imagem e edição", 113930),
      v("y5G2MQcldEo", "2017-11", "Instalações Noturnas", "Lessa Gustavo, Makalister e lvks", "imagem e edição", 88348),
      v("viK84xFAmN4", "2017-05", "os sinos que não lustrei", "Lessa Gustavo", "imagem e edição", 52663),
      v("bK8allq-X1M", "2017-10", "o frear provocando o gastar dos pneus", "Victor Xamã e Lessa Gustavo", "imagem e edição", 39350),
      v("_bWzQwWroRE", "2018-05", "óculos escuros e moletons furados", "dro e niLL", "imagem e edição", 26034),
      v("0Z_NVkiwR7A", "2018-07", "Sonho Lúcido", "Victor Xamã", "imagem e edição", 16955),
      v("knRp0BF50yY", "2017-04", "Os Trapalhões 1977", "Sergio Estranho", "imagem e edição", 11625),
      v("fBB_eGTEEQY", "2017-03", "Fim da Grande Depressão 1933", "Sergio Estranho", "imagem e edição", 10141),
      v("c--UAnJGCGA", "2017-04", "o esvaziar e o transbordar", "d4crvz", "imagem e edição", 3108),
      v("Ct-6xkRXAmw", "2017-04", "Salvador", "Nalesso Dandy", "imagem e edição", 502, "Primeiro vídeo do canal JODO."),
      v("xPc3vEr_7bQ", "2018-06", "LOFIREFOGO BEAT TAPE", "Arit x JODO", "produção", 935),
    ],
  },
  {
    faixa: "visual",
    id: "manaus-jodam",
    anos: "2018 — 2021",
    titulo: "Manaus e a JODAM",
    cor: "var(--jodo-amarelo)",
    resumo:
      "52 horas de ônibus até Belém e seis dias de barco até Manaus. A JODO vira JODAM. O 82 filma e edita a cena: Van MC, Nixon, DK, Herick OLX, Saull, INSYT e o Vblow.",
    itens: [
      v("HAtrs4fNb00", "2020-02", "AM420Nia Pega Fogo", "VBLOW", "imagem e edição", 1097),
      v("RSyMihkWSDA", "2020-08", "Teia no Teto", "DK, Ian Lecter e Herick OLX", "imagem e edição", 996),
      v("Tmlx2XwhCEg", "2018-10", "Lado Oe$te", "Mc Tola part. Van MC", "imagem e edição", 706),
      v("u1Hv9v5XeKQ", "2018-10", "Não Tem Outra Vez", "Van MC", "imagem e edição", 675),
      v("XgP3H6Ynh2U", "2018-10", "Rasga Mortalha", "Nixon $ilva", "imagem e edição", 2578),
      v("sbAko4AgcYo", "2018-10", "Ruído Final", "Herick OLX e Arkano (mix Zumbi Stúdio)", "imagem e edição", 699, "Edição de cores: Visceras82."),
      v("eDfki_ICzGI", "2019-03", "BOA PRA NO$Z (ttape byy INSYT)", "INSYT", "imagem e edição", 569),
      v("z3B8uQyoDK8", "2019-12", "HEAD$HOT", "JODAM", "produção", 646),
      v("sXFxy_y1xDA", "2020-03", "BeatZzSessionZz $1", "INSYT e Saull OE", "imagem e edição", 196),
      v("nyq8G7GEJAY", "2020-04", "BeatZzSessionZz $2$", "DK e Herick OLX", "imagem e edição", 271),
      v("zLd4fo25vVY", "2020-12", "BeatZzSessionZz $3$", "DK e Herick OLX", "imagem e edição", 105),
      v("ht3FR__2uqM", "2021-02", "82% ep", "EP do DK e do OLX", "imagem e edição", 339, "O 82 só filmou e editou. Não rimou."),
      v("HQNvKm8nU0c", "2021-01", "Breaking Bad (BeatTape)", "DK & OLX", "imagem e edição", 356),
      v("2mzrTUb7I4o", "2020-12", "paguem os beats: O filme", "El Mandarim (beats feitos à mão)", "imagem e edição", 325),
      v("iIBr_rFL7NM", "2021-03", "MONTE RORAIMA", "HVSHbeats (trilha) · fotos de Nilton Barth Filho", "imagem e edição", 222, "Montagem do 82."),
    ],
  },
  {
    faixa: "visual",
    id: "jodo-volta",
    anos: "2023 — 2025",
    titulo: "A JODO volta",
    cor: "var(--jodo-roxo)",
    resumo:
      "Depois do Rancho, a JODO retoma: a série Corre Criativo, a festa no Cafundó e os clipes do PHINEA$ e do 1LUM3.",
    itens: [
      v("MC_RX-io2JM", "2025-06", "JODO no Cafundó", "Margarida The Cat, PHINEA$, 82 e 1LUM3", "produção", 88),
      v("UZ4fFpaYcNM", "2025-07", "JARDIM EP (full video)", "akaphineas e Karmo", "imagem e edição", 363),
      v("Bi9I-xs-lXQ", "2025-04", "sonhos de ícaro", "akaphineas pt. 1LUM3", "imagem e edição", 344),
      v("5PsXlvndyw4", "2025-05", "Corre Criativo, ep. 2", "Recorte Inteligente", "produção", 92),
      v("7OK8bTXpwro", "2025-02", "Corre Criativo, ep. 1", "QG dos Crochês / Agulha de Pilha", "produção", 48),
      v("e00f5Tp0z18", "2025-06", "Show do Marco Nalesso no Teatro Centro da Terra", "Marco Nalesso", "produção", 105),
      v("vAYthto_XLE", "2023-04", "O Rap me Resgatou", "Van MC", "imagem e edição", 408),
      v("SL_dwHUcB9Y", "2023-07", "Conhecendo de perto", "d4crvz", "produção", 123),
      v("K2UlwHApFiQ", "2025-05", "Tamo na Luta", "Van MC (prod. INSYT)", "imagem e edição", 344),
    ],
  },
  {
    faixa: "visual",
    id: "curtas",
    anos: "2021 — 2026",
    titulo: "Curtas",
    cor: "var(--jodo-rosa)",
    resumo: "Os curtas do 82, onde a imagem vai na frente do som.",
    itens: [
      v("cu1sTA7JOz8", "2026-01", "Intravenoso", "KRAPNEK82 · short film", "imagem e edição", 50),
      v("K4Uk39uNDmY", "2021-02", "GARAPA", "Trinca e 82", "imagem e edição", 325, "Um dia com o avô Armindo Negrelli, 87 anos, colhendo cana. Beats do Estranho e do OLX (2014 e 2015)."),
      v("PvLPXBbQKG0", "2020-08", "Pixação RADAR r : SEDUTORES t", "82", "imagem e edição", 11761),
    ],
  },
];

/* Obras à parte (não entram na linha do tempo) */
export const obras = [
  {
    id: "retrato",
    titulo: "O Retrato da Loucura",
    tag: "Filme · 2027",
    texto:
      "Um filme que o 82 filmou nos bastidores de todos esses trabalhos e ainda não lançou. Programado para o ano que vem, junto com os 10 anos da JODO. Está sendo montado e editado agora.",
    cor: "var(--jodo-verde)",
    nota: "123 GB de takes de 2016-12 a 2018-01.",
  },
  {
    id: "visceras",
    titulo: "Visceras",
    tag: "Foto e arte · página própria",
    texto:
      "A fotografia e a arte do 82, desde 2015. Terão uma página especial, além da JODO. Ainda em organização.",
    cor: "var(--jodo-rosa)",
    nota: "Em construção.",
  },
  {
    id: "rap-delivery",
    titulo: "Rap Delivery",
    tag: "Projeto à parte · com 1cort3, Sergio Estranho e domrafa",
    texto: "Um grupo, um EP, um disco e uma forma própria de entregar rima. Tem página e identidade próprias.",
    cor: "var(--jodo-laranja)",
    href: "/artistas/rap-delivery",
    nota: "Entrar na rota →",
  },
];

export function totais() {
  const itens = fases.flatMap((f) => f.itens.filter((i) => i.yt));
  return {
    videos: itens.length,
    views: itens.reduce((s, i) => s + (i.views || 0), 0),
    fases: fases.length,
  };
}
