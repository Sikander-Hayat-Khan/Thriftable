"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useOrders } from "@/components/orders-provider";

export default function ReturnPage({ params }) {
  const resolvedParams = typeof params?.then === "function" ? use(params) : params;
  const orderId = resolvedParams?.id;

  const { getOrder, requestReturn, loading } = useOrders();
  const order = getOrder(orderId);

  // Return Form State
  const [selectedItems, setSelectedItems] = useState({});
  const [returnMethod, setReturnMethod] = useState("outlet"); // "outlet" | "courier"
  const [returnResolution, setReturnResolution] = useState("credit"); // "credit" | "refund"
  const [notes, setNotes] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRMA, setSubmittedRMA] = useState(null);

  // Toggle item selection
  const handleItemToggle = (itemId) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = "Size / Fit Issue";
      }
      return next;
    });
  };

  const handleReasonChange = (itemId, reason) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: reason,
    }));
  };

  const selectedCount = Object.keys(selectedItems).length;

  const handleSubmitReturn = (e) => {
    e.preventDefault();
    if (selectedCount === 0 || !agreePolicy) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const itemsPayload = Object.entries(selectedItems).map(([id, reason]) => {
        const itemObj = order?.items?.find((i) => i.id === id);
        return {
          id,
          name: itemObj?.name || id,
          reason,
          price: itemObj?.price,
        };
      });

      const rmaResult = requestReturn(order.id, {
        items: itemsPayload,
        reason: itemsPayload.map((i) => `${i.name}: ${i.reason}`).join("; "),
        method: returnMethod,
        resolution: returnResolution,
        notes: notes,
      });

      setSubmittedRMA(rmaResult);
      setIsSubmitting(false);
    }, 900);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6 max-w-3xl mx-auto text-center flex flex-col items-center justify-center">
        <h1 className="text-2xl sm:text-3xl font-logo font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
          Order Not Found
        </h1>
        <p className="text-xs sm:text-sm font-proda text-neutral-600 dark:text-neutral-400 mt-2">
          Unable to locate order &ldquo;{orderId}&rdquo; to initiate a return.
        </p>
        <Link
          href="/orders"
          className="mt-6 px-6 py-3 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest shadow-md hover:bg-[#a59567] transition-colors"
        >
          ← Back to Orders Archive
        </Link>
      </div>
    );
  }

  // If return was already submitted or freshly submitted
  const activeReturn = submittedRMA || order.returnDetails;

  if (activeReturn) {
    return (
      <div className="min-h-screen w-full pt-20 sm:pt-24 pb-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 pb-6 border-b border-black/10 dark:border-white/10 text-xs font-proda uppercase tracking-wider text-neutral-500 mb-8">
            <Link href="/orders" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Past Orders
            </Link>
            <span>/</span>
            <Link href={`/orders/${order.id}`} className="hover:text-neutral-900 dark:hover:text-white transition-colors font-mono">
              {order.id}
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-bold">Return RMA</span>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 sm:p-12 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/90 backdrop-blur-md shadow-xl flex flex-col items-center text-center gap-6"
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#B2A376] font-semibold">
                Authorization Granted
              </span>
              <h1 className="text-3xl sm:text-4xl font-logo font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Return Initiated
              </h1>
              <p className="text-xs sm:text-sm font-proda text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                Your Return Merchandise Authorization (RMA) has been recorded in our central archive ledger.
              </p>
            </div>

            {/* RMA Card Slip */}
            <div className="w-full p-6 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-left text-xs font-macsans flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                <span className="text-neutral-500 uppercase tracking-wider text-[11px]">RMA Number</span>
                <span className="font-mono font-bold text-base text-purple-600 dark:text-purple-400">
                  {activeReturn.rmaNumber}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Order Reference</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {order.id}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Handover Method</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {activeReturn.method === "outlet" ? "Physical Outlet Drop-off (Instant)" : "Courier Pickup from Address"}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Refund Choice</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {activeReturn.resolution === "credit" ? "Store Credit (+10% Bonus)" : "Original Payment Method"}
                </span>
              </div>

              {activeReturn.outletDropoffLocation && (
                <div className="pt-1">
                  <span className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1">
                    Designated Outlet Location
                  </span>
                  <p className="font-bold text-neutral-900 dark:text-white">
                    {activeReturn.outletDropoffLocation}
                  </p>
                  <p className="text-[11px] font-proda text-neutral-500 mt-0.5">
                    Open Mon-Sun 11:00 AM - 10:00 PM. Present this RMA number at the desk.
                  </p>
                </div>
              )}
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/orders/${order.id}`}
                className="flex-1 py-3.5 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest text-center shadow-md hover:bg-[#a59567] transition-colors"
              >
                Back to Order Details
              </Link>
              <Link
                href="/orders"
                className="flex-1 py-3.5 border border-black/20 dark:border-white/20 text-neutral-900 dark:text-white font-mono text-xs uppercase tracking-widest text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                View All Orders
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-20 sm:pt-24 pb-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-6 sm:px-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 pb-6 border-b border-black/10 dark:border-white/10 text-xs font-proda uppercase tracking-wider text-neutral-500 mb-8">
          <Link href="/orders" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Past Orders
          </Link>
          <span>/</span>
          <Link href={`/orders/${order.id}`} className="hover:text-neutral-900 dark:hover:text-white transition-colors font-mono">
            {order.id}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 dark:text-white font-bold">Start Return</span>
        </div>

        {/* Page Header */}
        <div className="mb-10">
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-[#B2A376] font-semibold">
            Archive Guarantee
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-logo font-extrabold tracking-wider text-neutral-900 dark:text-white mt-2 -ml-0.5">
            START A RETURN
          </h1>
          <p className="text-xs sm:text-sm font-proda text-neutral-600 dark:text-neutral-400 mt-2 max-w-xl leading-relaxed">
            Returns are accepted within 7 days of delivery. Drop off at any physical outlet for instant reimbursement or schedule courier collection.
          </p>
        </div>

        <form onSubmit={handleSubmitReturn} className="flex flex-col gap-10">
          {/* Step 1: Select Items */}
          <div className="p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <h2 className="text-base font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#B2A376] text-black flex items-center justify-center text-xs font-mono font-bold">
                  1
                </span>
                Select Pieces to Return
              </h2>
              <span className="text-xs font-mono text-neutral-500">
                {selectedCount} Selected
              </span>
            </div>

            <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
              {order.items?.map((item) => {
                const isChecked = Boolean(selectedItems[item.id]);

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <label className="flex items-center gap-4 cursor-pointer select-none flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleItemToggle(item.id)}
                        className="w-4 h-4 accent-[#B2A376] shrink-0"
                      />
                      <div className="relative w-16 h-18 bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden border border-black/10 dark:border-white/10">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-macsans font-bold text-sm text-neutral-900 dark:text-white">
                          {item.name}
                        </h4>
                        <p className="text-[11px] font-proda text-neutral-500 mt-0.5">
                          Size {item.size} • {item.gender} {item.selectedColor?.name ? `• ${item.selectedColor.name}` : ""}
                        </p>
                        <p className="text-xs font-mono font-bold text-[#807248] dark:text-[#d3c59a] mt-0.5">
                          {item.price}
                        </p>
                      </div>
                    </label>

                    {isChecked && (
                      <div className="sm:w-64">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                          Return Reason
                        </label>
                        <select
                          value={selectedItems[item.id]}
                          onChange={(e) => handleReasonChange(item.id, e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-black/15 dark:border-white/15 text-xs font-macsans text-neutral-900 dark:text-white focus:outline-none focus:border-[#B2A376]"
                        >
                          <option value="Size / Fit Issue">Size / Fit Issue</option>
                          <option value="Item Not As Described">Item Not As Described</option>
                          <option value="Fabric / Condition Concern">Fabric / Condition Concern</option>
                          <option value="Changed Mind / Dislike">Changed Mind / Dislike</option>
                          <option value="Defective / Damaged">Defective / Damaged</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Handover Method */}
          <div className="p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <h2 className="text-base font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#B2A376] text-black flex items-center justify-center text-xs font-mono font-bold">
                  2
                </span>
                Choose Return Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-5 border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  returnMethod === "outlet"
                    ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white"
                    : "border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-black/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="returnMethod"
                    value="outlet"
                    checked={returnMethod === "outlet"}
                    onChange={() => setReturnMethod("outlet")}
                    className="accent-[#B2A376]"
                  />
                  <div>
                    <h4 className="font-macsans font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                      Physical Outlet Drop-off
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Recommended • Instant Processing
                    </span>
                  </div>
                </div>
                <p className="text-xs font-proda text-neutral-500">
                  Drop off at any Thriftable physical outlet with your RMA number. Immediate authentication and instant reimbursement.
                </p>
              </label>

              <label
                className={`p-5 border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  returnMethod === "courier"
                    ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white"
                    : "border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-black/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="returnMethod"
                    value="courier"
                    checked={returnMethod === "courier"}
                    onChange={() => setReturnMethod("courier")}
                    className="accent-[#B2A376]"
                  />
                  <div>
                    <h4 className="font-macsans font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                      Doorstep Courier Pickup
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Scheduled in 24–48 hrs
                    </span>
                  </div>
                </div>
                <p className="text-xs font-proda text-neutral-500">
                  Our courier partner will collect the packaged pieces from your shipping address.
                </p>
              </label>
            </div>
          </div>

          {/* Step 3: Refund Resolution */}
          <div className="p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <h2 className="text-base font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#B2A376] text-black flex items-center justify-center text-xs font-mono font-bold">
                  3
                </span>
                Refund Preference
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-5 border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  returnResolution === "credit"
                    ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white"
                    : "border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-black/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="returnResolution"
                    value="credit"
                    checked={returnResolution === "credit"}
                    onChange={() => setReturnResolution("credit")}
                    className="accent-[#B2A376]"
                  />
                  <div>
                    <h4 className="font-macsans font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                      Store Credit (+10% Bonus)
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Extra 10% value added to your balance
                    </span>
                  </div>
                </div>
                <p className="text-xs font-proda text-neutral-500">
                  Instant credit ready for the next weekly drop, with an additional 10% bonus on returned item values.
                </p>
              </label>

              <label
                className={`p-5 border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  returnResolution === "refund"
                    ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white"
                    : "border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-black/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="returnResolution"
                    value="refund"
                    checked={returnResolution === "refund"}
                    onChange={() => setReturnResolution("refund")}
                    className="accent-[#B2A376]"
                  />
                  <div>
                    <h4 className="font-macsans font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                      Original Payment Method
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Standard Bank Processing
                    </span>
                  </div>
                </div>
                <p className="text-xs font-proda text-neutral-500">
                  Direct refund back to your payment card or bank account in 3–5 business days.
                </p>
              </label>
            </div>

            {/* Optional Notes */}
            <div className="pt-2">
              <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Additional Notes or Condition Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Let our curators know any specific feedback..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-black/15 dark:border-white/15 text-xs font-macsans text-neutral-900 dark:text-white focus:outline-none focus:border-[#B2A376]"
              />
            </div>
          </div>

          {/* Step 4: Policy & Submit */}
          <div className="p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreePolicy}
                onChange={(e) => setAgreePolicy(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#B2A376]"
              />
              <span className="text-xs font-proda text-neutral-700 dark:text-neutral-300 leading-relaxed">
                I confirm that the garments have all original Thriftable tags attached, are unwashed, and are in the same condition as delivered.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || selectedCount === 0 || !agreePolicy}
              className="group relative w-full py-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest text-center shadow-lg overflow-hidden transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
              <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                {isSubmitting
                  ? "Generating Return Authorization..."
                  : `Submit Return for ${selectedCount} ${selectedCount === 1 ? "Piece" : "Pieces"} →`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
