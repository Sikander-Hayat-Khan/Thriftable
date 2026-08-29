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

const candidateFields = [
  "id", "uuid", "created_at", "updated_at",
  "user_id", "user_email", "user_name", "user_avatar", "author_name", "customer_name", "customer_email",
  "order_id", "order_number", "product_id", "product_name", "product_image",
  "status", "order_status", "total", "total_amount", "subtotal", "tax", "shipping_cost", "discount",
  "shipping_address", "payment_method", "payment_details", "shipping_method", "shipping_method_label",
  "tracking_number", "carrier", "estimated_delivery", "delivered_at",
  "items", "order_items", "quantity", "price", "unit_price", "size", "color", "image", "image_url", "name", "title",
  "rating", "stars", "comment", "review_text", "content", "fit", "fit_rating", "fit_feedback",
  "condition_rating", "quality_rating", "photos", "images", "likes", "helpful_votes", "verified",
  "is_verified", "verified_purchase", "admin_reply", "admin_replied_at", "is_featured", "is_featured_testimonial"
];

async function probe(tableName) {
  const results = await Promise.all(
    candidateFields.map(async (f) => {
      const { error } = await supabase.from(tableName).select(f).limit(1);
      return !error ? f : null;
    })
  );
  const found = results.filter(Boolean);
  console.log(`\nTable '${tableName}' columns (${found.length}):`, found.join(", "));
}

async function main() {
  await probe("orders");
  await probe("order_items");
  await probe("reviews");
  process.exit(0);
}

main();
