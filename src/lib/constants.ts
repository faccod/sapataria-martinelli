export const STATUS_OS = [
  { value: "RECEBIDO",             label: "Recebido",             cor: "bg-zinc-700" },
  { value: "EM_ANALISE",           label: "Em analise",           cor: "bg-blue-600" },
  { value: "AGUARDANDO_APROVACAO", label: "Aguardando aprovacao", cor: "bg-amber-500" },
  { value: "EM_EXECUCAO",          label: "Em execucao",          cor: "bg-cyan-600" },
  { value: "CONCLUIDO",            label: "Concluido",            cor: "bg-emerald-600" },
  { value: "ENTREGUE",             label: "Entregue",             cor: "bg-green-700" },
  { value: "CANCELADO",            label: "Cancelado",            cor: "bg-red-600" },
] as const;

export type StatusOS = typeof STATUS_OS[number]["value"];

export function statusInfo(value: string) {
  return STATUS_OS.find(s => s.value === value) ?? STATUS_OS[0];
}

export const TIPOS_ITEM = ["Sapato","Bota","Sandalia","Bolsa","Mochila","Mala","Jaqueta","Carteira","Cinto","Outros"];

export const SERVICOS = [
  "Costura de solado",
  "Troca de solado",
  "Reforma de calcados",
  "Reparo de bolsas",
  "Reparo de mochilas",
  "Reparo de malas",
  "Reparo de jaquetas",
  "Reparo de carteiras",
  "Reparo de cintos",
  "Troca de ziper",
  "Troca de forro",
  "Fabricacao sob medida",
  "Outros",
];

export const FORMAS_PAGAMENTO = ["Dinheiro","PIX","Cartao","Boleto","Outros"];

export function whatsappLink(telefone: string | null | undefined, mensagem?: string): string {
  if (!telefone) return "#";
  const limpo = telefone.replace(/\D/g, "");
  if (!limpo) return "#";
  const base = `https://wa.me/55${limpo}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

export function buildMensagemOS(template: string, ctx: {
  nome?: string; item?: string; servico?: string; numero?: number;
  data?: string; status?: string; saldo?: string;
}): string {
  return template
    .replace(/\{nome\}/g, ctx.nome ?? "")
    .replace(/\{item\}/g, ctx.item ?? "")
    .replace(/\{servico\}/g, ctx.servico ?? "")
    .replace(/\{numero\}/g, ctx.numero ? String(ctx.numero) : "")
    .replace(/\{data\}/g, ctx.data ?? "")
    .replace(/\{status\}/g, ctx.status ?? "")
    .replace(/\{saldo\}/g, ctx.saldo ?? "");
}