import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClienteForm } from "../cliente-form";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusInfo } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      ordens: {
        orderBy: { createdAt: "desc" },
        include: { itens: true },
      },
    },
  });
  if (!cliente) notFound();

  const totalGasto = cliente.ordens.reduce((s, o) => s + o.valorTotal, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">{cliente.nome}</h1>
        <p className="text-zinc-400">Cliente desde {formatDate(cliente.createdAt)}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">Dados do cliente</h2>
          <ClienteForm cliente={cliente} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Total de OS:</span><span className="text-white font-semibold">{cliente.ordens.length}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Total gasto:</span><span className="text-ouro-400 font-bold">{formatCurrency(totalGasto)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Hammer className="h-5 w-5 text-ouro-400" /> Historico de ordens
        </h2>
        {cliente.ordens.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg text-center text-zinc-500">
            Nenhuma OS ainda
          </div>
        ) : (
          <div className="space-y-2">
            {cliente.ordens.map((os) => {
              const s = statusInfo(os.status);
              return (
                <Link key={os.id} href={`/admin/os/${os.id}`} className="block bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-ouro-600/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">OS-{String(os.numero).padStart(3, "0")}</div>
                      <div className="text-xs text-zinc-500">{formatDate(os.dataEntrada)}</div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${s.cor}`}>{s.label}</div>
                    <div className="text-ouro-400 font-bold">{formatCurrency(os.valorTotal)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}