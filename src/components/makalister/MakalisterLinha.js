"use client";
// Makalister · linha de produção. A imprensa diz que ele e o Beli Remour trabalham "em escala de linha de produção" (mais de 50 músicas juntos):
// aqui cada ano é uma esteira e os lançamentos passam por ela. Passar o cursor para a esteira, clicar numa capa abre o mundo do disco (mundos.js).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inter_Tight, Reenie_Beanie, Bowlby_One, Special_Elite, JetBrains_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LANCAMENTOS } from "@/data/makalisterLancamentos";
import { MUNDOS, MundoGenerico, TEMA_CLARO } from "./mundos";
import s from "@/styles/makalisterLinha.module.css";
import m from "@/styles/makalisterMergulho.module.css";

const ui = Inter_Tight({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--mk-ui" });
const mao = Reenie_Beanie({ subsets: ["latin"], weight: "400", variable: "--mk-mao" });
const grosso = Bowlby_One({ subsets: ["latin"], weight: "400", variable: "--mk-grosso" });
const maquina = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--mk-maquina" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mk-mono" });

const ehDisco = (l) => l.faixas.length > 0;
// singles que são faixas de um disco (mesma música, mesma capa) saem da fila para não repetir
const norm = (t) => t.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9à-ú ]/g, "").replace(/\s+/g, " ").trim();
const FAIXAS_DE_DISCO = new Set(LANCAMENTOS.filter(ehDisco).flatMap((l) => l.faixas.map(norm)));
const FILA = LANCAMENTOS.filter((l) => ehDisco(l) || !FAIXAS_DE_DISCO.has(norm(l.t)));
const dataBR = (iso) => iso.split("-").reverse().join(".");
// um ano por esteira, do mais novo ao mais velho; os discos são grandes e os avulsos pequenos
const ANOS = [...new Set(FILA.map((l) => l.d.slice(0, 4)))].sort((a, b) => b - a).map((ano, k) => {
  const itens = FILA.filter((l) => l.d.startsWith(ano)).slice().reverse(); // dentro do ano, janeiro primeiro
  const larg = itens.reduce((t, l) => t + (ehDisco(l) ? 230 : 140) + 26, 0);
  const copias = Math.max(1, Math.ceil(1700 / larg)); // enche a tela antes de duplicar para o laço sem emenda
  return { ano, itens, larg, copias, dur: Math.round((larg * copias) / (46 + (k % 4) * 9)), volta: k % 2 === 1 };
});
const TOTAL = FILA.length, N_DISCOS = FILA.filter(ehDisco).length, N_FAIXAS = LANCAMENTOS.filter(ehDisco).reduce((t, l) => t + l.faixas.length, 0), N_ANOS = new Date().getFullYear() - 2013 + 1;

export default function MakalisterLinha() {
  const raiz = useRef(null), dica = useRef(null);
  const [aberto, setAberto] = useState(null); // { l, x, y, on }
  const [claro, setClaro] = useState(false);

  const abre = useCallback((l, e) => {
    const r = e.currentTarget.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    document.body.style.overflow = "hidden"; setClaro(TEMA_CLARO.has(l.id));
    setAberto({ l, x, y, on: false }); requestAnimationFrame(() => requestAnimationFrame(() => setAberto({ l, x, y, on: true })));
  }, []);
  const fecha = useCallback(() => {
    setAberto((a) => (a ? { ...a, on: false } : a)); setClaro(false);
    setTimeout(() => { setAberto(null); document.body.style.overflow = ""; }, 850);
  }, []);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") fecha(); }; window.addEventListener("keydown", k); return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [fecha]);

  // a velocidade da rolagem entorta as esteiras (skew) e volta sozinha
  useEffect(() => {
    const el = raiz.current; let ult = window.scrollY, vel = 0, raf = 0, vivo = true;
    const frame = () => { if (!vivo) return; raf = requestAnimationFrame(frame); const y = window.scrollY, d = y - ult; ult = y; vel += (Math.max(-40, Math.min(40, d)) - vel) * 0.12; el.style.setProperty("--vel", (vel * 0.22).toFixed(2)); };
    frame(); return () => { vivo = false; cancelAnimationFrame(raf); };
  }, []);

  const Mundo = aberto ? MUNDOS[aberto.l.id] || MundoGenerico : null;
  return (
    <main ref={raiz} className={`${s.raiz} ${ui.variable} ${mao.variable} ${grosso.variable} ${maquina.variable} ${mono.variable}`}>
      <div className={s.grao} aria-hidden="true" />
      <VoltarJodo />
      <MarcaTopo nome="Makalister" cor="#1a1713" plano escala={1.05} />

      <header className={s.hero}>
        <img className={s.assinatura} src="/mk/assinatura.png" alt="Makalister" width="900" height="168" />
        <h1 className={s.titulo}>rapper e produtor<br />de São José, Santa Catarina</h1>
        <p className={s.conta}>Aqui os lançamentos passam em fila, ano por ano.</p>
        <p className={s.dica}>passe o cursor para parar a esteira · clique numa capa para abrir</p>
        <dl className={s.numeros}>
          <div><dt>lançamentos</dt><dd>{TOTAL}</dd></div>
          <div><dt>discos e EPs</dt><dd>{N_DISCOS}</dd></div>
          <div><dt>faixas nesses discos</dt><dd>{N_FAIXAS}</dd></div>
          <div><dt>anos de estrada, desde 2013</dt><dd>{N_ANOS}</dd></div>
        </dl>
      </header>

      <div className={s.fabrica}>
        {ANOS.map((a) => (
          <section key={a.ano} className={s.faixa} aria-label={`Lançamentos de ${a.ano}`} style={{ "--dur": `${a.dur}s`, "--dir": a.volta ? "reverse" : "normal" }}>
            <div className={s.placa}><b>{a.ano}</b><span>{a.itens.length} {a.itens.length > 1 ? "lançamentos" : "lançamento"}</span></div>
            <div className={s.esteira}>
              <ul className={s.trilho}>
                {Array.from({ length: a.copias * 2 }).flatMap((_, c) => a.itens.map((l) => ({ l, c }))).map(({ l, c }, i) => (
                  <li key={`${l.id}-${c}-${i}`} className={ehDisco(l) ? s.disco : s.avulso} aria-hidden={c >= a.copias ? "true" : undefined}>
                    <button type="button" className={s.cartao} onClick={(e) => abre(l, e)} tabIndex={c >= a.copias ? -1 : 0} aria-label={`${l.t}, ${l.d.slice(0, 4)}`}>
                      <img src={l.img} alt="" width={ehDisco(l) ? 230 : 140} height={ehDisco(l) ? 230 : 140} loading="lazy" decoding="async" draggable={false} />
                      <span className={s.etiqueta}><b>{l.t}</b><i>{dataBR(l.d)} · {l.tipo}</i></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <footer className={s.rodape}>
        <p>Dados: Deezer, SoundCloud e canal Almanak. Fim da linha.</p>
      </footer>

      {aberto ? (
        <div className={`${m.mundo} ${aberto.on ? m.on : ""}`} style={{ clipPath: aberto.on ? `circle(160vmax at ${aberto.x}px ${aberto.y}px)` : `circle(0px at ${aberto.x}px ${aberto.y}px)`, transition: "clip-path .85s cubic-bezier(.7,0,.2,1), opacity .3s" }} role="dialog" aria-label={aberto.l.t}>
          <button type="button" className={`${m.capas} ${claro ? m.capasClaro : ""}`} onClick={fecha}>← a linha</button>
          <Mundo l={aberto.l} />
        </div>
      ) : null}
    </main>
  );
}
