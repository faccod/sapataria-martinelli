import { MaterialForm } from "../material-form";

export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Novo material</h1>
      <p className="text-zinc-400 mb-8">Cadastre um material de estoque.</p>
      <MaterialForm />
    </div>
  );
}