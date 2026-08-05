# Ateliê do Sim — Documentação Técnica

Site institucional + área logada (marketplace de fornecedores) para uma assessoria
de casamentos.

## Stack

| Camada                | Tecnologia                                                                      |
| --------------------- | ------------------------------------------------------------------------------- |
| Framework             | [TanStack Start](https://tanstack.com/start) (React 19, SSR full-stack)         |
| Roteamento            | TanStack Router — **file-based routing** em `src/routes/`                       |
| Build/dev server      | Vite 8                                                                          |
| Server runtime        | Nitro (auto-detecta o provedor de deploy no build — Vercel Functions na Vercel) |
| Estilo                | Tailwind CSS v4 + `tw-animate-css`                                              |
| UI Kit                | shadcn/ui ("new-york") sobre Radix UI, em `src/components/ui/`                  |
| Dados/estado servidor | TanStack Query v5                                                               |
| Formulários           | react-hook-form + zod                                                           |
| Backend as a Service  | Supabase (Postgres + Auth + RLS)                                                |
| IA / Chat             | Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`), modelo `gpt-4o-mini`   |
| Package manager       | npm (`package-lock.json`)                                                       |
| Lint/format           | ESLint 9 (flat config) + Prettier                                               |

## Estrutura de pastas

```
src/
├── assets/                 # imagens estáticas (hero, galeria, sobre)
├── components/
│   ├── ui/                 # componentes shadcn/ui (Radix + Tailwind)
│   ├── ChatWidget.tsx       # widget de chat flutuante (IA)
│   ├── Header.tsx           # navbar + menu mobile + estado de auth
│   └── Footer.tsx
├── hooks/
│   ├── use-auth.tsx         # AuthContext: sessão Supabase, roles, isAdmin
│   └── use-mobile.tsx
├── integrations/
│   └── supabase/
│       ├── client.ts          # client Supabase (browser)
│       ├── client.server.ts   # client Supabase (server, service role)
│       ├── auth-attacher.ts   # middleware que injeta sessão nas server fns
│       ├── auth-middleware.ts # requireSupabaseAuth (protege server fns)
│       └── types.ts           # tipos gerados do schema Supabase
├── lib/
│   ├── auth.functions.ts      # server functions signUp/signIn (usa service role)
│   ├── marketplace.functions.ts # server functions: categorias, vendors, testimonials
│   └── utils.ts
├── routes/                  # rotas file-based (ver tabela abaixo)
│   ├── __root.tsx            # shell: <html>, Header, Outlet, Footer, ChatWidget
│   ├── index.tsx             # Home
│   ├── servicos.tsx, sobre.tsx, galeria.tsx, depoimentos.tsx
│   ├── auth.tsx               # login/cadastro
│   ├── api/chat.ts            # endpoint POST — streaming do chat de IA
│   └── _authenticated/        # layout protegido (redireciona p/ /auth se deslogado)
│       ├── route.tsx
│       ├── marketplace.tsx    # listagem de fornecedores aprovados
│       └── perfil.tsx         # dados do casal + cadastro de fornecedor
├── router.tsx                # createRouter + QueryClient
├── start.ts                  # createStart: middlewares globais (CSRF, auth attacher)
└── styles.css

supabase/
├── config.toml
└── migrations/               # schema SQL (profiles, user_roles, categories, vendors, testimonials)
```

## Roteamento (TanStack Router)

Convenção file-based — ver `src/routes/README.md`:

| Rota           | Arquivo                                 | Acesso                                     |
| -------------- | --------------------------------------- | ------------------------------------------ |
| `/`            | `routes/index.tsx`                      | público                                    |
| `/servicos`    | `routes/servicos.tsx`                   | público                                    |
| `/galeria`     | `routes/galeria.tsx`                    | público                                    |
| `/sobre`       | `routes/sobre.tsx`                      | público                                    |
| `/depoimentos` | `routes/depoimentos.tsx`                | público                                    |
| `/auth`        | `routes/auth.tsx`                       | público (login/cadastro por email e senha) |
| `/api/chat`    | `routes/api/chat.ts`                    | público (POST, streaming)                  |
| `/marketplace` | `routes/_authenticated/marketplace.tsx` | autenticado                                |
| `/perfil`      | `routes/_authenticated/perfil.tsx`      | autenticado                                |

`routeTree.gen.ts` é gerado automaticamente — nunca editar manualmente.

O layout `_authenticated/route.tsx` roda `beforeLoad` client-side (`ssr: false`),
checa `supabase.auth.getUser()` e redireciona para `/auth` se não houver sessão.

## Autenticação & Autorização

- **Sessão**: gerenciada no client via `@supabase/supabase-js`, exposta pelo
  `AuthProvider` (`src/hooks/use-auth.tsx`) com `user`, `roles`, `isAdmin`, `signOut`.
- **Roles**: enum `app_role` (`noivo`, `fornecedor`, `admin`) na tabela `user_roles`,
  separada de `profiles` por segurança (evita escalonamento de privilégio via update
  direto do perfil).
- **Server functions protegidas**: `requireSupabaseAuth` middleware
  (`src/integrations/supabase/auth-middleware.ts`) injeta `context.supabase` e
  `context.userId` autenticado nas server functions (ex.: `marketplace.functions.ts`).
- **Sign up/in**: `src/lib/auth.functions.ts` usa a **service role key** no servidor
  para criar usuário + perfil + role atomicamente (bypassa RLS). Login social
  (Google etc.) não está habilitado — foi removido nesta versão; para reativar,
  use `supabase.auth.signInWithOAuth({ provider: "google", ... })` do lado do
  client depois de configurar o provedor Google em Auth → Providers no painel
  do Supabase.
- **RLS (Postgres)**: cada tabela tem policies próprias — perfis só editáveis pelo
  dono; vendors visíveis publicamente apenas se `status = 'approved'`; dono pode
  gerenciar seu próprio vendor; admin (`has_role`) pode gerenciar tudo.

## Banco de dados (Supabase / Postgres)

Migrações em `supabase/migrations/`:

- **`profiles`** — dados do casal (nome, telefone, data do casamento, parceiro, orçamento, bio).
- **`user_roles`** — papel do usuário (`noivo` | `fornecedor` | `admin`).
- **`categories`** — categorias de fornecedores (fotografia, decoração, buffet, etc.), leitura pública.
- **`vendors`** — cadastro de fornecedores (nome, descrição, contato, preços, status de aprovação, destaque).
- **`testimonials`** — depoimentos de clientes, com aprovação manual (`is_approved`).
- Função `has_role(user_id, role)` (`SECURITY DEFINER`) evita recursão de RLS ao checar admin.
- Triggers `update_updated_at_column` em todas as tabelas.
- Seed inicial de 6 categorias e 3 depoimentos de exemplo.

## Chat de IA (Assistente Noiva)

- Widget flutuante `ChatWidget.tsx` usa `useChat` (`@ai-sdk/react`) com
  `DefaultChatTransport` apontando para `/api/chat`.
- `routes/api/chat.ts` (server function POST) monta um `streamText` da Vercel AI SDK
  usando o provider oficial `openai` (`@ai-sdk/openai`), autenticado via
  `OPENAI_API_KEY` (lida automaticamente do ambiente pelo SDK).
- Modelo: `gpt-4o-mini`. Prompt de sistema define persona ("Assistente
  Noiva") em PT-BR, orientada a coletar nome/e-mail/data/cidade para orçamento, sem
  informar valores.

## Variáveis de ambiente (`.env`)

Ver [.env.example](./.env.example) para a lista completa e comentada. Resumo:

```
SUPABASE_PROJECT_ID=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

As variáveis com prefixo `VITE_` são injetadas no bundle do client pelo Vite;
as demais só existem no servidor. `SUPABASE_SERVICE_ROLE_KEY` e
`OPENAI_API_KEY` precisam ser configuradas também no painel da Vercel
(Settings → Environment Variables) para produção.

## Scripts

```bash
npm run dev        # vite dev — servidor de desenvolvimento com SSR
npm run build       # vite build — build de produção
npm run build:dev   # build em modo development
npm run preview     # preview do build
npm run lint         # eslint .
npm run format       # prettier --write .
```

## Convenções / notas do projeto

- `src/start.ts` define os middlewares globais: CSRF (`createCsrfMiddleware`)
  para as server functions e anexo de sessão do Supabase
  (`attachSupabaseAuth`).
- `vite.config.ts` monta explicitamente os plugins necessários (TanStack
  Start, React, Tailwind, `vite-tsconfig-paths` para o alias `@`, e `nitro()`
  para empacotar o servidor). O `nitro()` não fixa um preset — ele detecta
  sozinho quando está rodando no ambiente de build da Vercel.
- Alias de import: `@/*` → `src/*`.
