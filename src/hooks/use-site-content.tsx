import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteContentMap = Record<string, string>;

const QUERY_KEY = ["site-content"];

// Todo o conteúdo editável do site é lido de uma vez só (é uma tabela pequena)
// e fica em cache; cada EditableText/EditableImage só lê a própria "key" dele.
export function useSiteContent() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<SiteContentMap> => {
      const { data, error } = await supabase.from("site_content").select("key, value");
      if (error) throw new Error(error.message);
      return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
    },
    staleTime: 60_000,
  });
}

export function useUpdateSiteText() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // RLS em site_content garante que só admin consegue gravar aqui —
      // não precisa checar a role no client.
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, type: "text", value }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateSiteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, file }: { key: string; file: File }) => {
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `${key}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("site-content")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage.from("site-content").getPublicUrl(path);
      // Mesmo path de sempre para essa key, então adiciona um cache-buster
      // pra imagem nova aparecer na hora em vez de vir do cache do navegador/CDN.
      const value = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const { error } = await supabase
        .from("site_content")
        .upsert({ key, type: "image", value }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
