import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, clearToken, loadToken, setToken } from "../lib/api";
import type { Profile } from "../types";

type AuthUser = Profile;

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  signOut: () => Promise<void>;
};

type TokenResponse = { access_token: string; user: AuthUser };

const DEMO_EMAIL = "demo@nutrisnap.app";
const DEMO_PASSWORD = "demo-nutrisnap-2026";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore a persisted session on launch.
  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (token) {
        try {
          const me = await api<AuthUser>("/auth/me");
          setUser(me);
        } catch {
          await clearToken();
        }
      }
      setLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        const res = await api<TokenResponse>("/auth/login", {
          method: "POST",
          auth: false,
          body: { email, password },
        });
        await setToken(res.access_token);
        setUser(res.user);
      },
      signUp: async (email, password, fullName) => {
        const res = await api<TokenResponse>("/auth/signup", {
          method: "POST",
          auth: false,
          body: { email, password, full_name: fullName || undefined },
        });
        await setToken(res.access_token);
        setUser(res.user);
      },
      demoLogin: async () => {
        // Log into the shared demo account, creating it on first use.
        let res: TokenResponse;
        try {
          res = await api<TokenResponse>("/auth/login", {
            method: "POST",
            auth: false,
            body: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
          });
        } catch {
          res = await api<TokenResponse>("/auth/signup", {
            method: "POST",
            auth: false,
            body: {
              email: DEMO_EMAIL,
              password: DEMO_PASSWORD,
              full_name: "Demo User",
            },
          });
        }
        await setToken(res.access_token);
        setUser(res.user);
      },
      signOut: async () => {
        await clearToken();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
