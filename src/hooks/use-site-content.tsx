import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, uploadFileToBucket } from "@/lib/api-client";

export type SiteContentMap = Record<string, string>;

const QUERY_KEY = ["site-content"];

// Todo o conteúdo editável do site é lido de uma vez só (é uma tabela pequena)
// e fica em cache; cada EditableText/EditableImage só lê a própria "key" dele.
export function useSiteContent() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<SiteContentMap>("/site-content", { auth: false }),
    staleTime: 60_000,
  });
}

export function useUpdateSiteText() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // A rota exige role admin (require_role) - sem checagem extra aqui,
      // igual antes quando a RLS do site_content cuidava disso.
      await apiFetch(`/site-content/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: { key, type: "text", value },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateSiteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, file }: { key: string; file: File }) => {
      const publicUrl = await uploadFileToBucket(file);
      // Cache-buster pra imagem nova aparecer na hora em vez de vir do cache
      // do navegador/CDN (mesmo path de sempre pra essa key nao existe mais
      // aqui - cada upload gera um object key novo no S3 - mas o querystring
      // continua garantindo que o <img src> mude).
      const value = `${publicUrl}?v=${Date.now()}`;
      await apiFetch(`/site-content/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: { key, type: "image", value },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
