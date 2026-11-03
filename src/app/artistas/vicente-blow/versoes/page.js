import Link from "next/link";

export const metadata = { title: "Vicente Blow · versões | JODO", robots: { index: false } };

// índice das versões que ficaram guardadas, para mostrar ao artista depois da principal
const VERSOES = [
  { href: "/artistas/vicente-blow", nome: "Principal · tecido", txt: "A versão escolhida: balaio de arumã em shader, padrões baniwa, capas e clipes como figura." },
  { href: "/artistas/vicente-blow/trama", nome: "Trama v1", txt: "O mesmo tecido em canvas 2D, antes da diagramação de eixo central." },
  { href: "/artistas/vicente-blow/losango", nome: "Losango", txt: "Pele de padrões geométricos com retrato em meio-tom de losangos e lanterna." },
  { href: "/artistas/vicente-blow/mapa", nome: "Mapa", txt: "Território gerado por lançamento, mata viva com silhuetas de bichos, discografia por ano." },
  { href: "/artistas/vicente-blow/caderno", nome: "Caderno", txt: "Capítulos desenhados a carvão, com a floresta pegando fogo." },
  { href: "/artistas/vicente-blow/rua", nome: "Rua", txt: "Colagem de fotos reais do Centro de Manaus, em camadas com parallax." },
];

export default function Versoes() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0a10", color: "#e9dfc9", padding: "10vh 6vw", fontFamily: "Archivo, Arial, sans-serif" }}>
      <p style={{ font: "700 12px/1 monospace", letterSpacing: "0.22em", textTransform: "uppercase", color: "#d2381a", margin: 0 }}>vicente blow · versões guardadas</p>
      <h1 style={{ font: "400 clamp(40px,7vw,96px)/0.95 Anton, Impact, sans-serif", textTransform: "uppercase", margin: "16px 0 40px" }}>Versões</h1>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 14, maxWidth: 760 }}>
        {VERSOES.map((v) => (
          <li key={v.href}>
            <Link href={v.href} style={{ display: "block", padding: "16px 20px", border: "1px solid rgba(233,223,201,0.2)", color: "inherit", textDecoration: "none" }}>
              <b style={{ display: "block", fontSize: 20, marginBottom: 4 }}>{v.nome} ↗</b>
              <span style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>{v.txt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
