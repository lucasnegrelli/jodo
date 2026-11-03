"use client";

import { useEffect, useRef, useState } from "react";
import { Grenze_Gotisch, Syne, Poppins, Barlow_Condensed, Cormorant_Garamond } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { FOTOS_IDS } from "@/data/saullFotos";
import styles from "@/styles/saullEnter.module.css";

/*
  Saull OE. Referência escolhida pelo Lucas: daddyyankee.com (Awwwards, Webflow + Lenis): campo de cor chapada por cena, uma palavra gigante,
  a imagem em camadas ENTRE a palavra e a interface, portão "ENTER", rolagem com inércia. Aqui NÃO é cópia: cada trabalho dele é uma cena
  na cor da própria capa, a palavra é o nome do trabalho na letra da capa (blackletter no Caça, larga no Registro, serifa no Subidas),
  e a imagem é a capa e/ou o VÍDEO dele (a capa ganha vida depois que a cena chega). A troca de cena é uma mancha de cor que sobe, sem corte.
  No fim fica a Sala Reserva: a porta abre num mural com as fotos dele.
  Versos na legenda amarela: só os que aparecem escritos nas capas/vídeos dele ou que o Whisper ouviu de forma repetida (conferir com ele).
*/
const got = Grenze_Gotisch({ subsets: ["latin"], weight: ["800", "900"], variable: "--se-got", display: "swap" });
const syne = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--se-syne", display: "swap" });
const pop = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--se-pop", display: "swap" });
const cond = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--se-cond", display: "swap" });
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["600", "700"], variable: "--se-serif", display: "swap" });

const yt = (id) => `https://www.youtube.com/watch?v=${id}`;
const sp = (id) => `https://open.spotify.com/album/${id}`;
const LINKS = [
  ["Spotify", "https://open.spotify.com/intl-pt/artist/459I9nDE7Ff543sdWwXxHC"],
  ["YouTube", "https://www.youtube.com/@saull_oe"],
  ["Instagram", "https://www.instagram.com/saull.oe/"],
  ["Deezer", "https://www.deezer.com/br/artist/81426022"],
  ["Apple Music", "https://music.apple.com/ng/artist/saull-oe/1492191481"],
];
const FOTOS = Array.from({ length: 67 }, (_, i) => `/so/sala/f${String(i).padStart(2, "0")}.webp`);

// x, y = centro da mídia em % do palco; w = largura em vh (limitada em vw); ar = largura/altura; rot = giro
const TODAS = [
  { id: "hero", campo: "#2f5bff", tinta: "#f2efe6", palavra: "SAULL OE", fonte: "got", ano: "",
    midia: [{ k: "janela", ciclo: ["intro", "h-b", "h-a", "h-c", "h-d"], ar: 960 / 720, x: 76, y: 70, w: 50, rot: -3, xm: 58, ym: 55, wm: 46 }],
    meta: ["Manaus, Amazonas", "Rapper, fotógrafo e produtor"] },
  { id: "arkaica", campo: "#e9e6de", tinta: "#101010", palavra: "ARKAICA", fonte: "syne", ano: "2018",
    midia: [{ k: "janela", video: "arkaica", link: yt("atpbn5YcbU8"), ar: 16 / 9, x: 34, y: 68, w: 70, rot: 2, xm: 43, ym: 43, wm: 36 }, { k: "cartao", img: "/so/se-bairro.jpg", link: yt("0Wps7rIf37w"), ar: 1.6, x: 76, y: 74, w: 36, rot: -4, xm: 70, ym: 55, wm: 22 }],
    meta: ["O Bairro / Dividido", "com o Ian Lecter"], links: [["O Bairro / Dividido", yt("0Wps7rIf37w")], ["Lunático, clipe", yt("atpbn5YcbU8")], ["O Monstro que chamam de Norte", yt("VMyEUwnt0aQ")]] },
  { id: "subidas", campo: "#19c7a0", tinta: "#07241d", palavra: "SUBIDAS", fonte: "serif", ano: "2019",
    midia: [{ k: "janela", video: "subidas", ar: 16 / 9, x: 50, y: 70, w: 68, rot: 0, xm: 50, ym: 47, wm: 49 }],
    meta: ["Faixa · 2019"], verso: "Limpa os pés, pisa descalço.", links: [["Assistir", yt("LhWeaXNet2g")]] },
  { id: "extremo", campo: "#ff7a1a", tinta: "#1a0b00", palavra: "EXTREMO", fonte: "syne", ano: "2020",
    midia: [{ k: "janela", video: "extremo", ar: 16 / 9, x: 34, y: 69, w: 64, rot: -2, xm: 50, ym: 45, wm: 42 }],
    meta: ["EP · 2020", "Intro · Terreno · Caça · Andar ft. Insyt · céu/inf3 · Hemisfério", "capa: Joaquim Macruz, pinhole"], verso: "Porta de entrada é dos fundos.", links: [["Terreno, clipe", yt("r-jL2G840zk")], ["EP completo", yt("Ija_Q197FDg")], ["Ouvir", sp("5emjDLTofUTTkO2ujKC0hx")]] },
  { id: "estradas", campo: "#d8cfbd", tinta: "#171309", palavra: "ESTRADA'S", fonte: "syne", ano: "2020",
    midia: [{ k: "janela", video: "estradas", ar: 9 / 16, x: 72, y: 56, w: 34, rot: 3, xm: 64, ym: 46, wm: 16 }],
    meta: ["Microtape · 2020", "com a Straditerra"], verso: "Brotou aqui, rasgou, pisou aqui, deitou.", links: [["Ouvir", sp("4OXP4tdLitYA149jn2noUN")]] },
  { id: "caca", campo: "#0b0b0d", tinta: "#2f5bff", palavra: "CAÇA", fonte: "got", ano: "2022",
    midia: [{ k: "cartao", img: "/so/sr-caca.jpg", video: "sr-caca", ar: 16 / 9, x: 36, y: 68, w: 66, rot: -2, xm: 46, ym: 47, wm: 47 }],
    meta: ["2022", "prod. DK", "Sala Reserva & Sanctus Visual"], verso: "A caça esfria.", links: [["Ver o clipe", yt("L6WszkR_cmQ")], ["Ouvir o EP", sp("5emjDLTofUTTkO2ujKC0hx")]] },
  { id: "registro", campo: "#e0312c", tinta: "#f2efe6", palavra: "REGISTRO", fonte: "syne", ano: "2023",
    midia: [{ k: "cartao", img: "/so/sr-registro.jpg", video: "sr-registro", ar: 16 / 9, x: 66, y: 69, w: 64, rot: 3, xm: 54, ym: 47, wm: 47 }],
    meta: ["2023", "prod. Insyt, RVL$", "clipe: Sala Reserva, Prisma, falha.com.brasil"], verso: "Nossa casa.", links: [["Ver o clipe", yt("qtI2GZfuFYU")], ["Ouvir", sp("4unwIUfqs8onrKTf5457Fi")]] },
  { id: "maisdias", campo: "#ff4f8b", tinta: "#16020a", palavra: "MAIS DIAS", fonte: "syne", ano: "2023",
    midia: [{ k: "janela", video: "maisdias", ar: 16 / 9, x: 40, y: 69, w: 66, rot: -3, xm: 50, ym: 47, wm: 49 }],
    meta: ["Novo mundo · dez 2023", "prod. RVL$", "imagem: falha.com.brasil, Prisma, Sala Reserva"], links: [["Making of", yt("z5XFPE3PfCs")], ["Ouvir", sp("7huxHqpkHrF28vEA1jPFPG")]] },
  { id: "prata", campo: "#ffb02e", tinta: "#170d00", palavra: "PRATA", fonte: "serif", ano: "2025",
    midia: [{ k: "cartao", img: "/so/se-prata.jpg", video: "prata", ar: 1, x: 72, y: 68, w: 50, rot: 4, xm: 64, ym: 46, wm: 30 }],
    meta: ["Prata e as Roupas · 31.10.2025", "fotos e cenografia @pretadamare · edição Sala Reserva"], links: [["Visualizer", yt("k5vVDM8lLSI")], ["Ouvir", sp("7troz9qmERjPobE0bJTqe0")]] },
  { id: "sala", campo: "#0a0a0a", tinta: "#f2efe6", palavra: "SALA RESERVA", fonte: "syne", ano: "", sala: true,
    meta: ["Fotografia, direção e produção", "Saull OE · @sala.reserva"] },
];
// do mais recente para o mais antigo; a Sala Reserva fecha
const ORDEM = ["hero", "prata", "maisdias", "registro", "caca", "estradas", "extremo", "subidas", "arkaica", "sala"];
const CENAS = ORDEM.map((id) => TODAS.find((c) => c.id === id));
const N = CENAS.length;
const KF = { got: 0.82, syne: 1.14, serif: 0.76 };
function embedDe(link) {
  const y = link.match(/watch\?v=([\w-]+)/);
  if (y) return { tipo: "yt", src: `https://www.youtube-nocookie.com/embed/${y[1]}?autoplay=1&rel=0`, fora: link };
  const a = link.match(/open\.spotify\.com\/album\/(\w+)/);
  if (a) return { tipo: "sp", src: `https://open.spotify.com/embed/album/${a[1]}`, fora: link };
  return null;
}
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const suave = (x) => x * x * (3 - 2 * x);

export default function SaullEnter() {
  const trilha = useRef(null), palco = useRef(null), lenisRef = useRef(null), entrouRef = useRef(false);
  const videos = useRef({});
  const curRef = useRef(0), cursorRef = useRef(null), fotoRef = useRef(null), playerRef = useRef(null);
  const [entrou, setEntrou] = useState(false);
  const [cur, setCur] = useState(0);
  const [sala, setSala] = useState(false);
  const [luz, setLuz] = useState(false);
  const [passo, setPasso] = useState(0);
  const salaRef = useRef(false);
  const [foto, setFoto] = useState(null);
  const [player, setPlayer] = useState(null);
  fotoRef.current = foto;
  salaRef.current = sala;
  playerRef.current = player;

  useEffect(() => {
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });
    let raf = 0, vivo = true, ultimo = -1, pS = 0;
    const loop = () => {
      const r = trilha.current.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, trilha.current.offsetHeight - innerHeight)) * (N - 1);
      pS += (p - pS) * 0.22;
      const st = palco.current.style;
      CENAS.forEach((_, i) => {
        // a cena fica inteira por meia unidade de rolagem, e só então a próxima sobe
        const t = i === 0 ? 1 : suave(clamp((pS - (i - 1) - 0.5) / 0.5));
        st.setProperty(`--t${i}`, t.toFixed(3));
        st.setProperty(`--u${i}`, clamp((pS - i - 0.5) / 0.5).toFixed(3));
      });
      const c = Math.round(pS - 0.25);
      const cc = clamp(c, 0, N - 1);
      if (cc !== ultimo) { ultimo = cc; curRef.current = cc; setCur(cc); }
    };
    (async () => {
      const { default: Lenis } = await import("lenis");
      if (!vivo) return;
      const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
      lenisRef.current = lenis;
      const tick = (t) => { lenis.raf(t); loop(); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      setTimeout(() => { entrouRef.current = true; setEntrou(true); }, 250);
    })();
    const mouse = (e) => {
      const b = palco.current.getBoundingClientRect();
      palco.current.style.setProperty("--mx", ((e.clientX - b.left) / b.width - 0.5).toFixed(3));
      palco.current.style.setProperty("--my", ((e.clientY - b.top) / b.height - 0.5).toFixed(3));
      // a palavra da cena atual reage ao cursor, letra por letra
      const mx = (e.clientX - b.left) / b.width - 0.5;
      palco.current.querySelectorAll("section")[curRef.current]?.querySelectorAll("[data-l]").forEach((l) => {
        const q = l.getBoundingClientRect();
        const f = clamp(1 - Math.hypot(e.clientX - (q.left + q.width / 2), e.clientY - (q.top + q.height / 2)) / 300);
        l.style.transform = f > 0.01 ? `translateY(${(-f * 16).toFixed(1)}px) skewX(${(mx * f * -14).toFixed(1)}deg) scale(${(1 + f * 0.05).toFixed(3)})` : "";
      });
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        cursorRef.current.classList.toggle(styles.grande, !!e.target.closest?.("a, button, figure"));
      }
    };
    addEventListener("pointermove", mouse);
    const esc = (e) => { if (e.key === "Escape") { if (playerRef.current) fechaPlayer(); else if (fotoRef.current !== null) setFoto(null); else fecha(); } };
    addEventListener("keydown", esc);
    return () => { vivo = false; cancelAnimationFrame(raf); removeEventListener("pointermove", mouse); removeEventListener("keydown", esc); lenisRef.current?.destroy(); els.forEach((e, i) => { e.style.overflowX = antes[i]; }); };
  }, []);

  // no celular a palavra gigante é medida e ampliada para ocupar a largura (no desktop fica como está)
  useEffect(() => {
    const ajusta = () => {
      const compacto = matchMedia("(max-width: 760px), (max-aspect-ratio: 1/1), (max-height: 820px)").matches;
      palco.current?.querySelectorAll("section").forEach((sec) => {
        const sp = sec.querySelector("[class*='palavra'] span"); if (!sp) return;
        sec.style.setProperty("--fit", "1");
        if (!compacto) return;
        const w = sp.scrollWidth || sp.getBoundingClientRect().width;
        if (w) sec.style.setProperty("--fit", clamp((innerWidth * 0.9) / w, 0.8, 2.6).toFixed(3));
      });
    };
    document.fonts?.ready.then(ajusta); ajusta();
    addEventListener("resize", ajusta);
    return () => removeEventListener("resize", ajusta);
  }, []);

  // só toca o vídeo da cena atual e da vizinha
  useEffect(() => {
    CENAS.forEach((c, i) => {
      (c.midia || []).forEach((m, k) => {
        if (m.ciclo) {
          m.ciclo.forEach((_, j) => {
            const v = videos.current[`${i}-${k}-${j}`]; if (!v) return;
            if (Math.abs(i - cur) <= 1 && j === passo % m.ciclo.length) v.play().catch(() => {}); else v.pause();
          });
          return;
        }
        const v = videos.current[`${i}-${k}`]; if (!v) return;
        if (Math.abs(i - cur) <= 1) v.play().catch(() => {}); else v.pause();
      });
    });
  }, [cur, entrou, passo]);

  // a abertura alterna os takes dele dentro do mesmo quadro
  useEffect(() => {
    if (cur !== 0) return;
    const t = setInterval(() => setPasso((p) => p + 1), 3000);
    return () => clearInterval(t);
  }, [cur]);

  const abre = () => { setLuz(true); lenisRef.current?.stop(); setTimeout(() => { setSala(true); setLuz(false); }, 620); };
  const abrePlayer = (link) => { const e = embedDe(link); if (!e) return; setPlayer(e); lenisRef.current?.stop(); };
  const fechaPlayer = () => { setPlayer(null); if (!salaRef.current) lenisRef.current?.start(); };
  const muralRef = useRef(null);
  const irPara = (i) => { const M = document.documentElement.scrollHeight - innerHeight; lenisRef.current?.scrollTo(Math.min(M, (M * (i + 0.12)) / (N - 1)), { duration: 1.6 }); };
  const fecha = () => { setSala(false); if (entrouRef.current) lenisRef.current?.start(); };

  return (
    <main className={`${styles.raiz} ${got.variable} ${syne.variable} ${pop.variable} ${cond.variable} ${serif.variable} ${entrou ? styles.entrou : ""}`}>
      <VoltarJodo />
      <MarcaTopo nome="Saull OE" cor={CENAS[cur].tinta === "#f2efe6" || CENAS[cur].campo === "#0b0b0d" || CENAS[cur].campo === "#0a0a0a" ? "#f2efe6" : CENAS[cur].tinta} plano fonte="var(--se-got), serif" escala={1.35} />
      <div ref={trilha} className={styles.trilha} style={{ height: `${(N - 1) * 135 + 100}svh` }}>
        <div ref={palco} className={styles.palco}>
          {CENAS.map((c, i) => {
            const vw = Math.min(26, 92 / (c.palavra.length * KF[c.fonte]));
            return (
              <section key={c.id} className={`${styles.cena} ${styles["f_" + c.fonte]} ${cur === i ? styles.on : ""} ${c.midia && c.id !== "arkaica" ? (c.midia[0].x < 50 ? styles.ladoE : styles.ladoD) : ""}`} style={{ "--campo": c.campo, "--tinta": c.tinta, "--vw": `${vw.toFixed(2)}vw`, "--t": `var(--t${i}, 1)`, "--u": `var(--u${i}, 0)`, zIndex: i + 1 }} aria-label={c.palavra}>
                <div className={styles.palavra} aria-hidden="true"><span>{c.palavra.split("").map((ch, k) => <i key={k} data-l style={{ "--k": k }}>{ch === " " ? " " : ch}</i>)}</span></div>
                {(c.midia || []).map((m, k) => (
                  <figure key={k} onClick={m.link ? () => abrePlayer(m.link) : c.links ? () => abrePlayer(c.links[0][1]) : c.sala ? abre : undefined} className={`${styles.midia} ${styles[m.k]} ${k ? styles.segunda : ""} ${c.links || c.sala ? styles.clica : ""} ${m.redondo ? styles.redondo : ""}`} style={{ "--x": `${m.x}%`, "--y": `${m.y}%`, "--w": `${m.w}vh`, "--ar": m.ar, "--rot": `${m.rot}deg`, "--par": m.par || 1, "--xm": `${m.xm}%`, "--ym": `${m.ym}%`, "--wm": `${m.wm}vh` }}>
                    {m.img && <img src={m.img} alt="" draggable="false" />}
                    {m.ciclo && m.ciclo.map((v, j) => <video key={v} className={j === passo % m.ciclo.length ? styles.ativo : ""} ref={(el) => { videos.current[`${i}-${k}-${j}`] = el; }} src={`/so/${v}.mp4`} muted loop playsInline preload="auto" />)}
                    {m.video && <video ref={(el) => { videos.current[`${i}-${k}`] = el; }} src={`/so/${m.video}.mp4`} poster={m.img ? undefined : `/so/${m.video}.jpg`} muted loop playsInline preload="metadata" />}
                  </figure>
                ))}
                {c.sala && (
                  <button className={styles.porta} onClick={abre} aria-label="Abrir a Sala Reserva">
                    <span className={styles.batente}><i className={styles.folha}><u /></i></span>
                    <span className={styles.degraus}><i /><i /><i /></span>
                    <b>abrir</b>
                  </button>
                )}
                <div className={`${styles.frente} ${c.sala ? styles.salaF : ""}`}>
                  <div>
                    {c.ano && <p className={styles.ano}>{c.ano}</p>}
                    {c.verso && <p className={styles.verso}><span>{c.verso}</span></p>}
                    <p className={styles.meta}>{c.meta.map((m) => <span key={m}>{m}</span>)}</p>
                  </div>
                  {c.links && <div className={styles.acoes}>{c.links.map(([t, u]) => <button key={t} className={styles.ver} onClick={() => abrePlayer(u)}>{t}</button>)}</div>}
                  {c.sala && (
                    <p className={styles.redes}>{LINKS.map(([t, h]) => <a key={t} href={h} target="_blank" rel="noopener noreferrer">{t}</a>)}</p>
                  )}
                </div>
                {c.sala && (
                  <div className={styles.faixa}>
                    <div className={styles.trilho}>
                      {[0, 1].map((rep) => CENAS.slice(1, -1).map((x) => <button key={`${rep}${x.id}`} onClick={() => irPara(CENAS.indexOf(x))}>{x.palavra}<b>{x.ano}</b></button>))}
                    </div>
                    <button className={styles.topo} onClick={() => lenisRef.current?.scrollTo(0, { duration: 2 })}>topo ↑</button>
                  </div>
                )}
              </section>
            );
          })}
          <nav className={styles.anos} aria-label="Trabalhos">
            {CENAS.map((c, i) => <button key={c.id} className={cur === i ? styles.atual : ""} onClick={() => irPara(i)} aria-label={c.palavra}>{c.ano || (c.sala ? "SR" : "OE")}</button>)}
          </nav>
        </div>
      </div>

      <i ref={cursorRef} className={styles.cursor} aria-hidden="true" />
      {player && (
        <div className={styles.player} onClick={fechaPlayer}>
          <div className={player.tipo === "sp" ? styles.sp : styles.yt} onClick={(e) => e.stopPropagation()}>
            <iframe src={player.src} title="Player" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
          </div>
          <p onClick={(e) => e.stopPropagation()}><a href={player.fora} target="_blank" rel="noopener noreferrer">abrir no {player.tipo === "sp" ? "Spotify" : "YouTube"}</a><button onClick={fechaPlayer}>fechar</button></p>
        </div>
      )}
      {luz && <div className={styles.luz} aria-hidden="true" />}
      {foto !== null && <div className={styles.grande_foto} onClick={() => setFoto(null)}><img src={FOTOS[foto]} alt="" /><a href={`https://www.instagram.com/p/${FOTOS_IDS[foto]}/`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>ver o post no Instagram</a></div>}
      {sala && (
        <div className={styles.mural} data-lenis-prevent ref={muralRef}>
          <header>
            <p><b>Sala Reserva</b> · fotografia, direção e produção de Saull OE</p>
            <a href="https://www.instagram.com/sala.reserva/" target="_blank" rel="noopener noreferrer">@sala.reserva</a>
            <button onClick={fecha}>voltar</button>
          </header>
          <div className={styles.fotos}>
            {FOTOS.map((f, k) => <img key={f} src={f} alt="" loading="lazy" draggable="false" onClick={() => setFoto(k)} />)}
          </div>
          <footer className={styles.mrodape}>
            <p className={styles.mrPalavra} aria-hidden="true">Sala Reserva</p>
            <div className={styles.mrMeio}>
              <a className={styles.mrCta} href="https://www.instagram.com/sala.reserva/" target="_blank" rel="noopener noreferrer">Ver tudo no Instagram <u>↗</u></a>
              <nav className={styles.rlinks} aria-label="Onde ouvir e seguir">
                {LINKS.map(([t, h], k) => <a key={t} href={h} target="_blank" rel="noopener noreferrer"><i>{String(k + 1).padStart(2, "0")}</i>{t}<u>↗</u></a>)}
              </nav>
            </div>
            <div className={styles.mrBase}>
              <span>Fotografia, direção e produção · Saull OE · Manaus, Amazonas</span>
              <button onClick={() => muralRef.current?.scrollTo({ top: 0, behavior: "smooth" })}>topo ↑</button>
              <button onClick={fecha}>voltar ao site</button>
            </div>
            <div className={styles.mrFaixa} aria-hidden="true">
              <div className={styles.mrCorre}>
                {[0, 1].map((rep) => ["Sala Reserva", "Fotografia", "Direção", "Produção", "Manaus", "Saull OE"].map((t) => <span key={`${rep}${t}`}>{t}</span>))}
              </div>
            </div>
          </footer>
        </div>
      )}
    </main>
  );
}
