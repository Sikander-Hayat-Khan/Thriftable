"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";

const ROUTE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/inventory": "Inventory",
  "/admin/customers": "Customers",
  "/admin/drops": "Drop Releases",
  "/admin/cms": "Storefront CMS",
  "/admin/reviews": "Reviews",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Store Settings",
};

export default function AdminTopbar({ setIsMobileOpen }) {
  const pathname = usePathname();

  // Find matching title
  const currentTitle =
    ROUTE_TITLES[pathname] ||
    Object.entries(ROUTE_TITLES).find(([route]) =>
      pathname.startsWith(route)
    )?.[1] ||
    "Overview";

  return (
    <header className="h-16 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Mobile Toggle & Dynamic Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger / Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-neutral-800 dark:text-neutral-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <svg className="w-5 h-5 text-[#B2A376]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Menu</span>
        </button>

        {/* Current Active Section Badge on Mobile */}
        <div className="flex lg:hidden items-center gap-1.5 text-xs font-mono">
          <span className="px-2 py-0.5 bg-[#B2A376]/15 border border-[#B2A376]/30 text-[#B2A376] font-bold uppercase rounded-xs">
            {currentTitle}
          </span>
        </div>

        {/* Desktop Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="text-neutral-900 dark:text-white font-bold uppercase">Archival Control</span>
          <span>/</span>
          <span className="text-[#B2A376] font-semibold uppercase">{currentTitle}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Live Store View Quick Link */}
        <Link
          href="/shop"
          target="_blank"
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-[#B2A376] border border-black/10 dark:border-white/10 hover:border-[#B2A376] transition-colors rounded-xs"
        >
          <span>Store</span>
          <span>↗</span>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Admin Avatar Badge */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-black/10 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-[#B2A376] text-black font-bold flex items-center justify-center text-xs font-mono shadow-xs">
            HQ
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-macsans font-bold text-neutral-900 dark:text-white leading-none">
              Super Admin
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              ● Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
