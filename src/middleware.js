// Subdomínio por artista: makalister.jodo.com.br mostra /artistas/makalister.
// E jodo.com.br/artistas/<slug> redireciona para o subdomínio. Lista central em src/data/subdominios.js.
import { NextResponse } from "next/server";
import { SUB_PARA_SLUG, SLUG_PARA_SUB, RAIZ } from "@/data/subdominios";

export function middleware(req) {
  const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];
  const { pathname } = req.nextUrl;

  let sub = null;
  if (host.endsWith("." + RAIZ)) sub = host.slice(0, -(RAIZ.length + 1));
  else if (host.endsWith(".localhost")) sub = host.slice(0, -".localhost".length);

  if (sub && sub !== "www") {
    const slug = SUB_PARA_SLUG[sub];
    if (!slug) return NextResponse.redirect(`https://${RAIZ}/`, 307); // subdomínio que não existe
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = `/artistas/${slug}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // domínio raiz: a página do artista passa a morar no subdomínio
  const m = pathname.match(/^\/artistas\/([^/]+)\/?$/);
  if (m && SLUG_PARA_SUB[m[1]] && (host === RAIZ || host === "www." + RAIZ)) {
    return NextResponse.redirect(`https://${SLUG_PARA_SUB[m[1]]}.${RAIZ}/`, 308);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/artistas/:path*"] };
