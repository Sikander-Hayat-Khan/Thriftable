"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isAuthModalOpen: false,
  authModalTab: "signin",
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("signin");

  // Create a single Supabase browser client instance
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Initial fetch of session and user
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (err) {
        console.error("Error fetching auth session:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen to real-time auth changes (Sign in, Sign out, Token Refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        if (event === "SIGNED_IN" && currentUser) {
          try {
            await supabase.from("profiles").upsert(
              {
                id: currentUser.id,
                full_name:
                  currentUser.user_metadata?.full_name ||
                  currentUser.user_metadata?.name ||
                  "",
                email: currentUser.email,
                avatar_url: currentUser.user_metadata?.avatar_url || "",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );
          } catch (err) {
            console.warn("Profiles auto-sync notice:", err);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const openAuthModal = useCallback((tab = "signin") => {
    if (typeof window !== "undefined") {
      window.location.href = tab === "signup" ? "/signup" : "/login";
    }
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signInWithEmail = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      closeAuthModal();
      return data;
    },
    [supabase, closeAuthModal]
  );

  const signUpWithEmail = useCallback(
    async (email, password, fullName = "") => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName,
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });
      if (error) throw error;

      // 1. Dispatch Welcome Email
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "welcome",
            email: email,
            name: fullName || "Valued Member",
          }),
        });
      } catch (e) {
        console.warn("Welcome email exception:", e);
      }

      // 2. Sync profile to public.profiles table
      if (data?.user?.id) {
        try {
          await supabase.from("profiles").upsert(
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        } catch (e) {
          console.warn("Profile table upsert exception:", e);
        }
      }

      return data;
    },
    [supabase]
  );

  const signInWithGoogle = useCallback(
    async (redirectTo) => {
      const redirectUrl =
        redirectTo ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "/auth/callback");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
      return data;
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  }, [supabase]);

  const resetPassword = useCallback(
    async (email) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=/dashboard` : undefined,
      });
      if (error) throw error;
      return data;
    },
    [supabase]
  );

  const value = {
    user,
    session,
    loading,
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
