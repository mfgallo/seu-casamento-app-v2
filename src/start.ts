import { createStart, createCsrfMiddleware } from "@tanstack/react-start";

import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// Start instala isso automaticamente quando src/start.ts não existe; definir
// o arquivo desativa esse comportamento, então precisamos recriar a proteção
// explicitamente para manter as server functions protegidas contra CSRF.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  // Injeta o token de sessão do Supabase em toda chamada de server function.
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [csrfMiddleware],
}));
