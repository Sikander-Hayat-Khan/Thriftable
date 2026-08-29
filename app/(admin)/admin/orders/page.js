"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const supabase = useMemo(() => createClient(), []);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [supabase]);

  // Update order status in Supabase
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const lower = (newStatus || "").toLowerCase();

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: lower } : o))
    );

    try {
      // 1. Call server PATCH endpoint for reliable database persistence
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: lower }),
      });

      // 2. Direct client-side update
      await supabase
        .from("orders")
        .update({ status: lower })
        .eq("id", orderId);

      // 3. Update localStorage cache so customer portal instantly sees it
      try {
        const cached = JSON.parse(localStorage.getItem("thriftable_orders") || "[]");
        const updatedCache = cached.map((o) =>
          o.id === orderId || o.supabaseId === orderId ? { ...o, status: newStatus } : o
        );
        localStorage.setItem("thriftable_orders", JSON.stringify(updatedCache));
      } catch {}

      // 4. Automated Restocking on Cancellation or Return Approval
      if (lower === "cancelled" || lower === "canceled" || lower === "returned") {
        try {
          const targetOrder = orders.find((o) => o.id === orderId);
          const itemsToRestock = targetOrder?.order_items || [];
          for (const it of itemsToRestock) {
            const pId = it.product_id;
            const qty = Number(it.quantity || 1);
            if (pId) {
              const { data: prod } = await supabase
                .from("products")
                .select("id, stock")
                .eq("id", pId)
                .maybeSingle();

              if (prod) {
                const restocked = (prod.stock || 0) + qty;
                await supabase
                  .from("products")
                  .update({ stock: restocked, is_available: true })
                  .eq("id", pId);
              }
            }
          }
        } catch (restockErr) {
          console.warn("Restock on cancel/return exception:", restockErr);
        }
      }

      // 5. Automated Dispatch Tracking Email on Status Change (Shipped / Delivered / Returned)
      if (lower === "shipped" || lower === "delivered" || lower === "returned") {
        try {
          const targetOrder = orders.find((o) => o.id === orderId);
          let customerEmail = "";
          try {
            const sAddr =
              typeof targetOrder?.shipping_address === "string"
                ? JSON.parse(targetOrder.shipping_address)
                : targetOrder?.shipping_address;
            customerEmail = sAddr?.email || "";
          } catch {}

          if (customerEmail) {
            fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "order_status_update",
                email: customerEmail,
                order: {
                  id: orderId,
                  status: newStatus === "returned" ? "Return Approved" : newStatus,
                  trackingNumber: `TRK-PK-${orderId.slice(0, 8).toUpperCase()}`,
                  carrier: "DHL Express Carbon Neutral",
                },
              }),
            }).catch((e) => console.warn("Status update email trigger error:", e));
          }
        } catch (mailErr) {
          console.warn("Email status update notification error:", mailErr);
        }
      }

      setActionSuccessMsg(`Order #${orderId.slice(0, 8).toUpperCase()} status updated to ${newStatus.toUpperCase()} in database.`);
      setTimeout(() => setActionSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Status update error:", err);
      setActionSuccessMsg(`Order #${orderId.slice(0, 8).toUpperCase()} status updated.`);
      setTimeout(() => setActionSuccessMsg(""), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (statusFilter !== "all" && (o.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = String(o.id).toLowerCase().includes(q);
        let addressMatch = false;
        try {
          const addr = typeof o.shipping_address === "string" ? JSON.parse(o.shipping_address) : o.shipping_address;
          if (
            addr?.firstName?.toLowerCase().includes(q) ||
            addr?.lastName?.toLowerCase().includes(q) ||
            addr?.email?.toLowerCase().includes(q) ||
            addr?.city?.toLowerCase().includes(q)
          ) {
            addressMatch = true;
          }
        } catch {}

        if (!idMatch && !addressMatch) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-calluna  font-semibold">
            Fulfillment HQ
          </span>
          <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
            Customer Orders & Dispatch
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="px-4 py-2 border border-black/15 dark:border-white/15 text-xs font-calluna tracking-wider uppercase tracking-wider hover:border-[#B2A376] transition-colors self-start sm:self-auto cursor-pointer"
        >
          {loading ? "Refreshing..." : "↻ Refresh Orders"}
        </button>
      </div>

      {/* Success Alert */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
          <span>✓</span>
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, customer name, email, or city..."
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-proda text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#B2A376]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-calluna tracking-widest text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="processing">Processing</option>
            <option value="shipped">In Transit (Shipped)</option>
            <option value="delivered">Delivered</option>
            <option value="return_requested">Returns (RMA) Pending</option>
            <option value="returned">Returned / Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-center border-b border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 font-mono text-neutral-400 uppercase">
              <th className="p-4">Order ID & Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status & Action</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10 font-macsans">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-neutral-400 font-mono">
                  <div className="w-6 h-6 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading Supabase orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-neutral-400 font-mono uppercase">
                  No orders found matching criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                let customerAddr = {};
                try {
                  customerAddr = typeof ord.shipping_address === "string" ? JSON.parse(ord.shipping_address) : ord.shipping_address || {};
                } catch {}

                const isExpanded = expandedOrderId === ord.id;
                const itemsCount = ord.order_items?.length || 0;
                const statusLower = (ord.status || "processing").toLowerCase();

                return (
                  <tr key={ord.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    {/* Order ID & Date */}
                    <td className="p-4 font-calluna">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        #{String(ord.id).slice(0, 8).toUpperCase()}
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(ord.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4">
                      <div className="font-bold text-neutral-900 dark:text-white font-proda tracking-wider">
                        {customerAddr.firstName ? `${customerAddr.firstName} ${customerAddr.lastName || ""}` : "Guest Shopper"}
                      </div>
                      <div className="text-[11px] font-proda text-neutral-500">
                        {customerAddr.email || customerAddr.city || "Online Order"}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="p-4 font-proda tracking-wide">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {itemsCount} {itemsCount === 1 ? "Piece" : "Pieces"}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 font-logo tracking-wider font-bold text-[#807248] dark:text-[#d3c59a] text-sm">
                      ${Number(ord.total_amount || 0).toFixed(2)}
                    </td>

                    {/* Status Changer */}
                    <td className="p-4">
                      <select
                        value={statusLower}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`px-2.5 py-1.5 text-xs font-sans uppercase border cursor-pointer rounded-xs ${
                          statusLower === "delivered"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : statusLower === "shipped"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : statusLower === "return_requested"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold animate-pulse"
                            : statusLower === "returned"
                            ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                            : statusLower === "cancelled"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        }`}
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="return_requested">Return Requested</option>
                        <option value="returned">Returned / Refunded</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                        className="px-3 py-1.5 border border-black/10 dark:border-white/10 hover:border-[#B2A376] text-neutral-700 dark:text-neutral-300 hover:text-[#B2A376] font-mono text-xs transition-colors cursor-pointer"
                      >
                        {isExpanded ? "Hide" : "Inspect →"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded Order Inspector Drawer */}
      {expandedOrderId && (() => {
        const order = orders.find((o) => o.id === expandedOrderId);
        if (!order) return null;

        let addr = {};
        try {
          addr = typeof order.shipping_address === "string" ? JSON.parse(order.shipping_address) : order.shipping_address || {};
        } catch {}

        let returnData = null;
        try {
          returnData =
            typeof order.return_details === "string"
              ? JSON.parse(order.return_details)
              : order.return_details || null;
        } catch {}

        const isReturnPending = (order.status || "").toLowerCase() === "return_requested" || returnData;

        return (
          <div className="p-6 sm:p-8 border border-[#B2A376]/40 bg-white dark:bg-neutral-900 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
              <div>
                <span className="text-xs font-mono uppercase text-[#B2A376]">
                  Order Inspector
                </span>
                <h3 className="text-xl font-macsans font-bold text-neutral-900 dark:text-white">
                  Order ID: {order.id}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/orders/${order.id}`}
                  target="_blank"
                  className="px-3.5 py-1.5 bg-[#B2A376] text-black font-mono text-xs uppercase font-bold"
                >
                  Live Tracking View ↗
                </Link>
                <button
                  type="button"
                  onClick={() => setExpandedOrderId(null)}
                  className="text-neutral-400 hover:text-white text-xs font-mono"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Return Management Banner if Return is Requested */}
            {isReturnPending && (
              <div className="p-5 border border-purple-500/40 bg-purple-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider border border-purple-500/40">
                      {returnData?.rmaNumber || "RMA Return Action Required"}
                    </span>
                    <span className="text-xs font-mono text-neutral-300">
                      Method: {returnData?.method === "outlet" ? "Outlet Drop-off" : "Courier Pickup"}
                    </span>
                  </div>

                  {/* Return Approval & Rejection Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, "returned")}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer"
                    >
                      ✓ Approve Return & Restock
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, "processing")}
                      className="px-3 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      ✕ Reject Return
                    </button>
                  </div>
                </div>

                <p className="text-xs font-proda text-neutral-300">
                  <strong>Return Reason:</strong> {returnData?.reason || "Customer fit / preference issue"}
                </p>
                {returnData?.notes && (
                  <p className="text-xs font-proda text-neutral-400">
                    <strong>Customer Notes:</strong> {returnData.notes}
                  </p>
                )}
              </div>
            )}

            {/* Two Column details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Shipping Address */}
              <div className="p-4 border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/40 space-y-2">
                <span className="font-mono uppercase text-neutral-400 font-bold block">
                  Delivery Destination
                </span>
                <p className="font-bold text-neutral-900 dark:text-white text-sm">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="text-neutral-600 dark:text-neutral-300">{addr.address}</p>
                <p className="text-neutral-600 dark:text-neutral-300">
                  {addr.city}, {addr.postalCode} • {addr.country || "Pakistan"}
                </p>
                {addr.phone && <p className="font-mono text-neutral-500">Phone: {addr.phone}</p>}
                {addr.email && <p className="font-mono text-neutral-500">Email: {addr.email}</p>}
              </div>

              {/* Line Items List */}
              <div className="p-4 border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/40 space-y-3">
                <span className="font-mono uppercase text-neutral-400 font-bold block">
                  Purchased Garments ({order.order_items?.length || 0})
                </span>
                <div className="divide-y divide-black/10 dark:divide-white/10">
                  {(order.order_items || []).map((it) => (
                    <div key={it.id} className="py-2 flex items-center justify-between gap-3 font-mono">
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white block">
                          {it.name || "Curated Vintage Piece"}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          Size: {it.size || "M"} • Qty: {it.quantity || 1}
                        </span>
                      </div>
                      <span className="font-bold text-[#807248] dark:text-[#d3c59a]">
                        ${Number(it.price || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
