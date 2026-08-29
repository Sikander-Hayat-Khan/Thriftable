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

async function inspect() {
  console.log("Checking tables in Supabase...");

  for (const table of ["orders", "order_item", "order_items", "reviews"]) {
    const { data, error } = await supabase.from(table).select("*").limit(3);
    if (error) {
      console.log(`Table '${table}' error:`, error.message, error.details || "");
    } else {
      console.log(`Table '${table}' status: EXISTS (${data.length} rows returned)`);
      if (data.length > 0) {
        console.log(`Sample row keys for '${table}':`, Object.keys(data[0]));
        console.log(`Sample data for '${table}':`, JSON.stringify(data[0], null, 2));
      } else {
        // Try to insert a dummy to see schema or test permissions if empty, or just report 0 rows
        console.log(`Table '${table}' is currently empty.`);
      }
    }
  }
}

inspect();
