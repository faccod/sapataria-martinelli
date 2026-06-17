import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      ordens: { orderBy: { createdAt: "desc" }, include: { itens: true } },
    },
  });
  if (!cliente) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  const cliente = await prisma.cliente.update({ where: { id: params.id }, data: body });
  return NextResponse.json(cliente);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  await prisma.cliente.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}