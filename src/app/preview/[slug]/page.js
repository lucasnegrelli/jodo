import styles from "@/styles/singleArticle.module.css";
import ui from "@/styles/ui.module.css";

// components
import Header from "@/components/_header";
import Footer from "@/components/_footer"
import Link from 'next/link';
import InfoArticle from '@/components/infoArticle'

// service
import { getUniqueArticle } from '@/services/articlesService'

export default async function Artigo({ params }) {
  const article = await getUniqueArticle(parseInt(params.slug))
  console.log(article)
  const tags = article.tags?.split(',');
  return (
    <div>
        <Header/>
        <InfoArticle article={article} tags={tags}/>
        <div 
          className={styles.mainImage}
          style={{
            backgroundImage: `url(${article.img_featured})`,
          }}
        >
        </div>
        <div className={styles.mainArticleContent}>
            <div className={styles.contentArticle}>
            <div
                dangerouslySetInnerHTML={{ __html: article.content }}
            />
            </div>
        </div>
        <Footer tags={tags}/>
    </div>
  );
}