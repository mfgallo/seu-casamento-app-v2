import { createFileRoute } from "@tanstack/react-router";
import { EditableTestimonials } from "@/components/EditableTestimonials";
import { EditableText } from "@/components/EditableText";

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
  component: DepoimentosPage,
});

function DepoimentosPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/30 py-16 sm:py-24">
        <div className="container-tight text-center">
          <EditableText
            as="p"
            contentKey="depoimentos.eyebrow"
            defaultValue="Noivos felizes"
            className="text-sm font-medium uppercase tracking-[0.2em] text-olive-muted"
          />
          <EditableText
            as="h1"
            contentKey="depoimentos.title"
            defaultValue="Depoimentos"
            className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl"
          />
          <EditableText
            as="p"
            contentKey="depoimentos.subtitle"
            defaultValue="Histórias reais de casais que confiaram em nós para tornar o grande dia ainda mais especial."
            className="mx-auto mt-5 max-w-2xl text-muted-foreground"
            multiline
          />
        </div>
      </section>

      <section className="bg-background py-16 sm:py-24">
        <div className="container-tight">
          <EditableTestimonials />
        </div>
      </section>
    </div>
  );
}
