import { createFileRoute } from "@tanstack/react-router";
import { EditableText } from "@/components/EditableText";
import { EditableImage } from "@/components/EditableImage";
import aboutImage from "@/assets/about.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Ateliê do Sim" },
      {
        name: "description",
        content:
          "Conheça a Ateliê do Sim, assessoria de casamentos que transforma sonhos em experiências inesquecíveis.",
      },
      { property: "og:title", content: "Sobre — Ateliê do Sim" },
      {
        property: "og:description",
        content:
          "Conheça a Ateliê do Sim, assessoria de casamentos que transforma sonhos em experiências inesquecíveis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SobrePage,
});

const stats = [
  { key: "sobre.stat_1", value: "10+", label: "Anos de experiência" },
  { key: "sobre.stat_2", value: "200+", label: "Casamentos realizados" },
  { key: "sobre.stat_3", value: "50+", label: "Fornecedores parceiros" },
];

function SobrePage() {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/30 py-16 sm:py-24">
        <div className="container-tight text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-olive-muted">
            Quem somos
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">
            Sobre nós
          </h1>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-24">
        <div className="container-tight">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <EditableImage
                contentKey="sobre.image"
                defaultSrc={aboutImage}
                alt="Assessora de casamentos trabalhando em ambiente moderno"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <EditableText
                as="h2"
                contentKey="sobre.title"
                defaultValue="Transformamos sonhos em experiências"
                className="font-display text-3xl font-medium text-foreground sm:text-4xl"
              />
              <EditableText
                as="p"
                contentKey="sobre.paragraph_1"
                defaultValue="A Ateliê do Sim nasceu da paixão por criar momentos únicos. Somos uma assessoria de casamentos completa, dedicada a transformar o planejamento do seu grande dia em uma jornada leve, elegante e inesquecível."
                className="mt-6 leading-relaxed text-muted-foreground"
                multiline
              />
              <EditableText
                as="p"
                contentKey="sobre.paragraph_2"
                defaultValue="Nossa equipe cuida de cada detalhe — desde a escolha dos fornecedores até a coordenação do dia — para que você possa aproveitar cada instante ao lado de quem ama."
                className="mt-4 leading-relaxed text-muted-foreground"
                multiline
              />
              <EditableText
                as="p"
                contentKey="sobre.paragraph_3"
                defaultValue="Acreditamos que cada casamento deve refletir a história do casal. Por isso, desenvolvemos um processo personalizado, humano e atento às suas necessidades."
                className="mt-4 leading-relaxed text-muted-foreground"
                multiline
              />

              <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8">
                {stats.map((stat) => (
                  <div key={stat.key} className="text-center sm:text-left">
                    <EditableText
                      as="p"
                      contentKey={`${stat.key}.value`}
                      defaultValue={stat.value}
                      className="font-display text-2xl font-medium text-olive sm:text-3xl"
                    />
                    <EditableText
                      as="p"
                      contentKey={`${stat.key}.label`}
                      defaultValue={stat.label}
                      className="mt-1 text-xs text-muted-foreground sm:text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
