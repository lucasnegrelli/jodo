// Página do Vicente Blow (VBLXW): capítulos do mais novo ao mais antigo. Fatos: Spotify, Deezer, YouTube e a mini bio que ele entregou.
// `com` = ids de src/data/conexoes.js. `fogo` = intensidade do fogo (0–1) e `agua` = o quanto o rio apaga o fogo (0–1) naquele capítulo.
const SP = (id) => ["spotify", `https://open.spotify.com/album/${id}`];
const YT = (id) => ["youtube", `https://www.youtube.com/watch?v=${id}`];

export const PERFIS = {
  spotify: "https://open.spotify.com/intl-pt/artist/4iY9CEFwGAvy6A5jVqJgEc",
  deezer: "https://www.deezer.com/br/artist/104528662",
  instagram: "https://www.instagram.com/bruxobuya/",
  soundcloudGrupo: "https://soundcloud.com/jdvbdn",
  youtubeAlbum: "https://www.youtube.com/watch?v=AyMgXCTz8wQ",
};

export const CAPITULOS = [
  {
    id: "quem", ano: 1999, rotulo: "nascido em 99", sel: "quem é", fogo: 0.38, agua: 0,
    titulo: "nasceu marcado. sobreviveu rimando.",
    bio: [
      ["Nascido em 99, com o cordão umbilical enrolado no pescoço. Marcado para morrer. Vicente Blow ", "desafiou Deus e matou o próprio senhor destino", "."],
      ["Ver o mundo pelo pior lado foi sua terapia. Desenhar com sangue, seu primeiro ofício."],
      ["Foi o rap que acendeu a consciência política: o ódio bruto virou ", "munição organizada", " e a caneta, uma ", "mira a laser", " apontada para o alvo mais forte, o Capital."],
    ],
    fecho: "a.k.a. inimigo número 1 do estado",
    retrato: true,
  },
  {
    id: "ruido", ano: 2025, rotulo: "28.02.2025", sel: "álbum · com prism∆ e lf", fogo: 0.2, agua: 1,
    titulo: "ruído das águas",
    capa: "ruido",
    lide: "O fogo encontra o rio.",
    texto: [
      "Sete faixas assinadas por Vicente Blow e PRISM∆, com produção de LF. O disco chama de volta para casa: uma imersão no olho do igarapé, onde bebem do conhecimento ancestral.",
      "Quatro delas estão entre as cinco mais ouvidas do perfil dele no Spotify: “Crya de Ryo”, “Tipo Jodo”, “Buya” e “Bruxaria, o Alquimista”.",
    ],
    com: ["prisma", "lf"],
    credito: { t: "arte da capa", nome: "KdeirA", url: "https://instagram.com/_eusamueu_" },
    links: [SP("3xqESrPBdKu22WExN2bnl9"), YT("AyMgXCTz8wQ")],
  },
  {
    id: "2023", ano: 2023, rotulo: "2023", sel: "ep · single · feat", fogo: 0.5, agua: 0,
    titulo: "2023: reflexo, r.e.m.a e o mundo estranho",
    est: "cond",
    capas: ["reflexo", "rema"],
    lide: "Um EP, um single e uma parceria com o 82.",
    texto: [
      "Reflexo, EP com LF (29 de maio). R.E.M.A, single com Naycol Davan e produção do Insyt (18 de agosto).",
      "Em 1º de setembro, entra no Mundo Estranho, álbum do Altamente 82 e Cevas: em “Pode Pá, Ora Pois” ele divide o microfone com o 82 e o lvsraizK.",
    ],
    com: ["82", "lf"],
    links: [["youtube", "https://www.youtube.com/watch?v=FIIUH57aYSc"]],
  },
  {
    id: "2022", ano: 2022, rotulo: "12.04.2022", sel: "single", fogo: 0.55, agua: 0,
    titulo: "el fluxxxo",
    capa: "el-fluxxxo",
    lide: "Manaus em movimento.",
    texto: ["Lançado em 12 de abril de 2022, traz “Manaus City”, que ganhou segunda parte e vídeo oficial no canal do Bruxos do Norte."],
    links: [["youtube", "https://www.youtube.com/watch?v=1duWPyd9wrM"]],
  },
  {
    id: "2021", ano: 2021, rotulo: "2021", sel: "de julho a dezembro", fogo: 0.7, agua: 0,
    titulo: "2021: o ano que não parou",
    est: "cond",
    capas: ["a-vida-e-um-rio", "slip-like-time", "zabutre", "capital-crime", "rua-nova", "freestyle-quarentena"],
    lide: "Sete lançamentos em seis meses.",
    texto: [
      "Free$Tyle Quarentena em julho. Capital Crime e Rua Nova, Velhas Histórias em outubro. A Vida É um Rio e Slip Like Time em 6 de dezembro, Zabutre e Tomando um Chá logo depois.",
      "No meio do ano, o 1º lugar no festival de Hip-Hop Dimanaus. E “A Vida É um Rio” liga Manaus a São Paulo: a faixa tem o Sergio Estranho, do Rap Delivery.",
    ],
    com: ["sergio-estranho", "dom-brawl", "82", "lf"],
    links: [YT("mWALEYoxlpc")],
  },
  {
    id: "2020", ano: 2020, rotulo: "29.02.2020", sel: "o primeiro single", fogo: 1, agua: 0,
    titulo: "amazônia pega fogo",
    capa: "amazonia-pega-fogo",
    lide: "Tudo começou queimando.",
    texto: ["O primeiro single dele, lançado em 29 de fevereiro de 2020. O título dá nome ao fogo desta página."],
    fatos: [
      ["2013", "entra na cena como bboy, aos 14 anos"],
      ["2017", "desperta para o rap · primeiro grupo, Interligados"],
      ["2020", "“Amazônia pega fogo”, a primeira obra"],
    ],
    links: [["youtube", "https://www.youtube.com/watch?v=tocLEg0aDbs"]],
  },
  {
    id: "conexoes", tipo: "grafo", ano: null, rotulo: "", sel: "quem anda junto", fogo: 0.45, agua: 0,
    titulo: "conexões",
    lide: "Cada faixa em dupla é uma linha neste mapa.",
    texto: ["Passe o mouse em um nome para ver as obras que ligam os dois. Quem já tem página na JODO é só clicar."],
  },
  {
    id: "plataformas", tipo: "plataformas", ano: null, rotulo: "", sel: "onde ouvir", fogo: 0.62, agua: 0,
    titulo: "acende o som",
    lide: "el camiño de cobra",
    texto: ["Tudo o que ele lançou está nas plataformas. Escolha a sua."],
  },
];

// Discografia em linhas (mais novo primeiro). `capa` = arquivo em /public/vb/capas. `url` cai no perfil do Spotify quando não há link direto.
export const DISCO = [
  { ano: 2025, data: "28.02", t: "Ruído das Águas", tag: "álbum · com PRISM∆ e LF", capa: "ruido", nota: "Sete faixas. Produção de LF. Capa de KdeirA.", url: "https://open.spotify.com/album/3xqESrPBdKu22WExN2bnl9", com: ["prisma", "lf"] },
  { ano: 2023, data: "01.09", t: "Pode Pá, Ora Pois", tag: "participação · Mundo Estranho", capa: "mundo-estranho", nota: "No álbum do Altamente 82 e Cevas, com o 82 e o lvsraizK.", url: PERFIS.spotify, com: ["82"] },
  { ano: 2023, data: "18.08", t: "R.E.M.A", tag: "single · com Naycol Davan", capa: "rema", nota: "Produção do Insyt.", url: PERFIS.spotify },
  { ano: 2023, data: "29.05", t: "Reflexo", tag: "ep · com LF", capa: "reflexo", nota: "", url: "https://www.youtube.com/watch?v=FIIUH57aYSc", com: ["lf"] },
  { ano: 2022, data: "12.04", t: "El Fluxxxo", tag: "single", capa: "el-fluxxxo", nota: "Traz “Manaus City”, com segunda parte e vídeo oficial.", url: "https://www.youtube.com/watch?v=1duWPyd9wrM" },
  { ano: 2021, data: "dez", t: "Tomando um Chá", tag: "single", capa: "tomando-um-cha", nota: "", url: PERFIS.spotify },
  { ano: 2021, data: "dez", t: "Zabutre", tag: "single", capa: "zabutre", nota: "", url: PERFIS.spotify },
  { ano: 2021, data: "06.12", t: "Slip Like Time", tag: "single", capa: "slip-like-time", nota: "", url: PERFIS.spotify },
  { ano: 2021, data: "06.12", t: "A Vida É um Rio", tag: "single · com Sergio Estranho", capa: "a-vida-e-um-rio", nota: "Liga Manaus a São Paulo: a faixa tem o Sergio, do Rap Delivery.", url: "https://www.youtube.com/watch?v=mWALEYoxlpc", com: ["sergio-estranho"] },
  { ano: 2021, data: "out", t: "Rua Nova, Velhas Histórias", tag: "single", capa: "rua-nova", nota: "", url: PERFIS.spotify },
  { ano: 2021, data: "out", t: "Capital Crime", tag: "single · com LF", capa: "capital-crime", nota: "Clipe oficial no canal Falha, com produção do LF.", url: "https://www.youtube.com/watch?v=t3N7I1FZLZA", falha: true },
  { ano: 2021, data: "jul", t: "Free$tyle Quarentena", tag: "single", capa: "freestyle-quarentena", nota: "Clipe oficial no canal Falha, com produção de VL e LF. No meio do ano, 1º lugar no festival de Hip-Hop Dimanaus.", url: "https://www.youtube.com/watch?v=CCbp6THavl4", falha: true },
  { ano: 2020, data: "29.02", t: "Amazônia Pega Fogo", tag: "o primeiro single", capa: "amazonia-pega-fogo", nota: "Tudo começou queimando.", url: "https://www.youtube.com/watch?v=tocLEg0aDbs" },
];

// canal onde saíram os dois clipes (Capital Crime e Free$tyle Quarentena)
export const FALHA = "https://www.youtube.com/@falhafalhafalha/videos";
