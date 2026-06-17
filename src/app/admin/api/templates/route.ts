import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const configs = await prisma.config.findMany({
    where: { chave: { in: ["msg_os_criada","msg_os_status","msg_os_concluida","msg_lembrete_20","msg_lembrete_30","msg_lembrete_60"] } },
  });
  const map: Record<string, string> = {};
  for (const c of configs) map[c.chave] = c.valor;
  return NextResponse.json(map);
}

export async function PUT(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  for (const [chave, valor] of Object.entries(body)) {
    await prisma.config.upsert({
      where: { chave },
      update: { valor: String(valor) },
      create: { chave, valor: String(valor) },
    });
  }
  return NextResponse.json({ ok: true });
}