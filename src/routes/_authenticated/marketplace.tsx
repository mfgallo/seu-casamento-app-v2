import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, MapPin, ArrowRight, Store } from "lucide-react";
import { listApprovedVendors, listCategories } from "@/lib/marketplace.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Ateliê do Sim" },
      {
        name: "description",
        content: "Marketplace exclusivo de fornecedores para noivos da Ateliê do Sim.",
      },
      { property: "og:title", content: "Marketplace — Ateliê do Sim" },
      {
        property: "og:description",
        content: "Marketplace exclusivo de fornecedores para noivos da Ateliê do Sim.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["categories"],
      queryFn: () => listCategories(),
    });
  },
  component: MarketplacePage,
});

function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: categories } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const { data: vendors } = useSuspenseQuery({
    queryKey: ["vendors", selectedCategory, search],
    queryFn: () =>
      listApprovedVendors({
        data: {
          categorySlug: selectedCategory ?? undefined,
          search: search || undefined,
        },
      }),
  });

  return (
    <div className="flex flex-col">
      <section className="bg-secondary/30 py-12 sm:py-16">
        <div className="container-tight">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-olive-muted">
                Exclusivo para noivos
              </p>
              <h1 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">
                Marketplace de Fornecedores
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Nossa curadoria especial de profissionais validados para o seu casamento.
              </p>
            </div>
            <Link to="/perfil">
              <Button variant="outline" className="rounded-full border-olive/30 text-olive">
                Meu perfil
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background py-8">
        <div className="container-tight">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <aside className="w-full shrink-0 lg:w-64">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-display font-medium text-foreground">Categorias</h3>
                <div className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:items-start">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors lg:rounded-lg lg:px-0 ${
                      selectedCategory === null
                        ? "bg-primary text-primary-foreground lg:bg-transparent lg:text-olive lg:font-medium"
                        : "bg-secondary text-foreground hover:bg-secondary/80 lg:bg-transparent lg:hover:text-olive"
                    }`}
                  >
                    Todas
                  </button>
                  {categories?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`rounded-full px-3 py-1.5 text-sm transition-colors lg:rounded-lg lg:px-0 ${
                        selectedCategory === category.slug
                          ? "bg-primary text-primary-foreground lg:bg-transparent lg:text-olive lg:font-medium"
                          : "bg-secondary text-foreground hover:bg-secondary/80 lg:bg-transparent lg:hover:text-olive"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar fornecedores..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-full border-border pl-10"
                />
              </div>

              {vendors && vendors.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {vendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-olive/30 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl font-medium text-foreground">
                            {vendor.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {(vendor.categories as { name?: string })?.name ?? "Fornecedor"}
                          </p>
                        </div>
                        {vendor.featured && (
                          <Badge className="bg-olive text-primary-foreground">Destaque</Badge>
                        )}
                      </div>

                      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {vendor.description}
                      </p>

                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {(vendor.city || vendor.state) && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                          </div>
                        )}
                        {(vendor.min_price || vendor.max_price) && (
                          <div className="flex items-center gap-1.5">
                            <Store className="h-3.5 w-3.5" />
                            {vendor.min_price && `A partir de R$ ${vendor.min_price}`}
                            {vendor.min_price && vendor.max_price && " — "}
                            {vendor.max_price && `R$ ${vendor.max_price}`}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-olive/30 text-olive hover:bg-olive/5"
                          asChild
                        >
                          <a
                            href={`mailto:${vendor.contact_email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Contatar
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                        {vendor.website_url && (
                          <Button variant="ghost" size="sm" className="rounded-full" asChild>
                            <a href={vendor.website_url} target="_blank" rel="noopener noreferrer">
                              Site
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                  <Store className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <h3 className="mt-4 font-display text-lg font-medium text-foreground">
                    Nenhum fornecedor encontrado
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tente ajustar os filtros ou volte mais tarde.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
