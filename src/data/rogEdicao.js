import { TRABALHOS } from "@/data/rogdog";

/*
  Rog, página "Mesa de edição": os trabalhos agrupados por TIPO (a JODO entra dentro dos tipos, sem seção à parte).
  Vimeo dele = metadados públicos (rogdog.js); YouTube = descrições públicas dos vídeos (artistas/rogdog/LEVANTAMENTO.md).
  "papel" só onde o próprio crédito diz. Imagens locais (/rg) permitem ler os instrumentos; as remotas tentam, e se o navegador
  não deixar, os instrumentos mostram "sem leitura".
*/
// proporção real de cada vídeo (oembed do Vimeo; a margem preta embutida na miniatura de dois deles foi cortada em /rg)
const RAZAO = { "1167904859": 1280 / 514, "254591173": 488 / 360, "530125211": 338 / 240, "1167920311": 426 / 224, "667794521": 426 / 226, "533302315": 426 / 222 };
// ano de produção conferido na data de lançamento público (YouTube); o ano do Vimeo é só o do upload. null = ainda não confirmado
const ANO = { "1167904859": 2019, "1167920311": 2023, "1167905827": 2020, "1167917096": 2021, "533302315": 2020, "1175527667": null };
const V = (id, papel) => {
  const x = TRABALHOS.find((t) => t.id === id);
  return { id, t: x.t, ano: id in ANO ? ANO[id] : x.ano, d: x.d, papel, vimeo: id, img: `/rg/${id}.webp`, local: true, ratio: RAZAO[id] || 16 / 9 };
};
const YT = (id, t, ano, d, papel, jodo) => ({ id, t, ano, d, papel, yt: id, img: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, jodo, ratio: 16 / 9 });
const EP = (id, n, nome, d, thumb) => ({ id, t: `Vivência Chaves · ep. ${n}${nome ? " · " + nome : ""}`, ano: 2019, d, vimeo: id, img: thumb, jodo: true, ratio: 16 / 9, papel: "Direção, edição e colorização" });
const T = (s) => `https://i.vimeocdn.com/video/${s}`;

export const TIPOS = [
  {
    id: "publicidade", nome: "Publicidade",
    itens: [
      V("1175527667"), V("962599086"), V("409885023"), V("397729036"), V("397727087"),
      V("530125211", "Direção, para a Agência Woz"), V("667794521"), V("844089664"), V("844090500"), V("149111382"),
    ],
  },

  {
    id: "institucional", nome: "Institucional",
    itens: [
      V("245769376"), V("844972951"), V("412867816"), V("844090124"), V("169179018", "Direção, fotografia, edição e finalização"),
    ],
  },

  {
    id: "documentario", nome: "Documentário",
    itens: [
      V("412864298"),
      V("408975542", "Edição, finalização e color grading"),
      V("974149756"), V("1167917096"),
    ],
  },

  {
    id: "videoclipe", nome: "Videoclipe",
    itens: [
      V("1167904859"), V("1167905827"), V("533302315"), V("1167920311"),
      V("367927913", "Direção e fotografia"),
      V("254591173"),
      YT("eAyMFFBH8zw", "Origem MC's · Direções", 2017, "3:03", "Direção com Diego Amani, edição, imagens e finalização", true),
      YT("OWysFE4Y-2g", "Tudo Isso é um Sonho · Sergio Estranho", 2019, "2:55", "Direção e edição com Sergio Estranho; imagens", true),
    ],
  },

  {
    id: "vvcschvs", nome: "vvcschvs",
    itens: [
      EP("341246168", 1, "", "1:02", T("804476976-380d42ac5ef41349a85fdf4f7a4182e4009929ec08bc0a55147e752b50643754-d_640?region=us")),
      EP("341248400", 2, "De rolê com a JODO", "5:48", T("804464013-722415b892021c87b11f73ea17c79c9f86553d813e13f6c6fef5d1fe158f02b4-d_640?region=us")),
      EP("348497192", 3, "Férias em HotBelgaCity", "14:01", T("804470372-e779de24093679616ef7f9ba1b1b24516ad9ef20cf57a6b9cc2b3b1febbce4aa-d_640?region=us")),
      EP("341248785", 4, "Terceiro ensaio exclusivo de 1LUM3", "6:59", T("804469778-37dad73e22af3708122a13e7a7f072df60ff79fcdb38ce8dbfc0be0765a13d8c-d_640?region=us")),
      EP("341248790", 5, "Jantar com a Meccarec", "4:57", T("804468841-202573bfc80b73e4f9dbdcd152fc248192b7491807814809490b6584263e9e70-d_640?region=us")),
      EP("341248801", 6, "Nóis porta B1982", "5:37", T("804468623-0d17d1591d607cddb235bdeea41d81dd7a2047429adb5c07f36eeec295a09d62-d_640?region=us")),
      EP("341248805", 7, "Pico Olho d'Água", "7:14", T("804468390-74d24a488c8eee70b74830a21bc827abae7cafda89e18e4ad19813db818da2a3-d_640?region=us")),
      EP("341248817", 8, "Especial Não precisamos de internet", "4:16", T("804468143-4667e8ae4155c270c5b8bfebf9c77183b8c1f6aa0b979960732cf00488b788e7-d_640?region=us")),
      EP("341248825", 9, "Cinema fora de cena", "2:57", T("804464542-ef37ec5abbeba349670f368ebc3a31cb5192e581fd0f0ca9f9f85f6a9df0644c-d_640?region=us")),
      EP("341248830", 10, "Finale season", "4:24", T("804464376-f4856acc41b48c24459ec75e668b606c6fc111e4bcbe4e33cd89345c4db88a40-d_640?region=us")),
      YT("dQtp1PiLhRY", "festa jodo ou jodo sp", 2018, "4:36", "Imagens, com Phineas", true),
      YT("PLGS6CwySOI", "lofiness · direções", 2018, "3:11", "Visual", true),
      YT("hU8gLDxHLek", "lofiness · sacriofício", 2018, "2:48", "Visual", true),
    ],
  },
];

// abertura: fotos dele (perfil público @rogdog_), coloridas, cortadas em 16:9; pos = onde fica o rosto no corte
export const FOTOS = [
  // posM = enquadramento no celular, onde o corte é quadrado (1:1)
  { img: "/rg/rog-bone.webp", pos: "50% 30%", posM: "43% 50%" },
  { img: "/rg/rog-polaroid.webp", pos: "50% 60%", posM: "50% 85%" },
  { img: "/rg/rog-carros.webp", pos: "50% 12%", posM: "50% 30%" },
];

export const ABERTURA = ["844972951", "533302315", "530125211", "1167917096", "1167905827", "974149756", "408975542", "254591173"].map((id) => `/rg/${id}.webp`);
