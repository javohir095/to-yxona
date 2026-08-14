import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/entities";

export type AuthProfile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  venue_id: string | null;
  venue: { name: string } | null;
};

type AuthContextValue = {
  session: Session | null;
  profile: AuthProfile | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setSessionLoaded(true);
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    });

    return () => listener.subscription.unsubscribe();
  }, [queryClient]);

  const userId = session?.user.id;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, venue_id, venue:venues(name)")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as AuthProfile | null;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  const isLoading = !sessionLoaded || (!!userId && profileLoading);

  return (
    <AuthContext.Provider value={{ session, profile: profile ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
