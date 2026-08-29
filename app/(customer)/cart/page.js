"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart-provider";
import CartQuantityControl from "@/components/cart-quantity-control";
import { catalogueItems } from "@/data/products";
import WishlistButton from "@/components/wishlist-button";

const FREE_SHIPPING_THRESHOLD = 150;

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    addToCart,
    cartCount,
  } = useCart();

  const [savedItems, setSavedItems] = useState([]);

  // Calculate raw subtotal from cart items
  const subtotalNumber = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price.replace("$", "")) || 0;
      return acc + price * item.quantity;
    }, 0);
  }, [cartItems]);

  // Free shipping progress calculation
  const isFreeShippingUnlocked = subtotalNumber >= FREE_SHIPPING_THRESHOLD;
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotalNumber / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalNumber);

  // Move item to saved for later
  const handleSaveForLater = (item) => {
    removeFromCart(item.id);
    if (!savedItems.some((s) => s.id === item.id)) {
      setSavedItems((prev) => [...prev, item]);
    }
  };

  // Move saved item back to cart
  const handleMoveBackToCart = (item) => {
    setSavedItems((prev) => prev.filter((s) => s.id !== item.id));
    addToCart(item, item.selectedColor);
  };

  // Recommendations: products from catalog not in current cart or saved items
  const recommendedItems = useMemo(() => {
    const activeIds = new Set([
      ...cartItems.map((i) => i.id),
      ...savedItems.map((s) => s.id),
    ]);
    return catalogueItems.filter((p) => !activeIds.has(p.id)).slice(0, 4);
  }, [cartItems, savedItems]);

  return (
    <div className="min-h-screen w-full pt-20 sm:pt-24 pb-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* 1. Breadcrumb & Status Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10 text-xs font-proda uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-bold">Shopping Bag</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2.5 py-0.5 bg-[#B2A376]/15 text-[#8f8158] dark:text-[#c4b78e] font-medium font-proda text-[11px] border border-[#B2A376]/30 rounded-full">
              {cartCount} {cartCount === 1 ? "Item" : "Items"} in Bag
            </span>
            <Link
              href="/shop"
              className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors underline-offset-4 hover:underline"
            >
              <span>← Continue Browsing</span>
            </Link>
          </div>
        </div>

        {/* 2. Page Header & Free Shipping Milestone Banner */}
        <div className="pt-8 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-proda tracking-[0.55em] text-[#B2A376] font-semibold">
                Your Selection
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-logo font-extrabold tracking-wider text-neutral-900 dark:text-white mt-2 -ml-0.5">
                SHOPPING BAG
              </h1>
            </div>
          </div>

          {/* Dynamic Free Shipping Threshold Meter */}
          {cartItems.length > 0 && (
            <div className="mt-6 p-4 sm:p-5 flex flex-col gap-2.5 rounded-xl">
              <div className="flex flex-wrap items-center justify-between text-xs font-proda tracking-widest">
                <span className="text-neutral-700 dark:text-neutral-300">
                  {isFreeShippingUnlocked ? (
                    <span className="dark:text-[#d3c59a] font-bold flex items-center gap-1.5">
                      Congratulations! You unlocked <strong className="underline">Free Worldwide Standard Shipping</strong>.
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-neutral-900 dark:text-white font-bold">${amountToFreeShipping.toFixed(2)}</strong> more to unlock <strong className="text-[#8f8158] dark:text-[#c4b78e]">Free Courier Delivery</strong>.
                    </span>
                  )}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 font-semibold">
                  ${subtotalNumber} / ${FREE_SHIPPING_THRESHOLD}
                </span>
              </div>

              {/* Minimal Progress Bar */}
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 overflow-hidden rounded-3xl">
                <div
                  className="h-full bg-[#B2A376] transition-all duration-500 ease-out"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Main Cart Content Layout */}
        {cartItems.length === 0 ? (
          /* Empty Bag State */
          <div className="py-20 px-6 border border-dashed border-black/15 dark:border-white/15 bg-neutral-100 dark:bg-neutral-900/20 text-center flex flex-col items-center justify-center max-w-3xl mx-auto rounded-4xl">
            <div className="w-20 h-20 bg-[#B2A376]/10 border border-[#B2A376]/20 flex items-center justify-center mb-6 text-[#B2A376] rounded-3xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
              Your bag is currently empty
            </h2>
            <p className="mt-3 text-sm font-proda text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
              Explore our hand-curated archival drops, vintage luxury silhouettes, and one-of-a-kind streetwear essentials.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="group relative px-8 py-3.5 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-md cursor-pointer block"
              >
                <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                  Explore Full Catalogue
                </span>
              </Link>
              <Link
                href="/shop?category=vintage"
                className="group relative px-6 py-3.5 border border-black/20 dark:border-white/20 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white overflow-hidden transition-all duration-300 block"
              >
                <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                <span className="relative z-10 text-neutral-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                  Vintage Archive
                </span>
              </Link>
              <Link
                href="/shop?category=streetwear"
                className="group relative px-6 py-3.5 border border-black/20 dark:border-white/20 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white overflow-hidden transition-all duration-300 block"
              >
                <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                <span className="relative z-10 text-neutral-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                  Streetwear
                </span>
              </Link>
            </div>

            {/* Saved Items Section if available */}
            {savedItems.length > 0 && (
              <div className="w-full mt-16 pt-12 border-t border-black/10 dark:border-white/10 text-left">
                <h3 className="text-lg font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-6">
                  Saved For Later ({savedItems.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col justify-between gap-4"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-16 h-20 bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-black/10">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-macsans font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-xs font-mono text-neutral-500 mt-1">
                            {item.price} • Size {item.size}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMoveBackToCart(item)}
                        className="group relative w-full py-2 bg-[#B2A376] text-black text-xs font-semibold uppercase tracking-wider overflow-hidden transition-all duration-300 cursor-pointer block"
                      >
                        <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                        <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                          Move Back To Bag
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Populated Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Cart Items & Guarantees */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
              {/* Items List Table Header (desktop) */}
              <div className="hidden sm:grid grid-cols-12 pb-3 border-b border-black/10 dark:border-white/10 text-[11px] font-proda uppercase tracking-widest text-neutral-400">
                <div className="col-span-6">Piece / Description</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Items Animate List */}
              <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => {
                    const numericPrice = parseFloat(item.price.replace("$", "")) || 0;
                    const itemSubtotal = (numericPrice * item.quantity).toFixed(2);

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
                        transition={{ duration: 0.3 }}
                        className="py-6 sm:py-7 flex flex-col gap-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start sm:items-center">
                          {/* Column 1: Image & Details */}
                          <div className="sm:col-span-6 flex items-start gap-4">
                            <Link
                              href={`/shop/${item.id}`}
                              className="relative w-24 h-32 sm:w-28 sm:h-36 bg-neutral-100 dark:bg-neutral-900 shrink-0 border border-black/10 dark:border-white/10 overflow-hidden group block cursor-pointer"
                            >
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="120px"
                                className={`object-cover ${item.objectPosition || "object-center"} group-hover:scale-105 transition-transform duration-500`}
                              />
                            </Link>

                            <div className="flex flex-col gap-1.5 justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-calluna uppercase tracking-widest px-1.5 py-0.5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                                  {item.category}
                                </span>
                                {item.condition && (
                                  <span className="text-[10px] font-calluna text-[#8f8158] dark:text-[#c4b78e] tracking-widest">
                                    {item.condition}
                                  </span>
                                )}
                              </div>

                              <Link
                                href={`/shop/${item.id}`}
                                className="font-macsans font-bold text-base sm:text-lg text-neutral-900 dark:text-white leading-snug hover:text-[#B2A376] transition-colors pl-1"
                              >
                                {item.name}
                              </Link>

                              {/* Attributes */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-calluna text-neutral-500 dark:text-neutral-400 pt-0.5 pl-1 tracking-widest">
                                <div>
                                  Size: <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{item.size}</span>
                                </div>
                                {item.gender && (
                                  <div>
                                    Gender: <span className="text-neutral-800 dark:text-neutral-200">{item.gender}</span>
                                  </div>
                                )}
                                {item.selectedColor && (
                                  <div className="flex items-center gap-1.5">
                                    <span>Color:</span>
                                    <span
                                      className="w-3 h-3 rounded-none border border-black/20 dark:border-white/20 inline-block"
                                      style={{ background: item.selectedColor.gradient || item.selectedColor.hex }}
                                      title={item.selectedColor.name}
                                    />
                                    <span className="capitalize text-neutral-800 dark:text-neutral-200 font-medium">
                                      {item.selectedColor.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Unit Price (desktop) */}
                          <div className="hidden sm:block sm:col-span-2 text-center text-sm font-macsans font-medium text-neutral-900 dark:text-white">
                            {item.price}
                          </div>

                          {/* Column 3: Quantity Controls */}
                          <div className="sm:col-span-2 flex items-center sm:justify-center">
                            <CartQuantityControl
                              quantity={item.quantity}
                              onIncrease={() => updateQuantity(item.id, 1)}
                              onDecrease={() => updateQuantity(item.id, -1)}
                              ariaLabelPrefix={item.name}
                            />
                          </div>

                          {/* Column 4: Subtotal (mobile & desktop) */}
                          <div className="sm:col-span-2 flex sm:block items-center justify-between sm:text-right">
                            <span className="sm:hidden text-xs font-mono text-neutral-400 uppercase">
                              Subtotal:
                            </span>
                            <span className="text-base sm:text-base font-macsans font-bold text-neutral-900 dark:text-white">
                              ${itemSubtotal}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row Actions: Save for Later & Remove */}
                        <div className="flex items-center justify-end gap-5 text-xs font-calluna tracking-widest pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveForLater(item)}
                            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline-offset-2 hover:underline cursor-pointer transition-colors"
                          >
                            Save for Later
                          </button>
                          <span className="text-neutral-300 dark:text-neutral-700">|</span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3.5 h-3.5"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Saved For Later Section */}
              {savedItems.length > 0 && (
                <div className="mt-6 p-6 border border-black/10 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/30">
                  <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-4">
                    <h3 className="text-sm font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                      Saved For Later ({savedItems.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-16 bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-black/10">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-macsans font-bold text-xs text-neutral-900 dark:text-white line-clamp-1">
                              {item.name}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-500">
                              {item.price} • {item.size}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMoveBackToCart(item)}
                          className="group relative px-3 py-1.5 bg-[#B2A376] text-black font-mono text-[11px] font-semibold uppercase overflow-hidden transition-all duration-300 shrink-0 cursor-pointer"
                        >
                          <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                          <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                            + Add to Bag
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust & Guarantee Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-black/10 dark:divide-white/10 pt-4 border-t border-black/10 dark:border-white/10">
                <div className="p-4 dark:bg-neutral-900/40 flex items-start gap-3 transition-transform hover:scale-105 duration-300 ease-in-out rounded-sm">
                  <div>
                    <h4 className="text-xs font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Authenticity Verified
                    </h4>
                    <p className="text-[11px] font-proda text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                      Every vintage garment is physically checked for genuine provenance.
                    </p>
                  </div>
                </div>

                <div className="p-4 dark:bg-neutral-900/40 flex items-start gap-3 transition-transform hover:scale-105 duration-300 ease-in-out rounded-sm sm:pl-6">
                  <div>
                    <h4 className="text-xs font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Carbon Neutral Courier
                    </h4>
                    <p className="text-[11px] font-proda text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                      100% offset shipments in recyclable and compostable packaging.
                    </p>
                  </div>
                </div>

                <div className="p-4 dark:bg-neutral-900/40 flex items-start gap-3 transition-transform hover:scale-105 duration-300 ease-in-out rounded-sm sm:pl-6">
                  <div>
                    <h4 className="text-xs font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      30-Day Easy Returns
                    </h4>
                    <p className="text-[11px] font-proda text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                      Hassle-free return policy with pre-printed return labels included.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Panel (Sticky) */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
              <div className="p-6 sm:p-7 border border-black/45 dark:border-white/15 dark:bg-neutral-900/90 backdrop-blur-md flex flex-col gap-5">
                <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                  <h2 className="text-lg font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    Order Summary
                  </h2>
                  <span className="text-xs font-calluna tracking-widest text-neutral-500">
                    {cartCount} {cartCount === 1 ? "Piece" : "Pieces"}
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between text-base font-macsans">
                  <span className="text-neutral-600 dark:text-neutral-400">Total</span>
                  <span className="font-macsans font-bold text-xl text-[#807248] dark:text-[#d3c59a]">
                    ${subtotalNumber.toFixed(2)}
                  </span>
                </div>

                {/* Primary Call to Action */}
                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    href="/checkout"
                    className="group relative w-full py-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest text-center shadow-lg overflow-hidden transition-all duration-300 ease-out active:scale-98 rounded-none block cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                    <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                      Proceed to Checkout →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. "Curated For You" Recommendations Carousel/Grid */}
        {recommendedItems.length > 0 && (
          <div className="mt-24 pt-16 border-t border-black/10 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs uppercase font-mono tracking-[0.25em] text-[#B2A376] font-semibold">
                  Complete The Aesthetic
                </span>
                <h2 className="text-2xl sm:text-3xl font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white mt-1">
                  You May Also Like
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              >
                View Full Archive →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedItems.map((prod) => (
                <div
                  key={prod.id}
                  className="group border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-black/40 dark:hover:border-white/40 transition-all duration-300"
                >
                  <div className="relative aspect-3/4 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden block">
                    <Link href={`/shop/${prod.id}`} className="absolute inset-0 block">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className={`object-cover ${prod.objectPosition || "object-center"} group-hover:scale-105 transition-transform duration-700`}
                      />
                    </Link>
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <WishlistButton product={prod} size="sm" />
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-500 uppercase pb-1">
                        <span>{prod.size} • {prod.gender}</span>
                        <span className="font-bold text-neutral-900 dark:text-white">{prod.price}</span>
                      </div>
                      <Link
                        href={`/shop/${prod.id}`}
                        className="font-macsans font-bold text-sm text-neutral-900 dark:text-white leading-snug group-hover:text-[#B2A376] transition-colors line-clamp-1"
                      >
                        {prod.name}
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(prod)}
                      className="group/btn relative w-full py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-xs uppercase tracking-wider overflow-hidden transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
                    >
                      <span className="absolute inset-0 bg-[#B2A376] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                      <span className="relative z-10 text-neutral-900 dark:text-white group-hover/btn:text-black dark:group-hover/btn:text-black transition-colors duration-300">
                        + Quick Add
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
