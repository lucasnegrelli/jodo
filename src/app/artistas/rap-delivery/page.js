import ContinuoRD from "@/components/sala/ContinuoRD";
import { integrantes, paradas } from "@/data/rapdelivery";

export const metadata = {
  title: "Rap Delivery | JODO",
  description: "Rap Delivery: 1cort3, Sergio Estranho, domrafa e 82. Do pedido ao Rimas pra Viagem, e o Cyber Delivery vindo aí.",
};

export default function PaginaRapDelivery() {
  const vistos = new Set();
  let views = 0;
  paradas.forEach((p) =>
    p.faixas.forEach((f) => {
      if (vistos.has(f.yt)) return;
      vistos.add(f.yt);
      views += f.views || 0;
    })
  );
  return <ContinuoRD integrantes={integrantes} paradas={paradas} total={{ videos: vistos.size, views }} />;
}
