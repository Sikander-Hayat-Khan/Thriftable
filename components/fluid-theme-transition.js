"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function FluidThemeTransition({ isTransitioning, targetTheme, onComplete }) {
  const isTargetDark = targetTheme === "dark";
  const fluidBgColor = isTargetDark ? "#171717" : "#f6f5f1";

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="fluid-curtain-container"
          className="fixed inset-x-0 top-0 h-screen z-[9990] pointer-events-none flex flex-col"
          initial={{ y: "-100%" }}
          animate={{ y: "0%" }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" },
          }}
          transition={{
            duration: 1.4,
            ease: [0.65, 0, 0.35, 1], // Smooth, cinematic slow fluid sweep
          }}
          onAnimationComplete={onComplete}
        >
          {/* Solid Liquid Curtain Body */}
          <div
            className="w-full flex-1"
            style={{ backgroundColor: fluidBgColor }}
          />

          {/* Undulating Fluid Wave Front (Leading Edge at Bottom) */}
          <div
            className="relative w-full h-32 sm:h-44 -mt-1 shrink-0 overflow-visible"
            style={{ filter: "drop-shadow(0 12px 24px rgba(178, 163, 118, 0.25))" }}
          >
            {/* Layer 1: Translucent Brand Accent Gold Shimmer Wave */}
            <svg
              className="absolute top-0 left-0 w-full h-full text-[#B2A376] opacity-40 overflow-visible pointer-events-none"
              viewBox="0 0 1440 140"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <motion.path
                animate={{
                  d: [
                    "M 0 0 L 1440 0 L 1440 70 Q 1080 140, 720 70 T 0 70 Z",
                    "M 0 0 L 1440 0 L 1440 110 Q 1080 50, 720 120 T 0 110 Z",
                    "M 0 0 L 1440 0 L 1440 60 Q 1080 100, 720 30 T 0 60 Z",
                    "M 0 0 L 1440 0 L 1440 70 Q 1080 140, 720 70 T 0 70 Z",
                  ],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>

            {/* Layer 2: Main Solid Theme Fluid Wave Crest */}
            <svg
              className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none"
              style={{ color: fluidBgColor }}
              viewBox="0 0 1440 140"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <motion.path
                animate={{
                  d: [
                    "M 0 0 L 1440 0 L 1440 45 Q 1080 115, 720 45 T 0 45 Z",
                    "M 0 0 L 1440 0 L 1440 85 Q 1080 25, 720 95 T 0 85 Z",
                    "M 0 0 L 1440 0 L 1440 35 Q 1080 75, 720 15 T 0 35 Z",
                    "M 0 0 L 1440 0 L 1440 45 Q 1080 115, 720 45 T 0 45 Z",
                  ],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>

            {/* Glowing Fluid Droplet / Accent Crest Line */}
            <svg
              className="absolute top-0 left-0 w-full h-full text-[#B2A376]/70 overflow-visible pointer-events-none"
              viewBox="0 0 1440 140"
              preserveAspectRatio="none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <motion.path
                animate={{
                  d: [
                    "M 0 45 Q 360 -25, 720 45 T 1440 45",
                    "M 0 85 Q 360 145, 720 85 T 1440 85",
                    "M 0 35 Q 360 -5, 720 35 T 1440 35",
                    "M 0 45 Q 360 -25, 720 45 T 1440 45",
                  ],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
