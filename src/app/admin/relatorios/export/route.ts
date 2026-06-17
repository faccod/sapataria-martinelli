import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: Request) {
  if (!isAuthenticated()) return new Response("Nao autorizado", { status: 401 });
  const { searchParams } = new URL(req.url);
  const de = searchParams.get("de") ? new Date(searchParams.get("de")!) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const ate = searchParams.get("ate") ? new Date(searchParams.get("ate")! + "T23:59:59") : new Date();

  const [os, vendas] = await Promise.all([
    prisma.oS.findMany({ where: { dataEntrada: { gte: de, lte: ate } }, include: { cliente: true, itens: true } }),
    prisma.venda.findMany({ where: { data: { gte: de, lte: ate } }, include: { cliente: true, itens: { include: { produto: true } } } }),
  ]);

  let csv = "Tipo,Numero,Data,Cliente,Status/Forma,Valor,Detalhes\n";
  for (const o of os) {
    csv += `OS,OS-${String(o.numero).padStart(3,"0")},${o.dataEntrada.toISOString().split("T")[0]},"${o.cliente.nome}",${o.status},${o.valorTotal.toFixed(2)},"${o.itens.map(i => i.tipoItem + " " + i.servico).join("; ")}"\n`;
  }
  for (const v of vendas) {
    csv += `Venda,${v.id.slice(-6)},${v.data.toISOString().split("T")[0]},"${v.cliente?.nome ?? "Consumidor"}",${v.forma},${v.total.toFixed(2)},"${v.itens.map(i => i.quantidade + "x " + i.produto.nome).join("; ")}"\n`;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-${de.toISOString().split("T")[0]}-a-${ate.toISOString().split("T")[0]}.csv"`,
    },
  });
}