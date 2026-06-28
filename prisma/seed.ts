import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MATERIAIS_PADRAO = [
  { nome: "Couro bovino (m2)", unidade: "m", quantidade: 0, estoqueMin: 2, custo: 80 },
  { nome: "Solado de borracha (par)", unidade: "par", quantidade: 0, estoqueMin: 10, custo: 12 },
  { nome: "Solado de couro (par)", unidade: "par", quantidade: 0, estoqueMin: 5, custo: 25 },
  { nome: "Linha grossa", unidade: "un", quantidade: 0, estoqueMin: 5, custo: 8 },
  { nome: "Linha fina", unidade: "un", quantidade: 0, estoqueMin: 5, custo: 6 },
  { nome: "Cola de sapateiro", unidade: "L", quantidade: 0, estoqueMin: 2, custo: 35 },
  { nome: "Tinta preta para couro", unidade: "un", quantidade: 0, estoqueMin: 3, custo: 18 },
  { nome: "Ziper comum", unidade: "un", quantidade: 0, estoqueMin: 10, custo: 5 },
  { nome: "Fivela", unidade: "un", quantidade: 0, estoqueMin: 10, custo: 4 },
  { nome: "Tecido forro", unidade: "m", quantidade: 0, estoqueMin: 3, custo: 22 },
];

const PRODUTOS_PADRAO = [
  { nome: "Cinto de couro", descricao: "Cinto artesanal de couro legitimo", precoCusto: 25, precoVenda: 65, estoque: 0 },
  { nome: "Carteira de couro", descricao: "Carteira masculina de couro", precoCusto: 18, precoVenda: 55, estoque: 0 },
  { nome: "Capa de celular em couro", descricao: "Capa sob medida em couro", precoCusto: 15, precoVenda: 50, estoque: 0 },
  { nome: "Creme para couro 200ml", descricao: "Creme hidratante para couro", precoCusto: 8, precoVenda: 28, estoque: 0 },
  { nome: "Bainha de couro", descricao: "Bainha para ferramentas", precoCusto: 12, precoVenda: 40, estoque: 0 },
];

async function main() {
  // Admin (re-executa de forma idempotente)
  const adminUser = process.env.ADMIN_USER ?? "admin";
  const adminPass = "admin123";
  const hash = await bcrypt.hash(adminPass, 10);
  await prisma.adminUser.upsert({
    where: { user: adminUser },
    update: { hash },
    create: { user: adminUser, hash },
  });
  console.log(`Admin: ${adminUser} / ${adminPass}`);

  // Categorias
  const categorias = [
    { nome: "Servico",      slug: "servico",      cor: "#8c5f3d" },
    { nome: "Antes e Depois", slug: "antes-e-depois", cor: "#a8794a" },
    { nome: "Dicas",        slug: "dicas",        cor: "#6f4a32" },
    { nome: "Novidades",    slug: "novidades",    cor: "#3d2818" },
  ];
  for (const c of categorias) {
    await prisma.categoriaPost.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log(`${categorias.length} categorias OK`);

  // Configs
  const configs = [
    { chave: "empresa_nome",     valor: "Sapataria Martinelli" },
    { chave: "empresa_telefone", valor: "+55 27 99704-8164" },
    { chave: "empresa_whatsapp", valor: "5527997048164" },
    { chave: "empresa_endereco", valor: "Rua dos Evangelicos, 453 - Santa Maria de Jetiba/ES" },
    { chave: "empresa_instagram", valor: "martinellisapataria" },
    { chave: "msg_os_criada",    valor: "Ola {nome}! Recebemos seu {item} para {servico}. OS #{numero}. Retirada prevista: {data}." },
    { chave: "msg_os_status",    valor: "Ola {nome}! Sua OS #{numero} foi atualizada. Status: {status}." },
    { chave: "msg_os_concluida", valor: "Ola {nome}! Seu {item} esta pronto! Saldo a pagar: R$ {saldo}. Retirar na Sapataria Martinelli!" },
    { chave: "msg_lembrete_20",  valor: "Ola {nome}! Voce tem uma OS #{numero} pronta ha 20 dias. Passou aqui pra retirar?" },
    { chave: "msg_lembrete_30",  valor: "Ola {nome}! Sua OS #{numero} esta ha 30 dias sem retirada. Estamos te esperando!" },
    { chave: "msg_lembrete_60",  valor: "Ola {nome}! Urgente! Sua OS #{numero} esta ha 60 dias. Precisamos liberar espaco!" },
  ];
  for (const c of configs) {
    await prisma.config.upsert({ where: { chave: c.chave }, update: { valor: c.valor }, create: c });
  }
  console.log(`${configs.length} configs OK`);

  // Servicos (tambem ficam em Config pra retrocompatibilidade)
  const servicos = ["Costura de solado","Troca de solado","Reforma de calcados","Reparo de bolsas","Reparo de mochilas","Reparo de malas","Reparo de jaquetas","Reparo de carteiras","Reparo de cintos","Fabricacao sob medida","Outros"];
  for (const nome of servicos) {
    const slug = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    await prisma.config.upsert({ where: { chave: `servico_${slug}` }, update: { valor: nome }, create: { chave: `servico_${slug}`, valor: nome } });
  }
  console.log(`${servicos.length} servicos OK (em Config retrocompat)`);

  // Listas editaveis (SERVICO / TIPO_ITEM / TIPO_PRODUTO)
  const SERVICOS_LISTA = ["Costura de solado","Troca de solado","Reforma de calcados","Reparo de bolsas","Reparo de mochilas","Reparo de malas","Reparo de jaquetas","Reparo de carteiras","Reparo de cintos","Troca de ziper","Troca de forro","Fabricacao sob medida","Outros"];
  const TIPOS_ITEM_LISTA = ["Sapato","Bota","Sandalia","Bolsa","Mochila","Mala","Jaqueta","Carteira","Cinto","Outros"];
  const TIPOS_PRODUTO_LISTA = ["Cinto","Carteira","Bainha","Capa de celular","Bolsa","Creme para couro","Outros"];

  let listasCriadas = 0;
  const popular = async (tipo: string, lista: string[]) => {
    let ordem = 0;
    for (const nome of lista) {
      ordem++;
      try {
        await prisma.lista.upsert({
          where: { tipo_nome: { tipo, nome } },
          update: { ativo: true, ordem },
          create: { tipo, nome, ordem, ativo: true },
        });
        listasCriadas++;
      } catch (e) { /* ja existe, segue */ }
    }
  };
  await popular("SERVICO", SERVICOS_LISTA);
  await popular("TIPO_ITEM", TIPOS_ITEM_LISTA);
  await popular("TIPO_PRODUTO", TIPOS_PRODUTO_LISTA);
  console.log(`${listasCriadas} itens nas listas editaveis`);

  // Materiais (seed se nao existir)
  let materiaisCriados = 0;
  for (const m of MATERIAIS_PADRAO) {
    const existe = await prisma.material.findUnique({ where: { nome: m.nome } });
    if (!existe) { await prisma.material.create({ data: m }); materiaisCriados++; }
  }
  console.log(`${materiaisCriados} materiais novos criados`);

  // Produtos (seed se nao existir)
  let produtosCriados = 0;
  for (const p of PRODUTOS_PADRAO) {
    const existe = await prisma.produto.findUnique({ where: { nome: p.nome } });
    if (!existe) { await prisma.produto.create({ data: p }); produtosCriados++; }
  }
  console.log(`${produtosCriados} produtos novos criados`);

  // Post de exemplo
  const catServico = await prisma.categoriaPost.findUnique({ where: { slug: "servico" } });
  if (catServico) {
    const existe = await prisma.post.findUnique({ where: { slug: "bem-vindo-ao-blog-da-sapataria" } });
    if (!existe) {
      await prisma.post.create({
        data: {
          slug: "bem-vindo-ao-blog-da-sapataria",
          titulo: "Bem-vindo ao blog da Sapataria Martinelli",
          resumo: "Vamos compartilhar dicas de cuidado, antes e depois de consertos e novidades da oficina. Acompanhe!",
          conteudo: `# Ola!\n\nEste e o **blog oficial** da Sapataria Martinelli, em Santa Maria de Jetiba/ES.\n\n## O que voce vai encontrar aqui\n\n- Dicas de como conservar calcados e bolsas de couro\n- Antes e depois de pecas restauradas\n- Novidades e bastidores da oficina\n\n> "Conserto o que tem valor para voce."\n\nQuer um orcamento? E so chamar no WhatsApp!`,
          capa: null, publicado: true, destaque: true, categoriaId: catServico.id, publicadoEm: new Date(),
        },
      });
      console.log("Post de exemplo criado");
    }
  }

  console.log("\nSeed concluido!");
}

main().catch(console.error).finally(() => prisma.$disconnect());