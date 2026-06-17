import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const materiais = await prisma.material.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { movimentos: true } } },
  });
  return NextResponse.json(materiais);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  if (!body.nome) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });
  const m = await prisma.material.create({ data: body });
  return NextResponse.json(m);
}