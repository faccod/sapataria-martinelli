import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();

  if (!body.titulo || !body.slug || !body.resumo || !body.conteudo || !body.categoriaId) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }

  // slug único
  const existe = await prisma.post.findUnique({ where: { slug: body.slug } });
  if (existe) return NextResponse.json({ error: "Esse slug já existe. Escolha outro." }, { status: 400 });

  const post = await prisma.post.create({
    data: {
      titulo: body.titulo,
      slug: body.slug,
      resumo: body.resumo,
      conteudo: body.conteudo,
      capa: body.capa ?? null,
      categoriaId: body.categoriaId,
      publicado: !!body.publicado,
      destaque: !!body.destaque,
      publicadoEm: body.publicado ? new Date() : null,
    },
  });

  return NextResponse.json(post);
}
