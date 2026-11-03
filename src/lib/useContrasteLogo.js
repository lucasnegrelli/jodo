"use client";

import { useEffect } from "react";

/*
 * A montanha da JODO no topo troca de cor conforme o que passa por baixo dela.
 * Marque a imagem com data-logo-contraste e o contêiner do cabeçalho com data-logo-zona.
 * O hook amostra o fundo logo atrás da marca (cor sólida, imagem ou vídeo) e inverte
 * a marca (branca <-> preta) quando o contraste ficaria baixo.
 */

const cacheImg = new Map();

function lum(r, g, b) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function parseCor(s) {
  const m = s && s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(",").map((x) => parseFloat(x));
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}

let canvas;
function pixel(fonte, nw, nh, sx, sy) {
  try {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(fonte, Math.max(0, Math.min(nw - 1, sx)), Math.max(0, Math.min(nh - 1, sy)), 1, 1, 0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
  } catch {
    return null;
  }
}

// ponto (x,y) da tela -> ponto na imagem natural, respeitando object-fit/position (centro)
function mapear(el, r, x, y, fit, nw, nh) {
  const u = (x - r.left) / r.width;
  const v = (y - r.top) / r.height;
  if (fit === "fill" || fit === "none") return [u * nw, v * nh];
  const esc = fit === "contain" ? Math.min(r.width / nw, r.height / nh) : Math.max(r.width / nw, r.height / nh);
  const w = nw * esc, h = nh * esc;
  const ox = (r.width - w) / 2, oy = (r.height - h) / 2;
  return [((x - r.left - ox) / w) * nw, ((y - r.top - oy) / h) * nh];
}

function amostrar(x, y) {
  const todos = document.querySelectorAll("body *");
  let melhor = null;
  let melhorZ = -Infinity;
  let ordem = 0;
  for (const el of todos) {
    ordem++;
    if (el.closest("[data-logo-zona]")) continue;
    const tag = el.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (parseFloat(cs.opacity) < 0.35) continue;
    // só conta quem pinta algo
    let cor = null;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS") {
      const nw = tag === "IMG" ? el.naturalWidth : tag === "CANVAS" ? el.width : el.videoWidth;
      const nh = tag === "IMG" ? el.naturalHeight : tag === "CANVAS" ? el.height : el.videoHeight;
      if (nw && nh) {
        const [sx, sy] = mapear(el, r, x, y, cs.objectFit || "fill", nw, nh);
        cor = pixel(el, nw, nh, Math.round(sx), Math.round(sy));
      }
    } else {
      const bg = parseCor(cs.backgroundColor);
      if (bg && bg.a > 0.55) cor = bg;
      const bi = cs.backgroundImage;
      if (!cor && bi && bi.startsWith("url(")) {
        const url = bi.slice(5, -2).replace(/["']/g, "");
        let im = cacheImg.get(url);
        if (!im) {
          im = new Image();
          im.src = url;
          cacheImg.set(url, im);
        }
        if (im.complete && im.naturalWidth) {
          const fit = cs.backgroundSize === "contain" ? "contain" : cs.backgroundSize === "cover" ? "cover" : "fill";
          const [sx, sy] = mapear(el, r, x, y, fit, im.naturalWidth, im.naturalHeight);
          cor = pixel(im, im.naturalWidth, im.naturalHeight, Math.round(sx), Math.round(sy));
        }
      }
    }
    if (!cor || cor.a < 0.5) continue;
    const zi = parseInt(cs.zIndex, 10);
    const z = (Number.isNaN(zi) ? 0 : zi) * 100000 + ordem;
    if (z >= melhorZ) {
      melhorZ = z;
      melhor = cor;
    }
  }
  return melhor;
}

export default function useContrasteLogo() {
  useEffect(() => {
    let estado = null; // "claro" | "escuro"
    let t = 0;
    const rodar = () => {
      const logos = [...document.querySelectorAll("[data-logo-contraste]")];
      if (!logos.length) return;
      const alvo = logos.find((l) => l.getBoundingClientRect().width > 0) || logos[0];
      const r = alvo.getBoundingClientRect();
      const cy = r.top + r.height / 2;
      const pts = [r.left + r.width * 0.2, r.left + r.width * 0.5, r.left + r.width * 0.8];
      let soma = 0, n = 0;
      pts.forEach((px) => {
        const c = amostrar(px, cy);
        if (c) {
          soma += lum(c.r, c.g, c.b);
          n++;
        }
      });
      if (!n) return;
      const L = soma / n;
      // histerese: troca só quando passa bem do ponto de equilíbrio
      let novo = estado;
      if (estado !== "escuro" && L > 0.5) novo = "escuro";
      else if (estado !== "claro" && L < 0.38) novo = "claro";
      if (novo !== estado) {
        estado = novo;
        logos.forEach((l) => {
          l.style.transition = "filter 0.25s linear";
          l.style.filter = estado === "escuro" ? "invert(1)" : "";
        });
      }
    };
    const agendar = () => {
      clearTimeout(t);
      t = setTimeout(rodar, 90);
    };
    const iv = setInterval(rodar, 400);
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    agendar();
    return () => {
      clearInterval(iv);
      clearTimeout(t);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
    };
  }, []);
}
