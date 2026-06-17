import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { marked } from "marked";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Share2, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug }, include: { categoria: true } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post não encontrado" };
  const siteUrl = process.env.NEXT_PUBLIC_SAPATARIA_SITE_URL ?? "http://localhost:3000";
  const ogImage = post.capa ? `${siteUrl}${post.capa}` : undefined;
  return {
    title: post.titulo,
    description: post.resumo,
    openGraph: { title: post.titulo, description: post.resumo, type: "article", publishedTime: post.publicadoEm?.toISOString(), images: ogImage ? [ogImage] : undefined },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post || !post.publicado) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SAPATARIA_SITE_URL ?? "http://localhost:3000";
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const whatsapp = process.env.NEXT_PUBLIC_SAPATARIA_WHATSAPP ?? "5527997048164";
  const shareText = encodeURIComponent(`${post.titulo} — ${postUrl}`);
  const html = await marked.parse(post.conteudo);

  return (
    <article className="container py-12 max-w-4xl">
      <Link href="/blog" className="inline-flex items-center text-sm text-ouro-400 hover:text-ouro-300 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para o blog
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4 text-sm">
          <Badge variant="outline" style={{ borderColor: `${post.categoria.cor}88`, color: post.categoria.cor }}>
            {post.categoria.nome}
          </Badge>
          {post.publicadoEm && (
            <span className="flex items-center gap-1 text-zinc-500">
              <Calendar className="h-3 w-3" />
              {formatDate(post.publicadoEm)}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{post.titulo}</h1>
        <p className="text-lg text-zinc-300 mt-4">{post.resumo}</p>
      </header>

      {post.capa && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-zinc-800 border border-zinc-800">
          <Image src={post.capa} alt={post.titulo} fill className="object-cover" priority />
        </div>
      )}

      <div className="prose-couro" dangerouslySetInnerHTML={{ __html: html }} />

      <div className="mt-12 p-6 bg-gradient-to-r from-zinc-900 to-black border border-ouro-700/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-ouro-400">Gostou? Compartilhe!</p>
          <p className="text-sm text-zinc-400">Manda pra alguém que tem uma peça precisando de conserto.</p>
        </div>
        <Button asChild>
          <a href={`https://wa.me/${whatsapp}?text=${shareText}`} target="_blank" rel="noopener noreferrer">
            <Share2 className="h-4 w-4 mr-2" /> Compartilhar no WhatsApp
          </a>
        </Button>
      </div>
    </article>
  );
}