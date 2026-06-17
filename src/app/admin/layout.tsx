import Link from "next/link";
import Image from "next/image";
import { LogOut, LayoutDashboard, FileText, Users, Hammer, DollarSign, Package, ShoppingCart, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const menu = [
  { href: "/admin",             label: "Dashboard",   icon: LayoutDashboard, fase: "0+" },
  { href: "/admin/posts",       label: "Blog / Posts", icon: FileText,        fase: "1" },
  { href: "/admin/clientes",    label: "Clientes",    icon: Users,           fase: "2" },
  { href: "/admin/os",          label: "Ordens de Servico", icon: Hammer,   fase: "2" },
  { href: "/admin/financeiro",  label: "Financeiro",  icon: DollarSign,      fase: "3" },
  { href: "/admin/estoque",     label: "Estoque",     icon: Package,         fase: "3" },
  { href: "/admin/vendas",      label: "Vendas",      icon: ShoppingCart,    fase: "3" },
  { href: "/admin/relatorios",  label: "Relatorios",  icon: BarChart3,       fase: "3" },
  { href: "/admin/config",      label: "Configuracoes", icon: Settings,      fase: "3" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="w-64 border-r border-ouro-700/40 bg-black flex flex-col">
        <div className="p-5 border-b border-zinc-900">
          <Link href="/admin" className="block">
            <div className="relative h-14 w-52 rounded-md border border-ouro-600/40 bg-black p-1.5 shadow-[0_0_15px_rgba(212,154,20,0.15)]">
              <Image src="/logo-admin.png" alt="Martinelli Admin" fill className="object-contain" />
            </div>
            <div className="text-[10px] text-ouro-400 uppercase tracking-widest mt-2 text-center">Painel administrativo</div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {menu.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-900 transition text-sm text-zinc-300 hover:text-ouro-400">
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
          ))}
        </nav>

        <form action="/admin/api/logout" method="post" className="p-3 border-t border-zinc-900">
          <Button type="submit" variant="ghost" className="w-full justify-start text-zinc-300 hover:bg-zinc-900 hover:text-ouro-400">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </form>
      </aside>

      <main className="flex-1 p-8 overflow-auto bg-zinc-950">{children}</main>
    </div>
  );
}