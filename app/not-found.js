"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0c0c0c] text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-137.5 h-137.5 bg-[#B2A376]/10 dark:bg-[#B2A376]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[3rem_3rem] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center space-y-8">
        {/* Floating Animated Archive Tag */}
        <motion.div
          animate={{
            y: [-8, 8, -8],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Tag String */}
          <div className="w-0.5 h-12 bg-neutral-400 dark:bg-neutral-600 mx-auto" />

          {/* Tag Body */}
          <div className="px-6 py-4 bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 shadow-2xl flex flex-col items-center gap-1 min-w-50">
            <div className="w-3 h-3 rounded-full border border-black/20 dark:border-white/20 mb-1" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-400">
              SPECIMEN STATUS
            </span>
            <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
              MISPLACED / NOT FOUND
            </span>
            <div className="w-full border-t border-dashed border-black/10 dark:border-white/10 my-1" />
            <span className="font-mono text-[9px] text-[#807248] dark:text-[#d3c59a]">
              CODE: ERR_ARCHIVE_404
            </span>
          </div>
        </motion.div>

        {/* Animated Big 404 Typography */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3"
        >
          <div className="relative inline-block">
            <h1 className="text-8xl sm:text-9xl font-logo font-black tracking-tight text-neutral-900 dark:text-white select-none">
              404
            </h1>
            <motion.span
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 -right-6 px-2.5 py-1 bg-[#B2A376] text-black font-mono text-[11px] uppercase tracking-widest font-bold rotate-6 shadow-md"
            >
              Archival Void
            </motion.span>
          </div>

          <h2 className="text-xl sm:text-2xl font-macsans font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
            This Piece Has Left The Vault
          </h2>
          <p className="text-xs sm:text-sm font-proda text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            The archive link you followed might have been sold out, moved to the private vault, or never existed in our collection.
          </p>
        </motion.div>

        {/* Quick Navigational Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-2"
        >
          <Link
            href="/"
            className="group relative w-full sm:w-auto px-8 py-3.5 bg-[#B2A376] text-black font-mono text-xs uppercase tracking-widest font-bold text-center overflow-hidden shadow-lg transition-all duration-300 active:scale-98 cursor-pointer"
          >
            <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
            <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
              ← Return Home
            </span>
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 border border-black/15 dark:border-white/15 hover:border-[#B2A376] text-neutral-800 dark:text-neutral-200 hover:text-[#B2A376] font-mono text-xs uppercase tracking-widest font-bold text-center transition-colors"
          >
            Explore Archive Catalog →
          </Link>
        </motion.div>

        {/* Suggestions Bar */}
        <div className="pt-6 border-t border-black/10 dark:border-white/10 w-full max-w-md">
          <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-3">
            Popular Destinations
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <Link
              href="/shop"
              className="px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-[#B2A376]/20 border border-black/5 dark:border-white/5 hover:border-[#B2A376]/40 text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              Curated Shop
            </Link>
            <Link
              href="/loyalty"
              className="px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-[#B2A376]/20 border border-black/5 dark:border-white/5 hover:border-[#B2A376]/40 text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              Thrift Club
            </Link>
            <Link
              href="/orders"
              className="px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-[#B2A376]/20 border border-black/5 dark:border-white/5 hover:border-[#B2A376]/40 text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              Track Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
