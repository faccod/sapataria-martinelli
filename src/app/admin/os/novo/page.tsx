import { prisma } from "@/lib/prisma";
import { OsForm } from "../os-form";

export const dynamic = "force-dynamic";

export default async function NovaOsPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Nova Ordem de Serviço</h1>
      <p className="text-zinc-400 mb-8">Preencha os dados. O numero da OS e gerado automaticamente.</p>
      <OsForm clientes={clientes} />
    </div>
  );
}