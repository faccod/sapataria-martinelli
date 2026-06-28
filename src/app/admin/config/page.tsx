import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MessageCircle, Package, ListChecks } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ConfigPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Configurações</h1>
        <p className="text-zinc-400">Dados da empresa, mensagens e integracoes.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-ouro-400" />
            <div>
              <CardTitle>Dados da empresa</CardTitle>
              <CardDescription>Nome, contato e endereco que aparecem no site, PDF e WhatsApp.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link
            href="/admin/config/empresa"
            className="inline-flex items-center justify-center h-9 px-4 text-sm rounded-md bg-ouro-600 hover:bg-ouro-500 text-black font-semibold transition"
          >
            Editar dados da empresa
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ListChecks className="h-6 w-6 text-ouro-400" />
            <div>
              <CardTitle>Listas editaveis</CardTitle>
              <CardDescription>Adicionar ou remover servicos, tipos de item e tipos de produto.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link
            href="/admin/config/tipos"
            className="inline-flex items-center justify-center h-9 px-4 text-sm rounded-md bg-ouro-600 hover:bg-ouro-500 text-black font-semibold transition"
          >
            Gerenciar listas
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-ouro-400" />
            <div>
              <CardTitle>Mensagens do WhatsApp</CardTitle>
              <CardDescription>Templates enviados automaticamente em cada etapa da OS.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link
            href="/admin/config/templates"
            className="inline-flex items-center justify-center h-9 px-4 text-sm rounded-md bg-ouro-600 hover:bg-ouro-500 text-black font-semibold transition"
          >
            Editar mensagens
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-ouro-400" />
            <div>
              <CardTitle>Materiais (estoque)</CardTitle>
              <CardDescription>Couro, sola, linha, cola - tudo que voce usa na oficina.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link
            href="/admin/estoque"
            className="inline-flex items-center justify-center h-9 px-4 text-sm rounded-md bg-ouro-600 hover:bg-ouro-500 text-black font-semibold transition"
          >
            Gerenciar materiais
          </Link>
        </CardContent>
      </Card>

      <div className="text-xs text-zinc-500 p-4 border border-zinc-800 rounded-lg">
        <strong className="text-zinc-400">Em breve:</strong> Tipos de servico e produto editaveis (hoje estao fixos no sistema). Multi-usuario. Tema claro/escuro.
      </div>
    </div>
  );
}
