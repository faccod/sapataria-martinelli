import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Phone, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { ordens: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Clientes</h1>
          <p className="text-zinc-400">{clientes.length} cliente(s) cadastrado(s)</p>
        </div>
        <Button asChild>
          <Link href="/admin/clientes/novo"><Plus className="h-4 w-4 mr-2" /> Novo cliente</Link>
        </Button>
      </div>

      {clientes.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-zinc-800 rounded-lg text-center">
          <p className="text-zinc-300 font-semibold mb-2">Nenhum cliente ainda</p>
          <p className="text-sm text-zinc-500 mb-6">Cadastre seu primeiro cliente.</p>
          <Button asChild><Link href="/admin/clientes/novo"><Plus className="h-4 w-4 mr-2" /> Cadastrar cliente</Link></Button>
        </div>
      ) : (
        <>
          {/* MOBILE: cards */}
          <div className="md:hidden space-y-3">
            {clientes.map((c) => (
              <div key={`card-${c.id}`} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/admin/clientes/${c.id}`} className="font-semibold text-white hover:text-ouro-400 line-clamp-1">{c.nome}</Link>
                    {c.email && <div className="text-xs text-zinc-500 line-clamp-1">{c.email}</div>}
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-ouro-500/20 text-ouro-400 text-xs font-bold border border-ouro-600/40 shrink-0">
                    {c._count.ordens} OS
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400 flex-wrap">
                  {c.telefone && (
                    <a href={`tel:${c.telefone}`} className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {c.telefone}
                    </a>
                  )}
                  {(c.whatsapp || c.telefone) && (
                    <a href={whatsappLink(c.whatsapp || c.telefone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                      <MessageCircle className="h-3 w-3" /> Zap
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-end mt-3 pt-3 border-t border-zinc-800">
                  <Button asChild variant="outline" size="sm" className="text-zinc-300">
                    <Link href={`/admin/clientes/${c.id}`}><Pencil className="h-3.5 w-3.5 mr-1" /> Editar</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP: tabela */}
          <div className="hidden md:block bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Contato</th>
                  <th className="px-4 py-3 font-semibold">WhatsApp</th>
                  <th className="px-4 py-3 font-semibold text-center">OS</th>
                  <th className="px-4 py-3 font-semibold text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={`row-${c.id}`} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/clientes/${c.id}`} className="font-semibold text-white hover:text-ouro-400">{c.nome}</Link>
                      {c.email && <div className="text-xs text-zinc-500">{c.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {c.telefone ?? <span className="text-zinc-600">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {c.whatsapp || c.telefone ? (
                        <a href={whatsappLink(c.whatsapp || c.telefone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                          <MessageCircle className="h-3 w-3" /> Abrir
                        </a>
                      ) : <span className="text-zinc-600">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-ouro-500/20 text-ouro-400 text-xs font-bold border border-ouro-600/40">
                        {c._count.ordens}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="text-zinc-400 hover:text-ouro-400">
                          <Link href={`/admin/clientes/${c.id}`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
