"use client";

import { useTheme } from "./theme-provider";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle({ className = "", isDrawer = false }) {
  const { theme, toggleTheme, isTransitioning, mounted } = useTheme();

  if (!mounted) {
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isDrawer ? "bg-black/10" : "bg-white/10"
        } ${className}`}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      disabled={isTransitioning}
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex items-center justify-center md:w-10 md:h-10 w-7 h-7 rounded-full transition-all duration-300 focus:outline-none cursor-pointer disabled:opacity-75 group ${
        isDrawer
          ? "bg-black/10 hover:bg-black/20 text-black border border-black/15 active:scale-95"
          : "bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md active:scale-95 shadow-sm"
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.svg
            key="moon-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`w-4 h-4 ${isDrawer ? "text-black" : "text-white"}`}
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ scale: 0, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: -90, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`w-4 h-4 ${isDrawer ? "text-black" : "text-amber-500"}`}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
