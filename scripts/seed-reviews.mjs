import { createClient } from "@supabase/supabase-js";
import { seedReviews } from "../data/reviews.js";
import fs from "fs";
import path from "path";

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

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Checking if reviews table allows insert with anon key...");
  
  for (const r of seedReviews) {
    const { data, error } = await supabase.from("reviews").insert({
      product_id: r.productId,
      rating: r.rating,
      comment: `${r.headline} — ${r.reviewText}`,
    }).select();

    if (error) {
      console.log(`Review seed error for ${r.id}:`, error.message, error.details || "");
    } else {
      console.log(`✅ Seeded review ${r.id} -> Supabase ID:`, data[0]?.id);
    }
  }
}

seed();
