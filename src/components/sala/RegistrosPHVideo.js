"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/registrosPH.module.css";
import useContrasteLogo from "@/lib/useContrasteLogo";

import FILME_META from "@/data/phFilme.json";
import { FICHAS } from "@/data/phFichas";

// o filme inteiro: a rolagem é o playhead (do mais novo ao mais antigo)
const FILME = "/ph/filme/registros.mp4";
const FPS = FILME_META.fps;
const CAPITULOS = FILME_META.capitulos;
const DUR = FILME_META.duracao;


const NOMES = { spotify: "Ouvir no Spotify", youtube: "Assistir no YouTube", bandcamp: "Ouvir no Bandcamp", soundcloud: "Ouvir no SoundCloud" };
// logos das plataformas, com a cor de cada uma
function Icone({ r }) {
  if (r === "spotify")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#1DB954" />
        <path d="M5.2 8.7c4.3-1.3 9.5-1 13.4 1.3" fill="none" stroke="#000" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M5.9 12.2c3.6-1 7.7-.7 10.8 1.1" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.7 15.4c2.9-.7 5.9-.5 8.4.9" fill="none" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  if (r === "youtube")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="0.5" y="4" width="23" height="16" rx="4.5" fill="#FF0000" />
        <path d="M9.7 8.6v6.8l5.9-3.4z" fill="#fff" />
      </svg>
    );
  if (r === "bandcamp")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#1DA0C3" />
        <path d="M3.5 17l5.4-10H20.5l-5.4 10z" fill="#fff" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#FF5500" />
      <path d="M4 15.5v-3M6.2 16v-5M8.4 16v-6.2M10.6 16V9.2M12 16h6.2a2.4 2.4 0 0 0 .3-4.8 4.1 4.1 0 0 0-6.5-1.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const dois = (n) => String(Math.floor(n)).padStart(2, "0");
const tc = (s) => `${dois(s / 3600)}:${dois((s % 3600) / 60)}:${dois(s % 60)}:${dois((s % 1) * FPS)}`;

export default function RegistrosPH() {
  const video = useRef(null);
  const trilha = useRef(null);
  useContrasteLogo();
  const [aberta, setAberta] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(DUR);

  useEffect(() => {
    const v = video.current;
    let raf;
    let atual = 0;
    const onMeta = () => setDur(v.duration || DUR);
    v.addEventListener("loadedmetadata", onMeta);
    v.pause();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const total = Math.round(vh * 24);
      if (trilha.current && trilha.current.dataset.h !== String(total)) {
        trilha.current.dataset.h = String(total);
        trilha.current.style.setProperty("height", total + vh + "px", "important");
      }
      const d = v.duration || DUR;
      const p = Math.max(0, Math.min(1, window.scrollY / total));
      const alvo = p * (d - 0.05);
      atual += (alvo - atual) * 0.06;
      if (Math.abs(alvo - atual) < 0.004) atual = alvo;
      if (v.readyState >= 2 && Math.abs(v.currentTime - atual) > 1 / 60) {
        if (v.fastSeek) v.fastSeek(atual);
        else v.currentTime = atual;
      }
      setT((prev) => (Math.abs(prev - atual) > 1 / 48 ? atual : prev));
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const cap = CAPITULOS.find((c) => t >= c.de && t < c.ate) || CAPITULOS[0];
  const ficha = FICHAS[cap.t];
  const p = Math.min(1, t / (dur || DUR));
  const intro = 1 - Math.min(1, p / 0.025);

  return (
    <main className={styles.raiz}>
      <VoltarJodo />
      <div className={styles.palco}>
        <video ref={video} className={styles.video} src={FILME} muted playsInline preload="auto" aria-hidden="true" />
        <div className={styles.vinheta} />
        <div className={styles.grao} />
        <div className={`${styles.barra} ${styles.barraCima}`} />
        <div className={`${styles.barra} ${styles.barraBaixo}`} />

        <header className={styles.topo}>
          <div
            data-logo-zona
            className={`${styles.marcaCx} ${aberta ? styles.aberta : ""}`}
            onClick={() => setAberta((v) => !v)}
            onMouseLeave={() => setAberta(false)}
          >
            <a
              href="/"
              className={styles.marca}
              aria-label="akaphineas: voltar ao topo"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <i data-logo-contraste />
              <span className={styles.mAk} data-logo-contraste>akaphineas</span>
            </a>
          </div>
        </header>

        <div className={styles.titulo} style={{ opacity: intro, transform: `translateY(${(1 - intro) * -30}px)`, filter: `blur(${(1 - intro) * 14}px)` }}>
          <h1>akaphineas</h1>
          <p>registros · 2018 — 2026</p>
          <span>desce devagar ↓</span>
        </div>

        <div className={styles.fichaBox} style={{ opacity: 1 - intro, visibility: intro > 0.98 ? "hidden" : "visible" }}>
        <div className={styles.ficha} key={cap.t}>
          <div className={styles.fTxt}>
            <small>{cap.ano}</small>
            <b>{cap.t}</b>
            {ficha && ficha.linhas.map((l) => <em key={l}>{l}</em>)}
          </div>
          {ficha && (
            <div className={styles.fObras}>
              {ficha.obras.map((o) => (
                <div key={o.t} className={styles.obra}>
                  {o.c && (
                    <a href={o.l[0][1]} target="_blank" rel="noreferrer" aria-label={`Abrir ${o.t}`}>
                      <img src={`/ph/capas/${o.c}.webp`} alt={`Capa de ${o.t}`} />
                    </a>
                  )}
                  <div>
                    <span>{o.t}</span>
                    <p>
                      {o.l.map(([r, u]) => (
                        <a key={u} href={u} target="_blank" rel="noreferrer" aria-label={NOMES[r] || r} title={NOMES[r] || r}>
                          <Icone r={r} />
                        </a>
                      ))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

        <div className={styles.rec} aria-hidden="true">
          <i />
          <span>{tc(t)}</span>
        </div>

        <ol className={styles.regua} aria-hidden="true">
          {CAPITULOS.map((c) => (
            <li key={c.t + c.de} className={cap.de === c.de ? styles.on : ""} />
          ))}
        </ol>
      </div>
      <div ref={trilha} className={styles.trilha} />
    </main>
  );
}
