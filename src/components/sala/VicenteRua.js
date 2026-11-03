"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import { useEffect, useRef } from "react";
import styles from "@/styles/vicenteRua.module.css";
import { PERFIS } from "@/data/vicenteBlow";

/*
 * VBLXW · rua (fatia: capa).
 * Colagem de recortes de fotos reais do Centro de Manaus, em camadas com parallax. A faixa amarela de rua atravessa tudo (o fio).
 * Fotos: Wikimedia Commons, JLPizzol (CC BY-SA 4.0) e Naldo Arruda (CC BY 3.0).
 */

export default function VicenteRua() {
  const raiz = useRef(null);

  useEffect(() => {
    const el = raiz.current;
    let alvoX = 0, alvoY = 0, x = 0, y = 0, raf;
    const onMove = (e) => {
      alvoX = (e.clientX / innerWidth) * 2 - 1;
      alvoY = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onMove);
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!onMove.tocou && now > 1500) {
        alvoX = Math.sin(now * 0.00022) * 0.5;
        alvoY = Math.cos(now * 0.00017) * 0.25;
      }
      x += (alvoX - x) * 0.06;
      y += (alvoY - y) * 0.06;
      el.style.setProperty("--mx", x.toFixed(4));
      el.style.setProperty("--my", y.toFixed(4));
    };
    raf = requestAnimationFrame(tick);
    const marca = () => (onMove.tocou = true);
    addEventListener("pointerdown", marca, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <main ref={raiz} className={styles.raiz}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bungee&family=Bungee+Inline&family=Archivo:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap"
      />
      <VoltarJodo />
      <div className={styles.palco}>
        {/* fundo: a avenida, em azul de fachada */}
        <div className={`${styles.cam} ${styles.fundo}`}><img src="/vb/c/avenida.webp" alt="" /></div>
        <div className={styles.fumaca} />

        {/* a faixa amarela de rua: o fio */}
        <div className={`${styles.cam} ${styles.faixaCam}`}>
          <div className={styles.faixa}><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </div>

        {/* as fachadas recortadas */}
        <div className={`${styles.cam} ${styles.fachadaCam}`}>
          <img className={styles.fachada} src="/vb/c/fachada.webp" alt="Casarões do Centro de Manaus, na Avenida Eduardo Ribeiro" />
          <span className={`${styles.fita} ${styles.fita1}`} />
          <span className={`${styles.fita} ${styles.fita2}`} />
        </div>

        {/* o letreiro */}
        <div className={`${styles.cam} ${styles.placaCam}`}>
          <div className={styles.placa}>
            <small>rap · manaus · amazonas</small>
            <h1>
              <span>Vicente</span>
              <span>Blow</span>
            </h1>
            <p>bruxos do norte · desde 2013</p>
          </div>
          <div className={styles.carimbo}>inimigo número 1 do estado</div>
        </div>

        {/* a foto colada, em polaroide */}
        <div className={`${styles.cam} ${styles.polaCam}`}>
          <figure className={styles.pola}>
            <img src="/vb/c/avenida.webp" alt="Avenida Eduardo Ribeiro, Manaus" />
            <figcaption>av. eduardo ribeiro, centro</figcaption>
            <span className={`${styles.fita} ${styles.fita3}`} />
          </figure>
        </div>

        <div className={styles.cta}>
          <a className={styles.btn} href={PERFIS.spotify} target="_blank" rel="noreferrer">ouvir no Spotify ↗</a>
          <a className={styles.btn2} href={PERFIS.instagram} target="_blank" rel="noreferrer">@bruxobuya ↗</a>
        </div>
        <p className={styles.credito}>
          Fotos: <a href="https://commons.wikimedia.org/wiki/File:Antigos_edificios_na_Av._Eduardo_Ribeiro-Manaus_16-04-2015.JPG" target="_blank" rel="noreferrer">JLPizzol</a> (CC BY-SA 4.0) e{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Avenida_Eduardo_Ribeiro_-_Manaus.jpg" target="_blank" rel="noreferrer">Naldo Arruda</a> (CC BY 3.0), via Wikimedia Commons.
        </p>
        <div className={styles.grao} />
      </div>
    </main>
  );
}
