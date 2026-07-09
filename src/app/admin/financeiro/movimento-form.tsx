"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";

const CATS_ENTRADA_DEFAULT = ["SERVICO_OS", "VENDA_PRODUTO", "SINAL_OS", "OUTROS"];
const CATS_SAIDA_DEFAULT = ["MATERIAL", "ALUGUEL", "LUZ", "AGUA", "INTERNET", "CONTADOR", "IMPOSTO", "SALARIO", "FORNECEDOR", "MARKETING", "MANUTENCAO", "OUTROS"];

type Initial = {
  id?: string;
  tipo?: "ENTRADA" | "SAIDA";
  categoria?: string;
  descricao?: string;
  valor?: number;
  data?: string;
  observacoes?: string | null;
};

export function MovimentoForm({ initial, mode }: { initial?: Initial; mode?: "create" | "edit" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // categorias dinamicas
  const [catsEntrada, setCatsEntrada] = useState<string[]>(CATS_ENTRADA_DEFAULT);
  const [catsSaida, setCatsSaida] = useState<string[]>(CATS_SAIDA_DEFAULT);

  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">(initial?.tipo ?? "SAIDA");
  const [categoria, setCategoria] = useState(initial?.categoria ?? (initial?.tipo === "ENTRADA" ? CATS_ENTRADA_DEFAULT[0] : CATS_SAIDA_DEFAULT[0]));
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");
  const [valor, setValor] = useState(initial?.valor ?? 0);
  const [data, setData] = useState(initial?.data ?? new Date().toISOString().split("T")[0]);
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");

  // inline-add state
  const [addingCat, setAddingCat] = useState(false);
  const [newCatNome, setNewCatNome] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/admin/api/listas?tipo=CAT_ENTRADA_FIN").then(r => r.json()).then(d => Array.isArray(d) ? d.map((x: any) => x.nome) : []),
      fetch("/admin/api/listas?tipo=CAT_SAIDA_FIN").then(r => r.json()).then(d => Array.isArray(d) ? d.map((x: any) => x.nome) : []),
    ]).then(([ent, sai]) => {
      // MERGE: defaults + cadastradas no banco (sem duplicar)
      // Novas cadastradas ficam no INICIO da lista
      setCatsEntrada(Array.from(new Set([...ent, ...CATS_ENTRADA_DEFAULT])));
      setCatsSaida(Array.from(new Set([...sai, ...CATS_SAIDA_DEFAULT])));
    }).catch(() => {});
  }, []);

  function changeTipo(t: "ENTRADA" | "SAIDA") {
    setTipo(t);
    const lista = t === "ENTRADA" ? catsEntrada : catsSaida;
    setCategoria(lista[0] ?? "");
    setAddingCat(false);
    setNewCatNome("");
  }

  async function saveNewCategoria() {
    if (!newCatNome.trim()) return;
    setSavingCat(true);
    try {
      const tipoCat = tipo === "ENTRADA" ? "CAT_ENTRADA_FIN" : "CAT_SAIDA_FIN";
      const r = await fetch("/admin/api/listas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: tipoCat, nome: newCatNome.trim() }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || "Erro ao criar categoria");
        return;
      }
      const c = await r.json();
      const setter = tipo === "ENTRADA" ? setCatsEntrada : setCatsSaida;
      // tira duplicata se ja existir, e poe a categoria nova no INICIO
      setter((prev) => Array.from(new Set([c.nome, ...prev.filter((x) => x !== c.nome)])));
      setCategoria(c.nome);
      setAddingCat(false);
      setNewCatNome("");
    } finally {
      setSavingCat(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const isEdit = mode === "edit" && initial?.id;
    startTransition(async () => {
      const url = isEdit ? `/admin/api/financeiro/${initial!.id}` : "/admin/api/financeiro";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, categoria, descricao, valor: Number(valor), data, observacoes }),
      });
      if (res.ok) { router.push("/admin/financeiro"); router.refresh(); }
      else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro"); }
    });
  }

  const cats = tipo === "ENTRADA" ? catsEntrada : catsSaida;
  const selectCls = "h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 flex-1";

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
          {!addingCat ? (
            <div className="flex gap-1">
              <select className={selectCls} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Button type="button" size="icon" variant="outline" onClick={() => setAddingCat(true)} title="Cadastrar nova categoria">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Input
                autoFocus
                value={newCatNome}
                onChange={(e) => setNewCatNome(e.target.value)}
                placeholder="Nova categoria..."
                className="h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); saveNewCategoria(); }
                  if (e.key === "Escape") { setAddingCat(false); setNewCatNome(""); }
                }}
              />
              <Button type="button" size="icon" variant="default" onClick={saveNewCategoria} disabled={savingCat || !newCatNome.trim()} title="Salvar">
                {savingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => { setAddingCat(false); setNewCatNome(""); }} title="Cancelar">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
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