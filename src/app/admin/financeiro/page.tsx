import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATS_ENTRADA = ["SERVICO_OS", "VENDA_PRODUTO", "SINAL_OS", "OUTROS"];
const CATS_SAIDA = ["MATERIAL", "ALUGUEL", "LUZ", "AGUA", "INTERNET", "CONTADOR", "IMPOSTO", "SALARIO", "FORNECEDOR", "MARKETING", "MANUTENCAO", "OUTROS"];

export default async function FinanceiroPage({ searchParams }: { searchParams: { de?: string; ate?: string } }) {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const de = searchParams.de ?? inicioMes.toISOString().split("T")[0];
  const ate = searchParams.ate ?? fimMes.toISOString().split("T")[0];

  const where: any = { data: { gte: new Date(de), lte: new Date(ate + "T23:59:59") } };
  const [movs, totalEntradas, totalSaidas, porCategoria] = await Promise.all([
    prisma.movimento.findMany({ where, orderBy: { data: "desc" } }),
    prisma.movimento.aggregate({ where: { ...where, tipo: "ENTRADA" }, _sum: { valor: true } }),
    prisma.movimento.aggregate({ where: { ...where, tipo: "SAIDA" }, _sum: { valor: true } }),
    prisma.movimento.groupBy({ by: ["categoria", "tipo"], where, _sum: { valor: true } }),
  ]);

  const saldo = (totalEntradas._sum.valor ?? 0) - (totalSaidas._sum.valor ?? 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Financeiro</h1>
          <p className="text-zinc-400">Entradas, saidas e saldo</p>
        </div>
        <Button asChild>
          <Link href="/admin/financeiro/novo"><Plus className="h-4 w-4 mr-2" /> Novo lancamento</Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <div>
          <label className="text-xs text-zinc-400 block mb-1">De</label>
          <input type="date" name="de" defaultValue={de} className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100" />
        </div>
        <div>
          <label className="text-xs text-zinc-400 block mb-1">Ate</label>
          <input type="date" name="ate" defaultValue={ate} className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100" />
        </div>
        <Button type="submit">Filtrar</Button>
        <Link href="/admin/financeiro" className="text-sm text-zinc-400 hover:text-ouro-400">Limpar</Link>
      </form>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{formatCurrency(totalEntradas._sum.valor ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saidas</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{formatCurrency(totalSaidas._sum.valor ?? 0)}</div>
          </CardContent>
        </Card>
        <Card className={saldo >= 0 ? "border-emerald-600/50" : "border-red-600/50"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-ouro-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${saldo >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(saldo)}</div>
          </CardContent>
        </Card>
      </div>

      {porCategoria.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Por categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {porCategoria.sort((a, b) => (b._sum.valor ?? 0) - (a._sum.valor ?? 0)).map((c) => (
                <div key={c.categoria + c.tipo} className="flex items-center justify-between p-2 bg-zinc-950 rounded">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${c.tipo === "ENTRADA" ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}`}>{c.tipo}</span>
                    <span className="text-zinc-300 text-sm">{c.categoria}</span>
                  </div>
                  <span className="font-bold text-white">{formatCurrency(c._sum.valor ?? 0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-bold text-white mb-4">Lancamentos ({movs.length})</h2>
      {movs.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg text-center text-zinc-500">Nenhum lancamento no periodo.</div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-900 border-b border-zinc-800">
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Descricao</th>
                <th className="px-4 py-3 font-semibold text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {movs.map((m) => (
                <tr key={m.id} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-4 py-3 text-zinc-400 text-sm">{formatDate(m.data)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.tipo === "ENTRADA" ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}`}>{m.tipo}</span></td>
                  <td className="px-4 py-3 text-zinc-300 text-sm">{m.categoria}</td>
                  <td className="px-4 py-3 text-zinc-300 text-sm">{m.descricao}</td>
                  <td className={`px-4 py-3 text-right font-bold ${m.tipo === "ENTRADA" ? "text-emerald-400" : "text-red-400"}`}>{m.tipo === "ENTRADA" ? "+" : "-"}{formatCurrency(m.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}