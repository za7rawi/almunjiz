// Validates backup/schema.sql + backup/data.sql by restoring into a scratch DB.
// Usage: set DATABASE_URL (Supabase), then: node backup/validate-backup.js
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const CONN = process.env.DATABASE_URL;
if (!CONN) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}
const SCRATCH = "almunjiz_backup_validate";

async function main() {
  const src = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await src.connect();
  await src.query(`DROP DATABASE IF EXISTS ${SCRATCH} WITH (FORCE)`);
  await src.query(`CREATE DATABASE ${SCRATCH}`);

  const scratchConn = CONN.replace(/\/[^/]*$/, `/${SCRATCH}`);
  const dst = new Client({ connectionString: scratchConn, ssl: { rejectUnauthorized: false } });
  await dst.connect();

  console.log("applying schema.sql ...");
  await dst.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
  console.log("applying data.sql ...");
  await dst.query(fs.readFileSync(path.join(__dirname, "data.sql"), "utf8"));

  const tables = [
    "users", "services", "banners", "faqs", "payment_gateways", "coupons",
    "orders", "invoices", "file_attachments", "site_content",
  ];
  let allOk = true;
  for (const t of tables) {
    const [a, b] = await Promise.all([
      src.query(`SELECT count(*) AS n FROM "${t}"`),
      dst.query(`SELECT count(*) AS n FROM "${t}"`),
    ]);
    const ok = a.rows[0].n === b.rows[0].n;
    allOk = allOk && ok;
    console.log(`${ok ? "OK" : "MISMATCH".padEnd(7)}  ${t}: src=${a.rows[0].n} restored=${b.rows[0].n}`);
  }
  const sc = await dst.query("SELECT data->'hero'->>'titleEn' AS t FROM site_content WHERE section='homepage'");
  console.log("restored homepage heroTitleEn:", sc.rows[0].t);

  await dst.end();
  await src.query(`DROP DATABASE ${SCRATCH} WITH (FORCE)`);
  console.log(allOk ? "VALIDATION PASSED" : "VALIDATION FAILED");
  await src.end();
  if (!allOk) process.exit(1);
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
