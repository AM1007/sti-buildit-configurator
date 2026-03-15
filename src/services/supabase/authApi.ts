import { supabase } from "../supabaseClient";
import type { AuthProvider, AuthUser } from "../../types";
import type { User as SupabaseUser, AuthChangeEvent } from "@supabase/supabase-js";

export function mapSupabaseUser(user: SupabaseUser): AuthUser {
  const rawProvider = user.app_metadata?.provider ?? "email";
  const provider: AuthProvider = rawProvider === "google" ? "google" : "email";
  return {
    id: user.id,
    email: user.email ?? "",
    provider,
  };
}

export function subscribeToAuthChanges(
  onAuthenticated: (user: AuthUser) => void,
  onUnauthenticated: () => void,
): () => void {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      onAuthenticated(mapSupabaseUser(session.user));
    } else {
      onUnauthenticated();
    }
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      onAuthenticated(mapSupabaseUser(session.user));
    } else {
      onUnauthenticated();
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}

export function subscribeToAuthEvent(
  event: AuthChangeEvent,
  onEvent: () => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((authEvent) => {
    if (authEvent === event) {
      onEvent();
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  return { error: error?.message ?? null };
}

export async function resetPassword(
  email: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });
  return { error: error?.message ?? null };
}

export async function updatePassword(
  newPassword: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}