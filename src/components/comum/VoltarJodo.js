import Link from "next/link";
import styles from "./voltarJodo.module.css";

// link fixo, igual em todas as páginas de artista, para voltar ao mapa da JODO
export default function VoltarJodo() {
  return (
    <Link href="/" className={styles.voltar} aria-label="Voltar para a JODO (mapa)">
      <span aria-hidden="true">←</span> JODO
    </Link>
  );
}
