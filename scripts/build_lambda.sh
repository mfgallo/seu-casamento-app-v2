#!/usr/bin/env bash
# Builda o site (preset aws-lambda do Nitro, ver vite.config.ts) e empacota
# .output/{server,public} em build/lambda.zip, pronto para o Terraform
# (infra/lambda.tf) subir na Lambda.
#
# O Nitro já bundla todas as dependências dentro de .output/server (sem
# node_modules separado) - diferente do whatsvg, aqui não tem passo de "pip
# install"/"npm install --production" equivalente antes de zipar.
set -euo pipefail

cd "$(dirname "$0")/.."

npm run build

rm -rf build
mkdir -p build

cd .output
zip -r -q ../build/lambda.zip server public
cd ..

echo "Build OK: build/lambda.zip"
