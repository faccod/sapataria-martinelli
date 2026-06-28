"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { FORMAS_PAGAMENTO, STATUS_OS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type Cliente = { id: string; nome: string; telefone?: string | null; whatsapp?: string | null };
type Item = { tipoItem: string; marca?: string | null; cor?: string | null; descricao: string; servico: string; valor: number };
type Os = {
  id: string; numero: number; clienteId: string; status: string; dataPrevista: string;
  funcionario?: string | null; valorEntrada: number; formaPagamento?: string | null; observacoes?: string | null;
  itens: Item[];
};

export function OsForm({ clientes, os }: { clientes: Cliente[]; os?: Os }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [servicos, setServicos] = useState<string[]>([]);
  const [tiposItem, setTiposItem] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/admin/api/listas?tipo=SERVICO").then(r => r.json()).then(d => Array.isArray(d) ? d.map((x: any) => x.nome) : []),
      fetch("/admin/api/listas?tipo=TIPO_ITEM").then(r => r.json()).then(d => Array.isArray(d) ? d.map((x: any) => x.nome) : []),
    ]).then(([svcs, tipos]) => {
      setServicos(svcs);
      setTiposItem(tipos);
    }).catch(() => {});
  }, []);

  const [clienteId, setClienteId] = useState(os?.clienteId ?? clientes[0]?.id ?? "");
  const [status, setStatus] = useState(os?.status ?? "RECEBIDO");
  const [dataPrevista, setDataPrevista] = useState(os?.dataPrevista?.substring(0, 10) ?? "");
  const [funcionario, setFuncionario] = useState(os?.funcionario ?? "");
  const [valorEntrada, setValorEntrada] = useState(os?.valorEntrada ?? 0);
  const [formaPagamento, setFormaPagamento] = useState(os?.formaPagamento ?? "Dinheiro");
  const [observacoes, setObservacoes] = useState(os?.observacoes ?? "");
  const [itens, setItens] = useState<Item[]>(os?.itens ?? [
    { tipoItem: "Sapato", marca: "", cor: "", descricao: "", servico: "Costura de solado", valor: 0 }
  ]);

  const valorTotal = itens.reduce((s, i) => s + (Number(i.valor) || 0), 0);
  const saldo = valorTotal - (Number(valorEntrada) || 0);

  function addItem() {
    setItens([...itens, { tipoItem: "Sapato", marca: "", cor: "", descricao: "", servico: "Costura de solado", valor: 0 }]);
  }
  function removeItem(i: number) {
    setItens(itens.filter((_, idx) => idx !== i));
  }
  function updateItem(i: number, field: keyof Item, value: any) {
    setItens(itens.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (itens.length === 0) { setError("Adicione pelo menos 1 item."); return; }
    startTransition(async () => {
      const payload = { clienteId, status, dataPrevista, funcionario, valorEntrada: Number(valorEntrada), formaPagamento, observacoes, itens };
      const res = await fetch(os ? `/admin/api/os/${os.id}` : "/admin/api/os", {
        method: os ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/os/${data.id}`);
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Erro ao salvar");
      }
    });
  }

  async function handleDelete() {
    if (!os?.id) return;
    if (!confirm("Excluir esta OS?")) return;
    await fetch(`/admin/api/os/${os.id}`, { method: "DELETE" });
    router.push("/admin/os");
    router.refresh();
  }

  const selectCls = "w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <Button asChild variant="ghost" size="sm" type="button" className="text-zinc-400 hover:text-ouro-400">
        <Link href="/admin/os"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Cliente *</label>
          <select className={selectCls} value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
            <option value="">Selecione um cliente</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          {clientes.length === 0 && (
            <p className="text-xs text-amber-400 mt-1">Cadastre um cliente primeiro em /admin/clientes/novo</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Status</label>
          <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Data prevista de entrega</label>
          <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Funcionario / Diarista</label>
          <Input value={funcionario} onChange={(e) => setFuncionario(e.target.value)} placeholder="Opcional" />
        </div>
      </div>

      {/* ITENS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Itens da OS</h2>
          <Button type="button" size="sm" variant="secondary" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Adicionar item
          </Button>
        </div>
        <div className="space-y-3">
          {itens.map((it, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="font-semibold text-ouro-400">Item {i + 1}</div>
                {itens.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-red-400 hover:bg-red-950/30">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
                  <select className={selectCls} value={it.tipoItem} onChange={(e) => updateItem(i, "tipoItem", e.target.value)}>
                    {(tiposItem.length > 0 ? tiposItem : ["Sapato","Bota","Bolsa"]).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Marca</label>
                  <Input value={it.marca ?? ""} onChange={(e) => updateItem(i, "marca", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Cor</label>
                  <Input value={it.cor ?? ""} onChange={(e) => updateItem(i, "cor", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Valor (R$)</label>
                  <Input type="number" step="0.01" value={it.valor} onChange={(e) => updateItem(i, "valor", Number(e.target.value))} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Servico</label>
                  <select className={selectCls} value={it.servico} onChange={(e) => updateItem(i, "servico", e.target.value)}>
                    {(servicos.length > 0 ? servicos : ["Costura de solado","Outros"]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Descricao / Problema</label>
                  <Input value={it.descricao} onChange={(e) => updateItem(i, "descricao", e.target.value)} placeholder="Ex: solado descolando" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAGAMENTO */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-lg font-bold text-white mb-3">Pagamento</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Sinal / Entrada (R$)</label>
            <Input type="number" step="0.01" value={valorEntrada} onChange={(e) => setValorEntrada(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Forma de pagamento</label>
            <select className={selectCls} value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
              {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <div className="text-xs text-zinc-400">Total: <span className="text-ouro-400 font-bold text-lg">{formatCurrency(valorTotal)}</span></div>
            <div className="text-xs text-zinc-400">Saldo: <span className="text-amber-400 font-bold">{formatCurrency(saldo)}</span></div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">Observacoes</label>
        <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
      </div>

      {error && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3">{error}</div>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />{isPending ? "Salvando..." : "Salvar OS"}
        </Button>
        {os && (
          <Button type="button" variant="destructive" onClick={handleDelete}>Excluir</Button>
        )}
      </div>
    </form>
  );
}