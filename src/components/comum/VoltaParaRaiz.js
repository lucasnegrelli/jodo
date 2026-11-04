"use client";
// Nos subdomínios (makalister.jodo.com.br), "/" é a página do artista. Os links "← JODO" apontam para "/", então levamos esses cliques ao site raiz.
import { useEffect } from "react";
import { RAIZ } from "@/data/subdominios";

export default function VoltaParaRaiz() {
  useEffect(() => {
    const h = window.location.hostname;
    const sub = h.endsWith("." + RAIZ) && h !== "www." + RAIZ;
    const subLocal = h.endsWith(".localhost");
    if (!sub && !subLocal) return;
    const raiz = subLocal ? `http://localhost:${window.location.port}/` : `https://${RAIZ}/`;
    const aoClicar = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest("a");
      if (!a || a.getAttribute("href") !== "/") return;
      e.preventDefault();
      e.stopPropagation();
      window.location.href = raiz;
    };
    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, []);
  return null;
}
