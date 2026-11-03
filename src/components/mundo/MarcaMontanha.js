"use client";

import { MONTANHA, MONTANHA_VIEWBOX } from "@/data/logoMontanha";
import styles from "@/styles/marcaMontanha.module.css";

/*
  Logo da JODO em código: cada traço da montanha é um caminho SVG.
  - Entrada: os traços se desenham da esquerda para a direita.
  - Parado: o contorno respira devagar e uma luz percorre os traços na cor do modo (--acento).
  - Passar o mouse: a luz acelera e acende, e um balãozinho credita a arte (Guilherme Valério, que desenhou a montanha).
*/
export default function MarcaMontanha() {
  return (
    <h1 className={styles.marca} aria-label="JODO. Arte criada por Guilherme Valério" tabIndex={0}>
      <svg viewBox={MONTANHA_VIEWBOX} aria-hidden="true" focusable="false">
        <g className={styles.base}>
          {MONTANHA.map((d, i) => (
            <path key={i} d={d} pathLength="1" style={{ "--i": i }} />
          ))}
        </g>
        <g className={styles.luz}>
          {MONTANHA.map((d, i) => (
            <path key={i} d={d} pathLength="1" style={{ "--i": i }} />
          ))}
        </g>
      </svg>
      <span className={styles.balao} aria-hidden="true">
        Arte criada por Guilherme Valério
      </span>
    </h1>
  );
}
