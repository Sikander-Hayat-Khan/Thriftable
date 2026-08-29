"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import Link from "next/link";
import WishlistButton from "@/components/wishlist-button";

export default function ProductDetailActions({ product }) {
  const { addToCart, cartItems } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const [warning, setWarning] = useState("");

  const maxStock = product?.stock !== undefined ? Number(product.stock) : 10;
  const isAvailable = product?.is_available !== false && maxStock > 0;

  // Check how many of this item are already in the customer's cart
  const inCartItem = cartItems.find((i) => i.id === product?.id);
  const inCartQty = inCartItem?.quantity || 0;
  const remainingAvailable = Math.max(0, maxStock - inCartQty);

  const handleIncrement = () => {
    if (selectedQty + inCartQty >= maxStock) {
      setWarning(`Only ${maxStock} pieces of this archive garment are available.`);
      setTimeout(() => setWarning(""), 3500);
      return;
    }
    setSelectedQty((prev) => prev + 1);
    setWarning("");
  };

  const handleDecrement = () => {
    if (selectedQty > 1) {
      setSelectedQty((prev) => prev - 1);
      setWarning("");
    }
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    if (selectedQty + inCartQty > maxStock) {
      setWarning(`Cannot add ${selectedQty}. Only ${remainingAvailable} more available in vault.`);
      setTimeout(() => setWarning(""), 4000);
      return;
    }
    addToCart(product, null, { quantity: selectedQty, openDrawer: true });
    setWarning("");
  };

  return (
    <div className="pt-6 space-y-4">
      {/* Stock Availability Badge */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              !isAvailable
                ? "bg-red-500"
                : maxStock <= 3
                ? "bg-amber-500 animate-pulse"
                : "bg-emerald-500"
            }`}
          />
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">
            {!isAvailable
              ? "Archival Piece Sold Out"
              : maxStock <= 3
              ? `Only ${maxStock} Piece${maxStock > 1 ? "s" : ""} Remaining in Vault`
              : `In Stock (${maxStock} pieces available)`}
          </span>
        </div>

        {inCartQty > 0 && (
          <span className="text-neutral-400">
            ({inCartQty} already in bag)
          </span>
        )}
      </div>

      {/* Warning Box */}
      {warning && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono">
          ⚠️ {warning}
        </div>
      )}

      {/* Quantity Stepper & Add to Bag */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity Stepper */}
        {isAvailable && (
          <div className="flex items-center justify-between border border-black/15 dark:border-white/15 h-12.5 px-3 bg-neutral-50 dark:bg-neutral-900 shrink-0">
            <span className="text-[11px] font-mono uppercase text-neutral-400 pr-2">
              Qty:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={selectedQty <= 1}
                className="w-7 h-7 flex items-center justify-center font-mono text-base text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
              >
                -
              </button>
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white w-6 text-center">
                {selectedQty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={selectedQty >= maxStock}
                className="w-7 h-7 flex items-center justify-center font-mono text-base text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`group relative flex-1 text-center py-4 text-xs font-semibold uppercase tracking-widest overflow-hidden transition-all duration-300 rounded-none shadow-md ${
            !isAvailable
              ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
              : "bg-[#B2A376] text-black cursor-pointer active:scale-98"
          }`}
        >
          {isAvailable && (
            <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
          )}
          <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
            {!isAvailable ? "Sold Out" : "Add to Cart"}
          </span>
        </button>

        {/* Wishlist & Back Buttons */}
        <div className="flex items-center gap-3">
          <WishlistButton
            product={product}
            size="lg"
            className="rounded-none border-black/15 dark:border-white/15 h-12.5 w-12.5 shrink-0"
          />

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
      </div>
    </div>
  );
}
