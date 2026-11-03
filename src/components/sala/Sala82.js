"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/sala82.module.css";

function fmt(n) {
  if (n == null) return "";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".", ",") + " mi";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",") + " mil";
  return String(n);
}

function Cartao({ item, cor, onAbrir, variante }) {
  const [semCapa, setSemCapa] = useState(false);
  const toca = !!item.yt;
  const cls = [styles.cartao, variante === "grande" ? styles.cartaoGrande : "", variante === "compacto" ? styles.cartaoCompacto : ""].join(" ");
  return (
    <button
      className={cls}
      style={{ "--cor": cor }}
      onClick={() => toca && onAbrir(item)}
      disabled={!toca}
      aria-label={`${item.titulo}, ${item.quem}`}
    >
      <span className={styles.capa}>
        {toca && !semCapa ? (
          <img src={`https://i.ytimg.com/vi/${item.yt}/hqdefault.jpg`} alt="" loading="lazy" onError={() => setSemCapa(true)} />
        ) : (
          <span className={styles.semCapa}>{toca ? "▶" : "em obra"}</span>
        )}
        {toca && <span className={styles.play}>▶</span>}
      </span>
      <span className={styles.meta}>
        <strong>{item.titulo}</strong>
        <em>{item.quem}</em>
        <small>
          {item.data}
          {item.papel ? ` · ${item.papel}` : ""}
          {item.views ? ` · ${fmt(item.views)} views` : ""}
        </small>
        {item.nota && <small className={styles.nota}>{item.nota}</small>}
      </span>
    </button>
  );
}

function Fase({ f, idx, onAbrir, setRef }) {
  const [dest, ...resto] = f.itens;
  const laterais = resto.slice(0, 3);
  const demais = resto.slice(3);
  return (
    <section className={styles.fase} style={{ "--cor": f.cor }} data-fase={f.id} ref={setRef}>
      <div className={styles.faseCabeca}>
        <span className={styles.faseNum}>{String(idx + 1).padStart(2, "0")}</span>
        <div>
          <p className={styles.faseAnos}>{f.anos}</p>
          <h3 className={styles.faseTitulo}>{f.titulo}</h3>
          <p className={styles.faseResumo}>{f.resumo}</p>
        </div>
      </div>

      <div className={styles.destaqueBloco}>
        <Cartao item={dest} cor={f.cor} variante="grande" onAbrir={onAbrir} />
        {laterais.length > 0 && (
          <div className={styles.laterais}>
            {laterais.map((it, k) => (
              <Cartao key={(it.yt || it.titulo) + k} item={it} cor={f.cor} variante="compacto" onAbrir={onAbrir} />
            ))}
          </div>
        )}
      </div>

      {demais.length > 0 && (
        <div className={styles.grade}>
          {demais.map((it, k) => (
            <Cartao key={(it.yt || it.titulo) + k} item={it} cor={f.cor} onAbrir={onAbrir} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Sala82({ identidades, faixas, fases, obras, totais }) {
  const [ativa, setAtiva] = useState(fases[0].id);
  const [tocando, setTocando] = useState(null);
  const refs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setAtiva(e.target.dataset.fase)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.values(refs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setTocando(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const ir = (id) => refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  const faseAtiva = fases.find((f) => f.id === ativa) || fases[0];
  const porFaixa = (id) => fases.filter((f) => f.faixa === id);
  let contador = 0;

  return (
    <div className={styles.sala} style={{ "--cor": faseAtiva.cor }}>
      <header className={styles.topo}>
        <Link href="/" className={styles.voltar}>← mapa</Link>
        <span className={styles.marca}>82</span>
        <span className={styles.sub}>82.jodo.com.br</span>
      </header>

      <nav className={styles.trilho} aria-label="Fases">
        {["som", "visual"].map((fx) => (
          <div key={fx} className={styles.trilhoGrupo}>
            <span className={styles.trilhoTitulo}>{faixas[fx].titulo}</span>
            {porFaixa(fx).map((f) => (
              <button
                key={f.id}
                onClick={() => ir(f.id)}
                className={`${styles.ponto} ${ativa === f.id ? styles.pontoAtivo : ""}`}
                style={{ "--cor": f.cor }}
              >
                <span className={styles.pontoAno}>{f.anos.split(" ")[0]}</span>
                <span className={styles.pontoNome}>{f.titulo}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <section className={styles.hero}>
        <p className={styles.kicker}>Lucas Negrelli · São Paulo</p>
        <h1 className={styles.titulo82}>82</h1>
        <div className={styles.nomes}>
          {identidades.map((i, k) => (
            <div key={i.nome} className={styles.nomeBloco}>
              <span className={styles.nomeAnos}>{i.anos}</span>
              <strong>{i.nome}</strong>
              <p>{i.texto}</p>
              {k < identidades.length - 1 && <span className={styles.seta}>→</span>}
            </div>
          ))}
        </div>
        <p className={styles.numeros}>
          {totais.videos} vídeos · {fmt(totais.views)} views · 2013 a hoje
        </p>
        <div className={styles.atalhos}>
          <button onClick={() => ir(porFaixa("som")[0].id)}>Som ↓</button>
          <button onClick={() => ir(porFaixa("visual")[0].id)}>Visual ↓</button>
          <button onClick={() => ir("obras")}>Obras à parte ↓</button>
        </div>
      </section>

      {["som", "visual"].map((fx) => (
        <div key={fx}>
          <div className={styles.faixaCabeca} style={{ "--cor": faixas[fx].cor }}>
            <h2>{faixas[fx].titulo}</h2>
            <p>{faixas[fx].subtitulo}</p>
          </div>
          {porFaixa(fx).map((f) => {
            const i = contador++;
            return <Fase key={f.id} f={f} idx={i} onAbrir={setTocando} setRef={(el) => (refs.current[f.id] = el)} />;
          })}
        </div>
      ))}

      <section className={styles.obras} data-fase="obras" ref={(el) => (refs.current.obras = el)}>
        <h2>Obras à parte</h2>
        <div className={styles.obrasGrade}>
          {obras.map((o) => {
            const Tag = o.href ? Link : "div";
            return (
              <Tag key={o.id} href={o.href} className={styles.obra} style={{ "--cor": o.cor }}>
                <span className={styles.obraTag}>{o.tag}</span>
                <strong>{o.titulo}</strong>
                <p>{o.texto}</p>
                {o.nota && <small>{o.nota}</small>}
              </Tag>
            );
          })}
        </div>
      </section>

      <footer className={styles.rodape}>
        <p>Trajetória do 82 a partir dos canais do YouTube. Fotos, sets e o arquivo do HD entram a seguir.</p>
      </footer>

      {tocando && (
        <div className={styles.modal} onClick={() => setTocando(null)} role="dialog" aria-modal="true">
          <div className={styles.modalCaixa} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalFechar} onClick={() => setTocando(null)}>Fechar</button>
            <div className={styles.player}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${tocando.yt}?autoplay=1&rel=0`}
                title={tocando.titulo}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <div className={styles.modalInfo}>
              <h3>{tocando.titulo}</h3>
              <p>{tocando.quem} · {tocando.data}</p>
              <a href={`https://www.youtube.com/watch?v=${tocando.yt}`} target="_blank" rel="noopener noreferrer">abrir no YouTube</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
