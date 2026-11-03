import Link from "next/link";
import styles from "@/styles/hub.module.css";
import { getArtistas } from "@/data/artistas";

export default function ArtistsShowcase({ showHeader = true }) {
  const artistas = getArtistas();

  return (
    <section className={styles.vitrine}>
      <div className={styles.wrap}>
        {showHeader && (
          <div className={styles.vitrineTopo}>
            <h2 className={styles.vitrineTitulo}>Artistas</h2>
            <Link href="/artistas" className={styles.vitrineLink}>
              ver todos
            </Link>
          </div>
        )}
        <div className={styles.grade}>
          {artistas.map((a) => (
            <Link
              key={a.slug}
              href={`/artistas/${a.slug}`}
              className={`${styles.cartao} ${a.slug === "phineas" ? styles.cartaoRoxo : ""}`}
              style={{ "--cor": a.cor, "--destaque": a.destaque }}
            >
              <div>
                <span className={styles.cartaoPapel}>{a.papel}</span>
                <h3 className={styles.cartaoNome}>{a.nome}</h3>
              </div>
              <p className={styles.cartaoResumo}>{a.resumo}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
