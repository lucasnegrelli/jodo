import RogFilme from "@/components/sala/RogFilme";
import { LINKS } from "@/data/rogdog";

export const metadata = {
  title: "Rogério Soares (Rog) | Videomaker | JODO",
  description:
    "Rogério Soares, o Rog: videomaker em Lisboa. Direção, fotografia, edição e finalização de publicidade, institucionais, videoclipes e documentários, desde 2015.",
};

const ld = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://jodo.com.br/artistas/rogdog#pessoa",
  name: "Rogério Soares",
  alternateName: ["Rog", "RogDog"],
  jobTitle: ["Videomaker", "Diretor", "Editor"],
  homeLocation: { "@type": "Place", name: "Lisboa, Portugal" },
  sameAs: [LINKS.vimeo, LINKS.instagram],
};

export default function PaginaRog() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <RogFilme />
    </>
  );
}
