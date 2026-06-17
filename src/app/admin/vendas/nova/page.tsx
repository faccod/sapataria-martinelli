import { prisma } from "@/lib/prisma";
import { VendaForm } from "../venda-form";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [produtos, clientes] = await Promise.all([
    prisma.produto.findMany({ orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Nova venda</h1>
      <p className="text-zinc-400 mb-8">Registre a venda de um ou mais produtos.</p>
      <VendaForm produtos={produtos} clientes={clientes} />
    </div>
  );
}