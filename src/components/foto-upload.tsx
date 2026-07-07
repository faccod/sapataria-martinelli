"use client";

import { useRef, useState } from "react";
import { Trash2, Upload, Loader2, ImageIcon } from "lucide-react";

type Foto = {
  id: string;
  url: string;
  tipo: string;
  createdAt: Date | string;
};

export function FotoUpload({ osId, fotos: initialFotos }: { osId: string; fotos: Foto[] }) {
  const [fotos, setFotos] = useState<Foto[]>(initialFotos);
  const [tipo, setTipo] = useState<"ANTES" | "DEPOIS">("ANTES");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("tipo", tipo);

      const r = await fetch(`/admin/api/os/${osId}/fotos`, { method: "POST", body: fd });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Falha no upload");
      }
      const { foto } = await r.json();
      setFotos([...fotos, foto]);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      setError(err.message ?? "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta foto?")) return;
    try {
      const r = await fetch(`/admin/api/os/fotos/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Falha ao deletar");
      setFotos(fotos.filter((f) => f.id !== id));
    } catch (err: any) {
      setError(err.message ?? "Erro ao deletar");
    }
  }

  const antes = fotos.filter((f) => f.tipo === "ANTES");
  const depois = fotos.filter((f) => f.tipo === "DEPOIS");

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Tipo:</span>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name="tipo-foto"
              value="ANTES"
              checked={tipo === "ANTES"}
              onChange={() => setTipo("ANTES")}
              className="accent-ouro-500"
            />
            <span className="text-zinc-200">Antes</span>
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name="tipo-foto"
              value="DEPOIS"
              checked={tipo === "DEPOIS"}
              onChange={() => setTipo("DEPOIS")}
              className="accent-ouro-500"
            />
            <span className="text-zinc-200">Depois</span>
          </label>
        </div>
        <div className="ml-auto">
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-ouro-500 text-black text-sm font-semibold cursor-pointer hover:bg-ouro-400 transition ${
              uploading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Enviando..." : "Adicionar foto"}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFile}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 p-2 bg-red-950/30 border border-red-900/50 rounded">
          {error}
        </div>
      )}

      {/* Galeria ANTES */}
      <div>
        <div className="text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Antes <span className="text-ouro-400">({antes.length})</span>
        </div>
        {antes.length === 0 ? (
          <div className="aspect-[3/1] border border-dashed border-zinc-800 rounded flex items-center justify-center text-xs text-zinc-600">
            <ImageIcon className="h-4 w-4 mr-1.5" /> Nenhuma foto antes
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {antes.map((f) => (
              <div key={f.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.url}
                  alt="Foto antes"
                  className="aspect-square w-full object-cover rounded border border-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(f.id)}
                  aria-label="Excluir foto"
                  className="absolute top-1 right-1 h-7 w-7 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Galeria DEPOIS */}
      <div>
        <div className="text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Depois <span className="text-ouro-400">({depois.length})</span>
        </div>
        {depois.length === 0 ? (
          <div className="aspect-[3/1] border border-dashed border-zinc-800 rounded flex items-center justify-center text-xs text-zinc-600">
            <ImageIcon className="h-4 w-4 mr-1.5" /> Nenhuma foto depois
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {depois.map((f) => (
              <div key={f.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.url}
                  alt="Foto depois"
                  className="aspect-square w-full object-cover rounded border border-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(f.id)}
                  aria-label="Excluir foto"
                  className="absolute top-1 right-1 h-7 w-7 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}