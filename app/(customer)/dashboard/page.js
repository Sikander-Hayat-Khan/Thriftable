"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 text-center">
        <div className="w-8 h-8 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-400">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 sm:py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#B2A376]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-ink mb-3 font-logo tracking-wide">
          Customer Dashboard
        </h1>
        <p className="text-muted text-sm mb-8 max-w-md mx-auto">
          Please sign in to view your orders, loyalty points balance, saved items, and personalized recommendations.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?next=/dashboard"
            className="group relative inline-flex items-center px-8 py-3.5 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
          >
            <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
            <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
              Login to Account →
            </span>
          </Link>
          <Link
            href="/signup?next=/dashboard"
            className="inline-flex items-center px-6 py-3.5 border border-black/15 dark:border-white/15 hover:border-[#B2A376] text-neutral-900 dark:text-white font-mono text-xs uppercase tracking-widest transition-colors duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const userMetadata = user.user_metadata || {};
  const displayName =
    userMetadata.full_name ||
    userMetadata.name ||
    (user.email ? user.email.split("@")[0] : "Customer");
  const avatarUrl =
    userMetadata.avatar_url ||
    userMetadata.picture ||
    user?.identities?.find((id) => id.identity_data?.avatar_url || id.identity_data?.picture)?.identity_data?.avatar_url ||
    user?.identities?.find((id) => id.identity_data?.avatar_url || id.identity_data?.picture)?.identity_data?.picture;

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
      {/* Header Profile Banner */}
      <div className="p-8 rounded-3xl dark:bg-neutral-900/60 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#B2A376] text-black font-bold text-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              displayName[0]?.toUpperCase() || "U"
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl dark:text-white font-extrabold tracking-tight text-ink font-logo">
              Welcome, {displayName}
            </h1>
            <p className="text-xs text-muted mt-1">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          className="px-5 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/orders"
          className="group p-6 rounded-2xl bg-[#B4A57A] dark:bg-neutral-900/40 border border-transparent dark:border-white/10 hover:border-black dark:hover:border-[#B2A376]/50 transition-all duration-300"
        >
          <div className="text-sm uppercase font-extrabold tracking-widest text-black dark:text-white">01</div>
          <h3 className="text-lg font-bold mt-2 text-black group-hover:text-white transition-colors dark:text-[#B4A57A]">
            Order History
          </h3>
          <p className="text-sm text-white mt-1">Track current shipments and view previous receipts.</p>
        </Link>

        <Link
          href="/wishlist"
          className="group p-6 rounded-2xl bg-[#B4A57A] dark:bg-neutral-900/40 border border-transparent dark:border-white/10 hover:border-black dark:hover:border-[#B2A376]/50 transition-all duration-300"
        >
          <span className="text-sm uppercase font-extrabold tracking-widest text-black dark:text-white">02</span>
          <h3 className="text-lg font-bold mt-2 text-ink group-hover:text-white transition-colors dark:text-[#B4A57A]">
            Wishlist
          </h3>
          <p className="text-sm text-white mt-1">Saved vintage and archive fashion pieces.</p>
        </Link>

        <Link
          href="/loyalty"
          className="group p-6 rounded-2xl bg-[#B4A57A] dark:bg-neutral-900/40 border border-transparent dark:border-white/10 hover:border-black dark:hover:border-[#B2A376]/50 transition-all duration-300"
        >
          <span className="text-sm uppercase font-extrabold tracking-widest text-black dark:text-white">03</span>
          <h3 className="text-lg font-bold mt-2 text-ink group-hover:text-white transition-colors dark:text-[#B4A57A]">
            Loyalty Club
          </h3>
          <p className="text-sm text-white mt-1">Eco-rewards, point balance and tier perks.</p>
        </Link>
      </div>
    </div>
  );
}
