import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  const { tipo, categoria, descricao, valor, data, observacoes } = body;
  if (!tipo || !categoria || !descricao || !valor) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  const m = await prisma.movimento.update({
    where: { id: params.id },
    data: {
      tipo,
      categoria,
      descricao,
      valor: Number(valor),
      data: data ? new Date(data) : new Date(),
      observacoes,
    },
  });
  return NextResponse.json(m);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  await prisma.movimento.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}