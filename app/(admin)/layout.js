"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/admin-sidebar";
import AdminTopbar from "@/components/admin-topbar";
import { createClient } from "@/utils/supabase/client";

export default function AdminLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(null); // null = checking, true, false
  const [currentUser, setCurrentUser] = useState(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function verifyAdminAccess() {
      try {
        // 1. Check Supabase authenticated user
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          setIsAuthorized(false);
          return;
        }

        setCurrentUser(user);

        // 2. Check user metadata or super admin email
        const userEmail = (user.email || "").toLowerCase().trim();
        const userRole = user.user_metadata?.role;

        if (
          userRole === "admin" ||
          userEmail === "skhan.bese23seecs@seecs.edu.pk"
        ) {
          setIsAuthorized(true);
          // Sync database role to admin
          fetch("/api/admin/users/role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, email: userEmail, targetRole: "admin" }),
          }).catch(() => {});
          return;
        }

        // 3. Query profiles table in Supabase by user.id or email
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .or(`id.eq.${user.id},email.eq.${userEmail}`)
          .maybeSingle();

        if (profile && (String(profile.role).toLowerCase() === "admin" || profile.is_admin === true)) {
          setIsAuthorized(true);
          return;
        }

        // 4. Query dynamic admin roster from API / store_settings
        try {
          const res = await fetch("/api/admin/users/role");
          if (res.ok) {
            const roleData = await res.json();
            const adminEmails = (roleData.adminEmails || []).map((e) => e.toLowerCase().trim());
            const adminIds = (roleData.adminIds || []);

            if (adminEmails.includes(userEmail) || adminIds.includes(user.id)) {
              setIsAuthorized(true);
              return;
            }
          }
        } catch {}

        setIsAuthorized(false);
      } catch (e) {
        console.warn("Admin authorization verification error:", e);
        setIsAuthorized(false);
      }
    }

    verifyAdminAccess();
  }, [supabase]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          Verifying Administrator Clearance...
        </p>
      </div>
    );
  }

  // 403 Forbidden Access Screen for unauthorized users & guests (No passcode inputs allowed)
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden select-none">
        {/* Background Subtle Gradient & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#241f14,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[4rem_4rem] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-lg w-full border border-red-500/30 bg-black/90 p-8 sm:p-10 text-center shadow-2xl space-y-6 backdrop-blur-xl"
        >
          {/* Pulsing Security Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-red-500/15 border border-red-500/30 text-[10px] font-mono uppercase tracking-[0.25em] text-red-400 font-bold inline-block">
              403 • Unauthorized Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-logo font-bold uppercase tracking-wider text-white">
              Admin Access Restricted
            </h1>
            <p className="text-xs sm:text-sm font-proda text-neutral-400 leading-relaxed max-w-md mx-auto">
              {currentUser
                ? `You are signed in as ${currentUser.email}. This user does not possess administrative clearance to access Thriftable HQ operations.`
                : "Guest access to the operational control portal is strictly prohibited. You must be authenticated with verified administrator credentials."}
            </p>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/10">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs uppercase tracking-widest transition-colors font-mono"
            >
              ← Return to Storefront
            </Link>
            <Link
              href="/login?redirect=/admin/dashboard"
              className="w-full sm:w-auto px-6 py-3 border border-white/20 text-neutral-300 font-mono text-xs uppercase tracking-widest hover:text-white hover:border-[#B2A376] transition-colors"
            >
              Administrator Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {/* Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <AdminTopbar setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
