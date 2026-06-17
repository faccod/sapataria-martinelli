# Sapataria Martinelli

Sistema integrado: **Blog público** + **sistema interno de gestão** (OS, clientes, financeiro, estoque) numa única aplicação Next.js.

## Stack
- Next.js 14 (App Router) + TypeScript
- Prisma + SQLite (dev) / Turso (produção)
- Tailwind CSS + shadcn/ui
- Auth simples (1 usuário, cookie httpOnly)

## Como rodar local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env
# Edite o .env: gere uma senha com:
#   node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA',10))"
# e cole no campo ADMIN_PASSWORD_HASH

# 3. Criar o banco
npx prisma db push

# 4. Popular com dados iniciais (admin, categorias, configs)
npx prisma db seed

# 5. Rodar
npm run dev
```

Acesse:
- **Site público:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login
  - Usuário: `admin`
  - Senha: a que você definiu no `.env` (padrão se você só rodou o seed sem mexer: precisa atualizar o hash)

## Estrutura

```
src/
  app/
    (public)/         # rotas públicas (site/blog)
      page.tsx        # home
      servicos/
      blog/
      contato/
    admin/            # rotas protegidas (sistema)
      login/
      page.tsx        # dashboard
      posts/          # fase 1 — blog
      clientes/       # fase 2
      os/             # fase 2
      financeiro/     # fase 3
      estoque/        # fase 3
      vendas/         # fase 3
      relatorios/     # fase 3
      config/         # fase 3
      api/            # endpoints (login, logout)
  components/         # ui + layout
  lib/                # prisma, auth, utils
prisma/
  schema.prisma       # banco
  seed.ts             # dados iniciais
public/
  uploads/            # imagens enviadas
```

## Plano de fases

- **Fase 0 (atual):** fundação — setup, schema, layout, login.
- **Fase 1:** Blog (CRUD de posts, capa, SEO, compartilhamento).
- **Fase 2:** Clientes, OS, status, dashboard, WhatsApp, PDF, QR Code.
- **Fase 3:** Financeiro, estoque, vendas, relatórios.

## Quando for subir pra domínio

1. Comprar domínio (sugestão: `martinellisapataria.com.br` no Registro.br).
2. Criar projeto na Vercel.
3. Criar banco no Turso.
4. Trocar `DATABASE_URL` e adicionar `TURSO_AUTH_TOKEN`.
5. Trocar `NEXT_PUBLIC_SAPATARIA_SITE_URL` pro domínio final.
6. Deploy.
