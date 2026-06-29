import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const materiais = await prisma.material.findMany({ orderBy: { nome: "asc" } });
  const baixos = materiais.filter(m => m.estoqueMin > 0 && m.quantidade < m.estoqueMin);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Estoque</h1>
          <p className="text-zinc-400">{materiais.length} material(is) cadastrado(s)</p>
        </div>
        <Button asChild>
          <Link href="/admin/estoque/novo"><Plus className="h-4 w-4 mr-2" /> Novo material</Link>
        </Button>
      </div>

      {baixos.length > 0 && (
        <div className="mb-6 p-4 bg-amber-950/30 border border-amber-600/50 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-400">{baixos.length} material(is) com estoque baixo</div>
            <div className="text-sm text-amber-300">{baixos.map(b => b.nome).join(", ")}</div>
          </div>
        </div>
      )}

      {materiais.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-zinc-800 rounded-lg text-center">
          <Package className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-300 font-semibold mb-2">Nenhum material</p>
          <p className="text-sm text-zinc-500 mb-6">Cadastre os materiais que voce usa na oficina.</p>
          <Button asChild><Link href="/admin/estoque/novo"><Plus className="h-4 w-4 mr-2" /> Cadastrar material</Link></Button>
        </div>
      ) : (
        <>
          {/* MOBILE: cards */}
          <div className="md:hidden space-y-3">
            {materiais.map((m) => {
              const baixo = m.estoqueMin > 0 && m.quantidade < m.estoqueMin;
              return (
                <div key={`card-${m.id}`} className={`bg-zinc-900/50 border rounded-lg p-3 ${baixo ? "border-amber-600/50" : "border-zinc-800"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/admin/estoque/${m.id}`} className="font-semibold text-white hover:text-ouro-400 line-clamp-1">{m.nome}</Link>
                      {m.fornecedor && <div className="text-xs text-zinc-500 line-clamp-1">{m.fornecedor}</div>}
                    </div>
                    {baixo && <Badge variant="destructive" className="shrink-0">Baixo</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <div className="text-xs text-zinc-500">Estoque</div>
                      <div className={`font-bold ${baixo ? "text-red-400" : "text-ouro-400"}`}>{m.quantidade} {m.unidade}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Mínimo</div>
                      <div className="text-zinc-300">{m.estoqueMin} {m.unidade}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Custo</div>
                      <div className="text-zinc-300">{m.custo > 0 ? `R$ ${m.custo.toFixed(2)}` : "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-3 pt-3 border-t border-zinc-800">
                    <Button asChild variant="outline" size="sm" className="text-ouro-400">
                      <Link href={`/admin/estoque/${m.id}`}>Ver / Editar</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP: tabela */}
          <div className="hidden md:block bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-4 py-3 font-semibold">Material</th>
                  <th className="px-4 py-3 font-semibold text-center">Estoque</th>
                  <th className="px-4 py-3 font-semibold text-center">Minimo</th>
                  <th className="px-4 py-3 font-semibold">Fornecedor</th>
                  <th className="px-4 py-3 font-semibold text-right">Custo</th>
                  <th className="px-4 py-3 font-semibold text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {materiais.map((m) => {
                  const baixo = m.estoqueMin > 0 && m.quantidade < m.estoqueMin;
                  return (
                    <tr key={`row-${m.id}`} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/estoque/${m.id}`} className="font-semibold text-white hover:text-ouro-400">{m.nome}</Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${baixo ? "text-red-400" : "text-ouro-400"}`}>{m.quantidade} {m.unidade}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-400">{m.estoqueMin} {m.unidade}</td>
                      <td className="px-4 py-3 text-zinc-300 text-sm">{m.fornecedor ?? "-"}</td>
                      <td className="px-4 py-3 text-right text-zinc-300 text-sm">{m.custo > 0 ? `R$ ${m.custo.toFixed(2)}` : "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm" className="text-ouro-400">
                          <Link href={`/admin/estoque/${m.id}`}>Ver</Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
