import { createFileRoute } from "@tanstack/react-router";
import {
  Heart,
  Calendar,
  Users,
  Sparkles,
  Camera,
  UtensilsCrossed,
  Music,
  Flower2,
} from "lucide-react";
import { EditableText } from "@/components/EditableText";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Ateliê do Sim" },
      {
        name: "description",
        content:
          "Conheça os serviços de assessoria, cerimonial e curadoria de fornecedores da Ateliê do Sim.",
      },
      { property: "og:title", content: "Serviços — Ateliê do Sim" },
      {
        property: "og:description",
        content:
          "Conheça os serviços de assessoria, cerimonial e curadoria de fornecedores da Ateliê do Sim.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicosPage,
});

const services = [
  {
    icon: Heart,
    title: "Assessoria Completa",
    description:
      "Acompanhamento integral desde o início do planejamento até o pós-casamento. Cuidamos de cronogramas, orçamentos, contratos e todos os detalhes operacionais.",
    features: ["Planejamento estratégico", "Gestão de orçamento", "Negociação com fornecedores"],
  },
  {
    icon: Calendar,
    title: "Cerimonial",
    description:
      "Condução profissional do seu grande dia. Nossa equipe garante que cada momento aconteça no tempo certo, com elegância e tranquilidade.",
    features: ["Coordenação do dia", "Checklist completo", "Comunicação com fornecedores"],
  },
  {
    icon: Users,
    title: "Curadoria de Fornecedores",
    description:
      "Acesso exclusivo ao marketplace de fornecedores validados. Fotógrafos, decoradores, buffets e muito mais, reunidos em um só lugar.",
    features: ["Fornecedores aprovados", "Orçamentos centralizados", "Avaliações reais"],
  },
  {
    icon: Sparkles,
    title: "Design do Evento",
    description:
      "Criação de conceito visual, paleta de cores, identidade gráfica e cenografia para um casamento com a sua cara.",
    features: ["Moodboard personalizado", "Cenografia", "Papelaria do casamento"],
  },
  {
    icon: Camera,
    title: "Consultoria de Estilo",
    description:
      "Orientação para escolha de vestido, traje do noivo, beleza e acessórios, alinhados ao conceito do casamento.",
    features: ["Estilo da noiva", "Traje do noivo", "Beleza e acessórios"],
  },
  {
    icon: UtensilsCrossed,
    title: "Experiência Gastronômica",
    description:
      "Auxílio na escolha e degustação de cardápios, bebidas e experiências gastronômicas memoráveis para seus convidados.",
    features: ["Degustações guiadas", "Cardápio personalizado", "Harmonização de bebidas"],
  },
  {
    icon: Music,
    title: "Entretenimento",
    description:
      "Curadoria de bandas, DJs, performances e atrações que traduzem a atmosfera que você deseja criar.",
    features: ["Bandas e DJs", "Cerimonialistas", "Atrações especiais"],
  },
  {
    icon: Flower2,
    title: "Decoração Floral",
    description:
      "Projetos florais sofisticados que valorizam cada espaço e criam cenários deslumbrantes para o seu casamento.",
    features: ["Buquê da noiva", "Decoração de altar", "Mesas convidados"],
  },
];

function ServicosPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary/30 py-16 sm:py-24">
        <div className="container-tight text-center">
          <EditableText
            as="p"
            contentKey="servicos.eyebrow"
            defaultValue="O que fazemos"
            className="text-sm font-medium uppercase tracking-[0.2em] text-olive-muted"
          />
          <EditableText
            as="h1"
            contentKey="servicos.title"
            defaultValue="Serviços"
            className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl"
          />
          <EditableText
            as="p"
            contentKey="servicos.subtitle"
            defaultValue="Oferecemos uma experiência completa de assessoria para que você viva cada momento do seu casamento com leveza e segurança."
            className="mx-auto mt-5 max-w-2xl text-muted-foreground"
            multiline
          />
        </div>
      </section>

      <section className="bg-background py-16 sm:py-24">
        <div className="container-tight">
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="rounded-2xl border border-border bg-card p-8 transition-all hover:border-olive/30 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <service.icon className="h-6 w-6 text-olive" />
                </div>
                <EditableText
                  as="h2"
                  contentKey={`servicos.card_${index}.title`}
                  defaultValue={service.title}
                  className="mt-6 font-display text-2xl font-medium text-foreground"
                />
                <EditableText
                  as="p"
                  contentKey={`servicos.card_${index}.description`}
                  defaultValue={service.description}
                  className="mt-3 leading-relaxed text-muted-foreground"
                  multiline
                />
                <ul className="mt-5 space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-olive" />
                      <EditableText
                        contentKey={`servicos.card_${index}.feature_${featureIndex}`}
                        defaultValue={feature}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
