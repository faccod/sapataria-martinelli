"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

type Produto = { id?: string; nome: string; descricao?: string | null; precoCusto: number; precoVenda: number; estoque: number };

export function ProdutoForm({ produto }: { produto?: Produto }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [p, setP] = useState<Produto>(produto ?? { nome: "", descricao: "", precoCusto: 0, precoVenda: 0, estoque: 0 });

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setError("");
    startTransition(async () => {
      const res = await fetch(produto ? `/admin/api/vendas/produtos/${produto.id}` : "/admin/api/vendas/produtos", {
        method: produto ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (res.ok) { router.push("/admin/vendas"); router.refresh(); }
      else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro"); }
    });
  }

  async function excluir() {
    if (!p.id) return;
    if (!confirm("Excluir este produto?")) return;
    await fetch(`/admin/api/vendas/produtos/${p.id}`, { method: "DELETE" });
    router.push("/admin/vendas");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-4 max-w-2xl">
      <Button asChild variant="ghost" size="sm" type="button" className="text-zinc-400 hover:text-ouro-400">
        <Link href="/admin/vendas"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
      </Button>
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">Nome *</label>
        <Input value={p.nome} onChange={(e) => setP({ ...p, nome: e.target.value })} required />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">Descricao</label>
        <Textarea value={p.descricao ?? ""} onChange={(e) => setP({ ...p, descricao: e.target.value })} rows={2} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Preco de custo (R$)</label>
          <Input type="number" step="0.01" value={p.precoCusto} onChange={(e) => setP({ ...p, precoCusto: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Preco de venda (R$) *</label>
          <Input type="number" step="0.01" value={p.precoVenda} onChange={(e) => setP({ ...p, precoVenda: Number(e.target.value) })} required />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Estoque</label>
          <Input type="number" value={p.estoque} onChange={(e) => setP({ ...p, estoque: Number(e.target.value) })} />
        </div>
      </div>
      {error && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3">{error}</div>}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}><Save className="h-4 w-4 mr-2" />{isPending ? "Salvando..." : "Salvar"}</Button>
        {p.id && <Button type="button" variant="destructive" onClick={excluir}><Trash2 className="h-4 w-4 mr-2" />Excluir</Button>}
      </div>
    </form>
  );
}