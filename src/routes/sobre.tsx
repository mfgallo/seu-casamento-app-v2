import { createFileRoute } from "@tanstack/react-router";
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
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={aboutImage}
                alt="Assessora de casamentos trabalhando em ambiente moderno"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
                Transformamos sonhos em experiências
              </h2>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                A Ateliê do Sim nasceu da paixão por criar momentos únicos. Somos uma assessoria de
                casamentos completa, dedicada a transformar o planejamento do seu grande dia em uma
                jornada leve, elegante e inesquecível.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Nossa equipe cuida de cada detalhe — desde a escolha dos fornecedores até a
                coordenação do dia — para que você possa aproveitar cada instante ao lado de quem
                ama.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Acreditamos que cada casamento deve refletir a história do casal. Por isso,
                desenvolvemos um processo personalizado, humano e atento às suas necessidades.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8">
                {[
                  { value: "10+", label: "Anos de experiência" },
                  { value: "200+", label: "Casamentos realizados" },
                  { value: "50+", label: "Fornecedores parceiros" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <p className="font-display text-2xl font-medium text-olive sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
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
