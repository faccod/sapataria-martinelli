import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Hammer, Wrench, Sparkles, Briefcase, Backpack } from "lucide-react";

const servicos = [
  { icon: Scissors,  titulo: "Sapatos",   desc: "Troca de solado, costura lateral, troca de palmilha, restauraÃ§Ã£o geral." },
  { icon: Wrench,    titulo: "Botas",     desc: "Conserto de cano, troca de zÃ­per, salto, solado e forro." },
  { icon: Hammer,    titulo: "Bolsas",    desc: "Reparo de alÃ§a, troca de zÃ­per, forro novo, costura e restauraÃ§Ã£o." },
  { icon: Backpack,  titulo: "Mochilas",  desc: "AlÃ§a, zÃ­per, reforÃ§o de fundo, ajustes e impermeabilizaÃ§Ã£o." },
  { icon: Briefcase, titulo: "Malas",     desc: "RodÃ­zio, alÃ§a, zÃ­per, estrutura e forro." },
  { icon: Sparkles,  titulo: "Sob medida", desc: "FabricaÃ§Ã£o artesanal de cintos, carteiras, bolsas e peÃ§as personalizadas em couro." },
];

export default function ServicosPage() {
  return (
    <div className="container py-16">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Nossos serviÃ§os</h1>
        <p className="text-lg text-zinc-300 mt-3">
          Trabalhamos com uma ampla gama de consertos e fabricaÃ§Ãµes em couro e calÃ§ados.
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
