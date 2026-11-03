import OlxPad from "@/components/sala/OlxPad";
import { LINKS } from "@/data/olx";

export const metadata = {
  title: "Herick OLX | MC e produtor | JODO",
  description:
    "Herick OLX: MC, beatmaker e editor de áudio. Os EPs Teoria dos Versos, Conversas para Mesa de Bar e Marsúpio, produções e beats.",
};

const ld = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": "https://jodo.com.br/artistas/herick-olx#artista",
  name: "Herick OLX",
  genre: "Rap",
  sameAs: [LINKS.instagram, LINKS.youtube, LINKS.spotify, LINKS.soundcloud],
};

export default function PaginaOlx() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <OlxPad />
    </>
  );
}
