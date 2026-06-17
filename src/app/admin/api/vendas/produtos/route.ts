import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const produtos = await prisma.produto.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(produtos);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  if (!body.nome || !body.precoVenda) return NextResponse.json({ error: "Nome e preco obrigatorios" }, { status: 400 });
  const p = await prisma.produto.create({ data: body });
  return NextResponse.json(p);
}