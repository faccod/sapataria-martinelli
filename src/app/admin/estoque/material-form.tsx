"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";

type Material = { id?: string; nome: string; unidade: string; quantidade: number; estoqueMin: number; custo: number; fornecedor?: string | null };

export function MaterialForm({ material }: { material?: Material }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [mov, setMov] = useState({ tipo: "ENTRADA" as "ENTRADA" | "SAIDA", quantidade: 0, motivo: "" });
  const [m, setM] = useState<Material>(material ?? { nome: "", unidade: "un", quantidade: 0, estoqueMin: 0, custo: 0, fornecedor: "" });

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setError("");
    startTransition(async () => {
      const res = await fetch(material ? `/admin/api/estoque/materiais/${material.id}` : "/admin/api/estoque/materiais", {
        method: material ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m),
      });
      if (res.ok) {
        const d = await res.json();
        router.push(`/admin/estoque/${d.id}`);
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Erro");
      }
    });
  }

  async function excluir() {
    if (!m.id) return;
    if (!confirm("Excluir este material?")) return;
    await fetch(`/admin/api/estoque/materiais/${m.id}`, { method: "DELETE" });
    router.push("/admin/estoque");
    router.refresh();
  }

  async function registrarMov() {
    if (!m.id || mov.quantidade <= 0) return;
    setError("");
    const res = await fetch("/admin/api/estoque/movimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId: m.id, ...mov }),
    });
    if (res.ok) {
      const d = await res.json();
      setM({ ...m, quantidade: m.quantidade + (mov.tipo === "ENTRADA" ? mov.quantidade : -mov.quantidade) });
      setMov({ tipo: "ENTRADA", quantidade: 0, motivo: "" });
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Erro");
    }
  }

  const selectCls = "w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100";

  return (
    <div className="space-y-6 max-w-3xl">
      <Button asChild variant="ghost" size="sm" type="button" className="text-zinc-400 hover:text-ouro-400">
        <Link href="/admin/estoque"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
      </Button>

      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Nome *</label>
          <Input value={m.nome} onChange={(e) => setM({ ...m, nome: e.target.value })} required />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Unidade</label>
            <select className={selectCls} value={m.unidade} onChange={(e) => setM({ ...m, unidade: e.target.value })}>
              <option value="un">unidade</option>
              <option value="m">metro</option>
              <option value="cm">centimetro</option>
              <option value="kg">quilo</option>
              <option value="g">grama</option>
              <option value="L">litro</option>
              <option value="ml">mililitro</option>
              <option value="par">par</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Custo (R$ por unidade)</label>
            <Input type="number" step="0.01" value={m.custo} onChange={(e) => setM({ ...m, custo: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Estoque atual</label>
            <Input type="number" step="0.01" value={m.quantidade} onChange={(e) => setM({ ...m, quantidade: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Estoque minimo (alerta)</label>
            <Input type="number" step="0.01" value={m.estoqueMin} onChange={(e) => setM({ ...m, estoqueMin: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Fornecedor</label>
          <Input value={m.fornecedor ?? ""} onChange={(e) => setM({ ...m, fornecedor: e.target.value })} />
        </div>
        {error && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3">{error}</div>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}><Save className="h-4 w-4 mr-2" />{isPending ? "Salvando..." : "Salvar"}</Button>
          {m.id && <Button type="button" variant="destructive" onClick={excluir}><Trash2 className="h-4 w-4 mr-2" />Excluir</Button>}
        </div>
      </form>

      {m.id && (
        <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <h3 className="font-bold text-white mb-3">Registrar movimento</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <select className={selectCls} value={mov.tipo} onChange={(e) => setMov({ ...mov, tipo: e.target.value as any })}>
              <option value="ENTRADA">Entrada (compra)</option>
              <option value="SAIDA">Saida (uso)</option>
            </select>
            <Input type="number" step="0.01" placeholder="Qtd" value={mov.quantidade} onChange={(e) => setMov({ ...mov, quantidade: Number(e.target.value) })} />
            <Input placeholder="Motivo" value={mov.motivo} onChange={(e) => setMov({ ...mov, motivo: e.target.value })} />
            <Button type="button" onClick={registrarMov}>
              {mov.tipo === "ENTRADA" ? <Plus className="h-4 w-4 mr-2" /> : <Minus className="h-4 w-4 mr-2" />}
              Registrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}