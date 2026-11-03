import MargaridaSentidoUnico from "@/components/sala/MargaridaSentidoUnico";

export const metadata = {
  title: "Margarida The Cat | JODO",
  description:
    "Margarida The Cat: rock alternativo da Bela Vista, São Paulo. Do grunge ao rock psicodélico, composição e arranjo coletivos. Novo single: (Reality in a) Speeding Cloud.",
};

const ld = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": "https://jodo.com.br/artistas/margarida-the-cat#banda",
  name: "Margarida The Cat",
  genre: ["Rock alternativo", "Grunge", "Rock psicodélico"],
  foundingLocation: { "@type": "Place", name: "Bela Vista, São Paulo, SP, Brasil" },
  member: [
    { "@type": "OrganizationRole", roleName: "voz", member: { "@type": "Person", name: "Clara Sanches" } },
    { "@type": "OrganizationRole", roleName: "guitarra", member: { "@type": "Person", name: "Rafael Filizola" } },
    { "@type": "OrganizationRole", roleName: "guitarra", member: { "@type": "Person", name: "Malcolm Lincoln" } },
    { "@type": "OrganizationRole", roleName: "baixo", member: { "@type": "Person", name: "Joaquim Primi" } },
    { "@type": "OrganizationRole", roleName: "bateria", member: { "@type": "Person", name: "Silvio Freitas" } },
  ],
  sameAs: [
    "https://www.instagram.com/margarida_thecat/",
    "https://open.spotify.com/intl-pt/artist/31DECbEW8piJ1XXK1wPulZ",
    "https://linktr.ee/margaridathecat",
  ],
};

export default function PaginaMargarida() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <MargaridaSentidoUnico />
    </>
  );
}
