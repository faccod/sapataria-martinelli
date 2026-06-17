import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const where = q
    ? {
        OR: [
          { nome: { contains: q } },
          { telefone: { contains: q } },
          { whatsapp: { contains: q } },
          { email: { contains: q } },
        ],
      }
    : {};
  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { _count: { select: { ordens: true } } },
  });
  return NextResponse.json(clientes);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  if (!body.nome) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });
  const cliente = await prisma.cliente.create({ data: body });
  return NextResponse.json(cliente);
}