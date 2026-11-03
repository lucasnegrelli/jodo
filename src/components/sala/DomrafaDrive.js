"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import styles from "@/styles/domrafa.module.css";
import { VOZES, criaMotor, padraoInicial, copia, passoVazio } from "@/data/motorBeat";

/*
  DOMRAFA / DJ ONDAS: "sessão".
  Conceito: a página é um projeto aberto num editor (Ableton/Premiere). A rolagem é o play: a agulha fica parada e a
  carreira inteira dele passa por baixo, em ordem. Três pistas:
    SOM    = cada faixa é um clipe com a LARGURA REAL da duração (dados do Spotify, conferidos em 21/10/2026).
    IMAGEM = os vídeos dele no canal da JODO, alinhados com o que aconteceu na época.
    COM    = quem esteve na faixa com ele.
  M (mudo) e S (solo) mexem na página de verdade: sem SOM, as ondas viram linha reta; sem IMAGEM, os vídeos apagam;
  sem COM, os nomes somem. As ondas são ILUSTRATIVAS (desenhadas em código a partir do nome da faixa, não do áudio).
  BEAT   = o estúdio: o visitante monta um beat (16 passos, sons sintetizados em código), grava por cima tocando as teclas
           A S D F G, salva o clipe na pista e toca a sessão inteira. Dá para baixar o beat em .wav.
  "DJ Ondas" é o outro nome dele.
*/

const R_CRONO = [
  { id: "0ty9UnMQKJpRSJ8Hyb9w3V", t: "Rap Delivery", tipo: "Single", data: "26.02.2021", sel: "Rap Delivery", com: ["Sergio Estranho", "1cort3"],
    faixas: [["Rap Delivery", 153]] },
  { id: "7dh9Cux5UFOrQa1v1iCNg0", t: "Vales", tipo: "Single", data: "10.04.2021", sel: "Kilowatt Records", com: ["Erick Trip"],
    faixas: [["Vales", 163]] },
  { id: "100DIJYkkqpk5ZLZrIG5tH", t: "G-Funk Vol.1", tipo: "EP", data: "18.06.2021", sel: "domrafa",
    faixas: [["G Disco", 141], ["Sun Rider", 272], ["Ridin' Hi", 118], ["Summertime '92", 133], ["Boombye", 99]] },
  { id: "0lkwB9p3ngMWJKuHMC2lUx", t: "Gado Real", tipo: "Single", data: "24.11.2021", sel: "RMG", com: ["Erickillaz"],
    faixas: [["Gado Real", 142]] },
  { id: "6OKeERWBRsO0o0UxAblXoW", t: "G-Funk Vol.2", tipo: "EP", data: "26.11.2021", sel: "domrafa",
    faixas: [["Jacuzzi", 81], ["La Playa", 122], ["G Parade", 86], ["System 1", 142], ["Bby Boy Dreamz", 136], ["Hi Way", 159]] },
  { id: "2iDZBD7sgzppJcAb9dg4ho", t: "G-Funk Vol.3&4", tipo: "Álbum", data: "2022", sel: "domrafa", gap: "janela",
    faixas: [["Del Mar", 231], ["Sushi", 86], ["The Chillest", 95], ["Ice Tea", 81], ["Backseat", 42], ["2002 Casino", 138],
             ["G Disco 2", 131], ["Ridin' Lo", 76], ["Seaside", 174], ["Drive Home", 138]] },
  { id: "23pudiOCn8YnqSoP5R6iaJ", t: "centro parte II", tipo: "Single", data: "24.01.2025", sel: "1LUM3", com: ["1LUM3"], gap: 260,
    faixas: [["centro parte II", 192]] },
  { id: "0einq0t6WMbMUBECqUpqZE", t: "FAZ CHOVER", tipo: "Single", data: "19.12.2025", sel: "Novak 97", com: ["Novak 97"],
    faixas: [["FAZ CHOVER", 150]] },
];

const R = [...R_CRONO].reverse(); // a tela começa pelo lançamento mais recente

// vídeos do acervo da JODO em que ele aparece; "em" diz com qual lançamento o clipe se alinha
const VIDEOS = [
  { yt: "5E6gafrDyik", t: "Rap Delivery · No Fronte (prod. domrafa)", data: "05.2022", em: "2iDZBD7sgzppJcAb9dg4ho" },
  { yt: "5bcjkv3Ij-w", t: "Beat Tape Estrada", data: "31.10.2024", janela: 1 },
  { yt: "0WU-z5iuVCk", t: "DJ ONDAS · 90 SURF (visualizer)", data: "11.11.2024", janela: 0 },
  { yt: "xkMMy2l6K60", t: "1LUM3 · centro parte II (prod. domrafa)", data: "24.01.2025", em: "23pudiOCn8YnqSoP5R6iaJ" },
];

const PAGINAS = { "Sergio Estranho": "/artistas/sergio-estranho", "1cort3": "/artistas/1cort3" };
const CORES = ["#5aa9ff", "#4fd6c3", "#9d8cff", "#38e0a1", "#7fd1ff", "#4fd6c3", "#5aa9ff", "#38e0a1"];
const LINKS = [
  { r: "Spotify", u: "https://open.spotify.com/intl-pt/artist/7Bx2UBMSD7CGds4BduvWYz" },
  { r: "SoundCloud", u: "https://soundcloud.com/domrafa" },
  { r: "Instagram", u: "https://www.instagram.com/domrafa.wav/" },
];

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// onda ilustrativa, sempre a mesma para o mesmo nome de faixa
function onda(nome, n) {
  let h = 2166136261;
  for (const c of nome) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  let s = (h >>> 0) % 2147483647 || 1;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const amps = [];
  for (let i = 0; i < n; i++) {
    const env = Math.min(1, (i + 1) / 5) * Math.min(1, (n - i) / 9);
    const pulso = i % 8 < 2 ? 1 : 0.62 + 0.2 * Math.sin(i / 5);
    amps.push(Math.max(0.05, env * pulso * (0.3 + 0.7 * Math.pow(rnd(), 0.8))));
  }
  return amps;
}

function monta(P, imgW) {
  const clips = [];
  const com = [];
  const marcas = [];
  const imgs = [];
  const inicio = {};
  let x = 0;
  let janelaX = 0;
  R.forEach((r, ri) => {
    if (r.gap === "janela") {
      janelaX = x + 40;
      marcas.push({ x: janelaX, t: "2024" }, { x: janelaX + imgW + 40, t: "2024" });
      x += 40 + (imgW + 40) * 2 + 40;
    } else if (r.gap) x += r.gap;
    inicio[r.id] = x;
    const ini = x;
    r.faixas.forEach(([nome, seg], fi) => {
      const w = seg * P;
      clips.push({ r: ri, rel: r, nome, seg, x, w, fi, amps: onda(nome, Math.max(6, Math.floor(w / 3))) });
      x += w + 3;
    });
    marcas.push({ x: ini, t: r.data.length > 4 ? r.data.slice(-4) : r.data, forte: true, data: r.data });
    if (r.com) com.push({ x: ini, w: x - ini - 3, nomes: r.com, rel: r });
    x += 46;
  });
  VIDEOS.forEach((v) => {
    const vx = v.em ? inicio[v.em] : janelaX + v.janela * (imgW + 40);
    imgs.push({ ...v, x: vx, w: imgW });
  });
  return { clips, com, marcas, imgs, total: x + 160 };
}

function Onda({ amps }) {
  const n = amps.length;
  let d = "";
  amps.forEach((a, i) => {
    const h = a * 46;
    d += `M${i + 0.5} ${50 - h}V${50 + h}`;
  });
  return (
    <svg className={styles.onda} viewBox={`0 0 ${n} 100`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function DomrafaDrive() {
  const raiz = useRef(null);
  const [P, setP] = useState(4.4);
  const [mudo, setMudo] = useState([]);
  const [solo, setSolo] = useState([]);
  const [pos, setPos] = useState(0);
  const [tocando, setTocando] = useState(null);
  const [aba, setAba] = useState("faixa");
  const [slots, setSlots] = useState(() => [padraoInicial(), passoVazio(), passoVazio(), passoVazio()]);
  const [slot, setSlot] = useState(0);
  const [compassos, setCompassos] = useState(2);
  const pat = slots[slot];
  const setPat = (f) => setSlots((ss) => ss.map((q, i) => (i === slot ? (typeof f === "function" ? f(q) : f) : q)));
  const [bpm, setBpm] = useState(92);
  const [passo, setPasso] = useState(-1);
  const [loopOn, setLoopOn] = useState(false);
  const [rec, setRec] = useState(false);
  const [sessao, setSessao] = useState(false);
  const [meus, setMeus] = useState([]);
  const motor = useRef(null);
  const beatAtual = useRef(null);
  const recRef = useRef(false);
  const meusRef = useRef([]);

  const imgW = P < 4 ? 190 : 250;
  const M = useMemo(() => monta(P, imgW), [P, imgW]);
  const ESC = 1.6; // px de rolagem para cada px da carreira

  useEffect(() => {
    const aj = () => setP(innerWidth < 760 ? 3.2 : 4.4);
    aj();
    addEventListener("resize", aj);
    return () => removeEventListener("resize", aj);
  }, []);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    let q = 0;
    let ultimo = -1;
    const roda = () => {
      q = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const u = Math.min(1, Math.max(0, scrollY / max));
      const p = u * M.total;
      el.style.setProperty("--u", u.toFixed(4));
      el.style.setProperty("--sy", String(Math.round(scrollY)));
      el.style.setProperty("--pos", p.toFixed(1));
      const tw = el.querySelector("[data-trilha]");
      const ponto = innerWidth < 760 ? 0.22 : 0.34;
      el.style.setProperty("--lx", (p - ponto * (tw ? tw.clientWidth : innerWidth)).toFixed(1)); // borda esquerda da tela, em px da carreira
      const s = Math.floor(p / 4); // reduz renderizações: atualiza o estado a cada 4px de carreira
      if (s !== ultimo) { ultimo = s; setPos(p); }
    };
    const aoRolar = () => { if (!q) q = requestAnimationFrame(roda); };
    roda();
    addEventListener("scroll", aoRolar, { passive: true });
    addEventListener("resize", aoRolar);
    return () => { removeEventListener("scroll", aoRolar); removeEventListener("resize", aoRolar); cancelAnimationFrame(q); };
  }, [M.total]);

  // motor de áudio (criado no navegador, na primeira vez que precisa)
  const getMotor = () => {
    if (!motor.current) motor.current = criaMotor((i) => setPasso(i));
    return motor.current;
  };
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem("domrafa-sessao") || "null");
      if (salvo) { if (salvo.slots) setSlots(salvo.slots); else if (salvo.pat) setSlots((ss) => [salvo.pat, ...ss.slice(1)]); if (salvo.bpm) setBpm(salvo.bpm); if (salvo.meus) setMeus(salvo.meus); }
    } catch (e) {}
    return () => { motor.current && motor.current.para(); };
  }, []);
  useEffect(() => {
    try { localStorage.setItem("domrafa-sessao", JSON.stringify({ slots, bpm, meus })); } catch (e) {}
  }, [slots, bpm, meus]);
  useEffect(() => { recRef.current = rec; }, [rec]);
  useEffect(() => { meusRef.current = meus; }, [meus]);
  useEffect(() => { if (loopOn) { const m = getMotor(); m.pat = pat; m.bpm = bpm; } }, [pat, bpm, loopOn]);

  const bateVoz = (v) => {
    const m = getMotor();
    const nota = v === "b" || v === "l" ? 2 : 1;
    m.bate(v, nota);
    if (recRef.current && m.rodando) {
      const j = m.passoAgora();
      setPat((p) => { const n = copia(p); n[v][j] = nota; return n; });
    }
  };
  useEffect(() => {
    const tecla = (e) => {
      if (aba !== "estudio" || e.repeat || e.metaKey || e.ctrlKey || /input|textarea|select/i.test(e.target.tagName)) return;
      const v = VOZES.find((x) => x.tecla.toLowerCase() === e.key.toLowerCase());
      if (v) { e.preventDefault(); bateVoz(v.k); }
    };
    addEventListener("keydown", tecla);
    return () => removeEventListener("keydown", tecla);
  }, [aba]);

  const alternaLoop = () => {
    const m = getMotor();
    if (loopOn) { m.para(); setLoopOn(false); setRec(false); return; }
    setSessao(false); m.pat = pat; m.bpm = bpm; m.liga(); setLoopOn(true);
  };
  const cliqueStep = (v, j) => {
    const novo = v === "b" || v === "l" ? (pat[v][j] + 1) % 5 : pat[v][j] ? 0 : 1;
    setPat((p) => { const n = copia(p); n[v][j] = novo; return n; });
    if (novo) getMotor().bate(v, novo);
  };
  const salvaNaPista = () => {
    const w = compassos * 16 * (60 / bpm / 4) * P; // cada compasso = 16 passos
    setMeus((l) => [...l, { id: Date.now(), x: Math.round(pos), w: Math.round(w), pat: copia(pat), bpm, nome: "ABCD"[slot] }]);
  };
  const baixa = async () => {
    const blob = await getMotor().exporta(pat, bpm, 0.12);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `domrafa-sessao-${bpm}bpm.wav`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  // tocar sessão: a agulha anda em tempo real e os clipes de BEAT soam quando ela passa por eles
  useEffect(() => {
    if (!sessao) { beatAtual.current = null; if (motor.current && !loopOn) motor.current.para(); return; }
    const m = getMotor();
    m.para(); setLoopOn(false); setRec(false);
    let raf = 0;
    let y = scrollY;
    let t0 = performance.now();
    const roda = (t) => {
      const dt = (t - t0) / 1000; t0 = t;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (Math.abs(scrollY - y) > 6 || y >= max - 1) { setSessao(false); return; } // o usuário rolou, ou acabou
      y += P * ESC * dt;
      scrollTo(0, Math.round(y));
      const p = (y / max) * M.total;
      const c = meusRef.current.find((q) => p >= q.x && p < q.x + q.w);
      const id = c ? c.id : null;
      if (id !== beatAtual.current) {
        beatAtual.current = id;
        m.para();
        if (c) { m.pat = c.pat; m.bpm = c.bpm; m.liga(); }
      }
      raf = requestAnimationFrame(roda);
    };
    raf = requestAnimationFrame(roda);
    return () => cancelAnimationFrame(raf);
  }, [sessao]);

  const arrasta = (e, c) => {
    if (e.target.closest("[role=button]")) return;
    const x0 = e.clientX;
    const ini = c.x;
    let mexeu = false;
    const move = (ev) => {
      const dx = ev.clientX - x0;
      if (Math.abs(dx) > 4) mexeu = true;
      if (mexeu) setMeus((l) => l.map((q) => (q.id === c.id ? { ...q, x: Math.max(0, Math.round(ini + dx)) } : q)));
    };
    const solta = () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", solta);
      if (!mexeu) ir(c.x + 2);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", solta);
  };

  const ir = (x) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: Math.max(260, (Math.max(0, x) / M.total) * max), behavior: "smooth" }); // margem: abaixo de 260px a abertura cobre a tela
  };

  const efetivo = (l) => (solo.length ? !solo.includes(l) : mudo.includes(l));
  const mudos = ["som", "img", "com", "beat"].filter(efetivo);
  const beatMudo = efetivo("beat");
  useEffect(() => { motor.current && motor.current.volume(beatMudo ? 0 : 1); }, [beatMudo, loopOn, sessao]);
  const alterna = (lista, set, l) => set(lista.includes(l) ? lista.filter((a) => a !== l) : [...lista, l]);

  // o que está sob a agulha
  const clip = M.clips.find((c) => pos >= c.x && pos < c.x + c.w + 3);
  const video = M.imgs.find((v) => pos >= v.x && pos < v.x + v.w);
  const rel = clip?.rel || null;
  const nivel = clip ? clip.amps[Math.min(clip.amps.length - 1, Math.floor(((pos - clip.x) / clip.w) * clip.amps.length))] : 0;
  const tc = clip ? mmss((pos - clip.x) / P) : "00:00";

  const lanes = [
    { k: "som", nome: "SOM", alt: aba === "estudio" ? 0.55 : 1.5 },
    { k: "img", nome: "IMAGEM", alt: aba === "estudio" ? 0.4 : 1 },
    { k: "com", nome: "COM", alt: aba === "estudio" ? 0.3 : 0.55 },
    { k: "beat", nome: "BEAT", alt: 1.7 },
  ].filter((l) => l.k !== "beat" || aba === "estudio"); // a pista de beat só existe no modo estúdio

  return (
    <main className={styles.pagina} ref={raiz} data-m={mudos.join(" ")} style={{ "--rolagem": `${Math.round(M.total / ESC)}px` }}>
      <VoltarJodo />
      <MarcaTopo nome="domrafa" cor="#4fd6c3" fonte='ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace' escala={0.9} />

      <div className={styles.palco}>
        <div className={styles.projeto}>
          <span>projeto <b>domrafa.wav</b> · aka DJ Ondas · &apos;92</span>
          <span className={styles.dica}><button className={`${styles.tocaSessao} ${sessao ? styles.playOn : ""}`} onClick={() => setSessao((v) => !v)}>{sessao ? "■ parar" : "▶ tocar sessão"}</button> ou rola</span>
        </div>

        <div className={styles.mesa}>
          {/* régua */}
          <div className={`${styles.linha} ${styles.reguaLinha}`}>
          <div className={styles.cabRegua} />
          <div className={styles.trilha}>
            <div className={styles.desl}>
              <div className={styles.regua} style={{ width: M.total, "--dez": `${P * 10}px` }}>
                {M.marcas.map((m, i) => (
                  <button key={i} className={m.forte ? styles.marcaForte : styles.marca} style={{ left: m.x }} onClick={() => ir(m.x)}>
                    {m.data || m.t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>

          {lanes.map((l) => (
            <div key={l.k} className={styles.linha} style={{ flex: l.alt }}>
              <div className={`${styles.cab} ${efetivo(l.k) ? styles.cabMudo : ""}`}>
                <b>{l.nome}</b>
                <span className={styles.botoes}>
                  <button className={mudo.includes(l.k) ? styles.on : ""} onClick={() => alterna(mudo, setMudo, l.k)} title="mudo">M</button>
                  <button className={solo.includes(l.k) ? styles.onSolo : ""} onClick={() => alterna(solo, setSolo, l.k)} title="solo">S</button>
                </span>
                {l.k === "som" && <i className={styles.medidor} style={{ "--n": efetivo("som") ? 0 : nivel }} />}
              </div>
              <div className={styles.trilha} data-trilha>
                <div className={styles.desl}>
                  {l.k === "beat" &&
                    meus.map((c) => (
                      <button key={c.id} className={`${styles.clip} ${styles.meu}`} style={{ left: c.x, width: c.w, "--x": c.x, "--w": c.w, cursor: "grab", touchAction: "none" }} onPointerDown={(e) => arrasta(e, c)}>
                        <svg className={styles.mini} viewBox="0 0 16 5" preserveAspectRatio="none" aria-hidden="true">
                          {VOZES.map((v, r) => c.pat[v.k].map((n, j) => (n ? <rect key={v.k + j} x={j + 0.12} y={r + 0.15} width="0.76" height="0.7" /> : null)))}
                        </svg>
                        <span className={styles.nomeClip}>beat {c.nome || ""} · {c.bpm} bpm</span>
                        <i className={styles.tira} role="button" onClick={(e) => { e.stopPropagation(); setMeus((q) => q.filter((z) => z.id !== c.id)); }}>×</i>
                      </button>
                    ))}
                  {l.k === "beat" && !meus.length && <span className={styles.dicaBeat}>▸ monte um beat na aba ESTÚDIO e salve aqui · arraste os clipes</span>}
                  {l.k === "som" &&
                    M.clips.map((c, i) => (
                      <button key={i} className={`${styles.clip} ${clip === c ? styles.sob : ""}`}
                        style={{ left: c.x, width: c.w, "--c": CORES[c.r], "--x": c.x, "--w": c.w }} onClick={() => ir(c.x + 2)}>
                        <Onda amps={c.amps} />
                        {c.w > 46 && <span className={styles.nomeClip}>{c.nome}</span>}
                        {c.w > 92 && <em>{mmss(c.seg)}</em>}
                      </button>
                    ))}
                  {l.k === "img" &&
                    M.imgs.map((v) => (
                      <button key={v.yt} className={`${styles.clip} ${styles.vid} ${video === v ? styles.sob : ""}`}
                        style={{ left: v.x, width: v.w, "--x": v.x, "--w": v.w, backgroundImage: `url(https://i.ytimg.com/vi/${v.yt}/mqdefault.jpg)` }}
                        onClick={() => ir(v.x + 2)}>
                        <span className={styles.nomeClip}>{v.t}</span>
                      </button>
                    ))}
                  {l.k === "com" &&
                    M.com.map((c, i) => (
                      <div key={i} className={styles.clipCom} style={{ left: c.x, width: c.w, "--x": c.x, "--w": c.w }}>
                        <span className={styles.comTxt}>
                          {c.nomes.map((n) =>
                            PAGINAS[n] ? <Link key={n} href={PAGINAS[n]}>{n}</Link> : <span key={n}>{n}</span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}

          <div className={styles.agulha} aria-hidden="true"><i /></div>
        </div>

        {/* inspetor: o que está sob a agulha */}
        <div className={`${styles.inspetor} ${aba === "estudio" ? styles.est : ""}`}>
          <div className={styles.abas}>
            <button className={aba === "faixa" ? styles.abaOn : ""} onClick={() => setAba("faixa")}>faixa</button>
            <button className={aba === "estudio" ? styles.abaOn : ""} onClick={() => setAba("estudio")}>estúdio</button>
          </div>
          {aba === "estudio" ? (
            <div className={styles.estudio}>
              <div className={styles.ctrl}>
                <button className={`${styles.btn} ${loopOn ? styles.btnOn : ""}`} onClick={alternaLoop}>{loopOn ? "■ parar" : "▶ tocar"}</button>
                <button className={`${styles.btn} ${rec ? styles.recOn : ""}`} disabled={!loopOn} onClick={() => setRec((v) => !v)} title="toque A S D F G com o beat rodando">● gravar</button>
                <label className={styles.bpm}>{bpm} bpm<input type="range" min="70" max="130" value={bpm} onChange={(e) => setBpm(+e.target.value)} /></label>
                <span className={styles.grupo}>
                  {["A", "B", "C", "D"].map((n, i) => (
                    <button key={n} className={`${styles.chipSlot} ${slot === i ? styles.abaOn : ""}`} onClick={() => setSlot(i)} title={`padrão ${n}`}>{n}</button>
                  ))}
                </span>
                <button className={styles.btn} onClick={() => setPat(passoVazio())}>limpar</button>
                <label className={styles.bpm}>clipe
                  <select value={compassos} onChange={(e) => setCompassos(+e.target.value)}>
                    {[1, 2, 4, 8].map((n) => <option key={n} value={n}>{n} comp.</option>)}
                  </select>
                </label>
                <button className={styles.btn} onClick={salvaNaPista}>+ salvar na pista</button>
                <button className={styles.btn} onClick={baixa}>↓ .wav</button>
              </div>
              <div className={styles.grade}>
                {VOZES.map((v) => (
                  <div key={v.k} className={styles.fileira}>
                    <button className={styles.pad} onClick={() => bateVoz(v.k)} title={`tecla ${v.tecla}`}><b>{v.nome}</b><kbd>{v.tecla}</kbd></button>
                    <div className={styles.passos}>
                      {pat[v.k].map((n, j) => (
                        <button key={j} className={`${styles.passo} ${n ? styles.liga : ""} ${j % 4 === 0 ? styles.tempo : ""} ${passo === j ? styles.agora : ""}`}
                          style={n > 1 ? { "--n": n } : undefined} onClick={() => cliqueStep(v.k, j)} aria-label={`${v.nome} passo ${j + 1}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.nota}>sons sintetizados no navegador (kit do site, não são as faixas dele). Baixo e assobio: clique de novo para mudar a nota. Com o beat rodando e ● gravar ligado, toque A S D F G.</p>
            </div>
          ) : (
          <>
          <div className={styles.relogio}>
            <small>{rel ? `${rel.tipo} · ${rel.data}` : video ? "vídeo" : "sem faixa"}</small>
            <b>{tc}</b>
          </div>
          <div className={styles.info}>
            {rel ? (
              <>
                <h2>{clip.nome}</h2>
                <p>
                  {rel.t !== clip.nome && <>em <em>{rel.t}</em> · </>}
                  faixa {clip.fi + 1} de {rel.faixas.length}
                  {rel.sel && <> · selo {rel.sel}</>}
                </p>
                {rel.com && (
                  <p>com {rel.com.map((n, i) => (
                    <span key={n}>{i > 0 && ", "}{PAGINAS[n] ? <Link href={PAGINAS[n]}>{n}</Link> : n}</span>
                  ))}</p>
                )}
                {rel.faixas.length > 1 && (
                  <ol className={styles.lista}>
                    {M.clips.filter((c) => c.rel === rel).map((c) => (
                      <li key={c.fi}>
                        <button className={c === clip ? styles.listaOn : ""} onClick={() => ir(c.x + 2)}>
                          <span>{String(c.fi + 1).padStart(2, "0")}</span>{c.nome}<em>{mmss(c.seg)}</em>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            ) : video ? (
              <>
                <h2>{video.t}</h2>
                <p>vídeo no canal da JODO · {video.data}</p>
              </>
            ) : (
              <>
                <h2>{pos < 8 ? "domrafa" : "silêncio na pista"}</h2>
                <p>{pos < 8 ? "produtor audiovisual e designer. Beats e mix. São Paulo." : "entre um lançamento e outro, só os vídeos."}</p>
                <ol className={styles.lista}>
                  {R.map((r) => {
                    const c0 = M.clips.find((c) => c.rel === r);
                    return (
                      <li key={r.id}>
                        <button onClick={() => ir(c0.x + 2)}><span>{r.data.slice(-4)}</span>{r.t}<em>{r.tipo}</em></button>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
            {video && rel && (
              <button className={styles.btn} onClick={() => setTocando({ tipo: "yt", id: video.yt })}>▸ assistir: {video.t}</button>
            )}
          </div>
          <div className={styles.saida}>
            {tocando?.tipo === "sp" && (
              <iframe title="Spotify" src={`https://open.spotify.com/embed/album/${tocando.id}?theme=0`} allow="encrypted-media" loading="lazy" />
            )}
            {tocando?.tipo === "yt" && (
              <iframe title="YouTube" src={`https://www.youtube-nocookie.com/embed/${tocando.id}?autoplay=1&rel=0`} allow="autoplay; encrypted-media" loading="lazy" />
            )}
            {!tocando && (
              <div className={styles.botoesOuvir}>
                {rel && <button className={styles.btn} onClick={() => setTocando({ tipo: "sp", id: rel.id })}>▸ ouvir {rel.t}</button>}
                {!rel && video && <button className={styles.btn} onClick={() => setTocando({ tipo: "yt", id: video.yt })}>▸ assistir</button>}
                {tocando === null && !rel && !video && <span className={styles.vazio}>{LINKS.map((l) => (
                  <a key={l.r} href={l.u} target="_blank" rel="noopener noreferrer">{l.r}</a>
                ))}</span>}
              </div>
            )}
            {tocando && <button className={styles.fecha} onClick={() => setTocando(null)}>× fechar</button>}
          </div>
          </>
          )}
        </div>

        {/* abertura do projeto: some com a primeira rolagem */}
        <div className={styles.intro} aria-hidden={pos > 40}>
          <p>abrindo o projeto</p>
          <h1>domrafa</h1>
          <p className={styles.aka}>aka <b>DJ Ondas</b></p>
          <p className={styles.sub}>produtor audiovisual e designer · beats e mix · São Paulo</p>
          <span className={styles.desce}>rola pra dar play ↓</span>
        </div>
      </div>

    </main>
  );
}
