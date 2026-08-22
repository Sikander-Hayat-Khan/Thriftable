"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsComplete(true);
          }, 300);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(100, prev + step);
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  if (!shouldRender) return null;

  // Calculate wave position y based on progress (180 at 0% down to 0 at 100%)
  const waveY = 180 - (progress / 100) * 180;

  return (
    <AnimatePresence onExitComplete={() => setShouldRender(false)}>
      {!isComplete && (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#0A0A0A] select-none overflow-hidden pointer-events-auto"
        >
          {/* Main Logo Graphic with Zoom-In Transition */}
          <motion.div
            className="relative w-full max-w-[92vw] sm:max-w-[80vw] lg:max-w-[70vw] px-4"
            animate={isComplete ? { scale: 45, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          >
            <svg
              viewBox="0 0 1000 200"
              className="w-full h-auto overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <clipPath id="thriftable-wave-clip">
                  <motion.path
                    d={`M 0 ${waveY} Q 250 ${waveY - 18}, 500 ${waveY} T 1000 ${waveY} L 1000 220 L 0 220 Z`}
                    animate={{
                      d: [
                        `M 0 ${waveY} Q 250 ${waveY - 18}, 500 ${waveY} T 1000 ${waveY} L 1000 220 L 0 220 Z`,
                        `M 0 ${waveY} Q 250 ${waveY + 18}, 500 ${waveY} T 1000 ${waveY} L 1000 220 L 0 220 Z`,
                        `M 0 ${waveY} Q 250 ${waveY - 18}, 500 ${waveY} T 1000 ${waveY} L 1000 220 L 0 220 Z`,
                      ],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                      ease: "easeInOut",
                    }}
                  />
                </clipPath>
              </defs>

              {/* Base Background Text (Dark Muted Charcoal) */}
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-logo font-extrabold tracking-widest text-[115px] sm:text-[135px] fill-[#262626]"
                style={{ fontFamily: "var(--font-broela), Broela, Georgia, serif" }}
              >
                THRIFTABLE
              </text>

              {/* Foreground Liquid Wave Filled Text (Brand Accent Gold #B2A376) */}
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-logo font-extrabold tracking-widest text-[115px] sm:text-[135px] fill-[#B2A376]"
                style={{ fontFamily: "var(--font-broela), Broela, Georgia, serif" }}
                clipPath="url(#thriftable-wave-clip)"
              >
                THRIFTABLE
              </text>
            </svg>

            {/* Percentage Progress Counter */}
            <motion.div
              animate={{ opacity: isComplete ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex justify-end items-center mt-3 px-2"
            >
              <span className="font-mono text-xs sm:text-sm tracking-widest text-[#B2A376]/90 uppercase">
                loading... {progress}%
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
