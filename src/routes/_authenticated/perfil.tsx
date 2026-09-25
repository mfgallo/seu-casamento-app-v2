import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch, ApiError } from "@/lib/api-client";
import {
  getMyVendor,
  createVendor,
  updateVendor,
  listCategories,
  type Category,
} from "@/lib/marketplace-api";
import { getMyWedding, updateMyWedding, type Wedding } from "@/lib/wedding-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Store, Heart, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — Ateliê do Sim" },
      {
        name: "description",
        content: "Gerencie seus dados e cadastro de fornecedor na Ateliê do Sim.",
      },
      { property: "og:title", content: "Meu Perfil — Ateliê do Sim" },
      {
        property: "og:description",
        content: "Gerencie seus dados e cadastro de fornecedor na Ateliê do Sim.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user, roles } = useAuth();
  const isFornecedor = roles.includes("fornecedor");
  const isNoivo = roles.includes("noivo");

  return (
    <div className="flex flex-col">
      <section className="bg-secondary/30 py-12 sm:py-16">
        <div className="container-tight">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
                Meu Perfil
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="container-tight">
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="dados">
                <Heart className="mr-1 h-4 w-4" />
                Dados do Casal
              </TabsTrigger>
              {isNoivo && (
                <TabsTrigger value="casamento">
                  <MapPin className="mr-1 h-4 w-4" />
                  Informações do Casamento
                </TabsTrigger>
              )}
              {isFornecedor && (
                <TabsTrigger value="fornecedor">
                  <Store className="mr-1 h-4 w-4" />
                  Fornecedor
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="dados" className="mt-6">
              <ProfileForm />
            </TabsContent>

            {isNoivo && (
              <TabsContent value="casamento" className="mt-6">
                <WeddingForm />
              </TabsContent>
            )}

            {isFornecedor && (
              <TabsContent value="fornecedor" className="mt-6">
                <VendorForm />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </section>
    </div>
  );
}

type ProfileResponse = {
  full_name: string | null;
  phone: string | null;
  wedding_date: string | null;
  partner_name: string | null;
  bride_name: string | null;
};

function ProfileForm() {
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    wedding_date: "",
    partner_name: "",
    bride_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const data = await apiFetch<ProfileResponse>("/profiles/me");
      setProfile({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        wedding_date: data.wedding_date ? (data.wedding_date.split("T")[0] ?? "") : "",
        partner_name: data.partner_name ?? "",
        bride_name: data.bride_name ?? "",
      });
    }
    void loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      await apiFetch("/profiles/me", {
        method: "PUT",
        body: {
          full_name: profile.full_name || null,
          phone: profile.phone || null,
          wedding_date: profile.wedding_date || null,
          partner_name: profile.partner_name || null,
          bride_name: profile.bride_name || null,
        },
      });
      setMessage("Perfil atualizado com sucesso!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Dados do casal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partner_name">Nome do(a) parceiro(a)</Label>
            <Input
              id="partner_name"
              value={profile.partner_name}
              onChange={(e) => setProfile((p) => ({ ...p, partner_name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wedding_date">Data prevista do casamento</Label>
            <Input
              id="wedding_date"
              type="date"
              value={profile.wedding_date}
              onChange={(e) => setProfile((p) => ({ ...p, wedding_date: e.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bride_name">Nome da noiva (como está na lista de convidados)</Label>
            <Input
              id="bride_name"
              value={profile.bride_name}
              onChange={(e) => setProfile((p) => ({ ...p, bride_name: e.target.value }))}
              placeholder="Ex: Vanessa"
            />
            <p className="text-xs text-muted-foreground">
              Precisa ser exatamente igual ao nome que a organização usou ao cadastrar sua lista de
              convidados — é assim que o sistema sabe quais convidados são os seus, em "Convidados".
            </p>
          </div>

          {message && (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary sm:col-span-2">
              {message}
            </div>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" className="rounded-full bg-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function WeddingForm() {
  const [wedding, setWedding] = useState({
    venue_name: "",
    venue_address: "",
    dress_code: "",
    padrinho_instructions: "",
    general_instructions: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [needsBrideName, setNeedsBrideName] = useState(false);

  useEffect(() => {
    async function loadWedding() {
      try {
        const data = await getMyWedding();
        setWedding({
          venue_name: data.venue_name ?? "",
          venue_address: data.venue_address ?? "",
          dress_code: data.dress_code ?? "",
          padrinho_instructions: data.padrinho_instructions ?? "",
          general_instructions: data.general_instructions ?? "",
        });
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setNeedsBrideName(true);
        } else {
          setMessage(err instanceof Error ? err.message : "Erro ao carregar informações");
        }
      } finally {
        setIsFetching(false);
      }
    }
    void loadWedding();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const saved: Wedding = await updateMyWedding({
        venue_name: wedding.venue_name || undefined,
        venue_address: wedding.venue_address || undefined,
        dress_code: wedding.dress_code || undefined,
        padrinho_instructions: wedding.padrinho_instructions || undefined,
        general_instructions: wedding.general_instructions || undefined,
      });
      setWedding({
        venue_name: saved.venue_name ?? "",
        venue_address: saved.venue_address ?? "",
        dress_code: saved.dress_code ?? "",
        padrinho_instructions: saved.padrinho_instructions ?? "",
        general_instructions: saved.general_instructions ?? "",
      });
      setMessage("Informações do casamento atualizadas com sucesso!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar informações");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (needsBrideName) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Informações do casamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Antes de preencher as informações do casamento, preencha o campo "Nome da noiva" na aba
            "Dados do Casal" — é ele que conecta essas informações à sua lista de convidados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Informações do casamento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Essas informações aparecem na página de convite pessoal de cada convidado (enviada por
          WhatsApp), junto com um mapa do local.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="venue_name">Nome do local</Label>
            <Input
              id="venue_name"
              value={wedding.venue_name}
              onChange={(e) => setWedding((w) => ({ ...w, venue_name: e.target.value }))}
              placeholder="Ex: Espaço Jardim"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue_address">Endereço completo</Label>
            <Input
              id="venue_address"
              value={wedding.venue_address}
              onChange={(e) => setWedding((w) => ({ ...w, venue_address: e.target.value }))}
              placeholder="Ex: Rua das Flores, 123 - São Paulo, SP"
            />
            <p className="text-xs text-muted-foreground">
              Usado para montar o mapa e o link "Abrir no Google Maps" na página do convidado.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="general_instructions">Instruções gerais (todos os convidados)</Label>
            <Textarea
              id="general_instructions"
              value={wedding.general_instructions}
              onChange={(e) => setWedding((w) => ({ ...w, general_instructions: e.target.value }))}
              placeholder="Ex: Estacionamento no local, cerimônia ao ar livre..."
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dress_code">Vestimenta dos padrinhos/madrinhas</Label>
            <Input
              id="dress_code"
              value={wedding.dress_code}
              onChange={(e) => setWedding((w) => ({ ...w, dress_code: e.target.value }))}
              placeholder="Ex: Traje esporte fino, tons de verde"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="padrinho_instructions">Instruções para padrinhos/madrinhas</Label>
            <Textarea
              id="padrinho_instructions"
              value={wedding.padrinho_instructions}
              onChange={(e) => setWedding((w) => ({ ...w, padrinho_instructions: e.target.value }))}
              placeholder="Ex: Chegar às 15h para o ensaio, ponto de encontro..."
            />
            <p className="text-xs text-muted-foreground">
              Essas duas últimas seções só aparecem para convidados marcados como padrinho/madrinha.
            </p>
          </div>

          {message && (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary sm:col-span-2">
              {message}
            </div>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" className="rounded-full bg-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function VendorForm() {
  const [vendor, setVendor] = useState({
    hasVendor: false,
    name: "",
    categorySlug: "",
    description: "",
    services: "",
    contactEmail: "",
    contactPhone: "",
    websiteUrl: "",
    instagramUrl: "",
    city: "",
    state: "",
    minPrice: "",
    maxPrice: "",
    status: "" as string,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const [vendorResult, categoriesResult] = await Promise.all([getMyVendor(), listCategories()]);
      setCategories(categoriesResult);

      if (vendorResult) {
        setVendor({
          hasVendor: true,
          name: vendorResult.name ?? "",
          categorySlug: vendorResult.category_slug ?? "",
          description: vendorResult.description ?? "",
          services: vendorResult.services ?? "",
          contactEmail: vendorResult.contact_email ?? "",
          contactPhone: vendorResult.contact_phone ?? "",
          websiteUrl: vendorResult.website_url ?? "",
          instagramUrl: vendorResult.instagram_url ?? "",
          city: vendorResult.city ?? "",
          state: vendorResult.state ?? "",
          minPrice: vendorResult.min_price?.toString() ?? "",
          maxPrice: vendorResult.max_price?.toString() ?? "",
          status: vendorResult.status ?? "pending",
        });
      }
    }
    void loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const payload = {
        category_slug: vendor.categorySlug,
        name: vendor.name,
        description: vendor.description,
        services: vendor.services || undefined,
        contact_email: vendor.contactEmail || undefined,
        contact_phone: vendor.contactPhone || undefined,
        website_url: vendor.websiteUrl || undefined,
        instagram_url: vendor.instagramUrl || undefined,
        city: vendor.city || undefined,
        state: vendor.state || undefined,
        min_price: vendor.minPrice ? Number(vendor.minPrice) : undefined,
        max_price: vendor.maxPrice ? Number(vendor.maxPrice) : undefined,
      };

      if (vendor.hasVendor) {
        await updateVendor(payload);
      } else {
        await createVendor(payload);
        setVendor((v) => ({ ...v, hasVendor: true, status: "pending" }));
      }

      setMessage("Cadastro salvo com sucesso! Aguardando aprovação.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Cadastro de fornecedor</CardTitle>
      </CardHeader>
      <CardContent>
        {vendor.status && (
          <div className="mb-4 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
            Status do cadastro: <span className="font-medium capitalize">{vendor.status}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="v-name">Nome da empresa</Label>
            <Input
              id="v-name"
              value={vendor.name}
              onChange={(e) => setVendor((v) => ({ ...v, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-category">Categoria</Label>
            <select
              id="v-category"
              value={vendor.categorySlug}
              onChange={(e) => setVendor((v) => ({ ...v, categorySlug: e.target.value }))}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Selecione</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="v-description">Descrição</Label>
            <Textarea
              id="v-description"
              value={vendor.description}
              onChange={(e) => setVendor((v) => ({ ...v, description: e.target.value }))}
              required
              minLength={10}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="v-services">Serviços oferecidos</Label>
            <Input
              id="v-services"
              value={vendor.services}
              onChange={(e) => setVendor((v) => ({ ...v, services: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-email">Email de contato</Label>
            <Input
              id="v-email"
              type="email"
              value={vendor.contactEmail}
              onChange={(e) => setVendor((v) => ({ ...v, contactEmail: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-phone">Telefone</Label>
            <Input
              id="v-phone"
              value={vendor.contactPhone}
              onChange={(e) => setVendor((v) => ({ ...v, contactPhone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-website">Website</Label>
            <Input
              id="v-website"
              type="url"
              value={vendor.websiteUrl}
              onChange={(e) => setVendor((v) => ({ ...v, websiteUrl: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-instagram">Instagram</Label>
            <Input
              id="v-instagram"
              type="url"
              value={vendor.instagramUrl}
              onChange={(e) => setVendor((v) => ({ ...v, instagramUrl: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-city">Cidade</Label>
            <Input
              id="v-city"
              value={vendor.city}
              onChange={(e) => setVendor((v) => ({ ...v, city: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-state">Estado</Label>
            <Input
              id="v-state"
              value={vendor.state}
              onChange={(e) => setVendor((v) => ({ ...v, state: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-min">Preço mínimo (R$)</Label>
            <Input
              id="v-min"
              type="number"
              value={vendor.minPrice}
              onChange={(e) => setVendor((v) => ({ ...v, minPrice: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-max">Preço máximo (R$)</Label>
            <Input
              id="v-max"
              type="number"
              value={vendor.maxPrice}
              onChange={(e) => setVendor((v) => ({ ...v, maxPrice: e.target.value }))}
            />
          </div>

          {message && (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary sm:col-span-2">
              {message}
            </div>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" className="rounded-full bg-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar cadastro"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
