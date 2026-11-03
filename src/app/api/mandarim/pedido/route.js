import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

/*
  Placar público do pedido "solta a mixtape" (página do eL Mandarim).
  Guarda só contagens e um id aleatório do navegador (cookie), nunca nome, e-mail ou IP puro:
  o IP entra só como hash com sal, para frear quem vota em massa. O arquivo fica em .dados/, fora de /public.
  Funciona porque o site roda num servidor Node próprio (PM2). Em hospedagem sem disco, trocar por um banco.
*/
export const dynamic = "force-dynamic";

const ARQ = path.join(process.cwd(), ".dados", "mandarim-pedidos.json");
const OPCOES = ["tudo", "semana", "clipe", "nao"]; // "nao" = quem prefere que ele fique na depressão (vale como voto, não como pedido)
const SAL = process.env.MANDARIM_SAL || "jodo-mandarim";
const LIMITE_POR_IP_DIA = 8;

const vazio = () => ({ votos: { tudo: 0, semana: 0, clipe: 0, nao: 0 }, quem: {}, ips: {} });
const ler = () => {
  try { return { ...vazio(), ...JSON.parse(fs.readFileSync(ARQ, "utf8")) }; } catch { return vazio(); }
};
const gravar = (d) => {
  fs.mkdirSync(path.dirname(ARQ), { recursive: true });
  fs.writeFileSync(ARQ, JSON.stringify(d));
};
const resumo = (d, id) => ({
  total: OPCOES.reduce((s, o) => s + (d.votos[o] || 0), 0),
  votos: d.votos,
  meu: id && d.quem[id] ? d.quem[id] : null,
});

export async function GET(req) {
  const id = req.cookies.get("man_pedido")?.value;
  return NextResponse.json(resumo(ler(), id), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  let corpo = {};
  try { corpo = await req.json(); } catch {}
  const opcao = corpo?.opcao;
  if (!OPCOES.includes(opcao)) return NextResponse.json({ erro: "opção inválida" }, { status: 400 });

  const d = ler();
  let id = req.cookies.get("man_pedido")?.value;
  if (id && d.quem[id]) return NextResponse.json(resumo(d, id)); // um voto por navegador

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "sem-ip";
  const hash = crypto.createHash("sha256").update(SAL + ip).digest("hex").slice(0, 16);
  const agora = Date.now();
  const reg = d.ips[hash];
  if (reg && agora - reg.t < 864e5 && reg.n >= LIMITE_POR_IP_DIA) return NextResponse.json({ erro: "muitos votos desse lugar hoje" }, { status: 429 });
  d.ips[hash] = reg && agora - reg.t < 864e5 ? { n: reg.n + 1, t: reg.t } : { n: 1, t: agora };

  if (!id) id = crypto.randomUUID();
  d.quem[id] = opcao;
  d.votos[opcao] = (d.votos[opcao] || 0) + 1;
  gravar(d);

  const res = NextResponse.json(resumo(d, id));
  res.cookies.set("man_pedido", id, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return res;
}
