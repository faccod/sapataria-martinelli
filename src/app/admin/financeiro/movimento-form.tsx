"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const CATS_ENTRADA = ["SERVICO_OS", "VENDA_PRODUTO", "SINAL_OS", "OUTROS"];
const CATS_SAIDA = ["MATERIAL", "ALUGUEL", "LUZ", "AGUA", "INTERNET", "CONTADOR", "IMPOSTO", "SALARIO", "FORNECEDOR", "MARKETING", "MANUTENCAO", "OUTROS"];

export function MovimentoForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">("SAIDA");
  const [categoria, setCategoria] = useState(CATS_SAIDA[0]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(0);
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [observacoes, setObservacoes] = useState("");

  function changeTipo(t: "ENTRADA" | "SAIDA") {
    setTipo(t);
    setCategoria((t === "ENTRADA" ? CATS_ENTRADA : CATS_SAIDA)[0]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    startTransition(async () => {
      const res = await fetch("/admin/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, categoria, descricao, valor: Number(valor), data, observacoes }),
      });
      if (res.ok) { router.push("/admin/financeiro"); router.refresh(); }
      else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro"); }
    });
  }

  const cats = tipo === "ENTRADA" ? CATS_ENTRADA : CATS_SAIDA;
  const selectCls = "w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100";

  return (
    <form onSubmit={submit} className="space-y-4 max-w-2xl">
      <Button asChild variant="ghost" size="sm" type="button" className="text-zinc-400 hover:text-ouro-400">
        <Link href="/admin/financeiro"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
      </Button>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Tipo *</label>
          <div className="flex gap-2">
            <Button type="button" variant={tipo === "ENTRADA" ? "default" : "outline"} onClick={() => changeTipo("ENTRADA")} className="flex-1">Entrada</Button>
            <Button type="button" variant={tipo === "SAIDA" ? "destructive" : "outline"} onClick={() => changeTipo("SAIDA")} className="flex-1">Saida</Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Categoria *</label>
          <select className={selectCls} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">Descricao *</label>
        <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Valor (R$) *</label>
          <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(Number(e.target.value))} required />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Data</label>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">Observacoes</label>
        <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} />
      </div>
      {error && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3">{error}</div>}
      <Button type="submit" disabled={isPending}><Save className="h-4 w-4 mr-2" />{isPending ? "Salvando..." : "Salvar"}</Button>
    </form>
  );
}