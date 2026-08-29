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

async function testGuestInsert() {
  console.log("Testing guest order insert (user_id = null)...");
  const { data: orderData, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: null,
      status: "Processing",
      total_amount: 84.0,
      shipping_address: JSON.stringify({ name: "Guest User", email: "guest@example.com" }),
      payment_method: "card"
    })
    .select();

  if (orderErr) {
    console.log("❌ Guest order insert error:", orderErr.message, orderErr.details || "");
  } else {
    console.log("✅ Guest order inserted successfully!", orderData);
    // clean up test row
    if (orderData[0]?.id) {
      await supabase.from("orders").delete().eq("id", orderData[0].id);
    }
  }

  console.log("\nTesting guest wishlist insert (user_id = null)...");
  const { data: wishData, error: wishErr } = await supabase
    .from("wishlist")
    .insert({
      user_id: null,
      product_id: "street-1"
    })
    .select();

  if (wishErr) {
    console.log("❌ Guest wishlist insert error:", wishErr.message, wishErr.details || "");
  } else {
    console.log("✅ Guest wishlist inserted successfully!", wishData);
    if (wishData[0]?.id) {
      await supabase.from("wishlist").delete().eq("id", wishData[0].id);
    }
  }
}

testGuestInsert();
