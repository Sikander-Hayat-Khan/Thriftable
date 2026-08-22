"use client";

import { useState } from "react";
import Link from "next/link";
import { Pivot as Hamburger } from "hamburger-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Cart" },
  { href: "/admin/dashboard", label: "Admin" },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  // SVG Path Morphing for 180° rotated "D" shape to rectangle
  // viewBox: 0 0 400 1000
  const dInitial = "M 400 0 Q 400 500 400 1000 L 400 1000 L 400 0 Z";
  const dCurve = "M 400 0 L 120 0 Q -180 500 120 1000 L 400 1000 Z"; // 180° rotated D curve bulge
  const dFlat = "M 400 0 L 0 0 Q 0 500 0 1000 L 400 1000 Z";         // Full rectangle

  const pathVariants = {
    initial: {
      d: dInitial,
    },
    animate: {
      d: [dInitial, dCurve, dFlat],
      transition: {
        duration: 0.75,
        times: [0, 0.45, 1],
        ease: [0.76, 0, 0.24, 1],
      },
    },
    exit: {
      d: [dFlat, dCurve, dInitial],
      transition: {
        duration: 0.65,
        times: [0, 0.55, 1],
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  const navListVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.25,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.04,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30, x: 20 },
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.25 },
    },
  };

  return (
    <>
      {/* Top Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-100 py-5 pointer-events-none">
        <div className="w-full px-6 sm:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-ink pointer-events-auto">
            <img src="/logo.png" alt="logo" width={110} />
          </Link>

          {/* Single Hamburger Menu Toggle Button (transforms into cross on open) */}
          <div className="pointer-events-auto">
            <Hamburger
              toggled={isOpen}
              toggle={setIsOpen}
              color={isOpen ? "#000000" : "#ffffff"}
              size={26}
              label="Toggle Menu"
            />
          </div>
        </div>
      </header>

      {/* Collapsible Sidebar Overlay & Drawer */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 cursor-pointer"
            />

            {/* Sidebar Drawer */}
            <div className="fixed top-0 right-0 h-screen w-[85vw] sm:w-[50vw] lg:w-[40vw] min-w-75 z-50 pointer-events-auto overflow-hidden">
              {/* Animated SVG Morphing Background */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 400 1000"
                preserveAspectRatio="none"
              >
                <motion.path
                  fill="#B2A376"
                  variants={pathVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
              </svg>

              {/* Sidebar Content */}
              <div className="relative z-10 flex flex-col justify-between h-full px-10 sm:px-14 pt-32 pb-12 text-black">
                {/* Vertical Navigation Links */}
                <motion.nav
                  className="flex flex-col gap-6"
                  variants={navListVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {navLinks.map((link) => (
                    <motion.div key={link.href} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="group inline-flex items-center text-3xl sm:text-4xl font-medium tracking-wide text-black hover:opacity-75 transition-all duration-200"
                      >
                        <span className="relative">
                          {link.label}
                          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>

                {/* Brand Footer Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-xs uppercase tracking-widest text-black/60 pt-6 border-t border-black/15"
                >
                  Thriftable &copy; {new Date().getFullYear()}
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
