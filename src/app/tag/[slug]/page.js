import styles from "@/styles/tagPage.module.css";
import ui from "@/styles/ui.module.css";

// services
import { getTags } from '@/services/tagsService';
import { getArchives } from '@/services/archivesService';
import { getArticles } from '@/services/articlesService';

// components
import Header from "@/components/_header";
import Footer from "@/components/_footer";
import CardHigh from "@/components/cardHigh";
import ArchiveHome from "@/components/archiveList";

export default async function Artigo({ params }) {
  const tag = params.slug;

  // Busca paralela para otimizar tempo
  const [footerTag, archives, articles] = await Promise.all([
    getTags(),
    getArchives(`tags=${tag}`),
    getArticles(`tags=${tag}`)
  ]);

  return (
    <div>
      <Header />

      <div className={styles.contentTitleTag}>
        <h2>#{tag}</h2>
      </div>

      <div>
        {articles?.map((item, index) => (
          <CardHigh item={item} key={index} />
        ))}
      </div>

      {archives?.length > 0 && (
        <div>
          <ArchiveHome archives={archives} />
        </div>
      )}

      <Footer tags={footerTag} />
    </div>
  );
}
