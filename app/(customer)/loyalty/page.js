"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { toast } from "react-toastify";

const INITIAL_REWARDS = [
  {
    id: "rew-10",
    title: "$10 Archival Voucher",
    pointsCost: 100,
    discountValue: "$10 Off",
    description: "Valid across any vintage outerwear, footwear, or apparel haul.",
    minSpend: "$50",
    badge: "Most Popular",
    code: "THRIFT10-LOYALTY",
  },
  {
    id: "rew-ship",
    title: "Free Priority Dispatch",
    pointsCost: 150,
    discountValue: "Free Express ($22 Value)",
    description: "1-2 day express courier dispatch on your next archive order.",
    minSpend: "None",
    badge: "Fast Shipping",
    code: "EXPRESS-FREE",
  },
  {
    id: "rew-25",
    title: "$25 Vintage Curator Voucher",
    pointsCost: 250,
    discountValue: "$25 Off",
    description: "Applicable on rare archive jackets, leatherwear, and designer sunglasses.",
    minSpend: "$100",
    badge: "High Value",
    code: "VINTAGE25-CLUB",
  },
  {
    id: "rew-vip",
    title: "VIP Early Access Drop Pass",
    pointsCost: 500,
    discountValue: "2 Hr Early Access",
    description: "Exclusive 2-hour private window to shop weekly vintage drops before public release.",
    minSpend: "None",
    badge: "Exclusive",
    code: "VIP-EARLY-DROP",
  },
];

const TIERS = [
  {
    level: "01",
    name: "Archive Seeker",
    range: "0 – 249 pts",
    multiplier: "1.0x",
    highlight: "Entry Level",
    perks: [
      "1 point per $1 spent on all pieces",
      "Standard drop access on release days",
      "Digital order history & wishlist sync",
      "Birthday bonus voucher",
    ],
  },
  {
    level: "02",
    name: "Vintage Curator",
    range: "250 – 749 pts",
    multiplier: "1.25x",
    highlight: "Current Status",
    current: true,
    perks: [
      "1.25x points on every archival purchase",
      "1 hour early access to weekly vintage drops",
      "Free standard shipping on orders $100+",
      "Invitations to secret seasonal sales",
    ],
  },
  {
    level: "03",
    name: "Master Collector",
    range: "750+ pts",
    multiplier: "1.5x",
    highlight: "Top Tier",
    perks: [
      "1.5x points multiplier on all orders",
      "2 hours early access + drop reservations",
      "Complimentary priority express shipping",
      "Personal curation & sourcing concierge",
    ],
  },
];

const INITIAL_HISTORY = [
  {
    id: "tx-1",
    date: "Aug 24, 2026",
    action: "Order Purchase (Vintage Carhartt Detroit Jacket)",
    points: "+145",
    type: "earn",
  },
  {
    id: "tx-2",
    date: "Aug 18, 2026",
    action: "Redeemed $10 Archival Voucher",
    points: "-100",
    type: "redeem",
  },
  {
    id: "tx-3",
    date: "Aug 10, 2026",
    action: "Verified Sustainable Review & Photo Upload",
    points: "+25",
    type: "earn",
  },
  {
    id: "tx-4",
    date: "Jul 28, 2026",
    action: "Welcome Membership Bonus",
    points: "+50",
    type: "earn",
  },
];

export default function LoyaltyPage() {
  const { user } = useAuth();

  // Simulated Points State
  const [pointsBalance, setPointsBalance] = useState(340);
  const [claimedCodes, setClaimedCodes] = useState([]);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [copiedCode, setCopiedCode] = useState(null);

  // Compute tier progress
  const currentTier = useMemo(() => {
    if (pointsBalance >= 750) return TIERS[2];
    if (pointsBalance >= 250) return TIERS[1];
    return TIERS[0];
  }, [pointsBalance]);

  const nextTierPoints = 750;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((pointsBalance - 250) / (750 - 250)) * 100))
  );

  const handleRedeemReward = (reward) => {
    if (pointsBalance < reward.pointsCost) {
      toast.error(`You need ${reward.pointsCost - pointsBalance} more points to unlock this reward.`, {
        toastId: `insufficient-pts-${reward.id}`,
      });
      return;
    }

    const uniqueCode = `${reward.code}-${Math.floor(1000 + Math.random() * 9000)}`;
    setPointsBalance((prev) => prev - reward.pointsCost);
    setClaimedCodes((prev) => [
      {
        ...reward,
        code: uniqueCode,
        claimedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ]);

    setHistory((prev) => [
      {
        id: `tx-${Date.now()}`,
        date: "Today",
        action: `Redeemed ${reward.title}`,
        points: `-${reward.pointsCost}`,
        type: "redeem",
      },
      ...prev,
    ]);

    toast.success(`🎉 ${reward.title} unlocked! Code: ${uniqueCode}`, {
      toastId: `reward-success-${reward.id}`,
    });
  };

  const handleCopyCode = (code) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.info("Voucher code copied to clipboard!", { autoClose: 2000 });
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  return (
    <div className="min-h-screen w-full pt-20 sm:pt-24 pb-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* 1. Breadcrumb & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10 text-xs font-proda uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-bold">Loyalty Club</span>
          </div>
        </div>

        {/* 2. Hero / Header Banner */}
        <div className="pt-8 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase font-proda tracking-[0.55em] text-[#B2A376] font-semibold">
              Archival Rewards Program
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-logo font-extrabold tracking-wider text-neutral-900 dark:text-white mt-2">
              THRIFTABLE LOYALTY
            </h1>
            <p className="text-xs sm:text-sm font-proda text-neutral-600 dark:text-neutral-400 mt-2 max-w-xl leading-relaxed">
              Earn points when you shop vintage, choose sustainable items, or write reviews. Redeem them for cash vouchers and early access to new drops!
            </p>
          </div>

          {!user && (
            <div className="flex items-center gap-3 self-start md:self-end">
              <Link
                href="/login?next=/loyalty"
                className="group relative px-6 py-3.5 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer block border border-[#B2A376]"
              >
                <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                  Sign In to Track Points →
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* 3. Main Overview Card (Balance + Tier Progress) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Points Balance Card */}
          <div className="lg:col-span-5 p-8 sm:p-10 bg-[#B4A57A] dark:bg-neutral-900/60 border border-transparent dark:border-white/10 shadow-xl flex flex-col justify-between rounded-none">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-black/70 dark:text-neutral-400 font-semibold">
                  Available Balance
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-logo font-extrabold text-black dark:text-white tracking-tight">
                  {pointsBalance}
                </span>
                <span className="text-sm font-mono uppercase text-black/80 dark:text-neutral-400">
                  Points
                </span>
                <span className="text-5xl sm:text-6xl font-logo font-extrabold text-black dark:text-white tracking-tight">=</span>
                <span className="text-5xl sm:text-6xl font-logo font-extrabold text-black dark:text-white tracking-wide ml-5">$34</span>
              </div>

              <p className="text-xs font-proda text-black/80 dark:text-neutral-300 mt-2">
                Worth <span className="font-bold text-black dark:text-[#B2A376] font-mono">${(pointsBalance / 10).toFixed(0)}</span> in checkout discounts and reward vouchers.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-black/15 dark:border-white/10 flex items-center justify-between text-xs font-mono text-black/80 dark:text-neutral-400">
              <span>Lifetime Earned: 620 pts</span>
              <span>Total Saved: $20.00</span>
            </div>
          </div>

          {/* Tier Progress Card */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-black/10 dark:border-white/10">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#807248] dark:text-[#d3c59a] font-semibold">
                    Current Tier
                  </span>
                  <h3 className="text-2xl font-logo font-bold uppercase tracking-wider text-neutral-900 dark:text-white mt-0.5">
                    {currentTier.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase">
                    Multiplier
                  </span>
                  <p className="text-lg font-mono font-bold text-neutral-900 dark:text-white">
                    {currentTier.multiplier} Points
                  </p>
                </div>
              </div>

              {/* Progress to Next Tier */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Progress to Master Collector
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {nextTierPoints - pointsBalance} pts needed
                  </span>
                </div>
                <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 overflow-hidden rounded-2xl">
                  <div
                    className="h-full bg-[#B2A376] transition-all duration-700 ease-out rounded-2xl"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Active Claimed Vouchers (if any) */}
        {claimedCodes.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <span className="text-xs uppercase font-mono tracking-[0.25em] text-[#B2A376] font-semibold">
                Your Unlocked Rewards
              </span>
              <span className="text-xs font-mono text-neutral-500">
                [{claimedCodes.length} Active Vouchers]
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {claimedCodes.map((item, idx) => (
                <div
                  key={`${item.code}-${idx}`}
                  className="p-5 border border-[#B2A376]/40 bg-[#B2A376]/10 dark:bg-neutral-900 flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#807248] dark:text-[#d3c59a] font-bold">
                        {item.discountValue}
                      </span>
                      <h4 className="font-macsans font-bold text-sm text-neutral-900 dark:text-white mt-0.5">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {item.claimedAt}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-black/50 border border-black/10 dark:border-white/10">
                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white tracking-widest">
                      {item.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(item.code)}
                      className="text-[11px] font-mono uppercase font-bold text-[#807248] dark:text-[#d3c59a] hover:underline cursor-pointer"
                    >
                      {copiedCode === item.code ? "Copied ✓" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Ways to Earn Points Section */}
        <div className="mb-14">
          <div className="mb-8 border-b border-black/10 dark:border-white/10 pb-5">
            <span className="text-xs uppercase font-proda tracking-[0.55em] text-[#B2A376] font-semibold block mb-1">
              Accelerate Your Balance
            </span>
            <h2 className="text-2xl sm:text-3xl font-logo font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Ways to Earn Points
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white dark:bg-neutral-900/30">
              <span className="font-mono text-xs font-bold text-black py-1">
                01
              </span>
              <h4 className="font-macsans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white mt-4">
                Shop Vintage Drops
              </h4>
              <p className="text-xs font-proda text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Earn 1 point for every $1 spent across all curated collections, scaling with your member tier.
              </p>
              <span className="text-xs font-mono font-bold text-[#807248] dark:text-[#d3c59a] mt-3 block">
                +1 pt per $1
              </span>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900/30">
              <span className="font-mono text-xs font-bold text-black py-1">
                02
              </span>
              <h4 className="font-macsans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white mt-4">
                Circular Trade-In
              </h4>
              <p className="text-xs font-proda text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Send in verified archival pieces to be restored and given a second life through our circular program.
              </p>
              <span className="text-xs font-mono font-bold text-[#807248] dark:text-[#d3c59a] mt-3 block">
                +100 pts per item
              </span>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900/30">
              <span className="font-mono text-xs font-bold text-black py-1">
                03
              </span>
              <h4 className="font-macsans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white mt-4">
                Verified Photo Reviews
              </h4>
              <p className="text-xs font-proda text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Share your styling photos and fit feedback on previous orders to help fellow collectors.
              </p>
              <span className="text-xs font-mono font-bold text-[#807248] dark:text-[#d3c59a] mt-3 block">
                +25 pts per review
              </span>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900/30">
              <span className="font-mono text-xs font-bold text-black py-1">
                04
              </span>
              <h4 className="font-macsans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white mt-4">
                Annual Member Birthday
              </h4>
              <p className="text-xs font-proda text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Celebrate your archival journey with an annual birthday points bonus credited directly to your account.
              </p>
              <span className="text-xs font-mono font-bold text-[#807248] dark:text-[#d3c59a] mt-3 block">
                +50 pts annually
              </span>
            </div>
          </div>
        </div>

        {/* 8. Recent Activity Ledger */}
        <div className="p-6 sm:p-8 border border-black/10 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-6">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#B2A376] font-semibold">
              Recent Points Activity
            </span>
            <span className="text-xs font-mono text-neutral-500 uppercase">
              Last 30 Days
            </span>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5">
            {history.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-neutral-400 text-[11px] w-24 shrink-0">
                    {tx.date}
                  </span>
                  <span className="font-proda text-neutral-900 dark:text-white font-medium">
                    {tx.action}
                  </span>
                </div>
                <span
                  className={`font-bold font-mono tracking-wider ${
                    tx.type === "earn"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
