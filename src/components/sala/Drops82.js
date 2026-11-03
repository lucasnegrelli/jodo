"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/drops82.module.css";

/*
  DROPS DO 82, parallax.
  Todo o visual vem dos assets do próprio drop Häxan (capa quadrada, cartaz escuro com letra gótica,
  zine da Realeza). Camadas separadas do personagem e das marcas (ondas, X, ângulo, arcos).
*/

const FAIXAS = [
  { n: "1", t: "Se Eu Rir", yt: "kAw_1UgNqVg" },
  { n: "2", t: "Realeza", yt: "TabOu0jvAb4", p: "prod. Msor" },
  { n: "3", t: "Abençoa", yt: "DRkCBHQyi00" },
  { n: "4", t: "Vertigem", yt: "2o5OWoEM_tA", p: "prod. HeadB" },
  { n: "5", t: "Coisas Transparentes", yt: "HGyUqv0Vda0" },
];

const ZINE_COLS = [
  { v: 0.12, itens: [1, 5] },
  { v: -0.06, itens: [2, 6] },
  { v: 0.2, itens: [3, 7] },
  { v: -0.12, itens: [4, 8] },
];

export default function Drops82({ nomes }) {
  const raiz = useRef(null);
  const [tocando, setTocando] = useState(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
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
      const camadas = el.querySelectorAll("[data-par]");
      camadas.forEach((c) => {
        const s = parseFloat(c.dataset.s || "0"); // velocidade de rolagem
        const m = parseFloat(c.dataset.m || "0"); // sensibilidade ao mouse
        const r = c.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const centro = r.top + r.height / 2 - vh / 2;
        const ty = reduz ? 0 : -centro * s;
        const tx = reduz ? 0 : atual.x * m * -60;
        const my = reduz ? 0 : atual.y * m * -40;
        const rot = parseFloat(c.dataset.r || "0") * (reduz ? 0 : atual.x);
        c.style.transform = `translate3d(${tx.toFixed(1)}px, ${(ty + my).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setTocando(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <div ref={raiz} className={styles.raiz}>
      <header className={styles.topo}>
        <Link href="/">← mapa</Link>
        <span>82.jodo.com.br</span>
      </header>

      {/* ========== CAPÍTULO 0: a capa viva ========== */}
      <section className={styles.hero}>
        <div className={styles.palco}>
          <img data-par data-s="0.05" data-m="0.5" className={styles.camada} style={{ "--z": 1 }} src="/82/drops/haxan-ondas.png" alt="" />
          <img data-par data-s="0.1" data-m="1.1" data-r="3" className={styles.camada} style={{ "--z": 1 }} src="/82/drops/haxan-vermelho.png" alt="" />
          <img data-par data-s="0.16" data-m="0.9" data-r="-4" className={styles.camada} style={{ "--z": 1 }} src="/82/drops/haxan-verde.png" alt="" />
          <img data-par data-s="0.08" data-m="1.4" data-r="2" className={styles.camada} style={{ "--z": 1 }} src="/82/drops/haxan-azul.png" alt="" />
          <img data-par data-s="-0.03" data-m="0.25" className={styles.camada} style={{ "--z": 2 }} src="/82/drops/haxan-personagem.webp" alt="82, o personagem de capuz e óculos azuis" />
        </div>
        <div className={styles.heroTexto}>
          <h1 className={styles.nome82}>82</h1>
          <ul className={styles.linhagem}>
            {nomes.map((n) => (
              <li key={n.nome}>
                <span>{n.anos.slice(0, 4)}</span>
                <strong>{n.nome}</strong>
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.rolar}>rolar</p>
      </section>

      {/* ========== CAPÍTULO 1: Häxan, o cartaz escuro ========== */}
      <section className={styles.haxan}>
        <div className={styles.cartazFundo}>
          <img data-par data-s="0.22" src="/82/drops/haxan-cartaz-frente.webp" alt="" />
        </div>
        <div className={styles.haxanMiolo}>
          <p className={styles.capKicker}>EP · 2025 · beats Msor e HeadB</p>
          <h2 className={styles.goticoTitulo}>Häxan</h2>
          <ol className={styles.faixas}>
            {FAIXAS.map((f) => (
              <li key={f.yt}>
                <button onClick={() => setTocando({ yt: f.yt, titulo: f.t, quem: "KRAPNEK82 · Häxan" })}>
                  <span className={styles.fn}>{f.n}</span>
                  <span className={styles.ft}>{f.t}</span>
                  {f.p && <small>{f.p}</small>}
                  <span className={styles.fp}>▶</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <img data-par data-s="-0.1" data-m="0.6" className={styles.gnomo} src="/82/drops/haxan-personagem.webp" alt="" />
      </section>

      {/* ========== CAPÍTULO 2: dois negativos ========== */}
      <section className={styles.negativos}>
        <img data-par data-s="0.06" data-m="0.3" src="/82/drops/haxan-capa-vermelha.webp" alt="Häxan, versão vermelha" />
        <img data-par data-s="-0.06" data-m="0.3" src="/82/drops/haxan-capa-ciano.webp" alt="Häxan, versão ciano" />
      </section>

      {/* ========== CAPÍTULO 3: zine da Realeza ========== */}
      <section className={styles.zine}>
        <div className={styles.zineTitulo}>
          <p className={styles.capKicker}>zine · Realeza</p>
          <h2>processo corrosivo</h2>
        </div>
        <div className={styles.zineGrade}>
          {ZINE_COLS.map((c, i) => (
            <div key={i} className={styles.zineCol}>
              {c.itens.map((n) => (
                <img key={n} data-par data-s={c.v} data-m="0.2" src={`/82/drops/zine-${n}.jpg`} alt={`Zine Realeza, painel ${n}`} loading="lazy" />
              ))}
            </div>
          ))}
        </div>
      </section>

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
