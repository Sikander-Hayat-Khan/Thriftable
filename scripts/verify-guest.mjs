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

async function testGuestOrder() {
  const orderId = crypto.randomUUID();
  console.log("Simulating checkout as guest with orderId:", orderId);

  const { error: ordErr } = await supabase.from("orders").insert({
    id: orderId,
    user_id: null,
    status: "processing",
    total_amount: 120.0,
    shipping_address: JSON.stringify({
      firstName: "Ali",
      lastName: "Raza",
      email: "ali.raza@example.com",
      address: "123 Main St",
      city: "Islamabad"
    }),
    payment_method: "cod",
    created_at: new Date().toISOString()
  });

  if (ordErr) {
    console.error("Order error:", ordErr);
    return;
  }

  const { error: itemErr } = await supabase.from("order_items").insert([
    {
      order_id: orderId,
      product_id: "street-2",
      quantity: 1,
      price: 84.0,
      size: "M",
      image: "/shop/streetwear/street2.jpg",
      name: "Vintage Cargo Pants"
    }
  ]);

  if (itemErr) {
    console.error("Item error:", itemErr);
    return;
  }

  console.log("🎉 SUCCESS: Guest order and line items successfully stored in Supabase!");
}

testGuestOrder();
