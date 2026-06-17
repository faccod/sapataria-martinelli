import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MaterialForm } from "../material-form";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const [material, movs] = await Promise.all([
    prisma.material.findUnique({ where: { id: params.id } }),
    prisma.movimentoEstoque.findMany({ where: { materialId: params.id }, orderBy: { data: "desc" }, take: 50 }),
  ]);
  if (!material) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">{material.nome}</h1>
        <p className="text-zinc-400">Estoque: <span className="text-ouro-400 font-bold">{material.quantidade} {material.unidade}</span></p>
      </div>

      <MaterialForm material={material} />

      <Card>
        <CardHeader>
          <CardTitle>Historico de movimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {movs.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum movimento ainda.</p>
          ) : (
            <div className="space-y-2">
              {movs.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-zinc-950 rounded text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.tipo === "ENTRADA" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}`}>
                      {m.tipo === "ENTRADA" ? "+" : "-"}{m.quantidade} {material.unidade}
                    </span>
                    <span className="text-zinc-300">{m.motivo ?? "-"}</span>
                  </div>
                  <span className="text-zinc-500 text-xs">{formatDate(m.data)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}