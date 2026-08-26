"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { catalogueItems } from "@/data/products";
import { useCart } from "@/components/cart-provider";

const ITEMS_PER_PAGE = 24;

const categories = [
  {
    id: "streetwear",
    name: "Streetwear",
    image: "/shop/categories/streetwear.jpg",
    className: "col-span-2 md:col-span-1 lg:col-span-5 h-44 sm:h-56 lg:h-full",
    objectPosition: "object-top",
  },
  {
    id: "vintage",
    name: "Vintage",
    image: "/shop/categories/vintage.jpg",
    className: "col-span-1 lg:col-span-4 h-36 sm:h-48 lg:h-full",
    objectPosition: "object-center",
  },
  {
    id: "eyewear",
    name: "Eyewear",
    image: "/shop/categories/eyewear.jpg",
    className: "col-span-1 lg:col-span-3 h-36 sm:h-48 lg:h-full",
    objectPosition: "object-top",
  },
  {
    id: "footwear",
    name: "Footwear",
    image: "/shop/categories/footwear.jpg",
    className: "col-span-1 lg:col-span-4 h-36 sm:h-48 lg:h-full",
    objectPosition: "object-bottom",
  },
  {
    id: "athletic_wear",
    name: "Athletic Wear",
    image: "/shop/categories/athletic.jpg",
    className: "col-span-1 lg:col-span-4 h-36 sm:h-48 lg:h-full",
    objectPosition: "object-center",
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "/shop/categories/accessories.jpg",
    className: "col-span-1 lg:col-span-2 h-36 sm:h-48 lg:h-full",
    objectPosition: "object-center",
  },
  {
    id: "kids",
    name: "Kids",
    image: "/shop/categories/kids.jpg",
    className: "col-span-1 lg:col-span-2 h-36 sm:h-48 lg:h-full",
    objectPosition: "object-center",
  },
];

const filterTabs = [
  { id: "all", label: "All Items" },
  { id: "streetwear", label: "Streetwear" },
  { id: "vintage", label: "Vintage" },
  { id: "footwear", label: "Footwear" },
  { id: "eyewear", label: "Eyewear" },
  { id: "athletic_wear", label: "Athletic" },
  { id: "accessories", label: "Accessories" },
  { id: "kids", label: "Kids" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15 },
  },
};

function ShopContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);

  const scrollToCatalogue = () => {
    setTimeout(() => {
      const elem = document.getElementById("catalogue");
      if (elem) {
        const headerOffset = 64; // height of fixed header
        const elemPosition = elem.getBoundingClientRect().top;
        const offsetPosition = elemPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 60);
  };

  // Sync category state from URL query parameter (e.g. from home page / category clicks)
  useEffect(() => {
    const catFromUrl = searchParams.get("category");
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
      setCurrentPage(1);
      scrollToCatalogue();
    }
  }, [searchParams]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    scrollToCatalogue();
  };

  const handleTabSelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const filteredItems = useMemo(() => {
    return catalogueItems
      .filter((item) => {
        const matchesCategory =
          selectedCategory === "all" || item.category === selectedCategory;
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.gender.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") {
          return (
            parseFloat(a.price.replace("$", "")) -
            parseFloat(b.price.replace("$", ""))
          );
        }
        if (sortBy === "price-high") {
          return (
            parseFloat(b.price.replace("$", "")) -
            parseFloat(a.price.replace("$", ""))
          );
        }
        return 0;
      });
  }, [selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  // Ensure current page is valid when filters or item counts change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    scrollToCatalogue();
  };

  const startItemIndex = filteredItems.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItemIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      {/* 1. Top Categories Grid Section */}
      <section aria-label="Featured Categories" className="relative w-full lg:h-screen pt-16 sm:pt-20 lg:pt-0">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-fr lg:grid-rows-2 h-full w-full gap-0 border-b border-black/10 dark:border-white/10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`group relative flex items-center justify-center p-4 overflow-hidden border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-all duration-300 select-none rounded-none cursor-pointer text-left ${cat.className}`}
            >
              {/* Background Cover Image */}
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                priority
                quality={100}
                unoptimized
                className={`object-cover ${cat.objectPosition || "object-center"} group-hover:scale-105 transition-transform duration-700 ease-out rounded-none`}
              />

              {/* Dark overlay that adjusts on hover */}
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/35 transition-colors duration-300" />

              {/* Category Name & Action Indicator */}
              <div className="relative z-10 text-center flex flex-col items-center gap-1">
                <span className="text-base sm:text-xl lg:text-2xl font-macsans font-bold tracking-widest uppercase text-white drop-shadow-lg group-hover:text-[#B2A376] transition-colors duration-300">
                  {cat.name}
                </span>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Floating Scroll Cue to Catalogue (desktop) */}
        <button
          onClick={scrollToCatalogue}
          aria-label="Scroll to browse catalogue"
          className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1.5 px-5 py-2.5 rounded-full text-white bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg"
        >
          <span className="text-[14px] uppercase tracking-widest font-mono text-[#B2A376]">Browse Catalogue</span>
          <svg className="w-3.5 h-3.5 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      {/* 2. Minimalist Browse Catalogue Section (Slides Over Categories Grid) */}
      <section
        id="catalogue"
        aria-label="Browse Catalogue"
        className="relative z-10 w-full px-6 sm:px-12 lg:px-16 py-16 scroll-mt-16 bg-white dark:bg-neutral-950 transition-colors duration-500 shadow-[0_-25px_50px_rgba(0,0,0,0.45)]"
      >
        {/* Header & Filter Controls Bar */}
        <div className="flex flex-col gap-8 pb-10 border-b border-black/10 dark:border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-[0.25em] text-[#B2A376] font-medium">
                Curated Collection
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-logo font-extrabold tracking-wider text-neutral-900 dark:text-white mt-1">
                BROWSE CATALOGUE
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                [{filteredItems.length} {filteredItems.length === 1 ? "Piece" : "Pieces"}]
              </span>

              {/* Sort Select */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent border border-black/15 dark:border-white/15 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-neutral-900 dark:text-white rounded-none focus:outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Featured</option>
                  <option value="price-low" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Price: Low to High</option>
                  <option value="price-high" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Minimalist Category Tabs */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            {filterTabs.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className={`text-xs sm:text-sm uppercase tracking-wider font-mono transition-colors pb-1 cursor-pointer rounded-none ${
                    isActive
                      ? "text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white font-bold"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border-b-2 border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Catalogue Items Grid (Fully Rectangular, Zero Rounded Corners) */}
        {filteredItems.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm font-mono tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
              No pieces match your selection.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="mt-4 text-xs font-mono uppercase tracking-widest underline cursor-pointer text-[#B2A376]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentPage}-${selectedCategory}-${sortBy}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-10"
              >
                {paginatedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={cardVariants}
                    className="h-full flex flex-col"
                  >
                    <Link
                      href={`/shop/${item.id}`}
                      className="group flex flex-col h-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 transition-all duration-300 rounded-none overflow-hidden select-none cursor-pointer"
                    >
                      {/* Product Image Panel (Fully Rectangular) */}
                      <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-none shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className={`object-cover ${item.objectPosition || "object-center"} group-hover:scale-105 transition-transform duration-700 rounded-none`}
                        />

                        {/* Slide-Up Add To Cart Button on Card Hover */}
                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="group/btn relative w-full py-2.5 px-4 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl overflow-hidden transition-all duration-300 active:scale-95 cursor-pointer rounded-none"
                          >
                            <span className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0" />
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="relative z-10 w-4 h-4 shrink-0 text-black group-hover/btn:text-white dark:group-hover/btn:text-black transition-colors duration-300"
                            >
                              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                              <path d="M3 6h18" />
                              <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            <span className="relative z-10 text-black group-hover/btn:text-white dark:group-hover/btn:text-black transition-colors duration-300">
                              Add to cart
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Card Content Information */}
                      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                        <div>
                          {/* Top Row: Size | Gender and Price */}
                          <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pb-2">
                            <span>{item.size} • {item.gender}</span>
                            <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                              {item.price}
                            </span>
                          </div>

                          {/* Product Name */}
                          <h3 className="font-macsans font-bold text-base text-neutral-900 dark:text-white tracking-wide leading-snug group-hover:text-[#B2A376] transition-colors">
                            {item.name}
                          </h3>

                          {/* Product Description */}
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-proda leading-relaxed mt-2 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {/* Colors Row */}
                        <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
                            Colors
                          </span>
                          <div className="flex items-center gap-1.5">
                            {item.colors.map((color, cIdx) => (
                              <span
                                key={cIdx}
                                title={color.name}
                                className="w-3.5 h-3.5 rounded-none border border-black/20 dark:border-white/20 inline-block shrink-0"
                                style={{ background: color.gradient || color.hex }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* 4. Innovative Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 select-none">
                {/* Status indicator */}
                <div className="text-xs font-mono tracking-widest text-neutral-500 dark:text-neutral-400 uppercase order-2 md:order-1">
                  Showing <span className="text-neutral-900 dark:text-white font-bold">{String(startItemIndex).padStart(2, "0")}–{String(endItemIndex).padStart(2, "0")}</span> of <span className="text-neutral-900 dark:text-white font-bold">{String(filteredItems.length).padStart(2, "0")}</span> Pieces
                </div>

                {/* Interactive Pagination Buttons */}
                <nav aria-label="Catalogue Pagination" className="flex items-center gap-2 order-1 md:order-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                    className={`group relative flex items-center gap-2 px-4 py-2.5 border text-xs font-mono uppercase tracking-wider rounded-none transition-all duration-300 cursor-pointer ${
                      currentPage === 1
                        ? "opacity-30 border-black/10 dark:border-white/10 cursor-not-allowed text-neutral-400"
                        : "border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <span className="transition-transform duration-300 group-hover:-translate-x-1 inline-block">←</span>
                    <span className="hidden sm:inline font-medium">Prev</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {getPageNumbers().map((page, pIdx) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${pIdx}`}
                            className="px-2 py-2 text-xs font-mono text-neutral-400 select-none"
                          >
                            •••
                          </span>
                        );
                      }

                      const isActive = currentPage === page;
                      return (
                        <button
                          key={`page-${page}`}
                          onClick={() => handlePageChange(page)}
                          aria-current={isActive ? "page" : undefined}
                          className={`relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-xs font-mono font-semibold transition-all duration-300 rounded-none cursor-pointer overflow-hidden ${
                            isActive
                              ? "bg-[#B2A376] text-black shadow-md border border-[#B2A376]"
                              : "border border-black/15 dark:border-white/15 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activePaginationIndicator"
                              className="absolute inset-0 bg-[#B2A376] z-0 pointer-events-none"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{String(page).padStart(2, "0")}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next Page"
                    className={`group relative flex items-center gap-2 px-4 py-2.5 border text-xs font-mono uppercase tracking-wider rounded-none transition-all duration-300 cursor-pointer ${
                      currentPage === totalPages
                        ? "opacity-30 border-black/10 dark:border-white/10 cursor-not-allowed text-neutral-400"
                        : "border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <span className="hidden sm:inline font-medium">Next</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1 inline-block">→</span>
                  </button>
                </nav>

                {/* Page Indicator Tag */}
                <div className="text-xs font-mono tracking-widest text-[#B2A376] uppercase font-semibold order-3 hidden lg:block">
                  [ Page {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")} ]
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 text-center font-mono">Loading Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}

