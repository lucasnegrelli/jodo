"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { geoOrthographic, geoPath, geoGraticule10, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json";
import styles from "@/styles/globo.module.css";

/*
  GLOBO: mapa-múndi interativo em canvas (d3-geo, projeção ortográfica).
  - Gira sozinho; arraste para girar; roda do mouse / pinça para zoom.
  - Cada cidade com artistas vira um ponto; clicar foca a cidade e abre o painel.
  - Tudo em código, sem imagem externa.
*/

const TERRA = feature(land110, land110.objects.land);
const GRATICULA = geoGraticule10();
const RAD = Math.PI / 180;

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const norm = (l) => ((((l + 180) % 360) + 360) % 360) - 180;
const difAng = (a, b) => norm(b - a);

export default function Globo({ lugares, semLugar, links }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const palcoRef = useRef(null);
  const pinsRef = useRef([]);
  const estado = useRef({
    lon: 40, // centraliza o Atlântico/Brasil depois do giro inicial
    lat: -10,
    zoom: 1,
    alvo: null, // {lon,lat,zoom}
    arrasta: false,
    ultimoX: 0,
    ultimoY: 0,
    velLon: 0,
    parado: false,
    toques: new Map(),
    distPinca: 0,
  });
  const [aberto, setAberto] = useState(null); // índice do lugar aberto
  const [menu, setMenu] = useState(false);
  const [saida, setSaida] = useState(null);
  const [pronto, setPronto] = useState(false);
  const abertoRef = useRef(null);
  abertoRef.current = aberto;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rnd = mulberry32(82);
    const estrelas = Array.from({ length: 160 }, () => ({
      x: rnd(),
      y: rnd(),
      r: 0.4 + rnd() * 1.4,
      o: 0.2 + rnd() * 0.8,
      f: rnd() * 6.28,
    }));
    let raf;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let t0 = performance.now();

    const proj = geoOrthographic().clipAngle(90).precision(0.4);
    const path = geoPath(proj, ctx);

    const medir = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    };
    medir();
    window.addEventListener("resize", medir);

    const desenhar = (agora) => {
      const dt = Math.min(0.05, (agora - t0) / 1000);
      t0 = agora;
      const s = estado.current;

      // movimento: foco > arrasto com inércia > giro automático
      if (s.alvo) {
        const k = 1 - Math.pow(0.001, dt);
        s.lon += difAng(s.lon, s.alvo.lon) * k;
        s.lat += (s.alvo.lat - s.lat) * k;
        s.zoom += (s.alvo.zoom - s.zoom) * k;
      } else if (!s.arrasta) {
        s.lon += s.velLon;
        s.velLon *= 0.94;
        if (!reduz && !s.parado && abertoRef.current === null) s.lon += dt * 5; // graus/s
      }
      s.lon = norm(s.lon);
      s.lat = Math.max(-80, Math.min(80, s.lat));

      const R = Math.min(w, h) * 0.4 * s.zoom;
      const cx = w / 2;
      const cy = h / 2;
      proj.scale(R).translate([cx, cy]).rotate([-s.lon, -s.lat]);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // fundo + estrelas
      const fundo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, Math.max(w, h) * 0.75);
      fundo.addColorStop(0, "#1a0b2e");
      fundo.addColorStop(1, "#05030a");
      ctx.fillStyle = fundo;
      ctx.fillRect(0, 0, w, h);
      for (const e of estrelas) {
        const piscar = reduz ? 1 : 0.6 + 0.4 * Math.sin(agora / 900 + e.f);
        ctx.globalAlpha = e.o * piscar;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(e.x * w, e.y * h, e.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // halo neon
      const halo = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.28);
      halo.addColorStop(0, "rgba(127, 207, 106,0.38)");
      halo.addColorStop(1, "rgba(127, 207, 106,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.28, 0, 6.283);
      ctx.fill();

      // esfera
      const esf = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      esf.addColorStop(0, "#2b1445");
      esf.addColorStop(1, "#0b0614");
      ctx.fillStyle = esf;
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fill();

      // graticula
      ctx.strokeStyle = "rgba(160,120,255,0.16)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      path(GRATICULA);
      ctx.stroke();

      // terra
      ctx.fillStyle = "#0b0b0b";
      ctx.beginPath();
      path(TERRA);
      ctx.fill();
      ctx.strokeStyle = "#7fcf6a";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // borda da esfera
      ctx.strokeStyle = "rgba(127, 207, 106,0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.stroke();

      // pinos
      const centro = [s.lon, s.lat];
      const pos = lugares.map((lg) => {
        const visivel = geoDistance([lg.lon, lg.lat], centro) < 1.5;
        const p = proj([lg.lon, lg.lat]);
        return visivel && p ? p : null;
      });
      lugares.forEach((lg, i) => {
        const el = pinsRef.current[i];
        if (!el) return;
        const p = pos[i];
        if (!p) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          return;
        }
        // rótulo vai para o lado quando há outro pino por perto
        let lado = "baixo";
        for (let k = 0; k < pos.length; k++) {
          if (k === i || !pos[k]) continue;
          if (Math.hypot(p[0] - pos[k][0], p[1] - pos[k][1]) < 90) {
            lado = p[0] >= pos[k][0] ? "dir" : "esq";
            break;
          }
        }
        if (el.dataset.lado !== lado) el.dataset.lado = lado;
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.style.transform = `translate3d(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px, 0)`;
      });

      raf = requestAnimationFrame(desenhar);
    };
    raf = requestAnimationFrame((t) => {
      t0 = t;
      desenhar(t);
    });
    setPronto(true);

    // entrada: gira até o Brasil
    estado.current.alvo = { lon: -48, lat: -12, zoom: 1 };
    const soltar = setTimeout(() => {
      if (abertoRef.current === null) estado.current.alvo = null;
    }, 2600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(soltar);
      window.removeEventListener("resize", medir);
    };
  }, [lugares]);

  // ponteiro: arrastar, inércia e zoom
  useEffect(() => {
    const el = palcoRef.current;
    const s = estado.current;
    const dentroUI = (t) => t.closest("a,button,aside");

    const down = (e) => {
      if (dentroUI(e.target)) return;
      el.setPointerCapture?.(e.pointerId);
      s.toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (s.toques.size === 1) {
        s.arrasta = true;
        s.alvo = null;
        s.ultimoX = e.clientX;
        s.ultimoY = e.clientY;
      } else if (s.toques.size === 2) {
        const [a, b] = [...s.toques.values()];
        s.distPinca = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const move = (e) => {
      if (!s.toques.has(e.pointerId)) return;
      s.toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (s.toques.size === 2) {
        const [a, b] = [...s.toques.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (s.distPinca) s.zoom = Math.max(0.7, Math.min(3, s.zoom * (d / s.distPinca)));
        s.distPinca = d;
        return;
      }
      if (!s.arrasta) return;
      const R = Math.min(window.innerWidth, window.innerHeight) * 0.4 * s.zoom;
      const grauPorPx = 90 / R;
      const dx = e.clientX - s.ultimoX;
      const dy = e.clientY - s.ultimoY;
      s.lon -= dx * grauPorPx;
      s.lat += dy * grauPorPx;
      s.velLon = -dx * grauPorPx * 0.6;
      s.ultimoX = e.clientX;
      s.ultimoY = e.clientY;
    };
    const up = (e) => {
      s.toques.delete(e.pointerId);
      if (s.toques.size < 2) s.distPinca = 0;
      if (s.toques.size === 0) s.arrasta = false;
    };
    const roda = (e) => {
      e.preventDefault();
      s.alvo = null;
      s.zoom = Math.max(0.7, Math.min(3, s.zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", roda, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", roda);
    };
  }, []);

  const abrir = (i) => {
    const lg = lugares[i];
    setAberto(i);
    estado.current.alvo = { lon: lg.lon, lat: lg.lat, zoom: 2.1 };
  };
  const fechar = () => {
    setAberto(null);
    estado.current.alvo = { lon: estado.current.lon, lat: estado.current.lat, zoom: 1 };
    setTimeout(() => (estado.current.alvo = null), 900);
  };
  const entrar = (e, a) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    setSaida({ x: e.clientX, y: e.clientY, cor: a.cor });
    setTimeout(() => router.push(`/artistas/${a.slug}`), 650);
  };

  const lg = aberto !== null ? lugares[aberto] : null;

  return (
    <div className={`${styles.palco} ${pronto ? styles.pronto : ""}`} ref={palcoRef}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      {lugares.map((l, i) => (
        <button
          key={`${l.cidade}-${l.pais}`}
          ref={(el) => (pinsRef.current[i] = el)}
          className={`${styles.pino} ${aberto === i ? styles.pinoAtivo : ""}`}
          onClick={() => (aberto === i ? fechar() : abrir(i))}
          aria-label={`${l.cidade}: ${l.artistas.length} artista(s)`}
        >
          <span className={styles.anel} />
          <span className={styles.miolo}>{l.artistas.length}</span>
          <span className={styles.cidade}>{l.cidade}</span>
        </button>
      ))}

      <h1 className={styles.titulo}>JODO</h1>
      <nav className={styles.bordaEsq} aria-label="Principal">
        <Link href="/artigo">Artigos</Link>
        <Link href="/eventos">Eventos</Link>
        <Link href="/arquivo">Arquivo</Link>
      </nav>
      <div className={styles.bordaDir}>
        <Link href="/artistas">Artistas</Link>
      </div>
      <button className={styles.explorar} onClick={() => setMenu(true)}>
        Explorar
      </button>
      <p className={styles.rodape}>Porque ainda estamos aqui</p>
      <p className={styles.dica}>arraste para girar</p>

      <aside className={`${styles.painel} ${lg ? styles.painelAberto : ""}`} aria-hidden={!lg}>
        {lg && (
          <>
            <button className={styles.painelFechar} onClick={fechar}>
              Fechar
            </button>
            <p className={styles.painelPais}>{lg.pais}</p>
            <h2 className={styles.painelCidade}>{lg.cidade}</h2>
            <p className={styles.painelQtd}>{lg.artistas.length} artista(s)</p>
            <ul className={styles.lista}>
              {lg.artistas.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/artistas/${a.slug}`}
                    onClick={(e) => entrar(e, a)}
                    className={styles.item}
                    style={{ "--cor": a.destaque }}
                  >
                    <span className={styles.bolinha} />
                    <span className={styles.itemTexto}>
                      <strong>{a.nome}</strong>
                      <em>
                        {a.papel}
                        {a.tipo !== "jodo" ? " · parceiro" : ""}
                        {!a.confirmado ? " · a confirmar" : ""}
                      </em>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

      <div className={`${styles.menu} ${menu ? styles.menuAberto : ""}`} aria-hidden={!menu}>
        <button className={styles.fechar} onClick={() => setMenu(false)}>
          Fechar
        </button>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setMenu(false)} tabIndex={menu ? 0 : -1}>
                {l.rotulo}
              </Link>
            </li>
          ))}
        </ul>
        {semLugar.length > 0 && (
          <p className={styles.semLugar}>
            Sem lugar no mapa ainda: {semLugar.map((a) => a.nome).join(", ")}
          </p>
        )}
      </div>

      {saida && (
        <div
          className={styles.transicao}
          style={{ "--x": `${saida.x}px`, "--y": `${saida.y}px`, background: saida.cor }}
        />
      )}
    </div>
  );
}

