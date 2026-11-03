"use client";

import { useEffect, useRef, useState } from "react";
import { Anton, Fraunces, DM_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import ManQuarto from "@/components/sala/ManQuarto";
import ManEspelho from "@/components/sala/ManEspelho";

// timecode de câmera velha, rodando sozinho
function Rec() {
  const [s, setS] = useState(0);
  useEffect(() => { const t = setInterval(() => setS((v) => v + 1), 1000); return () => clearInterval(t); }, []);
  const p = (n) => String(n).padStart(2, "0");
  return (
    <div className={styles.rec} aria-hidden="true">
      <p><i /> REC</p>
      <p>{p(Math.floor(s / 3600))}:{p(Math.floor(s / 60) % 60)}:{p(s % 60)}</p>
      <p className={styles.bat}><b /> SP · ZN</p>
    </div>
  );
}
import styles from "@/styles/manPagina.module.css";

/*
  eL Mandarim: página enxuta, três cenas.
  1. Abertura "espelho vivo": a capa de P*Taria (colagem espelhada) vira um espelho ao vivo que segue o mouse (ver ManEspelho).
  2. Índice dos singles: os dez nomes em tipografia gigante numa tela só. Passar o mouse num nome troca o campo de cor para
     o da capa e a capa acompanha o cursor (as capas dele não combinam entre si, então a cor de cada uma é que manda).
  3. Clipes (campo azul, vídeo grande e lista) e o final escuro: o quarto do hamster com a mixtape inédita (som só ali, no botão).
  Tipografia: Anton nos títulos, DM Mono nos detalhes, Fraunces itálico só no "eL" e nas notas.
*/
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--mp-anton", display: "swap" });
const ser = Fraunces({ subsets: ["latin"], weight: ["300", "400"], style: ["italic"], variable: "--mp-ser", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mp-mono", display: "swap" });

const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const data = (s) => { const [a, m, d] = s.split("-"); return `${Number(d)} ${MES[Number(m) - 1]} ${a}`; };
const nn = (i) => String(i + 1).padStart(2, "0");

// bg/fg: cor do campo, tirada da própria capa
const SINGLES = [
  { id: "camera-close", t: "Camera Close", d: "2020-10-02", dz: 1103767482, bg: "#d4b06a", fg: "#1d1408" },
  { id: "cameraman", t: "Câmera-Man de Filme Amador", d: "2020-10-09", dz: 176506432, bg: "#7d1536", fg: "#f3e3d3" },
  { id: "hoje", t: "Hoje", d: "2020-11-06", dz: 182946382, bg: "#19b8b2", fg: "#04201f" },
  { id: "natal", t: "Passando o Natal com os Morlockz", d: "2022-04-18", dz: 306772127, bg: "#e6e6e3", fg: "#141414" },
  { id: "webnamorada", t: "Minha Webnamorada", d: "2022-05-27", dz: 312121027, bg: "#c4c6f0", fg: "#14143a" },
  { id: "gado", t: "Gado Demais", d: "2023-10-24", dz: 496575731, bg: "#e0b72c", fg: "#1d1604" },
  { id: "supera", t: "Supera", d: "2023-12-18", dz: 517607392, sp: "4oge7PMTQ4dPxvnIlhmojj", com: "Mista e Lilo", bg: "#f4f1ea", fg: "#151515" },
  { id: "putaria", t: "P*Taria Me Fez Bem", d: "2023-12-19", dz: 518521842, sp: "15VrzTrxJOCN1NPVmJeRxT", com: "Mc Toddy", bg: "#15152a", fg: "#efe3d8" },
  { id: "rapangel", t: "Rap Angel", d: "2023-12-28", dz: 524256862, sp: "7zlHCq6WaYr3JjLXUmOodG", bg: "#9a2fe0", fg: "#f6ecff" },
  { id: "lean", t: "Deve Ser Horrível Dormir Sem Lean", d: "2024-05-21", dz: 582148612, bg: "#ea4fe0", fg: "#230420" },
];

const CLIPES = [
  { id: "QKdQAC7u22c", t: "Otimismo", c: "com Eloy Polêmico, Msor. e Grone. Prod. Sergio Estranho" },
  { id: "0zplSE-SU6Q", t: "Aquela do Dinheiro", c: "Morlockz" },
  { id: "A6uGUiRCw0U", t: "TeleJogo Maldito", c: "de Sergio Estranho, com 1cort3 e eL Mandarim" },
  { id: "KB4Dubb_R4k", t: "Camera Close", c: "com Sergio Estranho e Eloy Polêmico" },
  { id: "jKdB-taLuEQ", t: "Manual de Táticas Ninjas Vol. I", c: "Morlockz" },
  { id: "_IMYG6J5a64", t: "Passando o Natal com os Morlockz", c: "com Sergio Estranho" },
  { id: "8J2TXv7vBaI", t: "Câmera-Man de Filme Amador", c: "com King Hurbano e Sergio Estranho. Canal da JODO" },
  { id: "GRAewTsqSR8", t: "Cypher do Nada", c: "com Nativo X e Sergio Estranho" },
];
const DA_MIXTAPE = [
  { id: "0yWOZWJr0XM", t: "Intro" },
  { id: "54x0PE2-3vk", t: "Minha WebNamorada" },
];
const LINKS = {
  instagram: "https://www.instagram.com/elmandarimoficial/",
  youtube: "https://www.youtube.com/channel/UC2byRB1gNU5mXtA0qcAuhQw",
  playlist: "https://www.youtube.com/playlist?list=PLA4J_vKiVSVk6sYshs2Tv5fN-3Fh6srdv",
  deezer: "https://www.deezer.com/artist/13144255",
  facebook: "https://www.facebook.com/mandarim.el",
};

// índice dos singles: o campo muda para a cor da capa e a capa segue o cursor
function Indice() {
  const [ativo, setAtivo] = useState(null);
  const [dentro, setDentro] = useState(false);
  const [toca, setToca] = useState(null);
  const capa = useRef(null);
  const sec = useRef(null);
  const alvo = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const s = ativo === null ? null : SINGLES[ativo];
  const fi = ativo !== null ? ativo : toca;
  const f = fi === null ? null : SINGLES[fi];

  // saiu da cena dos singles: fecha o mini player e esconde a capa que segue o cursor (nada fica fixo nas outras cenas)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) { setToca(null); setDentro(false); setAtivo(null); } }, { threshold: 0.05 });
    io.observe(sec.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!dentro) return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = capa.current, a = alvo.current, p = pos.current;
      if (!el) return;
      const vx = (a.x - p.x) * 0.16;
      p.x += vx; p.y += (a.y - p.y) * 0.16;
      const lado = a.x > innerWidth * 0.62 ? -1 : 1;
      const tam = el.offsetWidth;
      const x = lado === 1 ? p.x + 36 : p.x - 36 - tam;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${(p.y - tam / 2).toFixed(1)}px, 0) rotate(${Math.max(-9, Math.min(9, vx * 0.5)).toFixed(2)}deg)`;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [dentro]);

  const mexe = (e) => { alvo.current = { x: e.clientX, y: e.clientY }; if (!dentro) { pos.current = { x: e.clientX, y: e.clientY }; setDentro(true); } };

  return (
    <section ref={sec} id="singles" data-cena className={`${styles.indice} ${styles.cena}`} style={s ? { "--bg": s.bg, "--fg": s.fg } : undefined}>
      <p className={styles.indiceSel}>o que já vazou · 2020 a 2024 · {SINGLES.length} singles</p>
      <ol className={styles.indiceLista} onPointerMove={mexe} onPointerLeave={(e) => { setDentro(false); if (e.pointerType === "mouse") setAtivo(null); }}>
        {SINGLES.map((x, n) => (
          <li key={x.id}>
            <button className={`${styles.linha} ${ativo === n ? styles.on : ""} ${ativo !== null && ativo !== n ? styles.apaga : ""}`}
              onPointerEnter={() => setAtivo(n)} onFocus={() => setAtivo(n)} onClick={() => { if (toca === n) { setToca(null); setAtivo(null); } else { setAtivo(n); setToca(n); } }}>
              <b>{toca === n ? "▸" : nn(n)}</b><span>{x.t}</span><i>{data(x.d)}</i>
            </button>
          </li>
        ))}
      </ol>

      <div className={`${styles.capaSegue} ${dentro ? styles.vivo : ""} ${ativo !== null ? styles.tem : ""}`} ref={capa} aria-hidden="true">
        {SINGLES.map((x, n) => <img key={x.id} src={`/man/v/s-${x.id}.webp`} alt="" className={ativo === n ? styles.mostra : ""} draggable="false" />)}
      </div>

      {toca !== null && (
        <div className={styles.mini}>
          <p><span>tocando · {SINGLES[toca].t}</span><button onClick={() => setToca(null)} aria-label="Fechar o player">×</button></p>
          {SINGLES[toca].sp ? (
            <iframe key={SINGLES[toca].id} className={styles.miniSp} title={`Ouvir ${SINGLES[toca].t} no Spotify`} src={`https://open.spotify.com/embed/album/${SINGLES[toca].sp}?utm_source=generator&theme=0`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
          ) : (
            <iframe key={SINGLES[toca].id} title={`Ouvir ${SINGLES[toca].t} no Deezer`} src={`https://widget.deezer.com/widget/dark/album/${SINGLES[toca].dz}?autoplay=true&tracklist=false`} allow="autoplay; encrypted-media" loading="lazy" />
          )}
        </div>
      )}

      <div className={styles.ficha}>
        {f ? (
          <>
            <p><b>{nn(fi)}</b> {f.t}{f.com ? ` · com ${f.com}` : ""} · {data(f.d)}</p>
            <p className={styles.fichaLinks}>
              {f.sp && <a href={`https://open.spotify.com/album/${f.sp}`} target="_blank" rel="noopener noreferrer">Spotify ↗</a>}
              <a href={`https://www.deezer.com/album/${f.dz}`} target="_blank" rel="noopener noreferrer">Deezer ↗</a>
            </p>
          </>
        ) : <p><span className={styles.soMouse}>passa o mouse nos nomes aí · clica pra ouvir</span><span className={styles.soToque}>toca num nome pra ouvir</span></p>}
      </div>
    </section>
  );
}

export default function ManPagina() {
  const [aberto, setAberto] = useState(null);
  const [cur, setCur] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [cores, setCores] = useState({});
  const [cenaAtual, setCenaAtual] = useState(0);
  const glitch = useRef(null);
  const irRef = useRef(null);
  const abertoRef = useRef(null);
  abertoRef.current = aberto;

  // cor de cada clipe: média das cores mais saturadas da miniatura
  useEffect(() => {
    CLIPES.forEach((c) => {
      const im = new Image();
      im.onload = () => {
        const cv = document.createElement("canvas"); cv.width = 32; cv.height = 18;
        const x = cv.getContext("2d"); x.drawImage(im, 0, 0, 32, 18);
        const d = x.getImageData(0, 0, 32, 18).data;
        let r = 0, g = 0, b = 0, w = 0;
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
          const k = ((mx - mn) / 255) ** 2 * (mx / 255) + 0.001;
          r += d[i] * k; g += d[i + 1] * k; b += d[i + 2] * k; w += k;
        }
        r /= w; g /= w; b /= w;
        const m = Math.max(r, g, b), n = Math.min(r, g, b), f = m - n < 90 ? 90 / Math.max(1, m - n) : 1; // puxa a saturação
        const cor = [r, g, b].map((v) => Math.max(0, Math.min(255, (v - (m + n) / 2) * Math.min(f, 2) + (m + n) / 2 + 12)));
        const lum = (0.299 * cor[0] + 0.587 * cor[1] + 0.114 * cor[2]) / 255;
        setCores((o) => ({ ...o, [c.id]: { bg: `rgb(${cor.map(Math.round).join(",")})`, fg: lum > 0.55 ? "#101010" : "#f4ede6" } }));
      };
      im.src = `/man/v/${c.id}.webp`;
    });
  }, []);

  useEffect(() => {
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(styles.vis); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll("[data-rev]").forEach((e) => io.observe(e));

    // troca de cena por CORTE SUJO: no desktop não há rolagem contínua; a roda/teclas/pontos disparam um glitch em tela cheia
    // (chuvisco, barras de cor, flash) e a cena troca no meio dele, sem nada deslizar
    const desk = () => matchMedia("(min-width: 901px) and (min-height: 640px)").matches;
    const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cenas = [...document.querySelectorAll("[data-cena]")];
    const cv = glitch.current, gx = cv.getContext("2d"), GW = 192, GH = 108;
    cv.width = GW; cv.height = GH;
    const gimg = gx.createImageData(GW, GH);
    const CORES = ["#ff2a6d", "#05d9e8", "#ffffff", "#000000", "#f9f002", "#ff2a6d"];
    let idx = 0, trava = false, rafG = 0;
    const trava_ovf = () => { document.documentElement.style.overflowY = desk() ? "hidden" : ""; };
    trava_ovf();
    const pinta = (inten) => {
      gx.clearRect(0, 0, GW, GH);
      // véu escuro (a troca acontece com a tela quase apagada) + grão leve + poucas linhas finas de fita
      gx.fillStyle = `rgba(10, 8, 7, ${(Math.pow(inten, 1.6) * 0.97).toFixed(3)})`;
      gx.fillRect(0, 0, GW, GH);
      const d = gimg.data;
      for (let i = 0; i < d.length; i += 4) {
        const on = Math.random() < inten * 0.05, v = 120 + Math.random() * 135;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = on ? 200 : 0;
      }
      gx.putImageData(gimg, 0, 0);
      const nb = 1 + Math.floor(inten * 4);
      for (let i = 0; i < nb; i++) {
        gx.globalAlpha = 0.25 + Math.random() * 0.3;
        gx.fillStyle = CORES[Math.floor(Math.random() * 2)];
        const w = GW * (0.2 + Math.random() * 0.6);
        gx.fillRect(Math.random() * (GW - w), Math.random() * GH, w, 1);
      }
      gx.globalAlpha = 1;
    };
    const vai = (n) => {
      if (!desk() || trava || n < 0 || n >= cenas.length || n === idx) return;
      const de = idx;
      const troca = () => { idx = n; scrollTo({ top: n * innerHeight, behavior: "instant" }); setCenaAtual(n); };
      if (reduz) { troca(); return; }
      trava = true;
      const T = 520, t0 = performance.now();
      let feito = false;
      const f = (t) => {
        const k = (t - t0) / T;
        if (k >= 1) { gx.clearRect(0, 0, GW, GH); cv.style.opacity = 0; cenas.forEach((c) => { c.style.translate = ""; }); trava = false; return; }
        const inten = Math.sin(Math.PI * k);
        if (!feito && k > 0.5) { feito = true; troca(); }
        cenas[feito ? n : de].style.translate = `${((Math.random() - 0.5) * inten * 10).toFixed(1)}px 0`;
        pinta(inten);
        cv.style.opacity = 1;
        rafG = requestAnimationFrame(f);
      };
      rafG = requestAnimationFrame(f);
    };
    irRef.current = vai;
    const roda = (e) => {
      if (!desk() || abertoRef.current) return;
      e.preventDefault();
      if (trava || Math.abs(e.deltaY) < 8) return;
      vai(idx + (e.deltaY > 0 ? 1 : -1));
    };
    const teclas = (e) => {
      if (!desk() || abertoRef.current || e.target.closest?.("input, textarea, iframe")) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); vai(idx + 1); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); vai(idx - 1); }
      else if (e.key === "Home") { e.preventDefault(); vai(0); }
      else if (e.key === "End") { e.preventDefault(); vai(cenas.length - 1); }
    };
    const redim = () => { trava_ovf(); if (desk()) scrollTo({ top: idx * innerHeight, behavior: "instant" }); };
    addEventListener("wheel", roda, { passive: false });
    addEventListener("keydown", teclas);
    addEventListener("resize", redim);

    const k = (e) => { if (e.key === "Escape") setAberto(null); };
    addEventListener("keydown", k);
    return () => {
      io.disconnect();
      removeEventListener("keydown", k);
      removeEventListener("wheel", roda); removeEventListener("keydown", teclas); removeEventListener("resize", redim);
      cancelAnimationFrame(rafG); document.documentElement.style.overflowY = "";
      els.forEach((e, i) => { e.style.overflowX = antes[i]; });
    };
  }, []);

  const cl = CLIPES[cur];
  const cc = cores[cl.id];
  // passar o mouse troca o clipe; se um vídeo está tocando, só o clique troca (para não cortar o vídeo sem querer)
  const passa = (i) => { if (!tocando) setCur(i); };

  return (
    <main className={`${styles.raiz} ${anton.variable} ${ser.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="eL Mandarim" cor="#efe3d8" fonte="var(--mp-ser), serif" escala={1.25} />
      <canvas ref={glitch} className={styles.glitch} aria-hidden="true" />
      <nav className={styles.pontos} aria-label="Cenas">
        {["abertura", "singles", "clipes", "mixtape"].map((n, i) => (
          <button key={n} className={i === cenaAtual ? styles.on : ""} onClick={() => irRef.current?.(i)} aria-label={`Ir para ${n}`}><span>{n}</span></button>
        ))}
      </nav>

      {/* abertura */}
      <section data-cena className={`${styles.hero} ${styles.cena}`}>
        <p className={styles.topo}>rap sujo · zona norte · são paulo</p>
        <Rec />
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}><filter id="podre"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.22" numOctaves="2" seed="4" result="r" /><feDisplacementMap in="SourceGraphic" in2="r" scale="11" /></filter></svg>
        <ManEspelho />
        <div className={styles.veu} aria-hidden="true" />
        <h1 className={styles.nome} aria-label="eL Mandarim"><span aria-hidden="true">eL</span><span aria-hidden="true">{[..."MANDARIM"].map((l, i) => <i key={i} className={styles.letra} style={{ "--k": [-0.6, 0.9, -0.3, 0.7, -0.9, 0.4, -0.5, 0.8][i] }}>{l}</i>)}</span></h1>
        <p className={styles.dicaHero} aria-hidden="true">mexe o mouse e clica: ele vai ficando doido</p>
        <p className={styles.sub}>Rap de zona norte, sem filtro e sem anestesia. Dez singles, clipe de câmera tremida e uma mixtape inédita chorando no escuro.</p>
        <a className={styles.desce} href="#singles" onClick={(e) => { if (matchMedia("(min-width: 901px) and (min-height: 640px)").matches) { e.preventDefault(); irRef.current?.(1); } }}>↓ desce aí</a>
      </section>

      <Indice />

      {/* clipes */}
      <section id="clipes" data-cena className={`${styles.clipes} ${styles.cena}`} style={cc ? { "--cb": cc.bg, "--cf": cc.fg } : undefined}>
        <div className={styles.clipesPalco} data-rev>
          <div className={styles.tela}>
            {tocando ? (
              <iframe key={cl.id} title={cl.t} src={`https://www.youtube-nocookie.com/embed/${cl.id}?autoplay=1&rel=0`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            ) : (
              <button className={styles.poster} onClick={() => setTocando(true)} aria-label={`Ver o clipe ${cl.t}`}>
                <img src={`/man/v/${cl.id}.webp`} alt="" /><i aria-hidden="true">▸</i>
              </button>
            )}
          </div>
          <p className={styles.clipeCred}><strong>{cl.t}</strong>{cl.c}</p>
        </div>
        <div className={styles.clipesLado} data-rev>
          <p className={styles.clipesSel}>clipe caseiro · playlist “Clipes do Mandara”</p>
          <ol className={styles.clipesLista}>
            {CLIPES.map((c, i) => (
              <li key={c.id}>
                <button className={i === cur ? styles.on : ""} onPointerEnter={() => passa(i)} onFocus={() => passa(i)} onClick={() => setCur(i)}><b>{nn(i)}</b><span>{c.t}</span></button>
              </li>
            ))}
          </ol>
          <a className={styles.mais} href={LINKS.playlist} target="_blank" rel="noopener noreferrer">playlist completa no YouTube ↗</a>
        </div>
      </section>

      {/* final escuro: o quarto (o som só começa no botão ouvir, lá dentro) */}
      <div data-cena className={styles.cena}>
      <ManQuarto embutido>
        <p className={styles.jaSaiu}>já vazou da mixtape</p>
        <ul className={styles.jaLista}>
          {DA_MIXTAPE.map((v) => <li key={v.id}><button onClick={() => setAberto({ id: v.id, t: `Tô com depressão · ${v.t}` })}>{v.t} ▸</button></li>)}
        </ul>
      </ManQuarto>
      <footer className={styles.fim}>
        <span>eL Mandarim</span>
        <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
        <a href={LINKS.deezer} target="_blank" rel="noopener noreferrer">Deezer</a>
        <a href={LINKS.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
        <button className={styles.topoBtn} onClick={() => scrollTo({ top: 0, behavior: "smooth" })}>voltar pro começo ↑</button>
      </footer>
      </div>


      {aberto && (
        <div className={styles.modal} onClick={() => setAberto(null)} role="dialog" aria-label={aberto.t}>
          <div className={styles.player} onClick={(e) => e.stopPropagation()}>
            <iframe title={aberto.t} src={`https://www.youtube-nocookie.com/embed/${aberto.id}?autoplay=1&rel=0`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            <p>{aberto.t}</p>
            <button className={styles.fechar} onClick={() => setAberto(null)}>fechar ×</button>
          </div>
        </div>
      )}
    </main>
  );
}
