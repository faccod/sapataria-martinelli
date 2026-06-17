import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST() {
  signOut();
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SAPATARIA_SITE_URL ?? "http://localhost:3000"));
}
