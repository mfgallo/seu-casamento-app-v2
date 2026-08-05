import { createFileRoute } from "@tanstack/react-router";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        // @ai-sdk/openai lê a chave sozinho a partir de process.env.OPENAI_API_KEY;
        // validamos aqui só para devolver um erro claro em vez de uma falha
        // genérica lá dentro do SDK quando a variável não estiver configurada.
        if (!process.env["OPENAI_API_KEY"]) {
          return new Response("Missing OPENAI_API_KEY", { status: 500 });
        }

        const systemPrompt = `Você é a assistente virtual de uma assessoria de casamentos de luxo. Seu nome é "Assistente Noiva". Você ajuda noivos a entenderem os serviços da empresa, a solicitar orçamentos e a tirar dúvidas sobre planejamento de casamento. Seja elegante, calorosa, objetiva e sempre em português do Brasil. Quando o usuário demonstrar interesse em orçamento, peça nome, email, data prevista do casamento e cidade. Não forneça valores específicos; ofereça agendar uma conversa com a assessora.`;

        const result = streamText({
          model: openai("gpt-4o-mini"),
          system: systemPrompt,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
