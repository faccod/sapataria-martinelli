import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Hammer, Users, Wrench, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { statusInfo } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage({ searchParams }: { searchParams: { de?: string; ate?: string } }) {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
  const de = searchParams.de ? new Date(searchParams.de) : inicioMes;
  const ate = searchParams.ate ? new Date(searchParams.ate + "T23:59:59") : fimMes;

  const [osPorStatus, topClientes, servicosMaisPedidos, faturamento, vendasPorProduto] = await Promise.all([
    prisma.oS.groupBy({ by: ["status"], where: { dataEntrada: { gte: de, lte: ate } }, _count: true }),
    prisma.cliente.findMany({
      where: { ordens: { some: { dataEntrada: { gte: de, lte: ate } } } },
      include: { ordens: { where: { dataEntrada: { gte: de, lte: ate } } } },
    }),
    prisma.itemOS.groupBy({ by: ["servico"], where: { os: { dataEntrada: { gte: de, lte: ate } } }, _count: true, orderBy: { _count: { servico: "desc" } }, take: 10 }),
    prisma.oS.aggregate({ where: { dataEntrada: { gte: de, lte: ate }, status: { in: ["CONCLUIDO","ENTREGUE"] } }, _sum: { valorTotal: true }, _count: true }),
    prisma.itemVenda.groupBy({ by: ["produtoId"], where: { venda: { data: { gte: de, lte: ate } } }, _sum: { quantidade: true } }),
  ]);

  const topClientesOrdenados = topClientes
    .map(c => ({ nome: c.nome, total: c.ordens.reduce((s, o) => s + o.valorTotal, 0), ordens: c.ordens.length }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const produtos = await prisma.produto.findMany();
  const produtosMap = new Map(produtos.map(p => [p.id, p.nome]));
  const topProdutos = vendasPorProduto
    .map(v => ({ nome: produtosMap.get(v.produtoId) ?? "?", qtd: v._sum.quantidade ?? 0 }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 10);

  const queryStr = `de=${de.toISOString().split("T")[0]}&ate=${ate.toISOString().split("T")[0]}`;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Relatorios</h1>
      <p className="text-zinc-400 mb-6">Visao geral do periodo</p>

      <form className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <div>
          <label className="text-xs text-zinc-400 block mb-1">De</label>
          <input type="date" name="de" defaultValue={de.toISOString().split("T")[0]} className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100" />
        </div>
        <div>
          <label className="text-xs text-zinc-400 block mb-1">Ate</label>
          <input type="date" name="ate" defaultValue={ate.toISOString().split("T")[0]} className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100" />
        </div>
        <Button type="submit">Filtrar</Button>
        <Button asChild variant="outline" type="button">
          <a href={`/admin/relatorios/export?${queryStr}`} download><Download className="h-4 w-4 mr-2" /> Baixar CSV</a>
        </Button>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-ouro-400" /> Faturamento do periodo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ouro-400">{formatCurrency(faturamento._sum.valorTotal ?? 0)}</div>
            <p className="text-sm text-zinc-400 mt-1">{faturamento._count} OS concluidas/entregues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Hammer className="h-5 w-5 text-ouro-400" /> OS por status</CardTitle>
          </CardHeader>
          <CardContent>
            {osPorStatus.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma OS no periodo.</p> : (
              <div className="space-y-2">
                {osPorStatus.map((s) => {
                  const info = statusInfo(s.status);
                  return (
                    <div key={s.status} className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${info.cor}`}>{info.label}</span>
                      <span className="font-bold text-white">{s._count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-ouro-400" /> Top clientes (por gasto)</CardTitle>
          </CardHeader>
          <CardContent>
            {topClientesOrdenados.length === 0 ? <p className="text-sm text-zinc-500">Sem dados no periodo.</p> : (
              <div className="space-y-2">
                {topClientesOrdenados.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-zinc-950 rounded text-sm">
                    <span className="text-zinc-300">{i+1}. {c.nome} <span className="text-xs text-zinc-500">({c.ordens} OS)</span></span>
                    <span className="font-bold text-ouro-400">{formatCurrency(c.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-ouro-400" /> Servicos mais pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {servicosMaisPedidos.length === 0 ? <p className="text-sm text-zinc-500">Sem dados no periodo.</p> : (
              <div className="space-y-2">
                {servicosMaisPedidos.map((s, i) => (
                  <div key={s.servico} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">{i+1}. {s.servico}</span>
                    <span className="font-bold text-white">{s._count}x</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {topProdutos.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Produtos mais vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-2">
                {topProdutos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-zinc-950 rounded text-sm">
                    <span className="text-zinc-300">{i+1}. {p.nome}</span>
                    <span className="font-bold text-ouro-400">{p.qtd} un</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}