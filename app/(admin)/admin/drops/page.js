"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const INITIAL_DROPS = [
  {
    id: "drop-14",
    title: "90s Tokyo Streetwear & Harajuku Archive",
    release_date: "2026-09-04T20:00:00Z",
    pieces_count: 18,
    status: "Scheduled",
    early_access: "15 min VIP Early Access",
    theme: "Streetwear & Outerwear",
  },
  {
    id: "drop-13",
    title: "Heritage British Wool & Savile Row Tailoring",
    release_date: "2026-08-28T20:00:00Z",
    pieces_count: 14,
    status: "Live",
    early_access: "Active Public Drop",
    theme: "Tailoring & Overcoats",
  },
  {
    id: "drop-12",
    title: "Midwest Rugged Workwear & Selvage Denim",
    release_date: "2026-08-21T20:00:00Z",
    pieces_count: 22,
    status: "Archived",
    early_access: "Sold Out",
    theme: "Carhartt & Levi's Big E",
  },
];

export default function AdminDropsPage() {
  const [drops, setDrops] = useState(INITIAL_DROPS);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const supabase = useMemo(() => createClient(), []);

  const [newDrop, setNewDrop] = useState({
    title: "",
    releaseDate: "2026-09-11T20:00",
    piecesCount: 16,
    theme: "Vintage Leather & Racing Jackets",
    earlyAccess: "15 min VIP Early Access",
  });

  // Fetch Drops from Supabase
  const fetchDrops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("drops")
        .select("*")
        .order("release_date", { ascending: false });

      if (!error && data && data.length > 0) {
        setDrops(data);
      } else {
        setDrops(INITIAL_DROPS);
      }
    } catch (err) {
      console.warn("Could not fetch drops from Supabase, using defaults:", err);
      setDrops(INITIAL_DROPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrops();
  }, [supabase]);

  const handleCreateDrop = async (e) => {
    e.preventDefault();
    if (!newDrop.title.trim()) return;

    setIsSubmitting(true);
    const dropId = `drop-${Date.now()}`;
    const payload = {
      id: dropId,
      title: newDrop.title.trim(),
      theme: newDrop.theme.trim(),
      pieces_count: Number(newDrop.piecesCount) || 15,
      release_date: new Date(newDrop.releaseDate).toISOString(),
      status: "Scheduled",
      early_access: newDrop.earlyAccess,
    };

    try {
      const { error } = await supabase.from("drops").insert(payload);

      setDrops([payload, ...drops]);
      setIsCreateOpen(false);
      setNewDrop({
        title: "",
        releaseDate: "2026-09-11T20:00",
        piecesCount: 16,
        theme: "Vintage Leather & Racing Jackets",
        earlyAccess: "15 min VIP Early Access",
      });

      if (!error) {
        setSuccessMsg(`Drop capsule "${payload.title}" saved to Supabase drops table.`);
      } else {
        setSuccessMsg(`Drop capsule scheduled locally (${error.message}).`);
      }
    } catch (err) {
      console.warn("Create drop exception:", err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-calluna font-semibold">
            Drop Release Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
            Weekly Capsule Drop Releases
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-[#B2A376] text-black font-calluna text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer"
        >
          + Schedule New Capsule Drop
        </button>
      </div>

      {/* Alert message */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
          ✓ {successMsg}
        </div>
      )}

      {/* Drop Releases List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs font-calluna text-neutral-400 border border-black/10 dark:border-white/10">
            <div className="w-6 h-6 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading capsule drops from database...
          </div>
        ) : (
          drops.map((drop) => (
            <div
              key={drop.id}
              className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#B2A376]/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-calluna tracking-wider text-neutral-400 uppercase">
                    {drop.theme}
                  </span>
                </div>

                <h3 className="text-lg font-macsans font-bold text-neutral-900 dark:text-white">
                  {drop.title}
                </h3>

                <p className="text-xs font-proda text-neutral-500">
                  Launch: {new Date(drop.release_date || drop.releaseDate).toLocaleString([], { dateStyle: "full", timeStyle: "short" })}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right font-mono">
                  <span className="text-sm font-bold font-logo text-neutral-900 dark:text-white block">
                    {drop.pieces_count || drop.piecesCount || 15} Garments
                  </span>
                  <span className="text-[11px] text-neutral-400 font-proda">Curated Capsule</span>
                </div>

                <Link
                  href="/shop"
                  target="_blank"
                  className="px-4 py-2 border border-black/10 dark:border-white/10 hover:border-[#B2A376] text-xs font-sans uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:text-[#B2A376] transition-colors"
                >
                  Preview →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Drop Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 max-w-xl w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <h3 className="text-lg font-macsans font-bold text-neutral-900 dark:text-white uppercase">
                Schedule Archival Drop Release
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDrop} className="space-y-4 text-xs font-macsans">
              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                  Drop Title
                </label>
                <input
                  type="text"
                  required
                  value={newDrop.title}
                  onChange={(e) => setNewDrop({ ...newDrop, title: e.target.value })}
                  placeholder="e.g. 80s Italian Leather & Moto Jackets Drop #15"
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white focus:outline-none focus:border-[#B2A376]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                    Release Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newDrop.releaseDate}
                    onChange={(e) => setNewDrop({ ...newDrop, releaseDate: e.target.value })}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                    Total Garments in Capsule
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDrop.piecesCount}
                    onChange={(e) => setNewDrop({ ...newDrop, piecesCount: Number(e.target.value) })}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                  Theme Tag
                </label>
                <input
                  type="text"
                  value={newDrop.theme}
                  onChange={(e) => setNewDrop({ ...newDrop, theme: e.target.value })}
                  placeholder="e.g. Rare Denim & Selvedge Archive"
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white focus:outline-none focus:border-[#B2A376]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 font-mono text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#B2A376] text-black font-mono text-xs uppercase font-bold hover:opacity-90 cursor-pointer"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Drop Capsule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
