import { COLABORADORES } from './colaboradores';
﻿/*
  MAPA: artistas por lugar (globo interativo).
  Fonte: banco "Perfil dos Artistas" do Notion + pastas JODO\artistas + falas do Lucas (14/10/2026).

  Campos:
  - lugar: { cidade, pais, lat, lon } ou null (sem localização conhecida: aparece só na lista)
  - tipo: 'jodo' (da casa) | 'parceiro' | 'convidado' (artista de fora que a JODO mapeia e faz portfólio)
  - confirmado: false => localização/dados a confirmar com o artista (aparece com aviso no painel)
  - formatos: reservado para a futura contratação por casas de show pequenas (ex.: 'show 30 pessoas')

  Antes de publicar: autorização de cada artista. Não incluir contas privadas nem documentos pessoais.
*/

export const LUGARES = {
  sp: { cidade: 'São Paulo', pais: 'Brasil', lat: -23.5505, lon: -46.6333 },
  rj: { cidade: 'Rio de Janeiro', pais: 'Brasil', lat: -22.9068, lon: -43.1729 },
  manaus: { cidade: 'Manaus', pais: 'Brasil', lat: -3.119, lon: -60.0217 },
  lisboa: { cidade: 'Lisboa', pais: 'Portugal', lat: 38.7223, lon: -9.1393 },
  fundao: { cidade: 'Fundão', pais: 'Portugal', lat: 40.1388, lon: -7.5008 },
  guara: { cidade: 'Guaratinguetá', pais: 'Brasil', lat: -22.8166, lon: -45.1925 },
  alfenas: { cidade: 'Alfenas', pais: 'Brasil', lat: -21.4267, lon: -45.9470 },
  guarulhos: { cidade: 'Guarulhos', pais: 'Brasil', lat: -23.4538, lon: -46.5333 },
  mesquita: { cidade: 'Mesquita', pais: 'Brasil', lat: -22.7829, lon: -43.4246 },
  nepomuceno: { cidade: 'Nepomuceno', pais: 'Brasil', lat: -21.2319, lon: -45.2347 },
  pouso: { cidade: 'Pouso Alegre', pais: 'Brasil', lat: -22.23, lon: -45.9361 },
  lages: { cidade: 'Lages', pais: 'Brasil', lat: -27.8153, lon: -50.3264 },
  santos: { cidade: 'Santos', pais: 'Brasil', lat: -23.9608, lon: -46.3336 },
  maravilha: { cidade: 'Maravilha', pais: 'Brasil', lat: -26.7625, lon: -53.1747 },
  montreal: { cidade: 'Montreal', pais: 'Canadá', lat: 45.5017, lon: -73.5673 },
  saojose: { cidade: 'São José', pais: 'Brasil', lat: -27.5906, lon: -48.6322 },
  salvador: { cidade: 'Salvador', pais: 'Brasil', lat: -12.9777, lon: -38.5016 },
  novaiguacu: { cidade: 'Nova Iguaçu', pais: 'Brasil', lat: -22.7592, lon: -43.451 },
  sbc: { cidade: 'São Bernardo do Campo', pais: 'Brasil', lat: -23.6914, lon: -46.5646 },
  voltaredonda: { cidade: 'Volta Redonda', pais: 'Brasil', lat: -22.5231, lon: -44.104 },
  cassino: { cidade: 'Balneário Cassino', pais: 'Brasil', lat: -32.1746, lon: -52.1724 },
  bh: { cidade: 'Belo Horizonte', pais: 'Brasil', lat: -19.9167, lon: -43.9345 },
  berlim: { cidade: 'Berlim', pais: 'Alemanha', lat: 52.52, lon: 13.405 },
  washington: { cidade: 'Washington', pais: 'Estados Unidos', lat: 38.9072, lon: -77.0369 },
  pelotas: { cidade: 'Pelotas', pais: 'Brasil', lat: -31.7654, lon: -52.3376 },
  jundiai: { cidade: 'Jundiaí', pais: 'Brasil', lat: -23.1857, lon: -46.8978 },
  pontagrossa: { cidade: 'Ponta Grossa', pais: 'Brasil', lat: -25.0945, lon: -50.1633 },
  sjc: { cidade: 'São José dos Campos', pais: 'Brasil', lat: -23.2237, lon: -45.9009 },
  mogi: { cidade: 'Mogi das Cruzes', pais: 'Brasil', lat: -23.5208, lon: -46.1854 },
  barueri: { cidade: 'Barueri', pais: 'Brasil', lat: -23.5107, lon: -46.8761 },
  araraquara: { cidade: 'Araraquara', pais: 'Brasil', lat: -21.7845, lon: -48.178 },
  pinda: { cidade: 'Pindamonhangaba', pais: 'Brasil', lat: -22.9239, lon: -45.4617 },
  vinhedo: { cidade: 'Vinhedo', pais: 'Brasil', lat: -23.0297, lon: -46.9753 },
  braga: { cidade: 'Braga', pais: 'Portugal', lat: 41.5454, lon: -8.4265 },
  roraima: { cidade: 'Monte Roraima', pais: 'Brasil', lat: 5.1436, lon: -60.7619 },
};

const verde = ['var(--jodo-verde)', 'var(--jodo-verde-neon)'];
const roxo = ['var(--jodo-roxo)', 'var(--jodo-rosa-neon)'];
const laranja = ['var(--jodo-laranja)', 'var(--jodo-laranja-neon)'];
const azul = ['var(--jodo-azul)', 'var(--jodo-azul-neon)'];
const amarelo = ['var(--jodo-amarelo)', 'var(--jodo-amarelo-neon)'];
const rosa = ['var(--jodo-rosa)', 'var(--jodo-rosa-neon)'];

function a(slug, nome, papel, resumo, cores, lugar, extra = {}) {
  return {
    slug,
    nome,
    papel,
    resumo,
    cor: cores[0],
    destaque: cores[1],
    lugar: lugar ? LUGARES[lugar] : null,
    tipo: 'jodo',
    confirmado: true,
    redes: [],
    subdominio: `https://${slug}.jodo.com.br`,
    ...extra,
  };
}

const artistas = [
  a('82', '82', '',
    'Krapnek. O filme O Retrato da Loucura, as 8 Aulas, Altamente, Häxan, Visceras e a edição de quase tudo que a JODO lançou.',
    verde, 'sp', { redes: [{ rotulo: 'Instagram', url: 'https://www.instagram.com/krapnek82/' }], subdominio: 'https://82.jodo.com.br' }),

  a('isa-katupyryb', 'Isa Katupyryb', 'Cinema, fotografia e produção de cultura',
    'Mais de 60 videoclipes de rap, Revista Parenteses, Prêmio Vidas Indígenas. Esteve nos primeiros clipes da JODO. Rumo ao mestrado na EICTV, em Cuba.',
    laranja, 'sp', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/isakatupyryb/' },
        { rotulo: 'Linktree', url: 'https://linktr.ee/isakatupyryb' },
        { rotulo: 'Apoiar a ida a Cuba', url: 'https://www.vakinha.com.br/vaquinha/me-ajude-a-estudar-em-cuba-parte-2' },
      ],
    }),

  a('romulo-spuri', 'Rômulo Spuri', 'Produção executiva, direção criativa e carreira',
    'Fundador da Straditerra, hoje Strads. Coliseu Cultural, Cinema Fora de Cena, mais de 100 campanhas de lançamento e planejamento de carreira para artistas independentes. Sul de Minas.',
    verde, 'nepomuceno', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/romulospuri_/' },
        { rotulo: 'Strads', url: 'https://www.instagram.com/stradsss/' },
        { rotulo: 'Plano de carreira', url: 'https://carreiraplano.netlify.app/' },
      ],
    }),

  a('rap-delivery', 'Rap Delivery', 'Grupo de rap',
    'Rimas pra viagem entregues no capricho. 1cort3, Sergio Estranho, domrafa e 82.',
    laranja, 'sp', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/rap.delivery/' },
        { rotulo: 'Rimas Pra Viagem', url: 'https://onerpm.link/873717454087' },
      ],
      integrantes: [
        { nome: '1cort3 (Caio)', url: 'https://www.instagram.com/1cort3_/' },
        { nome: 'Sergio Estranho', url: 'https://www.instagram.com/sergioestranho/' },
        { nome: 'domrafa', url: 'https://www.instagram.com/domrafa.wav/' },
      ],
      subdominio: 'https://rapdelivery.jodo.com.br',
    }),

  a('1cort3', '1cort3', 'MC e produtor',
    'Caio. Rap experimental, bap e trap. Singles 2026, EP Paranoilismo.',
    laranja, 'sp', {
      redes: [{ rotulo: 'Instagram', url: 'https://www.instagram.com/1cort3_/' }, { rotulo: 'Linktree', url: 'https://linktr.ee/1cort3' }],
    }),

  a('sergio-estranho', 'Sergio Estranho', 'MC e beatmaker',
    'Beats, rimas e a série #TFT. Mais de 400 beats, covers ao vivo e beat tapes.',
    laranja, 'sp', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/sergioestranho/' },
        { rotulo: 'SoundCloud', url: 'https://soundcloud.com/estranhobeats' },
      ],
    }),

  a('domrafa', 'domrafa', 'Produtor multimídia',
    "'92. Multi media producer. Beats e mix.",
    laranja, 'sp', {
      redes: [{ rotulo: 'Instagram', url: 'https://www.instagram.com/domrafa.wav/' }],
    }),

  a('margarida-the-cat', 'Margarida The Cat', 'Rock alternativo',
    'Banda de São Paulo com Silvinho na bateria. Single (Reality in a) Speeding Cloud, lançado em 29/09/2026.',
    rosa, 'sp', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/margarida_thecat/' },
        { rotulo: 'Linktree', url: 'https://linktr.ee/margaridathecat' },
      ],
    }),

  a('trinca', 'Trinca', 'Mosaicista',
    'Mosaicos, murais e a série Mesa de Mosaico. Troféu NFT do Bosque Mafia.',
    amarelo, 'sp', {
      // o Trinca tem site próprio: por enquanto o clique leva para lá, em vez de uma página da JODO
      externo: 'https://trincamosaico.art',
      redes: [{ rotulo: 'Site', url: 'https://trincamosaico.art' }],
    }),

  a('el-mandarim', 'El Mandarim', 'Beatmaker e rapper',
    'Rap sujo da zona norte de São Paulo. Dez singles de 2020 a 2024, clipes com os Morlockz e a mixtape inédita Tô com depressão, em prévia. Irmão do Sergio Estranho.',
    azul, 'sp', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/elmandarimoficial/' },
        { rotulo: 'YouTube', url: 'https://www.youtube.com/channel/UC2byRB1gNU5mXtA0qcAuhQw' },
        { rotulo: 'Deezer', url: 'https://www.deezer.com/artist/13144255' },
      ],
    }),

  a('phineas', 'akaphineas', 'Multi-artista e produtor cultural',
    'Canções, produções e registros. Estrada, Jardim EP (com Karmo), Antares e o short film Relicário. Agora no Rio.',
    roxo, 'rj', {
      redes: [
        { rotulo: 'Spotify', url: 'https://open.spotify.com/intl-pt/artist/4O9G2L1B557p5lkZBoayK6' },
        { rotulo: 'SoundCloud', url: 'https://soundcloud.com/phineas-867227871/sets/estrada' },
        { rotulo: 'Bandcamp', url: 'https://phineasss.bandcamp.com/track/relic-rio' },
      ],
    }),

  a('prisma', 'Prisma', 'Beats e rimas',
    'Viveu imerso no rio. Ruído das Águas, beattape Maués e a cena do Norte.',
    azul, 'manaus', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/prism4__/' },
        { rotulo: 'Ruído das Águas', url: 'https://open.spotify.com/album/3xqESrPBdKu22WExN2bnl9' },
      ],
    }),

  a('vicente-blow', 'Vicente Blow', 'Rap e beats',
    'Um dos principais nomes da JODAM, o selo JODO x Amazonas.',
    amarelo, 'manaus'),

  a('saull-oe', 'Saull OE', 'Rap, fotografia e produção',
    'Rapper, fotógrafo e produtor de Manaus. Arkaica, Extremo, Estrada\'s, Registro, Prata e as Roupas e a Sala Reserva, o olhar dele em fotos.',
    verde, 'manaus', { redes: [{ rotulo: 'Instagram', url: 'https://www.instagram.com/saull.oe/' }, { rotulo: 'Sala Reserva', url: 'https://www.instagram.com/sala.reserva/' }, { rotulo: 'YouTube', url: 'https://www.youtube.com/@saull_oe' }] }),

  a('davzera', 'Davzera', 'Rap e produção',
    'Davi Nadier, rapper e beatmaker de Salvador. PROFUNDHI, Cozinha Marginal, Low Carb e a Nauzeainc, a marca e as roupas dele.',
    azul, 'salvador', { redes: [{ rotulo: 'Instagram', url: 'https://www.instagram.com/davinadier/' }, { rotulo: 'Spotify', url: 'https://open.spotify.com/artist/42M0YRSCEu5ppWbOioH0GH' }, { rotulo: 'YouTube', url: 'https://www.youtube.com/@davinadier759' }] }),

  a('headb', 'headB', 'Rap, beats e produção',
    'Bruno Saraiva, MC e beatmaker de Salvador e do Canadá. O EP 33% de acidez, beat tapes e 73 beats no SoundCloud desde 2017.',
    roxo, 'montreal', { redes: [{ rotulo: 'SoundCloud', url: 'https://soundcloud.com/brunoheadb' }, { rotulo: 'Instagram', url: 'https://www.instagram.com/brunoheadb/' }, { rotulo: 'YouTube', url: 'https://www.youtube.com/user/darksaraiva' }, { rotulo: 'Facebook', url: 'https://www.facebook.com/brunoheadb' }] }),

  a('lessa-gustavo', 'Lessa Gustavo', 'Rap, arte conceitual e design',
    'Gustavo Lessa, da Baixada Fluminense (RJ). Sereno da Via Light, Muita Ostra e Pouca Pérola, Mojica e uma obra que passa por música, arte conceitual, design e moda.',
    laranja, 'novaiguacu', { redes: [{ rotulo: 'Spotify', url: 'https://open.spotify.com/artist/1Fxj29J2wowDAzBFPzaTDQ' }, { rotulo: 'YouTube', url: 'https://www.youtube.com/channel/UCZDYrpQqQnDcdPHf6BkPlOA' }, { rotulo: 'Instagram', url: 'https://www.instagram.com/gessalustavo/' }, { rotulo: 'SoundCloud', url: 'https://soundcloud.com/lessagustavo' }, { rotulo: 'Bandcamp', url: 'https://lessagustavo.bandcamp.com/' }] }),

  a('bruxos-do-norte', 'Bruxos do Norte', 'Coletivo',
    'Coletivo de Manaus ligado à JODAM.',
    roxo, 'manaus'),

  a('1lum3', '1LUM3', 'Rap',
    'Centro parte II (prod. domrafa), vvcs 1 e 2 e Sonhos de Ícaro com PHINEA$. De Guaratinguetá; viveu quase 15 anos em SP.',
    verde, 'guara', { redes: [{ rotulo: 'Instagram', url: 'https://www.instagram.com/1lum3/' }, { rotulo: 'Linktree', url: 'https://linktr.ee/1lum3' }] }),

  a('van-mc', 'Van MC', 'Rap',
    'Rap de Manaus. Dez vídeos no canal da JODO, de 2018 a 2025, entre eles Não Tem Outra Vez, O Rap me Resgatou, Tamo na Luta e Na Pele (com Sergio Estranho).',
    laranja, 'manaus', { redes: [{ rotulo: 'Instagram', url: 'https://www.instagram.com/van_mc33/' }] }),

  a('insyt', 'Insyt', 'Beatmaker e produtor',
    'DK, também Coala Freak. Beatmaker, produtor, imagem e cor de Manaus. Produziu Van MC, Saull OE e o Vblow, e mantém o canal insytilusion.',
    azul, 'manaus', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/insytillusion/' },
        { rotulo: 'Spotify', url: 'https://open.spotify.com/artist/1T5hF0MCiaBgkb4rGxXqvQ' },
        { rotulo: 'YouTube', url: 'https://www.youtube.com/@insytilusion' },
        { rotulo: 'SoundCloud', url: 'https://soundcloud.com/cicatrizadoo' },
      ],
    }),

  a('alfano', 'Alfano', 'MC, Zona Sul',
    'MC e multi-artista independente da Zona Sul de São Paulo. Quase sete anos de estrada, clipes e parcerias com PHINEA$ e o coletivo Inadequados Gang.',
    roxo, 'sp', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/alfanosoueu_' },
        { rotulo: 'Spotify', url: 'https://open.spotify.com/intl-pt/artist/7GSpWZDGzzB3UunKsX6PN6' },
        { rotulo: 'YouTube', url: 'https://www.youtube.com/@afn574R' },
      ],
    }),

  a('herick-olx', 'Herick OLX', 'MC e produtor',
    'MC, beatmaker e editor de áudio de Manaus. EPs Teoria dos Versos, Conversas para Mesa de Bar e Marsúpio, produções para outros artistas e beats por BPM.',
    laranja, 'manaus', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/olxherick/' },
        { rotulo: 'Spotify', url: 'https://open.spotify.com/intl-pt/artist/1ToF30sj92RBSHAV3fhzqa' },
        { rotulo: 'YouTube', url: 'https://www.youtube.com/@olxherick' },
        { rotulo: 'SoundCloud', url: 'https://soundcloud.com/olxherick' },
      ],
    }),

  a('rogdog', 'RogDog', 'Direção e audiovisual',
    'Rogério Soares. Direção e imagem (Vivências Chaves, TokenNation 2025). Em Lisboa.',
    azul, 'lisboa', {
      redes: [
        { rotulo: 'Instagram', url: 'https://www.instagram.com/rogdog_/' },
        { rotulo: 'Vimeo', url: 'https://vimeo.com/rogeriosoares' },
      ],
    }),

  a('cevas', 'Cevas', 'Rap e DJ',
    'Eddie Cevas, também DJ Riscolado. Consultório, Nascido e Criado e a mixtape 82 x Cevas. Do Fundão, Portugal.',
    amarelo, 'fundao', {
      tipo: 'colaborador', lugarCerto: true,
      redes: [{ rotulo: 'SoundCloud', url: 'https://soundcloud.com/cevas' }],
    }),
];

// vínculo: 'jodo' = da casa; 'colaborador' = já passou; 'parceiro' = coletivos parceiros (ex.: Strads, SujoGround), a incluir.
// quem já teve trabalho, colaboração ou ajudou a JODO entra no mapa como artista "que já passou por aqui" (lugar estimado)
COLABORADORES.forEach((c) => {
  if (artistas.some((x) => x.slug === c.slug)) return;
  artistas.push({
    slug: c.slug,
    nome: c.nome,
    papel: '',
    resumo: '',
    cor: 'var(--jodo-roxo)',
    destaque: 'var(--jodo-rosa-neon)',
    lugar: c.lugar ? LUGARES[c.lugar] || null : null,
    tipo: 'colaborador',
    confirmado: false,
    redes: [],
    funcoes: c.funcoes,
    tambem: c.tambem || [],
    obras: c.obras,
    subdominio: null,
  });
});

/*
  Bairro de cada artista em São Paulo (informado pelo Lucas em 2026-10-21). Vira o pino individual do artista
  quando o mapa chega perto da cidade. Coordenadas aproximadas do centro do bairro (conferir o Jardim Brasil).
*/
const BAIRROS_SP = {
  '82': { bairro: 'Vila Alpina', lat: -23.575, lon: -46.57 },
  'isa-katupyryb': { bairro: 'Perus', lat: -23.4017, lon: -46.7506 },
  'rap-delivery': { bairro: 'Santana', lat: -23.5019, lon: -46.6285 },
  '1cort3': { bairro: 'Artur Alvim', lat: -23.5428, lon: -46.4856 },
  'sergio-estranho': { bairro: 'Vila dos Remédios', lat: -23.5245, lon: -46.73 },
  'domrafa': { bairro: 'Parada Inglesa', lat: -23.4845, lon: -46.6095 },
  'margarida-the-cat': { bairro: 'Bela Vista', lat: -23.5648, lon: -46.6489 },
  'trinca': { bairro: 'Bom Retiro', lat: -23.53, lon: -46.635 },
  'el-mandarim': { bairro: 'Jardim Brasil', lat: -23.491, lon: -46.58 },
  'cris-snj': { bairro: 'Zona Sul', lat: -23.65, lon: -46.7 },
  'dory-de-oliveira': { bairro: 'Itaquera', lat: -23.5403, lon: -46.4553 },
};
/*
  Quem já tem página completa (rota própria em /artistas/slug). Quem NÃO está aqui abre a FICHA dentro da janela do
  mapa (bio, links, trabalhos do acervo e textos), sem trocar de página. Quando uma página nova ficar pronta,
  é só incluir o slug na lista e o clique passa a levar para ela.
*/
export const PAGINAS_PRONTAS = ['82', 'isa-katupyryb', 'romulo-spuri', 'rap-delivery', '1cort3', 'sergio-estranho', 'margarida-the-cat', 'phineas', 'prisma', 'vicente-blow', 'domrafa', '1lum3', 'van-mc', 'rogdog', 'alfano', 'herick-olx', 'el-mandarim', 'insyt', 'saull-oe', 'davzera', 'headb', 'lessa-gustavo'];

// como cada artista aparece escrito nas fichas técnicas e nos textos (para achar os trabalhos dele no acervo)
export const APELIDOS = {
  '82': ['82', 'krapnek', 'visceras', 'slim', 'lucas negrelli'],
  'isa-katupyryb': ['isa katupyryb', 'isa hansen'],
  'romulo-spuri': ['spuri', 'straditerra'],
  'rap-delivery': ['rap delivery', 'rapdelivery'],
  '1cort3': ['1cort3', '1corte'],
  'sergio-estranho': ['sergio estranho', 'sergioestranho'],
  'domrafa': ['domrafa', 'dxmrafa', 'dj ondas'],
  'margarida-the-cat': ['margarida the cat'],
  'trinca': ['trinca'],
  'el-mandarim': ['mandarim', 'elmandarim'],
  'phineas': ['phinea', 'akaphineas'],
  'prisma': ['prisma'],
  'vicente-blow': ['vblow', 'vicente blow', 'vicentius'],
  'saull-oe': ['saull'],
  'davzera': ['davzera', 'davi nadier'],
  'headb': ['headb', 'head b', 'bruno headb', 'bruno saraiva'],
  'lessa-gustavo': ['lessa gustavo', 'lessa', 'gustavo lessa', 'gessa'],
  'bruxos-do-norte': ['bruxos do norte'],
  '1lum3': ['1lum3'],
  'van-mc': ['van mc', 'vanmc'],
  'herick-olx': ['herick olx', 'olx', 'zumbi st', 'canguru zurado'],
  'rogdog': ['rogdog', 'roggdogg', 'rogerio soares', 'rgdgblg'],
  'cevas': ['cevas', 'riscolado'],
  'insyt': ['insyt', 'insytilusion', 'coala freak', 'daniel kennedy', 'prod. dk', 'dkank'],
};

// cor de cada pino no mapa (uma por artista, todas diferentes entre vizinhos; só dois tons de laranja no país inteiro)
const CORES_PINO = {
  '82': '#8ad06a', 'isa-katupyryb': '#ff8fbf', 'romulo-spuri': '#a98cff', 'rap-delivery': '#ffb454', '1cort3': '#6fb4ff',
  'sergio-estranho': '#ff7a6b', 'domrafa': '#4fd6c3', 'margarida-the-cat': '#ff3b30', 'trinca': '#f3dc4f', 'el-mandarim': '#7be0ff',
  'phineas': '#ff6fd8', 'prisma': '#ffd1a1', 'vicente-blow': '#ff9a3c', 'saull-oe': '#9aa6ff', 'davzera': '#3ce0d6', 'headb': '#c8ff00', 'lessa-gustavo': '#e6231c', 'bruxos-do-norte': '#b48cff',
  '1lum3': '#8cf0a8', 'van-mc': '#3fe0b0', 'rogdog': '#ffe08a', 'alfano': '#ff4d5a', 'cevas': '#ffa6a6', 'herick-olx': '#c9f26b',
  'insyt': '#e8e4d0',
};
artistas.forEach((art) => {
  art.corPino = CORES_PINO[art.slug] || '#cfcfe8';
  art.colab = art.tipo === 'colaborador';
});

artistas.forEach((art) => {
  art.temPagina = PAGINAS_PRONTAS.includes(art.slug);
});

artistas.forEach((art) => {
  const b = BAIRROS_SP[art.slug];
  if (b) {
    art.ponto = { lat: b.lat, lon: b.lon };
    art.bairro = b.bairro;
  }
});

/*
  Filtros do mapa: segmentos de cada artista da casa. Quem veio do acervo (colaboradores) herda o segmento pelas
  funções que aparecem nos créditos. LANCOU_2026: lançamentos fora do canal (Spotify etc.) que o acervo não vê.
*/
export const SEGMENTOS = ['Rap', 'Rock', 'Audiovisual', 'Artes visuais', 'Produção e cultura', 'Coletivo'];
const SEG_ARTISTA = {
  '82': ['Audiovisual'], 'isa-katupyryb': ['Audiovisual', 'Produção e cultura'], 'romulo-spuri': ['Produção e cultura'],
  'rap-delivery': ['Rap'], '1cort3': ['Rap'], 'sergio-estranho': ['Rap'], domrafa: ['Rap'], 'margarida-the-cat': ['Rock'],
  trinca: ['Artes visuais'], 'el-mandarim': ['Rap'], phineas: ['Rap', 'Produção e cultura'], prisma: ['Rap'],
  'vicente-blow': ['Rap'], 'saull-oe': ['Rap'], davzera: ['Rap', 'Produção e cultura'], headb: ['Rap', 'Produção e cultura'], 'lessa-gustavo': ['Rap', 'Artes visuais'], 'bruxos-do-norte': ['Coletivo'], '1lum3': ['Rap'], 'van-mc': ['Rap'], 'herick-olx': ['Rap', 'Produção e cultura'], rogdog: ['Audiovisual'], cevas: ['Rap'], insyt: ['Rap', 'Produção e cultura'],
};
export const LANCOU_2026 = ['1cort3', 'margarida-the-cat', '1lum3'];
const FUNC_AUDIOVISUAL = ['imagem', 'edição', 'captação', 'cor', 'roteiro', 'takes', 'direção', 'câmera', 'arte'];
artistas.forEach((art) => {
  if (SEG_ARTISTA[art.slug]) art.segmentos = SEG_ARTISTA[art.slug];
  else {
    const f = art.funcoes || [];
    const s = [];
    if (f.some((x) => ['artista', 'beat', 'letra', 'mix', 'voz'].includes(x))) s.push('Rap');
    if (f.some((x) => FUNC_AUDIOVISUAL.includes(x))) s.push('Audiovisual');
    art.segmentos = s.length ? s : ['Rap'];
  }
});

export const manifesto =
  'Viajando pelas estradas sinuosas deste vasto país, a JODO se tornou um encontro de almas artísticas, onde os contornos urbanos de São Paulo se misturam com a selva enigmática de Manaus.';

export function getTodos() {
  return artistas;
}
export function getArtista(slug) {
  return artistas.find((x) => x.slug === slug) || null;
}
export function getPorLugar() {
  const mapa = new Map();
  for (const x of artistas) {
    if (!x.lugar) continue;
    const k = `${x.lugar.cidade}|${x.lugar.pais}`;
    if (!mapa.has(k)) mapa.set(k, { ...x.lugar, artistas: [] });
    mapa.get(k).artistas.push(x);
  }
  return [...mapa.values()];
}
export function getSemLugar() {
  return artistas.filter((x) => !x.lugar);
}


