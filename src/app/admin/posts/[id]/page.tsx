import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default async function EditarPostPage({ params }: { params: { id: string } }) {
  const [post, categorias] = await Promise.all([
    prisma.post.findUnique({ where: { id: params.id } }),
    prisma.categoriaPost.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-couro-900 mb-1">Editar post</h1>
      <p className="text-couro-700 mb-8">{post.titulo}</p>
      <PostForm categorias={categorias} post={post} />
    </div>
  );
}
