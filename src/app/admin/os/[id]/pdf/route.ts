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

  const qrDataUrl = await QRCode.toDataURL(linkPublico, { width: 160, margin: 1 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 retrato

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const ouro = rgb(0.83, 0.6, 0.08);
  const preto = rgb(0.05, 0.05, 0.05);
  const cinza = rgb(0.45, 0.45, 0.45);
  const cinzaClaro = rgb(0.75, 0.75, 0.75);

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN_X = 40;
  const VIA_HEIGHT = (PAGE_H - 60) / 2; // ~391 cada via

  const qrImg = await pdfDoc.embedPng(qrDataUrl);

  // narrow pra closure do drawVia
  const osSafe = os;

  // Desenha uma via começando em yBase (topo da via).
  function drawVia(yBase: number, label: string, assinatura: string) {
    let y = yBase;

    // Selo da via (canto superior direito)
    page.drawText(label, {
      x: PAGE_W - MARGIN_X - fontBold.widthOfTextAtSize(label, 10),
      y: y - 2,
      size: 10,
      font: fontBold,
      color: ouro,
    });

    // Cabeçalho da loja
    page.drawText("MARTINELLI SAPATARIA & ACESSORIOS", { x: MARGIN_X, y, size: 13, font: fontBold, color: ouro });
    y -= 14;
    page.drawText("Santa Maria de Jetiba/ES  ·  (27) 99704-8164", { x: MARGIN_X, y, size: 8, font, color: cinza });
    y -= 18;

    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_W - MARGIN_X, y }, thickness: 0.5, color: cinzaClaro });
    y -= 14;

    // OS + datas
    page.drawText(`Ordem de Servico #${String(osSafe.numero).padStart(3, "0")}`, { x: MARGIN_X, y, size: 12, font: fontBold, color: preto });
    y -= 13;
    page.drawText(`Entrada: ${formatDate(osSafe.dataEntrada)}`, { x: MARGIN_X, y, size: 9, font });
    if (osSafe.dataPrevista) {
      page.drawText(`Prevista: ${formatDate(osSafe.dataPrevista)}`, { x: 240, y, size: 9, font });
    }
    y -= 14;

    // Cliente
    page.drawText("CLIENTE", { x: MARGIN_X, y, size: 8, font: fontBold, color: ouro });
    y -= 11;
    page.drawText(osSafe.cliente.nome, { x: MARGIN_X, y, size: 10, font: fontBold });
    y -= 11;
    if (osSafe.cliente.telefone) { page.drawText(`Tel: ${osSafe.cliente.telefone}`, { x: MARGIN_X, y, size: 8, font }); y -= 10; }
    if (osSafe.cliente.endereco) { page.drawText(`End: ${osSafe.cliente.endereco}`, { x: MARGIN_X, y, size: 8, font }); y -= 10; }
    y -= 6;

    // Itens
    page.drawText("SERVICOS", { x: MARGIN_X, y, size: 8, font: fontBold, color: ouro });
    y -= 11;
    for (const it of osSafe.itens) {
      page.drawText(`${it.tipoItem}${it.marca ? " - " + it.marca : ""}${it.cor ? " (" + it.cor + ")" : ""}`, { x: MARGIN_X, y, size: 9, font: fontBold });
      y -= 10;
      page.drawText(`Servico: ${it.servico}`, { x: MARGIN_X + 12, y, size: 8, font });
      y -= 9;
      if (it.descricao) { page.drawText(`Descricao: ${it.descricao}`, { x: MARGIN_X + 12, y, size: 8, font, color: cinza }); y -= 9; }
      page.drawText(`Valor: ${formatCurrency(it.valor)}`, { x: PAGE_W - MARGIN_X - 80, y, size: 8, font: fontBold, color: ouro });
      y -= 12;
    }
    y -= 4;

    // Total
    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_W - MARGIN_X, y }, thickness: 0.5, color: cinzaClaro });
    y -= 12;
    page.drawText("TOTAL:", { x: PAGE_W - MARGIN_X - 110, y, size: 10, font: fontBold });
    page.drawText(formatCurrency(osSafe.valorTotal), { x: PAGE_W - MARGIN_X - 60, y, size: 10, font: fontBold, color: ouro });
    y -= 11;
    page.drawText("Sinal:", { x: PAGE_W - MARGIN_X - 110, y, size: 8, font, color: cinza });
    page.drawText(formatCurrency(osSafe.valorEntrada), { x: PAGE_W - MARGIN_X - 60, y, size: 8, font });
    y -= 9;
    page.drawText("Saldo:", { x: PAGE_W - MARGIN_X - 110, y, size: 9, font: fontBold });
    page.drawText(formatCurrency(osSafe.valorSaldo), { x: PAGE_W - MARGIN_X - 60, y, size: 9, font: fontBold, color: ouro });

    // QR no canto inferior direito da via
    page.drawImage(qrImg, { x: PAGE_W - MARGIN_X - 70, y: yBase - VIA_HEIGHT + 6, width: 60, height: 60 });

    // Texto abaixo do QR
    page.drawText("Consulte online:", { x: MARGIN_X, y: yBase - VIA_HEIGHT + 48, size: 7, font, color: cinza });
    page.drawText(linkPublico, { x: MARGIN_X, y: yBase - VIA_HEIGHT + 38, size: 7, font, color: cinza });

    // Linha de assinatura
    const yAss = yBase - VIA_HEIGHT + 22;
    page.drawLine({ start: { x: MARGIN_X, y: yAss }, end: { x: MARGIN_X + 200, y: yAss }, thickness: 0.5, color: preto });
    page.drawText(assinatura, { x: MARGIN_X, y: yAss - 9, size: 7, font, color: cinza });

    // Termos (rodapé)
    page.drawText("Prazo de retirada: 20 dias apos conclusao. Orcamento valido por 7 dias. Garantia: 90 dias sobre o servico executado.", {
      x: MARGIN_X, y: yBase - VIA_HEIGHT + 5, size: 6, font, color: cinza,
    });
  }

  // 1ª VIA — topo da folha
  drawVia(PAGE_H - 30, "1ª VIA - CLIENTE", "Assinatura do cliente");

  // Linha de corte (pontilhada) no meio
  const cutY = PAGE_H / 2;
  page.drawText("✂  CORTAR AQUI", {
    x: PAGE_W / 2 - 35, y: cutY + 2, size: 8, font: fontBold, color: cinza,
  });
  for (let x = MARGIN_X; x < PAGE_W - MARGIN_X; x += 6) {
    page.drawLine({ start: { x, y: cutY - 10 }, end: { x: x + 3, y: cutY - 10 }, thickness: 0.5, color: cinzaClaro });
    page.drawLine({ start: { x, y: cutY + 10 }, end: { x: x + 3, y: cutY + 10 }, thickness: 0.5, color: cinzaClaro });
  }

  // 2ª VIA — base da folha
  drawVia(cutY - 30, "2ª VIA - LOJA", "Assinatura do responsavel (loja)");

  const bytes = await pdfDoc.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="OS-${String(os.numero).padStart(3,"0")}.pdf"`,
    },
  });
}