
import styles from "../styles/archivesHome.module.css";
import Link from 'next/link';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';


export default function ArtistsHome({archives}) {
    const gerarSlug = (titulo) => {
        // Remover acentos
        const tituloSemAcentos = titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Substituir espaços por hífens e converter para minúsculas
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
            image: item.img_thumb || item.img_featured,
            tags: tags?.map((tag) => ({ name: tag }))
        };
    });
    return (
        <div>
        <div className={styles.contentArchive}>
            <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={{ xs: 4, md: 4 }} columns={{ xs: 4, sm: 8, md: 12 }} className={styles.gridResponsive}>
                {processArchives.map((item, index) => (
                    <Grid key={index}>
                    <div className={styles.archiveItem}>
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
                        <div className={styles.archiveTitle}>
                        <Link href={`/arquivo/${encodeURIComponent(item.id)}-${gerarSlug(item.title.substring(0, 60))}`}><h3 className={styles.cardLowTitle}>{item.title}</h3></Link>
                        </div>
                    </div>
                    </Grid>
                ))}
            </Grid>
          </Box>
        </div>
        </div>
    );
}
