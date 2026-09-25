import { apiFetch } from "@/lib/api-client";

export type RsvpStatus = "pending" | "confirmed" | "declined" | "needs_review";

export type Guest = {
  guest_id: string;
  name: string;
  phone_e164: string;
  party_size: number;
  notes: string | null;
  gender: "F" | "M" | null;
  bride_name: string | null;
  groom_name: string | null;
  wedding_date: string | null;
  wedding_time: string | null;
  rsvp_status: RsvpStatus;
  conversation_stage:
    "awaiting_companions" | "awaiting_shoe_size" | "awaiting_final_confirmation" | null;
  companion_names: string | null;
  shoe_size: string | null;
  invited_at: string | null;
  responded_at: string | null;
  is_padrinho: boolean;
};

export type GuestSummary = {
  pending: number;
  confirmed: number;
  declined: number;
  needs_review: number;
  confirmed_party_size: number;
};

export type BulkImportRowResult = {
  row: number;
  name: string | null;
  phone_e164: string | null;
  status: "created" | "skipped" | "error";
  detail: string | null;
  guest_id: string | null;
};

export type BulkImportResult = {
  created: number;
  skipped: number;
  errors: number;
  rows: BulkImportRowResult[];
};

/** Nomes distintos de noivas cadastradas - a agencia atende varios casais,
 * entao o dashboard trabalha "por casamento". */
export async function listBrides(): Promise<string[]> {
  return apiFetch("/guests/brides");
}

export async function getGuestsSummary(brideName?: string): Promise<GuestSummary> {
  const qs = brideName ? `?bride_name=${encodeURIComponent(brideName)}` : "";
  return apiFetch(`/guests/summary${qs}`);
}

export async function listGuests(statusFilter?: RsvpStatus, brideName?: string): Promise<Guest[]> {
  const params = new URLSearchParams();
  if (statusFilter) params.set("status_filter", statusFilter);
  if (brideName) params.set("bride_name", brideName);
  const qs = params.toString();
  return apiFetch(`/guests${qs ? `?${qs}` : ""}`);
}

export async function importGuestsCsv(file: File): Promise<BulkImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/guests/bulk", { method: "POST", body: formData, isForm: true });
}

export async function updateGuest(
  guestId: string,
  fields: Partial<Pick<Guest, "is_padrinho">>,
): Promise<Guest> {
  return apiFetch(`/guests/${guestId}`, { method: "PATCH", body: fields });
}

export type SendInvitesResult = {
  sent: string[];
  failed: string[];
};

/** Sem guestIds, dispara para todos os "pending" do casamento (brideName). Com
 * guestIds, ignora brideName - os dados do template vem do proprio convidado. */
export async function sendInvites(
  guestIds?: string[],
  brideName?: string,
): Promise<SendInvitesResult> {
  return apiFetch("/campaigns/send-invites", {
    method: "POST",
    body: { guest_ids: guestIds, bride_name: brideName },
  });
}
