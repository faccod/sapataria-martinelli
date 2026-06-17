import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const os = await prisma.oS.findUnique({
    where: { id: params.id },
    include: { cliente: true, itens: true, fotos: true, statusLogs: { orderBy: { createdAt: "desc" } }, pagamentos: { orderBy: { data: "desc" } } },
  });
  if (!os) return NextResponse.json({ error: "Nao encontrada" }, { status: 404 });
  return NextResponse.json(os);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  const atual = await prisma.oS.findUnique({ where: { id: params.id } });
  if (!atual) return NextResponse.json({ error: "Nao encontrada" }, { status: 404 });

  // Recalcula valor total se itens foram enviados
  let valorTotal = atual.valorTotal;
  if (body.itens) {
    valorTotal = body.itens.reduce((s: number, i: any) => s + (Number(i.valor) || 0), 0);
    await prisma.itemOS.deleteMany({ where: { osId: params.id } });
    await prisma.itemOS.createMany({ data: body.itens.map((i: any) => ({ ...i, osId: params.id })) });
  }
  const valorEntrada = body.valorEntrada !== undefined ? Number(body.valorEntrada) : atual.valorEntrada;
  const valorSaldo = valorTotal - valorEntrada;

  const dataEntrega = body.status === "ENTREGUE" && !atual.dataEntrega ? new Date() : atual.dataEntrega;

  const os = await prisma.oS.update({
    where: { id: params.id },
    data: {
      dataPrevista: body.dataPrevista ? new Date(body.dataPrevista) : atual.dataPrevista,
      dataEntrega,
      status: body.status ?? atual.status,
      funcionario: body.funcionario ?? atual.funcionario,
      valorTotal, valorEntrada, valorSaldo,
      formaPagamento: body.formaPagamento ?? atual.formaPagamento,
      observacoes: body.observacoes ?? atual.observacoes,
    },
  });

  if (body.status && body.status !== atual.status) {
    await prisma.statusLog.create({ data: { osId: params.id, status: body.status, nota: body.notaStatus || null } });
  }
  return NextResponse.json(os);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  await prisma.oS.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}