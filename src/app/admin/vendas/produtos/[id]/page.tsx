import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProdutoForm } from "../produto-form";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const p = await prisma.produto.findUnique({ where: { id: params.id } });
  if (!p) notFound();
  return <div><h1 className="text-3xl font-bold text-white mb-1">Editar produto</h1><p className="text-zinc-400 mb-8">{p.nome}</p><ProdutoForm produto={p} /></div>;
}