// lib/ai/buildProductQuery.js
import { catalogueItems } from "@/data/products";
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for server-side queries.
 */
function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    return createClient(supabaseUrl, supabaseKey);
  }
  return null;
}

/**
 * Calculates a semantic relevance score for a product given extracted search attributes.
 * @param {Object} item - Product item
 * @param {Object} attrs - Sanitized extracted attributes
 * @returns {number} Relevance score (higher is better)
 */
export function calculateRelevanceScore(item, attrs) {
  let score = 0;
  const nameLower = (item.name || "").toLowerCase();
  const descLower = (item.description || "").toLowerCase();
  const catLower = (item.category || "").toLowerCase();
  const genderLower = (item.gender || "").toLowerCase();
  const sizeLower = (item.size || "").toLowerCase();
  const condLower = (item.condition || "").toLowerCase();

  // Extract color names from product colors array
  const itemColorNames = Array.isArray(item.colors)
    ? item.colors.map((c) => (c?.name || "").toLowerCase()).join(" ")
    : "";

  // 1. Category Matching
  if (attrs.category) {
    if (catLower === attrs.category.toLowerCase()) {
      score += 15;
    } else {
      // If user specified a category and item is from a completely different category, reduce score
      score -= 5;
    }
  }

  // 2. Gender Matching
  if (attrs.gender) {
    const targetGender = attrs.gender.toLowerCase();
    if (genderLower === targetGender) {
      score += 10;
    } else if (genderLower === "unisex") {
      score += 6; // Unisex items are friendly matches
    } else {
      score -= 8;
    }
  }

  // 3. Price Filtering & Scoring
  const numericPrice =
    typeof item.price === "number"
      ? item.price
      : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;

  if (attrs.max_price !== null) {
    if (numericPrice <= attrs.max_price) {
      score += 10;
    } else {
      // Penalize items over budget
      score -= 20;
    }
  }

  if (attrs.min_price !== null) {
    if (numericPrice >= attrs.min_price) {
      score += 5;
    } else {
      score -= 10;
    }
  }

  // 4. Color Matching
  if (attrs.color) {
    const color = attrs.color.toLowerCase();
    if (itemColorNames.includes(color) || descLower.includes(color) || nameLower.includes(color)) {
      score += 12;
    }
  }

  // 5. Material Matching (e.g., leather, denim, cotton, wool, silk)
  if (attrs.material) {
    const mat = attrs.material.toLowerCase();
    if (descLower.includes(mat) || nameLower.includes(mat)) {
      score += 14;
    }
  }

  // 6. Style / Fit Matching (e.g., oversized, wide-leg, baggy, crop, vintage)
  if (attrs.style) {
    const style = attrs.style.toLowerCase();
    if (descLower.includes(style) || nameLower.includes(style)) {
      score += 10;
    }
  }

  // 7. Brand Matching (e.g., Bershka, Zara, Timberland, Charles & Keith)
  if (attrs.brand) {
    const brand = attrs.brand.toLowerCase();
    if (nameLower.includes(brand) || descLower.includes(brand)) {
      score += 15;
    }
  }

  // 8. Size Matching
  if (attrs.size) {
    const size = attrs.size.toLowerCase();
    if (sizeLower.includes(size) || descLower.includes(size)) {
      score += 8;
    }
  }

  // 9. Condition Matching
  if (attrs.condition) {
    const cond = attrs.condition.toLowerCase();
    if (condLower.includes(cond) || descLower.includes(cond)) {
      score += 8;
    }
  }

  // 10. Leftover Keywords Matching
  if (Array.isArray(attrs.keywords) && attrs.keywords.length > 0) {
    for (const kw of attrs.keywords) {
      const kwLower = kw.toLowerCase();
      if (nameLower.includes(kwLower)) {
        score += 8;
      } else if (descLower.includes(kwLower)) {
        score += 5;
      } else if (catLower.includes(kwLower)) {
        score += 4;
      }
    }
  }

  return score;
}

/**
 * Standard fallback keyword search matching any terms against name/description/category.
 * @param {Array<Object>} products
 * @param {string} rawQuery
 * @returns {Array<Object>}
 */
export function performFallbackSearch(products, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) {
    return products;
  }

  const terms = rawQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) return products;

  return products
    .map((item) => {
      const combined = `${item.name} ${item.description} ${item.category} ${item.gender}`.toLowerCase();
      let matchCount = 0;
      for (const term of terms) {
        if (combined.includes(term)) {
          matchCount += 1;
        }
      }
      return { item, matchCount };
    })
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map(({ item }) => item);
}

/**
 * Executes a semantic natural-language product search using extracted attributes.
 * @param {Object} extractedAttributes - Sanitized output from extractSearchAttributes
 * @param {string} rawQuery - Original user query for fallback matching
 * @returns {Promise<{items: Array<Object>, total: number}>}
 */
export async function searchProductsWithAttributes(extractedAttributes, rawQuery) {
  let allProducts = catalogueItems;

  // Try to fetch latest live stock & price updates from Supabase
  try {
    const supabase = getServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from("products").select("*");
      if (!error && data && data.length > 0) {
        const liveMap = new Map(data.map((p) => [String(p.id), p]));
        allProducts = catalogueItems.map((catItem) => {
          const live = liveMap.get(String(catItem.id));
          if (live) {
            const stockNum = live.stock !== undefined ? Number(live.stock) : 1;
            return {
              ...catItem,
              stock: stockNum,
              is_available: live.is_available !== false && stockNum > 0,
              price:
                typeof live.price === "number"
                  ? `$${live.price.toFixed(2)}`
                  : live.price || catItem.price,
            };
          }
          return catItem;
        });
      }
    }
  } catch (err) {
    console.warn("Supabase fetch in buildProductQuery failed, using catalogueItems:", err.message);
  }

  // Filter only available items
  const availableProducts = allProducts.filter(
    (item) => item.is_available !== false && (item.stock === undefined || item.stock > 0)
  );

  // If no attributes were extracted, use standard fallback search
  if (!extractedAttributes) {
    const fallbackResults = performFallbackSearch(availableProducts, rawQuery);
    return { items: fallbackResults, total: fallbackResults.length };
  }

  // Score all available products based on extracted attributes
  const scoredItems = availableProducts
    .map((item) => ({
      item,
      score: calculateRelevanceScore(item, extractedAttributes),
    }))
    // Keep items with positive relevance score
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  // If strict scoring produced 0 results, fall back to relaxed keyword search
  if (scoredItems.length === 0 && rawQuery) {
    const relaxed = performFallbackSearch(availableProducts, rawQuery);
    return { items: relaxed, total: relaxed.length };
  }

  return {
    items: scoredItems,
    total: scoredItems.length,
  };
}
