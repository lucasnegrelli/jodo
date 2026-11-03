// styles
import "@/styles/globals.css";
import styles from "@/styles/home.module.css";
import ui from "@/styles/ui.module.css";

// services (executados no server)
import { getArchives } from '@/services/archivesService';
import { getTags } from '@/services/tagsService';
import { getArtists } from '@/services/artistService';
import { getArticles } from '@/services/articlesService';
import { getEvents } from '@/services/eventsService';
import { getRelease } from '@/services/releaseService';
// components (server e client)
import Header from "@/components/_header";
import Footer from "@/components/_footer";
import Featured from "@/components/featured";
import CategoriesBar from "@/components/categoriesBar";
import CardLow from "@/components/cardLow";
import MainRelease from "@/components/mainRelease";
import ArtistsHome from "@/components/artistsHome";
import ArchiveHome from "@/components/archiveList";
import EventsList from "@/components/eventsList";
import Manifesto from "@/components/manifesto";
import ArtistsShowcase from "@/components/artistsShowcase";

// mocks
import { list } from "../mocks/articlesList";
import { releases } from "../mocks/releaseList";

// animations
import ReleaseAnimation from "@/components/animations/releaseAnimation";

export const dynamic = 'force-dynamic'; // garante SSR em cada requisição

export default async function HomePage() {
  // fetch de dados no server
  const [archives, tags, artists, articles, events, release] = await Promise.all([
    getArchives('size=20'),
    getTags(),
    getArtists(),
    getArticles('size=10'),
    getEvents(),
    getRelease(),
  ]);

  return (
    <div>
      <main>
        <div className={styles.headerPosition}>
          <Featured release={release} />
          <div className={ui["mt-80"]}>
            <Header />
            <div className={ui.marquee}>
              <div className={ui.marqueeContent}>
                <CategoriesBar tags={tags} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.mainPage}>
          <div className={styles.mainPageCenter}>
            <div className={styles.contentListCardLow}>
              {articles.map((item, index) => (
                <CardLow item={item} key={index} />
              ))}
            </div>
          </div>
        </div>

        <Manifesto />
        <ArtistsShowcase />

        {archives?.length > 0 && (
          <div className={styles.mainPageCenter}>
            <ArchiveHome archives={archives} />
          </div>
        )}

        {events?.length > 0 && (
          <div className={ui["mt-100"]}>
            <EventsList events={events} />
          </div>
        )}

        <Footer tags={tags} />
      </main>
    </div>
  );
}
