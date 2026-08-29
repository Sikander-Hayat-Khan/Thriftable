"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Primary Super Admin check (only this email can manage admin roles)
  const isSuperAdmin = currentUserEmail?.trim().toLowerCase() === "skhan.bese23seecs@seecs.edu.pk";

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Check active admin user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserEmail(user.email || "");
        }

        // Fetch dynamic admin roster from API
        let adminEmailsList = ["skhan.bese23seecs@seecs.edu.pk"];
        let adminIdsList = [];
        try {
          const roleRes = await fetch("/api/admin/users/role");
          if (roleRes.ok) {
            const roleJson = await roleRes.json();
            if (roleJson.adminEmails) {
              adminEmailsList = roleJson.adminEmails.map((e) => e.toLowerCase());
            }
            if (roleJson.adminIds) {
              adminIdsList = roleJson.adminIds;
            }
          }
        } catch {}

        // 1. Fetch profiles
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*");

        // 2. Fetch orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*, order_items(*)");

        const ordersList = ordersData || [];
        const profilesList = profilesData || [];

        // Build customer map from both registered profiles and guest orders
        const customerMap = new Map();

        // Add registered profiles
        profilesList.forEach((prof) => {
          const profEmail = (prof.email || "").trim().toLowerCase();
          const isSuperAdminEmail = profEmail === "skhan.bese23seecs@seecs.edu.pk";
          const isAdm =
            prof.role === "admin" ||
            prof.is_admin === true ||
            isSuperAdminEmail ||
            adminEmailsList.includes(profEmail) ||
            adminIdsList.includes(prof.id);

          customerMap.set(prof.id || prof.email, {
            id: prof.id,
            name: prof.full_name || (isSuperAdminEmail ? "Sikander Hayat Khan" : "Registered Member"),
            email: prof.email,
            avatar: prof.avatar_url || null,
            isRegistered: true,
            role: isAdm ? "admin" : "customer",
            isAdmin: isAdm,
            isSuperAdminOwner: isSuperAdminEmail,
            createdAt: prof.updated_at || prof.created_at || new Date().toISOString(),
            orders: [],
            totalSpend: 0,
          });
        });

        // Add order details & guest purchasers
        ordersList.forEach((ord) => {
          let addr = {};
          try {
            addr = typeof ord.shipping_address === "string" ? JSON.parse(ord.shipping_address) : ord.shipping_address || {};
          } catch {}

          const emailKey = ord.user_id || addr?.email || `guest-${ord.id}`;
          const existing = customerMap.get(emailKey) || {
            id: ord.user_id || ord.id,
            name: addr.firstName ? `${addr.firstName} ${addr.lastName || ""}`.trim() : "Guest Shopper",
            email: addr.email || "No Email Provided",
            avatar: null,
            isRegistered: Boolean(ord.user_id),
            role: "customer",
            isAdmin: false,
            isSuperAdminOwner: false,
            createdAt: ord.created_at,
            orders: [],
            totalSpend: 0,
          };

          existing.orders.push(ord);
          existing.totalSpend += Number(ord.total_amount || 0);

          if (!customerMap.has(emailKey)) {
            customerMap.set(emailKey, existing);
          }
        });

        setCustomers(Array.from(customerMap.values()));
      } catch (err) {
        console.warn("Failed to load customer list:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  // Quick toggle admin privilege (Restricted strictly to Primary Super Admin)
  const toggleAdminPrivilege = async (customerId, targetRole) => {
    if (!isSuperAdmin) {
      alert("Permission Denied: Only the Primary Super Administrator (skhan.bese23seecs@seecs.edu.pk) is authorized to grant or revoke admin rights.");
      return;
    }

    try {
      const custObj = customers.find((c) => c.id === customerId);
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: customerId,
          email: custObj?.email || null,
          targetRole: targetRole,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to update role");
      }

      const isAdminBool = targetRole === "admin";
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? { ...c, role: targetRole, isAdmin: isAdminBool }
            : c
        )
      );

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer((prev) => ({
          ...prev,
          role: targetRole,
          isAdmin: isAdminBool,
        }));
      }
    } catch (err) {
      console.error("Failed to update role:", err);
      alert(`Could not update user role: ${err.message}`);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        String(c.id).toLowerCase().includes(q)
      );
    });
  }, [customers, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-calluna font-semibold">
            Archival Community
          </span>
          <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
            Customer Directory & Accounts
          </h1>
        </div>

        <div className="text-xs font-calluna tracking-wider text-neutral-400">
          Total Buyers: <strong className="text-neutral-900 dark:text-white font-logo">{customers.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, email, or account ID..."
          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-proda text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#B2A376]"
        />
      </div>

      {/* Customer Directory Table */}
      <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-center border-b border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 font-mono text-neutral-400 uppercase">
              <th className="p-2">Customer</th>
              <th className="p-2">Account Type</th>
              <th className="p-2">Orders Placed</th>
              <th className="p-2">Lifetime Spend</th>
              <th className="p-2">Loyalty Tier</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10 font-macsans">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-neutral-400 font-mono">
                  <div className="w-6 h-6 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading customer database...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-neutral-400 font-mono uppercase">
                  No customers found matching search.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((cust, idx) => {
                const orderCount = cust.orders.length;
                const tier =
                  cust.totalSpend >= 300
                    ? { name: "VIP Curator", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" }
                    : cust.totalSpend >= 100
                    ? { name: "Gold Tier", color: "bg-[#B2A376]/10 text-[#807248] dark:text-[#d3c59a] border-[#B2A376]/30" }
                    : { name: "Member", color: "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-700/30" };

                return (
                  <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold flex items-center justify-center font-proda tracking-wider text-xs shrink-0">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block text-sm font-proda">
                            {cust.name}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-500 font-calluna tracking-wider">
                            {cust.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Account Type & Admin Privilege */}
                    <td className="p-4 font-sans">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] uppercase border ${
                            cust.isRegistered ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-neutral-500/10 text-neutral-400 border-neutral-500/30"
                          }`}>
                            {cust.isRegistered ? "Member" : "Guest"}
                          </span>
                          {cust.isSuperAdminOwner ? (
                            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-[#B2A376]/20 text-[#B2A376] border border-[#B2A376]/50">
                              SUPER ADMIN (OWNER)
                            </span>
                          ) : cust.isAdmin ? (
                            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              ADMIN
                            </span>
                          ) : null}
                        </div>
                        {cust.isRegistered && (
                          cust.isSuperAdminOwner ? (
                            <span className="text-[10px] font-mono text-[#B2A376]/80">
                              Primary Authority
                            </span>
                          ) : isSuperAdmin ? (
                            <button
                              type="button"
                              onClick={() => toggleAdminPrivilege(cust.id, cust.isAdmin ? "customer" : "admin")}
                              className={`text-[10px] font-mono hover:underline cursor-pointer font-bold ${
                                cust.isAdmin
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-amber-400 hover:text-amber-300"
                              }`}
                            >
                              {cust.isAdmin ? "✕ Revoke Admin" : "+ Grant Admin Role"}
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-neutral-500">
                              {cust.isAdmin ? "Admin Staff" : "Customer"}
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    {/* Orders Placed */}
                    <td className="p-4 font-sans tracking-wider font-bold text-neutral-900 dark:text-white">
                      {orderCount} {orderCount === 1 ? "Order" : "Orders"}
                    </td>

                    {/* Total Spend */}
                    <td className="p-4 font-logo tracking-wider font-bold text-[#807248] dark:text-[#d3c59a] text-sm">
                      ${cust.totalSpend.toFixed(2)}
                    </td>

                    {/* Loyalty Tier */}
                    <td className="p-4 font-sans font-bold">
                      <span className={`px-2 py-0.5 text-[10px] uppercase border ${tier.color}`}>
                        {tier.name}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/customers/${encodeURIComponent(cust.id || cust.email)}`}
                          className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-[#B2A376] hover:text-black text-neutral-800 dark:text-neutral-200 font-calluna text-xs transition-colors"
                        >
                          Full Dossier ➔
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(cust)}
                          className="px-3 py-1.5 border border-black/10 dark:border-white/10 hover:border-[#B2A376] text-neutral-700 dark:text-neutral-300 hover:text-[#B2A376] font-sans text-xs transition-colors cursor-pointer"
                        >
                          Quick View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div>
                <span className="text-xs font-mono uppercase text-[#B2A376]">
                  Customer Dossier
                </span>
                <h3 className="text-xl font-macsans font-bold text-neutral-900 dark:text-white">
                  {selectedCustomer.name}
                </h3>
                <span className="text-xs font-mono text-neutral-400">
                  {selectedCustomer.email}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-black/10 dark:border-white/10">
                <span className="text-neutral-400 uppercase text-[10px]">Total Lifetime Orders</span>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {selectedCustomer.orders.length}
                </div>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-black/10 dark:border-white/10">
                <span className="text-neutral-400 uppercase text-[10px]">Total Archive Spend</span>
                <div className="text-2xl font-bold text-[#807248] dark:text-[#d3c59a] mt-1">
                  ${selectedCustomer.totalSpend.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                Order History Records
              </h4>

              {selectedCustomer.orders.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-neutral-400 border border-black/10 dark:border-white/10">
                  No purchase history on file yet.
                </div>
              ) : (
                <div className="divide-y divide-black/10 dark:divide-white/10 border border-black/10 dark:border-white/10">
                  {selectedCustomer.orders.map((ord) => (
                    <div key={ord.id} className="p-4 flex items-center justify-between gap-4 font-mono text-xs">
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          #{String(ord.id).slice(0, 8).toUpperCase()}
                        </span>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {new Date(ord.created_at).toLocaleDateString()} • {ord.status || "Processing"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-[#807248] dark:text-[#d3c59a]">
                          ${Number(ord.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
