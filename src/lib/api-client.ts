const TOKEN_STORAGE_KEY = "casamento_auth_tokens";

export type StoredTokens = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
};

export function getApiBaseUrl(): string {
  return import.meta.env["VITE_API_URL"] ?? "";
}

export function getStoredTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: StoredTokens | null): void {
  if (typeof window === "undefined") return;
  if (tokens) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** false para rotas publicas (login/signup/leitura de conteudo do site). */
  auth?: boolean;
  /** true quando `body` ja e um FormData (upload de arquivo). */
  isForm?: boolean;
};

// O backend (whatsvg) valida o id_token do Cognito no header Authorization -
// ele carrega sub + email, diferente do access_token que so carrega scopes.
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, isForm = false } = options;
  const headers: Record<string, string> = {};

  if (body !== undefined && !isForm) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const tokens = getStoredTokens();
    if (tokens?.idToken) {
      headers["Authorization"] = `Bearer ${tokens.idToken}`;
    }
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = isForm ? (body as FormData) : JSON.stringify(body);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, init);

  if (!response.ok) {
    let detail = response.statusText || `Erro ${response.status}`;
    try {
      const data = (await response.json()) as { detail?: string };
      detail = data.detail ?? detail;
    } catch {
      // corpo nao era JSON - mantem a mensagem padrao
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/** Sobe um arquivo direto pro S3 via URL pre-assinada obtida em /uploads/presign. */
export async function uploadFileToBucket(file: File): Promise<string> {
  const { upload_url, public_url } = await apiFetch<{ upload_url: string; public_url: string }>(
    "/uploads/presign",
    {
      method: "POST",
      body: { filename: file.name, content_type: file.type || "application/octet-stream" },
    },
  );

  const putResponse = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!putResponse.ok) {
    throw new Error("Falha ao subir o arquivo");
  }
  return public_url;
}
