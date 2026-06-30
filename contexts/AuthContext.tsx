import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  /** Whether real Supabase credentials are wired up. */
  isConfigured: boolean;
  /** True until the initial session check resolves. */
  initializing: boolean;
  session: Session | null;
  user: User | null;
  /** Local preview mode used when no backend is connected. */
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, username: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setInitializing(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) {
      setIsDemo(true);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { error: error?.message ?? null };
  };

  const signUp = async (
    email: string,
    password: string,
    username: string
  ): Promise<AuthResult> => {
    if (!supabase) {
      setIsDemo(true);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { username: username.trim() } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    setIsDemo(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
  };

  const continueAsGuest = () => setIsDemo(true);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: isSupabaseConfigured,
      initializing,
      session,
      user: session?.user ?? null,
      isDemo,
      signIn,
      signUp,
      signOut,
      continueAsGuest,
    }),
    [initializing, session, isDemo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/** Convenience: user is either authenticated or exploring in demo mode. */
export function useIsAuthed(): boolean {
  const { session, isDemo } = useAuth();
  return !!session || isDemo;
}
