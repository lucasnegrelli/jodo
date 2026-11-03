import Link from "next/link";
import { notFound } from "next/navigation";
import "@/styles/globals.css";
import styles from "@/styles/hub.module.css";
import ui from "@/styles/ui.module.css";
import Header from "@/components/_header";
import Footer from "@/components/_footer";
import { getArtistas, getArtista } from "@/data/artistas";
import { getTags } from "@/services/tagsService";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getArtistas().map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }) {
  const a = getArtista(params.slug);
  return { title: a ? `${a.nome} | JODO` : "Artista | JODO" };
}

export default async function ArtistaPage({ params }) {
  const artista = getArtista(params.slug);
  if (!artista) notFound();
  const tags = await getTags();

  return (
    <main>
      <div className={ui["mt-40"]}>
        <Header />
      </div>
      <section
        className={styles.perfil}
        style={{ "--cor": artista.cor, "--destaque": artista.destaque }}
      >
        <div className={styles.wrap}>
          <Link href="/artistas" className={styles.perfilVoltar}>
            ← artistas
          </Link>
          <div className={styles.perfilFaixa} />
          <h1 className={styles.perfilNome}>{artista.nome}</h1>
          <p className={styles.perfilPapel}>{artista.papel}</p>
          <p className={styles.perfilResumo}>{artista.resumo}</p>

          {artista.redes?.length > 0 && (
            <div className={styles.perfilLinks}>
              {artista.redes.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.perfilLink}
                >
                  {r.rotulo}
                </a>
              ))}
            </div>
          )}

          {artista.integrantes?.length > 0 && (
            <div className={styles.perfilIntegrantes}>
              <h3>Integrantes</h3>
              <div className={styles.perfilLinks}>
                {artista.integrantes.map((i) => (
                  <a
                    key={i.url}
                    href={i.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.perfilLink}
                  >
                    {i.nome}
                  </a>
                ))}
              </div>
            </div>
          )}

          <p className={styles.aviso}>
            Portfólio completo em construção. Em breve em {artista.subdominio.replace("https://", "")}.
          </p>
        </div>
      </section>
      <Footer tags={tags} />
    </main>
  );
}
