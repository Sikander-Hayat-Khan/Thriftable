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

const key = process.env.RESEND_API_KEY || process.env.RESEN_API_KEY;

async function testResend() {
  console.log("Calling Resend API with configured key...");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Thriftable <onboarding@resend.dev>",
      to: ["delivered@resend.dev"], // Resend testing inbox or recipient
      subject: "Test Resend Dispatch from Thriftable",
      html: "<h1>Thriftable Email Integration Active!</h1><p>Your Resend API key is connected and working.</p>"
    })
  });

  const data = await res.json();
  console.log("Resend Status:", res.status);
  console.log("Resend Response:", data);
}

testResend();
