
import styles from "../styles/artistHome.module.css";


function randomBackground(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return randomIndex;
}

export default function ArtistsHome({ artists }) {
    const processArtists = artists.map((item) => {
        return {
            id: item.id,
            name: item.name,
            image: item.img_featured
        };
    });
    return (
        <div>
            <div className={styles.contentArtistsHome}>
                <div className={styles.contentFeatured}>
                    <div className={styles.featuredTitle}>
                        <h2>Artistas</h2>
                    </div>
                    <div className={styles.featuredDesc}>
                        <p>A JODO é um farol que guia os sonhadores, oferecendo um refúgio de expressão e descoberta.</p>
                    </div>
                </div>
                <div className={styles.artistsList}>
                {processArtists.map((artist, index) => (
                    
                    <div className={styles.artistsItem} key={index}>

                    <div className={styles.container}>
                        <div className={styles.card}>
                            <div className={styles.front}> <img src={artist.image} alt={artist.name} /></div>
                            <div className={styles.back}>{artist.name}</div>
                        </div>
                    </div>

                    </div>
                ))}
                
                </div>
            </div>
        </div>

    );
}
