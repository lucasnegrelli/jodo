import styles from "@/styles/singleArticle.module.css";
import ui from "@/styles/ui.module.css";

// components
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Header from "@/components/_header";
import Footer from "@/components/_footer";
import Link from 'next/link';
import InfoArticle from '@/components/infoArticle';
import CardLow from "@/components/cardLow";
import MainRelease from "@/components/mainRelease";
import ArchiveHome from "@/components/archiveHome";
import CardHigh from "@/components/cardHigh";

// services
import { getUniqueArticle, getArticles } from '@/services/articlesService';
import { getArchives } from '@/services/archivesService';


export async function generateMetadata({ params }) {
  const [id] = params.slug.split('-');
  const article = await getUniqueArticle(id);

  return {
    title: article.title,
    description: article.description || article.content?.slice(0, 150) || 'Artigo publicado na Jodo',
    openGraph: {
      title: article.title,
      description: article.description || article.content?.slice(0, 150),
      url: `https://jodo.com.br/artigo/${params.slug}`,
      siteName: 'Jodo',
      images: [
        {
          url: article.img_featured,
          width: 1200,
          height: 630,
          alt: `Imagem de destaque do artigo "${article.title}"`,
        },
      ],
      locale: 'pt_BR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description || article.content?.slice(0, 150),
      images: [article.img_featured],
    },
  };
}

export default async function Artigo({ params }) {
  const [id] = params.slug.split('-');
  const article = await getUniqueArticle(id);
  const tags = article.tags.split(',');
  const firstTag = tags[0];
  const articlesList = await getArticles('size=6');
  const archives = await getArchives(`size=6&tags=${JSON.stringify(tags)}`);

  return (
    <div>
      <Header />
      <InfoArticle article={article} tags={tags} />
      <div 
        className={styles.mainImage}
        style={{ backgroundImage: `url(${article.img_featured})` }}
      />
      <div className={styles.mainArticleContent}>
        <div className={styles.contentArticle}>
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
      <div className={styles.mainArticleExtra}>
        <div className={ui["mt-100"]}>
          {articlesList.map((item, index) => (
            <CardHigh item={item} key={index} />
          ))}
        </div>
        <div className={ui["mt-100"]}>
          {archives?.length > 0 && (
            <div className={styles.mainPageCenter}>
              <ArchiveHome archives={archives} />
            </div>
          )}
        </div>
      </div>
      <Footer tags={tags} />
    </div>
  );
}
