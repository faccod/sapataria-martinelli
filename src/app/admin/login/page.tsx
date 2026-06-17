"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin";

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/admin/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });

    if (res.ok) { router.push(from); router.refresh(); }
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Usuario ou senha invalidos.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black p-4">
      <Card className="w-full max-w-md border-ouro-600/50 shadow-[0_0_30px_rgba(212,154,20,0.15)]">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto relative h-20 w-64 rounded-md border border-ouro-600/40 bg-black p-2 shadow-[0_0_20px_rgba(212,154,20,0.2)]">
            <Image src="/logo-site.png" alt="Martinelli" fill className="object-contain" />
          </div>
          <div className="pt-2">
            <CardTitle className="text-ouro-400">Area administrativa</CardTitle>
            <CardDescription>Acesse o painel de gestao</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1 block">Usuario</label>
              <Input value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin" autoComplete="username" required />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1 block">Senha</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            {error && <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md p-2">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-xs text-zinc-500 text-center pt-2">
              Usuario padrao: <code className="text-ouro-400">admin</code>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}