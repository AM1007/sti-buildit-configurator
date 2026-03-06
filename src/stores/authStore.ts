import { create } from "zustand";
import { supabase } from "../services/supabaseClient";
import type { AuthUser, AuthStatus, AuthProvider } from "../types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  initialize: () => () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

function mapSupabaseUser(user: SupabaseUser): AuthUser {
  const rawProvider = user.app_metadata?.provider ?? "email";
  const provider: AuthProvider = rawProvider === "google" ? "google" : "email";

  return {
    id: user.id,
    email: user.email ?? "",
    provider,
  };
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "idle",

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({ user: mapSupabaseUser(session.user), status: "authenticated" });
      } else {
        set({ user: null, status: "unauthenticated" });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          set({ user: mapSupabaseUser(session.user), status: "authenticated" });
        } else {
          set({ user: null, status: "unauthenticated" });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  },

  signInWithEmail: async (email, password) => {
    set({ status: "loading" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ status: "unauthenticated" });
      return { error: error.message };
    }
    return { error: null };
  },

  signUpWithEmail: async (email, password) => {
    set({ status: "loading" });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ status: "unauthenticated" });
      return { error: error.message };
    }
    return { error: null };
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, status: "unauthenticated" });
  },
}));

export const useUser = () => useAuthStore((s) => s.user);
export const useAuthStatus = () => useAuthStore((s) => s.status);
export const useIsAuthenticated = () => useAuthStore((s) => s.status === "authenticated");