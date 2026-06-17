import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Hammer } from "lucide-react";
import { statusInfo } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OsPage({ searchParams }: { searchParams: { status?: string } }) {
  const statusFiltro = searchParams.status ?? "TODOS";
  const where = statusFiltro !== "TODOS" ? { status: statusFiltro } : {};
  const ordens = await prisma.oS.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { cliente: true, itens: true, _count: { select: { fotos: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Ordens de Servico</h1>
          <p className="text-zinc-400">{ordens.length} OS no total</p>
        </div>
        <Button asChild>
          <Link href="/admin/os/novo"><Plus className="h-4 w-4 mr-2" /> Nova OS</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["TODOS","RECEBIDO","EM_ANALISE","AGUARDANDO_APROVACAO","EM_EXECUCAO","CONCLUIDO","ENTREGUE","CANCELADO"].map((s) => {
          const info = statusInfo(s);
          const ativo = statusFiltro === s;
          return (
            <Link key={s} href={s === "TODOS" ? "/admin/os" : `/admin/os?status=${s}`}>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${ativo ? "bg-ouro-500 text-black border-ouro-500" : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-ouro-600/50"}`}>
                {s === "TODOS" ? "Todos" : info.label}
              </span>
            </Link>
          );
        })}
      </div>

      {ordens.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-zinc-800 rounded-lg text-center">
          <Hammer className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-300 font-semibold mb-2">Nenhuma OS</p>
          <p className="text-sm text-zinc-500 mb-6">Crie a primeira ordem de servico.</p>
          <Button asChild><Link href="/admin/os/novo"><Plus className="h-4 w-4 mr-2" /> Criar OS</Link></Button>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-900 border-b border-zinc-800">
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                <th className="px-4 py-3 font-semibold">OS</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Item / Servico</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold text-right">Valor</th>
                <th className="px-4 py-3 font-semibold text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((os) => {
                const s = statusInfo(os.status);
                return (
                  <tr key={os.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-bold text-ouro-400">OS-{String(os.numero).padStart(3, "0")}</td>
                    <td className="px-4 py-3"><Link href={`/admin/clientes/${os.clienteId}`} className="text-white hover:text-ouro-400 font-semibold">{os.cliente.nome}</Link></td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {os.itens[0] ? `${os.itens[0].tipoItem} - ${os.itens[0].servico}` : "-"}
                      {os.itens.length > 1 && <span className="text-xs text-zinc-500"> +{os.itens.length - 1}</span>}
                    </td>
                    <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white ${s.cor}`}>{s.label}</span></td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{formatDate(os.dataEntrada)}</td>
                    <td className="px-4 py-3 text-right font-bold text-ouro-400">{formatCurrency(os.valorTotal)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="icon" className="text-zinc-400 hover:text-ouro-400">
                        <Link href={`/admin/os/${os.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}