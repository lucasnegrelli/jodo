// Cota do Rio Negro no porto de Manaus (ANA, estação 14990000). Busca o último valor medido e guarda por 1 hora
// (cache do Next), então a página do PRISM∆ se atualiza sozinha, sem ninguém mexer.
export const revalidate = 3600;

const EST = "14990000";
const dd = (d) => `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;

export async function GET() {
  const base = new Date(Date.now() - 3 * 3600 * 1000); // horário de Manaus (UTC-4), com folga
  for (let k = 0; k < 5; k++) {
    const d = new Date(base.getTime() - k * 86400000);
    const s = dd(d);
    try {
      const r = await fetch(
        `http://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${EST}&dataInicio=${s}&dataFim=${s}`,
        { next: { revalidate: 3600 }, signal: AbortSignal.timeout(20000) }
      );
      const x = await r.text();
      const niv = [...x.matchAll(/<Nivel>([\d.]+)<\/Nivel>/g)].map((m) => parseFloat(m[1]) / 100);
      if (niv.length) {
        return Response.json(
          { nivel: Math.round(niv[niv.length - 1] * 100) / 100, data: s.replaceAll("/", ".") },
          { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
        );
      }
    } catch (e) {}
  }
  return Response.json({ erro: true }, { status: 502 });
}
