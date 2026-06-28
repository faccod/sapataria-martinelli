import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

const CAMPOS = [
  "empresa_nome",
  "empresa_telefone",
  "empresa_whatsapp",
  "empresa_endereco",
  "empresa_instagram",
];

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const configs = await prisma.config.findMany({
    where: { chave: { in: CAMPOS } },
  });
  const map: Record<string, string> = {};
  for (const c of configs) map[c.chave] = c.valor;
  return NextResponse.json(map);
}

export async function PUT(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  const atualizados: string[] = [];
  for (const [chave, valor] of Object.entries(body)) {
    if (!CAMPOS.includes(chave)) continue; // ignora chaves fora da lista (seguranca)
    await prisma.config.upsert({
      where: { chave },
      update: { valor: String(valor) },
      create: { chave, valor: String(valor) },
    });
    atualizados.push(chave);
  }
  return NextResponse.json({ ok: true, atualizados });
}
