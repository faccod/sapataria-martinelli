"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Building2 } from "lucide-react";

type Empresa = {
  empresa_nome: string;
  empresa_telefone: string;
  empresa_whatsapp: string;
  empresa_endereco: string;
  empresa_instagram: string;
};

const DEFAULTS: Empresa = {
  empresa_nome: "Sapataria Martinelli",
  empresa_telefone: "",
  empresa_whatsapp: "",
  empresa_endereco: "",
  empresa_instagram: "",
};

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<Empresa>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/admin/api/config")
      .then(r => r.json())
      .then(d => {
        if (d && typeof d === "object" && !d.error) {
          setEmpresa({ ...DEFAULTS, ...d });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function salvar() {
    setSaving(true); setMsg(""); setErro("");
    const res = await fetch("/admin/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empresa),
    });
    if (res.ok) setMsg("Salvo com sucesso!");
    else {
      const d = await res.json().catch(() => ({}));
      setErro(d.error ?? "Erro ao salvar");
    }
    setSaving(false);
  }

  if (loading) return <div className="text-zinc-400">Carregando...</div>;

  return (
    <div className="max-w-2xl">
      <Button asChild variant="ghost" size="sm" type="button" className="text-zinc-400 hover:text-ouro-400 mb-4">
        <Link href="/admin/config"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar para Configurações</Link>
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Building2 className="h-7 w-7 text-ouro-400" />
          <h1 className="text-3xl font-bold text-white">Dados da empresa</h1>
        </div>
        <p className="text-zinc-400">Usado no site, no PDF da OS e no WhatsApp.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacoes</CardTitle>
          <CardDescription>Preencha os dados do seu negocio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Nome do estabelecimento *</label>
            <Input
              value={empresa.empresa_nome}
              onChange={(e) => setEmpresa({ ...empresa, empresa_nome: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1 block">Telefone (exibido no site)</label>
              <Input
                value={empresa.empresa_telefone}
                onChange={(e) => setEmpresa({ ...empresa, empresa_telefone: e.target.value })}
                placeholder="(27) 99704-8164"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1 block">WhatsApp (DDD + numero)</label>
              <Input
                value={empresa.empresa_whatsapp}
                onChange={(e) => setEmpresa({ ...empresa, empresa_whatsapp: e.target.value })}
                placeholder="5527997048164"
              />
              <p className="text-xs text-zinc-500 mt-1">So numeros, com 55 do Brasil.</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Endereco</label>
            <Input
              value={empresa.empresa_endereco}
              onChange={(e) => setEmpresa({ ...empresa, empresa_endereco: e.target.value })}
              placeholder="Rua dos Evangelicos, 453 - Santa Maria de Jetiba/ES"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Instagram (sem @)</label>
            <Input
              value={empresa.empresa_instagram}
              onChange={(e) => setEmpresa({ ...empresa, empresa_instagram: e.target.value })}
              placeholder="martinellisapataria"
            />
          </div>

          {msg && <div className="text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-800 rounded-md p-3">{msg}</div>}
          {erro && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3">{erro}</div>}

          <div className="flex gap-2 pt-2">
            <Button onClick={salvar} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar alteracoes"}
            </Button>
            <Button asChild variant="outline" type="button">
              <Link href="/admin/config">Cancelar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
