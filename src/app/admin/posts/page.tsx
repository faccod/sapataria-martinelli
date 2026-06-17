import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function togglePublicado(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;
  await prisma.post.update({
    where: { id },
    data: { publicado: !post.publicado, publicadoEm: !post.publicado ? new Date() : post.publicadoEm },
  });
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/");
}

async function deletarPost(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const post = await prisma.post.findUnique({ where: { id } });
  if (post?.capa) {
    try { const fs = await import("fs/promises"); await fs.unlink(`public${post.capa}`).catch(() => {}); } catch {}
  }
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/");
  redirect("/admin/posts");
}

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" }, include: { categoria: true } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Blog / Posts</h1>
          <p className="text-zinc-400">Crie, edite e publique posts do blog.</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/novo"><Plus className="h-4 w-4 mr-2" /> Novo post</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-zinc-800 rounded-lg text-center">
          <p className="text-zinc-300 font-semibold mb-2">Nenhum post ainda</p>
          <p className="text-sm text-zinc-500 mb-6">Crie seu primeiro post pra comeÃ§ar.</p>
          <Button asChild>
            <Link href="/admin/posts/novo"><Plus className="h-4 w-4 mr-2" /> Criar primeiro post</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-900 border-b border-zinc-800">
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                <th className="px-4 py-3 font-semibold">Capa</th>
                <th className="px-4 py-3 font-semibold">TÃ­tulo</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold text-right">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <div className="relative w-16 h-12 bg-zinc-800 rounded overflow-hidden">
                      {post.capa ? <Image src={post.capa} alt={post.titulo} fill className="object-cover" /> : <div className="w-full h-full bg-zinc-800" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white line-clamp-1">{post.titulo}</div>
                    <div className="text-xs text-zinc-500">/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" style={{ borderColor: `${post.categoria.cor}88`, color: post.categoria.cor }}>{post.categoria.nome}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {post.publicado ? <Badge variant="success">Publicado</Badge> : <Badge variant="secondary">Rascunho</Badge>}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{formatDate(post.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <form action={togglePublicado}>
                        <input type="hidden" name="id" value={post.id} />
                        <Button type="submit" variant="ghost" size="icon" title={post.publicado ? "Despublicar" : "Publicar"} className="text-zinc-400 hover:text-ouro-400">
                          {post.publicado ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </form>
                      <Button asChild variant="ghost" size="icon" title="Editar" className="text-zinc-400 hover:text-ouro-400">
                        <Link href={`/admin/posts/${post.id}`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <form action={deletarPost}>
                        <input type="hidden" name="id" value={post.id} />
                        <Button type="submit" variant="ghost" size="icon" title="Excluir" className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
