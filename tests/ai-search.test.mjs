// tests/ai-search.test.mjs
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  sanitizeExtractedAttributes,
  VALID_CATEGORIES,
  VALID_GENDERS,
} from "../lib/ai/extractSearchAttributes.js";
import {
  calculateRelevanceScore,
  performFallbackSearch,
} from "../lib/ai/buildProductQuery.js";
import { catalogueItems } from "../data/products.js";

describe("AI Search Attribute Extraction & Sanitization", () => {
  it("should correctly sanitize valid extracted attributes", () => {
    const raw = {
      category: "streetwear",
      gender: "Men",
      size: "L",
      condition: "Grade A",
      color: "black",
      material: "leather",
      brand: "Bershka",
      style: "oversized",
      min_price: 30,
      max_price: 100,
      keywords: ["jacket", "zipper"],
    };

    const sanitized = sanitizeExtractedAttributes(raw);
    assert.ok(sanitized !== null, "Sanitized output should not be null");
    assert.equal(sanitized.category, "streetwear");
    assert.equal(sanitized.gender, "Men");
    assert.equal(sanitized.size, "l");
    assert.equal(sanitized.condition, "Grade A");
    assert.equal(sanitized.color, "black");
    assert.equal(sanitized.material, "leather");
    assert.equal(sanitized.brand, "bershka");
    assert.equal(sanitized.style, "oversized");
    assert.equal(sanitized.min_price, 30);
    assert.equal(sanitized.max_price, 100);
    assert.deepEqual(sanitized.keywords, ["jacket", "zipper"]);
  });

  it("should reject invalid enum categories and return null for category", () => {
    const raw = {
      category: "invalid_category_123",
      color: "blue",
    };

    const sanitized = sanitizeExtractedAttributes(raw);
    assert.ok(sanitized !== null);
    assert.equal(sanitized.category, null);
    assert.equal(sanitized.color, "blue");
  });

  it("should return null if all fields are null or empty", () => {
    const raw = {
      category: null,
      gender: null,
      size: null,
      condition: null,
      color: null,
      material: null,
      brand: null,
      style: null,
      min_price: null,
      max_price: null,
      keywords: [],
    };

    const sanitized = sanitizeExtractedAttributes(raw);
    assert.equal(sanitized, null, "Should return null when no attributes extracted");
  });
});

describe("AI Semantic Relevance Scoring & Search", () => {
  it("should score products matching category and material higher", () => {
    const item1 = {
      id: "test-1",
      name: "Vintage Leather Jacket",
      category: "vintage",
      description: "A genuine black leather jacket with oversized fit.",
      price: "$95.00",
      gender: "Unisex",
      colors: [{ name: "Jet Black", hex: "#000000" }],
    };

    const item2 = {
      id: "test-2",
      name: "Cotton Striped Tee",
      category: "streetwear",
      description: "A lightweight cotton t-shirt.",
      price: "$45.00",
      gender: "Men",
      colors: [{ name: "White", hex: "#ffffff" }],
    };

    const attrs = {
      category: "vintage",
      color: "black",
      material: "leather",
      style: "oversized",
      max_price: 100,
      keywords: ["jacket"],
    };

    const score1 = calculateRelevanceScore(item1, attrs);
    const score2 = calculateRelevanceScore(item2, attrs);

    assert.ok(score1 > score2, `Expected item1 score (${score1}) to be higher than item2 score (${score2})`);
    assert.ok(score1 > 30, `Expected item1 to have a strong positive score, got ${score1}`);
  });

  it("should correctly perform fallback keyword search across catalogue", () => {
    const results = performFallbackSearch(catalogueItems, "denim jeans");
    assert.ok(results.length > 0, "Fallback search should find denim items");
    const firstMatch = results[0];
    const text = `${firstMatch.name} ${firstMatch.description}`.toLowerCase();
    assert.ok(text.includes("denim") || text.includes("jeans"), "First result should match denim/jeans");
  });
});

describe("Real-time AI Search Suggestions", () => {
  it("should return contextual suggestions matching user input as they type", async () => {
    const { getAiSearchSuggestions } = await import("../lib/ai/searchSuggestions.js");
    
    // Typing "over" -> should suggest oversized clothing
    const overRes = getAiSearchSuggestions("over");
    assert.ok(overRes.prompts.length > 0, "Should return prompt suggestions for 'over'");
    assert.ok(
      overRes.prompts.some((p) => p.toLowerCase().includes("oversized")),
      "Should contain 'oversized' prompt"
    );

    // Typing "leather" -> should return leather prompts and matching items
    const leatherRes = getAiSearchSuggestions("leather");
    assert.ok(leatherRes.prompts.length > 0, "Should return prompt suggestions for 'leather'");
    assert.ok(
      leatherRes.prompts.some((p) => p.toLowerCase().includes("leather")),
      "Should contain 'leather' in prompt"
    );
  });
});

