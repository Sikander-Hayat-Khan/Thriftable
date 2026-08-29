"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pivot as Hamburger } from "hamburger-react";
import ThemeToggle from "./theme-toggle";
import { useTheme } from "./theme-provider";
import { useCart } from "./cart-provider";
import { useAuth } from "./auth-provider";
import { useWishlist } from "./wishlist-provider";
import CartDrawer from "./cart-drawer";

const navLinks = [
  { href: "/shop", label: "Shop", num: "01" },
  { href: "/dashboard", label: "Dashboard", num: "02" },
  { href: "/wishlist", label: "Wishlist", num: "03" },
  { href: "/cart", label: "Cart", num: "04" },
  { href: "/admin/dashboard", label: "Admin", num: "05" },
];

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { theme, mounted } = useTheme();
  const { openCart, cartCount } = useCart();
  const { user, signOut } = useAuth();
  const { wishlistCount } = useWishlist();

  const [isMd, setIsMd] = useState(true);

  // Do not render navbar on authentication pages
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/register";

  // Track md screen breakpoint for responsive hamburger size (26 on md+, 20 on mobile)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setIsMd(mediaQuery.matches);
    const handler = (e) => setIsMd(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [isUserMenuOpen]);

  // Close menu on click outside while keeping background scrollable
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e) => {
      const drawer = document.querySelector("aside[aria-label='Navigation Sidebar']");
      const header = document.querySelector("header");
      if (drawer && !drawer.contains(e.target) && header && !header.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const isDark = mounted ? theme === "dark" : true;

  // Extract avatar / initials / display name
  const userMetadata = user?.user_metadata || {};
  const userName =
    userMetadata.full_name ||
    userMetadata.name ||
    (user?.email ? user.email.split("@")[0] : "User");
  const avatarUrl =
    userMetadata.avatar_url ||
    userMetadata.picture ||
    user?.identities?.find((id) => id.identity_data?.avatar_url || id.identity_data?.picture)?.identity_data?.avatar_url ||
    user?.identities?.find((id) => id.identity_data?.avatar_url || id.identity_data?.picture)?.identity_data?.picture;
  const initial = (userName ? userName[0] : "U").toUpperCase();

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    setIsOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <>
      {/* Top Fixed Header with Consistent Theme-Agnostic Background */}
      <header
        className={`fixed top-0 left-0 right-0 z-60 transition-all duration-500 pointer-events-none ${
          isAuthPage
            ? "bg-transparent backdrop-blur-none border-transparent"
            : isOpen
            ? "bg-transparent backdrop-blur-none border-transparent"
            : "bg-black sm:bg-black/10 backdrop-blur-md border-b border-white/10 shadow-md"
        }`}
      >
        <div className="w-full px-6 sm:px-12 h-16 flex items-center justify-between">
          {!isAuthPage ? (
            <Link href="/" className="font-normal tracking-tight text-ink pointer-events-auto">
              <span className="text-xl sm:text-2xl text-[#B2A376] font-logo font-extrabold tracking-widest">
                THRIFTABLE
              </span>
            </Link>
          ) : (
            <div />
          )}

          {/* Right Controls: Auth, Cart, Theme Toggle & Hamburger Button */}
          <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3.5 relative z-60 ml-auto">
            {!isOpen && !isAuthPage && (
              <>

                {/* Cart Button */}
                <button
                  type="button"
                  onClick={openCart}
                  aria-label="Open Shopping Cart"
                  title="Shopping Cart"
                  className="relative inline-flex items-center justify-center md:w-10 md:h-10 w-7 h-7 rounded-full transition-all duration-300 focus:outline-none cursor-pointer group bg-black/20 hover:bg-black/30 text-white dark:hover:bg-white/20 border border-white/15 backdrop-blur-md active:scale-95 shadow-sm hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#B2A376] text-black text-[9px] font-bold rounded-full flex items-center justify-center font-mono shadow-md pointer-events-none">
                      {cartCount}
                    </span>
                  )}
                </button>

                <ThemeToggle />
                {/* User Auth Control */}
                <div className="relative" ref={userMenuRef}>
                  {user ? (
                    <button
                      type="button"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      aria-label="User Account Menu"
                      title={userName}
                      className="relative inline-flex items-center justify-center md:w-10 md:h-10 w-7 h-7 rounded-full transition-all duration-300 focus:outline-none cursor-pointer group bg-black/20 hover:bg-black/30 text-white dark:hover:bg-white/20 border border-[#B2A376]/40 backdrop-blur-md active:scale-95 shadow-sm overflow-hidden mt-1"
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={userName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#B2A376]">
                          {initial}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      aria-label="Sign In"
                      title="Sign In / Register"
                      className="relative inline-flex items-center justify-center h-10 px-3.5 sm:px-4 rounded-full transition-all duration-300 focus:outline-none cursor-pointer group bg-black/20 hover:bg-black/30 text-white dark:hover:bg-white/20 border border-white/15 backdrop-blur-md active:scale-95 shadow-sm gap-2 text-xs font-semibold uppercase tracking-wider"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-white"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="hidden sm:inline">Login</span>
                    </Link>
                  )}

                  {/* Dropdown Menu when Signed In */}
                  {user && isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-neutral-900/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-70 text-white animate-fadeIn">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-xs font-bold text-[#B2A376] truncate">
                          {userName}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4 text-[#B2A376]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect width="7" height="9" x="3" y="3" rx="1" />
                            <rect width="7" height="5" x="14" y="3" rx="1" />
                            <rect width="7" height="9" x="14" y="12" rx="1" />
                            <rect width="7" height="5" x="3" y="16" rx="1" />
                          </svg>
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4 text-[#B2A376]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>My Orders</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-[#B2A376]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>Wishlist</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-[#B2A376] text-black text-[9px] font-bold rounded-full font-mono">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-white/10">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <Hamburger
              toggled={isOpen}
              toggle={setIsOpen}
              color={isOpen ? "#000000" : isAuthPage ? (isDark ? "#ffffff" : "#000000") : "#ffffff"}
              size={isMd ? 26 : 20}
              duration={0.8}
              rounded
              label="Toggle Navigation Menu"
            />
          </div>
        </div>
      </header>

      {/* 40vw Right-Side Sliding Shopping Cart Drawer */}
      <CartDrawer />

      {/* Non-blocking Dark Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-700 pointer-events-none ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar Drawer with Morphing Transition */}
      <aside
        aria-label="Navigation Sidebar"
        className={`fixed top-0 right-0 h-screen w-[85vw] sm:w-[50vw] lg:w-[40vw] min-w-75 bg-[#B2A376] z-50 pointer-events-auto overflow-hidden shadow-2xl flex flex-col justify-between px-10 sm:px-14 pt-8 pb-12 text-black transform transition-all duration-200 ease-in-out ${
          isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{
          backgroundColor: "#B2A376",
          borderTopLeftRadius: isOpen ? "0px" : "100%",
          borderBottomLeftRadius: isOpen ? "0px" : "100% 50%",
          transitionProperty: "transform, border-radius, opacity",
          transitionDuration: "1200ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Top Logo & User Card inside Collapsible Drawer */}
        <div className="pt-2">
          <Link href="/" onClick={() => setIsOpen(false)} className="font-normal tracking-tight text-black inline-block">
            <span className="text-2xl sm:text-4xl text-black font-logo font-extrabold tracking-widest">
              THRIFTABLE
            </span>
          </Link>

          {/* User state preview in sidebar */}
          {user ? (
            <div className="mt-4 p-3 bg-black/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-black text-[#B2A376] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-black/20">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={userName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <div className="truncate text-left">
                  <p className="text-xs font-bold leading-tight truncate">{userName}</p>
                  <p className="text-[10px] opacity-75 truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-black text-white rounded-lg hover:bg-black/80 transition-colors shrink-0 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 px-3 bg-black text-white text-center font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-black/90 transition-all cursor-pointer shadow-md"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 px-3 bg-black/10 text-black border border-black/20 text-center font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-black/20 transition-all cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Vertical Navigation Links */}
        <nav className="flex flex-col gap-5 my-auto">
          {navLinks.map((link, idx) => (
            <div key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="group inline-flex items-start gap-3 text-3xl sm:text-4xl font-medium tracking-wide text-black hover:opacity-75 transition-all duration-200"
                style={{
                  transitionDelay: isOpen ? `${idx * 60 + 200}ms` : "0ms",
                }}
              >
                <span className="text-xs sm:text-sm font-extrabold tracking-wider text-black pt-1">
                  {link.num}
                </span>
                <span className="relative">
                  {link.label}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            </div>
          ))}
        </nav>

        {/* Brand Footer Info & Theme Control */}
        <div className="flex items-center justify-between pt-6 border-t border-black/15">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase font-extrabold tracking-widest text-black/80">
              Appearance
            </span>
            <span className="text-[11px] uppercase tracking-wider text-black/60">
              {isDark ? "Dark" : "Light"} Mode
            </span>
          </div>
          <ThemeToggle isDrawer />
        </div>
      </aside>
    </>
  );
}
