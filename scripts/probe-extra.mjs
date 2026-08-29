import { createClient } from "@supabase/supabase-js";
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

const extraFields = [
  "order_id", "order_number", "tracking_number", "carrier", "shipping_method", "shipping_cost", "subtotal",
  "photos", "images", "image_urls", "fit", "fit_feedback", "condition", "condition_rating",
  "user_name", "author_name", "user_email", "user_avatar", "avatar_url",
  "title", "headline", "summary", "body", "text", "review", "reply", "admin_reply", "helpful", "upvotes",
  "is_featured", "featured", "verified", "is_verified", "status"
];

async function probeExtras(tableName) {
  const results = await Promise.all(
    extraFields.map(async (f) => {
      const { error } = await supabase.from(tableName).select(f).limit(1);
      return !error ? f : null;
    })
  );
  const found = results.filter(Boolean);
  console.log(`\nTable '${tableName}' extra columns found:`, found.join(", "));
}

async function main() {
  await probeExtras("orders");
  await probeExtras("order_items");
  await probeExtras("reviews");
  process.exit(0);
}

main();
