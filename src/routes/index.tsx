import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Calendar, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/EditableText";
import { EditableImage } from "@/components/EditableImage";
import { EditableGallery } from "@/components/EditableGallery";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ateliê do Sim — Assessoria de Casamentos" },
      {
        name: "description",
        content:
          "Assessoria completa para casamentos inesquecíveis. Planejamento, cerimonial e curadoria de fornecedores de luxo.",
      },
      { property: "og:title", content: "Ateliê do Sim — Assessoria de Casamentos" },
      {
        property: "og:description",
        content:
          "Assessoria completa para casamentos inesquecíveis. Planejamento, cerimonial e curadoria de fornecedores de luxo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <EditableImage
            contentKey="home.hero.image"
            defaultSrc={heroImage}
            alt="Cerimônia de casamento ao ar livre em tons verde oliva"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-olive/40" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <EditableText
            as="p"
            contentKey="home.hero.eyebrow"
            defaultValue="Assessoria de Casamentos"
            className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/90"
          />
          <h1 className="font-display text-4xl font-medium leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <EditableText contentKey="home.hero.title_line1" defaultValue="O seu grande dia," />
            <br />
            <EditableText
              contentKey="home.hero.title_line2"
              defaultValue="do jeito que você sempre sonhou"
              className="italic"
            />
          </h1>
          <EditableText
            as="p"
            contentKey="home.hero.subtitle"
            defaultValue="Planejamento completo, cerimonial impecável e uma curadoria exclusiva de fornecedores para transformar seu casamento em uma experiência inesquecível."
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg"
            multiline
          />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth">
              <Button
                size="lg"
                className="rounded-full bg-primary-foreground px-8 text-primary hover:bg-primary-foreground/90"
              >
                <EditableText
                  contentKey="home.hero.cta_primary"
                  defaultValue="Comece seu planejamento"
                />
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/servicos">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-white/40 bg-white/10 px-8 text-white hover:bg-white/20 hover:text-white"
              >
                <EditableText
                  contentKey="home.hero.cta_secondary"
                  defaultValue="Conheça os serviços"
                />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="bg-background py-20 sm:py-28">
        <div className="container-tight">
          <div className="mx-auto max-w-2xl text-center">
            <EditableText
              as="p"
              contentKey="home.services.eyebrow"
              defaultValue="Nossos serviços"
              className="text-sm font-medium uppercase tracking-[0.2em] text-olive-muted"
            />
            <EditableText
              as="h2"
              contentKey="home.services.title"
              defaultValue="Cuidamos de cada detalhe"
              className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl"
            />
            <EditableText
              as="p"
              contentKey="home.services.subtitle"
              defaultValue="Desde o primeiro briefing até o último convidado, estamos ao seu lado para que tudo saia perfeito."
              className="mt-4 text-muted-foreground"
              multiline
            />
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Heart,
                key: "home.service_1",
                title: "Planejamento Completo",
                desc: "Organização integral do casamento, desde a concepção até o grande dia.",
              },
              {
                icon: Calendar,
                key: "home.service_2",
                title: "Cerimonial",
                desc: "Condução impecável da cerimônia e festa para que você aproveite cada instante.",
              },
              {
                icon: Users,
                key: "home.service_3",
                title: "Curadoria de Fornecedores",
                desc: "Acesso exclusivo ao nosso marketplace de fornecedores validados.",
              },
              {
                icon: Sparkles,
                key: "home.service_4",
                title: "Design do Evento",
                desc: "Criação de identidade visual e cenografia para um casamento único.",
              },
            ].map((service) => (
              <div
                key={service.key}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-olive/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <service.icon className="h-5 w-5 text-olive" />
                </div>
                <EditableText
                  as="h3"
                  contentKey={`${service.key}.title`}
                  defaultValue={service.title}
                  className="mt-5 font-display text-lg font-medium text-foreground"
                />
                <EditableText
                  as="p"
                  contentKey={`${service.key}.desc`}
                  defaultValue={service.desc}
                  className="mt-2 text-sm leading-relaxed text-muted-foreground"
                  multiline
                />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/servicos">
              <Button
                variant="outline"
                className="rounded-full border-olive/30 text-olive hover:bg-olive/5"
              >
                <EditableText contentKey="home.services.cta" defaultValue="Ver todos os serviços" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section className="bg-secondary/30 py-20 sm:py-28">
        <div className="container-tight">
          <div className="flex flex-col items-end justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <EditableText
                as="p"
                contentKey="home.gallery.eyebrow"
                defaultValue="Galeria"
                className="text-sm font-medium uppercase tracking-[0.2em] text-olive-muted"
              />
              <EditableText
                as="h2"
                contentKey="home.gallery.title"
                defaultValue="Momentos inesquecíveis"
                className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl"
              />
            </div>
            <Link to="/galeria" className="text-sm font-medium text-olive hover:underline">
              <EditableText contentKey="home.gallery.cta" defaultValue="Ver galeria completa" />
            </Link>
          </div>

          <EditableGallery limit={3} className="mt-10" />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-olive py-20 text-primary-foreground sm:py-28">
        <div className="container-tight text-center">
          <EditableText
            as="h2"
            contentKey="home.cta.title"
            defaultValue="Pronta para planejar o casamento dos seus sonhos?"
            className="font-display text-3xl font-medium sm:text-4xl"
          />
          <EditableText
            as="p"
            contentKey="home.cta.subtitle"
            defaultValue="Fale com a nossa equipe e descubra como podemos tornar cada etapa do planejamento leve, elegante e inesquecível."
            className="mx-auto mt-4 max-w-2xl text-primary-foreground/80"
            multiline
          />
          <div className="mt-8">
            <Link to="/auth">
              <Button
                size="lg"
                className="rounded-full bg-primary-foreground px-8 text-primary hover:bg-primary-foreground/90"
              >
                <EditableText contentKey="home.cta.button" defaultValue="Solicitar orçamento" />
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
