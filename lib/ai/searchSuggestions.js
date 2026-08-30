// lib/ai/searchSuggestions.js
import { catalogueItems } from "@/data/products";

// Curated high-intent shopping queries and styles
const SEARCH_INTENTS = [
  "Oversized vintage leather jacket in black",
  "Loose fit skater denim with puddle hem",
  "Chunky retro platform sneakers",
  "Gold titanium geometric aviator glasses",
  "Athletic tracksuit set under $70",
  "Minimalist off-white drop-shoulder tee",
  "Vintage shadow-check flannel shirt",
  "Supple leather penny loafers in black",
  "Sage green striped boxy tee",
  "Olive paisley silk bandana",
  "Ultra-wide baggy puddle skate jeans",
  "Crimson oversized knit pullover sweater",
  "Archival tortoise acetate sunglasses",
  "Surgical grade polarized sunglasses",
  "Lightweight performance running windbreaker",
  "Heavyweight loungewear set in navy",
  "Antiqued silver stackable rings set",
  "Vintage heritage pinstripe suit ensemble",
  "Nouveau botanical camp collar button-down",
  "Chunky lug-sole oxblood loafers",
];

const ATTRIBUTE_KEYWORDS = [
  { term: "leather", category: "vintage", prompt: "Vintage black leather jacket" },
  { term: "denim", category: "streetwear", prompt: "Loose wide-leg puddle denim jeans" },
  { term: "hoodie", category: "vintage", prompt: "Varsity club embroidered graphic hoodie" },
  { term: "tee", category: "streetwear", prompt: "Heavyweight drop-shoulder boxy tee" },
  { term: "sneakers", category: "footwear", prompt: "Retro court low-top platform sneakers" },
  { term: "sunglasses", category: "eyewear", prompt: "90s minimalist oval sunglasses" },
  { term: "tracksuit", category: "athletic_wear", prompt: "Retro panel boxy tracksuit set" },
  { term: "cargo", category: "streetwear", prompt: "Utility oversized olive cargo pants" },
  { term: "flannel", category: "vintage", prompt: "Shadow-check oversized flannel shirt" },
  { term: "loafers", category: "footwear", prompt: "Chunky lug-sole penny loafers" },
  { term: "jacket", category: "vintage", prompt: "Vintage oversized outerwear jacket" },
  { term: "pants", category: "streetwear", prompt: "Relaxed wide-leg fluid trousers" },
  { term: "sweatshirt", category: "streetwear", prompt: "Heavy-knit oversized crewneck sweater" },
  { term: "glasses", category: "eyewear", prompt: "Gold wire octagonal rimless specs" },
  { term: "cap", category: "accessories", prompt: "Distressed collegiate washed canvas cap" },
  { term: "bandana", category: "accessories", prompt: "Crimson paisley classic square bandana" },
];

/**
 * Returns real-time AI suggestions based on the user's typing query.
 * @param {string} rawInput
 * @param {number} maxPrompts
 * @param {number} maxItems
 * @returns {{ prompts: string[], matchedItems: Object[] }}
 */
export function getAiSearchSuggestions(rawInput, maxPrompts = 5, maxItems = 3) {
  const query = (rawInput || "").trim().toLowerCase();

  if (!query) {
    return {
      prompts: SEARCH_INTENTS.slice(0, maxPrompts),
      matchedItems: [],
    };
  }

  const queryTerms = query.split(/\s+/).filter(Boolean);

  // 1. Find matching prompt phrases
  const scoredPrompts = new Map();

  // Check SEARCH_INTENTS
  for (const intent of SEARCH_INTENTS) {
    const intentLower = intent.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      if (intentLower.startsWith(term)) score += 10;
      else if (intentLower.includes(` ${term}`)) score += 8;
      else if (intentLower.includes(term)) score += 5;
    }
    if (score > 0) {
      scoredPrompts.set(intent, score);
    }
  }

  // Check ATTRIBUTE_KEYWORDS
  for (const attr of ATTRIBUTE_KEYWORDS) {
    if (attr.term.includes(query) || query.includes(attr.term)) {
      scoredPrompts.set(attr.prompt, (scoredPrompts.get(attr.prompt) || 0) + 12);
    }
  }

  // Check Catalogue Products
  for (const item of catalogueItems) {
    const nameLower = item.name.toLowerCase();
    const descLower = item.description.toLowerCase();
    let match = false;
    for (const term of queryTerms) {
      if (nameLower.includes(term) || descLower.includes(term)) {
        match = true;
        break;
      }
    }
    if (match) {
      const generatedPrompt = `${item.name} in ${item.category}`;
      scoredPrompts.set(generatedPrompt, (scoredPrompts.get(generatedPrompt) || 0) + 7);
    }
  }

  // Sort prompts by relevance
  const sortedPrompts = Array.from(scoredPrompts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([prompt]) => prompt)
    .slice(0, maxPrompts);

  // If few suggestions found, generate dynamic completions
  if (sortedPrompts.length < maxPrompts) {
    const fallbackOptions = [
      `${rawInput} under $80`,
      `Vintage ${rawInput} oversized`,
      `Streetwear ${rawInput} in black`,
      `${rawInput} good condition`,
    ];
    for (const fb of fallbackOptions) {
      if (!sortedPrompts.includes(fb) && sortedPrompts.length < maxPrompts) {
        sortedPrompts.push(fb);
      }
    }
  }

  // 2. Find matching catalogue preview items (instant preview)
  const matchedItems = catalogueItems
    .filter((item) => {
      const combined = `${item.name} ${item.description} ${item.category} ${item.gender}`.toLowerCase();
      return queryTerms.some((term) => combined.includes(term));
    })
    .slice(0, maxItems)
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image,
    }));

  return {
    prompts: sortedPrompts,
    matchedItems,
  };
}
