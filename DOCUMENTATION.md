# Ateliê do Sim — Documentação Técnica

Site institucional + área logada (marketplace de fornecedores) para uma assessoria
de casamentos. Todo o backend (auth, dados, arquivos) vive no serviço
[`whatsvg`](../whatsvg) — este app é puramente um cliente HTTP dessa API, sem
banco de dados nem SDK de auth próprios.

## Stack

| Camada                | Tecnologia                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| Framework              | [TanStack Start](https://tanstack.com/start) (React 19, SSR full-stack)       |
| Roteamento             | TanStack Router — **file-based routing** em `src/routes/`                     |
| Build/dev server       | Vite 8                                                                        |
| Server runtime         | Nitro, preset `aws-lambda` (empacota o servidor como função Lambda)          |
| Estilo                 | Tailwind CSS v4 + `tw-animate-css`                                            |
| UI Kit                 | shadcn/ui ("new-york") sobre Radix UI, em `src/components/ui/`               |
| Dados/estado servidor  | TanStack Query v5                                                             |
| Formulários            | react-hook-form + zod                                                        |
| Backend                | [`whatsvg`](../whatsvg) — FastAPI + DynamoDB + Cognito na AWS, chamado via `fetch` |
| IA / Chat              | Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`), modelo `gpt-4o-mini` |
| Package manager        | npm (`package-lock.json`)                                                    |
| Lint/format            | ESLint 9 (flat config) + Prettier                                            |
| Hospedagem             | AWS Lambda + API Gateway (HTTP API) + CloudFront (ver `infra/`)              |

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
│   ├── use-auth.tsx         # AuthContext: chama /auth/me na API, roles, isAdmin
│   ├── use-site-content.tsx # conteúdo editável (GET/PUT /site-content)
│   ├── use-gallery.tsx      # galeria de fotos (GET/POST/DELETE /gallery)
│   ├── use-testimonials.tsx # depoimentos (GET/POST/DELETE /testimonials)
│   └── use-mobile.tsx
├── lib/
│   ├── api-client.ts        # fetch wrapper: base URL, Bearer token, upload S3
│   ├── auth-api.ts          # signup/login/me contra /auth/*
│   ├── marketplace-api.ts   # categorias/vendors contra /categories, /vendors
│   ├── guests-api.ts        # convidados/RSVP contra /guests
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
│       ├── perfil.tsx         # dados do casal + cadastro de fornecedor
│       └── convidados.tsx     # admin-only: upload de convidados (CSV) + dashboard de RSVP
├── router.tsx                # createRouter + QueryClient
├── start.ts                  # createStart: middleware global (CSRF)
└── styles.css

infra/                       # Terraform: Lambda + API Gateway + CloudFront
└── scripts/build_lambda.{sh,ps1}  # empacota .output/{server,public} em build/lambda.zip
```

## Roteamento (TanStack Router)

Convenção file-based — ver `src/routes/README.md`:

| Rota           | Arquivo                                  | Acesso                                     |
| -------------- | ----------------------------------------- | ------------------------------------------- |
| `/`            | `routes/index.tsx`                        | público                                     |
| `/servicos`    | `routes/servicos.tsx`                     | público                                     |
| `/galeria`     | `routes/galeria.tsx`                      | público                                     |
| `/sobre`       | `routes/sobre.tsx`                        | público                                     |
| `/depoimentos` | `routes/depoimentos.tsx`                  | público                                     |
| `/auth`        | `routes/auth.tsx`                         | público (login/cadastro por email e senha) |
| `/api/chat`    | `routes/api/chat.ts`                      | público (POST, streaming)                  |
| `/marketplace` | `routes/_authenticated/marketplace.tsx`   | autenticado                                 |
| `/perfil`      | `routes/_authenticated/perfil.tsx`        | autenticado                                 |
| `/convidados`  | `routes/_authenticated/convidados.tsx`    | autenticado + admin (checado no componente) |

`routeTree.gen.ts` é gerado automaticamente pelo plugin do TanStack Router
durante `npm run dev`/`npm run build` — nunca editar manualmente.

O layout `_authenticated/route.tsx` roda `beforeLoad` client-side (`ssr: false`):
lê o token guardado em `localStorage` e chama `GET /auth/me` na API para
confirmar que ainda é válido, redirecionando para `/auth` se não houver
sessão.

## Autenticação & Autorização

- **Identidade**: AWS Cognito, gerenciado inteiramente pelo backend `whatsvg`
  — este app nunca fala com o Cognito diretamente, só com `/auth/signup`,
  `/auth/login`, `/auth/refresh` e `/auth/me` do `whatsvg`.
- **Sessão**: `access_token`/`id_token`/`refresh_token` retornados pelo login
  ficam em `localStorage` (`src/lib/api-client.ts`, chave
  `casamento_auth_tokens`). O `id_token` é enviado como `Authorization: Bearer`
  em toda chamada autenticada (`apiFetch`, `auth: true` por padrão) — carrega
  `sub`/`email`, diferente do `access_token` que só carrega escopos.
- **`AuthProvider`** (`src/hooks/use-auth.tsx`) chama `GET /auth/me` ao montar
  e expõe `user`, `roles`, `isAdmin` (`roles.includes("admin")`), `signOut`,
  `refresh` (chamado manualmente após login/cadastro, já que não existe mais
  um listener de auth state change como no Supabase).
- **Roles**: `noivo` | `fornecedor` | `admin`, guardadas na tabela
  `whatsvg-user-roles` do backend — a checagem de permissão real acontece
  **sempre no backend** (dependencies `require_role`/`require_admin` do
  FastAPI), nunca só no client. `isAdmin` aqui é só uma conveniência de UI
  (mostrar/esconder botões), igual já era com Supabase+RLS.
- **Cadastro**: `POST /auth/signup` cria o usuário no Cognito (já confirmado,
  sem fluxo de verificação de e-mail); como o cadastro coleta campos de
  perfil (telefone, data do casamento, nome do parceiro) que exigem estar
  logado para salvar, `apiSignupWithProfile` (`src/lib/auth-api.ts`) faz
  signup → login → `PUT /profiles/me` → logout, preservando o fluxo original
  de "cadastro realizado, agora faça login".
- **Promover a admin**: não existe UI para isso ainda (mesma limitação que já
  existia com Supabase) — ver `whatsvg/README.md` para o comando
  `aws dynamodb update-item` que seta a role.

## Dados (via API do `whatsvg`, sem banco próprio)

Todos os dados que antes viviam no Postgres/Supabase agora são endpoints REST
do `whatsvg` (DynamoDB por trás) — ver `whatsvg/app/routers/` para o
schema/regras completos de cada um:

- **`/profiles`** — dados do casal (nome, telefone, data do casamento,
  parceiro, orçamento, bio). Cada usuário só vê/edita o próprio.
- **`/categories`** — categorias de fornecedores, leitura pública, escrita
  admin.
- **`/vendors`** — cadastro de fornecedores; leitura pública só
  `status=approved`; dono gerencia o seu (`/vendors/mine`); admin gerencia
  todos (`/vendors/admin/*`).
- **`/testimonials`** — depoimentos; leitura pública só aprovados; qualquer
  autenticado publica (sem fila de moderação, igual antes); só admin apaga.
- **`/site-content`** — conteúdo editável (textos/imagens do header, footer,
  home, sobre, serviços); leitura pública, escrita admin.
- **`/gallery`** — fotos da galeria; leitura pública, escrita admin.
- **`/guests`** — convidados/RSVP (compartilhado com o fluxo de WhatsApp do
  `whatsvg`); usado pela tela `/convidados`.
- **`/uploads/presign`** — devolve uma URL pré-assinada do S3 para upload
  direto do browser (usado por `useUpdateSiteImage`/`useAddGalleryPhoto`).

## Chat de IA (Assistente Noiva)

- Widget flutuante `ChatWidget.tsx` usa `useChat` (`@ai-sdk/react`) com
  `DefaultChatTransport` apontando para `/api/chat`.
- `routes/api/chat.ts` (rota de servidor, roda na própria Lambda deste app)
  monta um `streamText` da Vercel AI SDK usando o provider oficial `openai`
  (`@ai-sdk/openai`), autenticado via `OPENAI_API_KEY` (lida automaticamente
  do ambiente pelo SDK — é a única variável de ambiente real que essa Lambda
  usa em runtime).
- Modelo: `gpt-4o-mini`. Prompt de sistema define persona ("Assistente
  Noiva") em PT-BR, orientada a coletar nome/e-mail/data/cidade para orçamento, sem
  informar valores.
- Não depende do backend `whatsvg` nem de nenhum dado — funciona isolado.

## Variáveis de ambiente (`.env`)

Ver [.env.example](./.env.example) para a lista completa e comentada. Resumo:

```
API_URL=
VITE_API_URL=
OPENAI_API_KEY=
```

`VITE_API_URL` é injetada no bundle do **client** pelo Vite, em **build-time**
— mudar o `.env` depois de já ter buildado não tem efeito, precisa buildar de
novo. `API_URL` (sem `VITE_`) existe só para uso eventual em código
server-only; hoje nada no app lê essa variante especificamente, mas fica
documentada por simetria com o padrão do `whatsvg`. `OPENAI_API_KEY` é lida em
runtime dentro da Lambda (variável de ambiente setada via
`infra/terraform.tfvars`).

## Scripts

```bash
npm run dev        # vite dev — servidor de desenvolvimento com SSR
npm run build       # vite build — build de produção (preset aws-lambda do Nitro)
npm run build:dev   # build em modo development
npm run preview     # preview do build
npm run lint         # eslint .
npm run format       # prettier --write .
```

## Deploy

Ver [README.md](./README.md#deploy-na-aws-com-terraform) para o passo a passo
completo (build da Lambda, `terraform apply`, variáveis, conexão com o
`whatsvg`).

## Convenções / notas do projeto

- `src/start.ts` define o middleware global: CSRF (`createCsrfMiddleware`)
  para as server functions. Não existe mais anexo de sessão (o token vai
  direto no header `Authorization` de cada chamada `apiFetch`, não via
  middleware de server function).
- `vite.config.ts` fixa o preset `aws-lambda` do Nitro (com `serveStatic:
  true`, já que esse preset não serve os assets estáticos por padrão) — ver
  `infra/lambda.tf` para como o zip resultante é empacotado e deployado.
- Alias de import: `@/*` → `src/*`.
