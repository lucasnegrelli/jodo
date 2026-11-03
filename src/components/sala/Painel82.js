"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/painel82.module.css";

const thumb = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

function milhar(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function curto(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".", ",") + " mi";
  if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(".", ",") + " mil";
  return String(n);
}

/* contador que sobe quando entra na tela */
function Contador({ valor, curtoFmt }) {
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
        const dur = 1400;
        const passo = (t) => {
          const p = Math.min(1, (t - ini) / dur);
          const ease = 1 - Math.pow(1 - p, 3);
          setN(valor * ease);
          if (p < 1) raf = requestAnimationFrame(passo);
        };
        raf = requestAnimationFrame(passo);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor]);
  return <span ref={ref}>{curtoFmt ? curto(n) : milhar(n)}</span>;
}

function Barras({ titulo, itens, cor, onClick, ativos }) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <div className={styles.grafico}>
      <h4>{titulo}</h4>
      <ul>
        {itens.map((i) => (
          <li key={i.rotulo}>
            <button
              onClick={() => onClick && onClick(i.rotulo)}
              className={ativos && ativos.includes(i.rotulo) ? styles.barraAtiva : ""}
              title={`${i.rotulo}: ${milhar(i.valor)} views · ${i.qtd} vídeos`}
            >
              <span className={styles.bRot}>{i.rotulo === "—" ? "a mapear" : i.rotulo}</span>
              <span className={styles.bTrilho}>
                <i style={{ width: `${(i.valor / max) * 100}%`, background: cor }} />
              </span>
              <span className={styles.bVal}>{curto(i.valor)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Painel82({ dados, onTocar }) {
  const { videos, artistas, totais } = dados;
  const [cats, setCats] = useState([]);
  const [ufs, setUfs] = useState([]);
  const [ano, setAno] = useState(null);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("views");
  const [visao, setVisao] = useState("mural");
  const [aberto, setAberto] = useState(null);

  const mapaArt = useMemo(() => new Map(artistas.map((a) => [a.nome, a])), [artistas]);
  const alterna = (lista, set, v) => set(lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return videos.filter((v) => {
      if (cats.length && !cats.includes(v.categoria)) return false;
      if (ufs.length && !v.artistas.some((a) => ufs.includes(mapaArt.get(a)?.uf || "—"))) return false;
      if (ano && v.ano !== ano) return false;
      if (q && !(v.titulo.toLowerCase().includes(q) || v.artistas.some((a) => a.toLowerCase().includes(q)))) return false;
      return true;
    });
  }, [videos, cats, ufs, ano, busca, mapaArt]);

  const contagem = (campo, base) => {
    const m = new Map();
    base.forEach((v) => {
      const k = campo(v);
      if (!m.has(k)) m.set(k, { rotulo: k, valor: 0, qtd: 0 });
      const o = m.get(k);
      o.valor += v.views;
      o.qtd += 1;
    });
    return [...m.values()];
  };

  const porCat = useMemo(() => contagem((v) => v.categoria, videos).sort((a, b) => b.valor - a.valor), [videos]);
  const porUf = useMemo(() => contagem((v) => v.uf, videos).sort((a, b) => b.valor - a.valor), [videos]);
  const porAno = useMemo(() => contagem((v) => v.ano, filtrados).sort((a, b) => a.rotulo.localeCompare(b.rotulo)), [filtrados]);
  const anos = useMemo(() => [...new Set(videos.map((v) => v.ano))].sort(), [videos]);

  const totalFiltrado = filtrados.reduce((s, v) => s + v.views, 0);

  // artistas a partir do conjunto filtrado
  const cards = useMemo(() => {
    const m = new Map();
    filtrados.forEach((v) => {
      v.artistas.forEach((a) => {
        const info = mapaArt.get(a);
        if (ufs.length && !ufs.includes(info?.uf || "—")) return;
        if (!m.has(a)) m.set(a, { nome: a, videos: [], views: 0, cidade: info?.cidade || "A mapear", uf: info?.uf || "—", cats: new Set() });
        const o = m.get(a);
        o.videos.push(v);
        o.views += v.views;
        o.cats.add(v.categoria);
      });
    });
    const arr = [...m.values()];
    if (ordem === "az") arr.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    else if (ordem === "qtd") arr.sort((a, b) => b.videos.length - a.videos.length || b.views - a.views);
    else if (ordem === "data") arr.sort((a, b) => Math.max(...b.videos.map((v) => +v.data.replace("-", ""))) - Math.max(...a.videos.map((v) => +v.data.replace("-", ""))));
    else arr.sort((a, b) => b.views - a.views);
    return arr;
  }, [filtrados, ordem, ufs, mapaArt]);

  const lista = useMemo(() => {
    const arr = [...filtrados];
    if (ordem === "az") arr.sort((a, b) => a.artistas[0].localeCompare(b.artistas[0], "pt-BR") || a.titulo.localeCompare(b.titulo, "pt-BR"));
    else if (ordem === "data") arr.sort((a, b) => b.data.localeCompare(a.data));
    else arr.sort((a, b) => b.views - a.views);
    return arr;
  }, [filtrados, ordem]);

  const limpar = () => {
    setCats([]);
    setUfs([]);
    setAno(null);
    setBusca("");
  };
  const filtrando = cats.length || ufs.length || ano || busca;

  const maxAno = Math.max(1, ...porAno.map((x) => x.valor));
  const Filtro = ({ titulo, itens, lista, set, rot }) => {
    const mx = Math.max(1, ...itens.map((i) => i.valor));
    return (
      <div className={styles.filtro}>
        <h4>{titulo}</h4>
        <ul>
          {itens.map((i) => (
            <li key={i.rotulo}>
              <button onClick={() => alterna(lista, set, i.rotulo)} className={lista.includes(i.rotulo) ? styles.sel : ""}>
                <i style={{ width: `${Math.max(2, (i.valor / mx) * 100)}%` }} />
                <span>{rot ? rot(i.rotulo) : i.rotulo}</span>
                <b>{i.qtd}</b>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section id="clipes" className={styles.painel}>
      <header className={styles.topo}>
        <p className={styles.etiqueta}>(root@krapnek82)-[~/painel] $ stat --views --tudo-que-filmou-e-editou</p>
        <div className={styles.hero}>
          <div className={styles.total}>
            <span className={styles.totalNum}><Contador valor={totais.views} /></span>
            <span className={styles.totalRot}>visualizações somadas</span>
          </div>
          <div className={styles.kpis}>
            <div><b><Contador valor={totais.videos} /></b><span>vídeos</span></div>
            <div><b><Contador valor={totais.artistas} /></b><span>artistas</span></div>
            <div><b><Contador valor={totais.cidades} /></b><span>cidades</span></div>
            <div><b><Contador valor={totais.ufs} /></b><span>estados</span></div>
            <div><b>{totais.anoInicio}–{totais.anoFim}</b><span>de corre</span></div>
          </div>
        </div>
        <p className={styles.sub}>
          Tudo em que meu nome está na ficha técnica ou na minha playlist By82: clipes, beattapes, lives, discos, séries e curtas.
          Clica num quadro pra assistir, ou filtra ao lado.
        </p>
      </header>

      <div className={styles.corpo}>
        <aside className={styles.lateral}>
          <input type="search" placeholder="buscar artista ou título" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar" />
          <div className={styles.filtro}>
            <h4>visualizações por ano</h4>
            <div className={styles.colunas}>
              {porAno.map((x) => (
                <button key={x.rotulo} onClick={() => setAno(ano === x.rotulo ? null : x.rotulo)} className={ano === x.rotulo ? styles.sel : ""} title={`${x.rotulo}: ${milhar(x.valor)} views · ${x.qtd} vídeos`}>
                  <i style={{ height: `${Math.max(4, (x.valor / maxAno) * 100)}%` }} />
                  <span>{x.rotulo.slice(2)}</span>
                </button>
              ))}
            </div>
          </div>
          <Filtro titulo="categoria" itens={porCat} lista={cats} set={setCats} />
          <Filtro titulo="estado" itens={porUf} lista={ufs} set={setUfs} rot={(u) => (u === "—" ? "a mapear" : u)} />
          {filtrando ? <button className={styles.limpar} onClick={limpar}>limpar filtros</button> : null}
        </aside>

        <div className={styles.principal}>
          <div className={styles.barra}>
            <div className={styles.alterna}>
              <button onClick={() => setVisao("mural")} className={visao === "mural" ? styles.on : ""}>mural</button>
              <button onClick={() => setVisao("artistas")} className={visao === "artistas" ? styles.on : ""}>por artista</button>
              <button onClick={() => setVisao("videos")} className={visao === "videos" ? styles.on : ""}>lista</button>
            </div>
            <label>
              ordem
              <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
                <option value="views">mais visualizações</option>
                <option value="az">A → Z</option>
                <option value="qtd">mais vídeos</option>
                <option value="data">mais recentes</option>
              </select>
            </label>
            <p className={styles.resumo}>
              <b>{milhar(filtrados.length)}</b> vídeos · <b>{curto(totalFiltrado)}</b> views
            </p>
          </div>

      {visao === "mural" ? (
        <ul className={styles.mural}>
          {lista.map((v, k) => {
            const maxV = lista[0] ? Math.max(1, lista[0].views) : 1;
            const r = v.views ? Math.log10(v.views + 1) / Math.log10(maxV + 1) : 0;
            const tam = r > 0.9 ? 4 : r > 0.78 ? 3 : r > 0.62 ? 2 : 1;
            return (
              <li key={v.yt} className={styles["t" + tam]}>
                <button onClick={() => onTocar({ yt: v.yt, titulo: v.titulo, quem: `${v.artistas.join(", ")} · ${v.data}` })} aria-label={v.titulo}>
                  <img src={thumb(v.yt)} alt="" loading="lazy" />
                  <span className={styles.tileInfo}>
                    <em>{v.categoria}</em>
                    <strong>{v.titulo}</strong>
                    <small>{v.artistas.join(", ")} · {v.ano}</small>
                    {v.papel && v.papel !== "imagem e edição" ? <small className={styles.papel}>{v.papel}</small> : null}
                    <b>{v.views ? curto(v.views) + " views" : ""}</b>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : visao === "artistas" ? (
        <ul className={styles.cards}>
          {cards.map((c) => {
            const abre = aberto === c.nome;
            const max = cards[0] ? Math.max(1, cards[0].views) : 1;
            return (
              <li key={c.nome} className={abre ? styles.cardAberto : ""} style={abre ? undefined : { flexGrow: Math.max(1, Math.round(Math.sqrt(c.views) / 12)), flexBasis: `${Math.max(150, Math.min(420, Math.sqrt(c.views) * 0.9))}px` }}>
                <button className={styles.card} onClick={() => setAberto(abre ? null : c.nome)} aria-expanded={abre}>
                  <strong>{c.nome}</strong>
                  <span className={styles.local}>{c.uf === "—" ? "a mapear" : `${c.cidade} · ${c.uf}`}</span>
                  <span className={styles.nums}>
                    <b>{c.videos.length}</b> vídeo{c.videos.length > 1 ? "s" : ""} · <b>{curto(c.views)}</b> views
                  </span>
                  <span className={styles.mini}><i style={{ width: `${Math.max(3, (c.views / max) * 100)}%` }} /></span>
                  <span className={styles.cats}>{[...c.cats].join(" · ")}</span>
                </button>
                {abre && (
                  <ul className={styles.videosDoArtista}>
                    {c.videos
                      .sort((a, b) => b.views - a.views)
                      .map((v) => (
                        <li key={v.yt}>
                          <button onClick={() => onTocar({ yt: v.yt, titulo: v.titulo, quem: `${v.artistas.join(", ")} · ${v.data}` })}>
                            <img src={thumb(v.yt)} alt="" width="120" height="68" loading="lazy" />
                            <span>
                              <strong>{v.titulo}</strong>
                              <small>{v.categoria} · {v.data}{v.views ? ` · ${curto(v.views)} views` : ""}</small>
                              {v.papel && v.papel !== "imagem e edição" ? <small className={styles.papel}>{v.papel}</small> : null}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className={styles.tabela}>
          {lista.map((v) => (
            <li key={v.yt}>
              <button onClick={() => onTocar({ yt: v.yt, titulo: v.titulo, quem: `${v.artistas.join(", ")} · ${v.data}` })}>
                <img src={thumb(v.yt)} alt="" width="120" height="68" loading="lazy" />
                <span className={styles.tTitulo}>
                  <strong>{v.titulo}</strong>
                  <small>{v.artistas.join(", ")}</small>
                </span>
                <span className={styles.tCat}>{v.categoria}</span>
                <span className={styles.tLocal}>{v.uf === "—" ? "a mapear" : `${v.cidade} · ${v.uf}`}</span>
                <span className={styles.tAno}>{v.ano}</span>
                <span className={styles.tViews}>{v.views ? curto(v.views) : "—"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
        </div>
      </div>
    </section>
  );
}
