"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  const checkScroll = useCallback(() => {
    // Check window scroll
    const windowScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // Check any scrollable main container (e.g. landing page snap scroll container)
    let containerScroll = 0;
    const mainEl = document.querySelector("main");
    if (mainEl && mainEl.scrollTop) {
      containerScroll = mainEl.scrollTop;
    }

    const currentScroll = Math.max(windowScroll, containerScroll);
    if (currentScroll > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    // Check initial scroll state
    checkScroll();

    // Listen on window and capture scroll on any child containers
    window.addEventListener("scroll", checkScroll, { passive: true, capture: true });
    
    return () => {
      window.removeEventListener("scroll", checkScroll, { capture: true });
    };
  }, [checkScroll, pathname]);

  const handleScrollToTop = () => {
    // 1. Scroll window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    // 2. Scroll documentElement / body
    if (document.documentElement) {
      document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }

    // 3. Scroll main container if it has its own overflow scrolling
    const mainEl = document.querySelector("main");
    if (mainEl && typeof mainEl.scrollTo === "function") {
      mainEl.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }

    // 4. Scroll any other scrollable containers on the page
    const scrollContainers = document.querySelectorAll('[class*="overflow-y"]');
    scrollContainers.forEach((el) => {
      if (typeof el.scrollTo === "function") {
        el.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={handleScrollToTop}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Scroll to top of page"
          title="Back to top"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/80 dark:bg-neutral-900/80 hover:bg-[#B2A376] dark:hover:bg-[#B2A376] text-white dark:text-neutral-100 hover:text-black dark:hover:text-black border border-white/20 dark:border-white/15 hover:border-[#B2A376] shadow-2xl backdrop-blur-md transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B2A376] focus-visible:ring-offset-2 select-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 transition-transform duration-300"
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
