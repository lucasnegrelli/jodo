# JODO

Plataforma de artistas da JODO: um mapa-globo interativo, uma página própria por artista e um acervo de trabalhos.

- **Stack:** Next.js 14 (App Router), React 18, MapLibre, Three.js, GSAP, Lenis.
- **Dados:** por enquanto locais, em `src/data/` (`mapa.js` com artistas e lugares, `acervo.js`, `eventos.js`, `textos.js`). Banco e login (Supabase) entram em seguida.
- **Páginas de artista:** `src/app/artistas/<artista>/page.js`, uma feita à mão por artista. Estilos em `src/styles/`.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
```

Copie `.env.example` para `.env.local` quando houver variáveis a preencher.

## Deploy

Vercel, ligada a este repositório (branch `main`). O workflow `supabase-keepalive` mantém o projeto Supabase do plano grátis acordado.
