import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hammer, Clock, AlertTriangle, DollarSign, Users, Package, ShoppingCart, TrendingUp, Plus, MessageCircle, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { statusInfo, whatsappLink, buildMensagemOS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const vinteDiasAtras = new Date();
  vinteDiasAtras.setDate(vinteDiasAtras.getDate() - 20);

  const [emAndamento, concluidas, atrasadas, totalClientes, lembrete20dias, ultimasOS, materiaisBaixos, finMes, vendasMes, totalEstoqueProdutos, templates] = await Promise.all([
    prisma.oS.count({ where: { status: { in: ["RECEBIDO","EM_ANALISE","AGUARDANDO_APROVACAO","EM_EXECUCAO"] } } }),
    prisma.oS.count({ where: { status: "CONCLUIDO" } }),
    prisma.oS.findMany({
      where: { status: { in: ["RECEBIDO","EM_ANALISE","AGUARDANDO_APROVACAO","EM_EXECUCAO"] }, dataPrevista: { lt: hoje } },
      include: { cliente: true },
      orderBy: { dataPrevista: "asc" },
    }),
    prisma.cliente.count(),
    prisma.oS.findMany({
      where: { status: "CONCLUIDO", dataEntrada: { lt: vinteDiasAtras } },
      include: { cliente: true },
      orderBy: { dataEntrada: "asc" },
    }),
    prisma.oS.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { cliente: true } }),
    prisma.material.findMany(),
    prisma.movimento.aggregate({ where: { tipo: "ENTRADA", data: { gte: inicioMes } }, _sum: { valor: true } }),
    prisma.movimento.aggregate({ where: { tipo: "SAIDA", data: { gte: inicioMes } }, _sum: { valor: true } }),
    prisma.produto.aggregate({ _sum: { estoque: true } }),
    prisma.config.findMany({ where: { chave: { in: ["msg_lembrete_20"] } } }),
  ]);

  const msgLembrete = templates[0]?.valor ?? "Ola {nome}, voce tem uma OS #{numero} pronta ha 20 dias. Passou aqui pra retirar?";
  const entradasMes = finMes._sum.valor ?? 0;
  const saidasMes = vendasMes._sum.valor ?? 0;
  const saldoMes = entradasMes - saidasMes;
  const materiaisBaixosCount = materiaisBaixos.filter(m => m.estoqueMin > 0 && m.quantidade < m.estoqueMin).length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-zinc-400 mb-8">Visão geral da Sapataria Martinelli.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">OS em andamento</CardTitle>
            <Hammer className="h-4 w-4 text-ouro-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{emAndamento}</div>
            <CardDescription>{concluidas} pronta(s) p/ retirada</CardDescription>
          </CardContent>
        </Card>
        <Card className={atrasadas.length > 0 ? "border-red-600/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{atrasadas.length}</div>
            <CardDescription>Passaram da data</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento do mes</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{formatCurrency(entradasMes)}</div>
            <CardDescription>Entradas no caixa</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo do mes</CardTitle>
            <DollarSign className="h-4 w-4 text-ouro-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${saldoMes >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(saldoMes)}</div>
            <CardDescription>Despesas: {formatCurrency(saidasMes)}</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-ouro-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalClientes}</div>
          </CardContent>
        </Card>
        <Card className={materiaisBaixosCount > 0 ? "border-amber-600/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque baixo</CardTitle>
            <Package className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{materiaisBaixosCount}</div>
            <CardDescription>materiais precisam repor</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos em estoque</CardTitle>
            <ShoppingCart className="h-4 w-4 text-ouro-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalEstoqueProdutos._sum.estoque ?? 0}</div>
            <CardDescription>unidades para venda</CardDescription>
          </CardContent>
        </Card>
      </div>

      {(atrasadas.length > 0 || lembrete20dias.length > 0 || materiaisBaixosCount > 0) && (
        <Card className="mb-6 border-amber-600/50">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {atrasadas.length > 0 && (
              <div>
                <div className="font-semibold text-white mb-1">{atrasadas.length} OS atrasadas</div>
                <div className="space-y-1">
                  {atrasadas.slice(0, 3).map((os) => (
                    <Link key={os.id} href={`/admin/os/${os.id}`} className="flex items-center justify-between p-2 bg-zinc-950 rounded hover:bg-zinc-900">
                      <span className="text-sm text-white">OS-{String(os.numero).padStart(3,"0")} - {os.cliente.nome}</span>
                      <span className="text-xs text-red-400">Prevista: {os.dataPrevista ? formatDate(os.dataPrevista) : "-"}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {lembrete20dias.length > 0 && (
              <div>
                <div className="font-semibold text-white mb-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {lembrete20dias.length} OS ha mais de 20 dias sem retirar
                </div>
                <div className="space-y-1">
                  {lembrete20dias.slice(0, 3).map((os) => {
                    const fone = os.cliente.whatsapp || os.cliente.telefone;
                    const msg = buildMensagemOS(msgLembrete, { nome: os.cliente.nome.split(" ")[0], numero: os.numero });
                    return (
                      <div key={os.id} className="flex items-center justify-between p-2 bg-zinc-950 rounded">
                        <Link href={`/admin/os/${os.id}`} className="text-sm text-white hover:text-ouro-400">
                          OS-{String(os.numero).padStart(3,"0")} - {os.cliente.nome} <span className="text-xs text-zinc-500">({formatDate(os.dataEntrada)})</span>
                        </Link>
                        {fone && (
                          <Button asChild size="sm" variant="outline">
                            <a href={whatsappLink(fone, msg)} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-3 w-3 mr-1" /> Lembrar
                            </a>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {materiaisBaixosCount > 0 && (
              <div>
                <div className="font-semibold text-white mb-1 flex items-center gap-2">
                  <Package className="h-4 w-4" /> {materiaisBaixosCount} materiais com estoque baixo
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/estoque">Ver estoque <ArrowRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ultimas OS</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/os">Ver todas <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ultimasOS.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm mb-3">Nenhuma OS ainda</p>
                <Button asChild size="sm">
                  <Link href="/admin/os/novo"><Plus className="h-3 w-3 mr-1" /> Criar primeira</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {ultimasOS.map((os) => {
                  const s = statusInfo(os.status);
                  return (
                    <Link key={os.id} href={`/admin/os/${os.id}`} className="flex items-center justify-between p-2 bg-zinc-950 rounded hover:bg-zinc-900">
                      <div>
                        <div className="font-semibold text-ouro-400 text-sm">OS-{String(os.numero).padStart(3,"0")} - {os.cliente.nome}</div>
                        <div className="text-xs text-zinc-500">{formatDate(os.dataEntrada)}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${s.cor}`}>{s.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atalhos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/os/novo"><Plus className="h-4 w-4 mr-2" /> Nova OS</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/vendas/nova"><ShoppingCart className="h-4 w-4 mr-2" /> Nova venda</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/financeiro/novo"><DollarSign className="h-4 w-4 mr-2" /> Lançamento financeiro</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/relatorios"><TrendingUp className="h-4 w-4 mr-2" /> Relatorios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}