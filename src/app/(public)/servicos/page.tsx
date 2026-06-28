import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Hammer, Wrench, Sparkles, Briefcase, Backpack } from "lucide-react";

const servicos = [
  { icon: Scissors,  titulo: "Sapatos",   desc: "Troca de solado, costura lateral, troca de palmilha, restauração geral." },
  { icon: Wrench,    titulo: "Botas",     desc: "Conserto de cano, troca de zíper, salto, solado e forro." },
  { icon: Hammer,    titulo: "Bolsas",    desc: "Reparo de alça, troca de zíper, forro novo, costura e restauração." },
  { icon: Backpack,  titulo: "Mochilas",  desc: "Alça, zíper, reforço de fundo, ajustes e impermeabilização." },
  { icon: Briefcase, titulo: "Malas",     desc: "Rodízio, alça, zíper, estrutura e forro." },
  { icon: Sparkles,  titulo: "Sob medida", desc: "Fabricação artesanal de cintos, carteiras, bolsas e peças personalizadas em couro." },
];

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
        {servicos.map((s, i) => (
          <Card key={i} className="hover:border-ouro-600/60 transition">
            <CardHeader>
              <s.icon className="h-8 w-8 text-ouro-400 mb-2" />
              <CardTitle>{s.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{s.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
