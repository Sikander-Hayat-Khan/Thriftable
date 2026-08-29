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

async function inspectProfileTable() {
  // Check if we can insert or what columns it complains about
  const dummyId = crypto.randomUUID();
  const testObj = {
    id: dummyId,
    full_name: "Test User",
    email: "test@example.com",
    avatar_url: "/avatars/default.jpg",
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from("profiles").insert(testObj).select();
  console.log("Insert test with fields result:", error || data);
}

inspectProfileTable();
