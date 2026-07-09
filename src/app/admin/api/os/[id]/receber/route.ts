import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const body = await req.json();
  const valor = Number(body.valor);
  const forma = body.forma ?? "DINHEIRO";
  const observacoes = body.observacoes ?? null;

  if (!valor || valor <= 0) return NextResponse.json({ error: "Valor invalido" }, { status: 400 });

  const os = await prisma.oS.findUnique({ where: { id: params.id } });
  if (!os) return NextResponse.json({ error: "OS nao encontrada" }, { status: 404 });

  if (valor > os.valorSaldo + 0.01) {
    return NextResponse.json({ error: `Valor (R$ ${valor.toFixed(2)}) maior que o saldo (R$ ${os.valorSaldo.toFixed(2)})` }, { status: 400 });
  }

  const novaEntrada = os.valorEntrada + valor;
  const novoSaldo = Math.max(0, os.valorTotal - novaEntrada);
  const pagoTudo = novoSaldo <= 0.01;

  // Cria Movimento de ENTRADA, atualiza a OS e (se pago tudo) marca como ENTREGUE em transacao
  const ops: any[] = [
    prisma.movimento.create({
      data: {
        tipo: "ENTRADA",
        categoria: "SERVICO_OS",
        descricao: `Recebimento OS-${String(os.numero).padStart(3, "0")} (${forma})`,
        valor,
        osId: os.id,
        observacoes,
      },
    }),
    prisma.oS.update({
      where: { id: os.id },
      data: {
        valorEntrada: novaEntrada,
        valorSaldo: novoSaldo,
      },
    }),
  ];

  // Se pagou tudo, muda status pra ENTREGUE e registra dataEntrega + StatusLog
  if (pagoTudo) {
    ops.push(
      prisma.oS.update({
        where: { id: os.id },
        data: {
          status: "ENTREGUE",
          dataEntrega: new Date(),
          statusLogs: { create: { status: "ENTREGUE", nota: `Pagamento total registrado via API (${forma})` } },
        },
      }),
    );
  }

  await prisma.$transaction(ops);

  revalidatePath("/admin");
  revalidatePath("/admin/financeiro");
  revalidatePath(`/admin/os/${os.id}`);
  revalidatePath("/admin/os");

  return NextResponse.json({ ok: true, valorEntrada: novaEntrada, valorSaldo: novoSaldo, pagoTudo, novoStatus: pagoTudo ? "ENTREGUE" : os.status });
}