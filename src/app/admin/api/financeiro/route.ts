import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");
  const tipo = searchParams.get("tipo");
  const where: any = {};
  if (de) where.data = { ...where.data, gte: new Date(de) };
  if (ate) where.data = { ...where.data, lte: new Date(ate + "T23:59:59") };
  if (tipo && tipo !== "TODOS") where.tipo = tipo;
  const movs = await prisma.movimento.findMany({ where, orderBy: { data: "desc" } });
  return NextResponse.json(movs);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { tipo, categoria, descricao, valor, data, observacoes } = await req.json();
  if (!tipo || !categoria || !descricao || !valor) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  const m = await prisma.movimento.create({ data: { tipo, categoria, descricao, valor: Number(valor), data: data ? new Date(data) : new Date(), observacoes } });
  return NextResponse.json(m);
}