"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart-provider";
import { useOrders } from "@/components/orders-provider";
import { createClient } from "@/utils/supabase/client";

const FREE_SHIPPING_THRESHOLD = 150;

export default function CheckoutPage() {
  const { cartItems, cartCount, clearCart } = useCart();
  const { createOrder } = useOrders();

  // Step / Form State
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    country: "Pakistan",
    city: "",
    postalCode: "",
    phone: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  // Loyalty Points State
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [isRedeemingAnimation, setIsRedeemingAnimation] = useState(false);

  // Submission & Summary State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [placedOrderSummary, setPlacedOrderSummary] = useState(null);

  // Autofill logged-in customer info
  useEffect(() => {
    async function autofillUserInfo() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "";
          const nameParts = fullName.trim().split(" ");
          const fName = nameParts[0] || "";
          const lName = nameParts.slice(1).join(" ") || "";
          const userEmail = user.email || "";

          // Query profiles table for saved phone, address
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          setFormData((prev) => ({
            ...prev,
            email: prev.email || userEmail,
            firstName: prev.firstName || profile?.first_name || fName,
            lastName: prev.lastName || profile?.last_name || lName,
            phone: prev.phone || profile?.phone || "",
            address: prev.address || profile?.address || "",
            city: prev.city || profile?.city || "",
            postalCode: prev.postalCode || profile?.postal_code || "",
          }));
        }
      } catch (err) {
        console.warn("Autofill user error:", err);
      }
    }

    autofillUserInfo();
  }, []);

  // Handle Loyalty Toggle
  const handleLoyaltyToggle = (checked) => {
    if (checked) {
      setIsRedeemingAnimation(true);
      setUseLoyaltyPoints(true);
    } else {
      setIsRedeemingAnimation(false);
      setUseLoyaltyPoints(false);
    }
  };

  // Subtotal Calculation
  const subtotalNumber = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price.replace("$", "")) || 0;
      return acc + price * item.quantity;
    }, 0);
  }, [cartItems]);

  // Promo Discount Calculation
  const promoDiscountNumber = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "percent") {
      return (subtotalNumber * appliedPromo.value) / 100;
    }
    if (appliedPromo.type === "fixed") {
      return Math.min(subtotalNumber, appliedPromo.value);
    }
    return 0;
  }, [appliedPromo, subtotalNumber]);

  // Loyalty Points Discount ($10 reward)
  const loyaltyDiscountNumber = useLoyaltyPoints ? Math.min(subtotalNumber, 10) : 0;

  // Shipping Cost Computation
  const isFreeShippingUnlocked = subtotalNumber >= FREE_SHIPPING_THRESHOLD;
  const shippingCostNumber = useMemo(() => {
    if (cartItems.length === 0) return 0;
    if (shippingMethod === "express") return 22;
    return isFreeShippingUnlocked ? 0 : 10;
  }, [shippingMethod, isFreeShippingUnlocked, cartItems.length]);

  // Estimated Tax (8%)
  const taxableAmount = Math.max(
    0,
    subtotalNumber - promoDiscountNumber - loyaltyDiscountNumber
  );
  const estimatedTaxNumber = taxableAmount > 0 ? taxableAmount * 0.08 : 0;

  // Final Total
  const finalTotalNumber = Math.max(
    0,
    taxableAmount + shippingCostNumber + estimatedTaxNumber
  );

  // Promo Code Validation
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError("");
    const cleaned = promoInput.trim().toUpperCase();

    if (!cleaned) {
      setPromoError("Please enter a voucher code.");
      return;
    }

    try {
      const supabase = createClient();
      const { data: promoRow } = await supabase
        .from("promos")
        .select("*")
        .eq("code", cleaned)
        .maybeSingle();

      if (promoRow && promoRow.status?.toLowerCase() === "active") {
        const percent = promoRow.discount_percent || 10;
        setAppliedPromo({
          code: promoRow.code,
          label: promoRow.discount_text || `${percent}% Off Archival Order`,
          type: "percent",
          value: percent,
        });
        setPromoInput("");
        return;
      }
    } catch {}

    if (cleaned === "THRIFT10") {
      setAppliedPromo({
        code: "THRIFT10",
        label: "10% Off Archive Order",
        type: "percent",
        value: 10,
      });
      setPromoInput("");
    } else if (cleaned === "VINTAGE20") {
      setAppliedPromo({
        code: "VINTAGE20",
        label: "20% Off Curator Special",
        type: "percent",
        value: 20,
      });
      setPromoInput("");
    } else {
      setPromoError("Invalid code. Try 'THRIFT10' or 'VINTAGE20'.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedOrder = `TH-${Math.floor(100000 + Math.random() * 900000)}`;

    // Prepare items snapshot
    const itemsSnapshot = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category || "Vintage",
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      size: item.size || "M",
      gender: item.gender || "Unisex",
      selectedColor: item.selectedColor || null,
    }));

    // Record order in Orders state / storage / database
    await createOrder({
      id: generatedOrder,
      items: itemsSnapshot,
      shippingMethod: shippingMethod,
      paymentMethod: paymentMethod,
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
      },
      paymentDetails: {
        brand: paymentMethod === "card" ? "Credit Card" : paymentMethod === "applepay" ? "Apple Pay" : "Cash on Delivery",
        last4: paymentMethod === "card" && formData.cardNumber ? formData.cardNumber.replace(/\s/g, "").slice(-4) : "4242",
        paid: paymentMethod !== "cod",
      },
      pricing: {
        subtotal: subtotalNumber,
        promoDiscount: promoDiscountNumber,
        promoCode: appliedPromo?.code || null,
        loyaltyDiscount: loyaltyDiscountNumber,
        shipping: shippingCostNumber,
        tax: estimatedTaxNumber,
        total: finalTotalNumber,
      },
    });

    const placedTotal = finalTotalNumber;
    const summary = {
      orderNumber: generatedOrder,
      shippingMethod: shippingMethod,
      paymentMethod: paymentMethod,
      total: placedTotal,
    };

    setPlacedOrderSummary(summary);
    setOrderNumber(generatedOrder);
    setOrderPlaced(true);
    setIsSubmitting(false);
    clearCart();
  };

  // Order Confirmed Success Screen
  if (orderPlaced) {
    const isCod =
      placedOrderSummary?.paymentMethod === "cash" ||
      placedOrderSummary?.paymentMethod === "cod";
    const displayTotal =
      placedOrderSummary?.total !== undefined
        ? placedOrderSummary.total
        : finalTotalNumber;

    return (
      <div className="min-h-screen pt-28 pb-20 px-6 sm:px-12 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 sm:p-12 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/90 backdrop-blur-md shadow-2xl flex flex-col items-center gap-6 max-w-xl w-full"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#B2A376] font-semibold">
              Order Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-logo font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Thank You
            </h1>
            <p className="text-sm font-proda text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-md mx-auto">
              Your vintage pieces are safely reserved and preparing for archival dispatch.
            </p>
          </div>

          <div className="w-full p-4 bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 flex flex-col gap-2.5 text-left text-xs font-macsans">
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-neutral-500">Order Reference</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {orderNumber}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-neutral-500">Delivery Method</span>
              <span className="text-neutral-900 dark:text-white">
                {placedOrderSummary?.shippingMethod === "express"
                  ? "Express Priority (1–2 Days)"
                  : "Standard Tracked (3–5 Days)"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-neutral-500">Payment Option</span>
              <span className="text-neutral-900 dark:text-white font-mono uppercase">
                {isCod
                  ? "Cash on Delivery (COD)"
                  : placedOrderSummary?.paymentMethod === "applepay"
                  ? "Apple Pay"
                  : "Credit Card"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-neutral-500 font-semibold">
                {isCod ? "To Pay (COD)" : "Total Paid"}
              </span>
              <span className="font-bold text-[#807248] dark:text-[#d3c59a] text-base font-mono">
                ${displayTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Link
              href={`/orders/${orderNumber}`}
              className="group relative w-full py-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest text-center overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer block"
            >
              <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
              <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                View Order Details & Tracking →
              </span>
            </Link>

            <div className="flex gap-3">
              <Link
                href="/orders"
                className="flex-1 py-3 border border-black/15 dark:border-white/15 text-neutral-800 dark:text-neutral-200 text-xs font-mono uppercase tracking-wider text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                All Orders
              </Link>
              <Link
                href="/shop"
                className="flex-1 py-3 border border-black/15 dark:border-white/15 text-neutral-800 dark:text-neutral-200 text-xs font-mono uppercase tracking-wider text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Page Header */}
      <div className="mb-10 flex flex-col gap-2 border-b border-black/10 dark:border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-neutral-500">
          <Link href="/cart" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Bag
          </Link>
          <span>/</span>
          <span className="text-[#B2A376] font-semibold">Checkout</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-logo font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
          Secure Checkout
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-6 border border-black/10 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/50 p-8">
          <p className="font-macsans text-lg text-neutral-700 dark:text-neutral-300">
            Your shopping bag is currently empty.
          </p>
          <Link
            href="/shop"
            className="group relative inline-flex items-center px-8 py-3.5 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-md"
          >
            <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
            <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
              Explore Full Catalogue →
            </span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Form Steps */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
            {/* Step 1: Contact Information */}
            <div className="p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <h2 className="text-base sm:text-lg font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#B2A376] text-black flex items-center justify-center text-xs font-mono font-bold">
                    1
                  </span>
                  Contact Information
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans focus:outline-none focus:border-[#B2A376] transition-colors"
                  />
                  <span className="text-[11px] font-proda text-neutral-500 mt-1 block">
                    Order confirmation and tracking updates will be sent here.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="03xx-xxxxxxx"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans focus:outline-none focus:border-[#B2A376] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <h2 className="text-base sm:text-lg font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#B2A376] text-black flex items-center justify-center text-xs font-mono font-bold">
                    2
                  </span>
                  Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street address, apartment, or suite"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans focus:outline-none focus:border-[#B2A376]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Delivery Options */}
            <div className="p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <h2 className="text-base sm:text-lg font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#B2A376] text-black flex items-center justify-center text-xs font-mono font-bold">
                    3
                  </span>
                  Delivery Option
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                <label
                  className={`flex items-center justify-between p-4 border text-xs font-macsans cursor-pointer transition-all duration-200 ${
                    shippingMethod === "standard"
                      ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white font-semibold"
                      : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="accent-[#B2A376]"
                    />
                    <div className="flex flex-col">
                      <span>Standard Tracked (3–5 Business Days)</span>
                      <span className="text-[11px] font-proda text-neutral-500 font-normal">
                        Carbon-neutral delivery in compostable packaging
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold">
                    {isFreeShippingUnlocked ? "FREE" : "$10.00"}
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 border text-xs font-macsans cursor-pointer transition-all duration-200 ${
                    shippingMethod === "express"
                      ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white font-semibold"
                      : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="accent-[#B2A376]"
                    />
                    <div className="flex flex-col">
                      <span>Express Priority (1–2 Business Days)</span>
                      <span className="text-[11px] font-proda text-neutral-500 font-normal">
                        Priority archive dispatch with direct courier tracking
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold">$22.00</span>
                </label>
              </div>
            </div>

            {/* Step 4: Payment Information */}
            <div className="p-6 sm:p-8 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900/80 backdrop-blur-md flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <h2 className="text-base sm:text-lg font-macsans font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#B2A376] text-black flex items-center justify-center text-xs font-mono font-bold">
                    4
                  </span>
                  Payment Method
                </h2>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 border text-xs font-macsans uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                    paymentMethod === "card"
                      ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white font-bold"
                      : "border-black/10 dark:border-white/10 text-neutral-500 hover:border-black/30"
                  }`}
                >
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("applepay")}
                  className={`p-3 border text-xs font-macsans uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                    paymentMethod === "applepay"
                      ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white font-bold"
                      : "border-black/10 dark:border-white/10 text-neutral-500 hover:border-black/30"
                  }`}
                >
                  Apple Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3 border text-xs font-macsans uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                    paymentMethod === "cod"
                      ? "border-[#B2A376] bg-[#B2A376]/10 text-neutral-900 dark:text-white font-bold"
                      : "border-black/10 dark:border-white/10 text-neutral-500 hover:border-black/30"
                  }`}
                >
                  Cash on Delivery
                </button>
              </div>

              {paymentMethod === "card" ? (
                <div className="flex flex-col gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Cardholder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === "card"}
                      placeholder="Name"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans focus:outline-none focus:border-[#B2A376]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === "card"}
                      maxLength={19}
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-mono tracking-wider focus:outline-none focus:border-[#B2A376]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                        Expiration (MM/YY) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "card"}
                        maxLength={5}
                        placeholder="12/28"
                        value={formData.cardExpiry}
                        onChange={(e) => handleInputChange("cardExpiry", e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#B2A376]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                        CVC Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "card"}
                        maxLength={4}
                        placeholder="123"
                        value={formData.cardCvc}
                        onChange={(e) => handleInputChange("cardCvc", e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#B2A376]"
                      />
                    </div>
                  </div>
                </div>
              ) : paymentMethod === "applepay" ? (
                <div className="p-6 border border-dashed border-black/20 dark:border-white/20 text-center flex flex-col items-center gap-2">
                  <span className="text-2xl">Pay</span>
                  <p className="text-xs font-proda text-neutral-500">
                    You will authenticate via Apple Pay on placing order.
                  </p>
                </div>
              ) : (
                <div className="p-6 border border-dashed border-black/20 dark:border-white/20 text-center flex flex-col items-center gap-2">
                  <span className="font-macsans font-bold text-sm text-neutral-900 dark:text-white">
                    Cash on Delivery (COD)
                  </span>
                  <p className="text-xs font-proda text-neutral-500">
                    Pay upon physical delivery to the courier in cash.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="p-6 sm:p-7 border border-black/45 dark:border-white/15 dark:bg-neutral-900/90 backdrop-blur-md flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <h2 className="text-lg font-macsans font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Order Summary
                </h2>
                <span className="text-xs font-calluna tracking-widest text-neutral-500">
                  {cartCount} {cartCount === 1 ? "Piece" : "Pieces"}
                </span>
              </div>

              {/* Mini Item List */}
              <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-black/5 dark:border-white/5 last:border-0">
                    <div className="relative w-12 h-14 bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-macsans font-semibold text-neutral-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-proda text-neutral-500">
                        Qty: {item.quantity} {item.selectedColor?.name ? `• ${item.selectedColor.name}` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Voucher / Promo Code Input */}
              <div className="pt-2 border-t border-black/5 dark:border-white/5">
                <label className="block text-xs font-macsans uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Voucher / Promo Code
                </label>

                {appliedPromo ? (
                  <div className="p-3 border border-[#B2A376] bg-[#B2A376]/10 flex items-center justify-between text-xs font-mono">
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {appliedPromo.code} ({appliedPromo.label})
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        - ${promoDiscountNumber.toFixed(2)} applied
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-xs text-neutral-500 hover:text-red-500 cursor-pointer font-bold px-2 py-1"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="CODE (e.g. THRIFT10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-macsans uppercase tracking-wider focus:outline-none focus:border-[#B2A376]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="group relative px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-mono text-xs uppercase tracking-wider font-semibold overflow-hidden transition-all duration-300 cursor-pointer shrink-0"
                    >
                      <span className="absolute inset-0 bg-[#B2A376] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                      <span className="relative z-10 text-white dark:text-neutral-900 group-hover:text-black dark:group-hover:text-black transition-colors duration-300">
                        Apply
                      </span>
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-[11px] font-mono text-red-500 mt-1.5">{promoError}</p>
                )}
              </div>

              {/* Loyalty Points Redemption Toggle */}
              <div className="pt-2 border-t border-black/5 dark:border-white/5">
                <label
                  className={`relative flex items-start gap-3 p-3 border transition-colors duration-300 rounded-md cursor-pointer overflow-hidden ${
                    useLoyaltyPoints
                      ? "border-[#B2A376] bg-[#B2A376]/10 dark:bg-[#B2A376]/10"
                      : "border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-950/60 hover:border-black/25 dark:hover:border-white/25"
                  }`}
                >
                  {/* Left-to-Right Slide Animation Banner */}
                  <AnimatePresence>
                    {isRedeemingAnimation && (
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        onAnimationComplete={() => {
                          setTimeout(() => setIsRedeemingAnimation(false), 450);
                        }}
                        className="absolute inset-0 z-20 bg-emerald-600 text-white flex items-center justify-center font-macsans text-xs uppercase font-bold tracking-widest pointer-events-none shadow-md"
                      >
                        Points Redeemed
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    type="checkbox"
                    checked={useLoyaltyPoints}
                    onChange={(e) => handleLoyaltyToggle(e.target.checked)}
                    className="mt-0.5 accent-[#B2A376]"
                  />
                  <div className="flex flex-col text-xs font-macsans tracking-wider">
                    <span className="font-semibold text-neutral-900 dark:text-white transition-colors duration-300">
                      {useLoyaltyPoints ? "Points Redeemed" : "Redeem Loyalty Points"}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-proda">
                      {useLoyaltyPoints
                        ? "Instant $10.00 reward credit applied"
                        : "Applies an instant $10.00 reward credit"}
                    </span>
                  </div>
                </label>
              </div>

              {/* Cost Breakdown */}
              <div className="pt-4 border-t border-black/15 dark:border-white/15 flex flex-col gap-2 text-xs font-macsans">
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                    ${subtotalNumber.toFixed(2)}
                  </span>
                </div>

                {promoDiscountNumber > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span className="font-mono">− ${promoDiscountNumber.toFixed(2)}</span>
                  </div>
                )}

                {loyaltyDiscountNumber > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Thrift Coins Credit</span>
                    <span className="font-mono">− ${loyaltyDiscountNumber.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Shipping</span>
                  <span className="font-mono">
                    {shippingCostNumber === 0
                      ? "FREE"
                      : `$${shippingCostNumber.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Estimated Sales Tax (8%)</span>
                  <span className="font-mono">${estimatedTaxNumber.toFixed(2)}</span>
                </div>

                {/* Grand Total */}
                <div className="flex items-center justify-between text-base sm:text-lg font-macsans font-bold text-neutral-900 dark:text-white pt-3 border-t border-black/10 dark:border-white/10">
                  <span className="uppercase tracking-wider">Estimated Total</span>
                  <span className="font-macsans text-xl text-[#807248] dark:text-[#d3c59a]">
                    ${finalTotalNumber.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full py-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest text-center shadow-lg overflow-hidden transition-all duration-300 ease-out active:scale-98 rounded-none block cursor-pointer disabled:opacity-70"
                >
                  <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                  <span className="relative z-10 text-black group-hover:text-white dark:group-hover:text-black transition-colors duration-300 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Processing Order...
                      </>
                    ) : (
                      "Place Order →"
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
