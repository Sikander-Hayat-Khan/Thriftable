"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useReviews } from "@/components/reviews-provider";
import { useOrders } from "@/components/orders-provider";
import { useAuth } from "@/components/auth-provider";
import { catalogueItems } from "@/data/products";

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addReview } = useReviews();
  const { orders } = useOrders();
  const { user } = useAuth();

  const queryOrderId = searchParams.get("orderId");
  const queryProductId = searchParams.get("productId");

  // Collect all eligible delivered items from user orders
  const deliveredItems = orders
    .filter((o) => o.status === "Delivered")
    .flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        orderId: order.id,
        orderDate: order.createdAt,
      }))
    );

  // Selected item to review
  const initialProduct =
    catalogueItems.find((p) => p.id === queryProductId) ||
    deliveredItems.find((i) => i.id === queryProductId) ||
    deliveredItems[0] ||
    catalogueItems[0];

  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [selectedOrderId, setSelectedOrderId] = useState(queryOrderId || deliveredItems[0]?.orderId || "TH-849201");

  // Review form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [conditionAccuracy, setConditionAccuracy] = useState("Exact Match");
  const [fitFeedback, setFitFeedback] = useState("True to Size");
  const [headline, setHeadline] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState(user?.name || "Elena Rostova");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-seed sample photos toggle
  const handleAddSamplePhoto = (sampleUrl) => {
    if (uploadedPhotos.length >= 4) return;
    setUploadedPhotos((prev) => [...prev, sampleUrl]);
  };

  const handleRemovePhoto = (idx) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setUploadedPhotos((prev) => [...prev, uploadEvent.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const ratingDescriptions = {
    1: "Disappointed — Condition/Fit was misleading",
    2: "Fair — Below expectations for vintage",
    3: "Good — Acceptable pre-loved quality",
    4: "Great — Very satisfied with the piece",
    5: "Exceptional — Flawless thrift find & curation!",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      addReview({
        productId: selectedProduct?.id || "street-1",
        productName: selectedProduct?.name || "Vintage Archive Piece",
        productCategory: selectedProduct?.category || "Vintage",
        orderId: selectedOrderId,
        userName: reviewerName,
        signature: reviewerName,
        rating,
        conditionAccuracy,
        fitFeedback,
        headline: headline || "Authentic Vintage Find",
        reviewText,
        photos: uploadedPhotos,
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[75vh] w-full flex items-center justify-center px-6 py-20 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-[#B2A376]/10 via-transparent to-transparent pointer-events-none" />

          {/* Reward Badge */}
          <div className="w-16 h-16 rounded-full bg-[#B2A376]/20 text-[#B2A376] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-mono font-semibold">
            Review Published
          </span>
          <h2 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-2 mb-3">
            Thank you for your thrift story!
          </h2>
          <p className="text-sm font-proda text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            Your review is now public and helping the community shop vintage with confidence.
          </p>

          <div className="bg-[#B2A376]/10 border border-[#B2A376]/30 py-3 px-4 rounded-none mb-8 text-center">
            <span className="text-xs font-mono font-semibold text-[#B2A376] uppercase tracking-wider block">
              +25 Loyalty Points Credited
            </span>
            <span className="text-[11px] font-proda text-neutral-500">
              Added to your Thriftable Rewards balance
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/shop/${selectedProduct?.id || ""}`}
              className="w-full py-3 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity text-center"
            >
              View on Product Page →
            </Link>
            <Link
              href="/orders"
              className="w-full py-3 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-center"
            >
              Back to Orders
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-28 pb-32 px-6 sm:px-12 lg:px-16 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-neutral-400 pb-6 border-b border-black/10 dark:border-white/10 mb-10">
          <Link href="/orders" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Orders
          </Link>
          <span>/</span>
          <span className="text-neutral-900 dark:text-white font-medium">Write a Review</span>
        </div>

        {/* Page Title */}
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B2A376] font-mono font-semibold">
            Verified Community Feedback
          </span>
          <h1 className="text-3xl sm:text-4xl font-macsans font-bold tracking-wide text-neutral-900 dark:text-white mt-1">
            Share Your Thrift Experience
          </h1>
          <p className="text-sm font-proda text-neutral-600 dark:text-neutral-400 mt-2">
            Reviews post publicly to help thrifters judge vintage sizing, fabric wear, and condition accuracy.
          </p>
        </div>

        {/* Selected Item Summary Card */}
        <div className="bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 p-5 sm:p-6 mb-8 flex items-center gap-5 shadow-sm">
          <div className="relative w-20 h-24 bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden border border-black/5 dark:border-white/5">
            <Image
              src={selectedProduct?.image || "/hero_section/sections/streetwear.jpg"}
              alt={selectedProduct?.name || "Product"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-1">
              <span>{selectedProduct?.category || "Vintage"}</span>
              <span>•</span>
              <span className="text-[#B2A376]">{selectedProduct?.condition || "Excellent Vintage"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-macsans font-bold text-neutral-900 dark:text-white truncate">
              {selectedProduct?.name}
            </h3>
            <p className="text-xs font-mono text-neutral-500 mt-1">
              {selectedProduct?.price} • Order #{selectedOrderId}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 p-6 sm:p-10 flex flex-col gap-8 shadow-sm"
        >
          {/* 1. Overall Rating */}
          <div className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-widest font-mono text-neutral-500">
              1. Overall Rating <span className="text-[#B2A376]">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl sm:text-3xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                >
                  <span
                    className={
                      (hoverRating || rating) >= star
                        ? "text-[#B2A376]"
                        : "text-neutral-300 dark:text-neutral-700"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
              <span className="ml-3 text-xs sm:text-sm font-proda text-neutral-600 dark:text-neutral-400 font-medium">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* 2. Vintage Condition Accuracy */}
          <div className="flex flex-col gap-3 pt-6 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest font-mono text-neutral-500">
                2. Condition Accuracy <span className="text-[#B2A376]">*</span>
              </label>
              <span className="text-[11px] font-proda text-neutral-400">Did the piece match its listing description?</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "Exact Match", label: "Exact Match", desc: "Matched photo & listed condition 100%" },
                { id: "Better Than Expected", label: "Better Than Expected", desc: "Crisper and cleaner than shown" },
                { id: "Minor Unlisted Wear", label: "Minor Unlisted Wear", desc: "Small flaw not noted in description" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setConditionAccuracy(opt.id)}
                  className={`p-3.5 text-left border transition-all cursor-pointer ${
                    conditionAccuracy === opt.id
                      ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white ring-1 ring-[#B2A376]"
                      : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <span className="text-xs font-macsans font-bold block">{opt.label}</span>
                  <span className="text-[10px] font-proda text-neutral-500 mt-1 block leading-tight">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Sizing & Fit Feedback */}
          <div className="flex flex-col gap-3 pt-6 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest font-mono text-neutral-500">
                3. Sizing & Fit Assessment <span className="text-[#B2A376]">*</span>
              </label>
              <span className="text-[11px] font-proda text-neutral-400">Vintage cut proportion</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Runs Small", "True to Size", "Oversized"].map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setFitFeedback(fit)}
                  className={`py-3 px-2 text-center text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                    fitFeedback === fit
                      ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white font-bold ring-1 ring-[#B2A376]"
                      : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Headline & Narrative */}
          <div className="flex flex-col gap-4 pt-6 border-t border-black/10 dark:border-white/10">
            <div>
              <label className="text-xs uppercase tracking-widest font-mono text-neutral-500 block mb-2">
                4. Review Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Pristine 90s wash, unbelievable vintage drape!"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-sm font-proda text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#B2A376]"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest font-mono text-neutral-500 block mb-2">
                5. Your Thrift Experience <span className="text-[#B2A376]">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe the fabric feel, how you styled the piece, the unboxing experience, or any unique details..."
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-sm font-proda text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#B2A376]"
              />
            </div>
          </div>

          {/* 5. Photo Upload with Loyalty Incentive */}
          <div className="flex flex-col gap-3 pt-6 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest font-mono text-neutral-500">
                6. Unboxing & Fit Photos
              </label>
              <span className="text-[11px] font-mono text-[#B2A376] font-semibold bg-[#B2A376]/10 px-2 py-0.5 border border-[#B2A376]/20">
                +25 Loyalty Points Bonus
              </span>
            </div>

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {uploadedPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 border border-black/15 dark:border-white/15 overflow-hidden group"
                  >
                    <Image src={url} alt={`Upload ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-mono"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="px-4 py-2.5 border border-dashed border-black/30 dark:border-white/30 hover:border-[#B2A376] dark:hover:border-[#B2A376] text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors inline-block">
                <span>Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-xs font-proda text-neutral-400">or add sample styling fit:</span>
              <button
                type="button"
                onClick={() =>
                  handleAddSamplePhoto(
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
                  )
                }
                className="text-[11px] font-mono text-[#B2A376] hover:underline cursor-pointer"
              >
                + Outfit Sample 1
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddSamplePhoto(
                    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80"
                  )
                }
                className="text-[11px] font-mono text-[#B2A376] hover:underline cursor-pointer"
              >
                + Outfit Sample 2
              </button>
            </div>
          </div>

          {/* 6. Reviewer Name & Live Signature Preview */}
          <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="w-full sm:w-1/2">
              <label className="text-xs uppercase tracking-widest font-mono text-neutral-500 block mb-2">
                7. Public Display Name
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-sm font-proda text-neutral-900 dark:text-white focus:outline-none focus:border-[#B2A376]"
              />
            </div>

            {/* Signature Preview */}
            <div className="w-full sm:w-1/2 bg-neutral-50 dark:bg-neutral-950 p-4 border border-black/5 dark:border-white/5 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                Signature Preview on Carousel
              </span>
              <span className="font-signature text-3xl text-neutral-900 dark:text-white">
                {reviewerName || "Your Signature"}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
            <Link
              href="/orders"
              className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !reviewText.trim()}
              className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
            >
              <span className="relative z-10">
                {isSubmitting ? "Publishing Review..." : "Submit Review & Earn 25 Pts →"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Loading Review Form...
          </div>
        </div>
      }
    >
      <WriteReviewContent />
    </Suspense>
  );
}
