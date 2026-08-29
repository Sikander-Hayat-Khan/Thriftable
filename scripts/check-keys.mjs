import fs from "fs";
import path from "path";

const content = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
const lines = content.split("\n");
console.log("Lines in .env.local:");
lines.forEach((l) => {
  const parts = l.split("=");
  if (parts[0]) {
    console.log(`- Key: '${parts[0].trim()}', Value Length: ${(parts[1] || "").trim().length}`);
  }
});
