import { redirect } from "next/navigation";
import { MODOS } from "@/data/modos";

// os eventos moram no mundo (home), no modo "eventos"; fechado enquanto MODOS.eventos for false
export default function EventosPage() {
  redirect(MODOS.eventos ? "/?modo=eventos" : "/");
}
