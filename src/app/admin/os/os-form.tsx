"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, Check, X, Loader2, Search, ChevronDown, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { FORMAS_PAGAMENTO, STATUS_OS, whatsappLink } from "@/lib/constants";
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

  // Listas dinâmicas (tipo de item + serviço) — vinham da API
  const [servicos, setServicos] = useState<string[]>([]);
  const [tiposItem, setTiposItem] = useState<string[]>([]);

  // Lista local de clientes (pra incluir novos cadastrados inline)
  const [clientesLocal, setClientesLocal] = useState<Cliente[]>(clientes);

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

  // Combobox de cliente (com busca)
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const clienteDropdownRef = useRef<HTMLDivElement>(null);

  const clienteSelecionado = useMemo(
    () => clientesLocal.find((c) => c.id === clienteId) ?? null,
    [clientesLocal, clienteId],
  );
  const clientesFiltrados = useMemo(() => {
    const q = clienteSearch.trim().toLowerCase();
    if (!q) return clientesLocal;
    return clientesLocal.filter((c) => {
      const tel = (c.telefone ?? "").toLowerCase();
      const zap = (c.whatsapp ?? "").toLowerCase();
      return (
        c.nome.toLowerCase().includes(q) ||
        tel.includes(q) ||
        zap.includes(q)
      );
    });
  }, [clienteSearch, clientesLocal]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!clienteDropdownRef.current) return;
      if (!clienteDropdownRef.current.contains(e.target as Node)) {
        setClienteDropdownOpen(false);
      }
    }
    if (clienteDropdownOpen) {
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }
  }, [clienteDropdownOpen]);

  useEffect(() => {
    Promise.all([
      fetch("/admin/api/listas?tipo=SERVICO").then(r => r.json()).then(d => Array.isArray(d) ? d.map((x: any) => x.nome) : []),
      fetch("/admin/api/listas?tipo=TIPO_ITEM").then(r => r.json()).then(d => Array.isArray(d) ? d.map((x: any) => x.nome) : []),
    ]).then(([svcs, tipos]) => {
      setServicos(svcs);
      setTiposItem(tipos);
    }).catch(() => {});
  }, []);

  // ===== Inline-add: Cliente (topo) =====
  const [addClienteOpen, setAddClienteOpen] = useState(false);
  const [newClienteNome, setNewClienteNome] = useState("");
  const [newClienteTel, setNewClienteTel] = useState("");
  const [savingCliente, setSavingCliente] = useState(false);

  async function saveNewCliente() {
    if (!newClienteNome.trim()) return;
    setSavingCliente(true);
    try {
      const r = await fetch("/admin/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: newClienteNome.trim(), telefone: newClienteTel.trim() || null }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || "Erro ao criar cliente");
        return;
      }
      const c = await r.json();
      setClientesLocal((prev) =>
        [...prev, c].sort((a, b) => a.nome.localeCompare(b.nome)),
      );
      setClienteId(c.id);
      setAddClienteOpen(false);
      setNewClienteNome("");
      setNewClienteTel("");
    } finally {
      setSavingCliente(false);
    }
  }

  // ===== Inline-add: Tipo do item =====
  const [addTipoIdx, setAddTipoIdx] = useState<number | null>(null);
  const [newTipoNome, setNewTipoNome] = useState("");
  const [savingTipo, setSavingTipo] = useState(false);

  async function saveNewTipo(forIndex: number) {
    if (!newTipoNome.trim()) return;
    setSavingTipo(true);
    try {
      const r = await fetch("/admin/api/listas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "TIPO_ITEM", nome: newTipoNome.trim() }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || "Erro ao criar tipo");
        return;
      }
      const c = await r.json();
      setTiposItem((prev) => (prev.includes(c.nome) ? prev : [...prev, c.nome]));
      updateItem(forIndex, "tipoItem", c.nome);
      setAddTipoIdx(null);
      setNewTipoNome("");
    } finally {
      setSavingTipo(false);
    }
  }

  // ===== Inline-add: Serviço do item =====
  const [addServicoIdx, setAddServicoIdx] = useState<number | null>(null);
  const [newServicoNome, setNewServicoNome] = useState("");
  const [savingServico, setSavingServico] = useState(false);

  async function saveNewServico(forIndex: number) {
    if (!newServicoNome.trim()) return;
    setSavingServico(true);
    try {
      const r = await fetch("/admin/api/listas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "SERVICO", nome: newServicoNome.trim() }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || "Erro ao criar serviço");
        return;
      }
      const c = await r.json();
      setServicos((prev) => (prev.includes(c.nome) ? prev : [...prev, c.nome]));
      updateItem(forIndex, "servico", c.nome);
      setAddServicoIdx(null);
      setNewServicoNome("");
    } finally {
      setSavingServico(false);
    }
  }

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
    if (!clienteId) { setError("Selecione um cliente."); return; }
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

  const selectCls = "h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100";
  const inputCls = "h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <Button asChild variant="ghost" size="sm" type="button" className="text-zinc-400 hover:text-ouro-400">
        <Link href="/admin/os"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-4">
        {/* CLIENTE */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Cliente *</label>
          {!addClienteOpen ? (
            <div className="flex gap-1">
              <div ref={clienteDropdownRef} className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setClienteDropdownOpen((o) => !o)}
                  className={`${selectCls} flex items-center justify-between gap-2 w-full text-left ${!clienteSelecionado ? "text-zinc-500" : "text-zinc-100"}`}
                >
                  <span className="truncate">
                    {clienteSelecionado ? clienteSelecionado.nome : "Selecione um cliente"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${clienteDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {clienteDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-700 rounded-md shadow-2xl max-h-80 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-zinc-800 bg-zinc-950">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                        <Input
                          autoFocus
                          value={clienteSearch}
                          onChange={(e) => setClienteSearch(e.target.value)}
                          placeholder="Buscar por nome ou telefone..."
                          className="h-9 pl-7 text-sm"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 overscroll-contain">
                      {clientesFiltrados.length === 0 ? (
                        <div className="p-4 text-center text-sm text-zinc-500">
                          {clienteSearch
                            ? "Nenhum cliente encontrado"
                            : "Nenhum cliente cadastrado"}
                        </div>
                      ) : (
                        clientesFiltrados.map((c) => {
                          const ativo = c.id === clienteId;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setClienteId(c.id);
                                setClienteDropdownOpen(false);
                                setClienteSearch("");
                              }}
                              className={`w-full text-left px-3 py-2.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900 transition ${
                                ativo ? "bg-ouro-500/10" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-semibold text-white truncate">
                                  {c.nome}
                                </div>
                                {ativo && (
                                  <Check className="h-4 w-4 text-ouro-400 shrink-0" />
                                )}
                              </div>
                              {(c.telefone || c.whatsapp) && (
                                <div className="text-xs text-zinc-500 flex items-center gap-3 mt-0.5">
                                  {c.telefone && (
                                    <span className="inline-flex items-center gap-1">
                                      <Phone className="h-3 w-3" /> {c.telefone}
                                    </span>
                                  )}
                                  {(c.whatsapp || c.telefone) && (
                                    <a
                                      href={whatsappLink(c.whatsapp || c.telefone)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                                    >
                                      <MessageCircle className="h-3 w-3" /> Zap
                                    </a>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                    <div className="px-3 py-1.5 border-t border-zinc-800 text-xs text-zinc-500 bg-zinc-950 flex justify-between items-center">
                      <span>
                        {clientesFiltrados.length} de {clientesLocal.length} cliente(s)
                      </span>
                      {clienteSearch && (
                        <button
                          type="button"
                          onClick={() => setClienteSearch("")}
                          className="text-ouro-400 hover:underline"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button type="button" size="icon" variant="outline" onClick={() => setAddClienteOpen(true)} title="Cadastrar novo cliente">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
              <Input
                autoFocus
                value={newClienteNome}
                onChange={(e) => setNewClienteNome(e.target.value)}
                placeholder="Nome do cliente *"
                className={inputCls}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); saveNewCliente(); }
                  if (e.key === "Escape") { setAddClienteOpen(false); setNewClienteNome(""); setNewClienteTel(""); }
                }}
              />
              <Input
                value={newClienteTel}
                onChange={(e) => setNewClienteTel(e.target.value)}
                placeholder="Telefone (opcional)"
                className={inputCls}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); saveNewCliente(); }
                }}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={saveNewCliente} disabled={savingCliente || !newClienteNome.trim()}>
                  {savingCliente ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  <span className="ml-1">Salvar</span>
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => { setAddClienteOpen(false); setNewClienteNome(""); setNewClienteTel(""); }}>
                  <X className="h-3 w-3" /> Cancelar
                </Button>
              </div>
            </div>
          )}
          {clientesLocal.length === 0 && !addClienteOpen && (
            <p className="text-xs text-amber-400 mt-1">Nenhum cliente. Clique no + pra cadastrar.</p>
          )}
        </div>

        {/* STATUS (fixo, sem +) */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Status</label>
          <select className={`${selectCls} w-full`} value={status} onChange={(e) => setStatus(e.target.value)}>
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
                {/* TIPO */}
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
                  {addTipoIdx === i ? (
                    <div className="flex gap-1">
                      <Input
                        autoFocus
                        value={newTipoNome}
                        onChange={(e) => setNewTipoNome(e.target.value)}
                        placeholder="Novo tipo..."
                        className={inputCls}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); saveNewTipo(i); }
                          if (e.key === "Escape") { setAddTipoIdx(null); setNewTipoNome(""); }
                        }}
                      />
                      <Button type="button" size="icon" variant="default" onClick={() => saveNewTipo(i)} disabled={savingTipo || !newTipoNome.trim()} title="Salvar">
                        {savingTipo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => { setAddTipoIdx(null); setNewTipoNome(""); }} title="Cancelar">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <select className={`${selectCls} flex-1`} value={it.tipoItem} onChange={(e) => updateItem(i, "tipoItem", e.target.value)}>
                        <option value="">Selecione</option>
                        {(tiposItem.length > 0 ? tiposItem : ["Sapato", "Bota", "Bolsa"]).map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <Button type="button" size="icon" variant="outline" onClick={() => setAddTipoIdx(i)} title="Cadastrar novo tipo">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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
                {/* SERVIÇO */}
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Serviço</label>
                  {addServicoIdx === i ? (
                    <div className="flex gap-1">
                      <Input
                        autoFocus
                        value={newServicoNome}
                        onChange={(e) => setNewServicoNome(e.target.value)}
                        placeholder="Novo serviço..."
                        className={inputCls}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); saveNewServico(i); }
                          if (e.key === "Escape") { setAddServicoIdx(null); setNewServicoNome(""); }
                        }}
                      />
                      <Button type="button" size="icon" variant="default" onClick={() => saveNewServico(i)} disabled={savingServico || !newServicoNome.trim()} title="Salvar">
                        {savingServico ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => { setAddServicoIdx(null); setNewServicoNome(""); }} title="Cancelar">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <select className={`${selectCls} flex-1`} value={it.servico} onChange={(e) => updateItem(i, "servico", e.target.value)}>
                        <option value="">Selecione</option>
                        {(servicos.length > 0 ? servicos : ["Costura de solado", "Outros"]).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Button type="button" size="icon" variant="outline" onClick={() => setAddServicoIdx(i)} title="Cadastrar novo serviço">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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
            <select className={`${selectCls} w-full`} value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
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