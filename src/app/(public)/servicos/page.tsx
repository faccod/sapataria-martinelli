import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { servicos } from "@/lib/servicos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Serviços — Sapataria Martinelli",
  description:
    "Conserto especializado em sapatos, botas, bolsas, mochilas, malas e fabricação sob medida em couro. Santa Maria de Jetibá/ES.",
};

export default function ServicosPage() {
  return (
    <div className="container py-16">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Nossos serviços</h1>
        <p className="text-lg text-zinc-300 mt-3">
          Trabalhamos com uma ampla gama de consertos e fabricações em couro e calçados.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {servicos.map((s) => {
          const Icone = s.icon;
          return (
            <Link
              key={s.slug}
              href={`/servicos/${s.slug}`}
              className="group block focus:outline-none focus:ring-2 focus:ring-ouro-500 rounded-xl"
            >
              <Card className="h-full hover:border-ouro-600/60 hover:bg-zinc-900/40 hover:-translate-y-0.5 transition">
                <CardHeader>
                  <Icone className="h-8 w-8 text-ouro-400 mb-2 transition group-hover:scale-110" />
                  <CardTitle className="flex items-center justify-between">
                    <span>{s.titulo}</span>
                    <ArrowRight className="h-4 w-4 text-ouro-400 opacity-0 -translate-x-2 transition group-hover:opacity-100 group-hover:translate-x-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{s.descCurta}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
