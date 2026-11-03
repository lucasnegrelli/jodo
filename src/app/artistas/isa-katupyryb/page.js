import IsaFolha from "@/components/sala/IsaFolha";
import { LINKS } from "@/data/isaKatupyryb";

export const metadata = {
  title: "Isa Katupyryb | JODO",
  description:
    "Isa Katupyryb: multiartivista, do cinema, do hip hop e do anti-etnocídio indígena. Mais de 60 videoclipes, Revista Parenteses, Prêmio Vidas Indígenas. Rumo à EICTV, em Cuba.",
};

// dados estruturados (schema.org) para o buscador entender quem é a artista
const ld = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://jodo.com.br/artistas/isa-katupyryb#artista",
  name: "Isa Katupyryb",
  alternateName: ["Isa Hansen"],
  jobTitle: ["Cineasta", "Diretore de fotografia", "Artista visual", "Escritore"],
  homeLocation: { "@type": "Place", name: "São Paulo, SP, Brasil" },
  sameAs: [LINKS.ig, LINKS.linktree, LINKS.vimeo, LINKS.parenteses],
};

export default function PaginaIsa() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <IsaFolha />
    </>
  );
}
