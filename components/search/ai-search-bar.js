"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAiSearchSuggestions } from "@/lib/ai/searchSuggestions";

const EXAMPLE_PROMPTS = [
  "Oversized vintage jacket in black",
  "Loose fit skater denim puddle hem",
  "Chunky retro platform sneakers",
  "Gold titanium geometric glasses",
  "Athletic tracksuit set under $70",
  "Minimalist off-white drop-shoulder tee",
];

export default function AiSearchBar({
  onSearchResults,
  onResetSearch,
  isSearching,
  activeExtracted,
  resultsCount,
  hasActiveSearch,
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Compute suggestions based on current typed query
  const suggestions = useMemo(() => {
    return getAiSearchSuggestions(query, 5, 3);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e, customQuery) => {
    if (e) e.preventDefault();
    const targetQuery = (customQuery || query).trim();
    if (!targetQuery) return;

    setShowSuggestions(false);
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/search/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: targetQuery }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to search catalogue.");
      }

      if (onSearchResults) {
        onSearchResults({
          items: data.items || [],
          extracted: data.extracted || null,
          usedFallback: data.usedFallback,
          query: targetQuery,
        });
      }
    } catch (err) {
      console.error("AI Search failed:", err);
      setErrorMessage(
        err.message || "Search is temporarily unavailable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (promptText) => {
    setQuery(promptText);
    setShowSuggestions(false);
    handleSubmit(null, promptText);
  };

  const handleClear = () => {
    setQuery("");
    setErrorMessage("");
    setShowSuggestions(false);
    if (onResetSearch) {
      onResetSearch();
    }
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.prompts.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.prompts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.prompts.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const selectedPrompt = suggestions.prompts[highlightedIndex];
      handlePromptClick(selectedPrompt);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className="relative z-50 w-full flex flex-col gap-4">
      {/* Search Input Container */}
      <div className="relative z-50 w-full border border-black/20 dark:border-white/20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm transition-all focus-within:border-black dark:focus-within:border-[#B2A376] rounded-md">
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex items-center w-full"
        >
          {/* AI Indicator Icon */}
          <div className="pl-4 pr-2 flex items-center gap-2 text-[#B2A376] select-none pointer-events-none">
            <svg
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {loading ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              )}
            </svg>
            <span className="hidden sm:inline-block text-[10px] uppercase font-macsans tracking-[0.2em] font-bold text-neutral-600 dark:text-neutral-300">
              AI SEARCH
            </span>
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want (e.g. 'black leather vintage jacket under $100')..."
            disabled={loading}
            className="w-full py-3.5 px-3 bg-transparent text-sm sm:text-base font-macsans text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none rounded-none"
          />

          {/* Clear Button if input has text or active search */}
          {(query || hasActiveSearch) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-full px-5 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#B2A376] dark:hover:bg-[#B2A376] dark:hover:text-black transition-all duration-200 cursor-pointer shrink-0 rounded-md mr-2"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Real-time Dynamic AI Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (query.trim().length > 0 || suggestions.prompts.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.99 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full mt-2 z-100 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-black/15 dark:border-white/15 shadow-2xl overflow-hidden rounded-md"
            >
              <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#B2A376] font-semibold">
                  <span>✦</span>
                  <span>AI Suggestions</span>
                </div>
                <span className="text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500">
                  {query.trim() ? "Smart completions" : "Popular prompts"}
                </span>
              </div>

              {/* Prompt Suggestions List */}
              <div className="py-1">
                {suggestions.prompts.map((prompt, index) => {
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptClick(prompt)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isHighlighted
                          ? "bg-[#B2A376]/15 text-neutral-900 dark:text-white"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <svg
                          className="w-3.5 h-3.5 text-[#B2A376] shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <span className="text-xs sm:text-sm font-macsans truncate">
                          {prompt}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 shrink-0 ml-2">
                        Search ↵
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Catalogue Match Previews (if user is typing and pieces match) */}
              {query.trim().length > 0 && suggestions.matchedItems.length > 0 && (
                <div className="border-t border-black/10 dark:border-white/10 pt-2 pb-2 px-3 bg-black/2 dark:bg-white/2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block mb-2">
                    Matching Catalogue Pieces
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {suggestions.matchedItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`/shop/${item.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="group flex items-center gap-2.5 p-2 border border-black/10 dark:border-white/10 hover:border-[#B2A376] dark:hover:border-[#B2A376] bg-white dark:bg-neutral-800/80 transition-colors rounded-none"
                      >
                        <div className="relative w-9 h-11 shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="40px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-macsans font-medium text-neutral-900 dark:text-white truncate">
                            {item.name}
                          </span>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#B2A376]">
                              {item.category}
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                              {item.price}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestion Prompts */}
      {!hasActiveSearch && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-700 dark:text-white mr-1 select-none">
            Try:
          </span>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="text-[11px] font-macsans tracking-wider px-2.5 py-1 hover:border-[#B2A376] dark:hover:border-[#B2A376] text-neutral-400 dark:text-neutral-300 hover:text-black dark:hover:text-[#B2A376] transition-colors rounded-none cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Error Message Notice */}
      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono">
          {errorMessage}
        </div>
      )}

      {/* Active AI Extracted Tags */}
      <AnimatePresence>
        {hasActiveSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-black/10 dark:border-white/10"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B2A376] font-semibold">
                AI Extracted:
              </span>

              {activeExtracted ? (
                <>
                  {activeExtracted.category && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-900 dark:bg-white text-white dark:text-black text-[11px] font-mono uppercase tracking-wider rounded-none">
                      Category: {activeExtracted.category}
                    </span>
                  )}
                  {activeExtracted.gender && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black/10 dark:bg-white/10 text-neutral-900 dark:text-white text-[11px] font-mono uppercase tracking-wider rounded-none">
                      Gender: {activeExtracted.gender}
                    </span>
                  )}
                  {activeExtracted.color && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black/10 dark:bg-white/10 text-neutral-900 dark:text-white text-[11px] font-mono uppercase tracking-wider rounded-none">
                      Color: {activeExtracted.color}
                    </span>
                  )}
                  {activeExtracted.material && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black/10 dark:bg-white/10 text-neutral-900 dark:text-white text-[11px] font-mono uppercase tracking-wider rounded-none">
                      Material: {activeExtracted.material}
                    </span>
                  )}
                  {activeExtracted.style && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black/10 dark:bg-white/10 text-neutral-900 dark:text-white text-[11px] font-mono uppercase tracking-wider rounded-none">
                      Fit: {activeExtracted.style}
                    </span>
                  )}
                  {activeExtracted.max_price !== null && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black/10 dark:bg-white/10 text-neutral-900 dark:text-white text-[11px] font-mono uppercase tracking-wider rounded-none">
                      Max Price: ${activeExtracted.max_price}
                    </span>
                  )}
                  {Array.isArray(activeExtracted.keywords) &&
                    activeExtracted.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#B2A376]/20 text-[#B2A376] text-[11px] font-mono uppercase tracking-wider rounded-none"
                      >
                        #{kw}
                      </span>
                    ))}
                </>
              ) : (
                <span className="text-[11px] font-mono tracking-wider text-neutral-500">
                  Keyword semantic match
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                Found {resultsCount} {resultsCount === 1 ? "piece" : "pieces"}
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-mono uppercase tracking-wider underline text-[#B2A376] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
