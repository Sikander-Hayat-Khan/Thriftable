import { createClient } from "@supabase/supabase-js";
import { catalogueItems } from "../data/products.js";
import fs from "fs";
import path from "path";

// Simple helper to load .env.local variables
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`🌱 Seeding ${catalogueItems.length} products to Supabase...`);

  const formattedProducts = catalogueItems.map((item) => {
    // Convert price string "$48.00" -> 48.00 numeric
    const rawPrice = item.price.replace(/[^0-9.]/g, "");
    const numericPrice = parseFloat(rawPrice) || 0;

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      price: numericPrice,
      size: item.size || null,
      gender: item.gender || "Unisex",
      condition: item.condition || null,
      description: item.description || null,
      colors: item.colors || [],
      image: item.image,
      object_position: item.objectPosition || "object-center",
      is_available: true,
      stock: 1,
    };
  });

  const { data, error } = await supabase
    .from("products")
    .upsert(formattedProducts, { onConflict: "id" });

  if (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${formattedProducts.length} products to the 'products' table!`);
}

seed();
