"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { useWishlist } from "./wishlist-provider";
import { useAuth } from "./auth-provider";
import { showWishlistToast } from "./wishlist-toast";
import { catalogueItems } from "@/data/products";

export default function WishlistButton({
  product,
  className = "",
  size = "md", // "sm" | "md" | "lg"
}) {
  const router = useRouter();
  const reactId = useId();
  const gradientId = `wishlist-unisex-grad-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const productId = typeof product === "string" ? product : product?.id;
  const isSaved = isInWishlist(productId);

  // Resolve product details to identify gender
  const productData =
    typeof product === "object" && product !== null
      ? product
      : catalogueItems.find((item) => item.id === productId);

  const rawGender = (productData?.gender || "").toLowerCase().trim();
  const isMen = rawGender === "men" || rawGender === "male" || rawGender === "man";
  const isWomen = rawGender === "women" || rawGender === "female" || rawGender === "woman";
  const isUnisex = rawGender === "unisex" || (!isMen && !isWomen);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If user is not authenticated, prompt auth modal
    if (!user) {
      openAuthModal("signin");
      return;
    }

    // Trigger toast notification when adding to wishlist
    if (!isSaved && productData) {
      showWishlistToast(productData, router);
    }

    toggleWishlist(product);
  };

  const sizeClasses =
    size === "sm"
      ? "w-8 h-8"
      : size === "lg"
      ? "w-11 h-11"
      : "w-9 h-9";

  const iconSize =
    size === "sm"
      ? "w-3.5 h-3.5"
      : size === "lg"
      ? "w-5 h-5"
      : "w-4 h-4";

  // Determine fill & border style based on gender when item is saved
  let heartFill = "none";
  let activeBorderClass = "border-[#B2A376]/50";

  const COLOR_MEN = "#6ca0dc";
  const COLOR_WOMEN = "#f8b9d4";

  if (isSaved) {
    if (isMen) {
      heartFill = COLOR_MEN; // #6ca0dc
      activeBorderClass = "border-[#6ca0dc]/50 shadow-[#6ca0dc]/20";
    } else if (isWomen) {
      heartFill = COLOR_WOMEN; // #f8b9d4
      activeBorderClass = "border-[#f8b9d4]/50 shadow-[#f8b9d4]/20";
    } else {
      heartFill = `url(#${gradientId})`; // 50% both
      activeBorderClass = "border-[#d1aceb]/50 shadow-[#d1aceb]/20";
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      title={
        isSaved
          ? `Saved to wishlist (${isMen ? "Men" : isWomen ? "Women" : "Unisex"})`
          : "Save to wishlist"
      }
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none cursor-pointer group/wishlist backdrop-blur-md active:scale-90 ${
        isSaved
          ? `bg-black/50 dark:bg-black/70 border shadow-md scale-105 ${activeBorderClass}`
          : "bg-black/25 dark:bg-black/40 hover:bg-black/50 text-white/80 hover:text-white border border-white/15 hover:border-white/30"
      } ${sizeClasses} ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={heartFill}
        stroke={isSaved ? "none" : "currentColor"}
        strokeWidth={isSaved ? "0" : "1.8"}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${iconSize} transition-transform duration-300 group-hover/wishlist:scale-110`}
      >
        {isUnisex && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="#6ca0dc" />
              <stop offset="50%" stopColor="#f8b9d4" />
            </linearGradient>
          </defs>
        )}
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
