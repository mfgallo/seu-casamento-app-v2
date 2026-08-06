import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GalleryPhoto = {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
};

const QUERY_KEY = ["gallery-photos"];

export function useGalleryPhotos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<GalleryPhoto[]> => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("id, image_url, alt_text, display_order")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useAddGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, altText }: { file: File; altText?: string }) => {
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `gallery/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("site-content")
        .upload(path, file, { cacheControl: "3600" });
      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage.from("site-content").getPublicUrl(path);

      // Novas fotos entram no fim da lista.
      const current = queryClient.getQueryData<GalleryPhoto[]>(QUERY_KEY) ?? [];
      const nextOrder = current.length ? Math.max(...current.map((p) => p.display_order)) + 1 : 0;

      const { error } = await supabase.from("gallery_photos").insert({
        image_url: publicUrlData.publicUrl,
        alt_text: altText ?? "",
        display_order: nextOrder,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
