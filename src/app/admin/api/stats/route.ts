import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const vinteDiasAtras = new Date();
  vinteDiasAtras.setDate(vinteDiasAtras.getDate() - 20);

  const [emAndamento, concluidas, atrasadas, fatMes, totalClientes, lembrete20dias] = await Promise.all([
    prisma.oS.count({ where: { status: { in: ["RECEBIDO","EM_ANALISE","AGUARDANDO_APROVACAO","EM_EXECUCAO"] } } }),
    prisma.oS.count({ where: { status: "CONCLUIDO" } }),
    prisma.oS.count({ where: { status: { in: ["RECEBIDO","EM_ANALISE","AGUARDANDO_APROVACAO","EM_EXECUCAO"] }, dataPrevista: { lt: hoje } } }),
    prisma.oS.aggregate({
      where: {
        status: { in: ["CONCLUIDO","ENTREGUE"] },
        dataEntrada: { gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1) },
      },
      _sum: { valorTotal: true },
    }),
    prisma.cliente.count(),
    prisma.oS.findMany({
      where: { status: "CONCLUIDO", dataEntrada: { lt: vinteDiasAtras } },
      include: { cliente: true },
      orderBy: { dataEntrada: "asc" },
    }),
  ]);

  return NextResponse.json({
    emAndamento,
    concluidas,
    atrasadas,
    faturamentoMes: fatMes._sum.valorTotal ?? 0,
    totalClientes,
    lembrete20dias,
  });
}