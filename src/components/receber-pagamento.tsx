"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Loader2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Props = {
  osId: string;
  numero: number;
  valorSaldo: number;
  valorEntrada: number;
  valorTotal: number;
  formasPagamento: string[];
};

export function ReceberPagamento({ osId, numero, valorSaldo, valorEntrada, valorTotal, formasPagamento }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState(valorSaldo.toString());
  const [forma, setForma] = useState(formasPagamento[0] ?? "DINHEIRO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (valorSaldo <= 0.01) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch(`/admin/api/os/${osId}/receber`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: Number(valor), forma }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Erro");
      }
      router.refresh();
      setOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full" size="lg">
        <DollarSign className="h-4 w-4 mr-2" />
        Receber pagamento (R$ {valorSaldo.toFixed(2)})
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={() => !loading && setOpen(false)}>
          <div className="bg-zinc-900 border border-ouro-700/40 rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl my-4 sm:my-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Receber pagamento OS-{String(numero).padStart(3, "0")}
              </h2>
              <button type="button" onClick={() => setOpen(false)} disabled={loading} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1 mb-4 p-3 bg-zinc-950 border border-zinc-800 rounded text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total:</span>
                <span className="text-zinc-200">{formatCurrency(valorTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Já recebido:</span>
                <span className="text-emerald-400">{formatCurrency(valorEntrada)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-zinc-300">Saldo restante:</span>
                <span className="text-amber-400">{formatCurrency(valorSaldo)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-zinc-300 mb-1 block">Valor a receber *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={valorSaldo}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                  className="text-lg"
                />
                {Number(valor) < valorSaldo && (
                  <p className="text-xs text-zinc-500 mt-1">Recebimento parcial — vai sobrar R$ {(valorSaldo - Number(valor)).toFixed(2)}</p>
                )}
                {Number(valor) > valorSaldo && (
                  <p className="text-xs text-red-400 mt-1">Valor maior que o saldo (R$ {valorSaldo.toFixed(2)})</p>
                )}
              </div>

              <div>
                <label className="text-sm text-zinc-300 mb-1 block">Forma de pagamento *</label>
                <select value={forma} onChange={(e) => setForma(e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                  {formasPagamento.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3">{error}</div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={loading || Number(valor) <= 0 || Number(valor) > valorSaldo} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4 mr-2" />}
                  {loading ? "Registrando..." : "Confirmar recebimento"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}