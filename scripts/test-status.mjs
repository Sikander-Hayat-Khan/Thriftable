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

async function testStatusCheck() {
  const candidateStatuses = [
    "pending", "processing", "shipped", "delivered", "cancelled",
    "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED",
    "paid", "unpaid", "created", "active", "placed"
  ];

  for (const st of candidateStatuses) {
    const res = await supabase.from("orders").insert({
      user_id: null,
      status: st,
      total_amount: 50,
      shipping_address: JSON.stringify({ name: "Guest" }),
      payment_method: "card"
    });

    if (res.error) {
      if (res.error.code !== '23514') {
        console.log(`Status '${st}': PASSED status check! (returned error ${res.error.code}: ${res.error.message})`);
      }
    } else {
      console.log(`Status '${st}': INSERT SUCCESS!`);
    }
  }
}

testStatusCheck();
