"use client";

import { useEffect, useRef, useState } from "react";
import { Permanent_Marker, Reenie_Beanie, DM_Mono } from "next/font/google";
import Link from "next/link";
import MarcaTopo from "@/components/comum/MarcaTopo";
import styles from "@/styles/insytCaderno.module.css";

/*
  Insyt (DK): "o caderno". Referências: Mr. Pandas Paper Portfolio (mundo 3D de folha pautada com recortes em pé) e ITom (mundo em traço de lápis).
  A rolagem é uma câmera andando ao longo de uma folha de caderno gigante: parede pautada ao fundo, chão de papel, e os discos dele como recortes
  de papel em pé, com capas retas. Nas folhas do fundo ficam os desenhos do Instagram dele (insytilusion), recortados em tinta, que se revelam quando a câmera chega. O mouse deixa um risco de grafite. Clicar num recorte abre a ficha com o player (Spotify, YouTube ou SoundCloud).
  Tudo em unidades "u" (1u ≈ 12 px no desktop) para o mundo caber em qualquer tela. Perspectiva CSS 3D, sem WebGL.
*/
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--ic-marker", display: "swap" });
const mao = Reenie_Beanie({ subsets: ["latin"], weight: "400", variable: "--ic-mao", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--ic-mono", display: "swap" });

// desenhos do Instagram dele (insytilusion), recortados em tinta: [arquivo, x, y, largura, giro, px largura, px altura] (u)
const DESENHOS = [
  ["morcego-cabeca", 92, -30, 30, -3, 672, 844], ["dor-na-alma", 134, -16, 36, 2, 724, 383], ["menino-caixa", 150, -54, 17, 3, 593, 879],
  ["alien", 178, -36, 16, -2, 900, 900], ["grito", 216, -42, 38, -3, 766, 900], ["ta-geral", 252, -14, 26, 2, 727, 560],
  ["afro-olhos", 266, -52, 15, 3, 628, 853], ["chegada", 310, -32, 42, -2, 900, 899], ["mascara", 352, -48, 24, 2, 677, 900],
  ["mao-pano", 366, -14, 18, -3, 900, 900], ["morcego-celular", 404, -40, 30, 3, 615, 900], ["chaveiro", 446, -54, 16, -3, 720, 900],
  ["rosto-velho", 458, -24, 34, 2, 720, 900], ["vicios", 506, -46, 30, -2, 874, 770], ["cranio-grafite", 558, -28, 38, -3, 715, 786],
  ["olho", 520, -10, 12, 2, 900, 879], ["mumia", 602, -50, 20, 2, 900, 900], ["morcego-teia", 634, -20, 36, -2, 900, 887],
  ["anjo", 676, -54, 22, 3, 900, 900], ["lirica", 706, -28, 28, -2, 720, 900], ["rabisco-bar", 750, -48, 18, 3, 900, 900],
];

// ano escrito no chão, a cada cacho de capas
const ERAS = [[170, "2024 · 25"], [330, "fev 2024"], [490, "2022 · 23"], [632, "2019"], [750, "prod. DK"]];

// ícones desenhados à mão (viewBox 24): servem de marcador da linha do tempo e de rabisco pela parede e pelo chão
const ICONE = {
  flor: <><circle cx="12" cy="12" r="2.3" /><circle cx="12" cy="5.8" r="3.2" /><circle cx="17.9" cy="10.2" r="3.2" /><circle cx="15.6" cy="17.2" r="3.2" /><circle cx="8.4" cy="17.2" r="3.2" /><circle cx="6.1" cy="10.2" r="3.2" /></>,
  estrela: <path d="M12 2.5 L14.7 9 L21.5 9.4 L16.2 13.8 L18 20.5 L12 16.8 L6 20.5 L7.8 13.8 L2.5 9.4 L9.3 9 Z" />,
  espiral: <path d="M12 12 C12 10.5 14 10.5 14 12.4 C14 15 10 15 10 11.5 C10 8 15 7.5 16.5 11 C18 15.5 13 19.5 8.5 17 C4 14.5 5 6.5 11 4.5" />,
  seta: <path d="M3 16 C8 6 14 6 20 12 M14.5 8.2 L20.4 12.2 L13 15.6" />,
  coracao: <path d="M12 20 C4 14 3 9 6.5 6.5 C9 5 11 6.5 12 8.5 C13 6.5 15 5 17.5 6.5 C21 9 20 14 12 20 Z" />,
  x: <path d="M5 5 L19 19 M19 5 L5 19" />,
  raio: <path d="M13.5 2.5 L6 13 L11.5 13 L9.5 21.5 L18 10 L12 10 Z" />,
  olho: <><path d="M2.5 12 C6 5.5 18 5.5 21.5 12 C18 18.5 6 18.5 2.5 12 Z" /><circle cx="12" cy="12" r="3.4" /><circle cx="12" cy="12" r="1" /></>,
};
const Icone = ({ n, ...r }) => <svg viewBox="0 0 24 24" aria-hidden="true" {...r}>{ICONE[n]}</svg>;
const MARCA_ESTACAO = ["flor", "estrela", "olho", "coracao", "raio", "espiral", "seta"];


// no celular a era de 2019 em diante é apertada (os recortes são pequenos e o espaço entre eles ficava vazio)
const apertaX = (x) => (x >= 600 ? 586 + (x - 600) * 0.65 : x);
const XMAX = 880; // comprimento da folha, em u

const LINKS = {
  spotify: "https://open.spotify.com/intl-pt/artist/1T5hF0MCiaBgkb4rGxXqvQ",
  youtube: "https://www.youtube.com/@insytilusion",
  soundcloud: "https://soundcloud.com/cicatrizadoo",
  instagram: "https://www.instagram.com/insytillusion/",
};
const SC = (slug) => `https://soundcloud.com/cicatrizadoo/${slug}`;

// estações da câmera (onde parar), em u
const ESTACOES = [
  { x: 0, nome: "capa" },
  { x: 180, nome: "2024 · 2025" },
  { x: 350, nome: "fev 2024" },
  { x: 500, nome: "2022 · 2023" },
  { x: 632, nome: "2019" },
  { x: 750, nome: "prod. DK" },
  { x: 880, nome: "onde achar" },
];

/*
  Itens da folha. x/z em u (z = profundidade), w = largura em u, ar = altura/largura, r = giro.
  Cada item tem uma ficha: sp (embed do Spotify), yt (vídeo), sc (SoundCloud), faixas (clicáveis).
*/
const ITENS = [
  { id: "bpn", t: "Boa pra Noisz", ano: "2019", tag: "beat tape · vídeo", img: "cover-boa-pra-noisz", prev: "prev-bpn", prevSempre: true, ar: 0.667, x: 632, z: 4, w: 42, alt: 0, r: 0, sp: "track/2rXIZECV8pxDLLZ08T52Bl",
    txt: "O single mais antigo dele no Spotify. Seis anos depois a ideia voltou, no vl.2." },
  { id: "oro", t: "ORO", ano: "2022", tag: "álbum instrumental · SoundCloud", img: "sc-oro", ar: 1, x: 558, z: -36, w: 22, alt: 46, r: 0, sc: SC("album-instrumental-oro"),
    txt: "Beats sem voz, só instrumental." },
  { id: "casper", t: "Casper (Remix)", ano: "mar 2023", tag: "single", img: "cover-casper", ar: 1, x: 522, z: 6, w: 32, alt: 0, r: 0, sp: "track/10yBDt71FtZQfa1EbvbpBg", txt: "Um remix." },
  { id: "interrog", t: "???", ano: "mai 2023", tag: "single", img: "cover-interrogacoes", ar: 1, x: 482, z: -34, w: 24, alt: 50, r: 0, sp: "track/3O73kETU7GGT3Ki8qURRXw", txt: "O título é só três interrogações." },
  { id: "rema", t: "R.E.M.A", ano: "ago 2023", tag: "parceria com Vicente Blow", img: "cover-rema", ar: 1, x: 444, z: 10, w: 34, alt: 0, r: 0, sp: "track/3ROpF7kqqpHQggP68QscD5", txt: "Sai na página dele no Spotify, com o Vicente Blow." },

  { id: "amor", t: "não sei falar de amor", ano: "dez 2023", tag: "single · vídeo", img: "a-amor", ar: 1, x: 400, z: -38, w: 22, alt: 46, r: 0, yt: "3tSzbVZS2CI",
    txt: "Sentimento de quem diz que superou o fim de namoro e não superou." },
  { id: "edmagro", t: "Ed Magro", ano: "fev 2024", tag: "EP · 4 faixas", img: "a-edmagro", ar: 1, x: 352, z: 8, w: 48, alt: 0, r: 0, sp: "album/4HsTXLWnve5vYXhKRv5jgH",
    txt: "A capa é um quarto desenhado a lápis, com um quadradinho laranja no canto.",
    faixas: [
      { t: "Não Sei Falar de Amor", sp: "track/5X6eS3Gm9bjkeBt7TbNY11" },
      { t: "Migué do Goxtozão", sp: "track/2G1KlD8NakV1t9IQAKGcbA" },
      { t: "Tudo Que Ainda Posso Dizer", sp: "track/1jNwkWrV4DbReuuZHStsCQ" },
      { t: "Pecados", sp: "track/5EIEHgAMX5n2SlbMdY9UvJ" },
    ] },
  { id: "tudo", t: "tudo que ainda posso dizer", ano: "dez 2023", tag: "single · vídeo", img: "OnQrwmGkO7o", ar: 0.5625, x: 304, z: -40, w: 24, alt: 54, r: 0, yt: "OnQrwmGkO7o",
    txt: "Outro single do Ed Magro, em vídeo." },

  { id: "egoverdose", vhs: true, t: "EGOVERDOSE", ano: "abr 2024", tag: "EP em vídeo · 8 faixas", img: "a-ego-cheio", prev: "prev-ego", prevSempre: true, ar: 0.5625, x: 254, z: 8, w: 44, alt: 0, r: 0, yt: "27zkQ8TqXSk",
    txt: "Uma mixtape em clipe que ele registrou como EP. O retrato pixelado é escolha dele.",
    faixas: [["Sonhos na Matrix", 25], ["interrogações", 134], ["confiança", 225], ["sereno", 340], ["dk island", 393], ["o toinho que puxa o fole", 554], ["fígado fígado", 673], ["não temas", 761]] },
  { id: "cranio", vhs: true, t: "CRÂNIO", ano: "set 2024", tag: "EP em VHS · 4 faixas", img: "a-cranio2", prev: "prev-cranio", ar: 1, x: 204, z: 2, w: 34, alt: 0, r: 0, yt: "SBpFbUxHjSc",
    txt: "Gravado como fita VHS.",
    faixas: [["bandido do céu", 17], ["emaranhado", 145], ["afirmações para depois", 248], ["m.r.s.m.2e", 360]] },
  { id: "injuado", t: "injuado", ano: "dez 2024", tag: "single · vídeo", img: "a-injuado", ar: 1, x: 160, z: 12, w: 34, alt: 0, r: 0, yt: "ZFuA4h9J3uE", txt: "Um morcego vermelho em letra gótica, sobre amarelo." },
  { id: "bpn2", t: "Boa Pra Noi$z vl.2", ano: "jan 2025", tag: "EP · com Saull OE", img: "a-bpn2", ar: 1, x: 108, z: -36, w: 26, alt: 50, r: 0, yt: "aNjwZUrVNCI",
    txt: "Quatro faixas com blocos de PodCrê no meio.",
    faixas: [["Sonhos na Matrix", 43], ["Criar Mundos", 265], ["Boa Pra Noisz", 380], ["Guias", 589]] },

  { id: "c27", t: "27°C", ano: "prod. DK", tag: "produção", img: "sp-27c", ar: 1, x: 678, z: 6, w: 26, alt: 0, r: 0, sp: "track/0iQiRi6Kwiu2LYgcW7Fv0H", txt: "Beat dele, com a assinatura prod. DK na capa." },
  { id: "napalma", t: "Na Palma", ano: "prod. DK", tag: "produção · Amil, Guignard e Mafs", img: "sp-na-palma", ar: 1, x: 716, z: -36, w: 26, alt: 48, r: 0, sp: "track/2f9Mm9gx8gUZOQ8lHsMWMt", txt: "Beat dele para o trio Amil, Guignard e Mafs." },
  { id: "respira", t: "Respira", ano: "prod. DK", tag: "produção", img: "sp-respira", ar: 1, x: 752, z: 10, w: 26, alt: 0, r: 0, sp: "track/1UJyLaXMS6BEWrQE9sPK8W", txt: "Mais uma produção dele no Spotify." },
  { id: "mucuim", t: "MUCUIM TAPEBEAT", ano: "2019", tag: "beat tape · SoundCloud", img: "sc-mucuim", ar: 1, x: 790, z: -36, w: 24, alt: 50, r: 0, sc: SC("mucuim-tapebeat"), txt: "Uma fita de beats." },
  { id: "fala", t: "Fala você jovem beats", ano: "2019", tag: "beats à venda · SoundCloud", img: "sc-fala", ar: 1, x: 822, z: 6, w: 24, alt: 0, r: 0, sc: SC("fala-voce-jovem-beats-a-venda"), txt: "Beats que estavam à venda." },
];

const hms = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Ficha({ item, onFecha }) {
  const [faixa, setFaixa] = useState(null);
  const [inicio, setInicio] = useState(0);
  useEffect(() => { setFaixa(null); setInicio(0); }, [item?.id]);
  if (!item) return null;
  const spSrc = faixa?.sp || item.sp;
  return (
    <aside className={`${styles.ficha} ${item.vhs ? styles.fichaVhs : ""}`} role="dialog" aria-label={item.t}>
      <button className={styles.fecha} onClick={onFecha} aria-label="Fechar">×</button>
      <p className={styles.fichaTag}>{item.ano} · {item.tag}</p>
      <h2 className={styles.fichaTit}>{item.t}</h2>
      <p className={styles.fichaTxt}>{item.txt}</p>
      {item.faixas && (
        <ol className={styles.faixas}>
          {item.faixas.map((f, i) => {
            const nome = Array.isArray(f) ? f[0] : f.t;
            return (
              <li key={nome}>
                <button className={(Array.isArray(f) ? inicio === f[1] : faixa?.t === f.t) ? styles.on : ""}
                  onClick={() => { if (Array.isArray(f)) setInicio(f[1]); else setFaixa(f); }}>
                  <b>{String(i + 1).padStart(2, "0")}</b><span>{nome}</span>{Array.isArray(f) && <i>{hms(f[1])}</i>}
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <div className={styles.player}>
        {spSrc && <iframe key={spSrc} title={`Ouvir ${item.t} no Spotify`} src={`https://open.spotify.com/embed/${spSrc}?utm_source=generator&theme=0`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className={styles.pSp} />}
        {item.yt && <iframe key={item.yt + inicio} title={`Ver ${item.t}`} src={`https://www.youtube-nocookie.com/embed/${item.yt}?autoplay=1&rel=0&start=${inicio}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className={styles.pYt} />}
        {item.sc && <iframe title={`Ouvir ${item.t} no SoundCloud`} src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(item.sc)}&auto_play=true&visual=false&hide_related=true`} allow="autoplay" className={styles.pSc} />}
      </div>
    </aside>
  );
}

export default function InsytCaderno() {
  const [aberto, setAberto] = useState(null);
  const [est, setEst] = useState(0);
  const [cel, setCel] = useState(false);
  const raiz = useRef(null), trilha = useRef(null), mundo = useRef(null), inclina = useRef(null), probe = useRef(null), lapis = useRef(null);
  const S = useRef({ alvo: 0, cam: 0, u: 12, maxCam: 1, fim: 1, abertoEm: null, mx: 0, my: 0 });
  const abertoRef = useRef(null);
  abertoRef.current = aberto;

  useEffect(() => {
    const m = matchMedia("(max-width: 600px)");
    const f = () => setCel(m.matches);
    f(); m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);

  useEffect(() => {
    // o sticky do palco exige overflow-x: clip (e não hidden) em html/body
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });
    // decodifica tudo logo na entrada: pular a folha para longe não mostra capa em branco
    [...ITENS.map((it) => `/in/${it.img}.webp`), ...DESENHOS.map((d) => `/in/tinta/${d[0]}.webp`)].forEach((src) => { const im = new Image(); im.src = src; im.decode?.().catch(() => {}); });
    const s = S.current;
    const mede = () => {
      s.u = probe.current.getBoundingClientRect().width || 12;
      s.maxCam = XMAX * s.u;
      // no celular 1u é pequeno e a folha fica comprida demais: encurta o scroll (a câmera segue a fração p)
      const enc = innerWidth <= 600 ? 0.5 : innerWidth <= 1000 ? 0.75 : 1;
      // e corta o fim: depois do Fala Você Jovem só havia parede vazia até o "onde achar"
      s.fim = innerWidth <= 600 ? 0.65 : 1;
      trilha.current.style.height = `${s.maxCam * enc * s.fim + innerHeight}px`;
    };
    mede();
    const rola = () => {
      const t = trilha.current.getBoundingClientRect().top + scrollY;
      const p = Math.max(0, Math.min(1, (scrollY - t) / Math.max(1, trilha.current.offsetHeight - innerHeight)));
      s.alvo = p * s.fim * s.maxCam;
    };
    rola();
    const mouse = (e) => { s.mx = e.clientX / innerWidth - 0.5; s.my = e.clientY / innerHeight - 0.5; };
    addEventListener("scroll", rola, { passive: true });
    addEventListener("resize", () => { mede(); rola(); });
    addEventListener("pointermove", mouse);
    const k = (e) => { if (e.key === "Escape") setAberto(null); };
    addEventListener("keydown", k);

    // risco de grafite que segue o mouse (só com mouse)
    const cv = lapis.current, g = cv.getContext("2d");
    const fino = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const pts = [];
    const dim = () => { cv.width = innerWidth; cv.height = innerHeight; };
    dim(); addEventListener("resize", dim);
    const traco = (e) => { if (fino) pts.push({ x: e.clientX + (Math.random() - 0.5) * 1.4, y: e.clientY + (Math.random() - 0.5) * 1.4, t: performance.now() }); };
    addEventListener("pointermove", traco);

    let raf = 0, ultimaEst = 0, ult = performance.now();
    const loop = (ms) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.25, (ms - ult) / 1000); ult = ms;
      s.cam += (s.alvo - s.cam) * (1 - Math.exp(-dt * 6)); // suavização por tempo: chega no mesmo ritmo mesmo com quadros lentos
      mundo.current.style.transform = `translate3d(${(-s.cam).toFixed(1)}px,0,0)`;
      inclina.current.style.transform = `rotateY(${(s.mx * 3.2).toFixed(2)}deg) rotateX(${(-s.my * 2.2).toFixed(2)}deg)`;
      // estação mais próxima
      const cu = s.cam / s.u;
      let n = 0, d = 1e9;
      ESTACOES.forEach((e, i) => { const dd = Math.abs(e.x - cu); if (dd < d) { d = dd; n = i; } });
      if (n !== ultimaEst) { ultimaEst = n; setEst(n); }
      // fecha a ficha se a câmera andou longe do item aberto
      if (abertoRef.current && s.abertoEm !== null && Math.abs(cu - s.abertoEm) > 75) setAberto(null);
      // grafite
      g.clearRect(0, 0, cv.width, cv.height);
      while (pts.length && ms - pts[0].t > 900) pts.shift();
      g.lineCap = "round"; g.lineJoin = "round";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        if (Math.hypot(b.x - a.x, b.y - a.y) > 90) continue;
        const v = 1 - (ms - b.t) / 900;
        g.strokeStyle = `rgba(28,28,28,${(0.55 * v).toFixed(3)})`; g.lineWidth = 0.8 + 1.6 * v;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
    };
    raf = requestAnimationFrame(loop);

    // rabiscos que se desenham quando entram na tela
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add(styles.desenhado); }), { threshold: 0.2 });
    document.querySelectorAll("[data-traco]").forEach((el) => io.observe(el));
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("scroll", rola); removeEventListener("pointermove", mouse); removeEventListener("pointermove", traco); removeEventListener("keydown", k); els.forEach((e, i) => { e.style.overflowX = antes[i]; }); };
  }, []);

  const abre = (it) => { S.current.abertoEm = it.x; setAberto(it); };
  const vaiPara = (x) => {
    const s = S.current;
    const t = trilha.current.getBoundingClientRect().top + scrollY;
    scrollTo({ top: t + ((cel ? apertaX(x) : x) / XMAX / S.current.fim) * (trilha.current.offsetHeight - innerHeight), behavior: "smooth" });
  };

  return (
    <main ref={raiz} className={`${styles.raiz} ${marker.variable} ${mao.variable} ${mono.variable}`}>
      <Link href="/" className={styles.voltar} aria-label="Voltar para a JODO (mapa)">
        <svg viewBox="0 0 60 30" aria-hidden="true"><path d="M55 16 C40 5 20 5 7 15 M17 5.5 L6 15 L16.5 25" pathLength="1" /></svg>
        <b>JODO</b>
        <Icone n="flor" className={styles.voltarFlor} />
      </Link>
      <MarcaTopo nome="Insyt" cor="#121212" plano emblema={<img src="/in/insyt-logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "invert(1)" }} />} />
      <i ref={probe} className={styles.probe} aria-hidden="true" />

      {/* filtro de traço à mão: treme devagar, como desenho animado quadro a quadro */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <filter id="tremor" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="2" result="n">
            <animate attributeName="seed" values="2;5;9;4;7" dur="0.9s" repeatCount="indefinite" calcMode="discrete" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
        </filter>
        {/* fita VHS: rasga a imagem em faixas horizontais e separa o vermelho do azul */}
        <filter id="vhs" x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0004 0.5" numOctaves="1" seed="3" result="t">
            <animate attributeName="seed" values="3;8;1;6;4;9" dur="0.6s" repeatCount="indefinite" calcMode="discrete" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="t" scale="16" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx="-5" dy="0" result="ro" />
          <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx="5" dy="0" result="bo" />
          <feBlend in="ro" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="bo" mode="screen" />
        </filter>
      </svg>

      <section ref={trilha} className={styles.trilha}>
        <div className={styles.palco}>
          <div ref={inclina} className={styles.cena}>
            <div ref={mundo} className={styles.mundo}>
              {/* parede: folhas pautadas, uma depois da outra */}
              <div className={styles.parede}>
                {Array.from({ length: 8 }, (_, i) => <div key={i} className={styles.folha} style={{ "--i": i }} />)}
              </div>
              <div className={styles.piso} />

              {/* capa */}
              <div className={styles.titulo}>
                <h1><span className={styles.nome}>Insyt</span></h1>
                <img className={styles.cabeca} src="/in/insyt-logo.png" alt="" draggable="false" />
                <svg className={styles.sublinha} viewBox="0 0 400 40" aria-hidden="true" data-traco>
                  <path d="M6 24 C 70 6, 140 34, 210 16 S 340 10, 394 22" pathLength="1" />
                </svg>
                <p className={styles.nomes}>aka insytilusion, DK, cicatrizadoo, Coala Freak</p>
                <p className={styles.rola}>rola pra andar pela folha</p>
                <svg className={styles.seta} viewBox="0 0 160 60" aria-hidden="true" data-traco>
                  <path d="M6 40 C 40 8, 90 6, 140 30" pathLength="1" /><path d="M118 14 L142 31 L114 42" pathLength="1" />
                </svg>
                <i className={styles.laranja} aria-hidden="true" />
              </div>

              {/* desenhos dele, em tinta, pela parede (cada um se revela quando a câmera chega) */}
              {DESENHOS.map(([img, x, yc, w0, r, pw, ph]) => { const w = Math.min(56, w0 * 1.45); return (
                <div key={img} className={styles.tinta} data-traco data-tarde={x >= 500 ? "" : undefined} style={{ "--x": x, "--y": yc - (w * ph) / pw / 2, "--w": w, "--ar": ph / pw, "--r": `${r}deg` }}>
                  <img src={`/in/tinta/${img}.webp`} alt="" decoding="async" draggable="false" />
                </div>
              ); })}

              {/* recortes de papel em pé */}
              {ITENS.map((it) => (
                <div key={it.id} className={styles.obj} style={{ "--x": cel ? apertaX(it.x) : it.x, "--z": it.z, "--w": it.w, "--ar": it.ar, "--alt": it.alt }}>
                  <button className={`${styles.recorte} ${it.vhs ? styles.vhs : ""} ${it.vhs && aberto?.id === it.id ? styles.vhsOn : ""}`} onClick={() => abre(it)} aria-label={`Abrir ${it.t}`}>
                    <span className={styles.papel}>
                      <img src={`/in/${it.img}.webp`} alt="" decoding="async" draggable="false" />
                      {it.prev && <video className={`${styles.prev} ${it.prevSempre ? styles.prevSempre : ""}`} src={`/in/${it.prev}.mp4`} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />}
                      {it.vhs && <i className={styles.scan} aria-hidden="true" />}
                    </span>
                  </button>
                  <p className={styles.rotulo}><b>{it.t}</b><span>{it.ano}</span></p>
                </div>
              ))}

              {ERAS.map(([x, t]) => <p key={t} className={styles.chaoAno} style={{ "--x": cel ? apertaX(x) * 0.68 : x }} aria-hidden="true">{t}</p>)}

              {/* onde achar */}
              <nav className={styles.achar} aria-label="Onde ouvir">
                <p className={styles.acharTit}>onde achar</p>
                <a data-p="spotify" href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify</a>
                <a data-p="youtube" href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
                <a data-p="soundcloud" href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud</a>
                <a data-p="instagram" href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              </nav>
            </div>
          </div>

          {aberto?.vhs && <div className={styles.fitaTela} aria-hidden="true" />}
          <div className={styles.vinheta} aria-hidden="true" />
          <canvas ref={lapis} className={styles.lapis} aria-hidden="true" />

          {/* linha do tempo no rodapé, para pular de estação */}
          <nav className={styles.tempo} aria-label="Estações da folha">
            {ESTACOES.map((e, i) => <button key={e.nome} className={i === est ? styles.on : ""} onClick={() => vaiPara(e.x)}><Icone n={MARCA_ESTACAO[i]} className={styles.ic} /> <span>{e.nome}</span></button>)}
          </nav>

          <Ficha item={aberto} onFecha={() => setAberto(null)} />
        </div>
      </section>
    </main>
  );
}
