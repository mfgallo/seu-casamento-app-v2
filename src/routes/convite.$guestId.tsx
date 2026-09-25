import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getGuestInvite, type GuestInvite } from "@/lib/wedding-api";
import { ApiError } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  Heart,
  Loader2,
  MapPin,
  ExternalLink,
  Shirt,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/convite/$guestId")({
  head: () => ({
    meta: [
      { title: "Meu convite — Ateliê do Sim" },
      { name: "description", content: "Todas as informações do casamento em um só lugar." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConvitePage,
});

const STATUS_LABEL: Record<GuestInvite["rsvp_status"], string> = {
  pending: "Presença pendente",
  confirmed: "Presença confirmada",
  declined: "Presença não confirmada",
  needs_review: "Estamos revisando sua resposta",
};

function formatWeddingDate(value: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day}/${month}/${year}`;
}

function ConvitePage() {
  const { guestId } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["guest-invite", guestId],
    queryFn: () => getGuestInvite(guestId),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-olive" />
      </div>
    );
  }

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-medium text-foreground">
            {notFound ? "Convite não encontrado" : "Não conseguimos carregar seu convite"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {notFound
              ? "Confira se o link que você recebeu está completo, ou fale com quem te convidou."
              : "Tente novamente em instantes."}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const mapsQuery = data.venue_address
    ? encodeURIComponent(data.venue_address)
    : data.venue_name
      ? encodeURIComponent(data.venue_name)
      : null;

  return (
    <div className="flex flex-col">
      <section className="bg-secondary/30 py-12 sm:py-16">
        <div className="container-tight text-center">
          <Heart className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-olive-muted">
            Olá, {data.guest_name.split(" ")[0]}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">
            {data.groom_name && data.bride_name
              ? `${data.groom_name} & ${data.bride_name}`
              : (data.bride_name ?? data.groom_name ?? "Nosso casamento")}
          </h1>
          <Badge className="mt-4 bg-olive text-primary-foreground">
            {STATUS_LABEL[data.rsvp_status]}
          </Badge>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-16">
        <div className="container-tight max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Detalhes do casamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.wedding_date && (
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-olive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Data</p>
                    <p className="text-sm text-muted-foreground">
                      {formatWeddingDate(data.wedding_date)}
                    </p>
                  </div>
                </div>
              )}
              {data.wedding_time && (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-olive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Horário</p>
                    <p className="text-sm text-muted-foreground">{data.wedding_time}</p>
                  </div>
                </div>
              )}
              {data.venue_name && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-olive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Local</p>
                    <p className="text-sm text-muted-foreground">{data.venue_name}</p>
                    {data.venue_address && (
                      <p className="text-sm text-muted-foreground">{data.venue_address}</p>
                    )}
                  </div>
                </div>
              )}
              {data.general_instructions && (
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-olive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Bom saber</p>
                    <p className="text-sm text-muted-foreground">{data.general_instructions}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {mapsQuery && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Como chegar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                  <iframe
                    title="Mapa do local do casamento"
                    src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed`}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-olive hover:underline"
                >
                  Abrir no Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>
          )}

          {data.is_padrinho && (data.dress_code || data.padrinho_instructions) && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="font-display text-xl">
                  Informações para padrinhos e madrinhas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.dress_code && (
                  <div className="flex items-start gap-3">
                    <Shirt className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Vestimenta</p>
                      <p className="text-sm text-muted-foreground">{data.dress_code}</p>
                    </div>
                  </div>
                )}
                {data.padrinho_instructions && (
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Instruções</p>
                      <p className="text-sm text-muted-foreground">{data.padrinho_instructions}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
