import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, uploadFileToBucket } from "@/lib/api-client";

export type GalleryPhoto = {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
};

type ApiGalleryPhoto = {
  photo_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
};

const QUERY_KEY = ["gallery-photos"];

function fromApi(item: ApiGalleryPhoto): GalleryPhoto {
  return {
    id: item.photo_id,
    image_url: item.image_url,
    alt_text: item.alt_text ?? "",
    display_order: item.display_order,
  };
}

export function useGalleryPhotos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<GalleryPhoto[]> => {
      const items = await apiFetch<ApiGalleryPhoto[]>("/gallery", { auth: false });
      return items.map(fromApi);
    },
    staleTime: 60_000,
  });
}

export function useAddGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, altText }: { file: File; altText?: string }) => {
      const imageUrl = await uploadFileToBucket(file);

      // Novas fotos entram no fim da lista.
      const current = queryClient.getQueryData<GalleryPhoto[]>(QUERY_KEY) ?? [];
      const nextOrder = current.length ? Math.max(...current.map((p) => p.display_order)) + 1 : 0;

      await apiFetch("/gallery", {
        method: "POST",
        body: { image_url: imageUrl, alt_text: altText ?? "", display_order: nextOrder },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/gallery/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
