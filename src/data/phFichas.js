// fichas técnicas de cada capítulo do filme: capa, créditos e links (conferidos no Spotify e no YouTube)
const SP = (id) => ["spotify", `https://open.spotify.com/album/${id}`];
const YT = (id) => ["youtube", `https://www.youtube.com/watch?v=${id}`];

export const FICHAS = {
  "só rimas | abençoado": {
    linhas: ["single com alfano", "11.03.2026"],
    obras: [{ t: "só rimas | abençoado", c: "4cGLyWlqazK4lfSzpGyuqS", l: [SP("4cGLyWlqazK4lfSzpGyuqS"), YT("pdSWORnrzqM")] }],
  },
  intravenal: {
    linhas: ["ep com krapnek82 · 5 faixas", "30.01.2026 · ©jodojodojodo"],
    obras: [{ t: "intravenal", c: "52wRSFms6UCZ55l8DjfthN", l: [SP("52wRSFms6UCZ55l8DjfthN"), YT("I6cvxEs1otg")] }],
  },
  intravenoso: {
    linhas: ["curta-metragem", "26.01.2026"],
    obras: [{ t: "intravenoso", c: "52wRSFms6UCZ55l8DjfthN", l: [YT("cu1sTA7JOz8")] }],
  },
  "relicário": {
    linhas: ["single + curta", "2025"],
    obras: [{ t: "relicário", c: "41rfDG3WkuFMsN5BgXFsSL", l: [SP("41rfDG3WkuFMsN5BgXFsSL"), YT("f6McxgV9Jfg"), ["bandcamp", "https://phineasss.bandcamp.com/track/relic-rio"]] }],
  },
  "sonhos de ícaro": {
    linhas: ["single com 1lum3", "prod. msor · 2025"],
    obras: [{ t: "sonhos de ícaro", c: "6xEySYREet3pKFNvXr3VN6", l: [SP("6xEySYREet3pKFNvXr3VN6"), YT("Bi9I-xs-lXQ")] }],
  },
  jardim: {
    linhas: ["ep com karmo", "2025"],
    obras: [{ t: "jardim", c: "5lZpF1TGqiW9LrRJJiWke9", l: [SP("5lZpF1TGqiW9LrRJJiWke9"), YT("UZ4fFpaYcNM")] }],
  },
  estrada: {
    linhas: ["ep e beat tape", "12.11.2024 · ©rancho mont gomer"],
    obras: [{ t: "estrada", c: "4fzXl934NlMK56eXlsB9Qb", l: [SP("4fzXl934NlMK56eXlsB9Qb"), YT("cGGTbQph48Q"), ["soundcloud", "https://soundcloud.com/phineas-867227871/sets/estrada"]] }],
  },
  fisica: {
    linhas: ["single com aura soul", "13.07.2024"],
    obras: [{ t: "fisica", c: "703p7KksYkzCMscPct48F1", l: [SP("703p7KksYkzCMscPct48F1"), YT("SxbSqn5seo8")] }],
  },
  "só mais um...": {
    linhas: ["só mais um... · 04.2023", "phillip bankz, com nine. · 07.2023"],
    obras: [
      { t: "só mais um...", c: "4e7PD5MuyIj9JI914VYlvJ", l: [SP("4e7PD5MuyIj9JI914VYlvJ"), YT("tj9vJlOuxR0")] },
      { t: "phillip bankz", c: "4mDDJLhuRmRFper7gxsieR", l: [SP("4mDDJLhuRmRFper7gxsieR"), YT("IIgqeSDeTNE")] },
    ],
  },
  atemporal: {
    linhas: ["ep · 20.07.2020 · 7 faixas", "mais tarde... · 05.2020"],
    obras: [
      { t: "atemporal", c: "4fGjMgHXZmVc69kCPVuSJG", l: [SP("4fGjMgHXZmVc69kCPVuSJG"), YT("xADWC7ydg0o")] },
      { t: "mais tarde...", c: "3T8WOWOi137WhE6Oq59h8T", l: [SP("3T8WOWOi137WhE6Oq59h8T"), YT("vDwgQ7O8XNA")] },
    ],
  },
  "o começo": {
    linhas: ["divina · abr/2019", "final · jun/2019", "sobre você... pt. 1lum3 · ago/2019"],
    obras: [
      { t: "divina", c: "2vmhdx7BocAmLTDwlXx1rH", l: [SP("2vmhdx7BocAmLTDwlXx1rH"), YT("KyQNjp7691w")] },
      { t: "final", c: "2HflNhmjtUgaEktbKBTaQx", l: [SP("2HflNhmjtUgaEktbKBTaQx"), YT("tQIOdalriuU")] },
      { t: "sobre você...", c: "4FvFzfyK9NcbRdTkeulhy6", l: [SP("4FvFzfyK9NcbRdTkeulhy6"), YT("xN0_ApkUDko")] },
    ],
  },
  "não me importo com as cinzas": {
    linhas: ["rogdog pt. jardim, higor, phinea$ & wellquem", "12.2018"],
    obras: [{ t: "não me importo com as cinzas", c: null, l: [YT("33_n6HoOZAY")] }],
  },
};
