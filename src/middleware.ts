import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "martinelli_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Libera TUDO que e API (login, logout, upload, posts) - sem checagem
  if (pathname.startsWith("/admin/api/")) {
    return NextResponse.next();
  }

  // Libera assets
  if (pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE);
  const isLogin = pathname === "/admin/login";

  // Se tem sessao e ta tentando ir pro login, manda pro admin
  if (isLogin && session?.value === "authenticated") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Se nao tem sessao e nao ta no login, manda pro login
  if (!isLogin && session?.value !== "authenticated") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};