"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/mapaUG.module.css";

const thumb = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
const milhar = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
function curto(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".", ",") + " mi";
  if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(".", ",") + " mil";
  return String(n);
}
const COR_UF = { AM: "#7fcf6a", SP: "#f4f1e8", RJ: "#ff8a1f", MG: "#4d9bff", BA: "#ffe46a", SC: "#ff6fb5", PT: "#ff3b52", "—": "#9a9a92" };
const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
};

function Contador({ valor }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const ini = performance.now();
        const passo = (t) => {
          const p = Math.min(1, (t - ini) / 1500);
          setN(valor * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(passo);
        };
        raf = requestAnimationFrame(passo);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor]);
  return <span ref={ref}>{milhar(n)}</span>;
}

export default function MapaUnderground({ dados, onTocar, serie }) {
  const { videos, artistas, totais } = dados;
  const [cats, setCats] = useState([]);
  const [ano, setAno] = useState(null);
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(null);

  const info = useMemo(() => new Map(artistas.map((a) => [a.nome, a])), [artistas]);
  const lugarDe = (nome) => {
    const a = info.get(nome);
    if (!a || a.uf === "—") return "A mapear";
    if (a.uf === "PT") return "Portugal";
    return a.cidade;
  };

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return videos.filter((v) => {
      if (cats.length && !cats.includes(v.categoria)) return false;
      if (ano && v.ano !== ano) return false;
      if (q && !(v.titulo.toLowerCase().includes(q) || v.artistas.some((a) => a.toLowerCase().includes(q)))) return false;
      return true;
    });
  }, [videos, cats, ano, busca]);

  // paredes (cidades) -> lambes (artistas)
  const paredes = useMemo(() => {
    const porArtista = new Map();
    filtrados.forEach((v) =>
      v.artistas.forEach((a) => {
        const o = porArtista.get(a) || { nome: a, views: 0, videos: [] };
        o.views += v.views;
        o.videos.push(v);
        porArtista.set(a, o);
      })
    );
    const g = new Map();
    porArtista.forEach((o) => {
      o.videos.sort((x, y) => y.views - x.views);
      o.capa = o.videos[0].yt;
      const l = lugarDe(o.nome);
      const w = g.get(l) || { nome: l, uf: info.get(o.nome)?.uf || "—", itens: [], views: 0 };
      w.itens.push(o);
      w.views += o.views;
      g.set(l, w);
    });
    const arr = [...g.values()];
    arr.forEach((w) => w.itens.sort((a, b) => b.views - a.views));
    arr.sort((a, b) => (a.nome === "A mapear") - (b.nome === "A mapear") || b.views - a.views);
    return arr;
  }, [filtrados, info]); // eslint-disable-line

  const catsLista = useMemo(() => {
    const m = new Map();
    videos.forEach((v) => m.set(v.categoria, (m.get(v.categoria) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [videos]);
  const anos = useMemo(() => [...new Set(videos.map((v) => v.ano))].sort(), [videos]);
  const alterna = (l, set, x) => set(l.includes(x) ? l.filter((y) => y !== x) : [...l, x]);

  const maxViews = Math.max(1, ...paredes.flatMap((w) => w.itens.map((i) => i.views)));
  const sel = aberto ? paredes.flatMap((w) => w.itens).find((i) => i.nome === aberto) : null;
  const selInfo = sel ? info.get(sel.nome) : null;
  const colegas = useMemo(() => {
    if (!sel) return [];
    const m = new Map();
    sel.videos.forEach((v) => v.artistas.forEach((a) => a !== sel.nome && m.set(a, (m.get(a) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([n]) => n);
  }, [sel]);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setAberto(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <section id="mapa" className={styles.sec}>
      <header className={styles.topo}>
        <p className={styles.etiqueta}>o rolê todo, colado na parede</p>
        <h2>MAPA DO UNDERGROUND</h2>
        <div className={styles.hero}>
          <div className={styles.total}>
            <b><Contador valor={totais.views} /></b>
            <span>visualizações somadas</span>
          </div>
          <ul className={styles.kpis}>
            <li><b>{totais.videos}</b><span>vídeos</span></li>
            <li><b>{totais.artistas}</b><span>artistas</span></li>
            <li><b>{totais.cidades}</b><span>cidades</span></li>
            <li><b>{totais.anoInicio}–{totais.anoFim}</b><span>de corre</span></li>
          </ul>
        </div>
      </header>

      <div className={styles.controles}>
        <input type="search" placeholder="procurar na parede" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar" />
        <div className={styles.chips}>
          {catsLista.map(([c, n]) => (
            <button key={c} onClick={() => alterna(cats, setCats, c)} className={cats.includes(c) ? styles.on : ""}>
              {c} <i>{n}</i>
            </button>
          ))}
        </div>
        <div className={styles.chips}>
          {anos.map((a) => (
            <button key={a} onClick={() => setAno(ano === a ? null : a)} className={ano === a ? styles.on : ""}>{a}</button>
          ))}
        </div>
      </div>

      <div className={styles.muro}>
        {serie && serie.length > 0 && !busca && !cats.length && !ano && (
          <article className={styles.cartaz}>
            <h3>NO MEIO</h3>
            <p>série de 3 beattapes</p>
            <div>
              {serie.map((s, i) => (
                <button key={s.yt} onClick={() => onTocar({ yt: s.yt, titulo: s.titulo, quem: `No Meio · ${s.data}` })}>
                  <img src={thumb(s.yt)} alt="" loading="lazy" />
                  <span>ep.{i + 1}</span>
                </button>
              ))}
            </div>
          </article>
        )}

        {paredes.map((w) => (
          <section key={w.nome} className={styles.parede} style={{ "--cor": COR_UF[w.uf] || "#9a9a92" }}>
            <h3 style={{ transform: `rotate(${(hash(w.nome) - 0.5) * 3}deg)` }}>
              {w.nome}
              <small>{w.uf !== "—" && w.uf !== "PT" ? w.uf : ""} · {curto(w.views)}</small>
            </h3>
            <div className={styles.lambes}>
              {w.itens.map((i) => {
                const h = hash(i.nome);
                const tam = 108 + Math.round(Math.sqrt(i.views / maxViews) * 120);
                return (
                  <button
                    key={i.nome}
                    className={`${styles.lambe} ${aberto === i.nome ? styles.descolado : ""}`}
                    style={{ "--r": `${(h - 0.5) * 9}deg`, "--w": `${tam}px`, "--m": `${Math.round((hash(i.nome + "m") - 0.5) * 14)}px` }}
                    onClick={() => setAberto(aberto === i.nome ? null : i.nome)}
                    aria-label={`${i.nome}, ${i.videos.length} vídeos`}
                  >
                    <span className={styles.fita} />
                    <img src={thumb(i.capa)} alt="" loading="lazy" />
                    <strong>{i.nome}</strong>
                    <small>{i.videos.length} · {curto(i.views)}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        {paredes.length === 0 && <p className={styles.vazio}>nada colado com esses filtros.</p>}
      </div>

      {sel && (
        <div className={styles.fundoCartaz} onClick={() => setAberto(null)} role="dialog" aria-modal="true">
          <article className={styles.ficha} onClick={(e) => e.stopPropagation()}>
            <button className={styles.fecha} onClick={() => setAberto(null)} aria-label="Fechar">×</button>
            <h3>{sel.nome}</h3>
            <p className={styles.local}>
              {selInfo && selInfo.uf !== "—" ? `${selInfo.cidade}${selInfo.uf !== "PT" ? ` · ${selInfo.uf}` : ""}` : "lugar a mapear"} · {sel.videos.length} vídeos · {curto(sel.views)} views
            </p>
            {colegas.length > 0 && (
              <p className={styles.colegas}>
                junto com{" "}
                {colegas.map((n) => (
                  <button key={n} onClick={() => setAberto(n)}>{n}</button>
                ))}
              </p>
            )}
            <ul>
              {sel.videos.map((v) => (
                <li key={v.yt}>
                  <button onClick={() => onTocar({ yt: v.yt, titulo: v.titulo, quem: `${v.artistas.join(", ")} · ${v.data}` })}>
                    <img src={thumb(v.yt)} alt="" loading="lazy" />
                    <span>
                      <strong>{v.titulo}</strong>
                      <small>{v.categoria} · {v.ano}{v.views ? ` · ${curto(v.views)} views` : ""}</small>
                    </span>
                    <b>▶</b>
                  </button>
                </li>
              ))}
            </ul>
          </article>
        </div>
      )}
    </section>
  );
}
