
import moment from 'moment';
import styles from "../styles/archivesList.module.css";
import Link from 'next/link';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

export default function ArtistsHome({archives}) {
    const gerarSlug = (titulo) => {
        const tituloSemAcentos = titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return tituloSemAcentos.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      };
    const processArchives = archives.map((item) => {
        let tags = item.tags;
        if (typeof tags === "string") {
            try {
                tags = tags.split(',');
            } catch (error) {
                console.error("Erro ao parsear tags:", error.message);
                tags = [];
            }
        }
        return {
            id: item.id,
            title: item.name,
            originDate: moment(item.originDate).format('YYYY'),
            image: item.img_thumb || item.img_featured,
            tags: tags?.map((tag) => ({ name: tag }))
        };
    });
    return (
        <div>
            <div className={styles.contentArchive}>
                <div className={styles.contentArchiveSideA}>
                <div className={styles.archiveTitle}>
                    <h2>Arquivo</h2>
                </div>
                </div>
                <div className={styles.contentArchiveSideB}>
                    <ul>
                    {processArchives.map((item, index) => (
                        <li key={index}>
                        <div className={styles.archives}>
                            <div className={styles.archiveItem}>
                            <Link href={`/arquivo/${encodeURIComponent(item.id)}-${gerarSlug(item.title.substring(0, 60))}`}> 
                                <div className={styles.contentArchiveTitle}><p>{item.title}</p></div>
                                <div className={styles.contentArchiveYear}><span>{item.originDate}</span></div>
                            </Link>
                            </div>
                            <div className={styles.archiveImage}>
                            <img           
                                src={item.image} 
                                alt={item.name}
                                width={200}
                                height={200}
                            />
                            </div>
                        </div>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}



{/* <div className={styles.archiveItem}>
<picture>
    <Link href={`/arquivo/${encodeURIComponent(item.id)}-${gerarSlug(item.title.substring(0, 60))}`}>
    <img      
    className={styles.archivePic}           
    src={item.image} 
    alt={item.name}
    />
    </Link>
</picture>
{item.tags?.map((tag, index) => (
    <Link className={styles.archiveTag}  href={`/tag/${tag.name}`} key={index}>#{tag.name}</Link>
))}

</div> */}