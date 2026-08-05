import { createFileRoute } from "@tanstack/react-router";
import { EditableImage } from "@/components/EditableImage";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

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

const images = [
  {
    key: "galeria.foto_1",
    src: gallery1,
    alt: "Casal dançando na festa de casamento",
    span: "col-span-2 row-span-2",
  },
  {
    key: "galeria.foto_2",
    src: gallery2,
    alt: "Mesa de decoração de casamento",
    span: "col-span-1 row-span-1",
  },
  {
    key: "galeria.foto_3",
    src: gallery3,
    alt: "Buquê de noiva em tons suaves",
    span: "col-span-1 row-span-1",
  },
  {
    key: "galeria.foto_4",
    src: gallery4,
    alt: "Bolo de casamento elegante",
    span: "col-span-2 row-span-1",
  },
];

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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {images.map((image) => (
              <div key={image.key} className={`relative overflow-hidden rounded-2xl ${image.span}`}>
                <div className="aspect-square w-full md:aspect-auto md:h-full">
                  <EditableImage
                    contentKey={image.key}
                    defaultSrc={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
