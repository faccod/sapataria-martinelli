"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Props = {
  id: string;
  descricao: string;
  valor: number;
  variant?: "icon" | "sm";
  className?: string;
  label?: string;
};

export function BotaoExcluirMovimento({ id, descricao, valor, variant = "icon", className, label }: Props) {
  function handleClick(e: React.MouseEvent) {
    if (!confirm(`Excluir o lancamento "${descricao}"${valor ? ` de ${formatCurrency(valor)}` : ""}?`)) {
      e.preventDefault();
    }
  }

  return (
    <Button
      type="submit"
      variant="ghost"
      size={variant === "icon" ? "icon" : "sm"}
      title="Excluir"
      onClick={handleClick}
      className={className ?? "text-red-400 hover:text-red-300 hover:bg-red-950/30"}
    >
      <Trash2 className="h-4 w-4" />
      {label && <span className="ml-1">{label}</span>}
    </Button>
  );
}