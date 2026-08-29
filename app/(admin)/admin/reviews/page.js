"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useReviews } from "@/components/reviews-provider";

export default function AdminReviewsPage() {
  const { reviews, addAdminReply, deleteReview } = useReviews();

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyFilter, setReplyFilter] = useState("all");
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Metrics calculations
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalCount).toFixed(1) : "5.0";
  const verifiedCount = reviews.filter((r) => r.isVerifiedPurchase).length;
  const verifiedRate = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 100;
  const pendingRepliesCount = reviews.filter((r) => !r.adminReply && r.rating <= 4).length;

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = r.userName?.toLowerCase().includes(query);
        const matchProduct = r.productName?.toLowerCase().includes(query);
        const matchText = r.reviewText?.toLowerCase().includes(query);
        if (!matchName && !matchProduct && !matchText) return false;
      }

      // Rating filter
      if (ratingFilter === "5" && r.rating !== 5) return false;
      if (ratingFilter === "4" && r.rating !== 4) return false;
      if (ratingFilter === "low" && r.rating > 3) return false;

      // Reply filter
      if (replyFilter === "pending" && r.adminReply) return false;
      if (replyFilter === "replied" && !r.adminReply) return false;
      if (replyFilter === "photos" && (!r.photos || r.photos.length === 0)) return false;

      return true;
    });
  }, [reviews, searchQuery, ratingFilter, replyFilter]);

  const handleSendReply = (reviewId) => {
    if (!replyText.trim()) return;
    addAdminReply(reviewId, replyText);
    setReplyingReviewId(null);
    setReplyText("");
    setActionSuccessMsg("Official Concierge response posted publicly.");
    setTimeout(() => setActionSuccessMsg(""), 4000);
  };

  const handleDelete = (reviewId) => {
    if (confirm("Are you sure you want to remove this review from public view?")) {
      deleteReview(reviewId);
      setActionSuccessMsg("Review deleted successfully.");
      setTimeout(() => setActionSuccessMsg(""), 4000);
    }
  };

  return (
    <div className="min-h-screen w-full pt-28 pb-32 px-6 sm:px-12 lg:px-16 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-black/10 dark:border-white/10 mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-mono font-semibold">
              Admin Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
              Customer Reviews & Community Moderation
            </h1>
          </div>

          <Link
            href="/reviews/new"
            className="px-5 py-2.5 bg-[#B2A376] text-black text-xs font-mono uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity shrink-0 text-center"
          >
            + Test Review Form
          </Link>
        </div>

        {/* Feedback Alert Message */}
        {actionSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
            ✓ {actionSuccessMsg}
          </div>
        )}

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-5 border border-black/10 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40">
            <span className="text-xs font-mono uppercase text-neutral-400">Total Reviews</span>
            <div className="text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
              {totalCount}
            </div>
            <span className="text-[11px] font-proda text-neutral-500">Published storewide</span>
          </div>

          <div className="p-5 border border-black/10 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40">
            <span className="text-xs font-mono uppercase text-neutral-400">Average Score</span>
            <div className="text-3xl font-macsans font-bold text-[#B2A376] mt-1">
              {avgRating} <span className="text-xs text-neutral-400 font-mono">/ 5.0</span>
            </div>
            <span className="text-[11px] font-proda text-neutral-500">Overall customer sentiment</span>
          </div>

          <div className="p-5 border border-black/10 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40">
            <span className="text-xs font-mono uppercase text-neutral-400">Verified Buyer Rate</span>
            <div className="text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
              {verifiedRate}%
            </div>
            <span className="text-[11px] font-proda text-neutral-500">{verifiedCount} order-verified reviews</span>
          </div>

          <div className="p-5 border border-black/10 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40">
            <span className="text-xs font-mono uppercase text-neutral-400">Needs Concierge Reply</span>
            <div className="text-3xl font-macsans font-bold text-amber-600 dark:text-amber-400 mt-1">
              {pendingRepliesCount}
            </div>
            <span className="text-[11px] font-proda text-neutral-500">Critical or unreplied feedback</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, piece, or keywords..."
              className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-proda text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#B2A376]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-mono text-neutral-800 dark:text-neutral-200 cursor-pointer"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="low">1-3 Stars (Attention)</option>
            </select>

            {/* Reply / Status Filter */}
            <select
              value={replyFilter}
              onChange={(e) => setReplyFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-mono text-neutral-800 dark:text-neutral-200 cursor-pointer"
            >
              <option value="all">All Moderation States</option>
              <option value="pending">Pending Reply</option>
              <option value="replied">Replied</option>
              <option value="photos">Has Customer Photos</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-black/10 dark:divide-white/10 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900">
          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono uppercase tracking-wider text-neutral-400">
              No customer reviews found matching criteria.
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div key={rev.id} className="p-6 sm:p-8 flex flex-col gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
                      <Image src={rev.userAvatar} alt={rev.userName} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-macsans font-bold text-sm text-neutral-900 dark:text-white">
                          {rev.userName}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] font-mono text-[#B2A376] uppercase">
                            ✓ Order #{rev.orderId || "VERIFIED"}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {new Date(rev.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-[#B2A376] text-sm font-mono tracking-widest">
                      {"★★★★★".slice(0, rev.rating)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      className="text-[11px] font-mono text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Product & Pre-Loved Metrics */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="text-neutral-500">Item:</span>
                  <Link
                    href={`/shop/${rev.productId}`}
                    className="font-bold text-neutral-900 dark:text-white hover:text-[#B2A376] transition-colors"
                  >
                    {rev.productName}
                  </Link>
                  <span className="text-neutral-400">•</span>
                  <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px]">
                    Condition: {rev.conditionAccuracy}
                  </span>
                  <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px]">
                    Fit: {rev.fitFeedback}
                  </span>
                </div>

                {/* Headline & Body */}
                {rev.headline && (
                  <h4 className="font-macsans font-bold text-base text-neutral-900 dark:text-white">
                    {rev.headline}
                  </h4>
                )}
                <p className="text-sm font-proda text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {rev.reviewText}
                </p>

                {/* Attached Photos */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex gap-3 pt-1">
                    {rev.photos.map((p, idx) => (
                      <div key={idx} className="relative w-16 h-20 border border-black/15 dark:border-white/15 overflow-hidden">
                        <Image src={p} alt="Review attachment" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Official Store Response Block */}
                {rev.adminReply ? (
                  <div className="mt-2 p-4 bg-[#B2A376]/10 border-l-2 border-[#B2A376] flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#B2A376] font-semibold">
                        {rev.adminReply.author} • Published Response
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {new Date(rev.adminReply.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-proda text-neutral-700 dark:text-neutral-300">
                      {rev.adminReply.text}
                    </p>
                  </div>
                ) : (
                  <div>
                    {replyingReviewId === rev.id ? (
                      <div className="mt-2 p-4 border border-[#B2A376]/40 bg-neutral-50 dark:bg-neutral-950 flex flex-col gap-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#B2A376] font-semibold">
                          Compose Concierge Reply
                        </span>
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a public store reply addressing sizing, appreciation, or archive care..."
                          className="w-full p-3 bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 text-xs font-proda focus:outline-none focus:border-[#B2A376]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingReviewId(null);
                              setReplyText("");
                            }}
                            className="px-3 py-1.5 text-xs font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(rev.id)}
                            className="px-4 py-1.5 bg-[#B2A376] text-black text-xs font-mono uppercase font-semibold"
                          >
                            Post Public Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText(
                            `Thank you ${rev.userName}! We're thrilled you love the archive curation.`
                          );
                        }}
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#B2A376] hover:underline cursor-pointer"
                      >
                        💬 Reply as Store Concierge
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
