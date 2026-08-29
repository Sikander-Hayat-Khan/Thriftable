"use client";

import Image from "next/image";
import { toast, cssTransition } from "react-toastify";

export const ToastSlideDown = cssTransition({
  enter: "toast-slide-down-left-enter",
  exit: "toast-slide-down-left-exit",
  duration: [350, 250],
});

export function CartToastItem({ item, color, onViewBag, closeToast }) {
  if (!item) return null;

  return (
    <div className="w-full sm:w-96 p-3.5 sm:p-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-black/10 dark:border-white/15 shadow-2xl rounded-none text-neutral-900 dark:text-neutral-100 transition-all select-none">
      <div className="flex items-center gap-3.5">
        {/* Product Thumbnail */}
        {item.image && (
          <div className="relative w-12 h-14 bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-black/10 dark:border-white/10 overflow-hidden">
            <Image
              src={item.image}
              alt={item.name || "Item"}
              fill
              sizes="48px"
              className={`object-cover ${item.objectPosition || "object-center"}`}
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#B2A376] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B2A376] animate-pulse" />
            Added to Bag
          </div>

          <h4 className="text-xs sm:text-sm font-macsans font-bold text-neutral-900 dark:text-white truncate mt-0.5 tracking-wide">
            {item.name}
          </h4>

          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {item.price}
            </span>
            {item.size && <span>• {item.size}</span>}
            {color?.name && <span className="truncate">• {color.name}</span>}
          </div>
        </div>

        {/* View Bag Action & Close */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (closeToast) closeToast();
              if (onViewBag) onViewBag();
            }}
            className="group relative px-3 py-1.5 bg-[#B2A376] text-black font-bold text-[10px] uppercase font-mono tracking-widest overflow-hidden transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
          >
            <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
            <span className="relative z-10 group-hover:text-white dark:group-hover:text-black transition-colors">
              View Bag
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (closeToast) closeToast();
            }}
            aria-label="Dismiss toast"
            className="text-[11px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer p-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function showCartToast(item, color, openCart) {
  if (!item) return;

  toast(
    ({ closeToast }) => (
      <CartToastItem
        item={item}
        color={color}
        onViewBag={openCart}
        closeToast={closeToast}
      />
    ),
    {
      toastId: `cart-toast-${item.id}-${Date.now()}`,
      transition: ToastSlideDown,
      autoClose: 3200,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
    }
  );
}
