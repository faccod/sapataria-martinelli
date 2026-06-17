import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const vendas = await prisma.venda.findMany({
    orderBy: { data: "desc" },
    include: { cliente: true, itens: { include: { produto: true } } },
  });
  return NextResponse.json(vendas);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { clienteId, forma, itens, observacoes } = await req.json();
  if (!itens || itens.length === 0) return NextResponse.json({ error: "Adicione pelo menos 1 item" }, { status: 400 });

  let total = 0;
  for (const it of itens) {
    const p = await prisma.produto.findUnique({ where: { id: it.produtoId } });
    if (!p) return NextResponse.json({ error: "Produto invalido" }, { status: 400 });
    if (p.estoque < it.quantidade) return NextResponse.json({ error: `Estoque insuficiente: ${p.nome}` }, { status: 400 });
    total += p.precoVenda * it.quantidade;
  }

  const venda = await prisma.venda.create({
    data: {
      clienteId: clienteId || null,
      forma, total, observacoes,
      itens: { create: itens.map((it: any) => ({ produtoId: it.produtoId, quantidade: it.quantidade, precoUnit: it.precoUnit })) },
    },
    include: { itens: true },
  });

  // baixa no estoque
  for (const it of itens) {
    await prisma.produto.update({ where: { id: it.produtoId }, data: { estoque: { decrement: it.quantidade } } });
  }

  // gera entrada no financeiro
  await prisma.movimento.create({
    data: {
      tipo: "ENTRADA",
      categoria: "VENDA_PRODUTO",
      descricao: `Venda #${venda.id.slice(-6).toUpperCase()}`,
      valor: total,
      vendaId: venda.id,
    },
  });

  return NextResponse.json(venda);
}