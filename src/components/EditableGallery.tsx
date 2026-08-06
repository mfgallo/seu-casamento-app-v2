import { useRef, useState, type ChangeEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAddGalleryPhoto, useDeleteGalleryPhoto, useGalleryPhotos } from "@/hooks/use-gallery";
import { cn } from "@/lib/utils";

type EditableGalleryProps = {
  /** Mostra só as N primeiras fotos (ex: prévia na Home). Sem isso, mostra todas. */
  limit?: number;
  className?: string;
  /** Prévias (Home) usam readOnly: os controles de admin só aparecem na Galeria completa. */
  readOnly?: boolean;
};

export function EditableGallery({ limit, className, readOnly = false }: EditableGalleryProps) {
  const { isAdmin } = useAuth();
  const { data: photos, isLoading } = useGalleryPhotos();
  const addPhoto = useAddGalleryPhoto();
  const deletePhoto = useDeleteGalleryPhoto();
  const inputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canManage = isAdmin && !readOnly;
  const all = photos ?? [];
  const visible = limit ? all.slice(0, limit) : all;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) addPhoto.mutate({ file });
  };

  if (!isLoading && visible.length === 0 && !canManage) {
    return null;
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3", className)}>
      {visible.map((photo) => (
        <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-2xl">
          <img
            src={photo.image_url}
            alt={photo.alt_text || "Foto da galeria"}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {canManage && (
            <button
              type="button"
              disabled={deletePhoto.isPending}
              aria-label="Remover foto"
              onClick={() => {
                setDeletingId(photo.id);
                deletePhoto.mutate(photo.id, { onSettled: () => setDeletingId(null) });
              }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
            >
              {deletePhoto.isPending && deletingId === photo.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      ))}

      {canManage && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={addPhoto.isPending}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {addPhoto.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">Adicionar foto</span>
              </>
            )}
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
