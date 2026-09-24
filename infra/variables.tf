variable "aws_region" {
  description = "Regiao AWS onde os recursos serao criados."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefixo usado no nome dos recursos."
  type        = string
  default     = "ateliedosim-frontend"
}

variable "lambda_zip_path" {
  description = "Caminho para o zip gerado por scripts/build_lambda.sh."
  type        = string
  default     = "../build/lambda.zip"
}

variable "lambda_memory_size" {
  description = "Memoria (MB) da Lambda. SSR com React/TanStack pede um pouco mais que o backend do whatsvg."
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Timeout (s) da Lambda."
  type        = number
  default     = 10
}

variable "log_retention_days" {
  description = "Retencao dos logs no CloudWatch, para nao acumular custo indefinidamente."
  type        = number
  default     = 14
}

variable "cloudfront_price_class" {
  description = "Classe de preco do CloudFront. PriceClass_100 (America do Norte + Europa) e a mais barata."
  type        = string
  default     = "PriceClass_100"
}

# OPENAI_API_KEY e o unico segredo real desta Lambda (usado em /api/chat) - vai
# direto como env var da Lambda (criptografada em repouso pelo KMS por padrao),
# sem o esquema de SSM do whatsvg, que existe la por ter varios segredos.
# Passe via `TF_VAR_openai_api_key` ou terraform.tfvars (nunca commitado).
variable "openai_api_key" {
  description = "Chave da OpenAI para o chat 'Assistente Noiva'. Deixe em branco para desabilitar o chat."
  type        = string
  default     = ""
  sensitive   = true
}
