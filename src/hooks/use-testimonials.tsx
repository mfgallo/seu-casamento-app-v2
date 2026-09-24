import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type Testimonial = {
  id: string;
  author_name: string;
  author_title: string | null;
  content: string;
  display_order: number;
};

type ApiTestimonial = {
  testimonial_id: string;
  author_name: string;
  author_title: string | null;
  content: string;
  display_order: number;
};

const QUERY_KEY = ["testimonials"];

function fromApi(item: ApiTestimonial): Testimonial {
  return {
    id: item.testimonial_id,
    author_name: item.author_name,
    author_title: item.author_title,
    content: item.content,
    display_order: item.display_order,
  };
}

export function useTestimonials() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Testimonial[]> => {
      const items = await apiFetch<ApiTestimonial[]>("/testimonials", { auth: false });
      return items.map(fromApi);
    },
    staleTime: 60_000,
  });
}

export function useAddTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { authorName: string; authorTitle: string; content: string }) => {
      // Qualquer usuário autenticado pode publicar (a rota exige login, mas
      // não role específica); só admin pode apagar depois.
      await apiFetch("/testimonials", {
        method: "POST",
        body: {
          author_name: input.authorName,
          author_title: input.authorTitle || null,
          content: input.content,
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/testimonials/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
