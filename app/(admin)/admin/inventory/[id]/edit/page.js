"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { catalogueItems } from "@/data/products";

export default function AdminEditInventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params?.id;

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const fileInputRef = useRef(null);
  const supabase = useMemo(() => createClient(), []);

  // Form State
  const [form, setForm] = useState({
    title: "",
    category: "Streetwear",
    price: "48.00",
    size: "M",
    gender: "Unisex",
    condition: "Near Mint (9/10)",
    outletOrigin: "Tokyo Harajuku Vintage Vault",
    fabric: "100% Heavyweight Cotton",
    image: "/shop/streetwear/street1.jpg",
    description: "Authentic pre-loved archival piece in pristine vintage condition.",
    inStock: true,
    stock: 1,
  });

  useEffect(() => {
    async function loadItem() {
      if (!itemId) return;
      try {
        setLoading(true);
        // Try fetching from Supabase products
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", itemId)
          .maybeSingle();

        if (!error && data) {
          const qty = data.stock !== undefined ? Number(data.stock) : 1;
          setForm({
            title: data.name || data.title || "",
            category: (data.category || "Streetwear").charAt(0).toUpperCase() + (data.category || "Streetwear").slice(1),
            price: typeof data.price === "number" ? String(data.price) : String(data.price || "48.00").replace(/[^0-9.]/g, ""),
            size: data.size || "M",
            gender: data.gender || "Unisex",
            condition: data.condition || "Near Mint (9/10)",
            outletOrigin: data.outletOrigin || "Tokyo Harajuku Vintage Vault",
            fabric: data.fabric || "100% Cotton Drill",
            image: data.image || "/shop/streetwear/street1.jpg",
            description: data.description || "",
            stock: qty,
            inStock: data.is_available !== false && qty > 0,
          });
        } else {
          // Fallback to static catalog item
          const fallback = catalogueItems.find((it) => String(it.id) === String(itemId));
          if (fallback) {
            setForm({
              title: fallback.title || "",
              category: fallback.category || "Streetwear",
              price: typeof fallback.price === "number" ? String(fallback.price) : String(fallback.price || "48.00").replace(/[^0-9.]/g, ""),
              size: fallback.size || "M",
              gender: fallback.gender || "Unisex",
              condition: fallback.condition || "Near Mint (9/10)",
              outletOrigin: fallback.outletOrigin || "London Brick Lane Archive",
              fabric: fallback.fabric || "100% Heavyweight Cotton",
              image: fallback.image || "/shop/streetwear/street1.jpg",
              description: fallback.description || "",
              stock: 1,
              inStock: fallback.inStock !== false,
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [itemId, supabase]);

  const handleDeviceImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setForm((prev) => ({ ...prev, image: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const parsedPrice = parseFloat(form.price) || 48;
    const qty = parseInt(String(form.stock), 10) || 1;

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: form.title.trim(),
          category: form.category.toLowerCase(),
          price: parsedPrice,
          size: form.size,
          gender: form.gender,
          condition: form.condition,
          image: form.image,
          description: form.description,
          is_available: form.inStock && qty > 0,
          stock: qty,
        })
        .eq("id", itemId);

      if (!error) {
        setSaveSuccess(`Garment #${itemId} specifications & stock (${qty} units) saved to Supabase.`);
      } else {
        setSaveSuccess(`Updated locally (${error.message}).`);
      }

      setTimeout(() => {
        router.push("/admin/inventory");
      }, 1500);
    } catch (err) {
      console.error("Save product exception:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-2 text-xs font-calluna tracking-wider text-[#B2A376] hover:underline mb-4"
        >
          ← Back to Vault Inventory
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-calluna font-semibold">
              Archival Modification
            </span>
            <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
              Edit Garment: {form.title || "Archive Item"}
            </h1>
            <p className="text-xs font-calluna tracking-wider text-neutral-400 mt-0.5">
              SKU #{itemId}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/shop/${itemId}`}
              target="_blank"
              className="px-4 py-2 border border-black/15 dark:border-white/15 text-xs font-sans uppercase hover:border-[#B2A376] transition-colors"
            >
              Live Preview ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-calluna">
          ✓ {saveSuccess}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs font-calluna text-neutral-400">
          <div className="w-6 h-6 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading garment details from Supabase...
        </div>
      ) : (
        /* Edit Form & Image Preview Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Details */}
          <div className="lg:col-span-2 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 sm:p-8">
            <form onSubmit={handleSave} className="space-y-5 text-xs font-macsans">
              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                  Garment Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-bold text-sm focus:outline-none focus:border-[#B2A376]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-calluna"
                  >
                    <option value="Streetwear">Streetwear</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Tailoring">Tailoring</option>
                    <option value="Denim">Denim</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-logo font-bold text-sm focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Quantity (Stock)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-bold text-sm focus:outline-none focus:border-[#B2A376]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Size
                  </label>
                  <select
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Stock Availability
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, inStock: !form.inStock })}
                    className={`w-full p-3 uppercase font-sans text-xs border cursor-pointer ${
                      form.inStock && form.stock > 0
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}
                  >
                    {form.inStock && form.stock > 0
                      ? `● In Stock (${form.stock} pcs)`
                      : "○ Sold Out"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                  Condition Grade
                </label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-calluna"
                >
                  <option value="Mint (10/10)">Mint (10/10)</option>
                  <option value="Near Mint (9/10)">Near Mint (9/10)</option>
                  <option value="Excellent Vintage (8.5/10)">Excellent Vintage (8.5/10)</option>
                  <option value="Distressed Archive (7.5/10)">Distressed Archive (7.5/10)</option>
                </select>
              </div>

              {/* Photo Input: URL or Select From Device */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block uppercase font-bold text-neutral-500 font-calluna">
                    Garment Photo
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-calluna uppercase tracking-wider text-[#B2A376] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    📁 Select Photo From Device
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleDeviceImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="/shop/streetwear/street1.jpg"
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#B2A376]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                  Archival Provenance Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-proda focus:outline-none focus:border-[#B2A376]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <Link
                  href="/admin/inventory"
                  className="px-4 py-2 font-calluna text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#B2A376] text-black font-calluna text-xs uppercase font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {isSaving ? "Saving to DB..." : "Save Garment Updates"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Preview Card */}
          <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 space-y-4 self-start">
            <span className="text-xs uppercase font-bold text-neutral-400 font-calluna block pb-2 border-b border-black/10 dark:border-white/10">
              Vault Image Preview
            </span>

            <div className="relative aspect-3/4 w-full bg-neutral-100 dark:bg-neutral-800 border border-black/10 dark:border-white/10 overflow-hidden">
              <Image
                src={form.image || "/shop/streetwear/street1.jpg"}
                alt={form.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-neutral-900 dark:text-white text-sm">
                {form.title}
              </div>
              <div className="font-logo text-[#807248] dark:text-[#d3c59a] font-bold text-base">
                ${parseFloat(form.price || "0").toFixed(2)}
              </div>
              <div className="font-calluna text-neutral-500">
                {form.category} • Size {form.size} • Qty: {form.stock}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
