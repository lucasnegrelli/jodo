import "@/styles/globals.css";
import ui from "@/styles/ui.module.css";
import Header from "@/components/_header";
import Footer from "@/components/_footer";
import ArtistsShowcase from "@/components/artistsShowcase";
import { getTags } from "@/services/tagsService";

export const metadata = {
  title: "Artistas | JODO",
  description: "Quem faz a JODO: artistas, grupos e coletivos do JODOVERSO.",
};

export const dynamic = "force-dynamic";

export default async function ArtistasPage() {
  const tags = await getTags();
  return (
    <main>
      <div className={ui["mt-40"]}>
        <Header />
      </div>
      <ArtistsShowcase />
      <Footer tags={tags} />
    </main>
  );
}
