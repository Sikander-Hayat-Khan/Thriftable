"use client";

import { motion } from "framer-motion";
import { useTheme } from "./theme-provider";

export default function FluidBackgroundFill({ className = "" }) {
  const { theme, isTransitioning, targetTheme, previousTheme, onTransitionEnd } = useTheme();

  // Base layer holds previous theme while transitioning, and target theme when complete
  const isBaseDark = isTransitioning ? previousTheme === "dark" : theme === "dark";
  const isTargetDark = targetTheme === "dark";

  const baseBgColor = isBaseDark ? "#171717" : "#f6f5f1";
  const targetBgColor = isTargetDark ? "#171717" : "#f6f5f1";

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Base Background: Solid color without CSS transition lag */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: baseBgColor }}
      />

      {/* Geometric Rectangular Curtain Expanding from 0% to 100% */}
      {isTransitioning && (
        <motion.div
          key={`rect-curtain-${targetTheme}`}
          className="absolute inset-x-0 top-0 w-full z-0 overflow-hidden"
          style={{
            backgroundColor: targetBgColor,
            borderBottom: "1.5px solid rgba(178, 163, 118, 0.45)",
          }}
          initial={{ height: "0%" }}
          animate={{ height: "100%" }}
          transition={{
            duration: 1.2,
            ease: [0.65, 0, 0.35, 1], // Smooth, cinematic slow flow
          }}
          onAnimationComplete={onTransitionEnd}
        />
      )}
    </div>
  );
}
