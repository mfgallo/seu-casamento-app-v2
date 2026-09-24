import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  getGuestsSummary,
  importGuestsCsv,
  listBrides,
  listGuests,
  sendInvites,
  type BulkImportResult,
  type RsvpStatus,
} from "@/lib/guests-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  Send,
  Upload,
  Users,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/convidados")({
  head: () => ({
    meta: [
      { title: "Convidados & RSVP — Ateliê do Sim" },
      {
        name: "description",
        content: "Importe a lista de convidados e acompanhe as confirmações de presença.",
      },
    ],
  }),
  component: ConvidadosPage,
});

const STATUS_FILTERS: { label: string; value: RsvpStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendentes", value: "pending" },
  { label: "Confirmados", value: "confirmed" },
  { label: "Recusaram", value: "declined" },
  { label: "Revisar manualmente", value: "needs_review" },
];

const STATUS_LABEL: Record<RsvpStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusou",
  needs_review: "Revisar",
};

const STATUS_BADGE_CLASS: Record<RsvpStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-olive text-primary-foreground",
  declined: "bg-destructive/10 text-destructive",
  needs_review: "bg-amber-500/10 text-amber-600",
};

function ConvidadosPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedBride, setSelectedBride] = useState<string>("");

  const { data: brides } = useQuery({
    queryKey: ["guest-brides"],
    queryFn: listBrides,
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      void router.navigate({ to: "/perfil", replace: true });
    }
  }, [authLoading, isAdmin, router]);

  if (authLoading || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-olive" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="bg-secondary/30 py-12 sm:py-16">
        <div className="container-tight">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
                  Convidados & Confirmações
                </h1>
                <p className="text-muted-foreground">
                  Importe a lista de convidados e acompanhe quem já confirmou presença.
                </p>
              </div>
            </div>

            {brides && brides.length > 0 && (
              <div className="space-y-1.5">
                <label htmlFor="bride-select" className="text-sm font-medium text-foreground">
                  Casamento
                </label>
                <select
                  id="bride-select"
                  value={selectedBride}
                  onChange={(e) => setSelectedBride(e.target.value)}
                  className="flex h-10 w-full min-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Todos os casamentos</option>
                  {brides.map((bride) => (
                    <option key={bride} value={bride}>
                      {bride}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="container-tight space-y-8">
          <SummaryCards brideName={selectedBride || undefined} />
          <ImportCard />
          <SendInvitesCard brideName={selectedBride || undefined} />
          <GuestListCard brideName={selectedBride || undefined} />
        </div>
      </section>
    </div>
  );
}

function SummaryCards({ brideName }: { brideName?: string | undefined }) {
  const { data, isLoading } = useQuery({
    queryKey: ["guests-summary", brideName],
    queryFn: () => getGuestsSummary(brideName),
    staleTime: 10_000,
  });

  const cards = [
    {
      label: "Pendentes",
      value: data?.pending,
      icon: Clock,
      className: "text-muted-foreground",
    },
    {
      label: "Confirmados",
      value: data?.confirmed,
      icon: CheckCircle2,
      className: "text-olive",
    },
    {
      label: "Recusaram",
      value: data?.declined,
      icon: XCircle,
      className: "text-destructive",
    },
    {
      label: "Revisar manualmente",
      value: data?.needs_review,
      icon: HelpCircle,
      className: "text-amber-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center justify-between gap-3 pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-1 font-display text-3xl font-medium text-foreground">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (card.value ?? 0)}
              </p>
            </div>
            <card.icon className={`h-8 w-8 ${card.className}`} />
          </CardContent>
        </Card>
      ))}
      <Card className="sm:col-span-2 lg:col-span-4">
        <CardContent className="flex items-center justify-between pt-6">
          <p className="text-sm text-muted-foreground">Total de acompanhantes confirmados</p>
          <p className="font-display text-2xl font-medium text-foreground">
            {isLoading ? "…" : (data?.confirmed_party_size ?? 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ImportCard() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsImporting(true);
    setError("");
    setResult(null);
    try {
      const importResult = await importGuestsCsv(file);
      setResult(importResult);
      await queryClient.invalidateQueries({ queryKey: ["guests-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["guests-list"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar arquivo");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Importar lista de convidados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Arquivo CSV com colunas <code className="text-foreground">name</code> e{" "}
          <code className="text-foreground">phone_e164</code> (ou{" "}
          <code className="text-foreground">nome</code>/
          <code className="text-foreground">telefone</code> em português), e opcionalmente{" "}
          <code className="text-foreground">party_size</code> (acompanhantes) e{" "}
          <code className="text-foreground">notes</code>. Só cadastra os convidados como pendentes —
          o envio dos convites continua sendo feito separadamente.
        </p>
        <p className="text-sm text-muted-foreground">
          Pra poder disparar o convite depois, inclua também{" "}
          <code className="text-foreground">noiva</code>,{" "}
          <code className="text-foreground">noivo</code>,{" "}
          <code className="text-foreground">data_casamento</code> (AAAA-MM-DD) e{" "}
          <code className="text-foreground">horario</code> — são os dados que preenchem a mensagem
          do template aprovado na Meta. Sem esses 4 campos completos, o convidado fica de fora
          quando você clicar em "enviar".
        </p>
        <p className="text-sm text-muted-foreground">
          Coluna opcional <code className="text-foreground">genero</code> (F/M) — convidadas (F)
          recebem uma pergunta extra sobre número de chinelo depois de confirmar presença.
        </p>

        <div>
          <Button type="button" onClick={() => inputRef.current?.click()} disabled={isImporting}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Escolher arquivo CSV
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge className="bg-olive text-primary-foreground">
                {result.created} adicionados
              </Badge>
              <Badge variant="outline">{result.skipped} já existiam</Badge>
              {result.errors > 0 && (
                <Badge className="bg-destructive/10 text-destructive">
                  {result.errors} com erro
                </Badge>
              )}
            </div>

            {result.rows.some((row) => row.status !== "created") && (
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linha</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detalhe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rows
                      .filter((row) => row.status !== "created")
                      .map((row) => (
                        <TableRow key={row.row}>
                          <TableCell>{row.row}</TableCell>
                          <TableCell>{row.name ?? "—"}</TableCell>
                          <TableCell>{row.phone_e164 ?? "—"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                row.status === "error"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-secondary text-secondary-foreground"
                              }
                            >
                              {row.status === "error" ? "erro" : "já existia"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{row.detail}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SendInvitesCard({ brideName }: { brideName?: string | undefined }) {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  const handleSendAll = async () => {
    setIsSending(true);
    setError("");
    setResult(null);
    try {
      const response = await sendInvites(undefined, brideName);
      setResult({ sent: response.sent.length, failed: response.failed.length });
      await queryClient.invalidateQueries({ queryKey: ["guests-list"] });
      await queryClient.invalidateQueries({ queryKey: ["guests-summary"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao disparar convites");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Disparar convites</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Envia a mensagem de convite (template aprovado na Meta) pra todos os convidados{" "}
          <Badge className="bg-secondary text-secondary-foreground">pendentes</Badge>
          {brideName ? (
            <>
              {" "}
              do casamento de <strong className="text-foreground">{brideName}</strong>
            </>
          ) : (
            " de todos os casamentos"
          )}{" "}
          que ainda não foram chamados. Pra reenviar pra alguém específico, use o botão na linha
          dele na tabela abaixo.
        </p>
        <Button type="button" onClick={handleSendAll} disabled={isSending}>
          {isSending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Enviar para todos os pendentes
        </Button>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {result && (
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge className="bg-olive text-primary-foreground">{result.sent} enviados</Badge>
            {result.failed > 0 && (
              <Badge className="bg-destructive/10 text-destructive">{result.failed} falharam</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GuestListCard({ brideName }: { brideName?: string | undefined }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<RsvpStatus | "all">("all");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { data: guests, isLoading } = useQuery({
    queryKey: ["guests-list", filter, brideName],
    queryFn: () => listGuests(filter === "all" ? undefined : filter, brideName),
  });

  const handleSendOne = async (guestId: string) => {
    setSendingId(guestId);
    try {
      await sendInvites([guestId]);
      await queryClient.invalidateQueries({ queryKey: ["guests-list"] });
      await queryClient.invalidateQueries({ queryKey: ["guests-summary"] });
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Lista de convidados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                filter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-olive" />
          </div>
        ) : guests && guests.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Vagas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acompanhantes confirmados</TableHead>
                  <TableHead>Chinelo</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Convite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
                  <TableRow key={guest.guest_id}>
                    <TableCell className="font-medium text-foreground">{guest.name}</TableCell>
                    <TableCell>{guest.phone_e164}</TableCell>
                    <TableCell>{guest.party_size}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_BADGE_CLASS[guest.rsvp_status]}>
                        {STATUS_LABEL[guest.rsvp_status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {guest.companion_names ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {guest.shoe_size ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{guest.notes ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={sendingId === guest.guest_id}
                        onClick={() => handleSendOne(guest.guest_id)}
                      >
                        {sendingId === guest.guest_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-lg font-medium text-foreground">
              Nenhum convidado encontrado
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Importe um arquivo CSV acima para começar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
