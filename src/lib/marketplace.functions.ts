import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const VendorInput = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  categoryId: z.string().uuid(),
  description: z.string().min(10),
  services: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  city: z.string().optional(),
  state: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

function toNull<T>(value: T | undefined | ""): T | null {
  return value === undefined || value === "" ? null : (value as T);
}

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listApprovedVendors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ categorySlug: z.string().optional(), search: z.string().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("vendors")
      .select("*, categories(name, slug)")
      .eq("status", "approved");

    if (data.categorySlug) {
      query = query.eq("categories.slug", data.categorySlug);
    }

    if (data.search) {
      query = query.ilike("name", `%${data.search}%`);
    }

    const { data: vendors, error } = await query.order("featured", { ascending: false });
    if (error) throw new Error(error.message);
    return vendors ?? [];
  });

export const getMyVendor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("vendors")
      .select("*")
      .eq("owner_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  });

export const createVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => VendorInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("vendors")
      .select("id")
      .eq("owner_id", context.userId)
      .maybeSingle();

    if (existing) {
      throw new Error("Você já possui um cadastro de fornecedor");
    }

    const { error } = await context.supabase.from("vendors").insert({
      owner_id: context.userId,
      category_id: data.categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      services: toNull(data.services),
      contact_email: data.contactEmail,
      contact_phone: toNull(data.contactPhone),
      website_url: toNull(data.websiteUrl),
      instagram_url: toNull(data.instagramUrl),
      city: toNull(data.city),
      state: toNull(data.state),
      min_price: toNull(data.minPrice),
      max_price: toNull(data.maxPrice),
      status: "pending",
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    VendorInput.partial().extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;

    const update: {
      name?: string;
      slug?: string;
      category_id?: string;
      description?: string;
      services?: string | null;
      contact_email?: string;
      contact_phone?: string | null;
      website_url?: string | null;
      instagram_url?: string | null;
      city?: string | null;
      state?: string | null;
      min_price?: number | null;
      max_price?: number | null;
    } = {};

    if (rest.name !== undefined) update.name = rest.name;
    if (rest.slug !== undefined) update.slug = rest.slug;
    if (rest.categoryId !== undefined) update.category_id = rest.categoryId;
    if (rest.description !== undefined) update.description = rest.description;
    if (rest.services !== undefined) update.services = toNull(rest.services);
    if (rest.contactEmail !== undefined) update.contact_email = rest.contactEmail;
    if (rest.contactPhone !== undefined) update.contact_phone = toNull(rest.contactPhone);
    if (rest.websiteUrl !== undefined) update.website_url = toNull(rest.websiteUrl);
    if (rest.instagramUrl !== undefined) update.instagram_url = toNull(rest.instagramUrl);
    if (rest.city !== undefined) update.city = toNull(rest.city);
    if (rest.state !== undefined) update.state = toNull(rest.state);
    if (rest.minPrice !== undefined) update.min_price = toNull(rest.minPrice);
    if (rest.maxPrice !== undefined) update.max_price = toNull(rest.maxPrice);

    const { error } = await context.supabase
      .from("vendors")
      .update(update)
      .eq("id", id)
      .eq("owner_id", context.userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
