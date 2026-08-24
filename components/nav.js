"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Pivot as Hamburger } from "hamburger-react";
import ThemeToggle from "./theme-toggle";
import { useTheme } from "./theme-provider";
import { useCart } from "./cart-provider";
import CartDrawer from "./cart-drawer";

const navLinks = [
  { href: "/shop", label: "Shop", num: "01" },
  { href: "/dashboard", label: "Dashboard", num: "02" },
  { href: "/wishlist", label: "Wishlist", num: "03" },
  { href: "/cart", label: "Cart", num: "04" },
  { href: "/admin/dashboard", label: "Admin", num: "05" },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, mounted } = useTheme();
  const { openCart, cartCount } = useCart();

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  return (
    <>
      {/* Top Fixed Header with Consistent Theme-Agnostic Background */}
      <header
        className={`fixed top-0 left-0 right-0 z-60 transition-all duration-500 pointer-events-none ${
          isOpen
            ? "bg-transparent backdrop-blur-none border-transparent"
            : "bg-black/10 backdrop-blur-md border-b border-white/10 shadow-md"
        }`}
      >
        <div className="w-full px-6 sm:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="font-normal tracking-tight text-ink pointer-events-auto">
            <span className="text-2xl sm:text-2xl text-[#B2A376] font-logo font-extrabold tracking-widest">
              THRIFTABLE
            </span>
          </Link>

          {/* Right Controls: Cart, Theme Toggle & Hamburger Button */}
          <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3.5 relative z-60">
            {!isOpen && (
              <button
                type="button"
                onClick={openCart}
                aria-label="Open Shopping Cart"
                title="Shopping Cart"
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 focus:outline-none cursor-pointer group bg-black/20 hover:bg-black/30 text-white dark:hover:bg-white/20 border border-white/15 backdrop-blur-md active:scale-95 shadow-sm hover:text-white"
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
            )}
            {!isOpen && <ThemeToggle />}
            <Hamburger
              toggled={isOpen}
              toggle={setIsOpen}
              color={isOpen ? "#000000" : "#ffffff"}
              size={26}
              duration={0.8}
              rounded
              label="Toggle Navigation Menu"
            />
          </div>
        </div>
      </header>

      {/* 40vw Right-Side Sliding Shopping Cart Drawer */}
      <CartDrawer />

      {/* Non-blocking Dark Backdrop Overlay (Passes scroll gestures through to background) */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-700 pointer-events-none ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar Drawer with Flipped D to Rectangle Shape Morphing Transition */}
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
        {/* Top Logo inside Collapsible Drawer */}
        <div className="pt-2">
          <Link href="/" onClick={() => setIsOpen(false)} className="font-normal tracking-tight text-black inline-block">
            <span className="text-2xl sm:text-4xl text-black font-logo font-extrabold tracking-widest">
              THRIFTABLE
            </span>
          </Link>
        </div>

        {/* Vertical Navigation Links */}
        <nav className="flex flex-col gap-6 my-auto">
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
