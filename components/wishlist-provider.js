"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "./auth-provider";
import { createClient } from "@/utils/supabase/client";

const WishlistContext = createContext({
  wishlistIds: [],
  isInWishlist: () => false,
  toggleWishlist: async () => {},
  wishlistCount: 0,
  loading: true,
});

export function WishlistProvider({ children }) {
  const { user, openAuthModal } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Initial load: strictly from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadWishlist() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("wishlist")
            .select("product_id")
            .eq("user_id", user.id);

          if (!error && data && isMounted) {
            const dbIds = data.map((row) => row.product_id);
            setWishlistIds(dbIds);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error loading wishlist from Supabase:", err);
        }
      }

      if (isMounted) {
        setWishlistIds([]);
        setLoading(false);
      }
    }

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [user, supabase]);

  const isInWishlist = useCallback(
    (productId) => {
      return wishlistIds.includes(productId);
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      const productId = typeof product === "string" ? product : product?.id;
      if (!productId) return;

      if (!user) {
        openAuthModal("signin");
        return;
      }

      const isCurrentlySaved = wishlistIds.includes(productId);
      const newIds = isCurrentlySaved
        ? wishlistIds.filter((id) => id !== productId)
        : [...wishlistIds, productId];

      // Optimistic update
      setWishlistIds(newIds);

      // Sync with Supabase
      try {
        if (isCurrentlySaved) {
          await supabase
            .from("wishlist")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);
        } else {
          await supabase
            .from("wishlist")
            .upsert(
              { user_id: user.id, product_id: productId },
              { onConflict: "user_id,product_id" }
            );
        }
      } catch (err) {
        console.error("Failed to sync wishlist with Supabase:", err);
      }
    },
    [wishlistIds, user, supabase, openAuthModal]
  );

  const value = {
    wishlistIds,
    isInWishlist,
    toggleWishlist,
    wishlistCount: wishlistIds.length,
    loading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
