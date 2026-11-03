import moment from 'moment';
import styles from "@/styles/singleArticle.module.css";
import ui from "@/styles/ui.module.css";


// components
import Link from 'next/link';


export default async function infoArticle({ article, tags }) {
  return (
    <div>
        <div className={styles.mainArticle}>
          <div className={styles.headerArticle}>
            <div className={styles.articleTitle}>
              <h1>{article.title}</h1>
             {article.description && <p>{article.description}</p> }
            </div>
            <div className={styles.infoHearderArticle}>
              <div className={ui.profileSmall}>
                  <div><img src={article.photo} width={40} height={40} alt={article.name}/></div>
                  <div>
                    <p>{article.name}</p>
                    <span>Criado em: {moment(article.created_at).format('DD/MM/YYYY')}</span>
                  </div>
              </div>
              <div className={styles.tagsArticle}>
                <nav>
                {tags.map((tag, index) => (
                  <li key={index}>
                    <Link href={`/tag/${encodeURIComponent(tag)}`}>#{tag}</Link>
                  </li>
                ))}
                </nav>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}