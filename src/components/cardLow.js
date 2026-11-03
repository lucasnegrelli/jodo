import styles from "../styles/cardLow.module.css";
import ui from "../styles/ui.module.css";
import moment from 'moment';
import Link from 'next/link';

//hooks
// import onScreen from '../hooks/onScreen';
1
export default function CardLow({ item }) {
    const gerarSlug = (titulo) => {
        // Remover acentos
        const tituloSemAcentos = titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Substituir espaços por hífens e converter para minúsculas
        return tituloSemAcentos.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    return (
        <div className={styles.contentCardLow}>
            <div className={styles.hoverOverlay}>
                <div className={styles.overlayContent}>
                    <h2 className={styles.overlayTitle}>{item.title}</h2>
                    {/* <p className={styles.overlayDescription}>{item.description}</p> */}
                    <div className={styles.overlayMeta}>
                        <div className={styles.overlayAuthor}>
                            <img src={item.photo} alt={item.name} />
                            <span>{item.name}</span>
                        </div>
                        <div className={styles.overlayDate}>
                            {moment(item.created_at).format('DD/MM/YYYY')}
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.thumbArticle}>
                <div className={styles.imgThumb}>
                    <Link href={`/artigo/${encodeURIComponent(item.id)}-${gerarSlug(item.title.substring(0, 60))}`}>
                        <img src={item.img_thumb} alt={item.title} />
                    </Link>
                </div>
            </div>
            <div className={styles.cardLowInfos}>
                <Link href={`/artigo/${encodeURIComponent(item.id)}-${gerarSlug(item.title.substring(0, 60))}`}>
                    <h3 className={styles.cardLowTitle}>{item.title}</h3>
                </Link>
                <p className={styles.cardLowDescription}>{item.description}</p>
                <div className={styles.cardLowfooter}>
                    <div className={ui.profileSmall}>
                        <img src={item.photo} width={30} height={30} alt={item.name} />
                        <p>{item.name}</p>
                    </div>
                    <div className={styles.contentCardData}>
                        <p><span>Data: </span> {moment(item.created_at).format('DD/MM/YYYY')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
