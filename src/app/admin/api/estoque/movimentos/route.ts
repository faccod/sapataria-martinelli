import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { materialId, tipo, quantidade, motivo } = await req.json();
  if (!materialId || !tipo || !quantidade) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });

  const m = await prisma.material.findUnique({ where: { id: materialId } });
  if (!m) return NextResponse.json({ error: "Material nao encontrado" }, { status: 404 });

  const qtd = Number(quantidade);
  if (tipo === "SAIDA" && m.quantidade < qtd) {
    return NextResponse.json({ error: `Estoque insuficiente (disponivel: ${m.quantidade})` }, { status: 400 });
  }

  const delta = tipo === "ENTRADA" ? qtd : -qtd;
  await prisma.material.update({ where: { id: materialId }, data: { quantidade: m.quantidade + delta } });
  const mov = await prisma.movimentoEstoque.create({ data: { materialId, tipo, quantidade: qtd, motivo } });
  return NextResponse.json(mov);
}

export async function GET(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const materialId = searchParams.get("materialId");
  const where = materialId ? { materialId } : {};
  const movs = await prisma.movimentoEstoque.findMany({
    where,
    orderBy: { data: "desc" },
    take: 100,
    include: { material: true },
  });
  return NextResponse.json(movs);
}