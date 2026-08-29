"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { catalogueItems } from "@/data/products";

export default function AdminInventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const supabase = useMemo(() => createClient(), []);

  // New Piece Form State
  const [newItem, setNewItem] = useState({
    title: "",
    category: "Streetwear",
    price: "48.00",
    size: "M",
    gender: "Unisex",
    condition: "Near Mint (9/10)",
    image: "/shop/streetwear/street1.jpg",
    description: "Authentic pre-loved archival vintage piece in pristine condition.",
    inStock: true,
    stock: 1,
  });

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((p) => ({
          id: p.id,
          title: p.name || p.title || "Archival Vintage Piece",
          category: (p.category || "Streetwear").charAt(0).toUpperCase() + (p.category || "Streetwear").slice(1),
          price: typeof p.price === "number" ? `$${p.price.toFixed(2)}` : p.price || "$48.00",
          numericPrice: Number(p.price || 48),
          size: p.size || "M",
          gender: p.gender || "Unisex",
          condition: p.condition || "Near Mint (9/10)",
          image: p.image || "/shop/streetwear/street1.jpg",
          description: p.description || "",
          stock: p.stock !== undefined ? Number(p.stock) : 1,
          inStock: p.is_available !== false && (p.stock === undefined || Number(p.stock) > 0),
        }));
        setItems(mapped);
      } else {
        setItems(
          catalogueItems.map((c) => ({
            ...c,
            stock: c.stock !== undefined ? c.stock : 1,
          }))
        );
      }
    } catch (err) {
      console.warn("Failed to load DB products, using fallback:", err);
      setItems(catalogueItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [supabase]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (genderFilter !== "all" && item.gender?.toLowerCase() !== genderFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const catMatch = item.category?.toLowerCase().includes(q);
        if (!titleMatch && !catMatch) return false;
      }
      return true;
    });
  }, [items, categoryFilter, genderFilter, searchQuery]);

  // Handle local device image upload
  const handleDeviceImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewItem((prev) => ({ ...prev, image: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle stock availability directly in Supabase
  const handleToggleStock = async (id) => {
    const currentItem = items.find((it) => it.id === id);
    if (!currentItem) return;

    const newInStock = !currentItem.inStock;
    const newStockCount = newInStock ? (currentItem.stock > 0 ? currentItem.stock : 1) : 0;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inStock: newInStock, stock: newStockCount } : item
      )
    );

    try {
      const { error } = await supabase
        .from("products")
        .update({
          is_available: newInStock,
          stock: newStockCount,
        })
        .eq("id", id);

      if (!error) {
        setSuccessMsg(`"${currentItem.title}" marked as ${newInStock ? `In Stock (${newStockCount} pcs)` : "Sold Out"} in database.`);
      } else {
        setSuccessMsg(`Status updated locally (${error.message}).`);
      }
    } catch (err) {
      console.warn("Stock update exception:", err);
    }

    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // Add new item to Supabase database
  const handleAddNewItem = async (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    setIsSubmitting(true);
    const newId = `vintage-${Date.now()}`;
    const parsedPrice = parseFloat(String(newItem.price).replace(/[^0-9.]/g, "")) || 48;
    const quantity = parseInt(String(newItem.stock), 10) || 1;

    const dbPayload = {
      id: newId,
      name: newItem.title.trim(),
      category: newItem.category.toLowerCase(),
      price: parsedPrice,
      size: newItem.size,
      gender: newItem.gender,
      condition: newItem.condition,
      description: newItem.description,
      image: newItem.image || "/shop/streetwear/street1.jpg",
      is_available: newItem.inStock && quantity > 0,
      stock: quantity,
    };

    try {
      const { error } = await supabase.from("products").insert(dbPayload);

      const localItem = {
        id: newId,
        title: newItem.title.trim(),
        category: newItem.category,
        price: `$${parsedPrice.toFixed(2)}`,
        numericPrice: parsedPrice,
        size: newItem.size,
        gender: newItem.gender,
        condition: newItem.condition,
        image: newItem.image,
        description: newItem.description,
        stock: quantity,
        inStock: newItem.inStock && quantity > 0,
      };

      setItems([localItem, ...items]);
      setIsAddModalOpen(false);
      setNewItem({
        title: "",
        category: "Streetwear",
        price: "48.00",
        size: "M",
        gender: "Unisex",
        condition: "Near Mint (9/10)",
        image: "/shop/streetwear/street1.jpg",
        description: "Authentic pre-loved archival vintage piece in pristine condition.",
        inStock: true,
        stock: 1,
      });

      if (!error) {
        setSuccessMsg(`"${localItem.title}" (${quantity} units) successfully added to Supabase archive.`);
      } else {
        setSuccessMsg(`Published locally (${error.message}).`);
      }
    } catch (err) {
      console.error("Failed to insert product:", err);
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
            Archive Vault
          </span>
          <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
            Inventory & Catalog Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="px-3 py-2 border border-black/15 dark:border-white/15 text-xs font-calluna tracking-wider hover:border-[#B2A376] transition-colors cursor-pointer"
          >
            {loading ? "Syncing..." : "↻ Refresh DB"}
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#B2A376] text-black font-calluna tracking-wider text-xs uppercase font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer"
          >
            + Add Vintage Garment
          </button>
        </div>
      </div>

      {/* Alert message */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
          ✓ {successMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, brand, or SKU..."
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-proda text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#B2A376]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-calluna tracking-wider text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Streetwear">Streetwear</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Tailoring">Tailoring</option>
            <option value="Denim">Denim</option>
            <option value="Footwear">Footwear</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-xs font-calluna tracking-wider text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <option value="all">All Genders</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-center border-b border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 font-mono text-neutral-400 uppercase">
              <th className="p-2">Piece Preview</th>
              <th className="p-2">Category & Gender</th>
              <th className="p-2">Condition Grade</th>
              <th className="p-2">Price</th>
              <th className="p-2">Stock & Qty</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10 font-macsans">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-neutral-400 font-calluna">
                  <div className="w-6 h-6 border-2 border-[#B2A376] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Synchronizing inventory with Supabase database...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-neutral-400 font-calluna uppercase">
                  No vintage garments found matching criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  {/* Image & Title */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-black/10 dark:border-white/10 overflow-hidden">
                        <Image
                          src={item.image || "/shop/streetwear/street1.jpg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white block text-sm">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-proda tracking-wider text-neutral-400">
                          Size: {item.size || "M"} • SKU #{item.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category & Gender */}
                  <td className="p-4 font-calluna tracking-wider text-center">
                    <div className="font-bold text-neutral-900 dark:text-white">{item.category}</div>
                    <span className="text-[11px] text-neutral-500">{item.gender || "Unisex"}</span>
                  </td>

                  {/* Condition */}
                  <td className="p-4 font-calluna tracking-wider text-center">
                    <span className="px-2 py-0.5 text-[10px] bg-[#B2A376]/10 text-[#807248] dark:text-[#d3c59a] border border-[#B2A376]/30">
                      {item.condition || "Near Mint (9/10)"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4 font-logo tracking-wider font-bold text-neutral-900 dark:text-white text-sm text-center">
                    {typeof item.price === "number" ? `$${item.price.toFixed(2)}` : item.price}
                  </td>

                  {/* Stock & Quantity Toggle */}
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStock(item.id)}
                      className={`px-2.5 py-1 text-[11px] font-sans uppercase border cursor-pointer ${
                        item.inStock !== false && item.stock > 0
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                    >
                      {item.inStock !== false && item.stock > 0
                        ? `● In Stock (${item.stock} pcs)`
                        : "○ Sold Out"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/inventory/${item.id}/edit`}
                        className="px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-[#B2A376] hover:text-black text-neutral-800 dark:text-neutral-200 font-calluna text-xs transition-colors"
                      >
                        Edit Specs
                      </Link>
                      <Link
                        href={`/shop/${item.id}`}
                        target="_blank"
                        className="px-2 py-1.5 border border-black/10 dark:border-white/10 hover:border-[#B2A376] text-neutral-700 dark:text-neutral-300 hover:text-[#B2A376] font-sans text-xs transition-colors"
                      >
                        Store View ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Vintage Piece Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <h3 className="text-lg font-macsans font-bold text-neutral-900 dark:text-white uppercase">
                Add New Archival Vintage Garment
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-black cursor-pointer text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4 text-xs font-macsans">
              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                  Garment Title
                </label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. Vintage 1994 Carhartt Detroit Jacket"
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white focus:outline-none focus:border-[#B2A376]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white"
                  >
                    <option value="Streetwear">Streetwear</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Tailoring">Tailoring</option>
                    <option value="Denim">Denim</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="48.00"
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                    Quantity (Stock)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.stock}
                    onChange={(e) =>
                      setNewItem({ ...newItem, stock: parseInt(e.target.value, 10) || 1 })
                    }
                    placeholder="1"
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white focus:outline-none focus:border-[#B2A376]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                    Size
                  </label>
                  <select
                    value={newItem.size}
                    onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
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
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                    Condition Grade
                  </label>
                  <select
                    value={newItem.condition}
                    onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white"
                  >
                    <option value="Mint (10/10)">Mint (10/10)</option>
                    <option value="Near Mint (9/10)">Near Mint (9/10)</option>
                    <option value="Excellent Vintage (8.5/10)">Excellent Vintage (8.5/10)</option>
                    <option value="Distressed Archive (7.5/10)">Distressed Archive (7.5/10)</option>
                  </select>
                </div>
              </div>

              {/* Photo Input: URL or Select From Device */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block uppercase font-bold text-neutral-500 font-mono">
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
                  <div className="relative w-14 h-14 bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-black/15 dark:border-white/15 overflow-hidden">
                    <Image
                      src={newItem.image || "/shop/streetwear/street1.jpg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    placeholder="URL path or device image data"
                    className="flex-1 p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#B2A376]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-mono">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white focus:outline-none focus:border-[#B2A376]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-mono text-xs text-neutral-400 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#B2A376] text-black font-mono text-xs uppercase font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {isSubmitting ? "Publishing to DB..." : "Publish to Archive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
