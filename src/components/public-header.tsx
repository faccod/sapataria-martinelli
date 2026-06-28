import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-ouro-700/40 bg-black/95 backdrop-blur">
      <div className="container flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-16 w-56 rounded-md border border-ouro-600/40 bg-black p-1.5 shadow-[0_0_15px_rgba(212,154,20,0.15)]">
            <Image src="/logo-site.png" alt="Martinelli Sapataria & Acessórios" fill className="object-contain" priority />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider text-zinc-200">
          <Link href="/" className="hover:text-ouro-400 transition">Home</Link>
          <Link href="/servicos" className="hover:text-ouro-400 transition">Serviços</Link>
          <Link href="/blog" className="hover:text-ouro-400 transition">Blog</Link>
          <Link href="/contato" className="hover:text-ouro-400 transition">Contato</Link>
        </nav>

        <Link
          href="/admin/login"
          className="hidden md:inline-flex items-center text-sm text-ouro-400 hover:text-ouro-300 border border-ouro-600/50 px-3 py-1.5 rounded-md hover:bg-ouro-500/10 transition"
        >
          <Menu className="h-4 w-4 mr-1" /> Admin
        </Link>
      </div>
    </header>
  );
}