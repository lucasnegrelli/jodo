'use client'
import { useState, useEffect } from 'react';
import { useRive } from '@rive-app/react-canvas';

import styles from "../styles/footer.module.css";
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Link from 'next/link';

export default function Footer() {
    const [height, setHeight] = useState(500)
    const { rive, RiveComponent } = useRive({
        src: '/animations/logojodo.riv',
        stateMachines: "JODO LOGO",
        autoplay: true,
      });
      useEffect(() => {
        if (rive) {
          setHeight(300);
        }
      }, [rive]); 
    return (
        <div className={styles.contentFooter}>
            <footer>
                <div className={styles.mainFooterCenter}>
                    <div className={styles.leftFooter}>
                        <div
                            style={{
                                width: '300px',
                                height: `${height}px`,
                                display: 'block',
                                margin: '0 auto',  // Garantindo que a animação ocupe o espaço corretamente
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                            }}
                            >
                            <RiveComponent style={{ width: '100%', height: '100%' }} />  {/* Garantindo que o componente ocupe toda a área */}
                        </div>
                        <span>JODO</span>
                    </div>
                    <div className={styles.centerFooter}>
                        <p>
                        Viajando pelas estradas sinuosas deste vasto país, a JODO se tornou um encontro de almas artísticas, onde os contornos urbanos de São Paulo se misturam com a selva enigmática de Manaus. No calor das batidas que atravessam fronteiras e deságuam nas veias da música, uma teia de colaboradores brilha e se entrelaça, como fios de luz em uma noite estrelada.
                        </p>
                        
                    </div>
                    <div className={styles.rightFooter}>
                        <nav className={styles.headerSocial}>
                            <li><Link target="_blank" href="https://www.youtube.com/@JODOJODOJODO"><YouTubeIcon style={{ fontSize: '30px', color: '#fff' }}></YouTubeIcon></Link></li>
                            <li><Link target="_blank" href="https://www.instagram.com/_jodo/"><InstagramIcon style={{ fontSize: '30px', color: '#fff' }}></InstagramIcon></Link></li>
                            <li><Link target="_blank" href="https://x.com/jodojodam"><XIcon style={{ fontSize: '30px', color: '#fff' }}></XIcon></Link></li>
                        </nav>
                    </div>
                </div>
            </footer>
        </div>
    );
}
