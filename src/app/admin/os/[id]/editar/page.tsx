import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OsForm } from "../os-form";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const [os, clientes] = await Promise.all([
    prisma.oS.findUnique({ where: { id: params.id }, include: { itens: true } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);
  if (!os) notFound();
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Editar OS-{String(os.numero).padStart(3, "0")}</h1>
      <p className="text-zinc-400 mb-8">Altere os dados necessarios.</p>
      <OsForm clientes={clientes} os={{ ...os, dataPrevista: os.dataPrevista?.toISOString() ?? "" }} />
    </div>
  );
}