import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();

  if (!body.titulo || !body.slug || !body.resumo || !body.conteudo || !body.categoriaId) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }

  // verifica slug único (exceto o próprio post)
  const existe = await prisma.post.findFirst({ where: { slug: body.slug, NOT: { id: params.id } } });
  if (existe) return NextResponse.json({ error: "Esse slug já existe. Escolha outro." }, { status: 400 });

  const anterior = await prisma.post.findUnique({ where: { id: params.id } });
  if (!anterior) return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });

  // Se está publicando pela primeira vez, seta publicadoEm
  let publicadoEm = anterior.publicadoEm;
  if (body.publicado && !anterior.publicado) publicadoEm = new Date();
  if (!body.publicado) publicadoEm = null;

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      titulo: body.titulo,
      slug: body.slug,
      resumo: body.resumo,
      conteudo: body.conteudo,
      capa: body.capa ?? null,
      categoriaId: body.categoriaId,
      publicado: !!body.publicado,
      destaque: !!body.destaque,
      publicadoEm,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  await prisma.post.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
