"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

type Cliente = {
  id?: string; nome: string; telefone?: string; whatsapp?: string;
  email?: string; endereco?: string; observacoes?: string;
};

export function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [whatsapp, setWhatsapp] = useState(cliente?.whatsapp ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [endereco, setEndereco] = useState(cliente?.endereco ?? "");
  const [observacoes, setObservacoes] = useState(cliente?.observacoes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const payload = { nome, telefone, whatsapp, email, endereco, observacoes };
      const res = await fetch(cliente ? `/admin/api/clientes/${cliente.id}` : "/admin/api/clientes", {
        method: cliente ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { router.push("/admin/clientes"); router.refresh(); }
      else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro"); }
    });
  }

  async function handleDelete() {
    if (!cliente?.id) return;
    if (!confirm("Excluir este cliente? As OS dele permanecerao.")) return;
    await fetch(`/admin/api/clientes/${cliente.id}`, { method: "DELETE" });
    router.push("/admin/clientes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <Button asChild variant="ghost" size="sm" type="button" className="text-zinc-400 hover:text-ouro-400">
        <Link href="/admin/clientes"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
      </Button>
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">Nome completo *</label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">Telefone</label>
          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(27) 99999-9999" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1 block">WhatsApp (DDD + numero)</label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="27997048164" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">E-mail</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">Endereco</label>
        <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1 block">Observacoes</label>
        <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
      </div>
      {error && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3">{error}</div>}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />{isPending ? "Salvando..." : "Salvar"}
        </Button>
        {cliente && (
          <Button type="button" variant="destructive" onClick={handleDelete}>Excluir</Button>
        )}
      </div>
    </form>
  );
}