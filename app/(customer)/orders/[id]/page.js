"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useOrders } from "@/components/orders-provider";
import { useCart } from "@/components/cart-provider";
import { useReviews } from "@/components/reviews-provider";
import { createClient } from "@/utils/supabase/client";

export default function OrderDetailPage({ params }) {
  // Unwrap dynamic params
  const resolvedParams = typeof params?.then === "function" ? use(params) : params;
  const orderId = resolvedParams?.id;

  const { getOrder, loading } = useOrders();
  const { addToCart } = useCart();
  const { hasUserReviewedProduct } = useReviews();
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [reordered, setReordered] = useState(false);
  const [supabaseOrder, setSupabaseOrder] = useState(null);
  const [fetchingDb, setFetchingDb] = useState(false);

  const contextOrder = getOrder(orderId);

  // Always fetch the freshest order receipt directly from live database
  useEffect(() => {
    if (orderId) {
      setFetchingDb(true);
      fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.order) {
            setSupabaseOrder(json.order);
          }
        })
        .catch((err) => {
          console.warn("Error fetching order by ID:", err);
        })
        .finally(() => setFetchingDb(false));
    }
  }, [orderId]);

  const order = supabaseOrder || contextOrder;

  const handleCopyTracking = () => {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleReorderAll = () => {
    if (!order?.items) return;
    order.items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image,
        size: item.size,
        gender: item.gender,
        selectedColor: item.selectedColor,
      });
    });
    setReordered(true);
    setTimeout(() => setReordered(false), 3000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading || fetchingDb) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          Loading archive receipt...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6 max-w-3xl mx-auto text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#B2A376]/10 border border-[#B2A376]/30 flex items-center justify-center mb-4 text-[#B2A376]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-logo font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
          Order Not Found
        </h1>
        <p className="text-xs sm:text-sm font-proda text-neutral-600 dark:text-neutral-400 mt-2 max-w-md">
          We could not find an archival order matching reference &ldquo;{orderId}&rdquo;. It may have been placed under a different account.
        </p>
        <div className="mt-6 flex gap-4">
          <Link
            href="/orders"
            className="px-6 py-3 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest shadow-md hover:bg-[#a59567] transition-colors"
          >
            ← View All Orders
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 border border-black/20 dark:border-white/20 text-xs font-mono uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Visit Shop
          </Link>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isDelivered = order.status === "Delivered";
  const isReturnable = isDelivered && !order.returnDetails;

  return (
    <div className="min-h-screen w-full pt-20 sm:pt-24 pb-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500 print:pt-4 print:bg-white print:text-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Top Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10 text-xs font-proda uppercase tracking-wider text-neutral-500 dark:text-neutral-400 print:hidden">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Past Orders
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-bold font-mono">{order.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 text-xs font-mono transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="pt-8 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 dark:border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase font-mono tracking-[0.25em] text-[#B2A376] font-semibold">
                Archival Receipt
              </span>
              <span className="text-xs font-mono text-neutral-400">•</span>
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                {orderDate}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-logo font-extrabold tracking-wider text-neutral-900 dark:text-white -ml-0.5">
              ORDER {order.id}
            </h1>
          </div>

          {/* Quick status badge */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {order.status === "Delivered" ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Delivered
              </div>
            ) : order.status === "In Transit" ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#B2A376]/15 border border-[#B2A376]/40 text-[#8f8158] dark:text-[#d4c69b] text-xs font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#B2A376] animate-ping" />
                In Transit — Est. Delivery: {order.estimatedDelivery}
              </div>
            ) : order.status === "Return Requested" ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
                Return Requested ({order.returnDetails?.rmaNumber})
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                {order.status}
              </div>
            )}
          </div>
        </div>

        {/* Active Return Banner if returned */}
        {order.returnDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-8 p-6 bg-purple-950/20 border border-purple-500/30 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-purple-400">
                    {order.returnDetails.rmaNumber}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                    {order.returnDetails.status}
                  </span>
                </div>
                <p className="text-xs font-macsans text-neutral-300 mt-1">
                  Reason: <span className="font-semibold text-white">{order.returnDetails.reason}</span> • Handover via:{" "}
                  <span className="font-semibold text-white">
                    {order.returnDetails.method === "outlet" ? "Outlet Drop-off" : "Courier Pickup"}
                  </span>
                </p>
                {order.returnDetails.outletDropoffLocation && (
                  <p className="text-[11px] font-proda text-neutral-400 mt-0.5">
                    Drop-off Location: {order.returnDetails.outletDropoffLocation}
                  </p>
                )}
              </div>
            </div>

            <Link
              href={`/orders/${order.id}/return`}
              className="px-4 py-2 border border-purple-400 text-purple-300 hover:bg-purple-500/10 text-xs font-mono uppercase tracking-wider transition-colors shrink-0"
            >
              Manage Return →
            </Link>
          </motion.div>
        )}

        {/* Live Shipment Progress Tracker */}
        <div className="my-8 p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/70 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#B2A376] font-semibold">
                Carrier Logistics
              </span>
              <h2 className="text-base sm:text-lg font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white mt-0.5">
                {order.carrier}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-500">Tracking:</span>
                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                  {order.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="ml-1 text-[11px] font-mono uppercase text-[#B2A376] hover:underline cursor-pointer"
                >
                  {copiedTracking ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Timeline Visual */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
            {order.timeline?.map((step, idx) => (
              <div key={idx} className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex items-start gap-4">
                  <span
                    className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      step.completed
                        ? "bg-[#B2A376] border-[#B2A376] text-black"
                        : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-transparent"
                    }`}
                  >
                    {step.completed && (
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                      {step.title}
                    </h4>
                    <p className="text-xs font-proda text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
                      {step.description}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 shrink-0 ml-9 sm:ml-0">
                  {step.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid: Ordered Items + Order Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Ordered Items List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-6">
                <h3 className="text-base font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  Items in Archive ({order.items?.reduce((a, b) => a + b.quantity, 0) || 0})
                </h3>
                <span className="text-xs font-mono text-neutral-500">
                  Carbon-Neutral Delivery
                </span>
              </div>

              <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
                {order.items?.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-24 bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden border border-black/10 dark:border-white/10">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#B2A376] font-semibold block">
                          {item.category || "Vintage"}
                        </span>
                        <Link
                          href={`/shop/${item.id}`}
                          className="font-macsans font-bold text-sm sm:text-base text-neutral-900 dark:text-white hover:text-[#B2A376] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-proda text-neutral-500 mt-1">
                          <span>Size: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{item.size}</strong></span>
                          <span>•</span>
                          <span>Gender: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{item.gender}</strong></span>
                          {item.selectedColor?.name && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                Color:
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                                  style={{ backgroundColor: item.selectedColor.hex }}
                                />
                                <strong className="font-semibold text-neutral-700 dark:text-neutral-300">
                                  {item.selectedColor.name}
                                </strong>
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs font-mono text-neutral-500 mt-1">
                          Qty: {item.quantity} ×{" "}
                          {typeof item.price === "number"
                            ? `$${item.price.toFixed(2)}`
                            : item.price}
                        </p>
                        {order.status === "Delivered" && (
                          <div className="mt-2">
                            {hasUserReviewedProduct(item.id, order.id) ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                                ✓ Reviewed
                              </span>
                            ) : (
                              <Link
                                href={`/reviews/new?orderId=${order.id}&productId=${item.id}`}
                                className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#B2A376] hover:underline font-semibold"
                              >
                                ★ Review & Earn +25 Pts
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right self-end sm:self-center">
                      <span className="font-mono font-bold text-base text-neutral-900 dark:text-white block">
                        $
                        {(
                          (typeof item.price === "string"
                            ? parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0
                            : Number(item.price || 0)) * item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Footer Controls */}
            <div className="flex flex-wrap items-center gap-4 pt-2 print:hidden">
              {isReturnable && (
                <Link
                  href={`/orders/${order.id}/return`}
                  className="px-6 py-3.5 border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-macsans font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Start a Return for this Order →
                </Link>
              )}

              <button
                type="button"
                onClick={handleReorderAll}
                className="group relative px-6 py-3.5 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-md cursor-pointer"
              >
                <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                  {reordered ? "✓ Added to Bag" : "Reorder All Pieces"}
                </span>
              </button>

              <Link
                href={`/support?order=${order.id}`}
                className="px-5 py-3.5 border border-black/15 dark:border-white/15 hover:border-[#B2A376] text-neutral-900 dark:text-white text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Need Help with Order?
              </Link>
            </div>
          </div>

          {/* Right Column: Financial Breakdown & Shipping Details */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Financial Summary */}
            <div className="p-6 sm:p-7 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-4">
              <h3 className="text-base font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white pb-3 border-b border-black/10 dark:border-white/10">
                Payment Summary
              </h3>

              <div className="flex flex-col gap-2.5 text-xs font-macsans">
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                    ${Number(order.pricing?.subtotal || 0).toFixed(2)}
                  </span>
                </div>

                {Number(order.pricing?.promoDiscount || 0) > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({order.pricing?.promoCode || "PROMO"})</span>
                    <span className="font-mono">
                      − ${Number(order.pricing?.promoDiscount || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                {Number(order.pricing?.loyaltyDiscount || 0) > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Loyalty Credit</span>
                    <span className="font-mono">
                      − ${Number(order.pricing?.loyaltyDiscount || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Shipping ({order.shippingMethod === "express" ? "Express" : "Standard"})</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                    {Number(order.pricing?.shipping || 0) === 0
                      ? "FREE"
                      : `$${Number(order.pricing?.shipping || 0).toFixed(2)}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Estimated Tax</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                    ${Number(order.pricing?.tax || 0).toFixed(2)}
                  </span>
                </div>

                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between font-macsans font-bold text-neutral-900 dark:text-white">
                  <span className="uppercase tracking-wider text-sm">
                    {String(order.paymentMethod || "").toLowerCase().includes("cash") || String(order.paymentMethod || "").toLowerCase().includes("cod")
                      ? "Amount to be Paid (COD)"
                      : "Amount Paid"}
                  </span>
                  <span className="font-mono text-xl text-[#807248] dark:text-[#d3c59a]">
                    ${Number(order.pricing?.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="p-6 sm:p-7 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-base font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white pb-3 border-b border-black/10 dark:border-white/10">
                Delivery Details
              </h3>

              <div className="text-xs font-macsans space-y-1 text-neutral-600 dark:text-neutral-400">
                <p className="font-bold text-neutral-900 dark:text-white">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                </p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country || "Pakistan"}</p>
                {order.shippingAddress?.phone && (
                  <p className="pt-1 font-mono text-neutral-500">
                    Phone: {order.shippingAddress.phone}
                  </p>
                )}
                {order.shippingAddress?.email && (
                  <p className="font-mono text-neutral-500">
                    Email: {order.shippingAddress.email}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="p-6 sm:p-7 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-base font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white pb-3 border-b border-black/10 dark:border-white/10">
                Payment Info
              </h3>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500">Method</span>
                <span className="font-bold text-neutral-900 dark:text-white uppercase">
                  {order.paymentMethod === "card"
                    ? `Credit Card (${order.paymentDetails?.last4 ? `•••• ${order.paymentDetails.last4}` : "Active"})`
                    : order.paymentMethod === "applepay" || order.paymentMethod === "apple"
                    ? "Apple Pay"
                    : "Cash on Delivery (COD)"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500">Payment Status</span>
                <span className={String(order.paymentMethod || "").toLowerCase().includes("cash") || String(order.paymentMethod || "").toLowerCase().includes("cod") ? "text-amber-500 font-bold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
                  {String(order.paymentMethod || "").toLowerCase().includes("cash") || String(order.paymentMethod || "").toLowerCase().includes("cod")
                    ? "Payable upon Delivery (COD)"
                    : "✓ Paid in Full"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
