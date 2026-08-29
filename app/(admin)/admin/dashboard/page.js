"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { catalogueItems } from "@/data/products";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("checking");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();
        const [{ data: orderData, error: orderErr }, { count: prodCount }] = await Promise.all([
          supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
          supabase.from("products").select("*", { count: "exact", head: true }),
        ]);

        if (!orderErr && orderData) {
          setOrders(orderData);
          setDbStatus("connected");
        } else {
          setDbStatus("error");
        }
      } catch (err) {
        console.warn("Dashboard data fetch exception:", err);
        setDbStatus("offline");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Compute Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const processingOrders = orders.filter((o) => (o.status || "").toLowerCase() === "processing").length;
  const shippedOrders = orders.filter((o) => (o.status || "").toLowerCase() === "shipped" || (o.status || "").toLowerCase() === "in transit").length;
  const deliveredOrders = orders.filter((o) => (o.status || "").toLowerCase() === "delivered").length;
  const totalStockItems = 65;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-calluna">
            HQ Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
            Archival Commerce Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory"
            className="px-4 py-2 bg-[#B2A376] text-black text-xs font-calluna uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
          >
            + Add Vintage Piece
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white text-xs font-calluna uppercase tracking-wider hover:border-[#B2A376] transition-colors"
          >
            Manage Orders →
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Gross Revenue */}
        <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col justify-around">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-calluna uppercase">
            <span>Gross Revenue</span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-logo font-bold text-neutral-900 dark:text-white">
              ${totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col justify-center">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-calluna uppercase">
            <span>Total Orders</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-logo font-bold text-neutral-900 dark:text-white">
              {totalOrders}
            </div>
          </div>
        </div>

        {/* Needs Fulfillment */}
        <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col justify-center">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-calluna uppercase">
            <span>Pending Dispatch</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-logo font-bold text-amber-600 dark:text-amber-400">
              {processingOrders}
            </div>
          </div>
        </div>

        {/* Active Archive Catalog */}
        <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col justify-center">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-calluna uppercase">
            <span>Archival Inventory</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-logo font-bold text-neutral-900 dark:text-white">
              {totalStockItems}
            </div>
          </div>
        </div>
      </div>

      {/* Fulfillment Status Pipeline Bar */}
      <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-macsans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">
            Order Fulfillment Pipeline
          </h3>
          <span className="text-xs font-proda tracking-wider text-neutral-400">
            {processingOrders} Processing • {shippedOrders} In Transit • {deliveredOrders} Delivered
          </span>
        </div>

        {/* Pipeline Bar */}
        <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${totalOrders > 0 ? (processingOrders / totalOrders) * 100 : 0}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title="Processing"
          />
          <div
            style={{ width: `${totalOrders > 0 ? (shippedOrders / totalOrders) * 100 : 0}%` }}
            className="bg-blue-500 h-full transition-all duration-500"
            title="Shipped"
          />
          <div
            style={{ width: `${totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title="Delivered"
          />
        </div>

        <div className="flex items-center gap-6 text-xs font-calluna tracking-wide text-neutral-500 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Processing ({processingOrders})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>In Transit ({shippedOrders})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Delivered ({deliveredOrders})</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Catalog Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Left 2 Cols: Recent Supabase Orders */}
        <div className="lg:col-span-2 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-4">
            <h3 className="font-macsans font-bold text-base text-neutral-900 dark:text-white">
              Recent Customer Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-calluna tracking-wider text-[#B2A376] hover:underline"
            >
              View all orders →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs font-calluna tracking-wider text-neutral-400">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-xs font-calluna tracking-wider text-neutral-400">
              No orders recorded in database yet.
            </div>
          ) : (
            <div className="divide-y divide-black/10 dark:divide-white/10">
              {orders.slice(0, 5).map((ord) => {
                let customerInfo = "Guest Customer";
                try {
                  const parsed = typeof ord.shipping_address === "string" ? JSON.parse(ord.shipping_address) : ord.shipping_address;
                  if (parsed?.firstName) customerInfo = `${parsed.firstName} ${parsed.lastName || ""}`.trim();
                  else if (parsed?.email) customerInfo = parsed.email;
                } catch {}

                const statusLower = (ord.status || "processing").toLowerCase();
                const statusBadge =
                  statusLower === "delivered"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : statusLower === "shipped"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : statusLower === "cancelled"
                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/30";

                return (
                  <div key={ord.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-calluna tracking-wider font-bold text-xs text-neutral-900 dark:text-white">
                          #{String(ord.id).slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-calluna uppercase border ${statusBadge}`}>
                          {ord.status || "Processing"}
                        </span>
                      </div>
                      <p className="text-xs font-proda text-neutral-500 mt-1">
                        {customerInfo} • {new Date(ord.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-logo tracking-wider font-bold text-sm text-[#807248] dark:text-[#d3c59a]">
                        ${Number(ord.total_amount || 0).toFixed(2)}
                      </div>
                      <span className="text-[11px] font-calluna tracking-wider text-neutral-400">
                        {ord.order_items?.length || 1} item(s)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
