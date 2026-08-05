import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listPublicTestimonials } from "@/lib/marketplace.functions";
import { Quote } from "lucide-react";

export const Route = createFileRoute("/depoimentos")({
  head: () => ({
    meta: [
      { title: "Depoimentos — Ateliê do Sim" },
      {
        name: "description",
        content:
          "Leia depoimentos de noivos que realizaram o casamento dos sonhos com a Ateliê do Sim.",
      },
      { property: "og:title", content: "Depoimentos — Ateliê do Sim" },
      {
        property: "og:description",
        content:
          "Leia depoimentos de noivos que realizaram o casamento dos sonhos com a Ateliê do Sim.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["testimonials"],
      queryFn: () => listPublicTestimonials(),
    });
  },
  component: DepoimentosPage,
});

function DepoimentosPage() {
  const { data: testimonials } = useSuspenseQuery({
    queryKey: ["testimonials"],
    queryFn: () => listPublicTestimonials(),
  });

  return (
    <div className="flex flex-col">
      <section className="bg-secondary/30 py-16 sm:py-24">
        <div className="container-tight text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-olive-muted">
            Noivos felizes
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">
            Depoimentos
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Histórias reais de casais que confiaram em nós para tornar o grande dia ainda mais
            especial.
          </p>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-24">
        <div className="container-tight">
          {testimonials && testimonials.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="relative rounded-2xl border border-border bg-card p-8"
                >
                  <Quote className="absolute right-6 top-6 h-8 w-8 text-olive/20" />
                  <p className="relative z-10 text-lg leading-relaxed text-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-border pt-6">
                    <p className="font-display font-medium text-foreground">
                      {testimonial.author_name}
                    </p>
                    {testimonial.wedding_date && (
                      <p className="text-sm text-muted-foreground">
                        Casamento em {testimonial.wedding_date}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">Nenhum depoimento publicado ainda.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
