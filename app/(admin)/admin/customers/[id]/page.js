"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id;

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerDossier() {
      try {
        setLoading(true);
        const supabase = createClient();

        // 1. Fetch Profile if UUID or email
        let profile = null;
        if (customerId) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .or(`id.eq.${customerId},email.eq.${customerId}`)
            .maybeSingle();

          profile = data;
        }

        // 2. Fetch Orders for this customer
        const { data: allOrders } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false });

        const matchingOrders = (allOrders || []).filter((ord) => {
          if (ord.user_id && ord.user_id === customerId) return true;
          if (profile && ord.user_id === profile.id) return true;
          try {
            const addr = typeof ord.shipping_address === "string" ? JSON.parse(ord.shipping_address) : ord.shipping_address;
            if (addr?.email && (addr.email === customerId || (profile && addr.email === profile.email))) return true;
            if (ord.id === customerId) return true;
          } catch {}
          return false;
        });

        // Resolve customer details
        let primaryAddr = {};
        if (matchingOrders.length > 0) {
          try {
            primaryAddr = typeof matchingOrders[0].shipping_address === "string" 
              ? JSON.parse(matchingOrders[0].shipping_address) 
              : matchingOrders[0].shipping_address || {};
          } catch {}
        }

        const resolvedCustomer = {
          id: customerId,
          name: profile?.full_name || (primaryAddr.firstName ? `${primaryAddr.firstName} ${primaryAddr.lastName || ""}`.trim() : "Valued Customer"),
          email: profile?.email || primaryAddr.email || "No email on record",
          phone: primaryAddr.phone || "Not provided",
          isRegistered: Boolean(profile),
          createdAt: profile?.created_at || matchingOrders[0]?.created_at || new Date().toISOString(),
          address: primaryAddr,
        };

        setCustomer(resolvedCustomer);
        setOrders(matchingOrders);
      } catch (err) {
        console.error("Failed to load customer dossier:", err);
      } finally {
        setLoading(false);
      }
    }

    if (customerId) {
      loadCustomerDossier();
    }
  }, [customerId]);

  const totalSpend = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const tier =
    totalSpend >= 300
      ? { name: "VIP Curator", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" }
      : totalSpend >= 100
      ? { name: "Gold Tier", color: "bg-[#B2A376]/10 text-[#807248] dark:text-[#d3c59a] border-[#B2A376]/30" }
      : { name: "Archival Member", color: "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-700/30" };

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-calluna tracking-wider text-[#B2A376] hover:underline mb-4"
        >
          ← Back to Customer Directory
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-calluna font-semibold">
              Customer Dossier
            </span>
            <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
              {customer?.name || "Customer Account"}
            </h1>
            <p className="text-xs font-calluna tracking-wider text-neutral-400 mt-0.5">
              Account ID: {customerId}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-sans uppercase font-bold border ${tier.color}`}>
              {tier.name}
            </span>
            <span className="px-3 py-1 text-xs font-sans uppercase border bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
              {customer?.isRegistered ? "Registered" : "Guest"}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-calluna tracking-wider text-neutral-400">
          <div className="w-6 h-6 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Retrieving customer history from Supabase...
        </div>
      ) : (
        <>
          {/* Key Lifetime Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900">
              <span className="text-xs font-calluna uppercase text-neutral-400">Lifetime Spend</span>
              <div className="text-3xl font-logo font-bold text-[#807248] dark:text-[#d3c59a] mt-2">
                ${totalSpend.toFixed(2)}
              </div>
              <span className="text-[11px] font-proda text-neutral-500 mt-1 block">
                Total processed archive acquisitions
              </span>
            </div>

            <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900">
              <span className="text-xs font-calluna uppercase text-neutral-400">Total Orders</span>
              <div className="text-3xl font-logo font-bold text-neutral-900 dark:text-white mt-2">
                {orders.length}
              </div>
              <span className="text-[11px] font-proda text-neutral-500 mt-1 block">
                Completed & in-transit packages
              </span>
            </div>

            <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900">
              <span className="text-xs font-calluna uppercase text-neutral-400">Member Since</span>
              <div className="text-lg font-calluna font-bold text-neutral-900 dark:text-white mt-3">
                {new Date(customer.createdAt).toLocaleDateString([], { dateStyle: "long" })}
              </div>
              <span className="text-[11px] font-proda text-neutral-500 mt-1 block">
                Initial registration timestamp
              </span>
            </div>
          </div>

          {/* Contact Details & Default Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 space-y-3">
              <h3 className="font-macsans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white pb-2 border-b border-black/10 dark:border-white/10">
                Contact Parameters
              </h3>
              <div className="space-y-2 text-xs font-proda">
                <div>
                  <span className="text-neutral-400 block font-calluna">Primary Email:</span>
                  <span className="text-neutral-900 dark:text-white font-bold">{customer.email}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-calluna">Contact Phone:</span>
                  <span className="text-neutral-900 dark:text-white">{customer.phone}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 space-y-3">
              <h3 className="font-macsans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white pb-2 border-b border-black/10 dark:border-white/10">
                Primary Shipping Address
              </h3>
              <div className="text-xs font-proda text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {customer.address?.address ? (
                  <>
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {customer.address.firstName} {customer.address.lastName}
                    </p>
                    <p>{customer.address.address}</p>
                    <p>{customer.address.city}, {customer.address.postalCode}</p>
                    <p>{customer.address.country || "Pakistan"}</p>
                  </>
                ) : (
                  <p className="text-neutral-400 font-calluna">No physical address on file yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Orders History Records */}
          <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-4">
            <h3 className="font-macsans font-bold text-base text-neutral-900 dark:text-white pb-3 border-b border-black/10 dark:border-white/10">
              Purchasing History Records ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs font-calluna text-neutral-400">
                No orders recorded under this account.
              </div>
            ) : (
              <div className="divide-y divide-black/10 dark:divide-white/10">
                {orders.map((ord) => {
                  const statusLower = (ord.status || "processing").toLowerCase();
                  const statusBadge =
                    statusLower === "delivered"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : statusLower === "shipped"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/30";

                  return (
                    <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-calluna font-bold text-xs text-neutral-900 dark:text-white">
                            #{String(ord.id).slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-sans uppercase border ${statusBadge}`}>
                            {ord.status || "Processing"}
                          </span>
                        </div>
                        <span className="text-[11px] font-proda text-neutral-400 mt-1 block">
                          Placed on {new Date(ord.created_at).toLocaleDateString([], { dateStyle: "medium" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-logo font-bold text-sm text-[#807248] dark:text-[#d3c59a]">
                            ${Number(ord.total_amount || 0).toFixed(2)}
                          </div>
                          <span className="text-[11px] font-proda text-neutral-400">
                            {ord.order_items?.length || 1} garment(s)
                          </span>
                        </div>

                        <Link
                          href={`/orders/${ord.id}`}
                          target="_blank"
                          className="px-3 py-1.5 border border-black/10 dark:border-white/10 hover:border-[#B2A376] text-xs font-sans uppercase text-neutral-700 dark:text-neutral-300 hover:text-[#B2A376] transition-colors"
                        >
                          View Receipt ↗
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
