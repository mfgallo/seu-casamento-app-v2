import { createStart, createCsrfMiddleware } from "@tanstack/react-start";

// Start instala isso automaticamente quando src/start.ts não existe; definir
// o arquivo desativa esse comportamento, então precisamos recriar a proteção
// explicitamente para manter as server functions protegidas contra CSRF.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
}));
