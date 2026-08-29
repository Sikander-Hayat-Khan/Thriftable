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
  "user_id", "userId", "user_email", "userEmail", "customer_id", "customer_name", "user_name", "author_name",
  "order_id", "orderId", "order_number", "orderNumber",
  "product_id", "productId", "item_id", "itemId",
  "status", "order_status", "total", "total_amount", "subtotal", "tax", "shipping_cost", "discount",
  "shipping_address", "payment_method", "payment_details", "shipping_method", "shipping_method_label",
  "tracking_number", "carrier", "estimated_delivery", "delivered_at",
  "items", "order_items", "quantity", "price", "unit_price", "size", "color", "image", "image_url", "name", "title",
  "rating", "stars", "comment", "review_text", "content", "fit", "fit_rating", "fit_feedback",
  "condition_rating", "quality_rating", "photos", "images", "likes", "helpful_votes", "verified",
  "is_verified", "verified_purchase", "admin_reply", "admin_replied_at", "is_featured", "is_featured_testimonial"
];

async function probeTable(tableName) {
  const existingCols = [];
  for (const field of candidateFields) {
    const { error } = await supabase.from(tableName).select(field).limit(1);
    if (!error) {
      existingCols.push(field);
    }
  }
  console.log(`\nTable '${tableName}' discovered columns:`);
  console.log(existingCols.join(", "));
}

async function run() {
  await probeTable("orders");
  await probeTable("order_items");
  await probeTable("reviews");
}

run();
