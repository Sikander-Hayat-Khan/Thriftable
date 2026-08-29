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

  const syncUserProfile = useCallback(
    async (currentUser) => {
      if (!currentUser?.id) return;
      const userEmail = currentUser.email?.trim().toLowerCase();
      const isSuperAdmin = userEmail === "skhan.bese23seecs@seecs.edu.pk";
      
      let userRole = isSuperAdmin ? "admin" : (currentUser.user_metadata?.role || "customer");

      // Verify if user is in backend admin roster
      try {
        const res = await fetch("/api/admin/users/role");
        if (res.ok) {
          const roleData = await res.json();
          const adminEmails = (roleData.adminEmails || []).map((e) => e.toLowerCase());
          const adminIds = roleData.adminIds || [];
          if (adminEmails.includes(userEmail) || adminIds.includes(currentUser.id)) {
            userRole = "admin";
          }
        }
      } catch {}

      const fullName =
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        currentUser.email?.split("@")[0] ||
        "Member";

      const baseProfile = {
        id: currentUser.id,
        full_name: fullName,
        email: currentUser.email,
        role: userRole,
        avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || "",
        updated_at: new Date().toISOString(),
      };

      // Try upserting base profile with role
      try {
        const { error } = await supabase.from("profiles").upsert(baseProfile, { onConflict: "id" });
        if (error) {
          // Fallback to minimal fields
          await supabase.from("profiles").upsert(
            {
              id: currentUser.id,
              email: currentUser.email,
              full_name: fullName,
              role: userRole,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        }
      } catch (err) {
        console.warn("Profiles auto-sync warning:", err);
      }

      // If super admin, ensure registered in backend role system
      if (isSuperAdmin) {
        fetch("/api/admin/users/role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id, email: currentUser.email, targetRole: "admin" }),
        }).catch(() => {});
      }
    },
    [supabase]
  );

  useEffect(() => {
    // Initial fetch of session and user
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        const initialUser = initialSession?.user ?? null;
        setUser(initialUser);
        if (initialUser) {
          syncUserProfile(initialUser);
        }
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

        if ((event === "SIGNED_IN" || event === "USER_UPDATED") && currentUser) {
          syncUserProfile(currentUser);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, syncUserProfile]);

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
      if (data?.user) {
        await syncUserProfile(data.user);
      }
      closeAuthModal();
      return data;
    },
    [supabase, closeAuthModal, syncUserProfile]
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
      if (data?.user) {
        await syncUserProfile(data.user);
      }

      return data;
    },
    [supabase, syncUserProfile]
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
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("thriftable_admin_auth");
      }
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out exception:", err);
    } finally {
      setUser(null);
      setSession(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
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
