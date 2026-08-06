import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User, LogOut, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { EditableText } from "@/components/EditableText";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/servicos", label: "Serviços" },
  { to: "/galeria", label: "Galeria" },
  { to: "/sobre", label: "Sobre" },
  { to: "/depoimentos", label: "Depoimentos" },
];

export function Header() {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    void router.invalidate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          <EditableText contentKey="header.brand_name" defaultValue="Ateliê do Sim" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Store className="h-4 w-4" />
                Marketplace
              </Link>
              {isAdmin && (
                <Link
                  to="/perfil"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/perfil"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <User className="h-4 w-4" />
                Perfil
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Área do Noivo
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border" />
            {isAuthenticated ? (
              <>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 text-base font-medium text-foreground"
                >
                  <Store className="h-4 w-4" />
                  Marketplace
                </Link>
                <Link
                  to="/perfil"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 text-base font-medium text-foreground"
                >
                  <User className="h-4 w-4" />
                  Perfil
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    void handleSignOut();
                  }}
                  className="inline-flex items-center gap-2 text-left text-base font-medium text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-center text-base font-medium text-primary-foreground"
              >
                Área do Noivo
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
