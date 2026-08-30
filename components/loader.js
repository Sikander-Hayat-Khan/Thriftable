"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    try {
      const alreadySeen = sessionStorage.getItem("thriftable_intro_seen");
      if (alreadySeen) {
        setShouldRender(false);
        return;
      }
      // Show intro once per session
      sessionStorage.setItem("thriftable_intro_seen", "true");
      setShouldRender(true);

      // Fast, non-blocking auto-complete (450ms) to ensure excellent Speed Index and near-zero TBT
      const timer = setTimeout(() => {
        setIsComplete(true);
      }, 450);

      return () => clearTimeout(timer);
    } catch {
      setShouldRender(false);
    }
  }, []);

  if (!shouldRender) return null;

  const NUM_COLUMNS = 5;

  return (
    <AnimatePresence onExitComplete={() => setShouldRender(false)}>
      {!isComplete && (
        <motion.div
          key="preloader-overlay"
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center select-none overflow-hidden pointer-events-auto"
        >
          {/* Vertical Slices Background */}
          <div className="absolute inset-0 flex w-full h-full pointer-events-none">
            {Array.from({ length: NUM_COLUMNS }).map((_, index) => (
              <motion.div
                key={`slice-${index}`}
                className="flex-1 h-full bg-[#B2A376]"
                initial={{ y: "0%" }}
                exit={{
                  y: "-100%",
                  transition: {
                    duration: 0.65,
                    ease: [0.76, 0, 0.24, 1],
                    delay: index * 0.05,
                  },
                }}
              />
            ))}
          </div>

          {/* Main Logo Graphic (Slides Up) */}
          <motion.div
            className="relative z-10 w-full max-w-[92vw] sm:max-w-[80vw] lg:max-w-[70vw] px-4 pointer-events-auto flex flex-col items-center justify-center"
            initial={{ y: 0, opacity: 1 }}
            exit={{
              y: "-100vh",
              opacity: 0,
              transition: {
                duration: 0.65,
                ease: [0.76, 0, 0.24, 1],
              },
            }}
          >
            <div className="text-center">
              <span
                className="font-logo font-extrabold tracking-widest text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#696046] drop-shadow-sm select-none inline-block"
                style={{ fontFamily: "var(--font-broela), Broela, Georgia, serif" }}
              >
                THRIFTABLE
              </span>
            </div>

            <div className="mt-3 flex items-center justify-center">
              <span className="font-mono text-[10px] sm:text-xs tracking-widest text-[#696046]/80 uppercase font-semibold">
                Curating Archive...
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

