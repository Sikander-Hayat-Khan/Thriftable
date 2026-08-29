import { catalogueItems } from "../data/products.js";
import fs from "fs";
import path from "path";

const values = catalogueItems
  .map((item) => {
    const rawPrice = item.price.replace(/[^0-9.]/g, "");
    const price = parseFloat(rawPrice) || 0;
    const name = item.name.replace(/'/g, "''");
    const desc = (item.description || "").replace(/'/g, "''");
    const cond = (item.condition || "").replace(/'/g, "''");
    const colors = JSON.stringify(item.colors || []).replace(/'/g, "''");
    const pos = item.objectPosition || "object-center";
    const size = (item.size || "One Size").replace(/'/g, "''");
    const gender = (item.gender || "Unisex").replace(/'/g, "''");

    return `('${item.id}', '${name}', '${item.category}', ${price}, '${size}', '${gender}', '${cond}', '${desc}', '${colors}'::jsonb, '${item.image}', '${pos}', true, 1)`;
  })
  .join(",\n");

const sql = `-- Seed 65 Curated Thriftable Products
insert into public.products (
  id, name, category, price, size, gender, condition, description, colors, image, object_position, is_available, stock
)
values
${values}
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  price = excluded.price,
  size = excluded.size,
  gender = excluded.gender,
  condition = excluded.condition,
  description = excluded.description,
  colors = excluded.colors,
  image = excluded.image,
  object_position = excluded.object_position,
  is_available = excluded.is_available,
  stock = excluded.stock;
`;

const outputPath = path.resolve(process.cwd(), "scripts", "seed_products.sql");
fs.writeFileSync(outputPath, sql, "utf-8");
console.log(`Generated ${outputPath} with ${catalogueItems.length} products!`);
