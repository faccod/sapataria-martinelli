import { prisma } from "@/lib/prisma";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default async function NovaPostPage() {
  const categorias = await prisma.categoriaPost.findMany({ orderBy: { nome: "asc" } });
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Novo post</h1>
      <p className="text-zinc-400 mb-8">Escreva em Markdown. Use a capa para aparecer no blog.</p>
      <PostForm categorias={categorias} />
    </div>
  );
}
