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

async function checkColumns() {
  // Let's test inserting an invalid column into orders, order_items, reviews to get Supabase to return the schema error or column list, or test common fields
  for (const table of ["orders", "order_items", "reviews"]) {
    console.log(`\n=== Testing ${table} ===`);
    const { data, error } = await supabase.from(table).insert({ __test_non_existent_column__: 1 }).select();
    if (error) {
      console.log(`Hint / Error on ${table}:`, error.message, error.details || "", error.hint || "");
    }
  }
}

checkColumns();
