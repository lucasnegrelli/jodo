/*
  Discografia completa da 1LUM3 no Spotify (conferida em 21/10/2026): id do lançamento, hash da capa (640 px em
  https://i.scdn.co/image/ab67616d0000b273 + hash), tipo (A álbum, E EP, S single), ano e número de faixas.
  Não são arquivos baixados: as capas são exibidas por link direto do Spotify.
*/
export const CAPA = "https://i.scdn.co/image/ab67616d0000b273";

// [id, hash, tipo, ano, faixas, título]
const BRUTO = [
  ["1W8IOFuLxa6qGijUjBCdw3", "e5bb61d9777b3119b822dd03", "A", 2026, 7, "Um Estudo Sobre Os Nossos Tropeços"],
  ["1qqEpA7cVgTVs0ztNH6tYD", "437ab5967427830b1583e383", "S", 2026, 1, "Explicando o céu"],
  ["74fVYwlkNocYi8moLkIhno", "55b4af8db0f34e2a8bdc23ea", "S", 2026, 1, "E Quando Eu Me Cansar de Tudo? (Tudo Que Você Não Viu)"],
  ["2lW0wS0UHQ11Q2prcG6OnO", "e87eaf9b3352784106496a51", "E", 2026, 6, "instante-já"],
  ["0kFCWEhvIaoJAtVTqyM5by", "aa290d62bac0021a749ebd48", "S", 2026, 1, "Flor de Alcaçúz"],
  ["0jGlptU6GpEj3vgsKibfbu", "30fa93b47dc8e500215e65dc", "S", 2026, 1, "O Tempo é Tudo Que Eu Não Posso Perder"],
  ["3XZFSC10pLCxruxckpWkan", "5c2203b69ac4ab993376b832", "S", 2025, 1, "screams between screens"],
  ["6xEySYREet3pKFNvXr3VN6", "edce61a2a1c6f26f1e504787", "S", 2025, 1, "SONHOS DE ÍCARO"],
  ["23pudiOCn8YnqSoP5R6iaJ", "c7eb8bac3c14622f01328260", "S", 2025, 1, "centro parte II"],
  ["0KDsIQQPFD46WurwJt9XlM", "638ac3f3cac9c490f9131dfe", "S", 2024, 1, "Promessas"],
  ["3eFblolN5hBbZCJbReejf3", "12f877b17d02085ab4ffcddf", "S", 2023, 1, "véu"],
  ["3F6Y6G5KppXCCKbDh04sM2", "d793509beb2d7e9362089cbc", "S", 2023, 1, "organism(o)"],
  ["4qqzuuxdYI0AF8iFKUrnko", "acc7e735a5c17e000340d9a7", "S", 2022, 1, "VMV"],
  ["0j4CuhijpRROY0QEGZo0HY", "38df3e3c91bfbd9c43720ea9", "S", 2022, 2, "dois2"],
  ["7BDLVNPwl7cHk3yRpLyAOk", "ba7b537235646b8d24ceb2a8", "S", 2022, 1, "mAd"],
  ["6zYBu4hvUXwboK6udDoB1v", "e2cd7d8cda42da1754d369e0", "S", 2022, 1, "piLLOW dREAMs"],
  ["4zL1ZiY39azxduT3e6688I", "0072ae8972e8e9085047726a", "S", 2021, 1, "lovecrime"],
  ["3qISPbB5vtiv6QwGcrC1Y4", "6276cf9f4d486b58cad0a0bd", "E", 2021, 6, "FIDELIO"],
  ["06BfPgubXDxkorD9KAVXLy", "7e17e98b5c3788ec9d5bc78d", "S", 2020, 1, "exílio"],
  ["1kPuGP9J0K3iDU18UZcYT5", "6a4fe8b2325818d6c3a25517", "S", 2020, 1, "excesso"],
  ["7kdZ4ilSjScYGKt7TSmdsi", "00de34228df75c1a1e97c8e4", "S", 2020, 1, "extremo"],
  ["1b55GTutdLzbZVKQG0yhDU", "1249b12da4872c8e270db623", "S", 2020, 1, "Nesses Dias"],
  ["1WoOHmIk0kC4KL0Vl9xQSm", "1e8d67304ba9bc23db37d6a9", "S", 2020, 2, "@ Hai Studio (Live)"],
  ["5stXHp5Xhx9yoGZCORmfCI", "b4fe252ae46e4bbc68020f39", "S", 2019, 1, "fragmentada"],
  ["4FvFzfyK9NcbRdTkeulhy6", "64238050d5726da5a1b0b15e", "S", 2019, 1, "SOBRE VOCÊ..."],
  ["3JB05mV6vyTS6yd8MibwsD", "ec372d1959b1c38637dc7358", "A", 2019, 13, "antinomia"],
  ["6jhWYdPDKARxKD45ezMk6W", "8ae41afc77e7d61b8f286a94", "S", 2019, 1, "Parfum de la nuit"],
  ["2FFyfMuhcLqYp3uU4K4SKO", "6570f5eace43d76aea0f9cca", "E", 2018, 6, "reflexos&refluxos"],
  ["2RP5k4rleGqWcTWEM93S42", "88056dfcc6d484da3c00b394", "S", 2018, 1, "medusa"],
  ["6PGNlGRVbqYQLPWdAQ61Im", "d1d6ba7c514bb1a1f7eb35b5", "E", 2018, 6, "waters"],
];

const TIPO = { A: "álbum", E: "EP", S: "single" };

export const DISCO = BRUTO.map(([id, h, t, ano, n, titulo]) => ({
  id, capa: CAPA + h, tipo: TIPO[t], ano, n, titulo,
}));

// mais ouvidas (Spotify, 21/10/2026)
export const TOP = [
  { t: "deep down", com: "com Baco Exu do Blues", n: 1050017 },
  { t: "Promessas", com: "com Beli Remour e FBC", n: 440749 },
  { t: "Flor de Alcaçúz", com: "com Makalister, Murica e Beli Remour", n: 179637 },
  { t: "Pra Todos Que me Querem de Pé", com: "com Beli Remour, Prs e o Peres", n: 153162 },
  { t: "E quando eu me cansar de tudo?", com: "com Beli Remour", n: 23339 },
];

export const OUVINTES = 53371;

export const COM_QUEM = ["Baco Exu do Blues", "Beli Remour", "FBC", "Makalister", "Murica", "Prs", "o Peres", "pibara", "FRAJ", "d4crvz", "GUS", "Matheus Coringa", "iiaancoo", "domrafa"];

// lançamentos que reutilizam a capa de outro: aparecem uma vez só, junto do principal
export const DUP = {
  "1qqEpA7cVgTVs0ztNH6tYD": "1W8IOFuLxa6qGijUjBCdw3", // Explicando o céu usa a capa do álbum
  "0jGlptU6GpEj3vgsKibfbu": "0kFCWEhvIaoJAtVTqyM5by", // O Tempo é Tudo Que Eu Não Posso Perder usa a de Flor de Alcaçúz
};
