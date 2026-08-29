"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

const INITIAL_PROMOS = [
  { code: "THRIFT10", discount: "10% Off", type: "percent", status: "Active", uses: 42 },
  { code: "VINTAGE20", discount: "20% Off ($150+)", type: "percent", status: "Active", uses: 18 },
  { code: "FREESHIP", discount: "Free Carbon Neutral Shipping", type: "shipping", status: "Active", uses: 65 },
];

export default function AdminSettingsPage() {
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("15");
  const [shippingThreshold, setShippingThreshold] = useState("100");
  const [standardShipping, setStandardShipping] = useState("0.00");
  const [expressShipping, setExpressShipping] = useState("15.00");
  const [conciergeEmail, setConciergeEmail] = useState("concierge@thriftable.archive");
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Fetch Settings & Promos from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch Promos
        const { data: promoData } = await supabase.from("promos").select("*").order("created_at", { ascending: false });
        if (promoData && promoData.length > 0) {
          setPromos(
            promoData.map((p) => ({
              code: p.code,
              discount: p.discount_text || `${p.discount_percent || 10}% Off`,
              type: "percent",
              status: p.status || "Active",
              uses: p.uses || 0,
            }))
          );
        }

        // 2. Fetch Store Settings
        const { data: settingsData } = await supabase.from("store_settings").select("*").eq("id", "global").maybeSingle();
        if (settingsData) {
          if (settingsData.concierge_email) setConciergeEmail(settingsData.concierge_email);
          if (settingsData.standard_shipping !== undefined) setStandardShipping(String(settingsData.standard_shipping));
          if (settingsData.express_shipping !== undefined) setExpressShipping(String(settingsData.express_shipping));
          if (settingsData.free_shipping_threshold !== undefined) setShippingThreshold(String(settingsData.free_shipping_threshold));
        }
      } catch (err) {
        console.warn("Failed to load settings from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const handleAddPromo = async (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const formattedCode = newCode.trim().toUpperCase();
    const newPromoObj = {
      id: `promo-${Date.now()}`,
      code: formattedCode,
      discount_text: `${newDiscount}% Off`,
      discount_percent: Number(newDiscount) || 10,
      uses: 0,
      status: "Active",
    };

    setPromos([
      ...promos,
      {
        code: formattedCode,
        discount: `${newDiscount}% Off`,
        type: "percent",
        status: "Active",
        uses: 0,
      },
    ]);
    setNewCode("");

    try {
      const { error } = await supabase.from("promos").insert(newPromoObj);
      if (!error) {
        setSaveMsg(`Promo code ${formattedCode} saved to Supabase.`);
      } else {
        setSaveMsg(`Promo code created locally.`);
      }
    } catch (err) {
      console.warn("Promo save exception:", err);
    }

    setTimeout(() => setSaveMsg(""), 3500);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveMsg("Saving parameters to Supabase...");

    try {
      const payload = {
        id: "global",
        concierge_email: conciergeEmail,
        standard_shipping: parseFloat(standardShipping) || 0,
        express_shipping: parseFloat(expressShipping) || 15,
        free_shipping_threshold: parseFloat(shippingThreshold) || 100,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("store_settings").upsert(payload);
      if (!error) {
        setSaveMsg("Store settings updated successfully in Supabase.");
      } else {
        setSaveMsg("Settings updated locally.");
      }
    } catch (err) {
      console.warn("Save settings exception:", err);
    }

    setTimeout(() => setSaveMsg(""), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-calluna font-semibold">
            Store Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
            Global Settings & Promo Codes
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-5 py-2.5 bg-[#B2A376] text-black font-calluna text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer"
        >
          Save Configuration
        </button>
      </div>

      {/* Save Alert */}
      {saveMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
          ✓ {saveMsg}
        </div>
      )}

      {/* Grid: Promo Codes & Shipping Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Promo Codes Manager */}
        <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white pb-3 border-b border-black/10 dark:border-white/10">
            Active Promo Vouchers
          </h3>

          <div className="divide-y divide-black/10 dark:divide-white/10">
            {promos.map((p, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between font-proda text-xs">
                <div>
                  <span className="font-bold text-[#807248] dark:text-[#d3c59a] tracking-widest block text-sm">
                    {p.code}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {p.discount} • {p.uses} redeemed
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 uppercase">
                  ● {p.status}
                </span>
              </div>
            ))}
          </div>

          {/* Add Promo Code Form */}
          <form onSubmit={handleAddPromo} className="pt-4 border-t border-black/10 dark:border-white/10 space-y-3">
            <span className="text-xs font-proda uppercase text-neutral-400 font-bold block">
              + Issue New Promo Code
            </span>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="CODE (e.g. DROP15)"
                className="col-span-2 p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-macsans uppercase text-neutral-900 dark:text-white"
              />
              <button
                type="submit"
                className="p-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-calluna uppercase font-bold cursor-pointer"
              >
                Add Code
              </button>
            </div>
          </form>
        </div>

        {/* Shipping & Store Policy */}
        <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white pb-3 border-b border-black/10 dark:border-white/10">
            Fulfillment & Concierge Parameters
          </h3>

          <div className="space-y-4 text-xs font-macsans">
            <div>
              <label className="block uppercase font-bold text-neutral-500 mb-1 font-macsans">
                Concierge Contact Email
              </label>
              <input
                type="email"
                value={conciergeEmail}
                onChange={(e) => setConciergeEmail(e.target.value)}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-macsans tracking-wider"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-proda">
                  Standard Tracked Rate ($)
                </label>
                <input
                  type="text"
                  value={standardShipping}
                  onChange={(e) => setStandardShipping(e.target.value)}
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-macsans"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-macsans">
                  Express Courier Rate ($)
                </label>
                <input
                  type="text"
                  value={expressShipping}
                  onChange={(e) => setExpressShipping(e.target.value)}
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-macsans"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase font-bold text-neutral-500 mb-1 font-proda">
                Free Shipping Threshold ($)
              </label>
              <input
                type="text"
                value={shippingThreshold}
                onChange={(e) => setShippingThreshold(e.target.value)}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-macsans"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
