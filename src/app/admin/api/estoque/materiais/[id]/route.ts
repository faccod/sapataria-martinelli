import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  const m = await prisma.material.update({ where: { id: params.id }, data: body });
  return NextResponse.json(m);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  await prisma.material.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}