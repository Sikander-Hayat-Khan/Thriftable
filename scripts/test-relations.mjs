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

async function testRelations() {
  console.log("Testing relations...");
  // Test relation query
  const { data: ordersWithItems, error: relError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .limit(1);

  if (relError) {
    console.log("Join orders -> order_items error:", relError.message);
  } else {
    console.log("✅ Join orders -> order_items works smoothly!");
  }

  // Test reviews query
  const { data: reviewsData, error: revError } = await supabase
    .from("reviews")
    .select("*")
    .limit(5);

  if (revError) {
    console.log("Reviews query error:", revError.message);
  } else {
    console.log(`✅ Reviews query succeeded (${reviewsData.length} rows)`);
  }
}

testRelations();
