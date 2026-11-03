"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/rapdelivery.module.css";

function fmt(n) {
  if (n == null) return "";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",") + " mil";
  return String(n);
}

export default function SalaRapDelivery({ integrantes, paradas }) {
  const trilho = useRef(null);
  const [prog, setProg] = useState(0);
  const [tocando, setTocando] = useState(null);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    // roda do mouse (vertical) vira rolagem horizontal
    const roda = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.1;
      }
    };
    const rolou = () => setProg(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth));
    el.addEventListener("wheel", roda, { passive: false });
    el.addEventListener("scroll", rolou, { passive: true });
    return () => {
      el.removeEventListener("wheel", roda);
      el.removeEventListener("scroll", rolou);
    };
  }, []);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setTocando(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const total = paradas.length + 1;

  return (
    <div className={styles.sala}>
      <header className={styles.topo}>
        <Link href="/" className={styles.marcaMontanha} aria-label="JODO, voltar ao mapa"><img src="/jodo-montanha.png" alt="" /><span>RAP DELIVERY</span></Link>
        <span className={styles.marca}>RAP DELIVERY</span>
        <Link href="/artistas/82" className={styles.sub}>por 82 e os meninos</Link>
      </header>

      <div className={styles.trilho} ref={trilho}>
        <section className={`${styles.parada} ${styles.abertura}`}>
          <div className={styles.formas} aria-hidden="true">
            <i className={styles.f1} /><i className={styles.f2} /><i className={styles.f3} />
          </div>
          <p className={styles.kicker}>entrega 24h · rima pra viagem</p>
          <h1 className={styles.titulo}>RAP<br />DELIVERY</h1>
          <ul className={styles.gente}>
            {integrantes.map((i) => (
              <li key={i.nome}>
                <Link href={i.href}>
                  <strong>{i.nome}</strong>
                  <span>{i.papel}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.dica}>role para entrar na rota →</p>
        </section>

        {paradas.map((p) => (
          <section key={p.id} className={styles.parada}>
            <span className={styles.numero}>{p.numero}</span>
            <div className={styles.corpo}>
              <p className={styles.anos}>{p.anos}</p>
              <h2>{p.titulo}</h2>
              <p className={styles.texto}>{p.texto}</p>
              <ol className={styles.faixas}>
                {p.faixas.map((fx) => (
                  <li key={fx.yt}>
                    <button onClick={() => setTocando(fx)}>
                      <span className={styles.fxTitulo}>{fx.titulo}</span>
                      <span className={styles.fxQuem}>{fx.quem}</span>
                      <span className={styles.fxViews}>{fmt(fx.views)}</span>
                      <span className={styles.fxPlay}>▶</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ))}
      </div>

      <div className={styles.barra} aria-hidden="true">
        <span style={{ width: `${Math.max(4, prog * 100)}%` }} />
        <em>{Math.min(total, Math.round(prog * (total - 1)) + 1)} / {total}</em>
      </div>

      {tocando && (
        <div className={styles.modal} onClick={() => setTocando(null)} role="dialog" aria-modal="true">
          <div className={styles.modalCaixa} onClick={(e) => e.stopPropagation()}>
            <button className={styles.fechar} onClick={() => setTocando(null)}>Fechar</button>
            <div className={styles.player}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${tocando.yt}?autoplay=1&rel=0`}
                title={tocando.titulo}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <h3>{tocando.titulo}</h3>
            <p>{tocando.quem}</p>
          </div>
        </div>
      )}
    </div>
  );
}
