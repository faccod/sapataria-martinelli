import { MovimentoForm } from "../movimento-form";
export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Novo lancamento</h1>
      <p className="text-zinc-400 mb-8">Registre uma entrada ou saida avulsa.</p>
      <MovimentoForm />
    </div>
  );
}