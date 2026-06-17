import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VendasPage() {
  const [vendas, produtos] = await Promise.all([
    prisma.venda.findMany({ orderBy: { data: "desc" }, include: { cliente: true, itens: { include: { produto: true } } } }),
    prisma.produto.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Vendas</h1>
          <p className="text-zinc-400">{vendas.length} venda(s) registrada(s)</p>
        </div>
        <Button asChild>
          <Link href="/admin/vendas/nova"><Plus className="h-4 w-4 mr-2" /> Nova venda</Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Produtos ({produtos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {produtos.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum produto cadastrado.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {produtos.map((p) => (
                <Link key={p.id} href={`/admin/vendas/produtos/${p.id}`} className="p-3 bg-zinc-950 border border-zinc-800 rounded hover:border-ouro-600/50 transition">
                  <div className="font-semibold text-white">{p.nome}</div>
                  <div className="text-xs text-zinc-500">{p.descricao ?? "Sem descricao"}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-ouro-400 font-bold">{formatCurrency(p.precoVenda)}</span>
                    <span className="text-xs text-zinc-400">Estoque: {p.estoque}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/admin/vendas/produtos/novo"><Plus className="h-3 w-3 mr-1" /> Cadastrar produto</Link>
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold text-white mb-4">Vendas recentes</h2>
      {vendas.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg text-center text-zinc-500">
          <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-50" />
          Nenhuma venda registrada
        </div>
      ) : (
        <div className="space-y-2">
          {vendas.map((v) => (
            <div key={v.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500">{formatDate(v.data)} - {v.forma}</div>
                  <div className="text-sm text-white">
                    {v.cliente?.nome ?? "Cliente nao identificado"} - {v.itens.map(i => `${i.quantidade}x ${i.produto.nome}`).join(", ")}
                  </div>
                </div>
                <div className="text-ouro-400 font-bold">{formatCurrency(v.total)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Reaproveita Card
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";