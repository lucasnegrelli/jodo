import { redirect } from "next/navigation";

// os textos moram no mundo (home), no modo "textos"
export default function ArtigosPage() {
  redirect("/?modo=textos");
}
