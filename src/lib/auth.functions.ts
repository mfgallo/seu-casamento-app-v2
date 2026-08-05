import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SignUpInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(["noivo", "fornecedor"]),
  phone: z.string().min(8),
  weddingDate: z.string().min(1),
  partnerName: z.string().min(2),
});

const SignInInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SignUpInput.parse(input))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? "Erro ao criar conta");
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      full_name: data.fullName,
      phone: data.phone,
      wedding_date: data.weddingDate,
      partner_name: data.partnerName,
    });

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: data.role,
    });

    if (roleError) {
      throw new Error(roleError.message);
    }

    return { ok: true, userId };
  });

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SignInInput.parse(input))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.session) {
      throw new Error(authError?.message ?? "Email ou senha incorretos");
    }

    return {
      ok: true,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt: authData.session.expires_at,
    };
  });
