import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServicoBySlug, servicos } from "@/lib/servicos";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return servicos.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const servico = getServicoBySlug(params.slug);
  if (!servico) return { title: "Serviço não encontrado" };
  return {
    title: `${servico.titulo} — Sapataria Martinelli`,
    description: servico.descCurta,
    openGraph: {
      title: `${servico.titulo} — Sapataria Martinelli`,
      description: servico.descLonga,
      type: "website",
    },
  };
}

export default function ServicoPage({ params }: { params: { slug: string } }) {
  const servico = getServicoBySlug(params.slug);
  if (!servico) notFound();

  const Icone = servico.icon;
  const whatsapp = process.env.NEXT_PUBLIC_SAPATARIA_WHATSAPP ?? "5527997048164";
  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse em ${servico.titulo.toLowerCase()} na Sapataria Martinelli.`,
  );

  // pega os 2 próximos pra "continuar explorando"
  const idxAtual = servicos.findIndex((s) => s.slug === servico.slug);
  const proximos = [
    servicos[(idxAtual + 1) % servicos.length],
    servicos[(idxAtual + 2) % servicos.length],
  ];

  return (
    <article className="container py-12 max-w-4xl">
      <Link
        href="/servicos"
        className="inline-flex items-center text-sm text-ouro-400 hover:text-ouro-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Ver todos os serviços
      </Link>

      <header className="mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-ouro-500/10 border border-ouro-600/30 mb-5">
          <Icone className="h-8 w-8 text-ouro-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">{servico.titulo}</h1>
        <p className="text-lg text-zinc-300 mt-4 leading-relaxed">{servico.descLonga}</p>
      </header>

      <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 md:p-8">
        <h2 className="text-sm font-semibold text-ouro-400 mb-4 uppercase tracking-wider">
          O que está incluso
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {servico.itens.map((item) => (
            <li key={item} className="flex items-start gap-2 text-zinc-200">
              <Check className="h-5 w-5 text-ouro-400 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 p-6 md:p-8 bg-gradient-to-r from-ouro-700/15 via-zinc-900 to-black border border-ouro-700/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white">Tem uma peça precisando?</h3>
          <p className="text-zinc-300 mt-1">
            Manda uma foto pelo WhatsApp e a gente te passa um orçamento sem compromisso.
          </p>
        </div>
        <Button asChild size="lg">
          <a
            href={`https://wa.me/${whatsapp}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-5 w-5 mr-2" /> Falar no WhatsApp
          </a>
        </Button>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold text-ouro-400 mb-4 uppercase tracking-wider">
          Continue explorando
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {proximos.map((p) => {
            const PIcone = p.icon;
            return (
              <Link
                key={p.slug}
                href={`/servicos/${p.slug}`}
                className="group block p-5 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-ouro-600/50 hover:bg-zinc-900/70 transition"
              >
                <div className="flex items-center gap-3">
                  <PIcone className="h-6 w-6 text-ouro-400 transition group-hover:scale-110" />
                  <h3 className="font-semibold text-white">{p.titulo}</h3>
                </div>
                <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{p.descCurta}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </article>
  );
}
