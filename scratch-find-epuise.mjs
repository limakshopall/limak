import pg from "pg";
import "dotenv/config";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const res = await client.query(`
  SELECT p.slug, p.name, COUNT(*) AS nb_variantes, MAX(v.stock) AS stock_max
  FROM "ProductVariant" v
  JOIN "Product" p ON p.id = v."productId"
  WHERE p."isActive" = true
  GROUP BY p.id, p.slug, p.name
  HAVING MAX(v.stock) <= 0
  LIMIT 5;
`);
console.log(res.rows);
await client.end();
