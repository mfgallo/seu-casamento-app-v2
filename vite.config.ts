import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// Preset "aws-lambda": empacota o servidor SSR como uma função Lambda (handler
// único em .output/server/index.mjs), consumida pelo Terraform em infra/
// (mesmo padrão de API Gateway HTTP API + Lambda do whatsvg/infra). serveStatic
// habilitado porque o preset não serve os assets estáticos por padrão - sem
// isso a Lambda responderia só as rotas SSR, não CSS/imagens/JS do build.
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    nitro({ preset: "aws-lambda", serveStatic: true }),
    viteReact(),
  ],
});
