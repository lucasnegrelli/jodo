
import styles from "../styles/cardHigh.module.css";
import ui from "../styles/ui.module.css";
import moment from 'moment';
import Link from 'next/link';

//hooks
// import onScreen from '../hooks/onScreen';

export default function CardLow({ item }) {
    const gerarSlug = (titulo) => {
        // Remover acentos
        const tituloSemAcentos = titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Substituir espaços por hífens e converter para minúsculas
        return tituloSemAcentos.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      };
      const tags = item.tags ? item.tags.split(',') : []; 
    return (
        <div className={styles.contentCardHigh}>
            <div className={styles.thumbArticle}>
                <div className={styles.imgThumb}>
                <Link href={`/artigo/${encodeURIComponent(item.id)}-${gerarSlug(item.title.substring(0, 60))}`}>
                        <img src={item.img_thumb} alt={item.title}/>
                    </Link>
                </div>
            </div>
            <div className={styles.cardHighInfos}>
                <div className={styles.cardTags}>
                    {tags?.map((tag, index) => (
                        <Link className={styles.archiveTag}  href={`/tag/${tag}`} key={index}>#{tag}</Link>
                    ))}
                </div>
                <Link href={`/artigo/${encodeURIComponent(item.id)}-${gerarSlug(item.title.substring(0, 60))}`}><h3 className={styles.cardHighTitle}>{item.title}</h3></Link>
                <div className={styles.cardHighfooter}>
                    <div className={ui.profileSmall}>
                        <img src={item.photo} width={30} height={30} alt={item.name}/>
                        <p>{item.name}</p>
                    </div>
                    <div className={styles.contentCardData}>
                        <p> {moment(item.created_at).format('DD/MM/YYYY')}</p>
                    </div>
                    {/* <Link href={`/artigo/${encodeURIComponent(item.id)}-${gerarSlug(item.title.substring(0, 60))}`} className={ui.jbutton}>
                    Ver mais
                    </Link> */}
                </div>
            </div>
        </div>
);
}
