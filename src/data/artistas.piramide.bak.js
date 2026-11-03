/*
  Vitrine do JODOVERSO. Fonte: pasta JODO\artistas (LEIA-ME de cada artista) + Instagram/Notion públicos.
  Cada artista terá no futuro um subdomínio com identidade própria; enquanto isso a página interna cumpre o papel.

  ATENÇÃO antes de publicar: pedir autorização de cada artista (nome, textos, links) e do Gui Valério (logo).
  Não colocar aqui documentos pessoais, senhas nem contas privadas (ex.: Instagram do Vicente Blow é privado).
*/

const artistas = [
  {
    slug: '82',
    cena: { x: 50, y: 19.5 },
    nome: '82',
    papel: 'Cinema, música e arquivo',
    resumo:
      'Krapnek. Todos os trampos do 82: o filme O Retrato da Loucura, as 8 Aulas, Altamente, Häxan, Visceras e a edição de quase tudo que a JODO lançou.',
    cor: 'var(--jodo-verde)',
    destaque: 'var(--jodo-verde-neon)',
    subdominio: 'https://82.jodo.com.br',
    redes: [{ rotulo: 'Instagram', url: 'https://www.instagram.com/krapnek82/' }],
    pronto: false,
  },
  {
    slug: 'rap-delivery',
    cena: { x: 35, y: 47 },
    nome: 'Rap Delivery',
    papel: 'Grupo de rap',
    resumo:
      'Rimas pra viagem entregues no capricho. 1cort3, Sergio Estranho, domrafa e 82. Do EP A Caminho ao disco Rimas Pra Viagem.',
    cor: 'var(--jodo-laranja)',
    destaque: 'var(--jodo-laranja-neon)',
    subdominio: 'https://rapdelivery.jodo.com.br',
    redes: [
      { rotulo: 'Instagram', url: 'https://www.instagram.com/rap.delivery/' },
      { rotulo: 'Rimas Pra Viagem', url: 'https://onerpm.link/873717454087' },
    ],
    integrantes: [
      { nome: '1cort3 (Caio)', url: 'https://www.instagram.com/1cort3_/' },
      { nome: 'Sergio Estranho', url: 'https://www.instagram.com/sergioestranho/' },
      { nome: 'domrafa', url: 'https://www.instagram.com/domrafa.wav/' },
    ],
    pronto: false,
  },
  {
    slug: 'phineas',
    cena: { x: 65, y: 43 },
    nome: 'PHINEA$',
    papel: 'Multi-artista e produtor cultural',
    resumo:
      'Canções, produções e registros. Estrada, Jardim EP (com Karmo), Antares e o short film Relicário.',
    cor: 'var(--jodo-roxo)',
    destaque: 'var(--jodo-rosa-neon)',
    subdominio: 'https://phineas.jodo.com.br',
    redes: [
      { rotulo: 'Spotify', url: 'https://open.spotify.com/intl-pt/artist/4O9G2L1B557p5lkZBoayK6' },
      { rotulo: 'SoundCloud', url: 'https://soundcloud.com/phineas-867227871/sets/estrada' },
      { rotulo: 'Bandcamp', url: 'https://phineasss.bandcamp.com/track/relic-rio' },
    ],
    pronto: false,
  },
  {
    slug: 'prisma',
    cena: { x: 26, y: 64 },
    nome: 'Prisma',
    papel: 'Beats e rimas, Manaus',
    resumo: 'Viveu imerso no rio. Ruído das Águas, beattape Maués e a cena do Norte.',
    cor: 'var(--jodo-azul)',
    destaque: 'var(--jodo-azul-neon)',
    subdominio: 'https://prisma.jodo.com.br',
    redes: [
      { rotulo: 'Instagram', url: 'https://www.instagram.com/prism4__/' },
      { rotulo: 'Ruído das Águas', url: 'https://open.spotify.com/album/3xqESrPBdKu22WExN2bnl9' },
    ],
    pronto: false,
  },
  {
    slug: 'vicente-blow',
    cena: { x: 78, y: 64 },
    nome: 'Vicente Blow',
    papel: 'Manaus',
    resumo: 'Um dos principais nomes da JODAM, o selo JODO x Amazonas.',
    cor: 'var(--jodo-amarelo)',
    destaque: 'var(--jodo-amarelo-neon)',
    subdominio: 'https://vblow.jodo.com.br',
    redes: [],
    pronto: false,
  },
  {
    slug: 'margarida-the-cat',
    cena: { x: 52, y: 74 },
    nome: 'Margarida The Cat',
    papel: 'Rock alternativo',
    resumo:
      'Banda de São Paulo com Silvinho na bateria. Single (Reality in a) Speeding Cloud, lançado em 29/09/2026.',
    cor: 'var(--jodo-rosa)',
    destaque: 'var(--jodo-rosa-neon)',
    subdominio: 'https://margarida.jodo.com.br',
    redes: [
      { rotulo: 'Instagram', url: 'https://www.instagram.com/margarida_thecat/' },
      { rotulo: 'Linktree', url: 'https://linktr.ee/margaridathecat' },
    ],
    pronto: false,
  },
];

export const manifesto =
  'Viajando pelas estradas sinuosas deste vasto país, a JODO se tornou um encontro de almas artísticas, onde os contornos urbanos de São Paulo se misturam com a selva enigmática de Manaus.';

export function getArtistas() {
  return artistas;
}

export function getArtista(slug) {
  return artistas.find((a) => a.slug === slug) || null;
}

export default artistas;

