/*
  RAP DELIVERY: projeto à parte do 82 com 1cort3 (Caio), Sergio Estranho e domrafa.
  Fonte: canal Rap Delivery no YouTube (_infos/youtube_rapdelivery) e _memoria/rap-delivery.md.
*/
const f = (yt, data, titulo, quem, views, nota) => ({ yt, data, titulo, quem, views, nota });

export const integrantes = [
  { nome: "1cort3", papel: "MC e beatmaker", href: "/artistas/1cort3" },
  { nome: "Sergio Estranho", papel: "MC e beatmaker", href: "/artistas/sergio-estranho" },
  { nome: "domrafa", papel: "produtor e beatmaker", href: "/artistas/domrafa" },
  { nome: "82", papel: "MC, edição e imagem", href: "/artistas/82" },
];

export const paradas = [
  {
    id: "pedido",
    numero: "01",
    titulo: "O pedido",
    anos: "2021",
    texto: "Primeiros vídeos. Rap Delivery nasce como brincadeira de entrega: boa sorte, balada espacial e uma noite de terror no Playcenter.",
    faixas: [
      f("RvGwjcL7t6o", "2021-02", "Rap Delivery", "Rap Delivery", 711),
      f("tzlwnsVa0bE", "2021-05", "Boa Sorte", "Rap Delivery", 260),
      f("ShTQ-pZ3Yyo", "2021-07", "Balada Espacial", "Rap Delivery", 313),
      f("8Tg92hxUBDo", "2021-07", "Dança da Dancinha", "Rap Delivery", 247),
      f("G-im-OYcTBM", "2021-08", "Noite de Terror do Playcenter", "Rap Delivery x Barbo the Brabo", 332),
    ],
  },
  {
    id: "a-caminho",
    numero: "02",
    titulo: "A caminho",
    anos: "2022",
    texto: "O EP de janeiro de 2022, prenunciando o primeiro álbum do super grupo de entregadores de raps. Três faixas que nasceram juntas.",
    tracklist: ["Piruetas", "Bruxaria", "Nada"],
    creditos: [
      "Letras e vozes: 1cort3, 82, Sergio Estranho",
      "Instrumentais: 1cort3",
      "Produção musical: 1cort3 e Msor",
      "Mix e master: domrafa",
      "Vídeo: 82",
    ],
    faixas: [
      f("KKGczN_9310", "2022-01", "A Caminho (full EP)", "Rap Delivery", 804),
    ],
  },
  {
    id: "single",
    numero: "02b",
    titulo: "22.02.2022 20:02",
    anos: "2022",
    texto: "Uma faixa e um corte: 82 e 1cort3, ainda antes do disco.",
    faixas: [f("vuHVgBhz2SI", "2022-02", "22.02.2022 20:02", "82 + 1cort3", 265)],
  },
  {
    id: "rimas-pra-viagem",
    numero: "03",
    titulo: "Rimas pra viagem",
    anos: "set/2022",
    texto: "O disco. Doze entregas com beats do DK, do Msor, do domrafa, do DJ Batata'Killa e do Sergio, e convidados como Eloy Polêmico, Matheus Coringa, Erickillaz e El Mandarim.",
    faixas: [
      f("WTbSdPdlb1M", "2022-09", "Rimas pra Viagem (full album)", "Rap Delivery · imagens e edição do visualizer: 82, com os assets da capa", 634),
      f("KqnFZu4eeOc", "2022-09", "2 · Correria Trupicante", "feat. Jayro e Matheus Coringa · prod. DJ Batata'Killa", 964),
      f("Ce9q7FI12ig", "2022-09", "3 · Quinta Nova Sexta", "prod. Msor", 62),
      f("qtHRCgUJH18", "2022-09", "4 · Entrega Não Rastreada", "prod. DK", 3244),
      f("GR9J1G5tGRI", "2022-09", "5 · Dia de Folga no Frio", "feat. Eloy Polêmico · prod. DK", 435),
      f("qbA_eBZEh-U", "2022-09", "6 · Dando Grau na Bad", "prod. Sergio Estranho", 617),
      f("9h1gRYk1O-w", "2022-09", "7 · Entrega às 17:03", "prod. domrafa", 153),
      f("5E6gafrDyik", "2022-05", "8 · No Fronte", "feat. Erickillaz · prod. domrafa · clipe", 550),
      f("uQXZSAKZ4q4", "2022-09", "9 · Espectros Noturnos", "feat. eL Mandarim · prod. domrafa", 669),
      f("YyCLnnu2L2g", "2022-09", "10 · Corte Estranho", "feat. Affneguin, Obelga, Sergio Estranho e Eloy Polêmico", 277),
      f("Pgxcv-dxaIE", "2022-09", "11 · Corujão", "prod. DK", 289),
      f("spsZROURqU8", "2022-09", "12 · After", "prod. Msor", 129),
    ],
  },
  {
    id: "volta",
    numero: "04",
    titulo: "De volta à rota",
    anos: "2025",
    texto: "O Dia de Folga no Frio ganha vídeo, três anos depois. E os meninos seguem entregando: o 1cort3 solo, o Sergio com os vídeos do #TFT, o domrafa nas produções.",
    faixas: [f("th_XvxLGiao", "2025-02", "Dia de Folga no Frio", "feat. Eloy Polêmico", 951)],
  },
];
