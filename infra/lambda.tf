# O Nitro (preset "aws-lambda", ver ../vite.config.ts) ja bundla todas as
# dependencias dentro de .output/server - nao ha node_modules separado pra
# instalar, diferente do Lambda Python do whatsvg. scripts/build_lambda.sh
# zipa .output/{server,public} preservando essa estrutura de pastas (o
# index.mjs referencia os assets estaticos via "../public/...").

data "archive_file" "lambda_zip" {
  count = fileexists(var.lambda_zip_path) ? 0 : 1

  type        = "zip"
  source_dir  = "${path.module}/../.output"
  output_path = "${path.module}/../build/lambda-output-only.zip"
}

locals {
  lambda_package_path = fileexists(var.lambda_zip_path) ? var.lambda_zip_path : data.archive_file.lambda_zip[0].output_path
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.project_name}-web"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "web" {
  function_name = "${var.project_name}-web"
  role          = aws_iam_role.lambda_exec.arn

  filename         = local.lambda_package_path
  source_code_hash = filebase64sha256(local.lambda_package_path)

  # server/index.mjs (dentro do zip) exporta `handler`, resolvendo os assets
  # estaticos em ../public relativo a esse arquivo - por isso o zip precisa
  # ter server/ e public/ como pastas irmãs na raiz.
  handler = "server/index.handler"
  runtime = "nodejs22.x"

  memory_size = var.lambda_memory_size
  timeout     = var.lambda_timeout

  environment {
    variables = {
      OPENAI_API_KEY = var.openai_api_key
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}
