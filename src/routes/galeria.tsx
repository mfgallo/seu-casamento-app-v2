import { createFileRoute } from "@tanstack/react-router";
import { EditableGallery } from "@/components/EditableGallery";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galeria — Ateliê do Sim" },
      {
        name: "description",
        content: "Inspire-se com momentos reais de casamentos assessorados pela Ateliê do Sim.",
      },
      { property: "og:title", content: "Galeria — Ateliê do Sim" },
      {
        property: "og:description",
        content: "Inspire-se com momentos reais de casamentos assessorados pela Ateliê do Sim.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GaleriaPage,
});

function GaleriaPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/30 py-16 sm:py-24">
        <div className="container-tight text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-olive-muted">
            Inspiração
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">
            Galeria
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Momentos reais de casamentos que tiveram a assessoria da Ateliê do Sim. Cada imagem
            conta uma história de amor.
          </p>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-24">
        <div className="container-tight">
          <EditableGallery className="md:grid-cols-4" />
        </div>
      </section>
    </div>
  );
}
