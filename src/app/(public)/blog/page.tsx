import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { publicado: true },
    orderBy: { publicadoEm: "desc" },
    include: { categoria: true },
    take: 24,
  });

  const categorias = await prisma.categoriaPost.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="container py-16">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Blog</h1>
        <p className="text-lg text-zinc-300 mt-3">
          Dicas de cuidado, antes e depois de consertos, novidades da oficina e bastidores.
        </p>
      </div>

      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {categorias.map((c) => (
            <Link key={c.id} href={`/blog?categoria=${c.slug}`}>
              <Badge variant="outline" style={{ borderColor: `${c.cor}88`, color: c.cor }} className="cursor-pointer hover:bg-ouro-500/10">
                {c.nome}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-zinc-800 rounded-lg text-center">
          <p className="text-zinc-300 font-semibold mb-2">Em breve os primeiros posts</p>
          <p className="text-sm text-zinc-500">
            Siga a gente no Instagram <a href="https://instagram.com/martinellisapataria" target="_blank" rel="noopener noreferrer" className="underline text-ouro-400">@martinellisapataria</a>.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <Card className="overflow-hidden h-full hover:border-ouro-600/60 transition">
                {post.capa ? (
                  <div className="relative aspect-[4/3] bg-zinc-800">
                    <Image src={post.capa} alt={post.titulo} fill className="object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                    <Image src="/logo-site.png" alt="Martinelli" width={120} height={60} className="object-contain opacity-30" />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
                    <Badge variant="outline" style={{ borderColor: `${post.categoria.cor}88`, color: post.categoria.cor }}>
                      {post.categoria.nome}
                    </Badge>
                    {post.publicadoEm && <span>{formatDate(post.publicadoEm)}</span>}
                  </div>
                  <h2 className="font-bold text-lg text-white group-hover:text-ouro-400 transition line-clamp-2">{post.titulo}</h2>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{post.resumo}</p>
                  <div className="mt-4 text-sm text-ouro-400 font-medium flex items-center gap-1">
                    Ler mais <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
