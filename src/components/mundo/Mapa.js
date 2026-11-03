"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "maplibre-gl/dist/maplibre-gl.css";
import estilo from "./estiloMapa";
import MarcaMontanha from "./MarcaMontanha";
import RodapeContato from "./RodapeContato";
import { tipoDeTransicao, duracaoTransicao } from "./TransicaoSaida";
import { MODOS } from "@/data/modos";
import styles from "@/styles/globo.module.css";
import { ehPassado, dataBR } from "@/data/eventos";

const LANDMARK_PMTILES = "https://s3-west.nrp-nautilus.io/public-indigenous/landmark/iplc-poly.pmtiles";
import { LUGARES, APELIDOS, SEGMENTOS, LANCOU_2026 } from "@/data/mapa";
import { ICONES } from "@/data/iconesMarca";

/*
  MUNDO: uma tela só. O globo (MapLibre, projeção globe, tiles OpenStreetMap) nunca some;
  os botões do topo trocam o que ele mostra (modos), e o clique abre uma janela ao lado
  enquanto o globo desliza para o outro lado (padding da câmera), sem trocar de página.
  - Modo "artistas": um pino por cidade; perto, um pino por artista.
  - Modo "eventos": um pino por cidade; perto, um pino por evento (aceso = vem aí, apagado = já rolou).
  - Modo "acervo": um pino por lugar de onde saíram os trabalhos; a janela vira sala de cinema.
  - Modo "textos": um pino por lugar a que cada texto pertence; a janela vira leitura.
  - Gestos: arrastar, rolar para zoom, pinça, botão direito/Ctrl para girar e inclinar.
  Quando houver endereço público (estúdio, casa de show, rolê) basta preencher `ponto`/lat+lon.
*/

// tom de cada modo (verde e roxo da JODO): [claro, escuro] para costa/ruas do mapa
const TONS = {
  artistas: ["#a99bd6", "#4d4378"],
  eventos: ["#c3a0ff", "#6a3fb0"],
  acervo: ["#8fd6cb", "#3f7f78"],
  textos: ["#e6a0d6", "#8a4a7e"],
};
const ZOOM_DETALHE = 9;
const LARG_JANELA = 460;

function deslocar(i, total, raio) {
  // poucos: em círculo. Muitos (colaboradores): espiral, para não amontoar no mesmo lugar
  if (total > 10) {
    const r = raio * (0.7 + 2.4 * Math.sqrt(i / total));
    const ang = i * 2.399963 + 0.6;
    return [Math.cos(ang) * r, Math.sin(ang) * r * 0.8];
  }
  const ang = (i / Math.max(total, 1)) * Math.PI * 2 + 0.6;
  return [Math.cos(ang) * raio, Math.sin(ang) * raio * 0.8];
}

// a janela ocupa a direita (desktop) ou a parte de baixo (celular); a câmera abre espaço para ela
function acolchoado(janela) {
  if (!janela || typeof window === "undefined") return { top: 0, bottom: 0, left: 0, right: 0 };
  if (window.innerWidth <= 760) return { top: 0, bottom: Math.round(window.innerHeight * 0.55), left: 0, right: 0 };
  return { top: 0, bottom: 0, left: 0, right: Math.min(LARG_JANELA, window.innerWidth * 0.5) + 24 };
}

const norma = (t) => (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function fmtViews(n) {
  if (!n) return "";
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")} mil` : String(n);
}

function FichaArtista({ a, lg, dados }) {
  const { trabalhos, escritos } = dados;
  const capa = trabalhos[0];
  return (
    <article className={styles.ficha2} style={{ "--cor": a.corPino || "var(--acento)" }}>
      <p className={styles.painelPais}>
        {lg.cidade}{a.colab && !a.lugarCerto ? " · lugar estimado" : ""}
        {a.tipo === "parceiro" ? " · parceiro" : ""}
      </p>
      <h2 className={styles.painelCidade}>{a.nome}</h2>
      {a.papel && <p className={styles.fichaPapel}>{a.papel}</p>}
      {a.tambem && a.tambem.length > 0 && <p className={styles.fichaPapel}>também: {a.tambem.join(" · ")}</p>}
      {a.colab && a.funcoes && a.funcoes.length > 0 && <p className={styles.fichaPapel}>nos créditos: {a.funcoes.join(" · ")}</p>}
      {capa && (
        <a className={styles.fichaCapa} href={`https://www.youtube.com/watch?v=${capa.id}`} target="_blank" rel="noopener noreferrer" title={capa.titulo}>
          <img src={`https://i.ytimg.com/vi/${capa.id}/hqdefault.jpg`} alt="" />
          <span>▶ {capa.titulo}</span>
        </a>
      )}
      <p className={styles.fichaBio}>{a.resumo}</p>
      {a.redes && a.redes.length > 0 && (
        <div className={styles.fichaRedes}>
          {a.redes.map((r) => (
            <a key={r.rotulo} href={r.url} target="_blank" rel="noopener noreferrer" className={ICONES[r.rotulo] ? styles.fichaIcone : styles.fichaLink} title={r.rotulo} aria-label={r.rotulo}>
              {ICONES[r.rotulo] ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONES[r.rotulo]} fill="currentColor" /></svg>
              ) : (
                r.rotulo
              )}
            </a>
          ))}
        </div>
      )}
      {trabalhos.length > 0 && (
        <section className={styles.fichaSecao}>
          <h3>trabalhos ({trabalhos.length})</h3>
          <ul>
            {trabalhos.slice(0, 8).map((o) => (
              <li key={o.id}>
                <a href={`https://www.youtube.com/watch?v=${o.id}`} target="_blank" rel="noopener noreferrer">
                  <img src={`https://i.ytimg.com/vi/${o.id}/default.jpg`} alt="" loading="lazy" />
                  <span>
                    <b>{o.titulo}</b>
                    <small>{o.data.slice(0, 4)}</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {trabalhos.length > 8 && <p className={styles.fichaMais}>e mais {trabalhos.length - 8}.</p>}
        </section>
      )}
      {escritos.length > 0 && (
        <section className={styles.fichaSecao}>
          <h3>textos</h3>
          <ul>
            {escritos.map((t) => (
              <li key={t.id}>
                <a href={`/?modo=textos`}>
                  <span>
                    <b>{t.titulo}</b>
                    <small>{t.data ? t.data.split("-").reverse().join("/") : ""}</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className={styles.fichaAviso}>
        {a.colab ? (a.lugarCerto ? "Já passou pela JODO." : "Já passou pela JODO. O lugar no mapa é uma estimativa (de onde a pessoa é ou está).") : `A página completa de ${a.nome} vem aí.`}
      </p>
    </article>
  );
}

const ANO_ATUAL = 2026;
const QUEM = [
  ["foco", "em foco"],
  ["todos", "todos"],
];
const VAZIO = { quem: "foco", busca: "", seg: [], ano: null, cidade: null, regiao: null, tipo: null, pagina: null, funcao: [], desde: null, volume: null, link: [] };
const REGIAO = {
  Manaus: "Norte", "Monte Roraima": "Norte", Salvador: "Nordeste",
  Lages: "Sul", "Ponta Grossa": "Sul", Maravilha: "Sul", "São José": "Sul", "Balneário Cassino": "Sul", Pelotas: "Sul",
};
const regiaoDe = (lg) => (lg.pais !== "Brasil" ? "Fora do Brasil" : REGIAO[lg.cidade] || "Sudeste");
const REGIOES = ["Norte", "Nordeste", "Sudeste", "Sul", "Fora do Brasil"];
const VOLUMES = [
  ["1", "1 trabalho", (n) => n === 1],
  ["2a5", "2 a 5", (n) => n >= 2 && n <= 5],
  ["6", "6 ou mais", (n) => n >= 6],
  ["0", "nenhum no canal", (n) => n === 0],
];
const LINKS = ["Instagram", "Spotify", "YouTube", "SoundCloud", "Linktree", "Bandcamp"];
const TIPOS = [["jodo", "da casa"], ["parceiro", "parceiros"], ["colaborador", "já passaram"]];
const FUNCOES = ["artista", "beat", "letra", "mix", "voz", "imagem", "edição", "captação", "direção", "cor", "roteiro"];

export default function Mapa({ lugares: lugaresTodos, semLugar, eventos = [], acervo = [], textos = [] }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const mlRef = useRef(null);
  const estado = useRef({ girar: true, interagindo: false, voando: false, aberto: false });
  const acoes = useRef({});
  const [modo, setModo] = useState("artistas");
  const [sel, setSel] = useState(null); // { cidade: índice | null, evento: id | null }
  const [saida, setSaida] = useState(null);
  const [mapaPronto, setMapaPronto] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(false);
  const [tocando, setTocando] = useState(null); // id do vídeo escolhido no acervo
  const [reproduz, setReproduz] = useState(false);
  const [ano, setAno] = useState(null);
  const [terras, setTerras] = useState(true); // camada das terras indígenas (FUNAI)
  const [zoomPerto, setZoomPerto] = useState(false); // com o mapa aproximado, a interface (menu, logo, redes...) some

  estado.current.aberto = sel !== null;

  // filtros do modo Artistas. Padrão: só quem tem página ou lançou este ano; os antigos entram pelo filtro "todos"
  const [filtro, setFiltro] = useState(VAZIO);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [maisAnos, setMaisAnos] = useState(false);
  const [maisDesde, setMaisDesde] = useState(false);
  const mudarFiltro = (parte) => {
    setSel(null);
    setFiltro((f) => ({ ...f, ...parte }));
    const map = mapRef.current;
    if (map && map.getZoom() > 3) voar({ zoom: 2.4, pitch: 0 }, false);
  };

  // ano do último trabalho de cada artista (acervo + lançamentos de 2026 fora do canal)
  const stats = useMemo(() => {
    const ultimo = {}, primeiro = {}, n = {};
    lugaresTodos.forEach((lg) =>
      lg.artistas.forEach((a) => {
        let max = LANCOU_2026.includes(a.slug) ? ANO_ATUAL : 0, min = 0, cont = 0;
        const nomes = a.obras ? null : (APELIDOS[a.slug] || [a.nome]).map(norma);
        acervo.forEach((o) => {
          const meu = a.obras ? a.obras.includes(o.id) : nomes.some((x) => norma(`${o.titulo} ${o.autor || ""}`).includes(x));
          if (!meu) return;
          const y = Number(o.data.slice(0, 4));
          cont++;
          max = Math.max(max, y);
          min = min ? Math.min(min, y) : y;
        });
        ultimo[a.slug] = max; primeiro[a.slug] = min; n[a.slug] = cont;
      })
    );
    return { ultimo, primeiro, n };
  }, [lugaresTodos, acervo]);
  const ultimoAno = stats.ultimo;

  // um artista passa nos filtros? `ignora` deixa de fora um filtro (para contar as opções dele)
  const passa = (a, lg, f, ignora) => {
    const u = ultimoAno[a.slug] || 0;
    if (ignora !== "quem") {
      if (f.quem === "foco" && !(a.temPagina || u >= ANO_ATUAL)) return false;
    }
    if (f.busca && !norma(a.nome).includes(norma(f.busca))) return false;
    if (ignora !== "seg" && f.seg.length && !f.seg.some((s) => (a.segmentos || []).includes(s))) return false;
    if (ignora !== "ano" && f.ano && u !== Number(f.ano)) return false;
    if (ignora !== "cidade" && f.cidade && lg.cidade !== f.cidade) return false;
    if (ignora !== "regiao" && f.regiao && regiaoDe(lg) !== f.regiao) return false;
    if (ignora !== "tipo" && f.tipo && a.tipo !== f.tipo) return false;
    if (ignora !== "pagina" && f.pagina && (f.pagina === "com" ? !a.temPagina : a.temPagina)) return false;
    if (ignora !== "desde" && f.desde && (stats.primeiro[a.slug] || 0) !== Number(f.desde)) return false;
    if (ignora !== "volume" && f.volume && !(VOLUMES.find((v) => v[0] === f.volume)[2](stats.n[a.slug] || 0))) return false;
    if (ignora !== "link" && f.link.length && !f.link.some((x) => (a.redes || []).some((r) => r.rotulo === x))) return false;
    if (ignora !== "funcao" && f.funcao.length && !f.funcao.some((x) => (a.funcoes || []).includes(x))) return false;
    return true;
  };
  const lugares = useMemo(
    () =>
      lugaresTodos
        .map((lg) => ({ ...lg, artistas: lg.artistas.filter((a) => passa(a, lg, filtro)) }))
        .filter((lg) => lg.artistas.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lugaresTodos, filtro, stats]
  );
  // quantos artistas cada opção traria (respeitando os outros filtros)
  const contar = (chave, teste) => {
    let n = 0;
    lugaresTodos.forEach((lg) => lg.artistas.forEach((a) => { if (passa(a, lg, filtro, chave) && teste(a, lg)) n++; }));
    return n;
  };
  const cidadesTodas = useMemo(() => lugaresTodos.map((l) => l.cidade).sort((x, y) => x.localeCompare(y, "pt-BR")), [lugaresTodos]);
  const anosTodos = useMemo(
    () => [...new Set(Object.values(ultimoAno).filter(Boolean))].sort((x, y) => y - x).map(String),
    [ultimoAno]
  );
  const escolherCidade = (cidade) => {
    mudarFiltro({ cidade });
    const lg = lugaresTodos.find((l) => l.cidade === cidade);
    if (lg) voar({ center: [lg.lon, lg.lat], zoom: lg.pais === "Brasil" && lg.cidade !== "São Paulo" ? 6.5 : 7.5, pitch: 0 }, false);
  };
  const anosDesde = useMemo(
    () => [...new Set(Object.values(stats.primeiro).filter(Boolean))].sort((x, y) => x - y).map(String),
    [stats]
  );
  const alterna = (lista, v) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);
  const nFiltros = ["busca", "ano", "cidade", "regiao", "tipo", "pagina", "desde", "volume"].filter((k) => filtro[k]).length + filtro.seg.length + filtro.funcao.length + filtro.link.length + (filtro.quem !== "foco" ? 1 : 0);
  const totalArt = lugares.reduce((s, l) => s + l.artistas.length, 0);

  // eventos agrupados por cidade, já com "passado"
  const lugaresEv = useMemo(() => {
    const por = {};
    eventos.forEach((e) => {
      const ev = { ...e, passado: ehPassado(e.quando) };
      (por[e.cidade] = por[e.cidade] || { cidade: e.cidade, pais: "Brasil", lat: 0, lon: 0, eventos: [] }).eventos.push(ev);
    });
    return Object.values(por).map((c) => {
      c.eventos.sort((a, b) => (a.quando < b.quando ? 1 : -1));
      c.lat = c.eventos.reduce((s, e) => s + e.lat, 0) / c.eventos.length;
      c.lon = c.eventos.reduce((s, e) => s + e.lon, 0) / c.eventos.length;
      return c;
    });
  }, [eventos]);

  // acervo agrupado pelo lugar de onde saiu cada trabalho (sem lugar => só na lista geral)
  const lugaresAc = useMemo(() => {
    const por = {};
    acervo.forEach((o) => {
      if (!o.lugar || !LUGARES[o.lugar]) return;
      (por[o.lugar] = por[o.lugar] || { ...LUGARES[o.lugar], obras: [] }).obras.push(o);
    });
    return Object.values(por);
  }, [acervo]);
  const todoAcervo = useMemo(
    () => ({ cidade: "Todo o acervo", pais: "", lat: 0, lon: 0, obras: acervo }),
    [acervo]
  );
  const semLugarAc = acervo.filter((o) => !o.lugar).length;

  // ficha do artista (para quem ainda não tem página): trabalhos do acervo e textos em que ele aparece
  const dadosFicha = (a) => {
    if (a.obras) return { trabalhos: acervo.filter((o) => a.obras.includes(o.id)), escritos: [] };
    const nomes = (APELIDOS[a.slug] || [a.nome]).map(norma);
    const acha = (t) => nomes.some((n) => t.includes(n));
    return {
      trabalhos: acervo.filter((o) => acha(norma(`${o.titulo} ${o.autor || ""}`))),
      escritos: textos.filter((t) => acha(norma(t.autor || ""))),
    };
  };

  // textos agrupados pelo lugar (sem lugar => só na lista geral)
  const lugaresTx = useMemo(() => {
    const por = {};
    textos.forEach((t) => {
      if (!t.lugar || !LUGARES[t.lugar]) return;
      (por[t.lugar] = por[t.lugar] || { ...LUGARES[t.lugar], textos: [] }).textos.push(t);
    });
    return Object.values(por);
  }, [textos]);
  const todosTextos = useMemo(
    () => ({ cidade: "Todos os textos", pais: "", lat: 0, lon: 0, textos }),
    [textos]
  );

  // abre direto no modo pedido pela URL (/?modo=eventos)
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("modo");
    if (m && MODOS[m]) setModo(m);
  }, []);

  const fonteDe = (m) => (m === "eventos" ? lugaresEv : m === "acervo" ? lugaresAc : m === "textos" ? lugaresTx : lugares);

  // câmera: o globo desliza para abrir espaço para a janela
  const voar = (opts, janela) => {
    const map = mapRef.current;
    if (!map) return;
    estado.current.voando = true;
    map.once("moveend", () => (estado.current.voando = false));
    map.flyTo({ duration: 2400, essential: true, ...opts, padding: acolchoado(janela) });
  };

  // mapa (uma vez)
  useEffect(() => {
    let cancelado = false;
    let raf;
    let retomar;

    (async () => {
      const mod = await import("maplibre-gl");
      const maplibregl = mod.default && mod.default.Map ? mod.default : mod;
      // o worker é servido como arquivo estático (o webpack do Next não empacota bem o worker do MapLibre)
      if (typeof maplibregl.setWorkerUrl === "function") maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
      // terras indígenas do mundo (LandMark, PMTiles lidos por pedaços direto do navegador)
      try {
        const { Protocol } = await import("pmtiles");
        if (typeof maplibregl.addProtocol === "function" && !window.__pmProto) {
          window.__pmProto = new Protocol();
          maplibregl.addProtocol("pmtiles", window.__pmProto.tile);
        }
      } catch (e) {}
      if (cancelado || !containerRef.current) return;
      mlRef.current = maplibregl;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: estilo,
        center: [-20, 10],
        zoom: 1.4,
        minZoom: 0.8,
        maxZoom: 18.5,
        pitch: 0,
        attributionControl: false,
        dragRotate: true,
        touchPitch: true,
      });
      mapRef.current = map;
      if (process.env.NODE_ENV !== "production") window.__mapaJodo = map; // só para depurar em desenvolvimento
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      map.on("error", (e) => {
        if (e && e.error && /Failed to fetch|NetworkError/i.test(String(e.error.message))) setErro(true);
      });
      map.on("zoom", () => acoes.current.atualizarPinos && acoes.current.atualizarPinos());

      // giro automático quando está longe e parado
      const loop = () => {
        const s = estado.current;
        if (!s.aberto && !s.interagindo && !s.voando && map.getZoom() < 3.4 && !map.isMoving()) {
          const c = map.getCenter();
          map.setCenter([c.lng + 0.035, c.lat]);
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const pausa = () => {
        estado.current.interagindo = true;
        clearTimeout(retomar);
      };
      const volta = () => {
        clearTimeout(retomar);
        retomar = setTimeout(() => (estado.current.interagindo = false), 3500);
      };
      map.on("mousedown", pausa);
      map.on("touchstart", pausa);
      map.on("wheel", pausa);
      map.on("mouseup", volta);
      map.on("touchend", volta);
      map.on("moveend", () => {
        if (estado.current.interagindo) volta();
      });

      map.once("load", () => {
        // terras indígenas: polígonos oficiais da FUNAI (dados simplificados em /dados/terras-indigenas.geojson)
        try {
          map.addSource("terras", { type: "geojson", data: "/dados/terras-indigenas.geojson" });
          const demarcada = ["in", ["get", "fase"], ["literal", ["Regularizada", "Homologada"]]];
          map.addLayer(
            {
              id: "terras-fill", type: "fill", source: "terras",
              paint: { "fill-color": "#e0884a", "fill-opacity": ["case", demarcada, 0.3, 0.12] },
            },
            "fronteira"
          );
          map.addLayer(
            {
              id: "terras-linha", type: "line", source: "terras",
              paint: {
                "line-color": "#f0a868",
                "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.5, 9, 1.4, 14, 2.2],
                "line-opacity": 0.85,
              },
            },
            "fronteira"
          );
          map.addLayer(
            {
              id: "terras-processo", type: "line", source: "terras", filter: ["!", demarcada],
              paint: { "line-color": "#0a0616", "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.5, 9, 1.4, 14, 2.2], "line-dasharray": [2, 2] },
            },
            "fronteira"
          );
          map.on("mouseenter", "terras-fill", () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", "terras-fill", () => (map.getCanvas().style.cursor = ""));
          map.on("click", "terras-fill", (e) => {
            const f = e.features && e.features[0];
            if (!f) return;
            const p = f.properties;
            const ha = Number(p.ha || 0).toLocaleString("pt-BR");
            const html = `<strong>${p.nome}</strong><span>Povo: ${p.povo || "não informado"}</span><span>${p.municipio || ""}${p.uf ? ", " + p.uf : ""}</span><span>${p.fase} · ${ha} ha</span><em>Fonte: FUNAI</em>`;
            new maplibregl.Popup({ closeButton: false, className: "popupTerra", maxWidth: "260px" }).setLngLat(e.lngLat).setHTML(html).addTo(map);
          });
        } catch (err) {}
        // fora do Brasil: LandMark (CC BY 4.0). No Brasil continua o FUNAI, que é a fonte oficial.
        try {
          map.addSource("terras-mundo", {
            type: "vector",
            url: "pmtiles://" + LANDMARK_PMTILES,
          });
          const fora = ["!=", ["get", "iso_code"], "BRA"];
          map.addLayer(
            { id: "terras-mundo-fill", type: "fill", source: "terras-mundo", "source-layer": "iplc-poly", filter: fora, paint: { "fill-color": "#e0884a", "fill-opacity": 0.2 } },
            "fronteira"
          );
          map.addLayer(
            {
              id: "terras-mundo-linha", type: "line", source: "terras-mundo", "source-layer": "iplc-poly", filter: fora,
              paint: { "line-color": "#f0a868", "line-width": ["interpolate", ["linear"], ["zoom"], 2, 0.3, 9, 1.2, 14, 2], "line-opacity": 0.7 },
            },
            "fronteira"
          );
          map.on("mouseenter", "terras-mundo-fill", () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", "terras-mundo-fill", () => (map.getCanvas().style.cursor = ""));
          map.on("click", "terras-mundo-fill", (e) => {
            const f = e.features && e.features[0];
            if (!f) return;
            const p = f.properties || {};
            const esc = (t) => String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
            const nome = p.name || p.NAME || p.nome || "Território indígena ou comunitário";
            const pais = p.country || p.COUNTRY || "";
            const tipo = p.identity === "Indigenous" ? "povo indígena" : p.identity === "Community" ? "comunidade local" : "";
            const html = `<strong>${esc(nome)}</strong><span>${esc(pais)}${tipo ? " · " + tipo : ""}</span>${p.category ? `<span>${esc(p.category)}</span>` : ""}<em>Fonte: ${esc(p.data_src_s || "dado nacional")} · via LandMark</em>`;
            new maplibregl.Popup({ closeButton: false, className: "popupTerra", maxWidth: "260px" }).setLngLat(e.lngLat).setHTML(html).addTo(map);
          });
        } catch (err) {}
        setPronto(true);
        setMapaPronto(true);
        // entrada: voa até o Brasil
        estado.current.voando = true;
        map.once("moveend", () => (estado.current.voando = false));
        map.flyTo({ center: [-48, -14], zoom: 2.4, duration: 3200, essential: true });
      });
    })();

    return () => {
      cancelado = true;
      cancelAnimationFrame(raf);
      clearTimeout(retomar);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // pinos do modo atual
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = mlRef.current;
    if (!mapaPronto || !map || !maplibregl) return;
    const marcadores = [];

    const abrirCidade = (i) => {
      const base = fonteDe(modo)[i];
      setSel({ cidade: i, evento: null });
      setTocando(null);
      setReproduz(false);
      setAno(null);
      voar({ center: [base.lon, base.lat], zoom: modo === "acervo" || modo === "textos" ? 7.5 : 10.5, pitch: modo === "acervo" || modo === "textos" ? 0 : 40 }, true);
    };
    acoes.current.abrirCidade = abrirCidade;

    const fonte = fonteDe(modo);
    fonte.forEach((lg, i) => {
      const itens = modo === "eventos" ? lg.eventos : modo === "acervo" ? lg.obras : modo === "textos" ? lg.textos : lg.artistas;
      const apagada = modo === "eventos" && itens.every((e) => e.passado);
      const el = document.createElement("button");
      el.className = `${styles.pinoMapa} ${styles.surge} ${apagada ? styles.apagado : ""}`;
      el.setAttribute("aria-label", `${lg.cidade}: ${itens.length}`);
      el.style.zIndex = String(10 + itens.length); // cidade com mais gente fica por cima (São Paulo sobre Guaratinguetá)
      el.innerHTML = `<span class="${styles.anel}"></span><span class="${styles.miolo}">${itens.length}</span><span class="${styles.cidade}">${lg.cidade}</span>`;
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        abrirCidade(i);
      });
      marcadores.push({ tipo: "cidade", el, m: new maplibregl.Marker({ element: el }).setLngLat([lg.lon, lg.lat]).addTo(map) });

      itens.forEach((it, k) => {
        if (modo === "acervo" || modo === "textos") return; // nesses modos o pino da cidade basta
        if (modo === "eventos") {
          const ee = document.createElement("button");
          ee.className = `${styles.pinoEvento} ${styles.surge} ${it.passado ? styles.apagado : ""}`;
          ee.style.setProperty("--cor", "var(--acento)");
          ee.setAttribute("aria-label", it.titulo);
          ee.innerHTML = `<span class="${styles.bolinhaMapa}"></span><span class="${styles.nomeMapa}"><b>${dataBR(it.quando).slice(0, 5)}</b> ${it.local}</span>`;
          ee.addEventListener("click", (ev) => {
            ev.stopPropagation();
            setSel({ cidade: i, evento: it.id });
            voar({ center: [it.lon, it.lat], zoom: 14.2, pitch: 50 }, true);
          });
          marcadores.push({ tipo: "detalhe", pos: [it.lon, it.lat], el: ee, m: new maplibregl.Marker({ element: ee }).setLngLat([it.lon, it.lat]).addTo(map) });
        } else {
          const [dx, dy] = deslocar(k, itens.length, itens.length > 1 ? 0.045 : 0);
          const pos = it.ponto ? [it.ponto.lon, it.ponto.lat] : [lg.lon + dx, lg.lat + dy];
          const ea = document.createElement("a");
          ea.className = `${styles.pinoArtista} ${styles.surge} ${it.colab ? styles.pinoColab : ""}`;
          ea.href = it.externo || `/artistas/${it.slug}`;
          if (it.externo) { ea.target = "_blank"; ea.rel = "noopener noreferrer"; }
          ea.style.setProperty("--cor", it.corPino || "var(--acento)");
          ea.setAttribute("aria-label", it.nome);
          ea.innerHTML = `<span class="${styles.bolinhaMapa}"></span><span class="${styles.nomeMapa}">${it.nome}</span>`;
          ea.addEventListener("click", (ev) => {
            if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;
            if (it.externo) return; // site próprio: deixa o link abrir normalmente
            ev.preventDefault();
            ev.stopPropagation();
            if (!it.temPagina) {
              setSel({ cidade: i, evento: it.slug });
              voar({ center: [pos[0], pos[1]], zoom: 12, pitch: 30 }, true);
              return;
            }
            const r = ea.getBoundingClientRect();
            const tipo = tipoDeTransicao(it.slug);
            window.dispatchEvent(new CustomEvent("jodo:transicao", { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, cor: it.corPino || "#cfcfe8", tipo } }));
            setTimeout(() => router.push(`/artistas/${it.slug}`), duracaoTransicao(tipo) - 40);
          });
          marcadores.push({ tipo: "detalhe", pos, el: ea, m: new maplibregl.Marker({ element: ea }).setLngLat(pos).addTo(map) });
        }
      });
    });

    const atualizarPinos = () => {
      const z = map.getZoom();
      // histerese: some ao passar de 4,6; volta ao descer de 4,0
      if (z > 4.6 && !estado.current.perto) { estado.current.perto = true; setZoomPerto(true); }
      else if (z < 4.0 && estado.current.perto) { estado.current.perto = false; setZoomPerto(false); }
      const c = map.getCenter();
      marcadores.forEach((x) => {
        // pinos individuais só aparecem perto de onde a câmera está (no globo, os de cidades distantes vazavam para a tela)
        if (x.tipo === "detalhe" && x.pos && (Math.abs(x.pos[0] - c.lng) > 3 || Math.abs(x.pos[1] - c.lat) > 3)) {
          x.el.style.display = "none";
          return;
        }
        if (x.tipo === "detalhe") x.el.classList.toggle(styles.soPonto, z < 10.4 || x.el.classList.contains(styles.pinoColab));
        const mostrar = x.tipo === "cidade" ? modo === "acervo" || modo === "textos" || z < ZOOM_DETALHE : z >= ZOOM_DETALHE;
        x.el.style.display = mostrar ? "" : "none";
        if (x.tipo === "cidade") x.el.classList.toggle(styles.rotuloVisivel, z >= 4.2);
      });
    };
    acoes.current.atualizarPinos = atualizarPinos;
    map.on("move", atualizarPinos);
    atualizarPinos();

    return () => {
      map.off("move", atualizarPinos);
      acoes.current.atualizarPinos = null;
      marcadores.forEach((x) => x.m.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapaPronto, modo, lugares, lugaresEv, lugaresAc, lugaresTx, router]);

  // liga/desliga a camada das terras indígenas
  useEffect(() => {
    const map = mapRef.current;
    if (!mapaPronto || !map) return;
    ["terras-fill", "terras-linha", "terras-processo", "terras-mundo-fill", "terras-mundo-linha"].forEach((id) => {
      try {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", terras ? "visible" : "none");
      } catch (e) {}
    });
  }, [mapaPronto, terras]);

  // a costa e as ruas do mapa também mudam de tom com o modo
  useEffect(() => {
    const map = mapRef.current;
    if (!mapaPronto || !map) return;
    const [claro, escuro] = TONS[modo] || TONS.artistas;
    const pinta = (id, cor) => {
      try {
        if (map.getLayer(id)) map.setPaintProperty(id, "line-color", cor);
      } catch (e) {}
    };
    pinta("costa", claro);
    pinta("ruas-grandes", claro);
    pinta("ruas-medias", escuro);
  }, [mapaPronto, modo]);

  const trocarModo = (novo) => {
    if (novo === modo) return;
    setSel(null);
    setTocando(null);
    setReproduz(false);
    setAno(null);
    setModo(novo);
    const map = mapRef.current;
    if (map && map.getZoom() > 3) voar({ zoom: 2.4, pitch: 0 }, false);
  };
  const fechar = () => {
    // do detalhe volta para a lista da cidade; da lista, volta para o mundo
    if (sel && sel.evento && sel.cidade !== null) {
      const lg = lugaresEv[sel.cidade];
      setSel({ cidade: sel.cidade, evento: null });
      voar({ center: [lg.lon, lg.lat], zoom: 10.5, pitch: 40 }, true);
      return;
    }
    if ((modo === "textos" || modo === "artistas") && sel && sel.evento) {
      setSel({ cidade: sel.cidade, evento: null });
      return;
    }
    setSel(null);
    voar({ zoom: 2.4, pitch: 0 }, false);
  };
  const zoom = (d) => {
    const map = mapRef.current;
    if (map) map.easeTo({ zoom: map.getZoom() + d, duration: 500 });
  };
  const entrarArtista = (e, a) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    const tipo = tipoDeTransicao(a.slug);
    window.dispatchEvent(new CustomEvent("jodo:transicao", { detail: { x: e.clientX, y: e.clientY, cor: a.corPino || "#cfcfe8", tipo } }));
    setTimeout(() => router.push(`/artistas/${a.slug}`), duracaoTransicao(tipo) - 40);
  };
  const abrirEvento = (cidade, e) => {
    setSel({ cidade, evento: e.id });
    voar({ center: [e.lon, e.lat], zoom: 14.2, pitch: 50 }, true);
  };

  const lg0 = sel && sel.cidade !== null ? (sel.cidade === -1 && modo === "acervo" ? todoAcervo : sel.cidade === -1 && modo === "textos" ? todosTextos : fonteDe(modo)[sel.cidade]) : null;
  const lg = lg0 && lg0.artistas ? { ...lg0, artistas: [...lg0.artistas].sort((x, y) => Number(!!x.colab) - Number(!!y.colab)) } : lg0;
  const fichaArt = modo === "artistas" && lg && sel && sel.evento ? lg.artistas.find((x) => x.slug === sel.evento) : null;
  const lendo = modo === "textos" && lg && sel.evento ? lg.textos.find((t) => t.id === sel.evento) : null;
  const abrirTudo = () => {
    setSel({ cidade: -1, evento: null });
    setTocando(null);
    setReproduz(false);
    setAno(null);
    voar({ zoom: 2.4, pitch: 0 }, true);
  };
  const abrirTudoTextos = () => {
    setSel({ cidade: -1, evento: null });
    voar({ zoom: 2.4, pitch: 0 }, true);
  };
  const obrasAno = lg && lg.obras ? lg.obras.filter((o) => !ano || o.data.slice(0, 4) === ano) : [];
  const anos = lg && lg.obras ? [...new Set(lg.obras.map((o) => o.data.slice(0, 4)))].sort().reverse() : [];
  const destaque = lg && lg.obras ? lg.obras.find((o) => o.id === tocando) || [...obrasAno].sort((a, b) => b.views - a.views)[0] : null;
  const ev = modo === "eventos" && sel && sel.evento && lg ? lg.eventos.find((e) => e.id === sel.evento) : null;
  const chaveJanela = sel ? `${modo}-${sel.cidade}-${sel.evento || "lista"}` : "fechada";

  return (
    <div className={`${styles.palco} ${pronto ? styles.pronto : ""}`} data-modo={modo}>
      <div ref={containerRef} className={styles.mapa} />

      <div className={`${styles.interface} ${zoomPerto ? styles.interfaceOculta : ""}`}>
      <MarcaMontanha />
      {(MODOS.eventos || MODOS.acervo || MODOS.textos) && (
      <nav className={styles.bordaEsq} aria-label="Principal">
        <button className={`${styles.aba} ${modo === "artistas" ? styles.abaAtiva : ""}`} onClick={() => trocarModo("artistas")}>
          Artistas
        </button>
        {MODOS.eventos && (
          <button className={`${styles.aba} ${modo === "eventos" ? styles.abaAtiva : ""}`} onClick={() => trocarModo("eventos")}>
            Eventos
          </button>
        )}
        {MODOS.acervo && (
          <button className={`${styles.aba} ${modo === "acervo" ? styles.abaAtiva : ""}`} onClick={() => trocarModo("acervo")}>
            Acervo
          </button>
        )}
        {MODOS.textos && (
          <button className={`${styles.aba} ${modo === "textos" ? styles.abaAtiva : ""}`} onClick={() => trocarModo("textos")}>
            Textos
          </button>
        )}
      </nav>
      )}
      {terras && (
        <p className={styles.creditoTerras}>terras indígenas fora do Brasil: <a href="https://landmarkmap.org" target="_blank" rel="noopener noreferrer">LandMark</a> (CC BY 4.0)</p>
      )}
      <p className={styles.rodape} title="Porque ainda estamos aqui" tabIndex={0}><i className={styles.rodapePonto} />ainda estamos aqui</p>
      {modo === "artistas" && (
        <div className={`${styles.filtros} ${filtroAberto ? styles.filtrosAberto : ""} ${MODOS.eventos || MODOS.acervo || MODOS.textos ? "" : styles.filtrosSemMenu}`}>
          <button className={styles.filtrosBotao} onClick={() => setFiltroAberto((v) => !v)} aria-expanded={filtroAberto}>
            filtrar <span>{totalArt}</span>
          </button>
          {filtroAberto && (
            <div className={styles.filtrosCorpo}>
              <div className={styles.filtroTopo}>
                <input
                  className={styles.filtroBusca}
                  type="search"
                  placeholder="buscar por nome"
                  value={filtro.busca}
                  onChange={(e) => mudarFiltro({ busca: e.target.value })}
                  aria-label="Buscar artista por nome"
                />
                {nFiltros > 0 && (
                  <button className={styles.filtroLimpar} onClick={() => mudarFiltro(VAZIO)}>limpar ({nFiltros})</button>
                )}
              </div>
              <div className={styles.filtroRolagem}>
                <section className={styles.filtroSecao}>
                  <h4>quem aparece</h4>
                  {QUEM.map(([k, r]) => (
                    <button key={k} className={filtro.quem === k ? styles.filtroOn : ""} onClick={() => mudarFiltro({ quem: k })}>
                      {r}
                    </button>
                  ))}
                </section>
                <section className={styles.filtroSecao}>
                  <h4>segmento</h4>
                  {SEGMENTOS.map((s) => (
                    <button key={s} className={filtro.seg.includes(s) ? styles.filtroOn : ""} onClick={() => mudarFiltro({ seg: alterna(filtro.seg, s) })}>
                      {s.toLowerCase()}<i>{contar("seg", (a) => (a.segmentos || []).includes(s))}</i>
                    </button>
                  ))}
                </section>
                <section className={styles.filtroSecao}>
                  <h4>último trabalho</h4>
                  {anosTodos.filter((y, i) => maisAnos || i < 3 || y === filtro.ano).map((y) => (
                    <button key={y} className={filtro.ano === y ? styles.filtroOn : ""} onClick={() => mudarFiltro({ ano: filtro.ano === y ? null : y })}>
                      {y}<i>{contar("ano", (a) => (ultimoAno[a.slug] || 0) === Number(y))}</i>
                    </button>
                  ))}
                  {anosTodos.length > 3 && (
                    <button className={styles.filtroMais} onClick={() => setMaisAnos((v) => !v)}>{maisAnos ? "menos anos" : "mais anos"}</button>
                  )}
                </section>
                <section className={styles.filtroSecao}>
                  <h4>onde</h4>
                  {REGIOES.map((r) => (
                    <button key={r} className={filtro.regiao === r ? styles.filtroOn : ""} onClick={() => mudarFiltro({ regiao: filtro.regiao === r ? null : r })}>
                      {r.toLowerCase()}<i>{contar("regiao", (a, lg) => regiaoDe(lg) === r)}</i>
                    </button>
                  ))}
                  <select value={filtro.cidade || ""} onChange={(e) => escolherCidade(e.target.value || null)} aria-label="Cidade">
                    <option value="">qualquer cidade</option>
                    {cidadesTodas.map((c) => ({ c, n: contar("cidade", (a, lg) => lg.cidade === c) })).filter((x) => x.n > 0 || x.c === filtro.cidade).map(({ c, n }) => <option key={c} value={c}>{c} ({n})</option>)}
                  </select>
                </section>
                <section className={styles.filtroSecao}>
                  <h4>página</h4>
                  <button className={filtro.pagina === "com" ? styles.filtroOn : ""} onClick={() => mudarFiltro({ pagina: filtro.pagina === "com" ? null : "com" })}>
                    com página<i>{contar("pagina", (a) => a.temPagina)}</i>
                  </button>
                  <button className={filtro.pagina === "sem" ? styles.filtroOn : ""} onClick={() => mudarFiltro({ pagina: filtro.pagina === "sem" ? null : "sem" })}>
                    só ficha<i>{contar("pagina", (a) => !a.temPagina)}</i>
                  </button>
                </section>
                <section className={styles.filtroSecao}>
                  <h4>com a JODO desde</h4>
                  {anosDesde.filter((y, i) => maisDesde || i < 3 || y === filtro.desde).map((y) => (
                    <button key={y} className={filtro.desde === y ? styles.filtroOn : ""} onClick={() => mudarFiltro({ desde: filtro.desde === y ? null : y })}>
                      {y}<i>{contar("desde", (a) => (stats.primeiro[a.slug] || 0) === Number(y))}</i>
                    </button>
                  ))}
                  {anosDesde.length > 3 && (
                    <button className={styles.filtroMais} onClick={() => setMaisDesde((v) => !v)}>{maisDesde ? "menos anos" : "mais anos"}</button>
                  )}
                </section>
                <section className={styles.filtroSecao}>
                  <h4>trabalhos no canal</h4>
                  {VOLUMES.map(([k, r, fn]) => (
                    <button key={k} className={filtro.volume === k ? styles.filtroOn : ""} onClick={() => mudarFiltro({ volume: filtro.volume === k ? null : k })}>
                      {r}<i>{contar("volume", (a) => fn(stats.n[a.slug] || 0))}</i>
                    </button>
                  ))}
                </section>
                <section className={styles.filtroSecao}>
                  <h4>onde achar</h4>
                  {LINKS.map((l) => (
                    <button key={l} className={filtro.link.includes(l) ? styles.filtroOn : ""} onClick={() => mudarFiltro({ link: alterna(filtro.link, l) })}>
                      {l.toLowerCase()}<i>{contar("link", (a) => (a.redes || []).some((r) => r.rotulo === l))}</i>
                    </button>
                  ))}
                </section>
                <section className={styles.filtroSecao}>
                  <h4>nos créditos como</h4>
                  {FUNCOES.map((fn) => (
                    <button key={fn} className={filtro.funcao.includes(fn) ? styles.filtroOn : ""} onClick={() => mudarFiltro({ funcao: alterna(filtro.funcao, fn) })}>
                      {fn}<i>{contar("funcao", (a) => (a.funcoes || []).includes(fn))}</i>
                    </button>
                  ))}
                </section>
              </div>
              {filtro.quem === "todos" && semLugar.length > 0 && (
                <p className={styles.filtroRodape}>{semLugar.length} {semLugar.length === 1 ? "pessoa ainda sem lugar" : "pessoas ainda sem lugar"} no mapa</p>
              )}
            </div>
          )}
        </div>
      )}
      {modo === "eventos" && !sel && !lugaresEv.some((c) => c.eventos.some((e) => !e.passado)) && (
        <p className={styles.semLugarMapa}>Nada marcado agora. Quando rolar, acende aqui.</p>
      )}

      {modo === "textos" && !sel && (
        <button className={styles.verTudo} onClick={abrirTudoTextos}>
          Ver todos os textos ({textos.length})
        </button>
      )}
      {modo === "acervo" && !sel && (
        <button className={styles.verTudo} onClick={abrirTudo}>
          Ver tudo ({acervo.length}){semLugarAc ? ` · ${semLugarAc} ainda sem lugar no mapa` : ""}
        </button>
      )}

      </div>

      <RodapeContato
        escondido={zoomPerto}
        extra={
          <button className={`${styles.camadaTerras} ${terras ? styles.camadaLigada : ""}`} onClick={() => setTerras((v) => !v)} aria-pressed={terras} title="Terras indígenas: FUNAI no Brasil, LandMark no resto do mundo">
            <i aria-hidden="true" />
            terras indígenas
          </button>
        }
      />

      {erro && <p className={styles.erroMapa}>Não consegui carregar o mapa. Verifique a conexão.</p>}

      <aside className={`${styles.janela} ${sel ? styles.janelaAberta : ""}`} aria-hidden={!sel}>
        {sel && (
          <div key={chaveJanela} className={styles.janelaConteudo}>
            <button className={styles.painelFechar} onClick={fechar}>
              {ev || lendo || fichaArt ? "Voltar" : "Fechar"}
            </button>

            {modo === "artistas" && lg && !fichaArt && (
              <>
                <p className={styles.painelPais}>{lg.pais}</p>
                <h2 className={styles.painelCidade}>{lg.cidade}</h2>
                <p className={styles.painelQtd}>{lg.artistas.length} artista(s)</p>
                <ul className={styles.lista}>
                  {lg.artistas.map((a, idx) => (
                    <li key={a.slug} className={a.colab ? styles.itemColab : ""}>
                      {a.colab && !(lg.artistas[idx - 1] && lg.artistas[idx - 1].colab) && <p className={styles.divisorLista}>já passaram pela JODO</p>}
                      {!a.temPagina && !a.externo ? (
                        <button className={`${styles.item} ${styles.itemBotao}`} style={{ "--cor": a.corPino || "var(--acento)" }} onClick={() => { setSel({ cidade: sel.cidade, evento: a.slug }); voar({ center: a.ponto ? [a.ponto.lon, a.ponto.lat] : [lg.lon, lg.lat], zoom: 12, pitch: 30 }, true); }}>
                          <span className={styles.bolinha} />
                          <span className={styles.itemTexto}>
                            <strong>{a.nome}</strong>
                            <em>
                              {a.papel}
                              {a.papel && a.tipo === "parceiro" ? " · " : ""}
                              {a.tipo === "parceiro" ? "parceiro" : ""}
                            </em>
                          </span>
                        </button>
                      ) : (
                      <Link href={a.externo || `/artistas/${a.slug}`} {...(a.externo ? { target: "_blank", rel: "noopener noreferrer" } : { onClick: (e) => entrarArtista(e, a), onMouseEnter: () => router.prefetch(`/artistas/${a.slug}`) })} className={styles.item} style={{ "--cor": a.corPino || "var(--acento)" }}>
                        <span className={styles.bolinha} />
                        <span className={styles.itemTexto}>
                          <strong>{a.nome}</strong>
                          <em>
                            {a.papel}
                            {a.papel && a.tipo === "parceiro" ? " · " : ""}
                            {a.tipo === "parceiro" ? "parceiro" : ""}
                            {!a.confirmado ? " · a confirmar" : ""}
                          </em>
                        </span>
                      </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {modo === "artistas" && lg && fichaArt && (
              <FichaArtista a={fichaArt} lg={lg} dados={dadosFicha(fichaArt)} />
            )}

            {modo === "acervo" && lg && destaque && (
              <>
                <p className={styles.painelPais}>{lg.pais || "Canal da JODO"}</p>
                <h2 className={styles.painelCidade}>{lg.cidade}</h2>
                <p className={styles.painelQtd}>{lg.obras.length} trabalho(s)</p>
                <div className={styles.tela}>
                  {reproduz && tocando === destaque.id ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${destaque.id}?autoplay=1&rel=0`}
                      title={destaque.titulo}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      className={styles.capa}
                      onClick={() => {
                        setTocando(destaque.id);
                        setReproduz(true);
                      }}
                      aria-label={`Assistir: ${destaque.titulo}`}
                    >
                      <img src={`https://i.ytimg.com/vi/${destaque.id}/hqdefault.jpg`} alt="" />
                      <span className={styles.play}>▶</span>
                    </button>
                  )}
                </div>
                <p className={styles.tituloObra}>{destaque.titulo}</p>
                <p className={styles.metaObra}>
                  {destaque.data.slice(0, 4)}
                  {destaque.views ? ` · ${fmtViews(destaque.views)} views` : ""}
                  {destaque.conf === "media" ? " · lugar a confirmar" : ""}
                </p>
                <div className={styles.anos}>
                  <button className={!ano ? styles.anoAtivo : ""} onClick={() => setAno(null)}>
                    Todos
                  </button>
                  {anos.map((a) => (
                    <button key={a} className={ano === a ? styles.anoAtivo : ""} onClick={() => setAno(a)}>
                      {a}
                    </button>
                  ))}
                </div>
                <ul className={styles.programacao}>
                  {obrasAno.map((o) => (
                    <li key={o.id}>
                      <button
                        className={`${styles.obra} ${o.id === destaque.id ? styles.obraAtiva : ""}`}
                        onClick={() => {
                          setTocando(o.id);
                          setReproduz(false);
                        }}
                      >
                        <img src={`https://i.ytimg.com/vi/${o.id}/default.jpg`} alt="" loading="lazy" />
                        <span>
                          <strong>{o.titulo}</strong>
                          <em>{o.data.slice(0, 4)}</em>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {modo === "textos" && lg && !lendo && (
              <>
                <p className={styles.painelPais}>{lg.pais || "JODO"}</p>
                <h2 className={styles.painelCidade}>{lg.cidade}</h2>
                <p className={styles.painelQtd}>{lg.textos.length} texto(s)</p>
                <ul className={styles.lista}>
                  {lg.textos.map((t) => (
                    <li key={t.id}>
                      <button className={`${styles.item} ${styles.itemBotao} ${styles.itemTexto2}`} onClick={() => setSel({ cidade: sel.cidade, evento: t.id })}>
                        {t.capa && <img className={styles.capaTexto} src={t.capa} alt="" loading="lazy" />}
                        <span className={styles.itemTexto}>
                          <strong>{t.titulo}</strong>
                          <em>
                            {t.autor ? `${t.autor} · ` : ""}
                            {t.data ? t.data.split("-").reverse().join("/") : ""}
                          </em>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {modo === "textos" && lendo && (
              <article className={styles.leitura}>
                {lendo.capa && <img className={styles.leituraCapa} src={lendo.capa} alt="" />}
                <p className={styles.leituraMeta}>
                  {lendo.autor ? `${lendo.autor} · ` : ""}
                  {lendo.data ? lendo.data.split("-").reverse().join("/") : ""}
                </p>
                <h2 className={styles.leituraTitulo}>{lendo.titulo}</h2>
                {lendo.subtitulo && <p className={styles.leituraSub}>{lendo.subtitulo}</p>}
                {lendo.corpo.map((par, i) => (
                  <p key={i} className={styles.leituraPar}>
                    {par}
                  </p>
                ))}
              </article>
            )}

            {modo === "eventos" && lg && !ev && (
              <>
                <p className={styles.painelPais}>{lg.pais}</p>
                <h2 className={styles.painelCidade}>{lg.cidade}</h2>
                <p className={styles.painelQtd}>{lg.eventos.length} evento(s)</p>
                <ul className={styles.lista}>
                  {lg.eventos.map((e) => (
                    <li key={e.id}>
                      <button className={`${styles.item} ${styles.itemBotao} ${e.passado ? styles.itemApagado : ""}`} style={{ "--cor": "var(--acento)" }} onClick={() => abrirEvento(sel.cidade, e)}>
                        <span className={styles.bolinha} />
                        <span className={styles.itemTexto}>
                          <strong>{e.titulo}</strong>
                          <em>
                            {dataBR(e.quando)} · {e.local} · {e.passado ? "já rolou" : "vem aí"}
                          </em>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {modo === "eventos" && ev && (
              <>
                <img className={styles.cartaz} src={ev.cartaz} alt={`Cartaz: ${ev.titulo}`} />
                <p className={styles.estadoEv} style={{ "--cor": ev.cor }}>
                  {ev.passado ? "Já rolou" : "Vem aí"} · {dataBR(ev.quando)}
                </p>
                <h2 className={styles.tituloEv}>{ev.titulo}</h2>
                <p className={styles.subEv}>{ev.sub}</p>
                <p className={styles.localEv}>
                  <b>{ev.local}</b>
                  <br />
                  {ev.endereco}
                  {ev.aproximado && <small> (posição no mapa aproximada)</small>}
                </p>
                {ev.link && (
                  <a className={styles.botaoEv} href={ev.link} target="_blank" rel="noopener noreferrer">
                    {ev.linkRotulo || "Ver"}
                  </a>
                )}
              </>
            )}
          </div>
        )}
      </aside>

    </div>
  );
}
