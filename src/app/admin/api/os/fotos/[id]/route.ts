import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { del } from "@vercel/blob";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const foto = await prisma.fotoOS.findUnique({ where: { id: params.id } });
  if (!foto) return NextResponse.json({ error: "Foto nao encontrada" }, { status: 404 });

  // Remove do storage
  try {
    if (foto.url.startsWith("https://") && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(foto.url);
    } else if (foto.url.startsWith("/uploads/")) {
      const filepath = path.join(process.cwd(), "public", foto.url);
      await unlink(filepath).catch(() => {});
    }
  } catch {
    // segue pra deletar do banco mesmo se storage falhar
  }

  await prisma.fotoOS.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}