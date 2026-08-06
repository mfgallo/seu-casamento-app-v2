import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Testimonial = {
  id: string;
  author_name: string;
  author_title: string | null;
  content: string;
  display_order: number;
};

const QUERY_KEY = ["testimonials"];

export function useTestimonials() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, author_name, author_title, content, display_order")
        .eq("is_approved", true)
        .order("display_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useAddTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { authorName: string; authorTitle: string; content: string }) => {
      const current = queryClient.getQueryData<Testimonial[]>(QUERY_KEY) ?? [];
      const nextOrder = current.length ? Math.max(...current.map((t) => t.display_order)) + 1 : 0;

      // is_approved: true — publica na hora, sem fila de moderação. Qualquer
      // usuário autenticado pode inserir (RLS); só admin pode apagar depois.
      const { error } = await supabase.from("testimonials").insert({
        author_name: input.authorName,
        author_title: input.authorTitle || null,
        content: input.content,
        is_approved: true,
        display_order: nextOrder,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
