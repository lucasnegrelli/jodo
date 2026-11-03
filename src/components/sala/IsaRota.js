"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json";
import styles from "@/styles/isaFolha.module.css";

/*
 * A rota da Isa: São Paulo -> Cuba (EICTV).
 * Globo ortográfico em SVG virado para as Américas; o arco é o grande círculo entre os dois pontos e se desenha quando entra na tela.
 */

const SP = [-46.63, -23.55];
const CU = [-82.5, 22.95];
const W = 640;
const H = 640;

export default function IsaRota() {
  const ref = useRef(null);
  const [vista, setVista] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVista(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const g = useMemo(() => {
    const proj = geoOrthographic().rotate([68, -2, 0]).translate([W / 2, H / 2]).scale(W * 0.47).clipAngle(90);
    const path = geoPath(proj);
    const terra = feature(land110, land110.objects.land);
    return {
      esfera: path({ type: "Sphere" }),
      grade: path(geoGraticule10()),
      terra: path(terra),
      arco: path({ type: "LineString", coordinates: [SP, CU] }),
      sp: proj(SP),
      cu: proj(CU),
    };
  }, []);

  return (
    <div ref={ref} className={`${styles.rota} ${vista ? styles.vista : ""}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mapa: rota de São Paulo até a EICTV, em Cuba">
        <defs>
          <radialGradient id="isaEsfera" cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#242422" />
            <stop offset="100%" stopColor="#0d0d0c" />
          </radialGradient>
        </defs>
        <path d={g.esfera} fill="url(#isaEsfera)" />
        <path d={g.grade} fill="none" stroke="rgba(233,230,223,0.08)" strokeWidth="0.6" />
        <path d={g.terra} fill="rgba(233,230,223,0.16)" stroke="rgba(233,230,223,0.5)" strokeWidth="0.7" />
        <path d={g.esfera} fill="none" stroke="rgba(233,230,223,0.35)" strokeWidth="1" />
        <path d={g.arco} pathLength="1" className={styles.rotaArco} fill="none" stroke="#ff3a1d" strokeWidth="2.4" strokeLinecap="round" />
        <g className={styles.rotaPonto} transform={`translate(${g.sp[0]} ${g.sp[1]})`}>
          <circle r="5" fill="#ff3a1d" />
          <circle r="5" className={styles.pulso} fill="none" stroke="#ff3a1d" />
          <text x="12" y="5" className={styles.rotaTxt}>SÃO PAULO</text>
        </g>
        <g className={styles.rotaPonto2} transform={`translate(${g.cu[0]} ${g.cu[1]})`}>
          <ellipse rx="19" ry="13" transform="rotate(-14)" fill="none" stroke="#ff3a1d" strokeWidth="2" className={styles.rotaLaco} pathLength="1" />
          <circle r="4" fill="#f5e500" />
          <text x="-14" y="-22" textAnchor="end" className={styles.rotaTxt}>EICTV · CUBA</text>
        </g>
      </svg>
    </div>
  );
}
