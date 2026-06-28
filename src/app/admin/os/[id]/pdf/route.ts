import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatCurrency, formatDate } from "@/lib/utils";
import QRCode from "qrcode";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const os = await prisma.oS.findUnique({
    where: { id: params.id },
    include: { cliente: true, itens: true },
  });
  if (!os) return NextResponse.json({ error: "Nao encontrada" }, { status: 404 });

  const siteUrl = process.env.NEXT_PUBLIC_SAPATARIA_SITE_URL ?? "http://localhost:3000";
  const linkPublico = `${siteUrl}/os/${os.id}`;

  // Gera QR como data URL
  const qrDataUrl = await QRCode.toDataURL(linkPublico, { width: 200, margin: 1 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const ouro = rgb(0.83, 0.6, 0.08);
  const preto = rgb(0.05, 0.05, 0.05);
  const cinza = rgb(0.4, 0.4, 0.4);

  let y = 800;

  // Cabecalho
  page.drawText("MARTINELLI SAPATARIA & ACESSORIOS", { x: 40, y, size: 16, font: fontBold, color: ouro });
  y -= 18;
  page.drawText("Santa Maria de Jetiba/ES - (27) 99704-8164", { x: 40, y, size: 9, font, color: cinza });
  y -= 30;

  // Titulo OS
  page.drawText(`Ordem de Servico #${String(os.numero).padStart(3, "0")}`, { x: 40, y, size: 14, font: fontBold, color: preto });
  y -= 16;
  page.drawText(`Data de entrada: ${formatDate(os.dataEntrada)}`, { x: 40, y, size: 10, font });
  y -= 12;
  if (os.dataPrevista) { page.drawText(`Data prevista: ${formatDate(os.dataPrevista)}`, { x: 40, y, size: 10, font }); y -= 12; }
  y -= 10;

  // Cliente
  page.drawText("CLIENTE", { x: 40, y, size: 9, font: fontBold, color: ouro }); y -= 12;
  page.drawText(os.cliente.nome, { x: 40, y, size: 11, font: fontBold }); y -= 13;
  if (os.cliente.telefone) { page.drawText(`Telefone: ${os.cliente.telefone}`, { x: 40, y, size: 10, font }); y -= 12; }
  if (os.cliente.endereco) { page.drawText(`Endereco: ${os.cliente.endereco}`, { x: 40, y, size: 10, font }); y -= 12; }
  y -= 8;

  // Itens
  page.drawText("SERVICOS", { x: 40, y, size: 9, font: fontBold, color: ouro }); y -= 12;
  for (const it of os.itens) {
    page.drawText(`${it.tipoItem}${it.marca ? " - " + it.marca : ""}${it.cor ? " (" + it.cor + ")" : ""}`, { x: 40, y, size: 10, font: fontBold }); y -= 12;
    page.drawText(`Servico: ${it.servico}`, { x: 60, y, size: 9, font }); y -= 11;
    if (it.descricao) { page.drawText(`Descricao: ${it.descricao}`, { x: 60, y, size: 9, font, color: cinza }); y -= 11; }
    page.drawText(`Valor: ${formatCurrency(it.valor)}`, { x: 60, y, size: 9, font }); y -= 15;
  }
  y -= 5;

  // Total
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: cinza }); y -= 15;
  page.drawText("Total:", { x: 380, y, size: 11, font: fontBold });
  page.drawText(formatCurrency(os.valorTotal), { x: 480, y, size: 11, font: fontBold, color: ouro });
  y -= 14;
  page.drawText("Sinal:", { x: 380, y, size: 9, font, color: cinza });
  page.drawText(formatCurrency(os.valorEntrada), { x: 480, y, size: 9, font }); y -= 11;
  page.drawText("Saldo:", { x: 380, y, size: 9, font: fontBold });
  page.drawText(formatCurrency(os.valorSaldo), { x: 480, y, size: 9, font: fontBold, color: ouro });
  y -= 20;

  // QR Code
  const qrImg = await pdfDoc.embedPng(qrDataUrl);
  page.drawImage(qrImg, { x: 450, y: 30, width: 100, height: 100 });
  page.drawText("Consulte o status online:", { x: 40, y: 100, size: 8, font, color: cinza });
  page.drawText("Acesse o link ou escaneie o QR code ao lado", { x: 40, y: 88, size: 8, font, color: cinza });

  // Termos
  y = 50;
  page.drawText("Prazo de retirada: 20 dias apos conclusao. Apos esse prazo,", { x: 40, y, size: 7, font, color: cinza }); y -= 9;
  page.drawText("a sapataria nao se responsabiliza pelas pecas nao retiradas.", { x: 40, y, size: 7, font, color: cinza }); y -= 9;
  page.drawText("Orcamento valido por 7 dias. Garantia de 90 dias sobre o servico executado.", { x: 40, y, size: 7, font, color: cinza });

  const bytes = await pdfDoc.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="OS-${String(os.numero).padStart(3,"0")}.pdf"`,
    },
  });
}