import { ClienteForm } from "../cliente-form";

export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Novo cliente</h1>
      <p className="text-zinc-400 mb-8">Cadastre um novo cliente</p>
      <ClienteForm />
    </div>
  );
}