import VicenteTecido from "@/components/sala/VicenteTecido";
import { PERFIS } from "@/data/vicenteBlow";

export const metadata = {
  title: "VBLXW (Vicente Blow) | JODO",
  description:
    "Vicente Blow (VBLXW): rapper de Manaus, Bruxos do Norte. Ruído das Águas, Slip Like Time, A Vida É um Rio, Amazônia Pega Fogo.",
};

// dados estruturados (schema.org) para o buscador entender quem é o artista e como ele se liga aos outros
const ld = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": "https://jodo.com.br/artistas/vicente-blow#artista",
  name: "Vicente Blow",
  alternateName: ["VBLXW", "Vblow"],
  genre: ["Hip hop", "Rap"],
  areaServed: "Manaus, Amazonas, Brasil",
  memberOf: { "@type": "MusicGroup", name: "Bruxos do Norte" },
  sameAs: [PERFIS.spotify, PERFIS.deezer, PERFIS.instagram, PERFIS.soundcloudGrupo],
  album: [
    { "@type": "MusicAlbum", name: "Ruído das Águas", datePublished: "2025-02-28" },
    { "@type": "MusicAlbum", name: "Reflexo", datePublished: "2023-05-29" },
  ],
};

export default function PaginaVicente() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <VicenteTecido />
    </>
  );
}
