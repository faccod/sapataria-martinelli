import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Hammer, Search } from "lucide-react";
import { statusInfo } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OsPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const statusFiltro = searchParams.status ?? "TODOS";
  const q = (searchParams.q ?? "").trim();
  const statusCond = statusFiltro !== "TODOS" ? { status: statusFiltro } : {};

  // busca: numero (se for numerico), nome/telefone/whatsapp do cliente, servico/descricao dos itens
  let searchCond: any = {};
  if (q) {
    const qNum = Number(q);
    const numeroCond = Number.isFinite(qNum) && qNum > 0 ? [{ numero: qNum }] : [];
    searchCond = {
      OR: [
        ...numeroCond,
        { cliente: { nome: { contains: q } } },
        { cliente: { telefone: { contains: q } } },
        { cliente: { whatsapp: { contains: q } } },
        { itens: { some: { descricao: { contains: q } } } },
        { itens: { some: { servico: { contains: q } } } },
      ],
    };
  }

  const where = { ...statusCond, ...searchCond };
  const ordens = await prisma.oS.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { cliente: true, itens: true, _count: { select: { fotos: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Ordens de Serviço</h1>
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
          const href = q
            ? (s === "TODOS" ? `/admin/os?q=${encodeURIComponent(q)}` : `/admin/os?status=${s}&q=${encodeURIComponent(q)}`)
            : (s === "TODOS" ? "/admin/os" : `/admin/os?status=${s}`);
          return (
            <Link key={s} href={href}>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${ativo ? "bg-ouro-500 text-black border-ouro-500" : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-ouro-600/50"}`}>
                {s === "TODOS" ? "Todos" : info.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* BARRA DE BUSCA */}
      <form method="GET" action="/admin/os" className="flex gap-2 mb-6">
        {statusFiltro !== "TODOS" && <input type="hidden" name="status" value={statusFiltro} />}
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por numero, cliente, telefone, servico ou item..."
            className="w-full h-10 pl-10 pr-4 rounded-md border border-zinc-700 bg-zinc-900 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-ouro-600/60"
          />
        </div>
        <Button type="submit">Buscar</Button>
        {q && (
          <Link
            href={statusFiltro !== "TODOS" ? `/admin/os?status=${statusFiltro}` : "/admin/os"}
            className="inline-flex items-center px-4 h-10 rounded-md border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Limpar
          </Link>
        )}
      </form>

      {q && (
        <div className="mb-4 text-sm text-zinc-400">
          {ordens.length === 0
            ? <>Nenhuma OS encontrada para <span className="text-ouro-400">"{q}"</span>.</>
            : <>{ordens.length} OS(s) encontrada(s) para <span className="text-ouro-400">"{q}"</span>.</>}
        </div>
      )}

      {ordens.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-zinc-800 rounded-lg text-center">
          <Hammer className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-300 font-semibold mb-2">Nenhuma OS</p>
          <p className="text-sm text-zinc-500 mb-6">Crie a primeira ordem de servico.</p>
          <Button asChild><Link href="/admin/os/novo"><Plus className="h-4 w-4 mr-2" /> Criar OS</Link></Button>
        </div>
      ) : (
        <>
          {/* MOBILE: cards */}
          <div className="md:hidden space-y-3">
            {ordens.map((os) => {
              const s = statusInfo(os.status);
              return (
                <Link key={`card-${os.id}`} href={`/admin/os/${os.id}`} className="block bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 hover:border-ouro-600/50 transition">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-ouro-400">OS-{String(os.numero).padStart(3, "0")}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white shrink-0 ${s.cor}`}>{s.label}</span>
                  </div>
                  <div className="font-semibold text-white mb-1 line-clamp-1">{os.cliente.nome}</div>
                  <div className="text-sm text-zinc-300 mb-2 line-clamp-2">
                    {os.itens[0] ? `${os.itens[0].tipoItem} - ${os.itens[0].servico}` : "-"}
                    {os.itens.length > 1 && <span className="text-xs text-zinc-500"> +{os.itens.length - 1} mais</span>}
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500">{formatDate(os.dataEntrada)}</span>
                    <span className="font-bold text-ouro-400">{formatCurrency(os.valorTotal)}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* DESKTOP: tabela */}
          <div className="hidden md:block bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-4 py-3 font-semibold">OS</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Item / Serviço</th>
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
                    <tr key={`row-${os.id}`} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50">
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
        </>
      )}
    </div>
  );
}
