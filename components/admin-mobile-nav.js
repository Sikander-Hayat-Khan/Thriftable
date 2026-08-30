"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const PRIMARY_MOBILE_TABS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    label: "CMS",
    href: "/admin/cms",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

const OTHER_ROUTES = [
  "/admin/customers",
  "/admin/reviews",
  "/admin/drops",
  "/admin/analytics",
  "/admin/settings",
];

export default function AdminMobileNav({ setIsMobileOpen, isMobileOpen }) {
  const pathname = usePathname();

  const isOtherActive = OTHER_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <nav
      aria-label="Admin Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-white/10 backdrop-blur-xl px-2 py-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto gap-1">
        {PRIMARY_MOBILE_TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/admin/dashboard" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-md transition-colors ${
                isActive
                  ? "text-[#B2A376]"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="adminMobileActivePill"
                  className="absolute inset-0 bg-[#B2A376]/10 rounded-md border border-[#B2A376]/30"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span
                className={`relative z-10 text-[10px] font-mono uppercase tracking-tight mt-1 truncate ${
                  isActive ? "font-bold text-[#B2A376]" : "font-normal"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* All Sections / Menu Trigger */}
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-md transition-colors cursor-pointer ${
            isMobileOpen || isOtherActive
              ? "text-[#B2A376]"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
          aria-label="Open Admin Sections Drawer"
          aria-expanded={isMobileOpen}
        >
          {(isMobileOpen || isOtherActive) && (
            <div className="absolute inset-0 bg-[#B2A376]/10 rounded-md border border-[#B2A376]/30" />
          )}
          <span className="relative z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
          <span
            className={`relative z-10 text-[10px] font-mono uppercase tracking-tight mt-1 flex items-center gap-1 ${
              isMobileOpen || isOtherActive ? "font-bold text-[#B2A376]" : "font-normal"
            }`}
          >
            <span>Sections</span>
            {isOtherActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#B2A376]" />
            )}
          </span>
        </button>
      </div>
    </nav>
  );
}
