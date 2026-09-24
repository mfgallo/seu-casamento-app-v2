import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { apiMe, type AppRole } from "@/lib/auth-api";
import { getStoredTokens, setStoredTokens } from "@/lib/api-client";

export type UserRole = AppRole;

export type AuthUser = {
  id: string;
  email: string;
};

export interface AuthContextValue {
  user: AuthUser | null;
  roles: UserRole[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setUser(null);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      const me = await apiMe();
      setUser({ id: me.user_id, email: me.email });
      setRoles(me.roles);
    } catch {
      // token invalido/expirado - limpa a sessao local
      setStoredTokens(null);
      setUser(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const signOut = () => {
    setStoredTokens(null);
    setUser(null);
    setRoles([]);
    router.navigate({ to: "/", replace: true });
  };

  const refresh = async () => {
    await load();
    router.invalidate();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: roles.includes("admin"),
        refresh,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
