import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { statusInfo } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function OsPublicaPage({ params }: { params: { id: string } }) {
  const os = await prisma.oS.findUnique({
    where: { id: params.id },
    include: { cliente: true, itens: true, fotos: { orderBy: { createdAt: "asc" } } },
  });
  if (!os) notFound();
  const s = statusInfo(os.status);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 container py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="text-sm text-ouro-400 font-semibold">CONSULTA DE ORDEM DE SERVICO</div>
          <h1 className="text-4xl font-bold text-white mt-1">OS-{String(os.numero).padStart(3, "0")}</h1>
          <div className="text-zinc-400 mt-1">Aberta em {formatDate(os.dataEntrada)}</div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <div className={`inline-block px-4 py-2 rounded-full text-base font-bold text-white ${s.cor} mb-4`}>{s.label}</div>
            {os.dataPrevista && <div className="text-zinc-400">Previsao de entrega: <span className="text-white font-semibold">{formatDate(os.dataPrevista)}</span></div>}
          </CardContent>
        </Card>

        <div className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-white mb-2">Itens</h2>
              {os.itens.map((it, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <div className="text-white">{it.tipoItem} - {it.servico}</div>
                    {it.marca && <div className="text-xs text-zinc-500">{it.marca} {it.cor && `- ${it.cor}`}</div>}
                  </div>
                  <div className="text-ouro-400 font-semibold">{formatCurrency(it.valor)}</div>
                </div>
              ))}
              <div className="flex justify-between pt-3 text-lg font-bold">
                <span className="text-zinc-300">Total:</span>
                <span className="text-ouro-400">{formatCurrency(os.valorTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {os.fotos.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-white mb-3">Fotos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {os.fotos.map((f) => (
                    <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="block aspect-square bg-zinc-800 rounded overflow-hidden">
                      <img src={f.url} alt={f.tipo} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-zinc-500">
            Esta pagina e atualizada sempre que o status da sua OS muda.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}