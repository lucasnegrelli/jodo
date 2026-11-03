import styles from "@/styles/hub.module.css";
import { manifesto } from "@/data/artistas";

export default function Manifesto() {
  return (
    <section className={styles.manifesto}>
      <div className={styles.wrap}>
        <p className={styles.manifestoKicker}>Porque ainda estamos aqui</p>
        <h2 className={styles.manifestoTexto}>
          Um encontro de <mark>almas artísticas</mark>, de São Paulo a Manaus.
        </h2>
        <p className={styles.manifestoNota}>{manifesto}</p>
      </div>
    </section>
  );
}
