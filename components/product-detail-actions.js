"use client";

import { useCart } from "@/components/cart-provider";
import Link from "next/link";
import WishlistButton from "@/components/wishlist-button";

export default function ProductDetailActions({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="pt-6 flex items-center gap-3">
      <button
        type="button"
        onClick={() => addToCart(product)}
        className="group relative flex-1 text-center py-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 rounded-none shadow-md cursor-pointer active:scale-98"
      >
        <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
        <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
          Add to Cart
        </span>
      </button>

      <WishlistButton product={product} size="lg" className="rounded-none border-black/15 dark:border-white/15 h-12.5 w-12.5 shrink-0" />

      <Link
        href="/shop"
        className="group relative py-4 px-6 text-center border border-black/15 dark:border-white/15 text-xs uppercase font-mono tracking-widest overflow-hidden transition-all duration-300 rounded-none text-neutral-900 dark:text-white block"
      >
        <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
        <span className="relative z-10 text-neutral-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
          Back
        </span>
      </Link>
    </div>
  );
}
