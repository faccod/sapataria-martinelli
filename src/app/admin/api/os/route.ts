import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const clienteId = searchParams.get("clienteId");
  const where: any = {};
  if (status && status !== "TODOS") where.status = status;
  if (clienteId) where.clienteId = clienteId;
  const ordens = await prisma.oS.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { cliente: true, itens: true, _count: { select: { fotos: true } } },
  });
  return NextResponse.json(ordens);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  if (!body.clienteId) return NextResponse.json({ error: "Cliente obrigatorio" }, { status: 400 });
  if (!body.itens || body.itens.length === 0) return NextResponse.json({ error: "Adicione pelo menos 1 item" }, { status: 400 });

  // proximo numero
  const ultima = await prisma.oS.findFirst({ orderBy: { numero: "desc" } });
  const numero = (ultima?.numero ?? 0) + 1;

  // valor total = soma dos itens
  const valorTotal = body.itens.reduce((s: number, i: any) => s + (Number(i.valor) || 0), 0);
  const valorEntrada = Number(body.valorEntrada) || 0;
  const valorSaldo = valorTotal - valorEntrada;

  const os = await prisma.oS.create({
    data: {
      numero,
      dataPrevista: body.dataPrevista ? new Date(body.dataPrevista) : null,
      status: body.status || "RECEBIDO",
      funcionario: body.funcionario || null,
      clienteId: body.clienteId,
      valorTotal, valorEntrada, valorSaldo,
      formaPagamento: body.formaPagamento || null,
      observacoes: body.observacoes || null,
      itens: { create: body.itens },
      statusLogs: { create: { status: body.status || "RECEBIDO", nota: "OS criada" } },
    },
    include: { cliente: true, itens: true },
  });
  return NextResponse.json(os);
}