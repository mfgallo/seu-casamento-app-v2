import { apiFetch, setStoredTokens, type StoredTokens } from "@/lib/api-client";

export type AppRole = "noivo" | "fornecedor" | "admin";

export type CurrentUser = {
  user_id: string;
  email: string;
  roles: AppRole[];
};

type TokenResponse = {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
};

function toStoredTokens(response: TokenResponse): StoredTokens {
  const tokens: StoredTokens = {
    accessToken: response.access_token,
    idToken: response.id_token,
  };
  if (response.refresh_token !== undefined) {
    tokens.refreshToken = response.refresh_token;
  }
  return tokens;
}

export async function apiSignup(input: {
  email: string;
  password: string;
  full_name: string;
  role: "noivo" | "fornecedor";
}): Promise<{ user_id: string }> {
  return apiFetch("/auth/signup", { method: "POST", body: input, auth: false });
}

/** Faz login e ja guarda os tokens no localStorage. */
export async function apiLogin(input: { email: string; password: string }): Promise<StoredTokens> {
  const response = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
  const tokens = toStoredTokens(response);
  setStoredTokens(tokens);
  return tokens;
}

/** Loga, atualiza o perfil (dados que o cadastro coleta), e desloga de novo -
 * mantem o fluxo original de "cadastro criado, faca login" sem expor uma rota
 * de admin para gravar o perfil de outro usuario. */
export async function apiSignupWithProfile(input: {
  email: string;
  password: string;
  full_name: string;
  role: "noivo" | "fornecedor";
  phone: string;
  weddingDate: string;
  partnerName: string;
}): Promise<void> {
  await apiSignup({
    email: input.email,
    password: input.password,
    full_name: input.full_name,
    role: input.role,
  });

  await apiLogin({ email: input.email, password: input.password });
  await apiFetch("/profiles/me", {
    method: "PUT",
    body: {
      full_name: input.full_name,
      phone: input.phone,
      wedding_date: input.weddingDate,
      partner_name: input.partnerName,
    },
  });
  setStoredTokens(null);
}

export async function apiMe(): Promise<CurrentUser> {
  return apiFetch("/auth/me");
}
