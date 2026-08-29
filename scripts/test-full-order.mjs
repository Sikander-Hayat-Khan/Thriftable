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

async function testFullOrder() {
  const orderId = crypto.randomUUID();
  console.log("Inserting order with ID:", orderId);
  const { error: ordErr } = await supabase.from("orders").insert({
    id: orderId,
    user_id: null,
    status: "processing",
    total_amount: 95.0,
    shipping_address: JSON.stringify({ firstName: "Guest", city: "Lahore" }),
    payment_method: "card"
  });

  if (ordErr) {
    console.log("Order insert error:", ordErr);
    return;
  }
  console.log("✅ Order insert SUCCESS!");

  console.log("Inserting order_items...");
  const { error: itemErr } = await supabase.from("order_items").insert([
    {
      order_id: orderId,
      product_id: "street-1",
      quantity: 1,
      price: 48,
      size: "L",
      image: "/shop/streetwear/street1.jpg",
      name: "Vintage 90s Heavyweight Graphic Tee"
    }
  ]);

  if (itemErr) {
    console.log("❌ order_items insert error:", itemErr);
  } else {
    console.log("✅ order_items insert SUCCESS!");
  }
}

testFullOrder();
