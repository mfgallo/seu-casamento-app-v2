import { apiFetch } from "@/lib/api-client";

export type Category = {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
};

export type VendorStatus = "pending" | "approved" | "rejected";

export type Vendor = {
  vendor_id: string;
  owner_id: string;
  category_slug: string;
  name: string;
  slug: string;
  description: string | null;
  services: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  portfolio_urls: string[];
  city: string | null;
  state: string | null;
  min_price: number | null;
  max_price: number | null;
  status: VendorStatus;
  featured: boolean;
};

export type VendorInput = {
  category_slug: string;
  name: string;
  description?: string | undefined;
  services?: string | undefined;
  contact_email?: string | undefined;
  contact_phone?: string | undefined;
  website_url?: string | undefined;
  instagram_url?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  min_price?: number | undefined;
  max_price?: number | undefined;
};

export async function listCategories(): Promise<Category[]> {
  return apiFetch("/categories", { auth: false });
}

export async function listApprovedVendors(params: {
  categorySlug?: string | undefined;
  search?: string | undefined;
}): Promise<Vendor[]> {
  const query = new URLSearchParams();
  if (params.categorySlug) query.set("category_slug", params.categorySlug);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return apiFetch(`/vendors${qs ? `?${qs}` : ""}`, { auth: false });
}

export async function getMyVendor(): Promise<Vendor | null> {
  return apiFetch("/vendors/mine");
}

export async function createVendor(input: VendorInput): Promise<Vendor> {
  return apiFetch("/vendors/mine", { method: "POST", body: input });
}

export async function updateVendor(input: Partial<VendorInput>): Promise<Vendor> {
  return apiFetch("/vendors/mine", { method: "PUT", body: input });
}
