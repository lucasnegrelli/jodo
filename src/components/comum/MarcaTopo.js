"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./marcaTopo.module.css";

/*
 * Cabeçalho das páginas de artista (mesmo comportamento em todas).
 * - A marca da JODO fica no centro do topo; no hover (ou no toque) vira o nome do artista (ou o `emblema` do artista, se houver:
 *   um desenho/logo próprio, por exemplo o gato da Margarida The Cat).
 * - Clicar nela rola a página para o topo. Voltar ao mapa é só o "← JODO" da esquerda (VoltarJodo).
 * - `fonte` (opcional): tipografia própria do artista para o nome (ex.: "var(--minha-fonte), serif"); `escala` ajusta o tamanho dela. Sem `fonte`, usa Anton.
 * - Se o artista participa de algo (coletivo, projeto), isso surge embaixo do nome, como um link para a outra página.
 *   extras: [{ rotulo: "Bruxos do Norte", href: "/artistas/bruxos-do-norte" }]
 */
export default function MarcaTopo({ nome, extras = [], cor, emblema = null, plano = false, aoSubir = null, fonte = null, escala = null }) {
  const [aberta, setAberta] = useState(false);
  const t = useRef(null);
  const olha = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 70));
    const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 60));
    el.style.setProperty("--px", dx.toFixed(2));
    el.style.setProperty("--py", dy.toFixed(2));
  };
  const sobe = () => {
    if (aoSubir) aoSubir();
    else scrollTo({ top: 0, behavior: "smooth" });
    // no toque não existe hover: o toque também abre os extras por um instante
    setAberta(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setAberta(false), 3500);
  };
  return (
    <header className={styles.topo} style={{ ...(cor ? { "--marca-cor": cor } : {}), ...(fonte ? { "--marca-fonte": fonte } : {}), ...(escala ? { "--marca-escala": escala } : {}) }}>
      <div className={`${styles.marca} ${aberta ? styles.aberta : ""} ${plano ? styles.plano : ""}`} onMouseMove={emblema ? olha : undefined}>
        <button type="button" className={styles.logo} onClick={sobe} aria-label={`${nome}: voltar ao topo da página`}>
          <i className={styles.montanha} />
          {emblema ? <b className={styles.emblema} aria-hidden="true">{emblema}</b> : <b className={styles.nome}>{nome}</b>}
        </button>
        {extras.length > 0 && (
          <nav className={styles.extras} aria-label="participações">
            {extras.map((e) => (
              <Link key={e.href} href={e.href} className={styles.extra}>
                <span>{e.rotulo}</span>
                <i aria-hidden="true">↗</i>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
