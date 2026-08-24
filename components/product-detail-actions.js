"use client";

import { useCart } from "@/components/cart-provider";
import Link from "next/link";

export default function ProductDetailActions({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="pt-6 flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        onClick={() => addToCart(product)}
        className="flex-1 text-center py-4 bg-[#B2A376] hover:bg-[#9e8f63] text-black font-semibold text-xs uppercase tracking-widest transition-all duration-300 rounded-none shadow-md cursor-pointer active:scale-98"
      >
        Add to Cart
      </button>
      <Link
        href="/shop"
        className="py-4 px-6 text-center border border-black/15 dark:border-white/15 text-xs uppercase font-mono tracking-widest hover:border-black dark:hover:border-white transition-colors rounded-none text-neutral-900 dark:text-white"
      >
        Back to Shop
      </Link>
    </div>
  );
}
