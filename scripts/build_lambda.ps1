# Builda o site (preset aws-lambda do Nitro, ver vite.config.ts) e empacota
# .output/{server,public} em build/lambda.zip, pronto para o Terraform
# (infra/lambda.tf) subir na Lambda.
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

npm run build

if (Test-Path build) { Remove-Item -Recurse -Force build }
New-Item -ItemType Directory -Force -Path build | Out-Null

Compress-Archive -Path .output/server, .output/public -DestinationPath build/lambda.zip -Force

Write-Host "Build OK: build/lambda.zip"
