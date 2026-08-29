"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useOrders } from "@/components/orders-provider";
import { useCart } from "@/components/cart-provider";
import { useAuth } from "@/components/auth-provider";
import { useReviews } from "@/components/reviews-provider";

const statusTabs = [
  { id: "all", label: "All Orders" },
  { id: "active", label: "In Transit & Active" },
  { id: "delivered", label: "Delivered" },
  { id: "returns", label: "Returns & Cancelled" },
];

export default function OrdersPage() {
  const { orders, loading } = useOrders();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { hasUserReviewedProduct } = useReviews();

  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);

  // Filter orders based on active tab and search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      let matchesTab = true;
      if (selectedTab === "active") {
        matchesTab = order.status === "Processing" || order.status === "In Transit";
      } else if (selectedTab === "delivered") {
        matchesTab = order.status === "Delivered";
      } else if (selectedTab === "returns") {
        matchesTab = order.status === "Return Requested" || order.status === "Cancelled";
      }

      if (!matchesTab) return false;

      // Search filter (by Order ID, tracking number, or item names)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesTracking = order.trackingNumber?.toLowerCase().includes(q);
        const matchesItems = order.items?.some((item) =>
          item.name.toLowerCase().includes(q)
        );
        return matchesId || matchesTracking || matchesItems;
      }

      return true;
    });
  }, [orders, selectedTab, searchQuery]);

  const handleReorder = (order) => {
    order.items?.forEach((item) => {
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
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold uppercase tracking-wider rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Delivered
          </span>
        );
      case "In Transit":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B2A376]/15 text-[#8f8158] dark:text-[#d4c69b] border border-[#B2A376]/40 text-xs font-mono font-semibold uppercase tracking-wider rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B2A376] animate-ping" />
            In Transit
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold uppercase tracking-wider rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Processing
          </span>
        );
      case "Return Requested":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-mono font-semibold uppercase tracking-wider rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Return Requested
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-500/10 text-neutral-500 dark:text-neutral-400 border border-neutral-500/30 text-xs font-mono font-semibold uppercase tracking-wider rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-500/10 text-neutral-500 border border-neutral-500/30 text-xs font-mono font-semibold uppercase tracking-wider rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen w-full pt-20 sm:pt-24 pb-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10 text-xs font-proda uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-bold">Past Orders</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-3 py-0.5 bg-[#B2A376]/15 text-[#8f8158] dark:text-[#c4b78e] font-medium font-mono text-[11px] border border-[#B2A376]/30 rounded-full">
              {orders.length} {orders.length === 1 ? "Archived Order" : "Archived Orders"}
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="pt-8 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase font-proda tracking-[0.55em] text-[#B2A376] font-semibold">
              Client Portfolio
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-logo font-extrabold tracking-wider text-neutral-900 dark:text-white mt-2 -ml-0.5">
              ORDER ARCHIVE
            </h1>
            <p className="text-xs sm:text-sm font-proda text-neutral-600 dark:text-neutral-400 mt-2 max-w-lg leading-relaxed">
              Every archive piece dispatched with carbon-neutral logistics, authentication certificates, and hassle-free returns.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Order #, Item, or Tracking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-black/15 dark:border-white/15 text-xs font-macsans placeholder:text-neutral-400 focus:outline-none focus:border-[#B2A376] transition-colors rounded-none"
              />
              <svg
                className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pb-6 border-b border-black/10 dark:border-white/10 mb-8">
          {statusTabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            let count = orders.length;
            if (tab.id === "active") {
              count = orders.filter((o) => o.status === "Processing" || o.status === "In Transit").length;
            } else if (tab.id === "delivered") {
              count = orders.filter((o) => o.status === "Delivered").length;
            } else if (tab.id === "returns") {
              count = orders.filter((o) => o.status === "Return Requested" || o.status === "Cancelled").length;
            }

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`text-xs sm:text-sm uppercase tracking-wider font-mono transition-colors pb-1 cursor-pointer rounded-none flex items-center gap-2 ${
                  isActive
                    ? "text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white font-bold"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border-b-2 border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              Retrieving orders archive...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 px-6 border border-dashed border-black/15 dark:border-white/15 bg-neutral-50/50 dark:bg-neutral-900/20 text-center flex flex-col items-center justify-center max-w-2xl mx-auto rounded-3xl">
            <div className="w-16 h-16 bg-[#B2A376]/10 border border-[#B2A376]/30 flex items-center justify-center mb-5 text-[#B2A376] rounded-full">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
              {searchQuery ? "No matching orders found" : "No orders in this category"}
            </h2>
            <p className="mt-2 text-sm font-proda text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try searching with a different order number or product name.`
                : "Explore our weekly vintage drops to begin building your sustainable curated archive wardrobe."}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest cursor-pointer shadow-md hover:bg-[#a19266] transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  href="/shop"
                  className="group relative px-8 py-3.5 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-md cursor-pointer block"
                >
                  <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                  <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                    Explore Catalogue →
                  </span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <AnimatePresence>
              {filteredOrders.map((order) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const isDelivered = order.status === "Delivered";
                const isReturnable = isDelivered && !order.returnDetails;

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Card Header Bar */}
                    <div className="p-5 sm:p-6 bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono">
                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider block text-[10px]">
                            Order Reference
                          </span>
                          <span className="font-bold text-neutral-900 dark:text-white text-sm">
                            {order.id}
                          </span>
                        </div>

                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider block text-[10px]">
                            Placed On
                          </span>
                          <span className="text-neutral-900 dark:text-white">
                            {orderDate}
                          </span>
                        </div>

                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider block text-[10px]">
                            Total Paid
                          </span>
                          <span className="font-bold text-[#807248] dark:text-[#d3c59a] text-sm">
                            ${Number(order.pricing?.total || 0).toFixed(2)}
                          </span>
                        </div>

                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider block text-[10px]">
                            Method
                          </span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {order.shippingMethod === "express" ? "Express Priority" : "Standard Tracked"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Return RMA notification bar if returned */}
                    {order.returnDetails && (
                      <div className="px-6 py-2.5 bg-purple-500/10 border-b border-purple-500/20 text-xs font-macsans text-purple-700 dark:text-purple-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold uppercase">{order.returnDetails.rmaNumber}</span>
                          <span>— Return request is under processing.</span>
                        </div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-[11px] underline uppercase tracking-wider hover:text-purple-900 dark:hover:text-purple-100"
                        >
                          View RMA Details →
                        </Link>
                      </div>
                    )}

                    {/* Card Body: Items Preview */}
                    <div className="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      {/* Items Thumbnails and Names */}
                      <div className="flex-1 w-full flex flex-col sm:flex-row sm:flex-wrap gap-4">
                        {order.items?.map((item, idx) => (
                          <div
                            key={`${item.id}-${idx}`}
                            className="flex items-center gap-3.5 p-2 rounded-sm border border-black/5 dark:border-white/5 bg-neutral-50/40 dark:bg-neutral-950/40 min-w-60 flex-1 sm:max-w-xs"
                          >
                            <div className="relative w-14 h-16 bg-neutral-200 dark:bg-neutral-800 shrink-0 overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                              {item.quantity > 1 && (
                                <span className="absolute bottom-0 right-0 bg-[#B2A376] text-black text-[10px] font-mono font-bold px-1.5 py-0.5">
                                  x{item.quantity}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/shop/${item.id}`}
                                className="font-macsans font-bold text-xs text-neutral-900 dark:text-white truncate block hover:text-[#B2A376] transition-colors"
                              >
                                {item.name}
                              </Link>
                              <p className="text-[11px] font-proda text-neutral-500 mt-0.5">
                                Size {item.size} • {item.selectedColor?.name || item.gender}
                              </p>
                              <p className="text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                                {item.price}
                              </p>
                              {order.status === "Delivered" && (
                                <div className="mt-1">
                                  {hasUserReviewedProduct(item.id, order.id) ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                      ✓ Reviewed
                                    </span>
                                  ) : (
                                    <Link
                                      href={`/reviews/new?orderId=${order.id}&productId=${item.id}`}
                                      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#B2A376] hover:underline"
                                    >
                                      ★ Review (+25 pts)
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right Action Column */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-48 shrink-0">
                        <Link
                          href={`/orders/${order.id}`}
                          className="group relative w-full py-2.5 px-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest text-center overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer block"
                        >
                          <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                          <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                            Order Details →
                          </span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setTrackingModalOrder(order)}
                          className="w-full py-2.5 px-4 border border-black/15 dark:border-white/15 hover:border-black dark:hover:border-white text-neutral-900 dark:text-white text-xs font-mono uppercase tracking-wider text-center transition-colors cursor-pointer"
                        >
                          Track Package
                        </button>

                        {isReturnable && (
                          <Link
                            href={`/orders/${order.id}/return`}
                            className="w-full py-2 px-4 border border-dashed border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-[11px] font-macsans uppercase tracking-wider text-center transition-colors cursor-pointer block"
                          >
                            Start a Return
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="w-full text-center text-[11px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer py-1"
                        >
                          + Buy Again
                        </button>
                      </div>
                    </div>

                    {/* Footer Logistics Snippet */}
                    <div className="px-5 sm:px-6 py-3 border-t border-black/5 dark:border-white/5 bg-neutral-50/40 dark:bg-neutral-950/30 flex flex-wrap items-center justify-between gap-3 text-[11px] font-proda text-neutral-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#B2A376]" />
                        <span>Carrier: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{order.carrier}</strong></span>
                        <span>• Tracking: <strong className="font-mono text-neutral-700 dark:text-neutral-300">{order.trackingNumber}</strong></span>
                      </div>
                      <div>
                        {order.status === "Delivered" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Delivered successfully
                          </span>
                        ) : (
                          <span>
                            Est. Delivery: <strong className="text-neutral-800 dark:text-neutral-200">{order.estimatedDelivery}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Tracking Modal */}
        <AnimatePresence>
          {trackingModalOrder && (
            <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-neutral-900 border border-black/20 dark:border-white/20 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
              >
                <button
                  onClick={() => setTrackingModalOrder(null)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#B2A376] font-semibold">
                    Live Dispatch Tracking
                  </span>
                </div>
                <h3 className="text-xl font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
                  Order {trackingModalOrder.id}
                </h3>
                <p className="text-xs font-mono text-neutral-500 mb-6">
                  {trackingModalOrder.carrier} • {trackingModalOrder.trackingNumber}
                </p>

                {/* Timeline */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
                  {trackingModalOrder.timeline?.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span
                        className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 ${
                          step.completed
                            ? "bg-[#B2A376] border-[#B2A376]"
                            : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                        }`}
                      />
                      <h4 className="text-xs font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        {step.title}
                      </h4>
                      <p className="text-[11px] font-proda text-neutral-500 mt-0.5">
                        {step.description}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                        {step.time}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                  <Link
                    href={`/orders/${trackingModalOrder.id}`}
                    className="text-xs font-mono uppercase tracking-wider text-[#B2A376] hover:underline font-bold"
                  >
                    Open Full Receipt & Invoice →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setTrackingModalOrder(null)}
                    className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-xs font-mono uppercase text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
