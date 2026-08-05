import { useState, type ElementType } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSiteContent, useUpdateSiteText } from "@/hooks/use-site-content";
import { cn } from "@/lib/utils";

type EditableTextProps = {
  /** Chave única do bloco no site_content, ex: "home.hero.title_line1". */
  contentKey: string;
  /** Texto usado enquanto ninguém editou essa key ainda. */
  defaultValue: string;
  /** Elemento HTML a renderizar quando não está em edição (h1, p, span, ...). */
  as?: ElementType;
  className?: string;
  /** Usa um textarea (em vez de input de uma linha) ao editar. */
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

  const value = content?.[contentKey] ?? defaultValue;

  if (!isAdmin) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (editing) {
    return (
      <div className="relative rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background">
        {multiline ? (
          <textarea
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
      <Tag className={className}>{value}</Tag>
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
