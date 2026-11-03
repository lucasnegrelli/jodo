"use client";
// Página do Lessa Gustavo: um palco só. A capa de cada disco é o cenário e o título acontece em cima dela
// (as peças estão em lessaPecas.js). Troca-se de disco pela tira de capas ou pelas setas do teclado.
import { useCallback, useEffect, useRef, useState } from "react";
import { Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { OBRAS, IDX, LINKS } from "@/data/lessaObras";
import { PECAS as PECAS_ALL, quieta } from "./lessaPecas";
// a Sereno e a Mojica ficam só com a capa até ter uma ideia boa
const PECAS = { ...PECAS_ALL }; delete PECAS.sereno; delete PECAS.mojica;
import s from "@/styles/lessaPalco.module.css";

const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--lp-serif" });
const plex = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--lp-mono" });

const ARQ = { "muita-ostra": "muita-ostra", sereno: "sereno-rot", "antes-carnica": "antes-carnica", mojica: "mojica", "cor-de-deus": "cor-de-deus", "uma-mao": "uma-mao", "wilson-grey": "wilson-grey", impasse: "impasse", catarina: "catarina", instalacoes: "instalacoes" };
const ORDEM = ["muita-ostra", "sereno", "antes-carnica", "mojica", "cor-de-deus", "uma-mao", "wilson-grey", "impasse", "catarina", "instalacoes"];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const LISTA = ORDEM.map((k) => OBRAS[IDX[k]]);

export default function LessaGustavoPalco() {
  const [i, setI] = useState(0);
  const [gav, setGav] = useState(null); // null | "obra" | "links"
  const raiz = useRef(null), cv = useRef(null), ptr = useRef({ x: -999, y: -999, ativo: false, v: 0, acc: 0 }), peca = useRef(null), cursor = useRef("default");
  const o = LISTA[i];

  // rolar (mouse, dedo ou teclado) troca de disco: o palco é fixo e a rolagem só decide qual capa está nele
  const iRef = useRef(0); useEffect(() => { iRef.current = i; }, [i]);
  const vai = useCallback((n) => {
    const el = raiz.current; if (!el) return;
    const alvo = typeof n === "function" ? n(iRef.current) : n;
    el.scrollTo({ top: alvo * el.clientHeight, behavior: "smooth" });
  }, []);
  // roda do mouse e deslizar o dedo: o canvas é fixo e não repassa a rolagem, então a gente liga na mão (um disco por gesto)
  useEffect(() => {
    const el = raiz.current; let livre = true, y0 = null;
    const passo = (d) => { if (!livre) return; const n = clamp(iRef.current + d, 0, LISTA.length - 1); if (n === iRef.current) return; livre = false; vai(n); setTimeout(() => { livre = true; }, 750); };
    const roda = (e) => { if (e.target.closest?.("aside")) return; e.preventDefault(); if (Math.abs(e.deltaY) > 8) passo(e.deltaY > 0 ? 1 : -1); };
    const ini = (e) => { y0 = e.touches[0].clientY; }, fim = (e) => { if (y0 == null) return; const dy = y0 - e.changedTouches[0].clientY; y0 = null; if (Math.abs(dy) > 50) passo(dy > 0 ? 1 : -1); };
    el.addEventListener("wheel", roda, { passive: false }); el.addEventListener("touchstart", ini, { passive: true }); el.addEventListener("touchend", fim, { passive: true });
    return () => { el.removeEventListener("wheel", roda); el.removeEventListener("touchstart", ini); el.removeEventListener("touchend", fim); };
  }, [vai]);
  useEffect(() => {
    const el = raiz.current; let tm = 0;
    const onScroll = () => { clearTimeout(tm); tm = setTimeout(() => { const n = Math.round(el.scrollTop / el.clientHeight); if (n !== iRef.current) { setGav(null); setI(clamp(n, 0, LISTA.length - 1)); } }, 90); };
    el.addEventListener("scroll", onScroll, { passive: true }); return () => { el.removeEventListener("scroll", onScroll); clearTimeout(tm); };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") vai((x) => (x + 1) % LISTA.length);
      else if (e.key === "ArrowLeft") vai((x) => (x + LISTA.length - 1) % LISTA.length);
      else if (e.key === "Escape") setGav(null);
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [vai]);

  useEffect(() => {
    const el = cv.current, ctx = el.getContext("2d"), k = LISTA[i].k, p = ptr.current;
    const lay = { w: 0, h: 0, dpr: 1, sx: 0, sy: 0, S: 0 };
    const img = new Image(); img.src = `/lg/${ARQ[k]}.jpg`;
    const env = { ctx, lay, ptr: p, img, obra: LISTA[i], achou: () => setGav((g) => g ?? "obra"), cursor: (c) => { if (c !== cursor.current) { cursor.current = c; el.style.cursor = c; } } };
    let raf = 0, vivo = true, t0 = performance.now(), ult = t0, pronto = false;
    const mede = () => {
      lay.dpr = Math.min(window.devicePixelRatio || 1, 1.75); lay.w = window.innerWidth; lay.h = window.innerHeight;
      el.width = Math.round(lay.w * lay.dpr); el.height = Math.round(lay.h * lay.dpr);
      lay.S = Math.min(lay.h * 0.78, lay.w * 0.94); lay.sx = (lay.w - lay.S) / 2; lay.sy = Math.max(58, (lay.h - lay.S) / 2 - 22);
      if (peca.current) peca.current.prep();
    };
    const comeca = () => {
      peca.current = (PECAS[k] || quieta)(env); mede(); pronto = true;
    };
    img.onload = comeca;
    const move = (e) => { const r = el.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; if (p.ativo) p.acc += Math.hypot(x - p.x, y - p.y); p.x = x; p.y = y; p.ativo = true; };
    const sai = () => { p.ativo = false; p.x = p.y = -999; };
    const clica = (e) => { move(e); peca.current?.clique?.(); };
    el.addEventListener("pointermove", move); el.addEventListener("pointerdown", clica); el.addEventListener("pointerleave", sai); el.addEventListener("pointerup", (e) => { if (e.pointerType === "touch") sai(); });
    window.addEventListener("resize", mede);
    const frame = () => {
      if (!vivo) return; raf = requestAnimationFrame(frame);
      const agora = performance.now(), dt = Math.min(0.05, (agora - ult) / 1000); ult = agora;
      p.v += ((p.acc / Math.max(dt, 0.001)) - p.v) * 0.25; p.acc = 0;
      if (pronto && peca.current) peca.current.quadro((agora - t0) / 1000, dt);
    };
    frame();
    return () => { vivo = false; cancelAnimationFrame(raf); window.removeEventListener("resize", mede); el.removeEventListener("pointermove", move); el.removeEventListener("pointerdown", clica); el.removeEventListener("pointerleave", sai); peca.current = null; };
  }, [i]);

  const sobe = () => vai(0);
  return (
    <main ref={raiz} className={`${s.raiz} ${serif.variable} ${plex.variable}`}>
      <div className={s.rastro} aria-hidden="true">{LISTA.map((d) => <div key={d.k} />)}</div>
      <VoltarJodo />
      <MarcaTopo nome="Lessa Gustavo" cor="#e6231c" plano escala={1.05} aoSubir={sobe} />
      <canvas key={o.k} ref={cv} className={s.tela} aria-label={`${o.t}: a arte do disco reage ao cursor`} />
      <div className={s.legenda} key={`l-${o.k}`}>
        <h1>{o.t}</h1>
        <p>{o.tipo} · {o.a}{o.faixas.length > 1 ? ` · ${o.faixas.length} faixas` : ""}</p>
      </div>
      <div className={s.acoes}>
        <button onClick={() => setGav(gav === "obra" ? null : "obra")}>{gav === "obra" ? "Fechar ✕" : "Faixas e créditos"}</button>
        <button onClick={() => setGav(gav === "links" ? null : "links")}>{gav === "links" ? "Fechar ✕" : "Links"}</button>
      </div>
      <nav className={s.tira} aria-label="Discos">
        {LISTA.map((d, n) => (
          <button key={d.k} className={n === i ? s.on : ""} onClick={() => vai(n)} aria-label={`${d.t}, ${d.a}`} title={`${d.t} · ${d.a}`}>
            <img src={`/lg/${ARQ[d.k]}.jpg`} alt="" width={44} height={44} />
          </button>
        ))}
      </nav>
      <aside className={`${s.gaveta} ${gav ? s.gavOn : ""}`} aria-hidden={!gav}>
        <button className={s.fecha} onClick={() => setGav(null)} aria-label="Fechar">×</button>
        {gav === "obra" ? (
          <>
            <h2>{o.t}</h2>
            <p className={s.meta}>{o.tipo} · {o.a}</p>
            <ol>{o.faixas.map((f) => <li key={f}>{f}</li>)}</ol>
            {o.ficha.map(([rot, nomes]) => <div key={rot} className={s.ficha}><b>{rot}</b><span>{nomes.join(" · ")}</span></div>)}
            {o.vids.length ? <div className={s.vids}>{o.vids.map(([n, id]) => <a key={id} href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">▸ {n}</a>)}</div> : null}
            <a className={s.ouvir} href={`https://open.spotify.com/album/${o.sp}`} target="_blank" rel="noopener noreferrer">Ouvir no Spotify</a>
          </>
        ) : gav === "links" ? (
          <>
            <h2>Lessa Gustavo</h2>
            <p className={s.meta}>Baixada Fluminense · música, arte conceitual, design e moda</p>
            <div className={s.links}>
              <a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">Spotify</a>
              <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram · @gessalustavo</a>
              <a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud</a>
              <a href={LINKS.bandcamp} target="_blank" rel="noopener noreferrer">Bandcamp</a>
            </div>
          </>
        ) : null}
      </aside>
    </main>
  );
}
