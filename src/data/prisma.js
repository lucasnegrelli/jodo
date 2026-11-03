// capítulos da página do PRISM∆ (do mais novo ao mais antigo). `nivel` = cota do Rio Negro no porto de Manaus
// no dia (ANA, estação 14990000), em metros. Fotos: Instagram @prism4__ e media kit dele.
const SP = (id) => ["spotify", `https://open.spotify.com/album/${id}`];
const YT = (id) => ["youtube", `https://www.youtube.com/watch?v=${id}`];
const IG = (code) => ["instagram", `https://www.instagram.com/p/${code}/`];
const SC = (slug) => ["soundcloud", `https://soundcloud.com/prisma-874307651/${slug}`];

export const PERFIS = {
  instagram: "https://www.instagram.com/prism4__/",
  spotify: "https://open.spotify.com/intl-pt/artist/3xCf6fwudNlAFr8cBxnEhN",
  soundcloud: "https://soundcloud.com/prisma-874307651",
};

export const HOJE = { nivel: 17.41, data: "16.10.2026" }; // reserva; a página busca o valor do dia em /api/rio-negro
export const FUNDO_TITULO = ["kit-mic", "kit-peixes"];

const TODOS = [
  {
    id: "verso", tipo: "verso", nivel: 27.54, data: "22.05.2026",
    texto: ["preferi viver", "imerso", "no rio"],
    fundo: ["kit-mic", "kit-peixes"],
  },
  {
    id: "buya", est: "serif", fundo: ["kit-tinta", "kit-peixes"], ano: "2025", data: "01.03.2025", nivel: 23.92, sel: "videoclipe · faixa do ruído das águas",
    titulo: "buya",
    texto: ["Videoclipe de “Buya”, com produção de LF, publicado no canal do Bruxos do Norte logo depois do álbum.", "O post de divulgação dele, “Obra Vida Cobra”: a Cobra-Canoa Buyasú rastejou pela Amazônia, abrindo caminhos e moldando as margens dos rios que hoje nos conectam.", "Ouroboros, um dos símbolos mais antigos da Alquimia, representa a renovação e a transformação de si mesmo: o eterno movimento cíclico da vida."],
    clip: { src: "buya", alt: "Trecho do videoclipe de Buya" },
    links: [YT("yCjUCAOIwiA")],
  },
  {
    id: "ruido", tipo: "ruido", est: "picho", fundo: ["kit-peixes", "kit-mic"], ano: "2025", data: "28.02.2025", nivel: 23.82, sel: "álbum\ncom vicente blow e lf",
    titulo: "ruído das águas",
    lide: "“Ruído das Águas” é o chamado de volta para casa.",
    texto: ["Uma imersão no olho do igarapé, onde bebemos do conhecimento ancestral. É a voz amazônica que ecoa, conectando todos os territórios através dos rios.", "O caminho da cobra barco é o caminho da transformação: uma jornada contra o feitiço do apagamento cultural que permeia há séculos."],
    detalhe: "7 faixas · produção de LF · com Dom Brawl e Walle",
    falas: [{ t: "Cria de rio. Também é bicho d’água." }],
    pintura: "ruido-arte", lista: "ruido-lista",
    credito: { t: "arte da capa e da contracapa", nome: "KdeirA", url: "https://instagram.com/_eusamueu_" },
    links: [SP("3xqESrPBdKu22WExN2bnl9"), YT("AyMgXCTz8wQ")],
  },
  {
    id: "vazante", est: "cond", fundo: ["kit-pb", "kit-tinta"], ano: "2024", data: "02.11.2024", nivel: 12.11, sel: "vazante 2 · vídeo oficial · 25.10.2024",
    titulo: "vazante 2",
    texto: ["“Das margens do rio seco, às margens eu sigo vivo...”", "Vazante 2 saiu em 25 de outubro de 2024, em todas as plataformas digitais, com videoclipe no YouTube.", "No dia do post, 2 de novembro, o Rio Negro marcou 12,11 m no porto de Manaus: o recorde de vazante."],
    clip: { src: "vaz", alt: "Trecho do vídeo oficial de Vazante 2" },
    falas: [{ t: "Manaus é território ancestral. O Amazonas é território ancestral." }],
    links: [YT("5bbwrTqhHuQ")],
  },
  {
    id: "cena", tipo: "cena", est: "serif", fundo: ["raizes", "nago2"], ano: "2022 — 2025", data: "", nivel: 20.12, sel: "festivais · eventos · freestyle",
    titulo: "na cena",
    lide: "A cena de Manaus se faz em cartaz colado na rua, em casa pequena e em freestyle gravado no improviso.",
    texto: ["É nesse circuito independente que o Prism4 circula: sobe no palco do Ensaio Aberto, soundsystem do Lado Obscuro do Norte, entra na primeira edição do Festival Raízes, que nasceu para fomentar a cultura Hip-Hop da região Norte, e já gravou freestyle pela JODO. Ele não espera a cena chegar: aparece, produz e faz acontecer."],
    itens: [
      { src: "ensaio", data: "05.12.2025", titulo: "ensaio aberto", texto: "Segunda edição do soundsystem do Lado Obscuro do Norte, no Curupira Mãe do Mato, com open mic." },
      { src: "raizes", data: "17.10.2025", titulo: "festival raízes", texto: "1ª edição, no Ancestrals Bar: fomentar a cultura da região Norte, principalmente o Hip-Hop." },
      { src: "nago1", data: "26.10.2022", titulo: "nagô buya", texto: "Freestyle com @math.braids e imagética de @vicentius420, pela JODO." },
    ],
  },
  {
    id: "soundcloud", est: "fina", fundo: ["nota", "kit-palco"], tipo: "soundcloud", ano: "2023 — 2026", data: "", nivel: null, sel: "soundcloud · 40 faixas",
    titulo: "o leito",
    texto: ["Beat tapes, guias, remixes e sessões. É a plataforma que ele mais usa."],
    pedras: [
      ["2024", "beat tape · B A P", 547, "beat-tape-b-a-p"],
      ["2023", "eu vi um menino correndo", 312, "eu-vi-um-menino-correndo"],
      ["2024", "beattape · M.P.S.P 2", 233, "beattape-mpsp-2"],
      ["2024", "bluegreen-tape", 192, "blueegreen"],
      ["2026", "luv many sides · com acura (guia)", 120, "prism4-acura-lovemanysides"],
      ["2023", "jazzzzzz", 116, "jazzzzzz"],
      ["2024", "live session · QZL FDR · OGBD", 107, "live-session"],
      ["2026", "flames · com 1lum3 (guia 03)", 53, "1lum3-prism4-flames-guia-03"],
      ["2026", "samba doom · MF DOOM remix", 9, "samba-doom-mf-doom-remix-prod"],
      ["2026", "corte d'alma · remix com bruno con$", 13, "prism4-bruno-con-corte-dalma"],
    ],
    imgs: [{ src: "barco", alt: "Desenho de um barco no rio", forma: "retrato" }],
    links: [["soundcloud", "https://soundcloud.com/prisma-874307651/tracks"]],
  },
  {
    id: "poema", est: "serif", fundo: ["rua", "kit-pb"], tipo: "poema", ano: "2021", data: "02.12.2021", nivel: 21.03, sel: "porto de manaus",
    titulo: "o rio é o crucifixo",
    texto: ["Manaus moderna é o fluxo, fede a mijo, o norte é fixo; o Rio é o crucifixo."],
    imgs: [
      { src: "rio1", alt: "Porto de Manaus em preto e branco", forma: "quadrada" },
      { src: "rio2", alt: "Margem do rio em Manaus em preto e branco", forma: "quadrada" },
    ],
  },
  {
    id: "coletivos", est: "fina", fundo: ["dj2", "kit-abacaxi"], tipo: "coletivos", ano: "", data: "", nivel: null, sel: "os koletivos",
    titulo: "a correnteza",
    texto: ["Prism4 é membro dos koletivos:"],
    coletivos: [
      ["JODO", "https://www.instagram.com/_jodo/"],
      ["Bruxos do Norte", "https://www.instagram.com/bruxosdonorte/"],
      ["Falha.com.br", "https://www.instagram.com/falha.com.brasil/"],
      ["Sala Reserva", "https://www.instagram.com/sala.reserva/"],
      ["Lado Obscuro do Norte", "https://www.instagram.com/ladoobscurodonorte/"],
      ["Original do Norte", "https://www.instagram.com/original.do.norte/"],
      ["Norte Grime Sesh", "https://www.instagram.com/nortegrimesesh/"],
    ],
    detalhe: "Bruxos do Norte no TEDx Amazônia: das margens do rio às margens da cidade",
    imgs: [{ src: "dj1", alt: "MC e DJ em um set em Manaus", forma: "paisagem" }],
    clip: { src: "ted", alt: "Trecho do Bruxos do Norte no TEDx Amazônia" },
    links: [YT("5LJ0gZ71FRM")],
  },
  {
    id: "contato", est: "serif", fundo: ["kit-mic", "kit-peixes"], tipo: "contato", ano: "", data: "", nivel: null, sel: "contato",
    titulo: "PRISM∆",
    texto: ["Cantor, rapper e produtor musical de Manaus. Produção, beatmaker, captação, mixagem e direção musical."],
    email: "prismamemen@gmail.com",
    telefone: "(92) 9 8545-3840",
    tel: "+5592985453840",
    imgs: [{ src: "kit-sil", alt: "Silhueta do Prism4 contra o céu azul", forma: "paisagem" }],
  },

  {
    id: "quem", est: "serif", fundo: ["kit-peixes", "kit-pb"], ano: "", data: "", nivel: null, sel: "quem é",
    titulo: "quem é",
    lide: "Cantor, rapper e produtor musical de Manaus.",
    texto: ["Conhecido por seus trabalhos em colaboração com o grupo de rap Bruxos do Norte, que usa a música para promover a inclusão social e valorizar a cultura periférica na Amazônia."],
    tagsTitulo: "sonoridade",
    tags: ["boom bap", "drumless", "boom trap", "trap", "drill", "uk garage", "house", "experimentais"],
    imgs: [{ src: "kit-mic-cut", alt: "Prism4 cantando ao microfone", forma: "recorte" }],
  },
  {
    id: "estudio", est: "serif", fundo: ["kit-abacaxi", "kit-tinta"], ano: "", data: "", nivel: null, sel: "como produtor",
    titulo: "estúdio",
    lide: "Produtor, beatmaker e diretor musical: acompanha artistas e MCs nos estúdios Lado Obscuro do Norte e Fronteira Imaginária.",
    texto: ["Cuida do caminho entre a ideia e a faixa pronta e leva esse olhar também para o audiovisual, com clipes e curtas-metragens no histórico."],
    tagsTitulo: "o que faz",
    tags: ["produção", "beatmaker", "captação", "mixagem", "direção musical"],
    ciclo: ["beat-tape-b-a-p", "beattape-mpsp-2", "blueegreen", "live-session", "samba-doom-mf-doom-remix-prod"],
  },
  {
    id: "palcos", tipo: "palcos", est: "serif", fundo: ["kit-mic", "kit-peixes"], ano: "", data: "", nivel: null, sel: "ao vivo",
    titulo: "palcos",
    lide: "Do microfone à mesa de som, já passou por festivais e eventos de Manaus e da Amazônia.",
    texto: [],
    lineup: ["Até o Tucupi", "TEDx Amazônia", "Perifa Amazônia", "LF Convida", "Baile de Cria", "Hip Hop MHC"],
    fotos: [
      { src: "kit-palco", alt: "Prism4 e o DJ na mesa, lente olho de peixe" },
      { src: "kit-multidao", alt: "Multidão em uma festa em Manaus" },
      { src: "dj2", alt: "Público de braços levantados em uma festa" },
      { src: "palco-azul", alt: "Prism4 no palco sob luz azul" },
      { src: "palco-roxo", alt: "Palco com luz roxa e piso xadrez em uma apresentação" },
    ],
  },
  {
    id: "cores", tipo: "feed", est: "serif", fundo: ["cor-neon", "cor-carro"], ano: "2022 — 2023", data: "", nivel: null, sel: "o feed da jodo",
    titulo: "o feed",
    texto: ["A JODO nessa época, em cor estourada. Ele fez vários dos posts. Cada quadro abre o post de verdade no Instagram."],
  },
];

const ORDEM = ["verso", "quem", "ruido", "vazante", "buya", "estudio", "palcos", "cena", "soundcloud", "cores", "poema", "coletivos", "contato"];
export const CAPITULOS = ORDEM.map((id) => TODOS.find((c) => c.id === id));
