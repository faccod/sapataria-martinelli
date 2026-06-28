import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Martinelli Sapataria & Acessórios — Couro artesanal em Santa Maria de Jetibá/ES",
    template: "%s — Martinelli Sapataria",
  },
  description:
    "Conserto de sapatos, bolsas, jaquetas, mochilas, malas e botas. Fabricação sob medida em couro. Santa Maria de Jetibá/ES.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SAPATARIA_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
