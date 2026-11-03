
import styles from "../styles/mainRelease.module.css";
import Image from 'next/image';
import Link from 'next/link';


export default function mainRelease({item}) {

    return (
        <div className={styles.contentMainRelease}>

            <div className={styles.headerMainRelease}>
                <span className={styles.titleRelease}>{item.title}</span>
            </div>
            <div className={styles.releaseThumb}>
            <a href={item.link} target='_blank'>
                <Image
                    src={item.img_thumb}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                />
                </a>
                
            </div>
            <div className={styles.footerMainRelease}>
                <p className={styles.dateRelease}>{item.date}</p>
                <p className={styles.descriptionRelease}>{item.description}</p>
            </div>
        </div>
    );
}
