import { useState } from "react";
import { Loader2, Plus, Quote, Trash2, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAddTestimonial, useDeleteTestimonial, useTestimonials } from "@/hooks/use-testimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EditableTestimonials() {
  const { isAdmin, isAuthenticated } = useAuth();
  const { data: testimonials, isLoading } = useTestimonials();
  const deleteTestimonial = useDeleteTestimonial();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const list = testimonials ?? [];

  if (!isLoading && list.length === 0 && !isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Nenhum depoimento publicado ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {list.map((testimonial) => (
        <div
          key={testimonial.id}
          className="group relative rounded-2xl border border-border bg-card p-8"
        >
          <Quote className="absolute right-6 top-6 h-8 w-8 text-olive/20" />
          {isAdmin && (
            <button
              type="button"
              disabled={deleteTestimonial.isPending}
              aria-label="Remover depoimento"
              onClick={() => {
                setDeletingId(testimonial.id);
                deleteTestimonial.mutate(testimonial.id, { onSettled: () => setDeletingId(null) });
              }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            >
              {deleteTestimonial.isPending && deletingId === testimonial.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          )}
          <p className="relative z-10 text-lg leading-relaxed text-foreground">
            &ldquo;{testimonial.content}&rdquo;
          </p>
          <div className="mt-6 border-t border-border pt-6">
            <p className="font-display font-medium text-foreground">{testimonial.author_name}</p>
            {testimonial.author_title && (
              <p className="text-sm text-muted-foreground">{testimonial.author_title}</p>
            )}
          </div>
        </div>
      ))}

      {isAuthenticated && (
        <AddTestimonialCard
          adding={adding}
          onOpen={() => setAdding(true)}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}

function AddTestimonialCard({
  adding,
  onOpen,
  onClose,
}: {
  adding: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const addTestimonial = useAddTestimonial();
  const [authorName, setAuthorName] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [content, setContent] = useState("");

  if (!adding) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="h-6 w-6" />
        <span className="text-sm font-medium">Adicionar depoimento</span>
      </button>
    );
  }

  const reset = () => {
    setAuthorName("");
    setAuthorTitle("");
    setContent("");
    onClose();
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await addTestimonial.mutateAsync({ authorName, authorTitle, content });
        reset();
      }}
      className="relative rounded-2xl border border-primary bg-card p-6"
    >
      <button
        type="button"
        onClick={reset}
        aria-label="Cancelar"
        className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="testimonial-content">Depoimento</Label>
          <Textarea
            id="testimonial-content"
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que o casal disse sobre a experiência"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="testimonial-author">Nome do casal</Label>
          <Input
            id="testimonial-author"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Mariana e Pedro"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="testimonial-title">Legenda (opcional)</Label>
          <Input
            id="testimonial-title"
            value={authorTitle}
            onChange={(e) => setAuthorTitle(e.target.value)}
            placeholder="Casamento em São Paulo"
          />
        </div>
        <Button type="submit" className="w-full" disabled={addTestimonial.isPending}>
          {addTestimonial.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
