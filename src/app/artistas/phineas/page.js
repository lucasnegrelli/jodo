import RegistrosPH from "@/components/sala/RegistrosPH";
import RegistrosPHVideo from "@/components/sala/RegistrosPHVideo";

export const metadata = {
  title: "akaphineas | JODO",
  description: "akaphineas: poeta de São Paulo. Registros de 2018 a 2026.",
};

// padrão: vídeo único (melhor qualidade). ?modo=quadros usa a sequência de quadros (reserva).
export default function PaginaPhineas({ searchParams }) {
  const modo = searchParams && searchParams.modo;
  return modo === "quadros" ? <RegistrosPH /> : <RegistrosPHVideo />;
}
