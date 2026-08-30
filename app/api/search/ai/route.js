// app/api/search/ai/route.js
import { NextResponse } from "next/server";
import { extractSearchAttributes } from "@/lib/ai/extractSearchAttributes";
import { searchProductsWithAttributes } from "@/lib/ai/buildProductQuery";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body provided." },
        { status: 400 }
      );
    }

    const { query } = body || {};

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "A search query string is required." },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();

    // 1. Extract attributes using Groq LLM
    const { attributes, usedFallback } = await extractSearchAttributes(trimmedQuery);

    // 2. Search products using extracted attributes or fallback
    const { items, total } = await searchProductsWithAttributes(attributes, trimmedQuery);

    return NextResponse.json({
      items,
      extracted: attributes,
      usedFallback,
      count: total,
    });
  } catch (error) {
    console.error("AI Search route error:", error);
    return NextResponse.json(
      {
        error:
          "AI Search is temporarily unavailable. Try browsing categories directly.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
