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

async function testIdType() {
  // Let's test inserting a fake row or query to see error message on type mismatch
  const test1 = await supabase.from("orders").insert({ id: "TH-123456" }).select();
  console.log("Insert with string id result:", test1.error?.message || "Success");

  const test2 = await supabase.from("order_items").insert({ order_id: "TH-123456" }).select();
  console.log("Insert order_item with string order_id result:", test2.error?.message || "Success");

  const test3 = await supabase.from("reviews").insert({ product_id: "street-1", rating: 5, comment: "test" }).select();
  console.log("Insert review result:", test3.error?.message || "Success");
}

testIdType();
