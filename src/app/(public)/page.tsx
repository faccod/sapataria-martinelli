import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { servicos } from "@/lib/servicos";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const ultimosPosts = await prisma.post.findMany({
    where: { publicado: true },
    orderBy: { publicadoEm: "desc" },
    include: { categoria: true },
    take: 3,
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black border-b border-ouro-700/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,154,20,0.15),_transparent_50%)]" />
        <div className="container relative py-20 md:py-28 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-ouro-400 border border-ouro-600/40 px-3 py-1 rounded-full mb-6">
              Santa Maria de Jetibá / ES
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Conserto de sapatos, bolsas e artigos de couro
              <span className="block text-ouro-400 mt-2">com qualidade artesanal.</span>
            </h1>
            <p className="text-lg text-zinc-300 mt-6 max-w-xl">
              Recupere suas peças favoritas. Atendemos sapatos, bolsas, jaquetas, mochilas, malas e botas.
              Também fabricamos peças sob medida em couro.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_SAPATARIA_WHATSAPP ?? "5527997048164"}`} target="_blank" rel="noopener noreferrer">
                  Falar no WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/servicos">Ver serviços</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-square md:aspect-[4/3] rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-ouro-700/30 overflow-hidden flex items-center justify-center">
            <div className="relative w-3/4 h-3/4">
              <Image src="/logo-site.png" alt="Martinelli" fill className="object-contain opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">O que consertamos</h2>
          <p className="text-zinc-400 mt-3">Trabalhos especializados em couro e calçados.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s) => {
            const Icone = s.icon;
            return (
              <Link
                key={s.slug}
                href={`/servicos/${s.slug}`}
                className="group block p-6 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-ouro-600/50 hover:bg-zinc-900/70 hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-ouro-500"
              >
                <div className="flex items-center justify-between">
                  <Icone className="h-8 w-8 text-ouro-400 mb-3 transition group-hover:scale-110" />
                  <ArrowRight className="h-4 w-4 text-ouro-400 opacity-0 -translate-x-2 transition group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <h3 className="font-semibold text-white">{s.titulo}</h3>
                <p className="text-sm text-zinc-400 mt-1">{s.descCurta}</p>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline">
            <Link href="/servicos">
              Ver todos os serviços <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ÚLTIMOS POSTS */}
      {ultimosPosts.length > 0 && (
        <section className="container py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Do nosso blog</h2>
              <p className="text-zinc-400 mt-2">Dicas, antes e depois, novidades da oficina.</p>
            </div>
            <Link href="/blog" className="text-sm text-ouro-400 hover:text-ouro-300 hidden md:inline-flex items-center">
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {ultimosPosts.map((post) => (
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
                    <h3 className="font-bold text-white group-hover:text-ouro-400 transition line-clamp-2">{post.titulo}</h3>
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{post.resumo}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border-y border-ouro-700/30">
        <div className="container py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Tem uma peça precisando de conserto?</h2>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            Manda uma foto pelo WhatsApp e a gente já passa um orçamento sem compromisso.
          </p>
          <Button asChild size="lg">
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_SAPATARIA_WHATSAPP ?? "5527997048164"}`} target="_blank" rel="noopener noreferrer">
              Chamar no WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
