"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Eye, EyeOff, Upload, X, ArrowLeft } from "lucide-react";
import { marked } from "marked";
import Link from "next/link";

type Categoria = { id: string; nome: string; cor: string };
type Post = { id: string; titulo: string; slug: string; resumo: string; conteudo: string; capa: string | null; categoriaId: string; publicado: boolean; destaque: boolean };

export function PostForm({ categorias, post }: { categorias: Categoria[]; post?: Post }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  const [titulo, setTitulo] = useState(post?.titulo ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [resumo, setResumo] = useState(post?.resumo ?? "");
  const [conteudo, setConteudo] = useState(post?.conteudo ?? "");
  const [capa, setCapa] = useState<string | null>(post?.capa ?? null);
  const [categoriaId, setCategoriaId] = useState(post?.categoriaId ?? categorias[0]?.id ?? "");
  const [publicado, setPublicado] = useState(post?.publicado ?? false);
  const [destaque, setDestaque] = useState(post?.destaque ?? false);
  const [uploading, setUploading] = useState(false);

  function autoSlug(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/admin/api/upload", { method: "POST", body: formData });
    if (res.ok) { const data = await res.json(); setCapa(data.url); }
    else { const data = await res.json().catch(() => ({})); setError(data.error ?? "Falha no upload."); }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent, forcePublicado?: boolean) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const payload = {
        titulo, slug: slug || autoSlug(titulo), resumo, conteudo, capa,
        categoriaId, publicado: forcePublicado ?? publicado, destaque,
      };
      const res = await fetch(post ? `/admin/api/posts/${post.id}` : "/admin/api/posts", {
        method: post ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { router.push("/admin/posts"); router.refresh(); }
      else { const data = await res.json().catch(() => ({})); setError(data.error ?? "Erro ao salvar."); }
    });
  }

  const htmlPreview = preview ? marked.parse(conteudo, { async: false }) as string : "";

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      <Button asChild variant="ghost" type="button" size="sm" className="text-zinc-400 hover:text-ouro-400">
        <Link href="/admin/posts"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">TÃ­tulo</label>
            <Input value={titulo} onChange={(e) => { setTitulo(e.target.value); if (!post) setSlug(autoSlug(e.target.value)); }} placeholder="Ex: Como consertar o solado de uma bota" required />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Resumo</label>
            <Textarea value={resumo} onChange={(e) => setResumo(e.target.value)} rows={2} placeholder="Frase curta que aparece no card e no Google." required />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-zinc-300">ConteÃºdo (Markdown)</label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(!preview)} className="text-zinc-400 hover:text-ouro-400">
                {preview ? <><EyeOff className="h-3 w-3 mr-1" /> Editar</> : <><Eye className="h-3 w-3 mr-1" /> Visualizar</>}
              </Button>
            </div>
            {preview ? (
              <div className="prose-couro border border-zinc-800 rounded-md p-4 min-h-[400px] bg-zinc-900/50" dangerouslySetInnerHTML={{ __html: htmlPreview }} />
            ) : (
              <Textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={20} placeholder="# TÃ­tulo do post&#10;&#10;Escreva em Markdown." className="font-mono text-sm" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Capa</label>
            {capa ? (
              <div className="relative aspect-[4/3] bg-zinc-800 rounded overflow-hidden mb-3">
                <Image src={capa} alt="Capa" fill className="object-cover" />
                <button type="button" onClick={() => setCapa(null)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="aspect-[4/3] bg-zinc-800 border-2 border-dashed border-zinc-700 rounded flex items-center justify-center mb-3">
                <span className="text-xs text-zinc-500">Sem capa</span>
              </div>
            )}
            <label className="block">
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
              <div className="inline-flex items-center justify-center w-full h-9 px-3 text-sm border border-zinc-700 rounded-md cursor-pointer hover:border-ouro-600/50 hover:bg-zinc-900 text-zinc-300">
                <Upload className="h-3 w-3 mr-2" />
                {uploading ? "Enviando..." : capa ? "Trocar capa" : "Enviar capa"}
              </div>
            </label>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Categoria</label>
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <label className="text-sm font-medium text-zinc-300 mb-1 block">URL (slug)</label>
            <Input value={slug} onChange={(e) => setSlug(autoSlug(e.target.value))} placeholder="meu-post-legal" />
            <p className="text-xs text-zinc-500 mt-1">/blog/<strong className="text-ouro-400">{slug || autoSlug(titulo) || "seu-post"}</strong></p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} className="rounded" />
              Publicado
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} className="rounded" />
              Destaque na home
            </label>
          </div>

          {error && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-3">{error}</div>}

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />{isPending ? "Salvando..." : "Salvar"}
            </Button>
            {!publicado && (
              <Button type="button" variant="secondary" className="w-full" onClick={(e) => handleSubmit(e, true)} disabled={isPending}>
                <Eye className="h-4 w-4 mr-2" /> Salvar e publicar
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
