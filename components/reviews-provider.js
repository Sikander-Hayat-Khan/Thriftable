"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { seedReviews } from "@/data/reviews";
import { useAuth } from "./auth-provider";
import { createClient } from "@/utils/supabase/client";

const ReviewsContext = createContext({
  reviews: [],
  loading: true,
  addReview: () => {},
  getReviewsForProduct: () => ({ reviews: [], avgRating: 5, totalCount: 0, conditionStats: {}, fitStats: {} }),
  getFeaturedTestimonials: () => [],
  hasUserReviewedProduct: () => false,
  voteHelpful: () => {},
  addAdminReply: () => {},
  deleteReview: () => {},
});

export function ReviewsProvider({ children }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [votedReviews, setVotedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Initialize reviews strictly from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          const supabaseReviews = data.map((r) => ({
            id: r.id,
            productId: r.product_id,
            productName: "Curated Vintage Piece",
            productCategory: "Vintage",
            orderId: null,
            userId: r.user_id,
            userName: "Verified Customer",
            userAvatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            signature: "Verified Buyer",
            rating: Number(r.rating) || 5,
            conditionAccuracy: "Exact Match",
            fitFeedback: "True to Size",
            headline: r.comment?.slice(0, 40) || "Authentic Vintage Find",
            reviewText: r.comment || "",
            isVerifiedPurchase: true,
            isFeaturedTestimonial: (Number(r.rating) || 5) >= 5,
            purchaseTag: "Verified Order",
            photos: [],
            createdAt: r.created_at || new Date().toISOString(),
            helpfulCount: 0,
            adminReply: null,
          }));

          setReviews(supabaseReviews);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not load reviews from Supabase:", err);
      }

      if (isMounted) {
        setReviews([]);
        setLoading(false);
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // In-memory update helper
  const persistReviews = useCallback((updatedReviews) => {
    setReviews(updatedReviews);
  }, []);

  // Check if a specific user/order already reviewed an item
  const hasUserReviewedProduct = useCallback(
    (productId, orderId) => {
      return reviews.some((r) => r.productId === productId && (!orderId || r.orderId === orderId));
    },
    [reviews]
  );

  // Add a new review
  const addReview = useCallback(
    (reviewData) => {
      const newReview = {
        id: `rev-${Date.now()}`,
        productId: reviewData.productId,
        productName: reviewData.productName || "Curated Vintage Piece",
        productCategory: reviewData.productCategory || "Vintage",
        orderId: reviewData.orderId || null,
        userId: user?.id || "guest",
        userName: reviewData.userName || user?.name || "Verified Customer",
        userAvatar:
          reviewData.userAvatar ||
          user?.avatar ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
        signature: reviewData.signature || reviewData.userName || "Verified Thrifter",
        rating: Number(reviewData.rating) || 5,
        conditionAccuracy: reviewData.conditionAccuracy || "Exact Match",
        fitFeedback: reviewData.fitFeedback || "True to Size",
        headline: reviewData.headline || "Authentic Vintage Find",
        reviewText: reviewData.reviewText || "",
        isVerifiedPurchase: Boolean(reviewData.orderId),
        isFeaturedTestimonial: reviewData.rating >= 5,
        purchaseTag: `Purchased: ${reviewData.productName || "Archive Item"}`,
        photos: reviewData.photos || [],
        createdAt: new Date().toISOString(),
        helpfulCount: 0,
        adminReply: null,
      };

      const updated = [newReview, ...reviews];
      persistReviews(updated);

      // Attempt to sync to Supabase if authenticated
      if (user?.id) {
        try {
          const commentText = [reviewData.headline, reviewData.reviewText]
            .filter(Boolean)
            .join(" — ");

          supabase
            .from("reviews")
            .insert({
              user_id: user.id,
              product_id: String(reviewData.productId || "street-1"),
              rating: Number(reviewData.rating) || 5,
              comment: commentText || "Exceptional curated thrift piece.",
            })
            .select()
            .then(({ data: insertedReview, error: revErr }) => {
              if (revErr) {
                console.warn("Supabase review insert warning:", revErr);
              } else if (insertedReview && insertedReview[0]?.id) {
                newReview.supabaseId = insertedReview[0].id;
              }
            })
            .catch((e) => {
              console.warn("Supabase review insert exception:", e);
            });
        } catch (e) {
          console.warn("Supabase review insert skipped/error:", e);
        }
      }

      // Award loyalty bonus if window/event exists
      try {
        window.dispatchEvent(
          new CustomEvent("thriftable-loyalty-bonus", {
            detail: { points: 25, reason: "Verified Photo Review" },
          })
        );
      } catch (e) {}

      return newReview;
    },
    [reviews, user, persistReviews, supabase]
  );

  // Product reviews & breakdown calculator
  const getReviewsForProduct = useCallback(
    (productId) => {
      const productReviews = reviews.filter((r) => r.productId === productId);
      const totalCount = productReviews.length;

      if (totalCount === 0) {
        return {
          reviews: [],
          avgRating: 5.0,
          totalCount: 0,
          conditionStats: { exact: 100, better: 0, minorWear: 0 },
          fitStats: { small: 0, trueToSize: 100, large: 0 },
          breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
      }

      const sum = productReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
      const avgRating = Number((sum / totalCount).toFixed(1));

      // Condition stats
      const exactCount = productReviews.filter((r) => r.conditionAccuracy === "Exact Match").length;
      const betterCount = productReviews.filter((r) => r.conditionAccuracy === "Better Than Expected").length;
      const minorWearCount = productReviews.filter((r) => r.conditionAccuracy === "Minor Unlisted Wear").length;

      // Fit stats
      const smallCount = productReviews.filter((r) => r.fitFeedback === "Runs Small").length;
      const trueCount = productReviews.filter((r) => r.fitFeedback === "True to Size").length;
      const largeCount = productReviews.filter((r) => r.fitFeedback === "Oversized").length;

      // Rating breakdown
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      productReviews.forEach((r) => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
        breakdown[star] = (breakdown[star] || 0) + 1;
      });

      return {
        reviews: productReviews,
        avgRating,
        totalCount,
        conditionStats: {
          exact: Math.round((exactCount / totalCount) * 100),
          better: Math.round((betterCount / totalCount) * 100),
          minorWear: Math.round((minorWearCount / totalCount) * 100),
        },
        fitStats: {
          small: Math.round((smallCount / totalCount) * 100),
          trueToSize: Math.round((trueCount / totalCount) * 100),
          large: Math.round((largeCount / totalCount) * 100),
        },
        breakdown,
      };
    },
    [reviews]
  );

  // Featured testimonials for homepage
  const getFeaturedTestimonials = useCallback(() => {
    const featured = reviews.filter((r) => r.isFeaturedTestimonial && r.rating >= 4);
    return featured.length > 0 ? featured : seedReviews;
  }, [reviews]);

  // Vote helpful
  const voteHelpful = useCallback(
    (reviewId) => {
      if (votedReviews.includes(reviewId)) return false;

      const updated = reviews.map((r) => {
        if (r.id === reviewId) {
          return { ...r, helpfulCount: (r.helpfulCount || 0) + 1 };
        }
        return r;
      });

      const updatedVotes = [...votedReviews, reviewId];
      setVotedReviews(updatedVotes);
      persistReviews(updated);
      return true;
    },
    [reviews, votedReviews, persistReviews]
  );

  // Admin reply
  const addAdminReply = useCallback(
    (reviewId, replyText) => {
      const updated = reviews.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            adminReply: {
              author: "Thriftable Concierge",
              date: new Date().toISOString(),
              text: replyText,
            },
          };
        }
        return r;
      });
      persistReviews(updated);
    },
    [reviews, persistReviews]
  );

  // Delete / hide review from Supabase
  const deleteReview = useCallback(
    async (reviewId) => {
      const updated = reviews.filter((r) => r.id !== reviewId);
      persistReviews(updated);

      try {
        await supabase.from("reviews").delete().eq("id", reviewId);
      } catch (err) {
        console.warn("Failed to delete review from Supabase:", err);
      }
    },
    [reviews, persistReviews, supabase]
  );

  const value = useMemo(
    () => ({
      reviews,
      loading,
      addReview,
      getReviewsForProduct,
      getFeaturedTestimonials,
      hasUserReviewedProduct,
      voteHelpful,
      addAdminReply,
      deleteReview,
      votedReviews,
    }),
    [
      reviews,
      loading,
      addReview,
      getReviewsForProduct,
      getFeaturedTestimonials,
      hasUserReviewedProduct,
      voteHelpful,
      addAdminReply,
      deleteReview,
      votedReviews,
    ]
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
}
