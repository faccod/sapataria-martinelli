"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

const CAMPOS = "Variaveis: {nome} {item} {servico} {numero} {data} {status} {saldo}";

export default function TemplatesPage() {
  const [tpls, setTpls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/admin/api/templates").then(r => r.json()).then(d => { setTpls(d); setLoading(false); });
  }, []);

  async function salvar() {
    setSaving(true); setMsg("");
    const res = await fetch("/admin/api/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tpls),
    });
    if (res.ok) setMsg("Salvo com sucesso");
    else setMsg("Erro ao salvar");
    setSaving(false);
  }

  if (loading) return <div className="text-zinc-400">Carregando...</div>;

  const secoes: Array<[string, string, string]> = [
    ["msg_os_criada", "OS criada (enviada ao abrir a OS)", "Ola {nome}! Recebemos seu {item} para {servico}. OS #{numero}. Retirada prevista: {data}."],
    ["msg_os_status", "Mudanca de status (geral)", "Ola {nome}! Sua OS #{numero} foi atualizada. Status: {status}."],
    ["msg_os_concluida", "OS concluida (pronta p/ retirada)", "Ola {nome}! Seu {item} esta pronto! Saldo a pagar: R$ {saldo}. Retirar na Sapataria Martinelli!"],
    ["msg_lembrete_20", "Lembrete 20 dias", "Ola {nome}! Voce tem uma OS #{numero} pronta ha 20 dias. Passou aqui pra retirar?"],
    ["msg_lembrete_30", "Lembrete 30 dias", "Ola {nome}! Sua OS #{numero} esta ha 30 dias sem retirada. Estamos te esperando!"],
    ["msg_lembrete_60", "Lembrete 60 dias (urgente)", "Ola {nome}! Urgente! Sua OS #{numero} esta ha 60 dias. Precisamos liberar espaco!"],
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-1">Mensagens de WhatsApp</h1>
      <p className="text-zinc-400 mb-2">Personalize os textos enviados ao cliente.</p>
      <p className="text-sm text-ouro-400 mb-8">{CAMPOS}</p>

      <div className="space-y-4">
        {secoes.map(([chave, label, exemplo]) => (
          <div key={chave} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <label className="text-sm font-semibold text-white mb-1 block">{label}</label>
            <Textarea
              value={tpls[chave] ?? ""}
              onChange={(e) => setTpls({ ...tpls, [chave]: e.target.value })}
              rows={2}
            />
            <p className="text-xs text-zinc-500 mt-1">Exemplo: <em>{exemplo}</em></p>
          </div>
        ))}
      </div>

      {msg && <div className="mt-4 text-sm text-emerald-400">{msg}</div>}

      <Button onClick={salvar} disabled={saving} className="mt-6">
        <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar alteracoes"}
      </Button>
    </div>
  );
}