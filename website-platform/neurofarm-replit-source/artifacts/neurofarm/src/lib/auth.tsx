import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://bbxhhtpmbtgfaxamgksf.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyHS";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type NeurofarmUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  fullName: string | null;
};

type FarmAuthState = {
  loading: boolean;
  isAdmin: boolean;
  user: NeurofarmUser | null;
  signOut: () => Promise<void>;
};

const FarmAuthContext = createContext<FarmAuthState>({
  loading: true,
  isAdmin: false,
  user: null,
  signOut: async () => {},
});

function isAdministrator(role: string | null | undefined) {
  return ["admin", "administrator", "администратор"].includes(String(role || "").trim().toLowerCase());
}

export function FarmAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<FarmAuthState, "signOut">>({ loading: true, isAdmin: false, user: null });

  useEffect(() => {
    let active = true;
    setAuthTokenGetter(async () => (await supabase.auth.getSession()).data.session?.access_token || null);

    const loadSession = async (session: Session | null) => {
      if (!session) {
        if (active) setState({ loading: false, isAdmin: false, user: null });
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;
      const firstName = profile?.first_name || null;
      const lastName = profile?.last_name || null;
      setState({
        loading: false,
        isAdmin: !error && isAdministrator(profile?.role),
        user: {
          id: session.user.id,
          email: session.user.email || null,
          firstName,
          fullName: [firstName, lastName].filter(Boolean).join(" ") || session.user.email || null,
        },
      });
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        if (active) setState({ loading: false, isAdmin: false, user: null });
        return;
      }
      return loadSession(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void loadSession(session), 0);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      setAuthTokenGetter(null);
    };
  }, []);

  const value = useMemo<FarmAuthState>(() => ({
    ...state,
    signOut: async () => { await supabase.auth.signOut(); },
  }), [state]);

  return <FarmAuthContext.Provider value={value}>{children}</FarmAuthContext.Provider>;
}

export function useFarmAuth() {
  return useContext(FarmAuthContext);
}