"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useReviews } from "./reviews-provider";

export default function ProductReviewsSection({ product }) {
  const { getReviewsForProduct, voteHelpful, votedReviews } = useReviews();
  const { reviews, avgRating, totalCount, conditionStats, fitStats, breakdown } =
    getReviewsForProduct(product.id);

  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "photos" | "5" | "4"
  const [photoModal, setPhotoModal] = useState(null);

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === "photos") return r.photos && r.photos.length > 0;
    if (activeFilter === "5") return r.rating === 5;
    if (activeFilter === "4") return r.rating === 4;
    return true;
  });

  const allCustomerPhotos = reviews.flatMap((r) => r.photos || []);

  return (
    <div className="mt-20 pt-16 border-t border-black/10 dark:border-white/10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-black/10 dark:border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-mono font-semibold">
            Social Proof & Fit Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
            Community Reviews ({totalCount})
          </h2>
        </div>

        <Link
          href={`/reviews/new?productId=${product.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-mono uppercase tracking-widest hover:bg-[#B2A376] dark:hover:bg-[#B2A376] dark:hover:text-black transition-colors shrink-0"
        >
          <span>Write a Review</span>
          <span className="text-[#B2A376] dark:text-neutral-900 font-bold">+25 pts</span>
        </Link>
      </div>

      {/* Trust & Condition Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-black/10 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 my-6">
        {/* Metric 1: Overall Star Score */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-macsans font-bold text-neutral-900 dark:text-white">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-neutral-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-[#B2A376] text-lg my-1">
            {"★★★★★".slice(0, Math.round(avgRating))}
            <span className="text-neutral-300 dark:text-neutral-700">
              {"★★★★★".slice(Math.round(avgRating))}
            </span>
          </div>
          <p className="text-xs font-proda text-neutral-500">
            Based on {totalCount} verified thrift purchases
          </p>
        </div>

        {/* Metric 2: Vintage Condition Accuracy */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Condition Accuracy
          </span>
          <div className="text-2xl font-mono font-bold text-[#B2A376] mt-1 mb-1">
            {conditionStats.exact + conditionStats.better}%
          </div>
          <p className="text-xs font-proda text-neutral-600 dark:text-neutral-400 leading-tight">
            Buyers reported item condition was exact match or exceeded expectation.
          </p>
        </div>

        {/* Metric 3: Fit Sizing Proportion */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Fit & Sizing
          </span>
          <div className="text-2xl font-mono font-bold text-neutral-900 dark:text-white mt-1 mb-1">
            {fitStats.trueToSize}% True to Size
          </div>
          <p className="text-xs font-proda text-neutral-600 dark:text-neutral-400 leading-tight">
            {fitStats.small > 0 && `${fitStats.small}% runs slightly smaller • `}
            Standard vintage drape and proportions.
          </p>
        </div>
      </div>

      {/* Customer Unboxing & Fit Photos Reel */}
      {allCustomerPhotos.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Customer Fit & Unboxing Gallery ({allCustomerPhotos.length})
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {allCustomerPhotos.map((photoUrl, idx) => (
              <div
                key={idx}
                onClick={() => setPhotoModal(photoUrl)}
                className="relative w-28 h-36 sm:w-36 sm:h-44 shrink-0 overflow-hidden border border-black/10 dark:border-white/10 group cursor-pointer hover:border-[#B2A376]"
              >
                <Image
                  src={photoUrl}
                  alt={`Customer photo ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 120px, 150px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-black/60 px-1.5 py-0.5 backdrop-blur-xs">
                  Zoom 🔍
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-6 border-b border-black/5 dark:border-white/5">
        {[
          { id: "all", label: `All Reviews (${totalCount})` },
          { id: "photos", label: `With Photos (${allCustomerPhotos.length})` },
          { id: "5", label: `5 Stars (${breakdown[5] || 0})` },
          { id: "4", label: `4 Stars (${breakdown[4] || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
              activeFilter === tab.id
                ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold"
                : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-black/10 dark:divide-white/10">
        {filteredReviews.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-proda text-neutral-500">
              No reviews match this filter. Be the first to add your styling story!
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const hasVoted = votedReviews.includes(rev.id);

            return (
              <div key={rev.id} className="py-8 flex flex-col gap-4">
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-black/10 dark:border-white/10">
                      <Image
                        src={rev.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                        alt={rev.userName}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-macsans font-bold text-sm text-neutral-900 dark:text-white">
                          {rev.userName}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#B2A376] flex items-center gap-1 font-semibold">
                            ✓ Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {new Date(rev.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="text-[#B2A376] text-sm font-mono tracking-widest">
                    {"★★★★★".slice(0, rev.rating)}
                  </div>
                </div>

                {/* Pre-loved Condition & Fit Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                  <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 border border-black/5 dark:border-white/5">
                    Condition: <strong className="text-neutral-900 dark:text-white">{rev.conditionAccuracy}</strong>
                  </span>
                  <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 border border-black/5 dark:border-white/5">
                    Fit: <strong className="text-neutral-900 dark:text-white">{rev.fitFeedback}</strong>
                  </span>
                </div>

                {/* Review Headline & Body */}
                {rev.headline && (
                  <h4 className="text-base font-macsans font-bold text-neutral-900 dark:text-white mt-1">
                    {rev.headline}
                  </h4>
                )}
                <p className="text-sm font-proda text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {rev.reviewText}
                </p>

                {/* Attached Photos */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex gap-3 pt-2">
                    {rev.photos.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setPhotoModal(p)}
                        className="relative w-20 h-24 border border-black/10 dark:border-white/10 overflow-hidden cursor-pointer hover:opacity-90"
                      >
                        <Image src={p} alt="Review attachment" fill sizes="80px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Handwritten Signature */}
                {rev.signature && (
                  <div className="font-signature text-2xl text-neutral-500 select-none pt-1">
                    {rev.signature}
                  </div>
                )}

                {/* Admin Concierge Reply */}
                {rev.adminReply && (
                  <div className="mt-2 p-4 bg-[#B2A376]/5 border-l-2 border-[#B2A376] flex flex-col gap-1">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#B2A376] font-semibold">
                      {rev.adminReply.author} • Response
                    </span>
                    <p className="text-xs font-proda text-neutral-600 dark:text-neutral-300">
                      {rev.adminReply.text}
                    </p>
                  </div>
                )}

                {/* Helpful Button */}
                <div className="flex items-center gap-4 pt-2 text-xs font-mono text-neutral-400">
                  <span>Was this review helpful?</span>
                  <button
                    type="button"
                    disabled={hasVoted}
                    onClick={() => voteHelpful(rev.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 border transition-colors cursor-pointer ${
                      hasVoted
                        ? "border-[#B2A376] text-[#B2A376] bg-[#B2A376]/10"
                        : "border-black/15 dark:border-white/15 hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    👍 <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Photo Modal */}
      {photoModal && (
        <div
          onClick={() => setPhotoModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[85vh] w-full aspect-3/4 bg-neutral-900 border border-white/20">
            <Image src={photoModal} alt="Enlarged fit photo" fill sizes="(max-width: 768px) 100vw, 600px" className="object-contain" />
            <button
              onClick={() => setPhotoModal(null)}
              className="absolute top-3 right-3 text-white bg-black/60 px-3 py-1 text-xs font-mono"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
