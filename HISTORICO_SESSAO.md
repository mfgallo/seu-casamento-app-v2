# Histórico da sessão — Ateliê do Sim

Registro do que foi feito nesta sessão de desenvolvimento, para consulta futura.
Datas: 2026-08-05 e 2026-08-06.

## 1. Onde as coisas estão

| O quê | Onde |
| --- | --- |
| Repositório GitHub (real, conectado à Vercel) | https://github.com/mfgallo/seu-casamento-app-v2 |
| Deploy em produção | Vercel (redeploy automático a cada push na branch `main`) |
| Pasta local principal | `Projetos/meuamorzao/seu-casamento-app-v2` |
| Pasta local espelho/referência | `Projetos/meuamorzao/seu-casamento-frontend-novo` (mesmo código, mantida em sincronia manualmente a cada mudança) |
| Projeto original (Lovable, não tocado) | `Projetos/meuamorzao/seu-casamento-frontend` — pasta antiga, com histórico Git próprio, sincronizada com o editor Lovable |
| Repositório GitHub vazio/placeholder (não usar) | `mfgallo/seu-casamento-app` — criado por engano no meio do processo, sem uso real |
| Banco de dados | Supabase, projeto `hmghehvbtubecnihvmnl` (`https://hmghehvbtubecnihvmnl.supabase.co`) |

**Credenciais**: ficam no `.env` local (não versionado) e devem estar configuradas
em Vercel → Settings → Environment Variables. Ver `.env.example` para a lista
completa. A `SUPABASE_SERVICE_ROLE_KEY` é secreta — nunca deve ir para o
código-fonte nem para o navegador.

## 2. Migração do projeto para fora da Lovable

O projeto original foi criado e gerenciado pela plataforma Lovable. Foi feita
uma cópia limpa, removendo toda dependência da Lovable:

- Removidos: `@lovable.dev/cloud-auth-js`, `@lovable.dev/vite-tanstack-config`,
  pasta `.lovable/`, `AGENTS.md`, `bunfig.toml`, integração de SSO da Lovable,
  telemetria de erro do editor, entrypoint estilo Cloudflare Worker
  (`src/server.ts`, `error-capture.ts`, `error-page.ts`).
- `vite.config.ts` reescrito de forma explícita (TanStack Start + React +
  Tailwind + `vite-tsconfig-paths` + `nitro()`, sem preset fixo — o Nitro
  detecta sozinho o ambiente Vercel no build).
- Chat de IA ("Assistente Noiva"): trocado o gateway de IA da Lovable por
  **OpenAI direto** (`@ai-sdk/openai`, modelo `gpt-4o-mini`, variável
  `OPENAI_API_KEY`).
- Login com Google removido (dependia do SSO da Lovable); mantido login por
  email/senha via Supabase.
- `README.md` e `DOCUMENTATION.md` reescritos, sem menções à Lovable.
- Git novo, sem relação com o histórico do projeto Lovable original.

## 3. Deploy na Vercel — problemas resolvidos

- **"No entrypoint found"**: a Vercel não reconhecia o framework corretamente
  (configurações de build provavelmente presas de um código antigo que já
  existiu nesse mesmo repositório). Resolvido criando `vercel.json`:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": ".vercel/output",
    "framework": null
  }
  ```
  Isso faz a Vercel confiar direto no Build Output API v3 que o Nitro já gera,
  em vez de tentar detectar o framework sozinha.
- **Variáveis de ambiente do Supabase ausentes**: o projeto Supabase mudou
  durante o processo (de `tpdyxrulwkwiljhwforz` para `hmghehvbtubecnihvmnl`,
  um projeto novo). Foi necessário:
  1. Rodar o SQL de schema (tabelas `profiles`, `user_roles`, `categories`,
     `vendors`, `testimonials`, função `has_role`, triggers) no novo projeto.
  2. Configurar `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
     `SUPABASE_PROJECT_ID` (e as versões `VITE_*`) e
     `SUPABASE_SERVICE_ROLE_KEY` no `.env` local e na Vercel.

## 4. Cadastro — novos campos

O formulário de cadastro (`/auth` → aba "Cadastrar") passou a coletar também:

- **Telefone** (`phone`)
- **Data do casamento** (`wedding_date`)
- **Nome do(a) parceiro(a)** (`partner_name`)

Todos obrigatórios, salvos na tabela `profiles` junto com nome e papel do
usuário (`src/lib/auth.functions.ts`, `src/routes/auth.tsx`).

## 5. Sistema de conteúdo editável por admin

Foi criado um sistema para o admin editar textos e imagens do site
**direto pela página**, sem precisar mexer em código ou fazer novo deploy.

### Como funciona

- **Tabela `site_content`** (`key`, `type`: `text`|`image`, `value`,
  `updated_at`) — cada bloco de texto/imagem do site tem uma `key` única
  (ex: `"home.hero.title_line1"`, `"sobre.image"`).
- **RLS**: leitura pública para todos; escrita (INSERT/UPDATE/DELETE) só para
  quem tem a role `admin` (via função `has_role`, já existente no schema).
- **Bucket `site-content`** no Supabase Storage (público, escrita restrita a
  admin) — guarda os arquivos de imagem enviados pelo admin.
- **Componentes reutilizáveis**:
  - `EditableText` (`src/components/EditableText.tsx`) — mostra texto normal
    pra visitante; se logado como admin, aparece um ícone de lápis que abre
    edição inline (campo de texto ou textarea).
  - `EditableImage` (`src/components/EditableImage.tsx`) — mostra a imagem
    normal; admin vê um overlay "Trocar imagem" que sobe o arquivo pro
    Storage e atualiza o registro.
  - Hook `src/hooks/use-site-content.tsx` — leitura (`useSiteContent`) e
    mutações (`useUpdateSiteText`, `useUpdateSiteImage`), tudo client-side
    via `supabase-js` (a autorização é garantida pelas policies de RLS, não
    por checagem no código).

### Onde foi aplicado

| Página/componente | O que é editável |
| --- | --- |
| Header | Nome da marca ("Ateliê do Sim") |
| Footer | Nome da marca, texto de apresentação, email, telefone, endereço |
| Home (hero) | Título (2 linhas), subtítulo, imagem de fundo |
| Sobre | Título, 3 parágrafos, 3 estatísticas (número + legenda), imagem |
| Serviços | Título e descrição de cada um dos 8 cards (ícone continua fixo) |

## 6. Galeria dinâmica (fotos)

A galeria deixou de ter um número fixo de fotos (eram 4 "slots" fixos no
código). Agora é uma lista de verdade, gerenciável pelo admin:

- **Tabela `gallery_photos`** (`id`, `image_url`, `alt_text`,
  `display_order`) — RLS: leitura pública, escrita só admin.
- Reaproveita o bucket `site-content` (pasta `gallery/`).
- **Componente `EditableGallery`** (`src/components/EditableGallery.tsx` +
  hook `src/hooks/use-gallery.tsx`): grid uniforme que se ajusta a qualquer
  quantidade de fotos. Admin vê um botão "Adicionar foto" (upload) e, ao
  passar o mouse sobre cada foto, um ícone de lixeira pra remover.
- Usado tanto na página `/galeria` completa quanto na prévia de 3 fotos na
  Home (mesmas `keys`/registros — editar em um lugar reflete no outro).
- As 4 fotos que já existiam no site foram migradas pro Storage/tabela nova
  via um script pontual (não ficou no repositório).
- **Trade-off aceito**: perdeu o layout "bento" (uma foto grande + pequenas)
  em troca de um grid uniforme que funciona com qualquer quantidade de fotos.

## 7. Depoimentos

Antes existiam só 3 depoimentos fixos (seed inicial do banco), sem nenhuma
forma de gerenciar pela interface. Agora:

- **Qualquer usuário logado** (noivo, fornecedor ou admin) pode clicar em
  "Adicionar depoimento" e publicar um card na hora (nome, legenda opcional,
  texto do depoimento). Publicação é imediata, sem fila de aprovação.
- **Só admin** pode excluir um depoimento (ícone de lixeira).
- Reaproveita a tabela `testimonials` e as policies de admin que já existiam
  desde o schema original; foi adicionada uma nova policy de `INSERT` para
  `authenticated` (qualquer papel):
  ```sql
  CREATE POLICY "Authenticated users can add testimonials"
    ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
  ```
- Componente `EditableTestimonials.tsx` + hook `use-testimonials.tsx`.
- **Bug corrigido de quebra**: a página antiga lia campos que não existem na
  tabela (`testimonial.quote`, `testimonial.wedding_date`); os nomes certos
  são `content` e `author_title`. Por isso os depoimentos podiam aparecer sem
  o texto da citação antes dessa correção.

## 8. Segurança verificada

Ao longo da sessão, testei (com um usuário de teste real, criado e removido
na hora) que:

- Usuário anônimo/comum **não consegue** escrever em `site_content`,
  `gallery_photos` nem apagar/alterar `testimonials` — RLS bloqueia
  (`new row violates row-level security policy`).
- Usuário comum **consegue** inserir um depoimento (comportamento esperado,
  liberado de propósito), mas **não consegue** excluir nenhum.
- Usuário comum **não consegue** se autopromover a admin escrevendo direto em
  `user_roles` — não existe policy de escrita nessa tabela pra ninguém além
  do admin (via `service_role`, que nunca fica exposta ao navegador).

## 9. Quem é admin hoje

- `mauriciogallojr1993@gmail.com`
- `vanessa.sovsse@icloud.com`

Promover alguém a admin hoje exige rodar um script com a
`SUPABASE_SERVICE_ROLE_KEY` (inserir uma linha em `user_roles` com
`role = 'admin'`) — não existe uma tela no site pra isso ainda.

## 10. Pendências / possíveis próximos passos

- Não existe UI para promover/rebaixar admins pela própria interface do site
  (hoje é feito manualmente, por fora).
- Login social (Google) foi removido; para reativar, precisa configurar o
  provedor Google no painel do Supabase (Auth → Providers) e reescrever
  `handleGoogle` em `src/routes/auth.tsx` usando
  `supabase.auth.signInWithOAuth`.
- Páginas `/marketplace` e `/perfil` (área logada de fornecedores) não foram
  alteradas nesta sessão.
- O repositório `mfgallo/seu-casamento-app` (sem o `-v2`) ficou como
  placeholder vazio, criado por engano — pode ser apagado se não for usado.
- A pasta espelho `seu-casamento-frontend-novo` precisa continuar sendo
  sincronizada manualmente sempre que `seu-casamento-app-v2` mudar (ou
  vice-versa) — não há automação entre as duas.
