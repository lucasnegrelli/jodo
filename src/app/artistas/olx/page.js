import { permanentRedirect } from "next/navigation";

// a página do Herick OLX usa o mesmo slug do mapa
export default function PaginaOlx() {
  permanentRedirect("/artistas/herick-olx");
}
