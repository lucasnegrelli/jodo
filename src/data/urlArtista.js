// Endereço da página de um artista. Em produção: o subdomínio (https://vblow.jodo.com.br/). Em desenvolvimento: a rota local.
import { SLUG_PARA_SUB, RAIZ } from "@/data/subdominios";

export function urlArtista(slug) {
  const sub = SLUG_PARA_SUB[slug];
  if (!sub || process.env.NODE_ENV !== "production") return `/artistas/${slug}`;
  return `https://${sub}.${RAIZ}/`;
}
