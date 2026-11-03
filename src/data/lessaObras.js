// dados das obras do Lessa Gustavo (faixas, créditos, vídeos, links)
export const LINKS = {
  spotify: "https://open.spotify.com/artist/1Fxj29J2wowDAzBFPzaTDQ", youtube: "https://www.youtube.com/channel/UCZDYrpQqQnDcdPHf6BkPlOA",
  instagram: "https://www.instagram.com/gessalustavo/", soundcloud: "https://soundcloud.com/lessagustavo", bandcamp: "https://lessagustavo.bandcamp.com/",
};

// ficha: [rótulo, [nomes]]. "Com" = aparece nas faixas (Spotify); os outros rótulos vêm dos créditos da capa, dos vídeos e do SoundCloud
export const OBRAS = [
  { k: "instalacoes", sp: "74Yc275AmUjEq4TKkRYEyW", t: "Instalações Noturnas, Assuntos de Rua", a: 2017, tipo: "EP visual", obj: "colagem",
    faixas: ["A Mosca no Vidro e a Gota na Sopa de Letras", "Flow Caixa de Surpresa (De Frente a Fila Preferencial)", "Instalações Noturnas, Assuntos de Rua", "Peixes Ornamentais"],
    ficha: [["Com", ["Makalister", "l v k s"]]], vids: [["Instalações Noturnas, Assuntos de Rua", "y5G2MQcldEo"]] },
  { k: "catarina", sp: "3IqZB7ofhEhfJGIUFBSFgn", t: "Catarina", a: 2021, tipo: "disco", obj: "raio-x",
    faixas: ["Solução", "Flash!", "Opção", "Fevereiro", "Fofoca", "Cafona", "Bulletproof", "Penhasco", "Lilás"],
    ficha: [["Produção", ["an_tnio"]], ["Captação", ["Eduardo Mayrinck"]], ["Visualizer", ["Daniel Moraes", "Gerran Damasceno"]]], vids: [["Catarina (EP)", "Vsdiyt8xrYQ"]] },
  { k: "impasse", sp: "5NC7KkF9yJrbzxnqWX75oJ", t: "Impasse Mexicano", a: 2022, tipo: "disco", obj: "estampa",
    faixas: ["Introdução", "Castigo", "Trapaça", "Diss", "Maldade", "Vilões", "Tesouras"],
    ficha: [["Produção", ["EricBeatz", "Nnay Beats"]], ["Com", ["sódan.", "Marcão Baixada", "William Luis"]]], vids: [["Diss / Trapaça", "h0i5786zKl8"]] },
  { k: "wilson-grey", sp: "78Ke1XvJzDLunxiqIIaSjm", t: "Wilson Grey", a: 2022, tipo: "disco com Keith", obj: "serigrafia",
    faixas: ["Comunicação", "Um Brinde", "Papelada", "Bag Térmica", "Certezas", "O Júri", "Endorfina", "Mira Laser", "Débito", "Sumo", "Cédulas", "Jet Life"],
    ficha: [["Com", ["Keith", "CRIS.", "Sopa Preta", "Duvô", "ieti", "Vici", "Nulo", "Gil Daltro"]]],
    vids: [["Um Brinde", "JSmpowOqmuQ"], ["Papelada / Certezas", "jSpOTsipX9Y"], ["O Júri", "0tr6le7HwnI"], ["Jet Life", "MBOwk9rfe4M"]] },
  { k: "cor-de-deus", sp: "5Um3rpVuo4GAiomjpTMe6y", t: "Cor de Deus Quando Foge", a: 2023, tipo: "disco com Dawmata", obj: "adesivo",
    faixas: ["Quadrupede", "Deus Ex Machina", "Par de Brincos", "Loto", "Pó de Mico", "Um Deus", "Chamas", "Tempestade"],
    ficha: [["Instrumental e mix", ["Dawmata"]], ["Captação e master", ["Estúdio JRM"]], ["Com", ["CRIS.", "ieti", "Raro", "VND", "NFL MADMAXX", "2d intocável"]]],
    vids: [["Deus Ex Machina", "5IL1krGCcuo"], ["Quadrupede", "sIDGUBuA3xQ"], ["Audição", "QnQBoNSIHiU"]] },
  { k: "mojica", sp: "1dvJO8olhOrRA0PLHh8Lcv", t: "Mojica", a: 2023, tipo: "disco com CIANO", obj: "veludo",
    faixas: ["Mônaco", "Murros", "Bom Dia", "Manchete", "Brejo", "Pelo Fim da Tradição", "Fah Fah", "Advogado do Diabo", "Goteira", "Dó"],
    ficha: [["Produção", ["CIANO"]], ["Com", ["CRIS.", "Galf AC", "Bonsai", "Servo"]]],
    vids: [["Murros", "WFHfqc-aE4I"], ["Goteira", "cqczgTH0x6c"], ["Manchete", "10kg1fWsejI"], ["Pelo Fim da Tradição", "b0UVdYXOJcI"]] },
  { k: "uma-mao", sp: "7tzqCUBuZlHTsVJvy7YibP", t: "Uma Mão Lava a Outra", a: 2024, tipo: "single", obj: "polaroide",
    faixas: ["Uma Mão Lava a Outra"], ficha: [["Com", ["CRIS.", "Raro", "Pedro Saci"]]], vids: [] },
  { k: "antes-carnica", sp: "6ywOBiyQNNRLVZE3DWLrmr", t: "Antes Que Vire Carniça", a: 2024, tipo: "EP", obj: "serigrafia-vermelha",
    faixas: ["Luz", "Quantoskgcabemnessamala?", "Velas Molhadas", "Encruzilhada", "Luz Negra", "Kdmeubagulho?"],
    ficha: [["Com", ["ARPAK", "Vici", "CRIS.", "ieti"]], ["Mix e master", ["Roberto Lucaro"]]], vids: [["Kdmeubagulho?", "Jdxb13bki8U"]] },
  { k: "sereno", sp: "155leO5vwwn2NRWrJLNHkp", t: "Sereno da Via Light", a: 2025, tipo: "álbum com muitobomloopar", obj: "fita",
    faixas: ["Prantos", "Ruas da Grécia / Clube Silêncio", "Funil", "Salvação", "Slat!", "Gangorra", "Corte Julienne", "Entretenimento", "2002", "Vapo!", "Knockout / Quarto", "Globo da Morte", "Tchau!"],
    ficha: [["Faixas produzidas por", ["muitobomloopar"]], ["Escritas por", ["Lessa Gustavo"]], ["Mixagem e masterização", ["Marco Caramelli"]], ["Capa", ["Eduardo Severi", "Lessa Gustavo"]], ["Produção executiva", ["Igor Serra"]], ["Com", ["Sopa Preta", "Duvô", "SUB DELTA"]]],
    texto: "NCI 001 · NCI Media", vids: [["Slat!", "4Knz6ebUE3o"], ["2002 / Vapo!", "DqGRAyhzvxA"], ["Ruas da Grécia / Clube Silêncio", "f7tJLsSJiB4"]] },
  { k: "muita-ostra", sp: "1gM3ycRYJo4CLs3mbaiib6", t: "Muita Ostra e Pouca Pérola", a: 2026, tipo: "EP com Mazé Foram", obj: "xerox",
    faixas: ["Tubarão Martelo", "Farsa e Tempo", "Na Boca da Orca", "Uma Jangada na Lava", "Azul Marinho", "Cortinas e Lençóis"],
    ficha: [["Com", ["Mazé Foram", "obelga"]]], vids: [] },
];
OBRAS.forEach((o) => { o.pessoas = [...new Set(o.ficha.flatMap((f) => f[1]))]; });
export const IDX = Object.fromEntries(OBRAS.map((o, i) => [o.k, i]));
