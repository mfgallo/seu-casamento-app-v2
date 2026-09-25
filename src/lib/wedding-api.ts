import { apiFetch } from "@/lib/api-client";
import type { RsvpStatus } from "@/lib/guests-api";

export type Wedding = {
  bride_name: string;
  venue_name: string | null;
  venue_address: string | null;
  dress_code: string | null;
  padrinho_instructions: string | null;
  general_instructions: string | null;
};

export type WeddingUpdate = {
  venue_name?: string | null | undefined;
  venue_address?: string | null | undefined;
  dress_code?: string | null | undefined;
  padrinho_instructions?: string | null | undefined;
  general_instructions?: string | null | undefined;
};

/** Autenticado - o proprio noivo mexendo no seu casamento (bride_name
 * resolvido no backend via profiles.bride_name). */
export async function getMyWedding(): Promise<Wedding> {
  return apiFetch("/weddings/me");
}

export async function updateMyWedding(fields: WeddingUpdate): Promise<Wedding> {
  return apiFetch("/weddings/me", { method: "PUT", body: fields });
}

export type GuestInvite = {
  guest_name: string;
  party_size: number;
  rsvp_status: RsvpStatus;
  is_padrinho: boolean;
  bride_name: string | null;
  groom_name: string | null;
  wedding_date: string | null;
  wedding_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  general_instructions: string | null;
  dress_code: string | null;
  padrinho_instructions: string | null;
};

/** Publico - sem token nenhum, o guest_id na URL ja e o "acesso". Usado na
 * pagina /convite/$guestId, sem exigir login. */
export async function getGuestInvite(guestId: string): Promise<GuestInvite> {
  return apiFetch(`/guests/${guestId}/invite`, { auth: false });
}
