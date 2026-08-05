# Ateliê do Sim — Frontend

Site institucional + área logada (marketplace de fornecedores) para uma
assessoria de casamentos. Full-stack em React com SSR via TanStack Start,
banco de dados e autenticação no Supabase, e um assistente de chat com IA
(OpenAI).

Veja [DOCUMENTATION.md](./DOCUMENTATION.md) para detalhes técnicos completos
(arquitetura, rotas, autenticação, banco de dados).

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19, SSR) + [TanStack Router](https://tanstack.com/router) (file-based routing)
- Vite 8 + [Nitro](https://v3.nitro.build/) (empacota o servidor para o provedor de deploy)
- Tailwind CSS v4 + shadcn/ui (Radix UI)
- [Supabase](https://supabase.com/) (Postgres + Auth + RLS)
- [Vercel AI SDK](https://ai-sdk.dev/) com OpenAI para o chat "Assistente Noiva"

## Rodando localmente

Requer Node.js 20+.

```sh
npm install
cp .env.example .env   # depois preencha os valores reais
npm run dev
```

O site sobe em `http://localhost:3000` (ou porta similar, o Vite avisa no
terminal).

### Variáveis de ambiente

Veja [.env.example](./.env.example) para a lista completa com explicação de
cada uma. Resumo:

| Variável                                                      | Necessária para            | Onde configurar                                                        |
| ------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_*` | Site inteiro (dados, auth) | `.env` local e Vercel                                                  |
| `SUPABASE_SERVICE_ROLE_KEY`                                   | Cadastro de novos usuários | `.env` local e Vercel (nunca no client)                                |
| `OPENAI_API_KEY`                                              | Chat "Assistente Noiva"    | `.env` local e Vercel (opcional — sem ela só o chat fica indisponível) |

## Scripts

```sh
npm run dev        # servidor de desenvolvimento com SSR
npm run build       # build de produção
npm run preview     # preview do build de produção
npm run lint         # eslint
npm run format       # prettier --write
```

## Deploy na Vercel

1. Suba este repositório para o GitHub (ou GitLab/Bitbucket).
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório — a
   Vercel detecta o TanStack Start automaticamente graças ao plugin `nitro()`
   em `vite.config.ts`.
3. Em **Settings → Environment Variables**, adicione as mesmas variáveis do
   `.env.example` (com os valores reais).
4. Deploy. Cada push na branch conectada gera um novo deploy automaticamente.

## Banco de dados (Supabase)

O schema (tabelas, RLS, seeds) vive em `supabase/migrations/`. Para aplicar em
um novo projeto Supabase, use a [Supabase CLI](https://supabase.com/docs/guides/cli):

```sh
supabase link --project-ref <seu-project-ref>
supabase db push
```
