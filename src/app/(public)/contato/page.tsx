import { Phone, Instagram, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContatoPage() {
  const whatsapp = process.env.NEXT_PUBLIC_SAPATARIA_WHATSAPP ?? "5527997048164";
  const telefone = process.env.NEXT_PUBLIC_SAPATARIA_TELEFONE ?? "+55 27 99704-8164";
  const endereco = process.env.NEXT_PUBLIC_SAPATARIA_ENDERECO ?? "Rua dos EvangÃ©licos, 453 â€” Santa Maria de JetibÃ¡/ES";
  const insta = process.env.NEXT_PUBLIC_SAPATARIA_INSTAGRAM ?? "martinellisapataria";

  return (
    <div className="container py-16">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Contato</h1>
        <p className="text-lg text-zinc-300 mt-3">Mande uma mensagem, tire dÃºvidas ou peÃ§a um orÃ§amento.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-12">
        <div className="space-y-4">
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 border border-zinc-800 bg-zinc-900/40 rounded-lg hover:border-ouro-600/50 transition">
            <Phone className="h-5 w-5 text-ouro-400 mt-0.5" />
            <div>
              <div className="font-semibold text-white">WhatsApp</div>
              <div className="text-sm text-zinc-400">{telefone}</div>
            </div>
          </a>
          <a href={`https://instagram.com/${insta}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 border border-zinc-800 bg-zinc-900/40 rounded-lg hover:border-ouro-600/50 transition">
            <Instagram className="h-5 w-5 text-ouro-400 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Instagram</div>
              <div className="text-sm text-zinc-400">@{insta}</div>
            </div>
          </a>
          <div className="flex items-start gap-3 p-4 border border-zinc-800 bg-zinc-900/40 rounded-lg">
            <MapPin className="h-5 w-5 text-ouro-400 mt-0.5" />
            <div>
              <div className="font-semibold text-white">EndereÃ§o</div>
              <div className="text-sm text-zinc-400">{endereco}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-zinc-800 bg-zinc-900/40 rounded-lg">
            <Clock className="h-5 w-5 text-ouro-400 mt-0.5" />
            <div>
              <div className="font-semibold text-white">HorÃ¡rio</div>
              <div className="text-sm text-zinc-400">A confirmar (definir conforme seu horÃ¡rio real)</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-ouro-600 to-ouro-800 text-black rounded-2xl p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">OrÃ§amento rÃ¡pido</h2>
            <p className="text-zinc-900 mb-6">Manda uma foto da peÃ§a pelo WhatsApp e a gente responde com o orÃ§amento em poucas horas.</p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <a href={`https://wa.me/${whatsapp}?text=OlÃ¡! Gostaria de um orÃ§amento.`} target="_blank" rel="noopener noreferrer">
              Abrir WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
