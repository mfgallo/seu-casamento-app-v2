import { useRef, type ChangeEvent } from "react";
import { Loader2, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSiteContent, useUpdateSiteImage } from "@/hooks/use-site-content";

type EditableImageProps = {
  /** Chave única do bloco no site_content, ex: "galeria.foto_1". */
  contentKey: string;
  /** Imagem usada enquanto ninguém trocou essa key ainda (import estático). */
  defaultSrc: string;
  alt: string;
  /** Aplicada na <img> — mesma classe que você já usaria num <img> normal. */
  className?: string;
};

export function EditableImage({ contentKey, defaultSrc, alt, className }: EditableImageProps) {
  const { isAdmin } = useAuth();
  const { data: content } = useSiteContent();
  const updateImage = useUpdateSiteImage();
  const inputRef = useRef<HTMLInputElement>(null);

  const src = content?.[contentKey] ?? defaultSrc;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) updateImage.mutate({ key: contentKey, file });
  };

  return (
    <div className="group relative h-full w-full">
      <img src={src} alt={alt} className={className} />
      {isAdmin && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={updateImage.isPending}
            aria-label="Trocar imagem"
            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-sm font-medium text-white">
              {updateImage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
              Trocar imagem
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}
