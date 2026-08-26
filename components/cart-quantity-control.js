"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -24 : 24,
    opacity: 0,
  }),
};

export default function CartQuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  buttonSize = "w-8 h-8",
  containerWidth = "w-9",
  containerHeight = "h-8",
  textSize = "text-xs",
  ariaLabelPrefix = "item",
}) {
  const [direction, setDirection] = useState(1);

  const handleIncrease = () => {
    setDirection(1);
    onIncrease?.();
  };

  const handleDecrease = () => {
    setDirection(-1);
    onDecrease?.();
  };

  return (
    <div className="flex items-center border border-black/20 dark:border-white/20 bg-white dark:bg-neutral-900 select-none">
      <button
        type="button"
        onClick={handleDecrease}
        aria-label={`Decrease ${ariaLabelPrefix} quantity`}
        className={`${buttonSize} flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-red-500/35 dark:hover:bg-red-500/35 active:scale-90 transition-all cursor-pointer text-sm font-mono shrink-0`}
      >
        −
      </button>

      <div className={`relative ${containerWidth} ${containerHeight} overflow-hidden flex items-center justify-center shrink-0`}>
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.span
            key={quantity}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 32,
              mass: 0.7,
            }}
            className={`flex items-center justify-center w-full h-full font-mono font-bold text-neutral-900 dark:text-white ${textSize}`}
          >
            {quantity}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={handleIncrease}
        aria-label={`Increase ${ariaLabelPrefix} quantity`}
        className={`${buttonSize} flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-green-500/35 dark:hover:bg-white/10 active:scale-90 transition-all duration-200 ease-in cursor-pointer text-sm font-mono shrink-0`}
      >
        +
      </button>
    </div>
  );
}
