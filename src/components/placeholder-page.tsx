import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title, fase, description }: { title: string; fase: string; description: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-zinc-400 mb-8">{description}</p>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Construction className="h-8 w-8 text-ouro-400" />
            <div>
              <CardTitle>Implementação prevista</CardTitle>
              <CardDescription>Fase {fase} do plano de criação</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400">
            Esta funcionalidade será construída na Fase {fase}. O botão já aparece no menu lateral com a marca de fase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
