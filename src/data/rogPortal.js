/*
  Rog, página "O portal". Cada cena termina com um mergulho (zoom) numa imagem; a cor do mergulho vira o fundo da cena seguinte.
  Fotos: /rg/p/NN.webp (NN = ordem dos arquivos de anothers/rog, bordas pretas cortadas; ver artistas/rogdog/fotos_rog).
  Peça: { i: imagem, x: esquerda em vw, w: largura em vw, a: ponto (0..1) da cena em que o topo chega em `rest`,
          rest: topo em vh nesse ponto, v: velocidade (parallax), r: rotação em graus }.
  portal: { i, fx, fy } = imagem do mergulho e o ponto (em %) onde o zoom entra.
  c0/c1: cor do fundo no começo e no fim da cena; o mergulho termina na c0 da próxima.
*/
export const LINKS = {
  vimeo: "https://vimeo.com/rogeriosoares",
  instagram: "https://www.instagram.com/rogdog_/",
  pinturas: "https://www.instagram.com/nogoddogon/",
};

export const CENAS = [
  {
    id: "capa", nome: "Rog", c0: "#c7a03a", c1: "#c7a03a",
    pecas: [{ i: 57, x: 40, w: 62, a: 0, rest: -6, v: 0.12 }],
    portal: { i: 57, fx: 35, fy: 47 },
  },
  {
    id: "telas", nome: "Telas", c0: "#d6b948", c1: "#2b1d42", palavra: "TELAS",
    pecas: [
      { i: 64, x: 5, w: 36, a: 0.12, rest: 16, v: 0.8, r: -2 },
      { i: 0, x: 58, w: 26, a: 0.35, rest: 30, v: 1.1, r: 2 },
      { i: 57, x: 20, w: 32, a: 0.58, rest: 20, v: 0.9, r: 1.5 },
      { i: 59, x: 52, w: 34, a: 0.9, rest: 12, v: 1.2, r: -1 },
    ],
    portal: { i: 59, fx: 58, fy: 70 },
  },
  {
    id: "vermelho", nome: "Vermelho", c0: "#8c1212", c1: "#ff8a1f", palavra: "VERMELHO",
    pecas: [
      { i: 24, x: 58, w: 38, a: 0.2, rest: 8, v: 0.9 },
      { i: 30, x: -4, w: 44, a: 0.36, rest: 38, v: 1.2 },
      { i: 31, x: 40, w: 40, a: 0.52, rest: -2, v: 0.7 },
      { i: 26, x: 8, w: 44, a: 0.7, rest: 30, v: 1.0 },
      { i: 25, x: 62, w: 24, a: 0.8, rest: 14, v: 1.3, r: 2 },
      { i: 35, x: 32, w: 22, a: 0.9, rest: 36, v: 1.5, r: -3 },
    ],
    portal: { i: 29, fx: 50, fy: 55 },
  },
  {
    id: "neon", nome: "Neon", c0: "#05030c", c1: "#2b0a6b", palavra: "NEON",
    pecas: [
      { i: 39, x: 8, w: 30, a: 0.2, rest: 14, v: 1.0 },
      { i: 43, x: 44, w: 48, a: 0.4, rest: 10, v: 0.8 },
      { i: 46, x: 62, w: 26, a: 0.6, rest: 46, v: 1.3 },
      { i: 42, x: 20, w: 26, a: 0.78, rest: 32, v: 1.1 },
      { i: 41, x: 48, w: 30, a: 0.93, rest: 8, v: 0.9 },
    ],
    portal: { i: 41, fx: 36, fy: 43 },
  },
  {
    id: "agua", nome: "Água", c0: "#1a78b8", c1: "#7d8a45", palavra: "ÁGUA",
    pecas: [
      { i: 44, x: 6, w: 30, a: 0.15, rest: 10, v: 0.9 },
      { i: 45, x: 50, w: 46, a: 0.3, rest: 26, v: 1.1 },
      { i: 47, x: 2, w: 40, a: 0.5, rest: 46, v: 0.8 },
      { i: 51, x: 56, w: 38, a: 0.64, rest: 8, v: 1.2 },
      { i: 54, x: 30, w: 30, a: 0.78, rest: 30, v: 1.0 },
      { i: 56, x: 66, w: 26, a: 0.88, rest: 42, v: 1.4 },
      { i: 58, x: 8, w: 30, a: 0.95, rest: 22, v: 1.3 },
    ],
    portal: { i: 44, fx: 12, fy: 22 },
  },
  {
    id: "moda", nome: "Moda", c0: "#efece6", c1: "#e4e0d8", palavra: "MODA",
    pecas: [
      { i: 81, x: 6, w: 28, a: 0.15, rest: 14, v: 0.7 },
      { i: 83, x: 36, w: 28, a: 0.4, rest: 8, v: 0.7 },
      { i: 85, x: 66, w: 28, a: 0.65, rest: 16, v: 0.7 },
      { i: 84, x: 18, w: 26, a: 0.9, rest: 12, v: 0.8 },
    ],
    portal: { i: 87, fx: 58, fy: 45 },
  },
  {
    id: "cartaz", nome: "Cartaz", c0: "#1d9a52", c1: "#b6d92c", palavra: "CARTAZ",
    pecas: [
      { i: 65, x: 4, w: 26, a: 0.1, rest: 14, v: 0.9, r: -4 },
      { i: 9, x: 34, w: 24, a: 0.2, rest: 30, v: 1.2, r: 3 },
      { i: 70, x: 64, w: 28, a: 0.3, rest: 10, v: 0.8, r: -2 },
      { i: 13, x: 10, w: 22, a: 0.45, rest: 34, v: 1.3, r: 2 },
      { i: 71, x: 40, w: 26, a: 0.56, rest: 8, v: 1.0, r: -3 },
      { i: 76, x: 70, w: 24, a: 0.68, rest: 36, v: 1.4, r: 3 },
      { i: 17, x: 22, w: 24, a: 0.8, rest: 14, v: 1.1, r: -2 },
      { i: 86, x: 52, w: 30, a: 0.93, rest: 10, v: 0.9, r: 2 },
    ],
    portal: { i: 86, fx: 50, fy: 8 },
  },
];

// cor em que o mergulho da última cena termina (fundo da cena final, o índice de vídeos)
export const COR_FINAL = "#0b0b0c";
