import { useRef, useState, type ElementType } from "react";
import { Bold, Check, Italic, Loader2, Pencil, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSiteContent, useUpdateSiteText } from "@/hooks/use-site-content";
import { renderRichText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type EditableTextProps = {
  /** Chave única do bloco no site_content, ex: "home.hero.title_line1". */
  contentKey: string;
  /** Texto usado enquanto ninguém editou essa key ainda. */
  defaultValue: string;
  /** Elemento HTML a renderizar quando não está em edição (h1, p, span, ...). */
  as?: ElementType;
  className?: string;
  /** Usa um textarea (em vez de input de uma linha) ao editar, e habilita
   * negrito/itálico/quebra de linha (campos de parágrafo, não títulos/botões
   * curtos). */
  multiline?: boolean;
};

export function EditableText({
  contentKey,
  defaultValue,
  as: Tag = "span",
  className,
  multiline = false,
}: EditableTextProps) {
  const { isAdmin } = useAuth();
  const { data: content } = useSiteContent();
  const updateText = useUpdateSiteText();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = content?.[contentKey] ?? defaultValue;
  const rendered = multiline ? renderRichText(value) : value;

  const applyFormatting = (marker: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = draft.slice(start, end) || "texto";
    const next = draft.slice(0, start) + marker + selected + marker + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + marker.length, start + marker.length + selected.length);
    });
  };

  if (!isAdmin) {
    return <Tag className={className}>{rendered}</Tag>;
  }

  if (editing) {
    return (
      <div className="relative rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background">
        {multiline && (
          <div className="mb-1 flex gap-1">
            <button
              type="button"
              onClick={() => applyFormatting("**")}
              aria-label="Negrito"
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:text-foreground"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting("*")}
              aria-label="Itálico"
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:text-foreground"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {multiline ? (
          <textarea
            ref={textareaRef}
            autoFocus
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={cn(
              "w-full resize-y rounded-md border border-input bg-background p-2 text-foreground",
              className,
            )}
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={cn(
              "w-full rounded-md border border-input bg-background p-2 text-foreground",
              className,
            )}
          />
        )}
        <div className="mt-1 flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            <X className="h-3 w-3" />
            Cancelar
          </button>
          <button
            type="button"
            disabled={updateText.isPending}
            onClick={async () => {
              await updateText.mutateAsync({ key: contentKey, value: draft });
              setEditing(false);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
          >
            {updateText.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            Salvar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group/editable relative inline-block w-full">
      <Tag className={className}>{rendered}</Tag>
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        aria-label="Editar texto"
        className="absolute -right-2 -top-2 hidden h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-primary group-hover/editable:flex group-hover/editable:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
