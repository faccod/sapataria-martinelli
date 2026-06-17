import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  await prisma.movimento.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}