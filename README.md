# Ateliê do Sim — Frontend

Site institucional + área logada (marketplace de fornecedores) para uma
assessoria de casamentos. Full-stack em React com SSR via TanStack Start.
Dados, autenticação (AWS Cognito) e armazenamento (DynamoDB + S3) vivem no
backend [`whatsvg`](../whatsvg) — este app é um cliente HTTP dessa API, sem
banco de dados próprio. Tem também um assistente de chat com IA (OpenAI).

Veja [DOCUMENTATION.md](./DOCUMENTATION.md) para detalhes técnicos completos
(arquitetura, rotas, autenticação, banco de dados).

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19, SSR) + [TanStack Router](https://tanstack.com/router) (file-based routing)
- Vite 8 + [Nitro](https://v3.nitro.build/) (empacota o servidor para o provedor de deploy)
- Tailwind CSS v4 + shadcn/ui (Radix UI)
- Backend próprio ([`whatsvg`](../whatsvg), FastAPI + DynamoDB + Cognito na AWS) — chamado via `fetch` (`src/lib/api-client.ts`), sem SDK de banco no frontend
- [Vercel AI SDK](https://ai-sdk.dev/) com OpenAI para o chat "Assistente Noiva"

## Rodando localmente

Requer Node.js 20+ e o backend [`whatsvg`](../whatsvg) rodando (localmente via
`uvicorn` + DynamoDB Local, ou apontando para uma API já publicada na AWS).

```sh
npm install
cp .env.example .env   # depois preencha VITE_API_URL com a URL do backend
npm run dev
```

O site sobe em `http://localhost:3000` (ou porta similar, o Vite avisa no
terminal).

### Variáveis de ambiente

Veja [.env.example](./.env.example) para a lista completa com explicação de
cada uma. Resumo:

| Variável                   | Necessária para                                | Onde configurar                                                                       |
| -------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| `API_URL` / `VITE_API_URL` | Site inteiro (dados, auth, tudo via `whatsvg`) | `.env` local e no provedor de deploy                                                    |
| `OPENAI_API_KEY`           | Chat "Assistente Noiva"                        | `.env` local e no provedor de deploy (opcional — sem ela só o chat fica indisponível) |

Não há mais chave secreta de banco neste app: autenticação e permissões são
validadas inteiramente no backend `whatsvg` (Cognito + checagem de role nas
rotas), nunca no client.

## Scripts

```sh
npm run dev        # servidor de desenvolvimento com SSR
npm run build       # build de produção
npm run preview     # preview do build de produção
npm run lint         # eslint
npm run format       # prettier --write
```

## Deploy na AWS com Terraform

Hospedado como Lambda + API Gateway + CloudFront, mesmo padrão de custo
mínimo do `whatsvg/infra/` (HTTP API em vez de REST API, CloudFront
`PriceClass_100`, sem domínio próprio por enquanto). Diferença importante: o
`VITE_API_URL`/`API_URL` é injetado no bundle do client **em build-time** pelo
Vite — precisa estar certo no `.env` **antes** de rodar o build, mudar depois
não adianta (precisa buildar e subir de novo).

```bash
cp .env.example .env
# preencha API_URL/VITE_API_URL com a `api_base_url` do `terraform output`
# do whatsvg (ver whatsvg/README.md), e OPENAI_API_KEY se quiser o chat.

cd infra
terraform init
terraform plan
terraform apply
```

O `scripts/build_lambda.sh` (ou `build_lambda.ps1` no Windows) roda o
`npm run build` e empacota `.output/{server,public}` em `build/lambda.zip` —
o `infra/lambda.tf` cai automaticamente nesse fallback (zipando `.output/`
direto via Terraform) se o zip não existir, então rodar só `terraform apply`
sem buildar antes também funciona, mas sempre rode o build de novo depois de
qualquer mudança de código ou do `.env` (o zip não se atualiza sozinho).

Segredos (`OPENAI_API_KEY`) vão como variável da própria Lambda, via
`infra/terraform.tfvars` (nunca commitado):

```hcl
aws_region     = "sa-east-1"   # mesma regiao do whatsvg, por conveniencia
openai_api_key = "sk-..."
```

Depois do primeiro `apply`, pegue a URL pública com `terraform output
site_url` e volte no `whatsvg/infra` para restringir o CORS a esse domínio
(`frontend_allowed_origins`, ver `whatsvg/README.md`).
