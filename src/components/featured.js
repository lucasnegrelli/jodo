"use client";

import styles from "../styles/featured.module.css";
import ui from "@/styles/ui.module.css";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getRelease } from '../services/releaseService';


export default function Featured({ release }) {
    const title = release.title;
    const description = release.text;
    const content = release.content_url;
    const videoSrc = release.video;
    const imageSrc = "https://ucarecdn.com/6de2c351-f579-4759-9a6e-01586c33062d/logo.png";
    const videoRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true); // Usamos isLoading para controlar a visibilidade da imagem

    useEffect(() => {
        const videoElement = videoRef.current;

        if (videoElement) {
            const handleLoad = () => {
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            };

            // Verifica se o vídeo já foi carregado (pode acontecer no reload com cache)
            if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
                handleLoad();
            } else {
                videoElement.addEventListener('loadeddata', handleLoad);
            }

            return () => {
                if (videoElement) {
                    videoElement.removeEventListener('loadeddata', handleLoad);
                }
            };
        }
    }, [videoRef]);

    return (
        <div>
            <div className={styles.featuredVideo}>
                {isLoading && (
                    <div className={styles.imagePlaceholder}>
                        <img src={imageSrc} alt="Carregando vídeo..." />
                    </div>
                )}
                <video
                    ref={videoRef}
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`${styles.video} ${isLoading ? styles.hidden : ''}`}
                />
                <div className={styles.overlay}></div>
            </div>
            <div className={styles.contentFeatured}>
                <div className={styles.featuredTitle}>
                    <span>{title}</span>
                </div>
                <div className={styles.featuredDesc}>
                    <p>{description}</p>
                    <Link href={content} className={`${styles.featuredButton} ${ui.jbutton}`}>ver mais</Link>
                </div>
            </div>
        </div>
    );
}