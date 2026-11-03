/*
  Estilo do mapa JODO (escuro + neon). Dados: OpenStreetMap via OpenFreeMap (esquema OpenMapTiles).
  Atribuição obrigatória: "OpenFreeMap © OpenMapTiles, dados © OpenStreetMap contributors".
*/

const VERDE = "#a99bd6"; // cor das linhas principais (antes verde neon; agora lilás discreto)
const ROXO = "#6a5a9e";

const nome = ["coalesce", ["get", "name:pt"], ["get", "name:latin"], ["get", "name"]];

const estilo = {
  version: 8,
  name: "JODOVERSO",
  projection: { type: "globe" },
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    omt: { type: "vector", url: "https://tiles.openfreemap.org/planet", attribution: '<a href="https://openfreemap.org">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/">OpenMapTiles</a> dados © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  },
  layers: [
    { id: "fundo", type: "background", paint: { "background-color": "#1c1233" } },

    { id: "agua", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": "#0a0616" } },
    { id: "costa", type: "line", source: "omt", "source-layer": "water", paint: { "line-color": VERDE, "line-width": ["interpolate", ["linear"], ["zoom"], 0, 0.6, 6, 1, 14, 1.6], "line-opacity": 0.7 } },
    { id: "rios", type: "line", source: "omt", "source-layer": "waterway", paint: { "line-color": "#2b1445", "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 16, 2] } },

    { id: "mata", type: "fill", source: "omt", "source-layer": "landcover", filter: ["==", ["get", "class"], "wood"], paint: { "fill-color": "#0f1a10", "fill-opacity": 0.8 } },
    { id: "parque", type: "fill", source: "omt", "source-layer": "park", paint: { "fill-color": "#102014", "fill-opacity": 0.85 } },
    { id: "uso", type: "fill", source: "omt", "source-layer": "landuse", minzoom: 9, filter: ["in", ["get", "class"], ["literal", ["residential", "commercial", "industrial", "retail"]]], paint: { "fill-color": "#141018", "fill-opacity": 0.7 } },

    { id: "fronteira", type: "line", source: "omt", "source-layer": "boundary", filter: ["<=", ["get", "admin_level"], 4], paint: { "line-color": ROXO, "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.6, 8, 1.4], "line-dasharray": [3, 2] } },

    {
      id: "ruas-pequenas", type: "line", source: "omt", "source-layer": "transportation", minzoom: 12,
      filter: ["in", ["get", "class"], ["literal", ["minor", "service", "path", "track"]]],
      paint: { "line-color": "#3a3160", "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.4, 18, 4], "line-opacity": 0.9 },
    },
    {
      id: "ruas-medias", type: "line", source: "omt", "source-layer": "transportation", minzoom: 8,
      filter: ["in", ["get", "class"], ["literal", ["secondary", "tertiary"]]],
      paint: { "line-color": "#4d4378", "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.2, 12, 0.5, 15, 1.6, 18, 6], "line-opacity": 0.7 },
    },
    {
      id: "ruas-grandes", type: "line", source: "omt", "source-layer": "transportation", minzoom: 4,
      filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]],
      paint: { "line-color": VERDE, "line-width": ["interpolate", ["linear"], ["zoom"], 4, 0.3, 10, 0.8, 14, 2, 18, 9], "line-opacity": 0.6 },
    },

    {
      id: "predios-base", type: "fill", source: "omt", "source-layer": "building", minzoom: 13, maxzoom: 15,
      paint: { "fill-color": "#17101f", "fill-outline-color": "#3a2260" },
    },
    {
      id: "predios-3d", type: "fill-extrusion", source: "omt", "source-layer": "building", minzoom: 14,
      paint: {
        "fill-extrusion-color": "#1a1226",
        "fill-extrusion-height": ["coalesce", ["get", "render_height"], 6],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.92,
      },
    },

    {
      id: "nomes-ruas", type: "symbol", source: "omt", "source-layer": "transportation_name", minzoom: 14,
      layout: { "symbol-placement": "line", "text-field": nome, "text-font": ["Noto Sans Regular"], "text-size": 11 },
      paint: { "text-color": "#ddd7f0", "text-halo-color": "#0b0b0b", "text-halo-width": 1.4 },
    },
    {
      id: "paises", type: "symbol", source: "omt", "source-layer": "place", maxzoom: 5,
      filter: ["==", ["get", "class"], "country"],
      layout: { "text-field": nome, "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 1, 10, 5, 15], "text-transform": "uppercase", "text-letter-spacing": 0.15 },
      paint: { "text-color": "#bba6ff", "text-halo-color": "#0b0b0b", "text-halo-width": 1.5 },
    },
    {
      id: "cidades", type: "symbol", source: "omt", "source-layer": "place", minzoom: 4,
      filter: ["in", ["get", "class"], ["literal", ["city", "town", "village", "suburb", "neighbourhood"]]],
      layout: { "text-field": nome, "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 4, 11, 14, 16] },
      paint: { "text-color": "#ffffff", "text-halo-color": "#0b0b0b", "text-halo-width": 1.6 },
    },
  ],
};

export default estilo;



