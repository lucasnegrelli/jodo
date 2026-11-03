/*
 * Rômulo Spuri: dados da página.
 * Fontes: portfólio em PDF (30 páginas), Instagram @romulospuri_ e @stradsss (Apify, 20/10/2026), descrições dos vídeos no YouTube,
 * site carreiraplano.netlify.app e a memória da JODO. Straditerra = Strads (mesma produtora, renomeada há poucos anos).
 * Regras: sem telefone; sem posts políticos; sem close de crianças das oficinas; créditos copiados das descrições originais.
 */

export const LINKS = {
  ig: "https://www.instagram.com/romulospuri_/",
  strads: "https://www.instagram.com/stradsss/",
  stradsPortfolio: "https://www.instagram.com/strads.con/",
  plano: "https://carreiraplano.netlify.app/",
  email: "romulospurib@gmail.com",
  youtube: "https://www.youtube.com/channel/UCQWr0URK0fXAX58SG2FPzZw",
  yt: (id) => `https://www.youtube.com/watch?v=${id}`,
  hacktown: "https://www.instagram.com/hacktownsrs/",
  trends: "https://www.instagram.com/trendsbrasilconference/",
  pais: "https://www.instagram.com/paisalfenas/",
  dirce: "https://www.instagram.com/fundacaodirce/",
  pueira: "https://www.instagram.com/pueiralatina/",
  bardo: "https://www.instagram.com/bardo2stl/",
  matuto: "https://www.instagram.com/matuto.s.a/",
  matutoClipe: "https://www.youtube.com/watch?v=H4vzZzkH7X4",
  matutoAlbum: "https://www.youtube.com/watch?v=08bR6emrl9Q",
  vimeoCinema: "https://vimeo.com/cinemaforadecena",
  isa: "/artistas/isa-katupyryb",
  jodo: "https://www.instagram.com/_jodo/",
  post: (c) => `https://www.instagram.com/p/${c}/`,
};

export const NUMEROS = [
  { n: "14", t: "anos de arte independente" },
  { n: "120+", t: "cidades com artistas" },
  { n: "100+", t: "campanhas de lançamento" },
];

export const QUEM = {
  paragrafos: [
    "Trabalha há 14 anos com arte independente: projetos socioculturais e produção artística, com foco no movimento hip hop. Já viu muito artista talentoso desistir por falta de clareza na carreira, e é por isso que hoje planeja carreiras.",
    "Idealizou e produz o Festival Coliseu Cultural, voltado à cultura de rua, com 12 edições. Na Secretaria de Educação e Cultura de Alfenas, coordenou o Programa Cidade Escola e suas oficinas de rap, breaking, graffiti, DJ e beatmaker.",
    "Em 2017 fundou a produtora Straditerra, que hoje se chama Strads, e desde então atua como produtor executivo, diretor criativo e label manager de artistas em mais de 120 cidades do Brasil.",
  ],
  bio: "Artículo projetos e planejo carreiras e vice versa.",
  funcoes: ["Produtor executivo", "Diretor criativo", "Label manager", "Coordenador de projetos", "Consultor de carreira", "Selectah"],
};

export const PLANO = {
  ano: "2026",
  frase: "O artista independente não compete na estrutura, compete na estratégia.",
  fonte: "Rômulo Spuri, no Instagram da Strads",
  texto: "Plano de carreira de 12 meses para artistas independentes: quatro estratégias escolhidas para o momento e os objetivos de cada artista, e um plano de ação com etapas, prioridades e próximos passos.",
  passos: [
    ["3", "sessões online"],
    ["10+", "horas de trabalho sobre cada detalhe"],
    ["12", "meses de plano de ação"],
    ["30", "dias de acompanhamento depois da entrega"],
  ],
  numeros: [["100+", "planos de carreira"], ["200+", "lançamentos pela Strads"]],
  matuto: "Matuto S.A. foi indicado ao Grammy Latino 2026 com o álbum “Terra Vermelha: Do interior pro interior”. Rômulo prestou consultoria ao artista ainda na pré-produção.",
};

export const PALESTRAS = [
  { a: "2026", t: "Hack Town", d: "Palestra “Quem disse que tudo acontece na capital? Planejando carreiras no interior”: prática, sem enrolação, para artistas independentes que estão longe dos grandes centros. Santa Rita do Sapucaí, MG.", href: LINKS.hacktown, foto: "h00" },
  { a: "2025", t: "Hack Town", d: "Em “O Quarto”, falou sobre ZR e foi DJ do P.MC. Agradeceu à produção do festival, ao Mercado Futuro Música e à Mara Música & Marketing.", href: LINKS.hacktown, foto: "hacktown-2025" },
  { a: "2024", t: "Hack Town", d: "Esteve em 16 atividades do festival: “são 4 dias que parecem 4 anos”.", foto: "hacktown-2024" },
  { a: "2023", t: "Trends Brasil Conference", d: "Esteve em 18 atividades e registrou o material do evento.", href: LINKS.trends, foto: "t00" },
  { a: "2022", t: "Hack Town", d: "Esteve em 23 atividades do festival e registrou o painel “Disrupção na Indústria da Música”.", foto: "hacktown-2022" },
  { a: "2021", t: "Mostra Integrada de Artes", d: "Mesa “Falas Diversas”: “A música independente em Minas Gerais”, ao lado de Letícia Rezende e Chiara Carvalho. Dia 14 de junho, transmitida no YouTube da MIA.", foto: "mia-2021", contain: true, bg: "#f4ee22" },
  { a: "2019", t: "Hack Town", d: "Painel “Rap: dos guetos à música pop do mundo”, ao lado de Barral Lima, Julio Mossil e Diego Dais.", foto: "hacktown-2019-mic", contain: true },
];

export const PAIS = {
  ano: "2026",
  titulo: "PAIS Alfenas",
  sub: "Programa de Arte e Integração Sociocultural",
  texto: "Sessões de cinema ao ar livre nos conjuntos habitacionais de Alfenas, com cursos mensais de audiovisual e teatro para a população desde janeiro.",
  apoio: "Projeto da Fundação Dirce, com apoio da Secretaria de Estado de Cultura e Turismo de Minas Gerais.",
  sessoes: [
    ["13.08", "1ª sessão", "conjuntos habitacionais Tupã"],
    ["25.08", "2ª sessão", "residencial Jardim São Carlos, às 18h"],
    ["até novembro", "mais sessões", "sete no total, nas comunidades"],
  ],
};

export const POPULAR = {
  titulo: "Folia de Reis e Congada",
  folia: [
    "“Um salve a estrela que cortou o céu no papel de anunciação. Ao menino Jesus. Aos Três Reis do Oriente. A todas embaixadas de Folia de Reis.”",
    "Acompanha a Folia de Reis há mais de 30 anos. Já teve épocas bem mais movimentadas, mas depois de anos de baixa ele vê uma nova crescente, resultado do diálogo e da disposição das novas gerações.",
    "Quando não está ali do lado, cantando junto, registra: “cumprindo a minha micro parte de registrar alguns momentos que me cabem”.",
  ],
  congada: "Em outubro de 2026 subiu ao alto do Cruzeiro, em Nepomuceno, para ouvir os tambores de Minas e celebrar o início da festa de Nossa Senhora do Rosário, ao lado dos ternos de Congada.",
  fonte: "Fotos de Rômulo Spuri · Nepomuceno, MG. Quem aparece e quiser o arquivo em boa qualidade pode chamar no Instagram dele.",
};

export const GRAMMY = {
  etq: "17.09.2026 · Las Vegas · cerimônia em 12.11.2026",
  texto: "“Terra Vermelha: Do Interior pro Interior”, do Matuto S.A., está entre os cinco indicados a Melhor Álbum de Música Urban em Língua Portuguesa. Rômulo prestou consultoria ao artista ainda na pré-produção do disco.",
  citacao: "Desde nossas sessões, das guias, os corres, a equipe, já percebia o comprometimento com a arte, com a carreira e com a identidade.",
  fonte: "Rômulo Spuri, no Instagram",
  indicados: [
    ["Novo Testamento", "AjulliaCosta"],
    ["Frequência Lunar", "Budah"],
    ["Caro Vapor II: Qual a forma de pagamento?", "Don L"],
    ["Emicida Racional Vol. 2: Mesmas Cores & Mesmos Valores", "Emicida"],
    ["Terra Vermelha: Do Interior pro Interior", "Matuto S.A."],
  ],
};

export const PISTA = {
  titulo: "Spuri Selectah",
  texto: "Aparece como Spuri Selectah no cartaz do 1º Festival Cultura das Ruas. Hoje toca long sets de samba, cumbia, reggae, reggaeton e funk, e leva para a pista os discos que garimpa.",
  eventos: [
    ["15.08.2026", "Pueira Latina, Nepomuceno", "Sete horas de som, da tarde à noite: samba, cumbia e reggae de dia, reggaeton e funk depois que o sol abaixou.", LINKS.pueira],
    ["13.09.2026", "Bardo, São Thomé das Letras", "Selectah com discos cujas capas ele compartilhou: Lennie Hibbert, Orquesta Broadway, Orchestre Poly-Rythmo de Cotonou, C.K. Mann, Harari e outros.", LINKS.bardo],
  ],
};

export const STRADS = {
  titulo: "Strads",
  antes: "antes, Straditerra",
  texto: "Produtora artística e label fundada em 2017 como Straditerra. Produção executiva, direção criativa e estratégia de lançamentos de singles, álbuns, séries e videoclipes, com mais de 100 campanhas e mais de 200 lançamentos.",
  funcoes: [["produção executiva e direção criativa", "@romulospuri_"], ["label manager", "Rômulo Spuri"]],
  lancamentos: [
    ["2026", "Alienígena Silencioso", "“Hip Hop Puro” e “Voo leve”", "produção executiva Rômulo Spuri · direção criativa Rômulo Spuri · captação e pós de @gvstavoferreira e @estudioavra"],
    ["2026", "Matuto S.A.", "Terra Vermelha: Do interior pro interior", "consultoria de carreira · indicado ao Grammy Latino 2026"],
    ["2025", "Altivo Felipe × Kafofu Records", "Tempestade Dub", "label manager Rômulo Spuri · produção musical Vinicius Sampaio · fotografia de Lara Chang"],
    ["2025", "Mistah Jordan e Stalinho", "Chumbinho e Stalinho em Répis dU Interior", "EP de rap e reggae, 19 minutos"],
    ["2025", "MC Mambelli", "Coleção de Pedras", "divulgado no perfil da Strads"],
  ],
  mixtradaA: "Mixtrada: mixtape com 45 artistas, de 21 cidades e 5 estados, que ele produziu. As fotos da campanha de merch são de ",
  mixtradaB: "",
  extra: "Em setembro de 2026 abriu a pré-venda do boné roxo da Strads. Depoimentos de artistas que fizeram a consultoria ficam no",
};

export const RUA = {
  titulo: "Hip hop de rua",
  itens: [
    ["2018 · 2023", "Duelo de MCs, etapa Sul de Minas", "Coordenação regional do Duelo de MCs (nacional), com produção da Família de Rua."],
    ["2020", "Aldir Blanc", "Dois projetos: “O Rap nos 4 cantos de Poços” e a RAPFLIX."],
    ["2018 · 2021", "Carreira de P.MC", "Produção executiva, estratégia de carreira, produção musical e booker do artista P.MC, ex-integrante do grupo Jigaboo."],
    ["", "Sexta da Rima", "Batalha de MC semanal."],
    ["", "Breaking Minas", "Projeto que une hip hop e turismo: a primeira edição foi em Alfenas, com as próximas cidades a caminho."],
    ["", "SaralFenas", "Sarau com circulação pelos bairros."],
  ],
  cartaz: {
    t: "1º Festival Cultura das Ruas",
    d: "9 e 10 de dezembro · Alfenas, MG",
    lista: "Cartel Central · P.MC · Fattah ZR · Esquadrão · Bill MC · Rap 100 K.O. · Adronomus · RM · M.A. · Contrabando de Atitudes · Rota Norte · Sinfonia Marginal · Conhecimento Supremo · RC Neco · Djaum ZR · Lu Afri · Muriloko · 25 Cent · MC Brendinho · Pé de Palavra · DJ André · DJ Servo · Spuri Selectah · DJ Gerson · skate · basquete de rua · slackline · graffiti · batalha de MC",
  },
};

/* palco: Straditerra × JODO. ela = função do Rômulo; com = outros créditos da ficha original no YouTube */
export const VIDEOS = [
  { id: "felibriza-vago", y: "y5zGQWO6uXw", t: "Vago", q: "Felibriza · prod. Formiga", d: "01.2020", ela: "produção executiva e color grind", com: "resultado do 1º Workshop Audiovisual Straditerra (18/01/2020), com workshop de Visceras 82 · direção geral de João V Cunha" },
  { id: "cronicas-sanchez", y: "tIfsZ2c_n34", t: "Crônicas do Dr. Sanchez", q: "filme, documentário e beattape · collab com a JODO", d: "01.2019", ela: "direção, com 82 e Joaquim Macruz · fotografias", com: "roteiro de Joaquim Macruz e Lucas Negrelli · trilha de Sogakan, Barbo, Bigod, DreyyBeats e Lucas Cardoso" },
  { id: "breaking-minas", y: "kdix12Fcf68", t: "Breaking Minas #Alfenas", q: "bboys ZuluFu, Pê e NegoFu", d: "12.2018", ela: "produção executiva", com: "imagens e cor de Lucas Negrelli · edição de Joaquim Macruz · collab com a JODO" },
  { id: "barbo-intro-love", y: "aV8CJutRMfM", t: "Intro Love", q: "Barbo · Extinto Records", d: "10.2018", ela: "imagens", com: "direção de Lucas Negrelli e Barbo · edição de Joaquim Macruz · direção executiva Straditerra" },
  { id: "olirum-roubo", y: "AWHv6NWhTtk", t: "Roubô", q: "Olirum feat. Barbo", d: "08.2018", ela: "Coliseu Cultural na produção executiva", com: "feito na Vivência em Videoclipe da JODO, na 1ª Semana de Audiovisual e Comunicação do Coliseu Cultural" },
  { id: "fattah-paraiso", y: "jaxJpS2p2GA", t: "Paraíso do Tuiuti", q: "Fattah · prod. Rato", d: "07.2018", ela: "produção executiva e direção do vídeo", com: "gravado no corredor do Santa Clara, em Alfenas, durante um evento do Coliseu Cultural · imagens e edição de Barbo · cor de Lucas Negrelli" },
  { id: "chaves-chinelos", y: "412NDKns_DM", t: "Chinelos e Mísseis", q: "Chaves · prod. D1NHO", d: "07.2018", ela: "produção executiva e edição", com: "imagens e direção de Lucas Negrelli · Straditerra × JODO" },
  { id: "fattah-vira-lata", y: "Ii6g32GCMG4", t: "Vira Lata", q: "Fattah · prod. Djaum ZR", d: "11.2017", ela: "produção executiva", com: "direção de Lucas Negrelli · edição de Sergio Estranho · Straditerra × JODO" },
  { id: "pmc-tese", y: "imhFF0_-rJw", t: "Tese Popular · pilulaspoken #1", q: "P.MC", d: "09.2017", ela: "produção executiva", com: "poesia dita na praça Dr. Emílio da Silveira, com B-boys Jeh e Neo do ZR Breakers · filmagem e edição de Lucas Negrelli" },
  { id: "resistente-crime", y: "Go4JqGrC7kA", t: "Crime Sonoro", q: "Resistente Manifesto · prod. Lextte Beatz", d: "09.2017", ela: "produção executiva", com: "direção, edição e finalização de Lucas Negrelli" },
  { id: "morelo-lua", y: "JHiRiwxRfOI", t: "A Lua Porteira da Madrugada", q: "Renato Morelo", d: "08.2017", ela: "produção executiva", com: "direção de Lucas Negrelli · edição de Sergio Estranho · Barranco Alto, Alfenas" },
  { id: "edgar-throw-up", y: "Q4aYditjf0w", t: "Throw Up", q: "Edgar · álbum Progeria Atípica", d: "01.2017", ela: "produção executiva, com Edgar Pereira", com: "direção de vídeo de Hagora Mioro · mais de 43 mil visualizações" },
];

export const CINEMA_FORA = {
  titulo: "Cinema Fora de Cena",
  ano: "2018 · 2020",
  texto: "Produção executiva colaborativa do movimento de cinema independente Cinema Fora de Cena, que produziu mais de 30 curtas. O canal do movimento no Vimeo reúne a série Vivência Chaves, as beat tapes No Meio, LOFIREFOGO e mais.",
};

export const COLISEU = {
  titulo: "Coliseu Cultural",
  ano: "2016 · 2019",
  texto: "Idealização, produção executiva, gestão e articulação das 12 edições do festival de cultura de rua em Alfenas: shows, graffiti, batalhas de breaking e de MCs, slam, oficinas culturais em comunidades e um ponto de integração de arte e cultura. Uniu artistas e públicos de mais de 50 cidades.",
  incluiu: "Batalha de beatmakers, ação social nas comunidades e, em agosto de 2018, a 1ª Semana de Audiovisual e Comunicação, com a Vivência em Videoclipe da JODO.",
  citacao: "Surgiu para ser um ponto de encontro entre o pessoal que quer expressar seu talento.",
  citacaoFonte: "Rômulo Spuri sobre o Coliseu Cultural, na reportagem “Hip Hop no Interior”",
};

export const EDUCACAO = {
  titulo: "Educação e ação social",
  itens: [
    ["2018 · 2023", "Pé de Palavra", "Projeto de arte-educação, alfabetização, letramento e inclusão. Produção executiva do projeto e gestão da turnê."],
    ["2017 · 2019", "Estamparia Social", "Empreendedorismo social: cursos, oficinas e estamparia com jovens em cumprimento de medidas socioeducativas."],
    ["2017 · 2019", "Estúdio Social", "Estúdio acessível com moeda social: cinco horas de estúdio para o artista, que paga com cinco horas de oficina ensinando algo que sabe."],
    ["2017 · 2019", "Biblioteca Social", "Biblioteca no espaço da Estamparia Social, com articulação para receber mais de 600 títulos e dar acesso à comunidade do Santa Luzia e arredores."],
    ["2016 · 2019", "Programa Cidade Escola", "Coordenação regional do programa de educação e cultura da Prefeitura de Alfenas: 26 oficineiros, oficinas de rap, breaking, graffiti, DJ e beatmaker e eventos nas comunidades."],
    ["2015 · 2017", "Casa Cultural Aquarela", "Casa cultural na comunidade Santa Luzia, com mais de 10 oficinas gratuitas, arte-educadores contratados e cronograma de atividades."],
    ["2014 · 2016", "Oficinas de hip hop no CREAS", "Coordenação das oficinas no CREAS de Alfenas, com jovens em cumprimento de medidas socioeducativas."],
    ["2014 · 2016", "Festival Faísca", "Produção executiva do festival colaborativo entre a UNIFAL-MG, a Prefeitura e coletivos culturais: música, dança, teatro, literatura, cinema e intervenções socioculturais."],
  ],
};

export const MIDIA = {
  titulo: "Na mídia",
  texto: "Reportagens de televisão e de revista sobre o hip hop do interior, o Coliseu Cultural e os projetos sociais de Alfenas.",
};

export const ORIGEM = {
  titulo: "De Nepomuceno",
  texto: "De Nepomuceno, no Sul de Minas. A avó materna, Maria Odisseia Spuri, tinha uma mercearia em sociedade com a mãe dele. Hoje ele articula projetos e planeja carreiras, “e vice versa”, como diz no Instagram.",
  frase: "A música é gasolina no carro do interior.",
  fraseFonte: "Rômulo Spuri, no Instagram",
};

/* o que ele ensina: frases do próprio Instagram, cada uma com o cartão em que foi publicada */
export const ENSINA = {
  etq: "o que ele defende · Instagram @romulospuri_",
  itens: [
    { n: "01", t: "Música boa não se divulga sozinha.", f: "carrossel no @romulospuri_", img: "card-musica-boa" },
    { n: "02", t: "O retorno que você recebe é equivalente ao esforço que você investe?", f: "carrossel no @romulospuri_", img: "card-retorno" },
    { n: "03", t: "Sua arte é muito maior que essa espera. Pare de empurrar a esperança para amanhã.", f: "post de setembro de 2026", img: "card-royalties" },
    { n: "04", t: "O plano protege o sonho.", f: "consultoria de carreira da Strads", img: "card-plano" },
  ],
  nota: "Também publica, nos carrosséis, listas de artistas independentes que movimentam dinheiro por outras vias além do streaming.",
};
