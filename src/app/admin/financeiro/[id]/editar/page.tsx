import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MovimentoForm } from "../../movimento-form";

export const dynamic = "force-dynamic";

export default async function EditarMovimentoPage({ params }: { params: { id: string } }) {
  const m = await prisma.movimento.findUnique({ where: { id: params.id } });
  if (!m) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Editar lancamento</h1>
      <p className="text-zinc-400 mb-8">Atualize os dados do movimento.</p>
      <MovimentoForm
        mode="edit"
        initial={{
          id: m.id,
          tipo: m.tipo as "ENTRADA" | "SAIDA",
          categoria: m.categoria,
          descricao: m.descricao,
          valor: m.valor,
          data: m.data.toISOString().split("T")[0],
          observacoes: m.observacoes,
        }}
      />
    </div>
  );
}