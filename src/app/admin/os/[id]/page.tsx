import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusInfo, whatsappLink, buildMensagemOS, FORMAS_PAGAMENTO } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FotoUpload } from "@/components/foto-upload";
import { ReceberPagamento } from "@/components/receber-pagamento";
import { MessageCircle, Printer, ArrowLeft, Phone, MapPin, User, Hammer, Calendar, QrCode } from "lucide-react";

export const dynamic = "force-dynamic";

async function getTemplates() {
  const configs = await prisma.config.findMany({
    where: { chave: { in: ["msg_os_criada","msg_os_concluida","msg_os_status"] } },
  });
  const m: Record<string, string> = {};
  for (const c of configs) m[c.chave] = c.valor;
  return m;
}

export default async function OsDetailPage({ params }: { params: { id: string } }) {
  const os = await prisma.oS.findUnique({
    where: { id: params.id },
    include: { cliente: true, itens: true, fotos: { orderBy: { createdAt: "asc" } }, statusLogs: { orderBy: { createdAt: "desc" } }, pagamentos: { orderBy: { data: "desc" } } },
  });
  if (!os) notFound();

  const templates = await getTemplates();
  const siteUrl = process.env.NEXT_PUBLIC_SAPATARIA_SITE_URL ?? "http://localhost:3000";
  const linkPublico = `${siteUrl}/os/${os.id}`;

  const primeiroItem = os.itens[0];
  const itemDesc = primeiroItem ? `${primeiroItem.tipoItem} ${primeiroItem.marca ?? ""}`.trim() : "seu item";
  const servicoDesc = primeiroItem?.servico ?? "servico";

  const msgCriada = buildMensagemOS(templates.msg_os_criada ?? "", {
    nome: os.cliente.nome.split(" ")[0], item: itemDesc, servico: servicoDesc,
    numero: os.numero, data: os.dataPrevista ? formatDate(os.dataPrevista) : "em breve",
  });
  const msgConcluida = buildMensagemOS(templates.msg_os_concluida ?? "", {
    nome: os.cliente.nome.split(" ")[0], item: itemDesc, saldo: formatCurrency(os.valorSaldo),
  });

  const fone = os.cliente.whatsapp || os.cliente.telefone;
  const linkWaDireto = whatsappLink(fone);
  const linkWaMsg = whatsappLink(fone, msgCriada);
  const linkWaConcluida = whatsappLink(fone, msgConcluida);

  const s = statusInfo(os.status);
  const statusAnterior = os.statusLogs.length > 1 ? os.statusLogs[1].status : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-ouro-400 -ml-3">
            <Link href="/admin/os"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar para lista</Link>
          </Button>
          <h1 className="text-3xl font-bold text-white mt-2">OS-{String(os.numero).padStart(3, "0")}</h1>
          <p className="text-zinc-400">Aberta em {formatDate(os.dataEntrada)}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/admin/os/${os.id}/pdf`} target="_blank" rel="noopener noreferrer">
              <Printer className="h-4 w-4 mr-2" /> PDF
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/os/${os.id}/editar`}>
              <Hammer className="h-4 w-4 mr-2" /> Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="font-semibold text-white text-base">{os.cliente.nome}</div>
              {os.cliente.telefone && <div className="flex items-center gap-2 text-zinc-300"><Phone className="h-3 w-3" /> {os.cliente.telefone}</div>}
              {fone && <div className="flex items-center gap-2 text-emerald-400"><MessageCircle className="h-3 w-3" /> <a href={linkWaDireto} target="_blank" rel="noopener noreferrer" className="hover:underline">Abrir WhatsApp</a></div>}
              {os.cliente.endereco && <div className="flex items-center gap-2 text-zinc-300"><MapPin className="h-3 w-3" /> {os.cliente.endereco}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Itens ({os.itens.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {os.itens.map((it, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-white">{it.tipoItem} {it.marca && <span className="text-zinc-400">- {it.marca}</span>}</div>
                      <div className="text-sm text-ouro-400">{it.servico}</div>
                      {it.descricao && <div className="text-xs text-zinc-500 mt-1">{it.descricao}</div>}
                      {it.cor && <div className="text-xs text-zinc-500">Cor: {it.cor}</div>}
                    </div>
                    <div className="text-ouro-400 font-bold">{formatCurrency(it.valor)}</div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-zinc-800 text-base font-bold">
                <span className="text-zinc-300">Total:</span>
                <span className="text-ouro-400 text-xl">{formatCurrency(os.valorTotal)}</span>
              </div>
              {os.valorEntrada > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Sinal pago:</span>
                  <span className="text-emerald-400">- {formatCurrency(os.valorEntrada)}</span>
                </div>
              )}
              {os.valorSaldo > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Saldo restante:</span>
                  <span className="text-amber-400 font-semibold">{formatCurrency(os.valorSaldo)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Fotos ({os.fotos.length})</CardTitle></CardHeader>
            <CardContent>
              <FotoUpload osId={os.id} fotos={os.fotos} />
            </CardContent>
          </Card>

          {os.statusLogs.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Historico</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {os.statusLogs.map((l) => {
                  const si = statusInfo(l.status);
                  return (
                    <div key={l.id} className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${si.cor}`}></div>
                      <span className="text-zinc-300">{si.label}</span>
                      <span className="text-zinc-500 text-xs">{formatDate(l.createdAt)}</span>
                      {l.nota && <span className="text-zinc-500 text-xs">- {l.nota}</span>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Status atual</CardTitle></CardHeader>
            <CardContent>
              <div className={`inline-block px-3 py-1 rounded text-sm font-bold text-white ${s.cor}`}>{s.label}</div>
              {os.dataPrevista && <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" /> Prevista: {formatDate(os.dataPrevista)}</div>}
              {os.funcionario && <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1"><User className="h-3 w-3" /> {os.funcionario}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pagamento</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Total:</span><span className="text-zinc-200">{formatCurrency(os.valorTotal)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Recebido:</span><span className="text-emerald-400">{formatCurrency(os.valorEntrada)}</span></div>
                <div className="flex justify-between font-bold border-t border-zinc-800 pt-1 mt-1">
                  <span className="text-zinc-300">Saldo:</span>
                  <span className={os.valorSaldo > 0.01 ? "text-amber-400" : "text-emerald-400"}>{formatCurrency(os.valorSaldo)}</span>
                </div>
              </div>
              {(os.status === "CONCLUIDO" || os.status === "ENTREGUE") && os.valorSaldo > 0.01 && (
                <ReceberPagamento
                  osId={os.id}
                  numero={os.numero}
                  valorSaldo={os.valorSaldo}
                  valorEntrada={os.valorEntrada}
                  valorTotal={os.valorTotal}
                  formasPagamento={FORMAS_PAGAMENTO}
                />
              )}
              {os.valorSaldo <= 0.01 && os.valorEntrada > 0 && (
                <div className="text-xs text-emerald-400 font-semibold pt-1">✓ Totalmente pago</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">WhatsApp</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {fone ? (
                <>
                  <Button asChild className="w-full" variant="outline">
                    <a href={linkWaDireto} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" /> Abrir conversa
                    </a>
                  </Button>
                  <Button asChild className="w-full">
                    <a href={linkWaMsg} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" /> Mandar msg de criação
                    </a>
                  </Button>
                  {os.status === "CONCLUIDO" && (
                    <Button asChild className="w-full" variant="secondary">
                      <a href={linkWaConcluida} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4 mr-2" /> Mandar msg de concluido
                      </a>
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-xs text-zinc-500">Cliente sem telefone cadastrado.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">QR Code publico</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400 mb-2">Link que o cliente pode acessar para ver o status:</p>
              <code className="block text-xs bg-zinc-950 p-2 rounded border border-zinc-800 text-ouro-400 break-all">{linkPublico}</code>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}