"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/portfolio82.module.css";

/*
  82: portfólio. Hub = índice explícito (ano, trabalho, o que é). Cada trabalho abre um ambiente com os assets dele.
  Só aparece vídeo da playlist By82 ou com o nome do 82 na ficha técnica.
*/

const SPOTIFY_KOS = "https://open.spotify.com/album/7685I632mcfgWdjccuBgJi";
const thumb = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

const KOS_FAIXAS = [
  { t: "Insanne", yt: "U38QKWmhGQY" },
  { t: "Dekalogo", yt: "vw73wsczwRs" },
  { t: "Folklore", yt: "HIMjVqnF-o4" },
  { t: "Kek Doom", yt: "TXI8L6Zowqo", clipe: true },
  { t: "*sekret*", yt: "MfjEAsWIzME" },
  { t: "Kaskarrupt", yt: "IQRRTZkNedc" },
  { t: "Smol Tow", yt: "OT_8fRWbl04" },
];
const INTRA_FAIXAS = [
  { t: "Sinais", yt: "I6cvxEs1otg", n: 1 },
  { t: "Aporte", yt: "IDpYmEUT5rY", n: 2 },
  { t: "Engrenagem", yt: "fB4r6Ggm1p4", n: 3 },
  { t: "Inverso", yt: "QwaWUmaIjq8", n: 4 },
  { t: "Manual", yt: "gcTz6i2nwII", n: 5 },
];
const HAXAN_FAIXAS = [
  { t: "Se Eu Rir", yt: "kAw_1UgNqVg", p: "Msor" },
  { t: "Realeza", yt: "TabOu0jvAb4", p: "Msor", clipe: true },
  { t: "Abençoa", yt: "DRkCBHQyi00", p: "Msor" },
  { t: "Vertigem", yt: "2o5OWoEM_tA", p: "HeadB", clipe: true },
  { t: "Coisas Transparentes", yt: "HGyUqv0Vda0", p: "Msor" },
];

const TRABALHOS = [
  { id: "kos", ano: "2026", titulo: "K-OS", desc: "EP · último drop · Spotify e 7 faixas em vídeo", tipo: "EP", img: "/82/drops/kos-capa.jpg" },
  { id: "intravenal", ano: "2026", titulo: "Intravenal", desc: "EP com PHINEA$ · 5 clipes", tipo: "EP", img: "/82/drops/intravenal-capa.webp" },
  { id: "haxan", ano: "2025", titulo: "Häxan", desc: "EP · beats do Msor e do HeadB · clipes de Realeza e Vertigem", tipo: "EP", img: "/82/drops/haxan-cartaz-frente.webp" },
  { id: "mundo-estranho", ano: "2023", titulo: "Mundo Estranho", desc: "Memória de Peixe, com o Cevas", tipo: "EP", img: thumb("z5jI9H2ZMks") },
  { id: "dog-house", ano: "2021", titulo: "Dog House", desc: "Mixtape produzida pelo DK, numa faixa só", tipo: "mixtape", img: thumb("louukt1mDTg") },
  { id: "altamente-meninos", ano: "2020–21", titulo: "Altamente82", desc: "Faixas com Sergio Estranho, 1cort3, Vblow e Ian Lecter", tipo: "faixas", img: thumb("gM1-pOvLtC4") },
  { id: "primeiros-sons", ano: "2019", titulo: "Primeiros sons", desc: "$OMBRA$ e escutandoocéu, feitos em Manaus", tipo: "faixas", img: thumb("RYqfqbxcpX8") },
];
const ANTIGOS = ["mundo-estranho", "dog-house", "altamente-meninos", "primeiros-sons"];

function fmt(n) {
  if (!n) return "";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".", ",") + " mi";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",") + " mil";
  return String(n);
}

/* parallax dentro de um contêiner */
function usePar(ref, ativo) {
  useEffect(() => {
    const raiz = ref.current;
    if (!raiz || !ativo) return;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alvo = { x: 0, y: 0 };
    const atual = { x: 0, y: 0 };
    let raf;
    const move = (e) => {
      alvo.x = e.clientX / window.innerWidth - 0.5;
      alvo.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", move, { passive: true });
    const loop = () => {
      const vh = window.innerHeight;
      atual.x += (alvo.x - atual.x) * 0.08;
      atual.y += (alvo.y - atual.y) * 0.08;
      raiz.querySelectorAll("[data-s],[data-m]").forEach((c) => {
        const par = c.parentElement.getBoundingClientRect();
        if (par.bottom < -300 || par.top > vh + 300) return;
        const s = parseFloat(c.dataset.s || "0");
        const m = parseFloat(c.dataset.m || "0");
        const r = parseFloat(c.dataset.r || "0");
        const sc = parseFloat(c.dataset.sc || "0");
        const centro = (par.top + par.height / 2 - vh / 2) / vh;
        const ty = reduz ? 0 : -centro * s * 400;
        const tx = reduz ? 0 : atual.x * m * -70;
        const my = reduz ? 0 : atual.y * m * -45;
        const esc = 1 + (reduz ? 0 : -Math.abs(centro) * sc + sc * 0.5);
        c.style.transform = `translate3d(${tx.toFixed(1)}px, ${(ty + my).toFixed(1)}px, 0) rotate(${(r * atual.x).toFixed(2)}deg) scale(${esc.toFixed(3)})`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, [ref, ativo]);
}

function Faixa({ f, onTocar, cls }) {
  return (
    <li>
      <button className={`${styles.faixa} ${cls || ""}`} onClick={() => onTocar({ yt: f.yt, titulo: f.t, quem: f.quem })}>
        <span className={styles.fNome}>{f.t}</span>
        {f.p && <small>prod. {f.p}</small>}
        {f.clipe && <em className={styles.tagClipe}>clipe</em>}
        <span className={styles.fPlay}>▶</span>
      </button>
    </li>
  );
}

/* ================= AMBIENTES ================= */

function MundoKos({ onTocar }) {
  return (
    <div className={styles.kos}>
      <section className={styles.kosAbre}>
        <div className={styles.kosFace}>
          <img data-m="0.5" data-sc="0.25" src="/82/drops/kos-feed-8.jpg" alt="" />
          <img data-m="1.1" data-sc="0.25" src="/82/drops/kos-feed-7.jpg" alt="" />
          <img data-m="0.8" data-sc="0.25" src="/82/drops/kos-feed-9.jpg" alt="" />
        </div>
        <h2 className={styles.kosTitulo}>K-OS</h2>
        <p className={styles.kosSub}>KRAPNEK82 · 2026 · último drop</p>
        <a className={styles.kosOuvir} href={SPOTIFY_KOS} target="_blank" rel="noopener noreferrer">ouvir no Spotify ↗</a>
      </section>
      <section className={styles.kosCorpo}>
        <div className={styles.kosRecortes}>
          {[1, 2, 3, 4, 5, 6].map((n, k) => (
            <img key={n} data-s={0.1 + (k % 3) * 0.12} data-m={0.3 + (k % 2) * 0.4} data-r={k % 2 ? 3 : -3} src={`/82/drops/kos-feed-${n}.jpg`} alt="" loading="lazy" />
          ))}
        </div>
        <ul className={styles.kosFaixas}>
          {KOS_FAIXAS.map((f) => (
            <Faixa key={f.yt} f={{ ...f, quem: "KRAPNEK82 · K-OS" }} onTocar={onTocar} cls={styles.fKos} />
          ))}
        </ul>
        <iframe className={styles.spotify} src="https://open.spotify.com/embed/album/7685I632mcfgWdjccuBgJi" title="K-OS no Spotify" loading="lazy" allow="encrypted-media" />
        <img data-s="0.05" data-m="0.3" className={styles.kosLogo} src="/82/drops/krapnek-logo.webp" alt="KRAPNEK" loading="lazy" />
      </section>
    </div>
  );
}

function MundoIntra({ onTocar }) {
  return (
    <div className={styles.intra}>
      <div className={styles.intraFundo}>
        <img data-s="0.25" src="/82/drops/intravenal-wallpaper.webp" alt="" />
      </div>
      <section className={styles.intraAbre}>
        <p className={styles.intraKicker}>EP · 2026 · com PHINEA$ · 5 faixas</p>
        <div className={styles.intraLetras}>
          <img data-s="0.2" data-m="0.9" src="/82/drops/intravenal-letra-1.jpg" alt="INT" />
          <img data-s="0.0" data-m="0.5" src="/82/drops/intravenal-letra-2.jpg" alt="RAVE" />
          <img data-s="-0.2" data-m="0.9" src="/82/drops/intravenal-letra-3.jpg" alt="NAL" />
        </div>
      </section>
      <section className={styles.intraCorpo}>
        <ol className={styles.intraFaixas}>
          {INTRA_FAIXAS.map((f) => (
            <li key={f.yt}>
              <button onClick={() => onTocar({ yt: f.yt, titulo: f.t, quem: "akaphineas e KRAPNEK82 · Intravenal" })}>
                <img src={thumb(f.yt)} alt="" width="320" height="180" loading="lazy" />
                <span><small>{String(f.n).padStart(2, "0")}</small>{f.t}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className={styles.intraDossie}>
          <img data-s="0.08" data-m="0.3" src="/82/drops/intravenal-capa.webp" alt="Intravenal, capa" loading="lazy" />
          <img data-s="-0.08" data-m="0.3" src="/82/drops/intravenal-contra.webp" alt="Intravenal, relatório" loading="lazy" />
        </div>
        <div className={styles.intraFotos}>
          {[1, 2, 3, 4, 5, 6, 7].map((n, k) => (
            <img key={n} data-s={0.06 + (k % 3) * 0.1} data-m="0.25" src={`/82/drops/intravenal-foto-${n}.jpg`} alt="" loading="lazy" />
          ))}
        </div>
      </section>
    </div>
  );
}

function MundoHaxan({ onTocar }) {
  const [parte, setParte] = useState("ep");
  const cols = [
    { v: 0.12, n: [1, 5] },
    { v: -0.06, n: [2, 6] },
    { v: 0.2, n: [3, 7] },
    { v: -0.12, n: [4, 8] },
  ];
  return (
    <div className={styles.haxan}>
      <nav className={styles.partes} aria-label="Partes do Häxan">
        <button className={parte === "ep" ? styles.parteAtiva : ""} onClick={() => setParte("ep")}>Häxan · o EP</button>
        <button className={parte === "realeza" ? styles.parteAtiva : ""} onClick={() => setParte("realeza")}>Realeza · o clipe</button>
      </nav>

      {parte === "ep" && (
        <>
          <section className={styles.haxanAbre}>
            <div className={styles.haxanPalco}>
              <img data-s="0.05" data-m="0.5" src="/82/drops/haxan-ondas.png" alt="" />
              <img data-s="0.1" data-m="1.1" data-r="3" src="/82/drops/haxan-vermelho.png" alt="" />
              <img data-s="0.16" data-m="0.9" data-r="-4" src="/82/drops/haxan-verde.png" alt="" />
              <img data-s="0.08" data-m="1.4" data-r="2" src="/82/drops/haxan-azul.png" alt="" />
              <img data-s="-0.03" data-m="0.25" src="/82/drops/haxan-personagem.webp" alt="82, personagem do Häxan" />
            </div>
            <p className={styles.haxanMeta}>HÄXAN · EP · 2025 · KRAPNEK82</p>
          </section>
          <section className={styles.haxanEscuro}>
            <div className={styles.haxanCartaz}>
              <img data-s="0.2" src="/82/drops/haxan-cartaz-frente.webp" alt="" />
            </div>
            <div className={styles.haxanMiolo}>
              <img className={styles.haxanTitulo} src="/82/drops/haxan-titulo.webp" alt="Häxan" />
              <p className={styles.haxanNota}>Todas as faixas produzidas pelo Msor, menos Vertigem, do HeadB.</p>
              <ol>
                {HAXAN_FAIXAS.map((f) => (
                  <Faixa key={f.yt} f={{ ...f, quem: `KRAPNEK82 · Häxan · prod. ${f.p}` }} onTocar={onTocar} cls={styles.fHaxan} />
                ))}
              </ol>
            </div>
          </section>
        </>
      )}

      {parte === "realeza" && (
        <div className={styles.real}>
          <section className={styles.realAbre}>
            <p className={styles.realKicker}>faixa 2 do Häxan · clipe · prod. Msor</p>
            <h2>Realeza</h2>
            <div className={styles.realPlayer}>
              <iframe src="https://www.youtube-nocookie.com/embed/TabOu0jvAb4?rel=0" title="Realeza, clipe" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            </div>
            <p className={styles.realNota}>Os painéis abaixo são os assets do clipe: o “processo corrosivo”.</p>
          </section>
          <div className={styles.realGrade}>
            {cols.map((c, i) => (
              <div key={i} className={styles.realCol}>
                {c.n.map((n) => (
                  <img key={n} data-s={c.v} data-m="0.2" src={`/82/drops/zine-${n}.jpg`} alt={`Realeza, painel ${n}`} loading="lazy" />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MundoClipes({ grupos, inicial, onTocar }) {
  const [aberto, setAberto] = useState(inicial || grupos[0]?.artista || null);
  const g = grupos.find((x) => x.artista === aberto);
  return (
    <div className={styles.clip}>
      <header className={styles.clipTopo}>
        <h2>Clipes que filmei e editei</h2>
        <p>Cada artista com os vídeos em que o meu nome está na ficha ou na minha playlist By82.</p>
      </header>
      <div className={styles.clipCorpo}>
        <ul className={styles.clipArtistas}>
          {grupos.map((x) => (
            <li key={x.artista}>
              <button onClick={() => setAberto(x.artista)} className={aberto === x.artista ? styles.clipAtivo : ""}>
                <strong>{x.artista}</strong>
                <span>{x.itens.length}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.clipLista}>
          {g && (
            <>
              <h3>{g.artista}</h3>
              <ul>
                {g.itens.map((i, k) => (
                  <li key={i.yt + k}>
                    <button onClick={() => onTocar({ yt: i.yt, titulo: i.titulo, quem: `${i.quem} · ${i.data}` })}>
                      <img src={thumb(i.yt)} alt="" width="160" height="90" loading="lazy" />
                      <span>
                        <strong>{i.titulo}</strong>
                        <small>{i.data}{i.views ? ` · ${fmt(i.views)} views` : ""}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MundoLista({ fase, onTocar }) {
  if (!fase) return null;
  return (
    <div className={styles.disc}>
      <header className={styles.clipTopo}>
        <p className={styles.discAnos}>{fase.anos}</p>
        <h2>{fase.titulo}</h2>
        <p>{fase.resumo}</p>
      </header>
      <section className={styles.discBloco}>
        <ul>
          {fase.itens.map((i) => (
            <li key={i.yt}>
              <button onClick={() => onTocar({ yt: i.yt, titulo: i.titulo, quem: i.quem })}>
                <img src={thumb(i.yt)} alt="" width="160" height="90" loading="lazy" />
                <span>
                  <strong>{i.titulo}</strong>
                  <small>{i.quem}</small>
                  {i.nota && <em>{i.nota}</em>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ================= PÁGINA ================= */

export default function Portfolio82({ identidades, grupos, discos, totalClipes, totalArtistas }) {
  const [mundo, setMundo] = useState(null); // {id, artista?}
  const [tocando, setTocando] = useState(null);
  const [hover, setHover] = useState(null);
  const heroRef = useRef(null);
  const mundoRef = useRef(null);
  const prevRef = useRef(null);

  usePar(heroRef, !mundo);
  usePar(mundoRef, !!mundo);

  useEffect(() => {
    const k = (e) => {
      if (e.key !== "Escape") return;
      if (tocando) setTocando(null);
      else if (mundo) setMundo(null);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [tocando, mundo]);

  useEffect(() => {
    if (mundoRef.current) mundoRef.current.scrollTop = 0;
  }, [mundo]);

  // a imagem do trabalho segue o cursor no índice
  const seguir = (e) => {
    const el = prevRef.current;
    if (el) el.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 120}px, 0)`;
  };

  const atual = TRABALHOS.find((t) => t.id === mundo?.id);
  const hoverT = TRABALHOS.find((t) => t.id === hover);

  return (
    <div className={styles.raiz}>
      <div ref={heroRef} className={styles.hub} aria-hidden={!!mundo} onPointerMove={seguir}>
        <header className={styles.topo}>
          <Link href="/">← mapa</Link>
          <Link href="/artistas/rap-delivery">Rap Delivery →</Link>
          <span>82.jodo.com.br</span>
        </header>

        <section className={styles.hero}>
          <div className={styles.palco}>
            <img data-s="0.05" data-m="0.5" src="/82/drops/haxan-ondas.png" alt="" />
            <img data-s="0.1" data-m="1.1" data-r="3" src="/82/drops/haxan-vermelho.png" alt="" />
            <img data-s="0.16" data-m="0.9" data-r="-4" src="/82/drops/haxan-verde.png" alt="" />
            <img data-s="0.08" data-m="1.4" data-r="2" src="/82/drops/haxan-azul.png" alt="" />
            <img data-s="-0.03" data-m="0.25" src="/82/drops/haxan-personagem.webp" alt="82, o personagem de capuz e óculos azuis" />
          </div>
          <div className={styles.heroTexto}>
            <ul className={styles.linhagem}>
              {identidades.map((n) => (
                <li key={n.nome}><span>{n.anos.slice(0, 4)}</span><strong>{n.nome}</strong></li>
              ))}
            </ul>
            <div className={styles.heroDir}>
              <h1>82</h1>
              <p>Lucas Negrelli · São Paulo</p>
            </div>
          </div>
          <p className={styles.rolar}>trabalhos ↓</p>
        </section>

        <section className={styles.indice}>
          <div className={styles.indiceBloco}>
            <h2>Trabalhos</h2>
            <p className={styles.indiceSub}>O que lancei como 82 e KRAPNEK82. Clique para entrar.</p>
            <ol className={styles.linhas}>
              {TRABALHOS.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setMundo({ id: t.id })}
                    onPointerEnter={() => setHover(t.id)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(t.id)}
                    onBlur={() => setHover(null)}
                  >
                    <span className={styles.lAno}>{t.ano}</span>
                    <span className={styles.lTitulo}>{t.titulo}</span>
                    <span className={styles.lDesc}>{t.desc}</span>
                    <span className={styles.lTipo}>{t.tipo}</span>
                    <span className={styles.lSeta}>→</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.indiceBloco}>
            <h2>Clipes que filmei e editei</h2>
            <p className={styles.indiceSub}>{totalClipes} vídeos, {totalArtistas} artistas. Escolha um artista.</p>
            <ul className={styles.chips}>
              {grupos.map((g) => (
                <li key={g.artista}>
                  <button onClick={() => setMundo({ id: "clipes", artista: g.artista })}>
                    {g.artista}
                    <span>{g.itens.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div ref={prevRef} className={`${styles.previa} ${hoverT ? styles.previaOn : ""}`} aria-hidden="true">
          {hoverT && <img src={hoverT.img} alt="" />}
        </div>
      </div>

      {mundo && (
        <div ref={mundoRef} className={`${styles.mundo} ${styles["m_" + mundo.id.replace(/-/g, "_")]}`} role="region" aria-label={atual?.titulo || "Clipes"}>
          <button className={styles.voltarHub} onClick={() => setMundo(null)}>← 82</button>
          {mundo.id === "kos" && <MundoKos onTocar={setTocando} />}
          {mundo.id === "intravenal" && <MundoIntra onTocar={setTocando} />}
          {mundo.id === "haxan" && <MundoHaxan onTocar={setTocando} />}
          {mundo.id === "clipes" && <MundoClipes grupos={grupos} inicial={mundo.artista} onTocar={setTocando} />}
          {ANTIGOS.includes(mundo.id) && <MundoLista fase={discos.find((d) => d.id === mundo.id)} onTocar={setTocando} />}
        </div>
      )}

      {tocando && (
        <div className={styles.modal} onClick={() => setTocando(null)} role="dialog" aria-modal="true">
          <div className={styles.caixa} onClick={(e) => e.stopPropagation()}>
            <button className={styles.fechar} onClick={() => setTocando(null)}>fechar</button>
            <div className={styles.player}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${tocando.yt}?autoplay=1&rel=0`}
                title={tocando.titulo}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <p className={styles.legenda}><strong>{tocando.titulo}</strong> · {tocando.quem}</p>
          </div>
        </div>
      )}
    </div>
  );
}
