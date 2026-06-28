"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Save, ListChecks, Tag, ShoppingBag } from "lucide-react";

type Item = { id: string; tipo: string; nome: string; ordem: number; ativo: boolean };

const TABS = [
  { tipo: "SERVICO",      label: "Servicos",       desc: "Aparece no dropdown de servico da OS.",         icon: ListChecks },
  { tipo: "TIPO_ITEM",    label: "Tipo de item",   desc: "Categoria do item (sapato, bolsa, etc).",       icon: Tag },
  { tipo: "TIPO_PRODUTO", label: "Tipo de produto", desc: "Categoria dos produtos vendidos.",              icon: ShoppingBag },
];

export default function TiposPage() {
  const [aba, setAba] = useState<"SERVICO" | "TIPO_ITEM" | "TIPO_PRODUTO">("SERVICO");
  const [itens, setItens] = useState<Item[]>([]);
  const [novo, setNovo] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  async function carregar(tipo: string) {
    setLoading(true); setMsg(""); setErro("");
    const r = await fetch(`/admin/api/listas?tipo=${tipo}`);
    const d = await r.json();
    setItens(d);
    setLoading(false);
  }

  useEffect(() => { carregar(aba); }, [aba]);

  async function adicionar() {
    if (!novo.trim()) return;
    setErro(""); setMsg("");
    const r = await fetch("/admin/api/listas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: aba, nome: novo.trim() }),
    });
    if (r.ok) {
      setNovo("");
      setMsg("Adicionado!");
      carregar(aba);
    } else {
      const d = await r.json().catch(() => ({}));
      setErro(d.error ?? "Erro ao adicionar");
    }
  }

  async function toggleAtivo(item: Item) {
    await fetch("/admin/api/listas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, ativo: !item.ativo }),
    });
    carregar(aba);
  }

  async function renomear(item: Item, novoNome: string) {
    if (!novoNome.trim() || novoNome === item.nome) return;
    const r = await fetch("/admin/api/listas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, nome: novoNome.trim() }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setErro(d.error ?? "Erro ao renomear");
    }
    carregar(aba);
  }

  async function excluir(item: Item) {
    if (!confirm(`Excluir "${item.nome}"? Itens antigos que usam esse valor permanecem com o texto.`)) return;
    const r = await fetch(`/admin/api/listas?id=${item.id}`, { method: "DELETE" });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setErro(d.error ?? "Erro ao excluir");
    }
    carregar(aba);
  }

  const abaAtual = TABS.find(t => t.tipo === aba)!;
  const IconeAba = abaAtual.icon;

  return (
    <div className="max-w-3xl">
      <Button asChild variant="ghost" size="sm" type="button" className="text-zinc-400 hover:text-ouro-400 mb-4">
        <Link href="/admin/config"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar para Configuracoes</Link>
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <IconeAba className="h-7 w-7 text-ouro-400" />
          <h1 className="text-3xl font-bold text-white">Listas editaveis</h1>
        </div>
        <p className="text-zinc-400">Gerencie os serviços e categorias de item/produto do sistema.</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-zinc-800">
        {TABS.map(t => {
          const Icone = t.icon;
          return (
            <button
              key={t.tipo}
              type="button"
              onClick={() => setAba(t.tipo as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition -mb-px ${aba === t.tipo ? "border-ouro-500 text-white" : "border-transparent text-zinc-400 hover:text-ouro-400"}`}
            >
              <Icone className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{abaAtual.label}</CardTitle>
          <CardDescription>{abaAtual.desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder={`Novo ${abaAtual.label.toLowerCase().slice(0, -1)}...`}
              value={novo}
              onChange={(e) => setNovo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") adicionar(); }}
            />
            <Button onClick={adicionar} disabled={!novo.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>

          {msg && <div className="text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-800 rounded-md p-2 mb-3">{msg}</div>}
          {erro && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-2 mb-3">{erro}</div>}

          {loading ? (
            <div className="text-zinc-400 py-8 text-center">Carregando...</div>
          ) : itens.length === 0 ? (
            <div className="text-zinc-500 py-8 text-center">Nenhum item cadastrado.</div>
          ) : (
            <div className="space-y-1">
              {itens.map((item) => (
                <div key={item.id} className={`flex items-center gap-2 p-2 rounded ${item.ativo ? "bg-zinc-950" : "bg-zinc-950/40 opacity-60"}`}>
                  <input
                    type="checkbox"
                    checked={item.ativo}
                    onChange={() => toggleAtivo(item)}
                    className="rounded"
                    title={item.ativo ? "Ativo - aparece nos formularios" : "Inativo - nao aparece"}
                  />
                  <Input
                    defaultValue={item.nome}
                    onBlur={(e) => renomear(item, e.target.value)}
                    className="flex-1"
                    disabled={!item.ativo}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => excluir(item)} className="text-red-400 hover:text-red-300 hover:bg-red-950/40">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-zinc-500 mt-4">
            Desmarcar um item esconde dos formularios. Itens antigos em OS/Vendas permanecem com o valor original.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
