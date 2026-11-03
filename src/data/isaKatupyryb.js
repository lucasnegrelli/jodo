/*
 * Isa Katupyryb: dados da página.
 * Fontes: portfólio completo (PDF, 2026), Instagram @isakatupyryb, Linktree, página da vaquinha, fichas dos vídeos no YouTube
 * e a memória da JODO (_memoria). Datas dos clipes = data de publicação no YouTube (conferida com yt-dlp em 19/10/2026).
 * Pronomes no perfil dela: ela/elu/ele. Nos textos da página: linguagem neutra, como no próprio portfólio.
 */

export const LINKS = {
  ig: "https://www.instagram.com/isakatupyryb/",
  // isakatupyryb.com dá 404 (conferido em 19/10/2026): não linkar
  linktree: "https://linktr.ee/isakatupyryb",
  vimeo: "https://vimeo.com/cinemaforadecena",
  email: "isahansenphoto@gmail.com",
  portfolio: "https://drive.google.com/file/d/1yO4SNSe--0773SuV9IprEQy6dY83DQWp/view",
  vakinha: "https://www.vakinha.com.br/vaquinha/me-ajude-a-estudar-em-cuba-parte-2",
  vakinha1: "https://www.vakinha.com.br/vaquinha/me-ajude-a-estudar-em-cuba-isa-katupyryb",
  vakinhaPerfil: "https://www.vakinha.com.br/usuario/isa-hansen",
  medium: "https://medium.com/@coletivosolos/50-anos-de-hip-hop-523-anos-de-resist%C3%AAncia-ind%C3%ADgena-o-que-hip-hop-e-cultura-ind%C3%ADgena-tem-a-ver-1373ed1126a5",
  parenteses: "https://www.instagram.com/parentesesrevista/",
  playlistClipes: "https://youtube.com/playlist?list=PLsmj9WPBWTKvmUL2iBnG4meJ4TMqdbWmH",
  playlistMusica: "https://youtube.com/playlist?list=PLjQGYGrTb-cKC5Db1xi7symmuVFPxIKaT",
  naoLugar: "https://www.youtube.com/channel/UC3aPn-hE6zX7ejpWNG8Y_gQ",
  strads: "https://strads.com.br/2023/08/26/50-anos-de-hip-hop-523-anos-de-resistencia-indigena-o-que-hip-hop-e-cultura-indigena-tem-a-ver/",
  straditerra: "https://straditerra.wixsite.com/blog/post/isa-hansen-fala-sobre-arte-e-diversidade-em-entrevista-%C3%A0-straditerra",
  kalamidade: "https://kalamidade.com.br/2021/08/30/20-artistas-indigenas-que-fortalecem-a-musica-contemporanea-parte-1/",
  vidasIndigenas: "https://exposicaovidasindigenas.museudapessoa.org/",
  enawene: "https://museudapessoa.org/enawene-nawe/",
  bioma: "https://www.instagram.com/biomacurta/",
  souto: "https://www.instagram.com/soutomc/",
  soutoSpotify: "https://open.spotify.com/intl-pt/album/3kPqg9e5mpWVflZcbFq3hV",
  vimeoItem: (id) => `https://vimeo.com/${id}`,
};

export const yt = (id) => `https://www.youtube.com/watch?v=${id}`;

// frames da folha de contato (tira do topo e grades). pb = fica em preto e branco até o hover.
export const TIRA = [
  "p05-0", "p05-4", "p11-3", "p05-2", "p16-0", "p05-3", "p11-9", "p05-9", "p16-3", "p05-1",
  "p11-1", "p05-8", "p32-1", "p05-7", "p11-6", "p05-5", "p32-7", "p11-10", "p16-6", "p05-6",
];

export const NUMEROS = [
  { n: "2010", t: "começa a construir imagens", links: [["portfólio", LINKS.portfolio]] },
  { n: "60+", t: "videoclipes de rap", links: [["a playlist", LINKS.playlistClipes]] },
  { n: "2", t: "longas documentais autorais para o hip hop", links: [["DF", yt("zl0FJ1Jhm18")], ["Aracaju", yt("4YuVKkUhVKE")]] },
  { n: "3×", t: "selecionade para o mestrado da EICTV, em Cuba", links: [["a campanha", LINKS.vakinha1]] },
];

export const CUBA = {
  curso: "€ 10.500",
  cursoReais: "cerca de R$ 70 mil",
  extras: "mais ou menos R$ 10 mil",
  meta: "R$ 100.000",
  primeira: "R$ 18.979",
  primeiraData: "19/09/2025",
};

/*
 * Diário da campanha. Fonte: Vakinha (perfil isa-hansen, as duas campanhas e as atualizações de saque da 1ª) e o destaque
 * "ISA EM CUBA" do Instagram, tudo lido em 19/10/2026. O contador é uma foto desse dia: atualizar `atual`, `apoiadores` e `conferido` à mão.
 */
export const CAMPANHA = {
  atual: 370,
  meta: 100000,
  apoiadores: 7,
  conferido: "19/10/2026",
  pix: "6185784@vakinha.com.br",
  total: { reais: "R$ 19.349", pessoas: 416, campanhas: 4 },
  tempo: [
    { d: "2024", t: "Aprovade, sem poder ir", x: "Uma das 8 pessoas escolhidas, entre inscritos do mundo todo, para o mestrado da EICTV. O custo era alto demais." },
    { d: "19.09.2025", t: "Primeira vaquinha", x: "Meta de R$ 120.000, arrecadou R$ 18.979. Aprovade de novo, em dois cursos, mas os prazos não se encontraram.", href: LINKS.vakinha1, rot: "ver a campanha" },
    { d: "2025 · 2026", t: "O que se fez com o valor", x: "Parte foi sacada, com aviso na Vakinha: social media da campanha e reposição de equipamento. O restante foi para uma poupança aplicada." },
    { d: "27.06.2026", t: "Parte 2 no ar", x: "Nova vaquinha, meta de R$ 100.000. Divulgação em andamento, com pedido de ajuda aberto.", href: LINKS.vakinha, rot: "apoiar agora" },
  ],
  pedidos: [
    ["Captação", "Produtores culturais com experiência em captar recursos e patrocínio direto com empresas e instituições, de qualquer lugar do mundo. Não é edital: é conhecimento e disposição."],
    ["Idiomas", "Alguém fluente em inglês ou em francês para fortalecer a campanha."],
    ["Qualquer valor", "Pix de R$ 1, R$ 5 ou R$ 20 conta. A ideia é muita gente doando um pouco."],
    ["Compartilhar", "Quem não puder doar pode repassar o link. Prefira doar pela Vakinha ou pela chave da campanha: assim o contador mostra o valor real."],
  ],
};

// canal "cinema fora de cena" no Vimeo: 12 vídeos de 2019 (datas e durações lidas no Vimeo)
export const VIMEO = {
  nome: "cinema fora de cena",
  total: 25,
  serie: "Vivência Chaves é uma série sobre bastidores, vivências e apresentações de artistas e produtores, montada de forma não linear. Direção, edição e colorização de Rogério Soares, produção JODO, art concept de Isa Hansen.",
  // os 10 episódios da série (ids do Vimeo)
  eps: [
    ["01", "341246168"], ["02", "341248400"], ["03", "348497192"], ["04", "341248785"], ["05", "341248790"],
    ["06", "341248801"], ["07", "341248805"], ["08", "341248817"], ["09", "341248825"], ["10", "341248830"],
  ],
  itens: [
    { id: "341238061", t: "LOFIREFOGO", d: "11:51", m: "06.2019", x: "Beat tape de Thiago Arit." },
    { id: "348494139", t: "VINTE E TRÊS DO DOIS", d: "08:37", m: "07.2019", x: "Cansado e gatinha vilã. Trilha de D4crvz." },
    { id: "341230291", t: "CANDIDATO BEATTAPE", d: "07:32", m: "06.2019", x: "O candidato lançado pela JODO em 2018." },
    { id: "341239286", t: "LEVANTE DAS FORMIGAS OU BAFO DE GENTE", d: "11:42", m: "06.2019", x: "Pinholes de Marcus Santos e Joaquim Macruz." },
    { id: "348494979", t: "NO MEIO EP1", d: "08:10", m: "07.2019", x: "Beat tapes. Edição de @visceras82." },
    { id: "348494987", t: "NO MEIO EP2", d: "09:28", m: "07.2019", x: "Beat tapes. Trilha de Insyt." },
    { id: "348494983", t: "NO MEIO EP3", d: "11:15", m: "07.2019", x: "Beat tapes. Trilha de @vicentius420." },
    { id: "348494997", t: "BOA PRA NO$Z", d: "05:03", m: "07.2019", x: "Zumbi Studio, Manaus. Edição @visceras82." },
    { id: "341213244", t: "O PONTEIRO DO TEMPO", d: "01:32", m: "06.2019", x: "Instrumental de D4CRVZ. Por Cansado." },
    { id: "341213149", t: "MUVE", d: "01:21", m: "06.2019", x: "Instrumental de Eric Beatz. Por Cansado." },
    { id: "341213355", t: "X M3N1NX 3 S3V B3R1MBAV", d: "01:38", m: "06.2019", x: "Áudio original. Por Cansado." },
    { id: "341146057", t: "HXRIZXNTAL X FOME BRUTA · MECANISMO", d: "02:59", m: "06.2019", x: "Letra e voz off de Joana Moher." },
    { id: "341145590", t: "LIMBO LARGADOS E PERDIDOS", d: "01:33", m: "06.2019", x: "Por Han e Cansado." },
    { id: "341145068", t: "FANTASMAS", d: "01:59", m: "06.2019", x: "Instrumental de Sacolão Beats Marotas." },
    { id: "341145017", t: "CAÇA AOS COGUMELOS", d: "01:17", m: "06.2019", x: "Por Cansado." },
  ],
};

// clipes: ano = publicação no YouTube. papel = como está no portfólio.
export const CLIPES = [
  {
    id: "vendaval", t: "Vendaval", q: "Souto MC", ano: "2024", ar: 2.45,
    p: "direção, direção de fotografia e edição", y: "3wIDaBfHRsk",
    nota: "Exibido na 4ª Mostra Hip Hop de Cinema SP, na Mostra de Cinema Trans do Piauí, no Festival de Videoclipes Foca Aqui, na Mostra Trans de Cinema (APTA) e no Festival Latinoamericano de Cine Indígena.",
    grande: true,
  },
  { id: "amanheceu", t: "Amanheceu Nublado", q: "Mayer & João Alquímico ft. Victor Xamã", ano: "2021", ar: 2.69, p: "direção, imagens e edição", y: "1HAVMQsaaag" },
  { id: "808", t: "808", q: "Batalha da Aldeia · Brisa Flow, Boombeat, Torya, Cayari e Laysa", ano: "2019", ar: 2.75, p: "idealização e direção do projeto; direção, fotografia, edição e colorização", y: "ZNUdoyihlxQ" },
  { id: "fatos", t: "FATOS", q: "Batalha da Aldeia · Bianca Hoffmann, Monna Brutal, Karen Santana e Toddy", ano: "2019", ar: 2.18, p: "idealização e direção do projeto de inclusão e diversidade", y: "VjlyP2y8Pvk" },
  { id: "verde-esmeralda", t: "Verde Esmeralda & Cinza Granito", q: "Victor Xamã", ano: "2019", ar: 2.49, p: "direção, direção de fotografia, imagens e edição", y: "adrzZxOtAds", selo: "indicado a melhor videoclipe · Prêmio Genius Brasil 2019" },
  { id: "assimetrico", t: "Assimétrico", q: "Victor Xamã & Brisa Flow", ano: "2019", ar: 1.59, p: "direção, direção de fotografia, imagens e edição", y: "O-r6IClLK4M" },
  { id: "dez-anos", t: "Dez Anos", q: "Cris SNJ", ano: "2019", ar: 1.77, p: "direção, direção de fotografia, imagens e edição", y: "7lzzGieqmWg" },
  { id: "ta-no-jogo", t: "Tá no Jogo", q: "Preta Ary ft. Ju Dorotea e Killa Bi", ano: "2018", ar: 1.77, p: "co-direção de fotografia, imagens e assistência de edição", y: "_SWmpfAX_m4" },
  { id: "mantra", t: "MANTRA", q: "Bob 13 · Aldeia Records", ano: "2018", ar: 1.77, p: "direção, direção de fotografia, imagens e edição", y: "x5em1XROvRo" },
  { id: "era-uma-vez", t: "Era uma vez", q: "Luana Hansen", ano: "2017", ar: 1.77, p: "co-direção de fotografia e imagens", y: "5wNPuPELPBA" },
  { id: "das-preta", t: "Das Preta", q: "Dory de Oliveira", ano: "2017", ar: 2.48, p: "assistência de fotografia, fotografia still e imagens", y: "k6Cmq5eEeQc" },
];

// o começo na JODO (2017 a 2019)
export const JODO = [
  {
    id: "instalacoes-noturnas", t: "Instalações Noturnas, Assuntos de Rua", q: "Lessa Gustavo, Makalister & l v k s · EP visual", ano: "10.11.2017", ar: 1.78,
    ela: "edição", com: "com Joaquim Macruz · imagens de Lucas Negrelli", y: "y5G2MQcldEo",
    nota: "O primeiro trabalho dela na JODO. Passa de 88 mil visualizações.",
  },
  { id: "amor-virtual", t: "Da Era do Amor Virtual", q: "Makalister · prod. Arit", ano: "09.01.2018", ar: 1.78, ela: "vídeo", com: "com Lucas Negrelli, Gustavo de Souza, Joaquim Macruz e Bruno Wadio · montagem de Gustavo de Souza", y: "2BdVAm7qvk0" },
  { id: "cacto-morbidus", t: "Cacto Morbidus", q: "Sergio Estranho x Lessa Gustavo", ano: "11.01.2018", ar: 1.78, ela: "imagens", com: "com Joaquim Macruz · edição de Gustavo de Souza", y: "cUO0HZqleVM", interno: "/artistas/sergio-estranho" },
  { id: "mantra", t: "MANTRA", q: "Bob 13 · Aldeia Records", ano: "14.06.2018", ar: 1.77, ela: "direção, edição e imagens", com: "imagens também de Joaquim Macruz · no YouTube o clipe sai como “Direção JODO”", y: "x5em1XROvRo" },
  { id: "sonho-lucido", t: "Sonho Lúcido", q: "Victor Xamã", ano: "30.07.2018", ar: 1.78, ela: "edição e imagens em preto e branco", com: "imagens em São Paulo e Pindamonhangaba com Joaquim Macruz e Cesar Lima · imagens de Manaus e cor por Lucas Negrelli", y: "0Z_NVkiwR7A" },
  { id: "manutencao-da-alma", t: "Manutenção da Alma", q: "dro part. Guilherme Ayres", ano: "06.12.2018", ar: 1.78, ela: "direção, edição, colorização e câmera 1", com: "câmera 2 de @011vivencia", y: "P9EoQjDT6pE" },
  { id: "estranho", t: "E.S.T.R.A.N.H.O.", q: "Sergio Estranho part. DJ BatataKilla", ano: "13.02.2019", ar: 1.75, ela: "direção (com Sergio Estranho) e imagens", com: "edição de Sergio Estranho · scratchs de DJ BatataKilla", y: "YmASqFDxxbY", interno: "/artistas/sergio-estranho" },
];

export const JODO_LINHA = [
  { d: "11.01.2018", t: "Cacto Morbidus", q: "Sergio Estranho x Lessa Gustavo", p: "imagens, com Joaquim Macruz", y: "cUO0HZqleVM" },
  { d: "02.2018", t: "Quando Observo a Cruz de Folga", q: "Makalister", p: "imagens, com Lucas Negrelli; montagem de Joaquim Macruz", y: "CTJQW99V6tU" },
  { d: "14.06.2018", t: "MANTRA", q: "Bob 13 · Aldeia Records", p: "direção. No YouTube o clipe sai com o crédito “Direção JODO”", y: "x5em1XROvRo" },
];

export const LUNAR = {
  titulo: "LUNAR",
  quem: "Souto MC",
  ano: "2026",
  ficha: [
    ["Direção criativa", "Arroba Quintal e Isa Katupyryb / Souto"],
    ["Direção de fotografia e edição", "Isa Katupyryb"],
    ["Gaffer e iluminação", "Lê Jorge Ramos"],
    ["Produção", "Rota Clandestina, Caroline Cavalcante e Victor Trajano"],
    ["Styling", "Vi Vênus e Lucas Golli"],
    ["Beleza", "TIKA Beleza Originária"],
    ["Hair", "Odara"],
    ["Making of", "Arroba Quintal"],
  ],
  apoio: "ProAC, Secretaria da Cultura, Economia e Indústria Criativas do Estado de São Paulo",
  links: [["Souto no Instagram", LINKS.souto], ["ouvir LUNAR no Spotify", LINKS.soutoSpotify], ["o clipe oficial (direção de Baboo Matsusaki)", yt("OLBc5O0FWWs")]],
};

export const PARENTESES = {
  ano: "2025",
  frase: "uma publicação impressa para tatear memória, folhear passados presentes e registrar com autonomia perspectivas diversas.",
  numeros: [
    ["100+", "participantes publicados"],
    ["20+", "textos inéditos sobre cultura originária"],
    ["40+", "artistas visuais e poetas celebrados"],
    ["7", "países presentes"],
    ["50+", "exemplares distribuídos de graça para espaços periféricos e indígenas"],
  ],
  temas: ["resistência", "artes visuais", "cinema", "jornalismo", "línguas", "entrevistas", "poesia", "hip hop", "artes", "saúde", "confluências", "Abya Yala", "Palestina", "cigana", "afro"],
  ficha: [
    ["Direção criativa e executiva", "Isa Katupyryb"],
    ["Assistência de direção", "Rio Inahuazo"],
    ["Produção", "Anabya"],
    ["Coordenação financeira", "Geovanna Sales"],
  ],
  nota: "1ª edição, 2025. Projeto contemplado pelo edital V.A.I. 1 2024.",
};

export const PREMIO = {
  titulo: "Entre o Latido e o Silêncio",
  texto: "Experimento visual premiado pelo Museu da Pessoa na categoria Criadores Indígenas do Prêmio Vidas Indígenas, em 2025.",
};

export const REGISTROS = [
  ["29.12.2025", "Rap Plus Size, 10 anos", "vídeo da noite de comemoração, com apoio da Política Nacional Aldir Blanc (PNAB) / ProAC"],
  ["2025", "Caminhante Hi-Tech · Gabrelü", "aftermovie, pelo olhar de Isa"],
  ["2025", "Série “Trabalho” · Lincoln Péricles", "fotografia, publicada na Revista Zum"],
  ["2025", "Fluxo SP · Instituto Poiesis e SMC", "articulação e mapeamento de equipamentos de cultura das zonas norte e oeste de São Paulo, para a programação de 700 atividades"],
  ["2024", "Desejo de Viver · Butikin Filmes", "fotografia still e making of"],
  ["2024", "Campanha Demon Slayer Brasil", "captação de imagens e making of"],
];

export const CINEMA = [
  { ano: "2025", t: "Bioma", d: "curta-metragem híbrido de Porañ Puri. Direção de fotografia e montagem de Isa. Filmado em 2024, lançado em 2025.", href: LINKS.bioma, rot: "@biomacurta", img: "bioma-1" },
  { ano: "2024", t: "Vidas Indígenas · povo Enawenê Nawê", d: "educação audiovisual no projeto Vidas Indígenas, do Museu da Pessoa.", href: LINKS.enawene, rot: "museudapessoa.org", img: "enawene" },
  { ano: "2024", t: "Condições", d: "documentário sobre pessoas trans com deficiência. Equipe de câmera." },
  { ano: "2023", t: "Pajubá", d: "documentário de Gautier Lee e Hela Santana. Equipe de câmera." },
  { ano: "2023", t: "Fórum Nacional de Mulheres no Hip Hop · DF", d: "documentário. Direção, direção de fotografia e edição.", href: yt("zl0FJ1Jhm18"), rot: "assistir" },
  { ano: "2023", t: "Indígenas pela Terra e pela Vida", d: "edição dos vídeos da exposição do Museu da Pessoa; em 2022, a exposição Vidas Indígenas.", href: LINKS.vidasIndigenas, rot: "a exposição" },
  { ano: "2021", t: "Weá Terra Fértil · National Geographic", d: "campanha de moda indígena e meio ambiente com Dayana Molina e Sioduhi. Assistência de fotografia.", href: yt("2Qo5Ca_RWC8"), rot: "assistir" },
  { ano: "2021", t: "O Não-Lugar · 7 relatos", d: "série de relatos documentais de pessoas indígenas em contexto urbano. Direção, imagens e edição.", href: LINKS.naoLugar, rot: "o canal" },
  { ano: "2019", t: "Fórum Nacional de Mulheres no Hip Hop · Aracaju", d: "documentário. Direção, direção de fotografia e edição.", href: yt("4YuVKkUhVKE"), rot: "assistir" },
];

export const HIPHOP = {
  texto: "Idealizou e dirigiu o projeto de inclusão de gênero da Batalha da Aldeia, a segunda maior batalha de rima da América Latina: as cyphers “808” e “FATOS”.",
  juri: [
    ["2023", "Júri de audiovisual · Prêmio Rap Brasil"],
    ["2021", "Júri técnico de direção de videoclipe · Prêmio Genius Brasil de Música Brasileira"],
    ["2019", "Indicação a melhor videoclipe · “VE.CG” de Victor Xamã · Prêmio Genius Brasil"],
  ],
  nomes: ["Victor Xamã", "Souto MC", "Cris SNJ", "Brisa Flow", "Boombeat", "Torya", "Cayari", "Laysa", "Killa Bi", "Dory de Oliveira", "DJ Yume", "Thaíde", "Gabi Nyarai", "Ai.P MC", "Sara Donato", "DJ Joseph Rodriguez", "Jotapê", "Makalister", "Alka", "Marcelinha MC", "Nenê Surreal", "WinniT", "Kamau", "Monna Brutal", "Mayer", "João Alquímico", "Preta Ary", "Ju Dorotea", "Luana Hansen", "Bob 13", "Lessa Gustavo", "Sergio Estranho", "DJ BatataKilla", "dro", "Guilherme Ayres", "Bianca Hoffmann"],
};

export const MUSICA = {
  texto: "A pesquisa vira acervo: mais de 75 nomes de povos e contextos diferentes, do território Pindô Retã (Brasil) a toda a Abya Yala, reunidos em uma playlist atemporal. E vira fotografia de show, de rua, de retomada.",
  capas: [
    { f: "ori-capa", t: "EP Dela", q: "Wescritor", a: "capa dela", href: "https://www.deezer.com/album/215547082" },
    { f: "disc/brisa-selvagem", t: "Selvagem Como o Vento", q: "Brisa Flow", a: "2018", href: "https://www.deezer.com/album/80932462" },
    { f: "disc/brisa-free", t: "Free Abya Yala", q: "Brisa Flow", a: "2020", href: "https://www.deezer.com/album/149739472" },
    { f: "disc/brisa-janequeo", t: "Janequeo", q: "Brisa Flow", a: "2022", href: "https://www.deezer.com/album/323551607" },
    { f: "disc/brisa-lowtape", t: "Lo-w Tape", q: "Brisa Flow", a: "2018", href: "https://www.deezer.com/album/67108332" },
    { f: "disc/wes-corpos", t: "Corpos Laranjas", q: "Wescritor", a: "2019", href: "https://www.deezer.com/album/123556022" },
    { f: "disc/wes-trap", t: "T.R.A.P", q: "Wescritor", a: "2020", href: "https://www.deezer.com/album/141911592" },
    { f: "disc/wes-lado13", t: "LADO 13", q: "Wescritor", a: "2022", href: "https://www.deezer.com/album/340398847" },
    { f: "disc/cayari-territorio", t: "Território Vivo", q: "Cayari", a: "2026", href: "https://www.deezer.com/album/1024845871" },
  ],
  fotografados: ["Brisa Flow", "Souto MC", "Edivan Fulni-ô", "Wescritor", "Cayari", "Marcia Mura"],
};

export const TEXTOS = [
  { ano: "2023", t: "50 anos de hip hop, 523 anos de resistência indígena: o que hip hop e cultura indígena têm a ver?", d: "matéria publicada no portal Strads e no Medium do Coletivo Solos", href: LINKS.strads, alt: { rot: "ler no Medium", href: LINKS.medium } },
  { ano: "2022", t: "Quem Me Navega É O Mar: Retomadas Indígenas · O Não-Lugar", d: "artigo em coautoria com Lyryca Cunha, para o projeto Conexão Linguagens", href: null },
  { ano: "2021", t: "20 artistas indígenas que fortalecem a música contemporânea", d: "matéria no portal Kalamidade, em coautoria", href: LINKS.kalamidade },
  { ano: "2021", t: "Entrevista · Straditerra", d: "Isa Hansen fala sobre arte e diversidade", href: LINKS.straditerra },
];

export const MESAS = [
  ["2025", "4º Fórum SPCINE", "mediação da mesa “Cinema é território”"],
  ["2023", "Festival Cidade do Futuro", "mesa “Movimentos artísticos e resistências LGBTQIAP+”"],
  ["2022", "Sesc Paulista", "mesa “Processos criativos artísticos e indígenas”, com Carolina Velasquez, Jobana Moya, Jamille Anahata, Grupo Autóctone Waly Wayra, Rio Inahuazo e Cholitas da Babilônia"],
  ["2019", "Fórum Nacional das Mulheres no Hip Hop · Aracaju", "abertura, ao lado de Vera Veronika, Negra Tcha e Negalê"],
  ["2018", "São Paulo", "mesa “O que configura o disco do ano?”, ao lado de Rapem Quadrinhos, Genius e Kondzilla"],
];

export const COLETIVOS = [
  { t: "O Não-Lugar · retomadas indígenas", d: "Núcleo audiovisual do coletivo. Projeto contemplado pelo fomento V.A.I. 2020. Em 2022, instalação audiovisual no Centro Cultural São Paulo, a convite do projeto Conexão Linguagens.", href: LINKS.naoLugar, rot: "o arquivo" },
  { t: "Coletivo Solos", d: "Nasce em 2023, de três membros do Não-Lugar (Isa Katupyryb, Geovanna Sales e Rio Inahuazo), para projetos protagonizados por pessoas indígenas: música, artes visuais, cinema, literatura e pesquisa." },
  { t: "Conferência Livre e Popular de Indígenas em Contexto Urbano Marçal de Souza", d: "Núcleo de comunicação. Também integra o Seminário Etnocídio Indígena." },
];

// desenho e capas: arq, título (só onde o portfólio dá nome), proporção w/h
export const DESENHOS = [
  { a: "onca", t: "", w: 710, h: 684 },
  { a: "alienigena", t: "ALIENÍGENA · em seu próprio corpo, em sua própria terra", w: 536, h: 733 },
  { a: "colagem-laranja", t: "", w: 1144, h: 808 },
  { a: "pindorama", t: "MADE IN PINDORAMA", w: 555, h: 613 },
  { a: "rostos-verdes", t: "Série Traços", w: 1297, h: 810 },
  { a: "laranja", t: "", w: 467, h: 613 },
  { a: "pula-corda", t: "", w: 422, h: 613 },
  { a: "azul", t: "", w: 571, h: 810 },
  { a: "onca-verde", t: "", w: 573, h: 810 },
  { a: "onca-linha", t: "", w: 516, h: 496 },
];

// capas que não estão no Vimeo (as do canal "cinema fora de cena" aparecem na lista da própria sessão do Vimeo)
export const CAPAS = [
  { a: "cronicas", t: "Crônicas do Dr. Sanchez", w: 500, h: 750, href: yt("tIfsZ2c_n34"), rot: "ver no YouTube" },
  { a: "andarilha-capa", t: "Andarilha do Tempo · Anabya · 2024", w: 872, h: 871 },
];
