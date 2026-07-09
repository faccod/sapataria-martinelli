import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotaoExcluirMovimento } from "@/components/botao-excluir-movimento";
import { Plus, Pencil, ArrowUp, ArrowDown, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATS_ENTRADA = ["SERVICO_OS", "VENDA_PRODUTO", "SINAL_OS", "OUTROS"];
const CATS_SAIDA = ["MATERIAL", "ALUGUEL", "LUZ", "AGUA", "INTERNET", "CONTADOR", "IMPOSTO", "SALARIO", "FORNECEDOR", "MARKETING", "MANUTENCAO", "OUTROS"];

async function deletarMovimento(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.movimento.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/financeiro");
}

export default async function FinanceiroPage({ searchParams }: { searchParams: { de?: string; ate?: string } }) {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const de = searchParams.de ?? inicioMes.toISOString().split("T")[0];
  const ate = searchParams.ate ?? fimMes.toISOString().split("T")[0];

  const where: any = { data: { gte: new Date(de), lte: new Date(ate + "T23:59:59") } };
  const [movs, totalEntradas, totalSaidas] = await Promise.all([
    prisma.movimento.findMany({ where, orderBy: { data: "desc" } }),
    prisma.movimento.aggregate({ where: { ...where, tipo: "ENTRADA" }, _sum: { valor: true } }),
    prisma.movimento.aggregate({ where: { ...where, tipo: "SAIDA" }, _sum: { valor: true } }),
  ]);

  // groupBy em JS (evita incompatibilidade do Prisma groupBy + libSQL adapter)
  const porCategoriaMap = new Map<string, { categoria: string; tipo: string; _sum: { valor: number } }>();
  for (const m of movs) {
    const key = `${m.categoria}|${m.tipo}`;
    const cur = porCategoriaMap.get(key);
    if (cur) cur._sum.valor += m.valor;
    else porCategoriaMap.set(key, { categoria: m.categoria, tipo: m.tipo, _sum: { valor: m.valor } });
  }
  const porCategoria = Array.from(porCategoriaMap.values());

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

      <h2 className="text-xl font-bold text-white mb-4">Lançamentos ({movs.length})</h2>
      {movs.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg text-center text-zinc-500">Nenhum lançamento no período.</div>
      ) : (
        <>
          {/* MOBILE: cards */}
          <div className="md:hidden space-y-2">
            {movs.map((m) => (
              <div key={`card-${m.id}`} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.tipo === "ENTRADA" ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}`}>{m.tipo}</span>
                    <span className="text-xs text-zinc-500">{formatDate(m.data)}</span>
                  </div>
                  <span className={`font-bold text-lg shrink-0 ${m.tipo === "ENTRADA" ? "text-emerald-400" : "text-red-400"}`}>
                    {m.tipo === "ENTRADA" ? "+" : "-"}{formatCurrency(m.valor)}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 mt-1">{m.categoria}</div>
                {m.descricao && <div className="text-sm text-zinc-300 mt-1 line-clamp-2">{m.descricao}</div>}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-zinc-800">
                  <Button asChild variant="outline" size="sm" className="flex-1 text-zinc-300">
                    <Link href={`/admin/financeiro/${m.id}/editar`}><Pencil className="h-3.5 w-3.5 mr-1" /> Editar</Link>
                  </Button>
                  <form action={deletarMovimento} className="flex-1">
                    <input type="hidden" name="id" value={m.id} />
                    <BotaoExcluirMovimento
                      id={m.id}
                      descricao={m.descricao}
                      valor={m.valor}
                      variant="sm"
                      label="Excluir"
                      className="w-full text-red-400 border border-red-900/50 hover:bg-red-950/30 hover:text-red-300"
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP: tabela */}
          <div className="hidden md:block bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Descricao</th>
                  <th className="px-4 py-3 font-semibold text-right">Valor</th>
                  <th className="px-4 py-3 font-semibold text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {movs.map((m) => (
                  <tr key={`row-${m.id}`} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-zinc-400 text-sm">{formatDate(m.data)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.tipo === "ENTRADA" ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}`}>{m.tipo}</span></td>
                    <td className="px-4 py-3 text-zinc-300 text-sm">{m.categoria}</td>
                    <td className="px-4 py-3 text-zinc-300 text-sm">{m.descricao}</td>
                    <td className={`px-4 py-3 text-right font-bold ${m.tipo === "ENTRADA" ? "text-emerald-400" : "text-red-400"}`}>{m.tipo === "ENTRADA" ? "+" : "-"}{formatCurrency(m.valor)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title="Editar" className="text-zinc-400 hover:text-ouro-400">
                          <Link href={`/admin/financeiro/${m.id}/editar`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <form action={deletarMovimento}>
                          <input type="hidden" name="id" value={m.id} />
                          <BotaoExcluirMovimento id={m.id} descricao={m.descricao} valor={m.valor} />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
