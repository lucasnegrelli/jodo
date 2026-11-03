import Mapa from "@/components/mundo/Mapa";
import { EVENTOS } from "@/data/eventos";
import { ACERVO } from "@/data/acervo";
import { TEXTOS } from "@/data/textos";
import { getTodos, getPorLugar, getSemLugar, manifesto } from "@/data/mapa";

export const metadata = {
  title: "JODO | Porque ainda estamos aqui",
  description: manifesto,
};

export default function HomePage() {
  const todos = getTodos();
  const lugares = getPorLugar();
  const semLugar = getSemLugar();

  return (
    <main>
      <Mapa lugares={lugares} semLugar={semLugar} eventos={EVENTOS} acervo={ACERVO} textos={TEXTOS} />
      <div className="sr-only">
        <h2>JODO</h2>
        <p>{manifesto}</p>
        <ul>
          {todos.map((a) => (
            <li key={a.slug}>
              <a href={a.externo || `/artistas/${a.slug}`}>{a.nome}</a>
              {a.lugar ? ` (${a.lugar.cidade}, ${a.lugar.pais})` : ""}: {a.resumo}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

