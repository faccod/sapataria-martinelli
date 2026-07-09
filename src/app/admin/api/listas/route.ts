import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

const TIPOS_VALIDOS = ["SERVICO", "TIPO_ITEM", "TIPO_PRODUTO", "CAT_ENTRADA_FIN", "CAT_SAIDA_FIN"];

export async function GET(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo");
  const where: any = tipo && TIPOS_VALIDOS.includes(tipo) ? { tipo } : {};
  const listas = await prisma.lista.findMany({
    where,
    orderBy: [{ tipo: "asc" }, { ordem: "asc" }, { nome: "asc" }],
  });
  return NextResponse.json(listas);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  const { tipo, nome, ordem } = body;
  if (!TIPOS_VALIDOS.includes(tipo)) return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
  if (!nome || typeof nome !== "string" || !nome.trim()) return NextResponse.json({ error: "nome obrigatorio" }, { status: 400 });
  const ultimo = await prisma.lista.findFirst({ where: { tipo }, orderBy: { ordem: "desc" } });
  const novaOrdem = typeof ordem === "number" ? ordem : (ultimo?.ordem ?? 0) + 1;
  try {
    const item = await prisma.lista.create({
      data: { tipo, nome: nome.trim(), ordem: novaOrdem, ativo: true },
    });
    return NextResponse.json(item);
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Ja existe um item com esse nome nesse tipo" }, { status: 409 });
    throw e;
  }
}

export async function PUT(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  const { id, nome, ordem, ativo } = body;
  if (!id) return NextResponse.json({ error: "id obrigatorio" }, { status: 400 });
  const data: any = {};
  if (typeof nome === "string" && nome.trim()) data.nome = nome.trim();
  if (typeof ordem === "number") data.ordem = ordem;
  if (typeof ativo === "boolean") data.ativo = ativo;
  try {
    const item = await prisma.lista.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Ja existe um item com esse nome nesse tipo" }, { status: 409 });
    if (e.code === "P2025") return NextResponse.json({ error: "item nao encontrado" }, { status: 404 });
    throw e;
  }
}

export async function DELETE(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatorio" }, { status: 400 });
  try {
    await prisma.lista.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "item nao encontrado" }, { status: 404 });
    throw e;
  }
}
