import SpuriEstrada from "@/components/sala/SpuriEstrada";
import { LINKS } from "@/data/romuloSpuri";

export const metadata = {
  title: "Rômulo Spuri | JODO",
  description:
    "Rômulo Spuri: produtor executivo, diretor criativo e label manager. Fundador da Straditerra, hoje Strads; idealizador do Coliseu Cultural; planejamento de carreira para artistas independentes. Alfenas e Nepomuceno, Sul de Minas.",
};

const ld = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://jodo.com.br/artistas/romulo-spuri#artista",
  name: "Rômulo Spuri",
  alternateName: ["Rômulo Spuri Barbosa"],
  jobTitle: ["Produtor executivo", "Diretor criativo", "Label manager", "Consultor de carreira"],
  homeLocation: { "@type": "Place", name: "Nepomuceno e Alfenas, MG, Brasil" },
  sameAs: [LINKS.ig, LINKS.strads, LINKS.youtube],
};

export default function PaginaSpuri() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SpuriEstrada />
    </>
  );
}
