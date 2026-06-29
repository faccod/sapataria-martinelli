"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
};

export function CapaInterativa({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  // bloqueia scroll da página quando o modal tá aberto
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // ESC fecha o modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ampliar imagem"
        className="block w-full max-w-3xl mx-auto group cursor-zoom-in"
      >
        <div className="relative bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-800">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </div>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label="Fechar"
            className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white text-xl border border-zinc-700"
          >
            ✕
          </button>
          <Image
            src={src}
            alt={alt}
            width={2000}
            height={2000}
            sizes="100vw"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
          />
        </div>
      )}
    </>
  );
}
