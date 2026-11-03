"use client";
// Primeira tela do "ateliê do NCI": uma parede de galeria com obras pequenas e etiquetas de roupa costuradas (viram e mostram o verso).
import { useRef } from "react";
import Link from "next/link";
import { Inter_Tight } from "next/font/google";
import { OBRAS, IDX } from "@/data/lessaObras";
import s from "@/styles/lessaSala.module.css";

const sans = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--ls-sans" });

const NA_PAREDE = [
  { k: "mojica", cls: "a" },
  { k: "muita-ostra", cls: "b" },
  { k: "antes-carnica", cls: "c" },
];

export default function LessaSala() {
  const raiz = useRef(null);
  const mexe = (e) => {
    const el = raiz.current; if (!el) return;
    el.style.setProperty("--px", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
    el.style.setProperty("--py", ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
  };
  return (
    <main ref={raiz} className={`${s.raiz} ${sans.variable}`} onPointerMove={mexe}>
      <div className={s.luz} aria-hidden="true" />
      <header className={s.cab}>
        <Link href="/artistas/lessa-gustavo">← voltar</Link>
        <span>nci media</span>
        <span>sala 01 / 04</span>
      </header>
      <div className={s.vinil}>
        <h1>lessa<br />gustavo</h1>
        <p>música, arte conceitual,<br />design e moda.<br />baixada fluminense.</p>
      </div>
      {NA_PAREDE.map(({ k, cls }) => {
        const o = OBRAS[IDX[k]];
        return (
          <figure key={k} className={`${s.obra} ${s[cls]}`}>
            <span className={s.foco} aria-hidden="true" />
            <div className={s.quadro}><img src={`/lg/${k}.jpg`} alt={`Capa de ${o.t}`} /><i /><i /></div>
            <figcaption className={s.tag} tabIndex={0}>
              <div className={s.giro}>
                <div className={`${s.face} ${s.frente}`}>
                  <b>{o.t.toLowerCase()}</b>
                  <span>{o.a} · {o.tipo.toLowerCase()}</span>
                  <span>{o.faixas.length} {o.faixas.length === 1 ? "faixa" : "faixas"}</span>
                </div>
                <div className={`${s.face} ${s.verso}`}>
                  <ol>{o.faixas.slice(0, 6).map((f) => <li key={f}>{f.toLowerCase()}</li>)}</ol>
                  {o.faixas.length > 6 ? <span>+ {o.faixas.length - 6}</span> : null}
                </div>
              </div>
            </figcaption>
          </figure>
        );
      })}
      <div className={s.piso} aria-hidden="true" />
    </main>
  );
}
