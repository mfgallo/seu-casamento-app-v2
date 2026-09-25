import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DefaultChatTransport } from "ai";
import { EditableText } from "@/components/EditableText";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatTransport = new DefaultChatTransport({ api: "/api/chat" });
  const { messages, sendMessage, status, error } = useChat({
    id: "site-assistant",
    transport: chatTransport,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    void sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open && !minimized && (
        <div className="flex w-[90vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <MessageCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <EditableText
                  as="p"
                  contentKey="chat.title"
                  defaultValue="Assistente Noiva"
                  className="text-sm font-semibold text-primary-foreground"
                />
                <EditableText
                  as="p"
                  contentKey="chat.subtitle"
                  defaultValue="Tire suas dúvidas"
                  className="text-xs text-primary-foreground/80"
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(true)}
                className="rounded p-1 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10"
                aria-label="Minimizar"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="h-80 overflow-y-auto bg-secondary/30 px-4 py-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <EditableText
                  as="p"
                  contentKey="chat.greeting"
                  defaultValue="Olá! Sou a Assistente Noiva. Como posso ajudar no planejamento do seu casamento?"
                  className="text-sm text-muted-foreground"
                  multiline
                />
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "rounded-br-none bg-primary text-primary-foreground"
                      : "rounded-bl-none bg-card text-foreground shadow-sm"
                  }`}
                >
                  {message.parts.map((part, i) =>
                    part.type === "text" ? (
                      <span key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </span>
                    ) : null,
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-3 flex justify-start">
                <div className="rounded-2xl rounded-bl-none bg-card px-3 py-2 text-sm text-foreground shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:150ms]">.</span>
                    <span className="animate-bounce [animation-delay:300ms]">.</span>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Ocorreu um erro ao enviar a mensagem. Tente novamente.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-border bg-background p-3">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="min-h-[44px] resize-none rounded-xl border-border bg-secondary/50 py-2.5 pr-10 text-sm focus-visible:ring-primary"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 shrink-0 rounded-full bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {open && minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-4 w-4" />
          <EditableText contentKey="chat.title" defaultValue="Assistente Noiva" />
        </button>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          aria-label="Abrir chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
