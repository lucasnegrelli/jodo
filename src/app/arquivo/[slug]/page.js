import styles from "@/styles/singleArticle.module.css";
import ui from "@/styles/ui.module.css";

// components
import Header from "@/components/_header";
import Footer from "@/components/_footer"
import Link from 'next/link';
import ArchiveHome from "@/components/archiveHome"

// service
import { getUniqueArchive } from '@/services/archivesService'
import { getArchives } from '@/services/archivesService'

export default async function Arquivo({ params }) {
  const [id] = params.slug.split('-');
  const article = await getUniqueArchive(id)
  const tags = article.tags?.split(',') || [];
  const firstTag = tags[0] || '';
  const archives = await getArchives(`&size=6&tags=${firstTag}`);
  //video
  const videoId = getYouTubeVideoId(article.video) || false
  const videoIframe = `https://www.youtube.com/embed/${videoId}`

  return (
    <div>
      <Header/>
      {videoId && (
        <iframe
            width="100%"
            height="600"
            src={videoIframe}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
        ></iframe>
    )}
        <div className={styles.mainArticle}>
          <div className={styles.headerArticle}>
            <div className={styles.articleTitle}>
              <h1>{article.name}</h1>
              <div className={styles.archiveDescription} dangerouslySetInnerHTML={{ __html: article.description }}></div>
            </div>
            <div className={styles.infoHearderArticle}>

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
          <div className={`${ui["mt-100"]}`}>
              {archives && archives.length > 0 && <>
                <div className={styles.mainPageCenter}>
                  <ArchiveHome archives={archives}/>
                </div>
              </>}  
            </div>
       </div>
     <Footer tags={tags}/>
    </div>
  );
}

function getYouTubeVideoId(url) {
    if (typeof url !== "string") return null;
    const regex = /[?&]v=([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }