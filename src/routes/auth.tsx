import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { signIn, signUp } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Área do Noivo — Ateliê do Sim" },
      {
        name: "description",
        content: "Entre ou cadastre-se na área exclusiva de noivos da Ateliê do Sim.",
      },
      { property: "og:title", content: "Área do Noivo — Ateliê do Sim" },
      {
        property: "og:description",
        content: "Entre ou cadastre-se na área exclusiva de noivos da Ateliê do Sim.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-olive" />
      </div>
    );
  }

  if (isAuthenticated) {
    void router.navigate({ to: "/marketplace", replace: true });
    return null;
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-secondary/30 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-medium text-foreground">Área do Noivo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesse o marketplace exclusivo e gerencie seu casamento.
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn({ data: { email, password } });
      if (result.ok) {
        await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        });
        void router.navigate({ to: "/marketplace", replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full rounded-full bg-primary" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [role, setRole] = useState<"noivo" | "fornecedor">("noivo");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signUp({ data: { email, password, fullName, role, phone, weddingDate, partnerName } });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <Heart className="mx-auto h-8 w-8 text-olive" />
        <h3 className="mt-4 font-display text-xl font-medium">Cadastro realizado!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua conta foi criada. Agora você pode fazer login e acessar a área exclusiva.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          placeholder="Seu nome"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registerEmail">Email</Label>
        <Input
          id="registerEmail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registerPassword">Senha</Label>
        <Input
          id="registerPassword"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weddingDate">Data do casamento</Label>
        <Input
          id="weddingDate"
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="partnerName">Nome do(a) parceiro(a)</Label>
        <Input
          id="partnerName"
          placeholder="Nome de quem vai casar com você"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de conta</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("noivo")}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              role === "noivo"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-secondary"
            }`}
          >
            Noivo(a)
          </button>
          <button
            type="button"
            onClick={() => setRole("fornecedor")}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              role === "fornecedor"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-secondary"
            }`}
          >
            Fornecedor
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full rounded-full bg-primary" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
      </Button>
    </form>
  );
}
