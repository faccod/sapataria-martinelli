import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { ADMIN_HASH } from "@/lib/config-seguranca";

const COOKIE_NAME = "martinelli_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function signIn(user: string, password: string): Promise<boolean> {
  const adminUser = (process.env.ADMIN_USER ?? "admin").trim();
  const adminHash = ADMIN_HASH;
  if (!adminUser || !adminHash) return false;
  if (user !== adminUser) return false;
  try {
    const ok = await bcrypt.compare(password, adminHash);
    if (!ok) return false;
  } catch { return false; }
  cookies().set(COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return true;
}

export function signOut() {
  cookies().delete(COOKIE_NAME);
}

export function isAuthenticated(): boolean {
  return cookies().get(COOKIE_NAME)?.value === "authenticated";
}