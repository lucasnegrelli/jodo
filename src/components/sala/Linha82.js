"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/styles/linha82.module.css";
import { extras } from "@/data/videos82.generated";

function fmt(n) {
  if (n == null) return "";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".", ",") + " mi";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",") + " mil";
  return String(n);
}

// inclinação fixa por índice: colagem torta, mas igual no servidor e no cliente
const TORTO = [-1.4, 0.9, -0.5, 1.5, -1.0, 0.4, -1.8, 1.1];

export default function Linha82({ identidades, fases, obras, totais }) {
  const [filtro, setFiltro] = useState("tudo");
  const [aberto, setAberto] = useState(null);

  const itens = useMemo(() => {
    const curados = fases.flatMap((f) => f.itens.map((i) => ({ ...i, projeto: f.titulo, faixa: f.faixa })));
    const todos = [...curados, ...extras];
    return todos.sort((a, b) => String(a.data).localeCompare(String(b.data)));
  }, [fases]);

  const visiveis = itens.filter((i) => filtro === "tudo" || i.faixa === filtro);

  const grupos = useMemo(() => {
    const porAno = new Map();
    visiveis.forEach((i) => {
      const ano = String(i.data).slice(0, 4);
      if (!porAno.has(ano)) porAno.set(ano, []);
      porAno.get(ano).push(i);
    });
    identidades.forEach((n) => {
      const a = n.anos.slice(0, 4);
      if (!porAno.has(a)) porAno.set(a, []);
    });
    return [...porAno.keys()].sort().map((ano) => ({
      ano,
      nomes: identidades.filter((n) => n.anos.slice(0, 4) === ano),
      itens: porAno.get(ano),
    }));
  }, [visiveis, identidades]);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setAberto(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const abrir = (i) => (i.yt || i.img || i.texto) && setAberto(i);

  return (
    <div className={styles.pagina}>
      

      <main className={styles.miolo}>
        <section className={styles.abre}>
          <h1>
            <span className={styles.tag}>82</span>
          </h1>
          <p className={styles.nomesLinha}>
            {identidades.map((n, k) => (
              <span key={n.nome} className={styles.nomeChip}>
                {n.nome} <small>{n.anos.slice(0, 4)}</small>
                {k < identidades.length - 1 ? <i> ▸ </i> : null}
              </span>
            ))}
          </p>
          <p className={styles.intro}>
            Lucas Negrelli, São Paulo. Começou no pixo e no graffiti como SLIM, fez clipe, fez som, fez filme. Tudo que
            sobrou, em ordem. {itens.filter((i) => i.yt).length} vídeos.
          </p>
          <div className={styles.filtros}>
            {[
              ["tudo", "tudo"],
              ["som", "som meu"],
              ["visual", "visual p/ outros"],
              ["arquivo", "arquivo"],
            ].map(([id, rot]) => (
              <button key={id} onClick={() => setFiltro(id)} className={filtro === id ? styles.filtroAtivo : ""}>
                {rot}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.linha}>
          {grupos.map((g) => (
            <div key={g.ano} className={styles.ano}>
              <h2>
                <span>{g.ano}</span>
              </h2>
              <div className={styles.lista}>
                {g.nomes.map((n) => (
                  <p key={n.nome} className={styles.marco}>
                    <strong>{n.nome}</strong> {n.texto}
                  </p>
                ))}
                {g.itens.map((i, k) => (
                  <button
                    key={(i.yt || i.img || i.titulo) + k}
                    className={`${styles.item} ${i.img || i.texto ? styles.itemArquivo : ""}`}
                    style={{ "--giro": `${TORTO[(k + Number(g.ano)) % TORTO.length]}deg` }}
                    onClick={() => abrir(i)}
                    disabled={!(i.yt || i.img || i.texto)}
                  >
                    {i.yt ? (
                      <img
                        src={`https://i.ytimg.com/vi/${i.yt}/mqdefault.jpg`}
                        alt=""
                        width="160"
                        height="90"
                        loading="lazy"
                      />
                    ) : i.img ? (
                      <img
                        src={i.img}
                        alt={i.titulo}
                        width="160"
                        height="120"
                        loading="lazy"
                        className={i.pixel ? styles.pixel : ""}
                      />
                    ) : i.texto ? (
                      <span className={styles.recorte}>{i.texto}</span>
                    ) : (
                      <span className={styles.semImg}>sem vídeo</span>
                    )}
                    <span className={styles.txt}>
                      <strong>{i.titulo}</strong>
                      <span>{i.quem}</span>
                      <small>
                        {i.data} · <b className={styles["tag_" + i.faixa]}>{i.faixa}</b>
                        {i.faixa !== "arquivo" ? ` · ${i.projeto}` : ""}
                        {i.views ? ` · ${fmt(i.views)} views` : ""}
                      </small>
                      {i.nota && <small className={styles.nota}>{i.nota}</small>}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className={styles.fora}>
          <h2>
            <span>fora da linha</span>
          </h2>
          <ul>
            {obras.map((o) => (
              <li key={o.id}>
                {o.href ? <Link href={o.href}><strong>{o.titulo}</strong></Link> : <strong>{o.titulo}</strong>}
                <span> · {o.tag}</span>
                <p>{o.texto}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {aberto && (
        <div className={styles.modal} onClick={() => setAberto(null)} role="dialog" aria-modal="true">
          <div className={styles.caixa} onClick={(e) => e.stopPropagation()}>
            <button className={styles.fechar} onClick={() => setAberto(null)}>fechar [esc]</button>
            {aberto.yt ? (
              <div className={styles.player}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${aberto.yt}?autoplay=1&rel=0`}
                  title={aberto.titulo}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : aberto.img ? (
              <img src={aberto.img} alt={aberto.titulo} className={`${styles.imgGrande} ${aberto.pixel ? styles.pixel : ""}`} />
            ) : (
              <pre className={styles.texto}>{aberto.texto}</pre>
            )}
            <p className={styles.legenda}>
              <strong>{aberto.titulo}</strong> · {aberto.quem} · {aberto.data}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
