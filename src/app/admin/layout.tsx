"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  Hammer,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menu = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, fase: "0+" },
  { href: "/admin/posts", label: "Blog / Posts", icon: FileText, fase: "1" },
  { href: "/admin/clientes", label: "Clientes", icon: Users, fase: "2" },
  { href: "/admin/os", label: "Ordens de Serviço", icon: Hammer, fase: "2" },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign, fase: "3" },
  { href: "/admin/estoque", label: "Estoque", icon: Package, fase: "3" },
  { href: "/admin/vendas", label: "Vendas", icon: ShoppingCart, fase: "3" },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3, fase: "3" },
  { href: "/admin/config", label: "Configurações", icon: Settings, fase: "3" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // fecha o drawer sempre que a rota muda
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // página de login: layout limpo, sem sidebar
  if (isLoginPage) {
    return <div className="min-h-screen bg-zinc-950">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* BOTÃO HAMBÚRGUER (mobile only) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="md:hidden fixed top-3 left-3 z-30 inline-flex items-center justify-center h-10 w-10 rounded-md bg-black/90 border border-ouro-600/40 text-ouro-400 backdrop-blur shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* OVERLAY — só aparece quando o drawer tá aberto */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        />
      )}

      {/* SIDEBAR — drawer no mobile, fixa no desktop */}
      <aside
        className={[
          "w-64 border-r border-ouro-700/40 bg-black flex flex-col",
          "fixed md:static inset-y-0 left-0 z-50 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="p-5 border-b border-zinc-900 flex items-center justify-between gap-2">
          <Link href="/admin" className="block min-w-0 flex-1">
            <div className="relative h-14 w-52 rounded-md border border-ouro-600/40 bg-black p-1.5 shadow-[0_0_15px_rgba(212,154,20,0.15)]">
              <Image
                src="/logo-admin.png"
                alt="Martinelli Admin"
                fill
                className="object-contain"
              />
            </div>
            <div className="text-[10px] text-ouro-400 uppercase tracking-widest mt-2 text-center">
              Painel administrativo
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-zinc-400 hover:bg-zinc-900 shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {menu.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex items-center justify-between px-3 py-2 rounded-md transition text-sm",
                  isActive
                    ? "bg-zinc-900 text-ouro-400"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-ouro-400",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.fase !== "0+" && (
                  <span className="text-[10px] uppercase tracking-wide bg-zinc-900 border border-ouro-700/40 px-1.5 py-0.5 rounded text-ouro-400">
                    F{item.fase}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <form action="/admin/api/logout" method="post" className="p-3 border-t border-zinc-900">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-zinc-300 hover:bg-zinc-900 hover:text-ouro-400"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </form>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto bg-zinc-950 pt-16 md:pt-8">
        {children}
      </main>
    </div>
  );
}
