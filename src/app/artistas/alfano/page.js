import AlfanoCabo from "@/components/sala/AlfanoCabo";
import { LINKS } from "@/data/alfano";

export const metadata = {
  title: "Alfano | MC da Zona Sul de São Paulo | JODO",
  description:
    "Alfano, MC e multi-artista independente da Zona Sul de São Paulo. Quase sete anos de carreira, clipes, lyric videos e parcerias com PHINEA$ e o coletivo Inadequados Gang.",
};

const ld = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": "https://jodo.com.br/artistas/alfano#artista",
  name: "Alfano",
  genre: "Rap",
  homeLocation: { "@type": "Place", name: "Zona Sul, São Paulo, Brasil" },
  sameAs: [LINKS.instagram, LINKS.soundcloud, LINKS.spotify, LINKS.youtube],
};

export default function PaginaAlfano() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <AlfanoCabo />
    </>
  );
}
