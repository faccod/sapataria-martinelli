import Link from "next/link";
import Image from "next/image";
import { Phone, Instagram, MapPin } from "lucide-react";

export function PublicFooter() {
  const whatsapp = process.env.NEXT_PUBLIC_SAPATARIA_WHATSAPP ?? "5527997048164";
  const telefone = process.env.NEXT_PUBLIC_SAPATARIA_TELEFONE ?? "+55 27 99704-8164";
  const endereco = process.env.NEXT_PUBLIC_SAPATARIA_ENDERECO ?? "Rua dos Evangélicos, 453 — Santa Maria de Jetibá/ES";
  const insta = process.env.NEXT_PUBLIC_SAPATARIA_INSTAGRAM ?? "martinellisapataria";

  return (
    <footer className="border-t border-ouro-700/40 bg-black mt-20">
      <div className="container py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="relative h-16 w-56 rounded-md border border-ouro-600/40 bg-black p-1.5 mb-3 shadow-[0_0_15px_rgba(212,154,20,0.15)]">
            <Image src="/logo-site.png" alt="Martinelli" fill className="object-contain" />
          </div>
          <p className="text-sm text-zinc-400">
            Conserto e fabricação de artigos em couro com qualidade artesanal.
          </p>
        </div>

        <div className="space-y-2 text-sm text-zinc-300">
          <div className="font-semibold mb-2 text-ouro-400 uppercase tracking-wider text-xs">Contato</div>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ouro-400">
            <Phone className="h-4 w-4" /> {telefone}
          </a>
          <a href={`https://instagram.com/${insta}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ouro-400">
            <Instagram className="h-4 w-4" /> @{insta}
          </a>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5" /> {endereco}
          </div>
        </div>

        <div className="space-y-2 text-sm text-zinc-300">
          <div className="font-semibold mb-2 text-ouro-400 uppercase tracking-wider text-xs">Navegação</div>
          <Link href="/" className="block hover:text-ouro-400">Home</Link>
          <Link href="/servicos" className="block hover:text-ouro-400">Serviços</Link>
          <Link href="/blog" className="block hover:text-ouro-400">Blog</Link>
          <Link href="/contato" className="block hover:text-ouro-400">Contato</Link>
        </div>
      </div>

      <div className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-500">
        Â© {new Date().getFullYear()} Martinelli Sapataria &amp; Acessórios. Todos os direitos reservados.
      </div>
    </footer>
  );
}