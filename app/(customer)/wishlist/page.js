"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/components/wishlist-provider";
import { useCart } from "@/components/cart-provider";
import { catalogueItems } from "@/data/products";
import WishlistButton from "@/components/wishlist-button";

const genderTabs = [
  { id: "all", label: "All" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "unisex", label: "Unisex" },
];

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Match wishlist IDs with catalogue products
  const savedProducts = useMemo(() => {
    return catalogueItems.filter((item) => wishlistIds.includes(item.id));
  }, [wishlistIds]);

  // Filter products by selected gender category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return savedProducts;
    return savedProducts.filter(
      (item) => item.gender?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [savedProducts, selectedCategory]);

  const handleMoveAllToBag = () => {
    filteredProducts.forEach((item) => {
      addToCart(item);
      toggleWishlist(item);
    });
  };

  return (
    <div className="min-h-screen w-full pt-20 sm:pt-24 pb-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10 text-xs font-proda uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-bold">Wishlist</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2.5 py-0.5 bg-[#B2A376]/15 text-[#8f8158] dark:text-[#c4b78e] font-medium font-proda text-[11px] border border-[#B2A376]/30 rounded-full">
              {savedProducts.length} Saved {savedProducts.length === 1 ? "Piece" : "Pieces"}
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="pt-8 pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-proda tracking-[0.55em] text-[#B2A376] font-semibold">
              Curated Archive
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-logo font-extrabold tracking-wider text-neutral-900 dark:text-white mt-2 -ml-0.5">
              YOUR WISHLIST
            </h1>
            <p className="text-xs sm:text-sm font-proda text-neutral-600 dark:text-neutral-400 mt-2 max-w-md">
              Items move fast during weekly drops. Saved items are not reserved until checkout.
            </p>
          </div>

          {filteredProducts.length > 0 && (
            <button
              type="button"
              onClick={handleMoveAllToBag}
              className="group relative px-6 py-3 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-md cursor-pointer self-start sm:self-end active:scale-95"
            >
              <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
              <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                Move {selectedCategory === "all" ? "All" : genderTabs.find((t) => t.id === selectedCategory)?.label} to Bag →
              </span>
            </button>
          )}
        </div>

        {/* Category Tabs (All, Men, Women, Unisex) */}
        {savedProducts.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10 mb-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
              {genderTabs.map((tab) => {
                const isActive = selectedCategory === tab.id;
                const count =
                  tab.id === "all"
                    ? savedProducts.length
                    : savedProducts.filter(
                        (p) => p.gender?.toLowerCase() === tab.id.toLowerCase()
                      ).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`text-xs sm:text-sm uppercase tracking-wider font-mono transition-colors pb-1 cursor-pointer rounded-none flex items-center gap-1.5 ${
                      isActive
                        ? "text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white font-bold"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border-b-2 border-transparent"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid or Empty State */}
        {savedProducts.length === 0 ? (
          <div className="py-20 px-6 border border-dashed border-black/15 dark:border-white/15 bg-neutral-50/50 dark:bg-neutral-900/20 text-center flex flex-col items-center justify-center max-w-3xl mx-auto rounded-3xl">
            <div className="w-16 h-16 bg-[#B2A376]/10 border border-[#B2A376]/30 flex items-center justify-center mb-5 text-[#B2A376] rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-sm font-proda text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
              Explore our vintage and archival drops. Click the heart icon on any piece to save it here.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="group relative px-8 py-3.5 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-md cursor-pointer block"
              >
                <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                  Explore Catalogue
                </span>
              </Link>
              <Link
                href="/shop?category=streetwear"
                className="px-6 py-3.5 border border-black/20 dark:border-white/20 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors block"
              >
                Streetwear
              </Link>
              <Link
                href="/shop?category=vintage"
                className="px-6 py-3.5 border border-black/20 dark:border-white/20 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors block"
              >
                Vintage Archive
              </Link>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-black/15 dark:border-white/15 bg-neutral-50/50 dark:bg-neutral-900/20 max-w-2xl mx-auto p-8 rounded-2xl">
            <p className="font-mono text-sm uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              No {genderTabs.find((t) => t.id === selectedCategory)?.label} pieces in your wishlist.
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-4 text-xs font-mono uppercase tracking-widest underline cursor-pointer text-[#B2A376]"
            >
              View All Saved Pieces ({savedProducts.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group flex flex-col h-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 transition-all duration-300 rounded-none overflow-hidden select-none"
                >
                  {/* Image Presentation */}
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-none shrink-0">
                    <Link href={`/shop/${item.id}`} className="absolute inset-0 block">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className={`object-cover ${item.objectPosition || "object-center"} group-hover:scale-105 transition-transform duration-700`}
                      />
                    </Link>

                    {/* Minimalist Heart Wishlist Toggle Button (Top Right) */}
                    <div className="absolute top-3 right-3 z-20">
                      <WishlistButton product={item} size="sm" />
                    </div>

                    {/* Quick Move to Bag button on card hover */}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(item);
                          toggleWishlist(item);
                        }}
                        className="group/btn relative w-full py-2.5 px-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl overflow-hidden transition-all duration-300 active:scale-95 cursor-pointer rounded-none"
                      >
                        <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                        <span className="relative z-10 text-black group-hover/btn:text-white dark:group-hover/btn:text-black transition-colors duration-300">
                          Move to Bag
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pb-2">
                        <span>{item.size} • {item.gender}</span>
                        <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                          {item.price}
                        </span>
                      </div>

                      <Link
                        href={`/shop/${item.id}`}
                        className="font-macsans font-bold text-base text-neutral-900 dark:text-white tracking-wide leading-snug group-hover:text-[#B2A376] transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-proda leading-relaxed mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(item);
                          toggleWishlist(item);
                        }}
                        className="text-xs uppercase font-bold tracking-wider text-[#B2A376] hover:underline cursor-pointer"
                      >
                        + Add to Bag
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item)}
                        className="text-xs text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
