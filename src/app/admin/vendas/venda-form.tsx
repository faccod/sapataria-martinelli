"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { FORMAS_PAGAMENTO } from "@/lib/constants";

type Produto = { id: string; nome: string; precoVenda: number; estoque: number };
type Cliente = { id: string; nome: string };
type Item = { produtoId: string; quantidade: number; precoUnit: number };

export function VendaForm({ produtos, clientes }: { produtos: Produto[]; clientes: Cliente[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [forma, setForma] = useState("Dinheiro");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<Item[]>(produtos.length > 0 ? [{ produtoId: produtos[0].id, quantidade: 1, precoUnit: produtos[0].precoVenda }] : []);

  const total = itens.reduce((s, i) => s + (Number(i.quantidade) || 0) * (Number(i.precoUnit) || 0), 0);

  function addItem() {
    if (produtos.length === 0) return;
    setItens([...itens, { produtoId: produtos[0].id, quantidade: 1, precoUnit: produtos[0].precoVenda }]);
  }
  function removeItem(i: number) { setItens(itens.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, field: keyof Item, value: any) {
    setItens(itens.map((it, idx) => {
      if (idx !== i) return it;
      const novo = { ...it, [field]: value };
      if (field === "produtoId") {
        const p = produtos.find(p => p.id === value);
        if (p) novo.precoUnit = p.precoVenda;
      }
      return novo;
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (itens.length === 0) { setError("Adicione pelo menos 1 item."); return; }
    setError("");
    startTransition(async () => {
      const res = await fetch("/admin/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId: clienteId || null, forma, observacoes, itens }),
      });
      if (res.ok) { router.push("/admin/vendas"); router.refresh(); }
      else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro"); }
    });
  }

  const selectCls = "w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100";

  if (produtos.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg text-center">
        <p className="text-zinc-300 mb-4">Voce precisa cadastrar pelo menos 1 produto antes de registrar vendas.</p>
        <Button asChild><Link href="/admin/vendas/produtos/novo">Cadastrar produto</Link></Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      <Button asChild variant="ghost" size="sm" type="button" className="text-zinc-400 hover:text-ouro-400">
        <Link href="/admin/vendas"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Cliente (opcional)</label>
          <select className={selectCls} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Consumidor final</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Forma de pagamento</label>
          <select className={selectCls} value={forma} onChange={(e) => setForma(e.target.value)}>
            {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Itens</h2>
          <Button type="button" size="sm" variant="secondary" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Adicionar item
          </Button>
        </div>
        <div className="space-y-2">
          {itens.map((it, i) => {
            const p = produtos.find(p => p.id === it.produtoId);
            return (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded p-3 flex items-center gap-3">
                <select className={selectCls + " flex-1"} value={it.produtoId} onChange={(e) => updateItem(i, "produtoId", e.target.value)}>
                  {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} (estoque: {p.estoque})</option>)}
                </select>
                <Input type="number" min="1" className="w-24" value={it.quantidade} onChange={(e) => updateItem(i, "quantidade", Number(e.target.value))} />
                <Input type="number" step="0.01" className="w-32" value={it.precoUnit} onChange={(e) => updateItem(i, "precoUnit", Number(e.target.value))} />
                <div className="text-ouro-400 font-bold w-28 text-right">R$ {(it.quantidade * it.precoUnit).toFixed(2)}</div>
                {itens.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>}
              </div>
            );
          })}
        </div>
        <div className="text-right mt-3 text-xl font-bold text-white">Total: <span className="text-ouro-400">{formatCurrency(total)}</span></div>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">Observacoes</label>
        <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} />
      </div>

      {error && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3">{error}</div>}
      <Button type="submit" disabled={isPending}><Save className="h-4 w-4 mr-2" />{isPending ? "Salvando..." : "Registrar venda"}</Button>
    </form>
  );
}