'use client'
import moment from 'moment';
import { useState, useEffect } from 'react';
import { useRive } from '@rive-app/react-canvas';

import styles from "../styles/events.module.css";
import Image from 'next/image';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FmdGoodIcon from '@mui/icons-material/FmdGood';

// components
import Link from 'next/link';


export default function EventsList({ events }) {
      const [height, setHeight] = useState(500)
      const { rive, RiveComponent } = useRive({
          src: '/animations/eventos.riv',
          stateMachines: "Eventos",
          autoplay: true,
        });
        useEffect(() => {
          if (rive) {
            setHeight(100);
          }
        }, [rive]); 
    return (
        <div className={styles.contentEventsList}>
          <div
            style={{
                width: '300px',
                height: `${height}px`,
                display: 'flex',  // Garantindo que a animação ocupe o espaço corretamente
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                marginLeft: '-10px',
                marginBottom: '50px'
            }}
            >
            <RiveComponent style={{ width: '100%', height: '100%' }} />  {/* Garantindo que o componente ocupe toda a área */}
            </div>
          <div className={styles.eventGrid}>
          {events.map((item, index) => (
            <div className={styles.eventCard} key={index}>
              <a href={item.eventLink} target='_blank'>
                <Image
                    src={item.image}
                    alt='evento'
                    width={300}
                    height={160}
                    style={{ objectFit: 'cover' }}
                />
              </a>
                <p className={styles.eventTitle}>{item.name}</p>
                <div className={styles.eventFooter}>
                  <p><span><DateRangeIcon style={{ fontSize: '20px', color: '#000' }}></DateRangeIcon> </span>{moment(item.when).format('DD/MM/YYYY')}</p>
                  <p><span><FmdGoodIcon style={{ fontSize: '20px', color: '#000' }}></FmdGoodIcon> </span>{item.location}</p>
                  {/* <li><InstagramIcon style={{ fontSize: '26px', color: '#000' }}></InstagramIcon></li>
                  <li><YouTubeIcon style={{ fontSize: '30px', color: '#000' }}></YouTubeIcon></li> */}
                </div>
            </div>
          ))}
          </div>
        </div>
    );
}