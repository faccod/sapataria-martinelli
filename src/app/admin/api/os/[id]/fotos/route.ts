import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const TIPOS_VALIDOS = ["ANTES", "DEPOIS"] as const;
type TipoFoto = (typeof TIPOS_VALIDOS)[number];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const tipo = formData.get("tipo") as string | null;

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  if (!tipo || !TIPOS_VALIDOS.includes(tipo as TipoFoto)) {
    return NextResponse.json({ error: "Tipo invalido (use ANTES ou DEPOIS)" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo nao permitido. Use JPG, PNG, WebP ou GIF." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande. Maximo 5MB." }, { status: 400 });
  }

  const osExists = await prisma.oS.findUnique({ where: { id: params.id } });
  if (!osExists) return NextResponse.json({ error: "OS nao encontrada" }, { status: 404 });

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const hashedName = `${crypto.randomBytes(12).toString("hex")}${ext}`;
  const blobPath = `os/${params.id}/${hashedName}`;

  let url: string;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(blobPath, file, { access: "public", addRandomSuffix: false });
    url = blob.url;
  } else {
    // Fallback dev local
    const uploadDir = path.join(process.cwd(), "public", "uploads", "os", params.id);
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, hashedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);
    url = `/uploads/os/${params.id}/${hashedName}`;
  }

  const foto = await prisma.fotoOS.create({
    data: { osId: params.id, url, tipo: tipo as TipoFoto },
  });

  return NextResponse.json({ foto });
}