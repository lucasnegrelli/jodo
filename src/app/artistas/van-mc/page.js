// A página do Van MC é uma experiência própria (muro + 10 salas) que vive em public/van-mc.
// Código-fonte e como gerar: artistas/van-mc (LEIA-ME.md). Depois de mudar lá, rodar `python sincronizar.py`.
export const metadata = {
  title: "Van MC | JODO",
  description: "Van MC, rap de Manaus: dez vídeos de 2018 a 2025. Quebre o muro.",
};

export default function PaginaVanMC() {
  return (
    <iframe
      src="/van-mc/index.html"
      title="Van MC"
      allow="autoplay; fullscreen"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0, background: "#030303" }}
    />
  );
}
