"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Pivot as Hamburger } from "hamburger-react";

const navLinks = [
  { href: "/shop", label: "Shop", num: "01" },
  { href: "/dashboard", label: "Dashboard", num: "02" },
  { href: "/wishlist", label: "Wishlist", num: "03" },
  { href: "/cart", label: "Cart", num: "04" },
  { href: "/admin/dashboard", label: "Admin", num: "05" },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      {/* Top Fixed Header with Glassmorphism Blurred Background */}
      <header
        className={`fixed top-0 left-0 right-0 z-60 transition-all duration-300 pointer-events-none ${
          isOpen
            ? "bg-transparent backdrop-blur-none border-transparent"
            : "bg-black/40 backdrop-blur-md border-b border-white/10"
        }`}
      >
        <div className="w-full px-6 sm:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="font-normal tracking-tight text-ink pointer-events-auto">
            <span className="text-2xl sm:text-2xl text-[#B2A376] font-logo font-extrabold tracking-widest">
              THRIFTABLE
            </span>
          </Link>

          {/* Single Hamburger Menu Toggle Button (transforms into cross on open) */}
          <div className="pointer-events-auto relative z-60">
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

      {/* Dark Backdrop Overlay when menu is open */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-700 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
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

        {/* Brand Footer Info */}
        <div className="text-xs uppercase tracking-widest text-black/60 pt-6 border-t border-black/15">
          Thriftable &copy; {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
}
