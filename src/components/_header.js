'use client'
import { useState, useEffect } from 'react';
import styles from "@/styles/header.module.css";
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    const [isFixed, setIsFixed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const headerHeight = 200; // Adjust this value based on your header's height
            setIsFixed(scrollPosition > headerHeight);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.contentHeader} ${isFixed ? styles.fixedHeader : ''}`}>
            <div className={styles.centerHeader}>
            <div className={styles.headerLogo}>
                <Link href={'/'}>
                <Image
                    src="https://ucarecdn.com/6de2c351-f579-4759-9a6e-01586c33062d/logo.png"
                    width={200}
                    height={100}
                    alt="jodo"
                />
                </Link>
            </div>
            <div className={styles.headerInfos}>
                <menu className={styles.contentMenu}>
                    <li><Link href={`/artigo/`}>Artigos</Link></li>
                    <li><Link href={`/eventos/`}>Eventos</Link></li>
                    <li><Link href={`/artistas/`}>Artistas</Link></li>
                    <li><Link href={`/arquivo/`}>Arquivo</Link></li>
                </menu>
                {/* <nav className={styles.headerSocial}>
                    <li><InstagramIcon style={{ fontSize: '26px', color: '#000' }}></InstagramIcon></li>
                    <li><YouTubeIcon style={{ fontSize: '30px', color: '#000' }}></YouTubeIcon></li>
                </nav> */}
            </div>
            </div>
        </header >
    );
}
