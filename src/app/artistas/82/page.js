import Continuo82 from "@/components/sala/Continuo82";
import { identidades, fases } from "@/data/trabalhos82";
import { extras } from "@/data/videos82.generated";
import { extrasCanais } from "@/data/videos82.canais";
import { confirmados } from "@/data/creditos82";
import { montarPainel } from "@/data/painel82";

export const metadata = {
  title: "82 | JODO",
  description:
    "82: de Slim e Vísceras82 a Altamente82 e KRAPNEK82. K-OS, Intravenal, Häxan, Realeza e o painel de tudo que filmou e editou.",
};

export default function Pagina82() {
  // só entra vídeo da playlist By82 ou com o nome do 82 na ficha técnica
  const ok = (i) => i.yt && confirmados[i.yt];
  const curados = fases.filter((f) => f.faixa !== "arquivo").flatMap((f) => f.itens.filter(ok));
  const exOk = extras.filter((e) => confirmados[e.yt]);

  // o Rap Delivery é projeto à parte (página própria)
  const painel = montarPainel([...curados, ...exOk, ...extrasCanais]);
  painel.videos = painel.videos.filter((v) => !v.artistas.includes("Rap Delivery"));
  painel.artistas = painel.artistas.filter((a) => a.nome !== "Rap Delivery");
  painel.totais.views = painel.videos.reduce((s, v) => s + v.views, 0);
  painel.totais.videos = painel.videos.length;
  painel.totais.artistas = painel.artistas.length;

  // "Antes": grupos por parceria, em vez do rótulo antigo "Altamente82 e os meninos"
  const todos = Object.fromEntries(fases.flatMap((f) => f.itens.filter((i) => i.yt).map((i) => [i.yt, i])));
  const pega = (ids) => ids.map((id) => todos[id]).filter(Boolean);
  const discos = [
    {
      id: "sergio",
      anos: "2020 — 2023",
      titulo: "82 × Sergio Estranho",
      nota: "playlist “Sé Estranho x 82”",
      historia:
        "Daqui veio a ideia do Rap Delivery: o Sergio e o Caio (1cort3) já tinham começado a ideia, eu era amigo dos dois e só juntei o domrafa no mesmo pique.",
      itens: [
        ...pega(["F2iYy4h-_7U", "ZBYOJDHv2fA", "gM1-pOvLtC4", "IPQMiwySfjE", "glCdBWhbeRY"]),
        { yt: "KMeGs2M7kgQ", data: "2021", titulo: "Entranhas Da Cidade", quem: "Sergio Estranho · 82 (SoloCura)", papel: "artista", views: null },
      ],
    },
    {
      id: "manaus",
      anos: "2019 — 2021",
      titulo: "Manaus: primeiros sons, Dog House e parcerias",
      itens: pega(["RYqfqbxcpX8", "taX3TlV3b14", "louukt1mDTg", "o3uYzhP1NzA", "IV30_dZ_dm8", "ytHHKm_wKDc"]),
    },
  ].map((g) => ({ ...g, itens: g.itens.filter((i) => i && (confirmados[i.yt] || i.yt === "KMeGs2M7kgQ")) }));

  const serie = painel.videos
    .filter((v) => /^no meio \(ep/i.test(v.titulo))
    .sort((a, b) => a.data.localeCompare(b.data));

  return <Continuo82 identidades={identidades} painel={painel} discos={discos} serie={serie} />;
}
