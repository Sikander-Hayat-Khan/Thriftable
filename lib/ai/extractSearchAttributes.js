// lib/ai/extractSearchAttributes.js
import { callGroqChat } from "./groqClient.js";

export const VALID_CATEGORIES = [
  "streetwear",
  "vintage",
  "footwear",
  "eyewear",
  "athletic_wear",
  "accessories",
  "kids",
];

export const VALID_GENDERS = ["Men", "Women", "Unisex"];

export const VALID_CONDITIONS = [
  "Like New",
  "Near Mint",
  "Excellent",
  "Grade A",
  "Pristine",
  "Great",
  "Good",
  "Fair",
];

const SYSTEM_PROMPT = `You are a high-precision shopping search query analyzer for "Thriftable", a curated sustainable fashion thrift platform.
Your task is to extract structured clothing attributes from a user's natural language search query.
You must return ONLY a valid JSON object matching the schema below. No markdown fences, no conversational text, no explanations.

Schema:
{
  "category": one of ["streetwear", "vintage", "footwear", "eyewear", "athletic_wear", "accessories", "kids"] or null,
  "gender": one of ["Men", "Women", "Unisex"] or null,
  "size": string or null,
  "condition": one of ["Like New", "Near Mint", "Excellent", "Grade A", "Pristine", "Great", "Good", "Fair"] or null,
  "color": string or null,
  "material": string or null,
  "brand": string or null,
  "style": string or null,
  "min_price": number or null,
  "max_price": number or null,
  "keywords": array of leftover descriptive terms (max 5 items, e.g. ["graphic", "striped", "baggy", "embroidered"])
}

Rules & Guidelines:
1. Category mapping:
   - "streetwear" -> streetwear (hoodies, graphic tees, cargo pants, skate wear, denim)
   - "vintage" -> vintage (retro blazers, knit vests, 90s flannels, heritage jackets, corduroy)
   - "footwear" -> footwear (sneakers, loafers, boots, runners, slip-ons, skate shoes)
   - "eyewear" -> eyewear (sunglasses, frames, glasses, specs, aviators)
   - "athletic_wear" -> athletic_wear (tracksuits, zip-ups, activewear, gym tanks, windbreakers)
   - "accessories" -> accessories (caps, hats, bandanas, rings, jewelry, ties, headbands, necklaces)
   - "kids" -> kids
2. Gender: Map "men", "male", "guy" -> "Men"; "women", "female", "lady", "girl" -> "Women"; "unisex", "everyone" -> "Unisex". Otherwise null.
3. Price: If user mentions "under $80", "less than 50", "below 100", extract max_price. If "above $40", extract min_price. If "$30 to $70", extract both. Numbers only.
4. Condition: Only set if user explicitly mentions condition (e.g. "like new", "near mint", "pristine condition", "grade a"). Vague positivity ("nice", "cool") is NOT a condition.
5. If a field is not mentioned or cannot be inferred with certainty, set it to null. Do NOT hallucinate.`;

/**
 * Sanitizes and validates the extracted attributes against allowed values.
 * @param {Object} rawAttrs
 * @returns {Object} sanitized attributes
 */
export function sanitizeExtractedAttributes(rawAttrs) {
  if (!rawAttrs || typeof rawAttrs !== "object") {
    return null;
  }

  const category =
    typeof rawAttrs.category === "string" &&
    VALID_CATEGORIES.includes(rawAttrs.category.toLowerCase().trim())
      ? rawAttrs.category.toLowerCase().trim()
      : null;

  const genderMatch =
    typeof rawAttrs.gender === "string"
      ? VALID_GENDERS.find(
          (g) => g.toLowerCase() === rawAttrs.gender.toLowerCase().trim()
        )
      : null;

  const conditionMatch =
    typeof rawAttrs.condition === "string"
      ? VALID_CONDITIONS.find(
          (c) => c.toLowerCase() === rawAttrs.condition.toLowerCase().trim()
        )
      : null;

  const cleanString = (val) =>
    typeof val === "string" && val.trim().length > 0
      ? val.trim().toLowerCase()
      : null;

  const cleanNumber = (val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 0 ? num : null;
  };

  const cleanKeywords = Array.isArray(rawAttrs.keywords)
    ? rawAttrs.keywords
        .filter((k) => typeof k === "string" && k.trim().length > 0)
        .map((k) => k.trim().toLowerCase())
        .slice(0, 5)
    : [];

  const sanitized = {
    category,
    gender: genderMatch || null,
    size: cleanString(rawAttrs.size),
    condition: conditionMatch || null,
    color: cleanString(rawAttrs.color),
    material: cleanString(rawAttrs.material),
    brand: cleanString(rawAttrs.brand),
    style: cleanString(rawAttrs.style),
    min_price: cleanNumber(rawAttrs.min_price),
    max_price: cleanNumber(rawAttrs.max_price),
    keywords: cleanKeywords,
  };

  // Check if at least one meaningful attribute was extracted
  const hasAttributes =
    Boolean(sanitized.category) ||
    Boolean(sanitized.gender) ||
    Boolean(sanitized.size) ||
    Boolean(sanitized.condition) ||
    Boolean(sanitized.color) ||
    Boolean(sanitized.material) ||
    Boolean(sanitized.brand) ||
    Boolean(sanitized.style) ||
    sanitized.min_price !== null ||
    sanitized.max_price !== null ||
    sanitized.keywords.length > 0;

  return hasAttributes ? sanitized : null;
}

/**
 * Calls Groq LLM to extract structured search attributes from natural language query.
 * @param {string} userQuery
 * @returns {Promise<{attributes: Object|null, usedFallback: boolean, error?: string}>}
 */
export async function extractSearchAttributes(userQuery) {
  if (!userQuery || typeof userQuery !== "string" || !userQuery.trim()) {
    return { attributes: null, usedFallback: true };
  }

  const trimmedQuery = userQuery.trim();

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: trimmedQuery },
    ];

    const response = await callGroqChat(messages, {
      temperature: 0,
      max_tokens: 350,
      response_format: { type: "json_object" },
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      console.warn("Groq returned empty response content. Using fallback.");
      return { attributes: null, usedFallback: true };
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      console.warn("Failed to parse Groq response JSON:", parseErr.message, content);
      return { attributes: null, usedFallback: true };
    }

    const sanitized = sanitizeExtractedAttributes(parsed);
    if (!sanitized) {
      return { attributes: null, usedFallback: true };
    }

    return { attributes: sanitized, usedFallback: false };
  } catch (err) {
    console.error("Error during Groq attribute extraction:", err.message);
    // Graceful degradation to fallback search
    return { attributes: null, usedFallback: true, error: err.message };
  }
}
