import DomrafaDrive from "@/components/sala/DomrafaDrive";

export const metadata = {
  title: "domrafa | JODO",
  description:
    "domrafa: produtor multimídia de São Paulo, '92. G-Funk Vol.2, G-Funk Vol.3&4, centro parte II, FAZ CHOVER e Rap Delivery.",
};

const ld = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": "https://jodo.com.br/artistas/domrafa#artista",
  name: "domrafa",
  description: "Produtor multimídia de São Paulo. Beats e mix.",
  sameAs: [
    "https://open.spotify.com/intl-pt/artist/7Bx2UBMSD7CGds4BduvWYz",
    "https://www.instagram.com/domrafa.wav/",
    "https://soundcloud.com/domrafa",
  ],
};

export default function PaginaDomrafa() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <DomrafaDrive />
    </>
  );
}
