import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(req: Request) {
  const { user, password } = await req.json();
  const ok = await signIn(user, password);
  if (!ok) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
