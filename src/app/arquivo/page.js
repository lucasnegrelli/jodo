import { redirect } from "next/navigation";

// o acervo mora no mundo (home), no modo "acervo"
export default function ArquivoPage() {
  redirect("/");
}
