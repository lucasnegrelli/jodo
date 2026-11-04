"use client";
// Makalister · cru. Pouco desenho, muito material: a filmagem dele ocupa a tela, a navegação é uma lista de vídeos (tipo tracklist)
// e uma pílula pequena (vídeos, discos, sobre, som). Cortes secos, sem efeito de mouse. O único objeto gráfico é a assinatura dele.
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LANCAMENTOS } from "@/data/makalisterLancamentos";
import s from "@/styles/makalisterCru.module.css";

const ui = Inter_Tight({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--mk-ui" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mk-mono" });

// do mais novo ao mais velho; trechos de 12 s tirados dos próprios clipes (canal Almanak e outros)
const VIDEOS = [
  { k: "endrick", ano: "2026", data: "21.10.2026", t: "ENDRICK (Remix)", yt: "jqoKn-DpeV4", views: "8 mil", nota: "Remix de ENDRICK, do Froid." },
  { k: "pipa", ano: "2026", data: "29.07.2026", t: "Linha de Pipa", yt: "ONLBrE1DWaQ", views: "9 mil", nota: "Gravado no show de lançamento do DSQVDVQE, na Mvuka, em Florianópolis. Com Luiz Barata, Nitcho e Mentosz." },
  { k: "viva", ano: "2025", data: "20.02.2025", t: "VIVA", yt: "PSFPoGXHjwA", views: "35 mil", nota: "Transamazônica, com Victor Xamã, Maria e Lum. Canal Ordem Natural." },
  { k: "filhos", ano: "2023", data: "13.01.2023", t: "Filhos", yt: "dKW9itSgaHE", views: "30 mil", nota: "Single de janeiro de 2023." },
  { k: "gatunos", ano: "2022", data: "23.09.2022", t: "Gatunos", yt: "pbDV4NOQa3A", views: "29 mil", nota: "Com Beli Remour." },
  { k: "lagrimas", ano: "2022", data: "11.11.2022", t: "Mais Que Lágrimas e Quartos Escuros", yt: "onQoVHIGyzo", views: "65 mil", nota: "Dois singles num clipe só." },
  { k: "cruz", ano: "2018", data: "01.02.2018", t: "Quando Observo a Cruz de Folga", yt: "CTJQW99V6tU", views: "30 mil", nota: "Direção: JODO." },
  { k: "amorvirtual", ano: "2018", data: "09.01.2018", t: "Da Era do Amor Virtual", yt: "2BdVAm7qvk0", views: "436 mil", nota: "Prod. Arit." },
  { k: "instalacoes", ano: "2017", data: "2017", t: "Instalações Noturnas, Assuntos de Rua", yt: "y5G2MQcldEo", views: "88 mil", nota: "EP visual, com Lessa Gustavo e l v k s." },
  { k: "waves", ano: "2017", data: "08.10.2017", t: "Breaking the Waves", yt: "TEZQQn8MSJo", views: "187 mil", nota: "Videoclipe oficial, dirigido por Lucas Negrelli." },
  { k: "posse", ano: "2017", data: "27.09.2017", t: "Ao vivo no Posse Cutz, Belo Horizonte", yt: "VtHcmaF11r8", views: "6 mil", nota: "Com Lessa Gustavo." },
];
const DISCOS = LANCAMENTOS.filter((l) => l.faixas.length > 0);
const SEL = { deezer: "https://www.deezer.com/artist/10709967", soundcloud: "https://soundcloud.com/saintmakalister", youtube: "https://www.youtube.com/@AlmanakOficial", instagram: "https://www.instagram.com/makalister.oszimaka/", linktree: "https://linktr.ee/makalister" };

export default function MakalisterCru() {
  const raiz = useRef(null), vids = useRef([]), ass = useRef(null), anterior = useRef(-1), trava = useRef(false);
  const [view, setView] = useState("videos"), [idx, setIdx] = useState(1), [som, setSom] = useState(false);
  const v = VIDEOS[idx];

  const vai = useCallback((d) => { if (trava.current) return; trava.current = true; setIdx((i) => Math.max(0, Math.min(VIDEOS.length - 1, i + d))); setTimeout(() => { trava.current = false; }, 520); }, []);

  // os vídeos ficam empilhados e o corte é seco: só um toca por vez, com som só depois do botão "som"
  useEffect(() => {
    vids.current.forEach((el, i) => {
      if (!el) return;
      if (view === "videos" && i === idx) { el.muted = !som; if (anterior.current !== idx) el.currentTime = 0; el.play().catch(() => {}); } else el.pause();
    });
    anterior.current = view === "videos" ? idx : -1;
  }, [idx, view, som]);

  // roda do mouse, dedo e teclas trocam de vídeo
  useEffect(() => {
    if (view !== "videos") return;
    gsap.registerPlugin(Observer);
    const ob = Observer.create({ type: "wheel,touch", wheelSpeed: -1, tolerance: 24, preventDefault: true, onUp: () => vai(1), onDown: () => vai(-1) });
    const k = (e) => { if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") vai(1); else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") vai(-1); else if (e.key === "m" || e.key === "M") setSom((x) => !x); };
    window.addEventListener("keydown", k);
    return () => { ob.kill(); window.removeEventListener("keydown", k); };
  }, [view, vai]);

  // abertura: a assinatura aparece escrita no meio e vai para o canto
  useEffect(() => {
    const el = ass.current; if (!el) return;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduz) { gsap.set(el, { clipPath: "inset(0 0 0 0)", left: "auto", right: 28, top: 18, xPercent: 0, yPercent: 0, width: 150 }); return; }
    gsap.set(el, { clipPath: "inset(0 100% 0 0)", left: "50%", top: "50%", right: "auto", xPercent: -50, yPercent: -50, width: Math.min(window.innerWidth * 0.6, 760) });
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to(el, { clipPath: "inset(0 0% 0 0)", duration: 1.5, ease: "power2.inOut" })
      .to(el, { left: window.innerWidth - 28, top: 18, xPercent: -100, yPercent: 0, width: 150, duration: 1.1, ease: "power3.inOut" }, "+=0.5");
    return () => tl.kill();
  }, []);

  const lista = VIDEOS.map((x, i) => {
    const d = Math.abs(i - idx);
    return (
      <li key={x.k} data-d={d} style={{ opacity: i === idx ? 1 : Math.max(0.12, 0.5 - d * 0.1) }}>
        <button type="button" onClick={() => setIdx(i)} aria-current={i === idx ? "true" : undefined}><i>{x.ano}</i>{x.t}</button>
      </li>
    );
  });

  return (
    <main ref={raiz} className={`${s.raiz} ${ui.variable} ${mono.variable}`}>
      <VoltarJodo />
      <MarcaTopo nome="Makalister" cor="#ece8de" plano escala={1.05} />
      <img ref={ass} className={s.assinatura} src="/mk/assinatura.png" alt="Makalister" width="900" height="168" />

      <div className={s.palco}>
        {VIDEOS.map((x, i) => (
          <video key={x.k} ref={(el) => { vids.current[i] = el; }} className={`${s.video} ${view === "videos" && i === idx ? s.on : ""}`} src={`/mk/clips/${x.k}.mp4`} muted loop playsInline preload={Math.abs(i - idx) <= 1 ? "auto" : "metadata"} aria-hidden={i !== idx} />
        ))}

        {view === "videos" ? (
          <>
            <ul className={s.lista} aria-label="Vídeos">{lista}</ul>
            <a className={s.ver} href={`https://www.youtube.com/watch?v=${v.yt}`} target="_blank" rel="noopener noreferrer">VER NO YOUTUBE</a>
            <div className={s.info}>
              <p><b>{v.t}</b></p>
              <p>{v.data} · {v.views} views</p>
              <p>{v.nota}</p>
            </div>
            <p className={s.conta}>{String(idx + 1).padStart(2, "0")} / {VIDEOS.length}</p>
          </>
        ) : null}

        {view === "discos" ? (
          <div className={s.folha}>
            <ul className={s.capas}>
              {DISCOS.map((l) => (
                <li key={l.id}><a href={`https://www.deezer.com/album/${l.id}`} target="_blank" rel="noopener noreferrer"><img src={l.img} alt={`Capa de ${l.t}`} width="900" height="900" loading="lazy" decoding="async" /><span>{l.t}</span></a></li>
              ))}
            </ul>
            <ol className={s.tabela}>
              {DISCOS.map((l) => (
                <li key={l.id}><a href={`https://www.deezer.com/album/${l.id}`} target="_blank" rel="noopener noreferrer"><i>{l.d.slice(0, 4)}</i><b>{l.t}</b><span>{l.tipo} · {l.faixas.length} faixas{l.label ? ` · ${l.label}` : ""}</span></a></li>
              ))}
            </ol>
          </div>
        ) : null}

        {view === "sobre" ? (
          <div className={s.sobre}>
            <section>
              <h2>sobre</h2>
              <p>Rapper e produtor de São José, na Grande Florianópolis. Rima desde 2008 e faz os próprios beats. Divide o mesmo terreno, na Serraria, com o Beli Remour, com quem tem mais de 50 músicas.</p>
              <p>Desde 2013 são {DISCOS.length} discos e EPs e dezenas de singles, lançados pelos selos Almanak, Polvo Roxo, Mondé e Loopicotado. O mais recente, DSQVDVQE, saiu em fevereiro de 2026.</p>
            </section>
            <section><h2>ouvir</h2><ul><li><a href={SEL.deezer} target="_blank" rel="noopener noreferrer">Deezer</a></li><li><a href={SEL.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud</a></li></ul></section>
            <section><h2>ver</h2><ul><li><a href={SEL.youtube} target="_blank" rel="noopener noreferrer">YouTube, canal Almanak</a></li><li><a href={SEL.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li><li><a href={SEL.linktree} target="_blank" rel="noopener noreferrer">Linktree</a></li></ul></section>
            <section><h2>shows</h2><ul><li><a href="mailto:contatoalmanak@gmail.com">contatoalmanak@gmail.com</a></li></ul></section>
            <img className={s.assGrande} src="/mk/assinatura.png" alt="" width="900" height="168" />
          </div>
        ) : null}
      </div>

      <nav className={s.pilula} aria-label="Seções">
        {[["videos", "vídeos"], ["discos", "discos"], ["sobre", "sobre"]].map(([k, r]) => <button key={k} type="button" className={view === k ? s.ativo : ""} onClick={() => setView(k)}>{r}</button>)}
        <button type="button" className={`${s.somBtn} ${som ? s.ativo : ""}`} onClick={() => setSom((x) => !x)} aria-pressed={som}>som {som ? "ligado" : "desligado"}</button>
      </nav>
    </main>
  );
}
