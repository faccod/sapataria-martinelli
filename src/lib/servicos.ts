import { Scissors, Wrench, Hammer, Backpack, Briefcase, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Servico = {
  slug: string;
  titulo: string;
  descCurta: string;
  descLonga: string;
  icon: LucideIcon;
  itens: string[];
};

export const servicos: Servico[] = [
  {
    slug: "sapatos",
    titulo: "Sapatos",
    icon: Scissors,
    descCurta: "Troca de solado, costura lateral, troca de palmilha, restauração geral.",
    descLonga:
      "Conserto especializado em sapatos femininos, masculinos e sociais. Trabalhamos com solado de borracha, couro e vibram. Reformamos saltos, costuras laterais, traseiras e palmilhas, além de hidratação e polimento pra devolver o brilho original.",
    itens: [
      "Troca de solado (borracha, couro, vibram)",
      "Costura lateral e traseira",
      "Reforma de saltos",
      "Troca de palmilha",
      "Hidratação e polimento",
      "Restauração geral",
    ],
  },
  {
    slug: "botas",
    titulo: "Botas",
    icon: Wrench,
    descCurta: "Conserto de cano, troca de zíper, salto, solado e forro.",
    descLonga:
      "Botas sociais, country e motociclistas. Troca de zíper, conserto de cano alongado, reforma de solado vibram pra boa aderência, troca de forro interno e ajustes sob medida.",
    itens: [
      "Troca de zíper",
      "Conserto de cano",
      "Reforma de solado (vibram, borracha)",
      "Troca de forro",
      "Ajustes de cano (alongar ou encurtar)",
      "Proteção e impermeabilização",
    ],
  },
  {
    slug: "bolsas",
    titulo: "Bolsas",
    icon: Hammer,
    descCurta: "Reparo de alça, troca de zíper, forro novo, costura e restauração.",
    descLonga:
      "Bolsas femininas, masculinas e executivas. Troca de alça, zíperes, fechos e forro interno. Costuras reforçadas e restauração completa de peças em couro, com acabamento de fábrica.",
    itens: [
      "Troca de alça",
      "Troca de zíper e fecho",
      "Forro interno novo",
      "Costuras reforçadas",
      "Restauração de peças em couro",
      "Hidratação e proteção",
    ],
  },
  {
    slug: "mochilas",
    titulo: "Mochilas",
    icon: Backpack,
    descCurta: "Alça, zíper, reforço de fundo, ajustes e impermeabilização.",
    descLonga:
      "Mochilas escolares, executivas e de viagem. Reforço de fundo e alças, troca de zíper, ajustes de costura e impermeabilização pra aumentar a durabilidade no dia a dia.",
    itens: [
      "Troca de zíper",
      "Reforço de alças e fundo",
      "Ajustes de costura",
      "Impermeabilização",
      "Troca de fecho e fivela",
    ],
  },
  {
    slug: "malas",
    titulo: "Malas",
    icon: Briefcase,
    descCurta: "Rodízio, alça, zíper, estrutura e forro.",
    descLonga:
      "Malas de viagem, executivas e trolley. Troca de rodízio (rodinha), conserto de alça retrátil, zíperes, estrutura reforçada e forro interno novo.",
    itens: [
      "Troca de rodízio",
      "Conserto de alça retrátil",
      "Troca de zíper",
      "Estrutura reforçada",
      "Forro interno novo",
    ],
  },
  {
    slug: "sob-medida",
    titulo: "Sob medida",
    icon: Sparkles,
    descCurta: "Fabricação artesanal de cintos, carteiras, bolsas e peças personalizadas em couro.",
    descLonga:
      "Você sonha, a gente costura. Fabricamos cintos, carteiras, bolsas e peças totalmente personalizadas em couro legítimo, à mão, no ateliê da oficina. Atendimento direto com o artesão pra definir modelo, cor, acabamento e prazo.",
    itens: [
      "Cintos sob medida",
      "Carteiras personalizadas",
      "Bolsas artesanais",
      "Peças exclusivas (presente, corporativo)",
      "Atendimento direto com o artesão",
      "Couro legítimo de várias cores e acabamentos",
    ],
  },
];

export function getServicoBySlug(slug: string): Servico | undefined {
  return servicos.find((s) => s.slug === slug);
}
