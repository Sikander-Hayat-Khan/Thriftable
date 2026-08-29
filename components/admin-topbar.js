"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

export default function AdminTopbar({ setIsMobileOpen }) {
  return (
    <header className="h-16 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between">
      {/* Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="text-neutral-900 dark:text-white font-bold uppercase">Archival Control</span>
          <span>/</span>
          <span className="text-[#B2A376]">Operational Hub</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Live Store View Quick Link */}
        <Link
          href="/shop"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-[#B2A376] border border-black/10 dark:border-white/10 hover:border-[#B2A376] transition-colors"
        >
          <span>Live Shop</span>
          <span>↗</span>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Admin Avatar Badge */}
        <div className="flex items-center gap-2 pl-3 border-l border-black/10 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-[#B2A376] text-black font-bold flex items-center justify-center text-xs font-mono">
            HQ
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-macsans font-bold text-neutral-900 dark:text-white leading-none">
              Super Admin
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              ● Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
