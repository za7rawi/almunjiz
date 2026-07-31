// Regenerates backup/data.sql from the database.
// Usage: set DATABASE_URL, then: node backup/dump-data.js
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const CONN = process.env.DATABASE_URL;
if (!CONN) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}
const OUT = path.join(__dirname, "data.sql");

function pgArray(arr) {
  const parts = arr.map((el) => {
    if (el === null || el === undefined) return "NULL";
    const s = typeof el === "object" ? JSON.stringify(el) : String(el);
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  });
  return `'{${parts.join(",")}}'`;
}

function serialize(value, type) {
  if (value === null || value === undefined) return "NULL";
  const t = (type || "").toLowerCase();
  if (t.startsWith("_")) return pgArray(Array.isArray(value) ? value : [value]);
  if (t === "boolean") return value ? "true" : "false";
  if (t === "bigint" || t === "integer" || t === "smallint" || t === "decimal" || t === "numeric" || t === "double precision" || t === "real") {
    const n = typeof value === "string" ? value : String(value);
    return /^-?\d+(\.\d+)?$/.test(n) ? n : `'${n.replace(/'/g, "''")}'`;
  }
  if (t === "json" || t === "jsonb") {
    const s = typeof value === "string" ? value : JSON.stringify(value);
    return `'${s.replace(/'/g, "''")}'::${t}`;
  }
  if (t === "bytea") return `decode('${Buffer.from(value).toString("hex")}','hex')`;
  let s;
  if (typeof value === "object") {
    if (value instanceof Date) s = value.toISOString();
    else s = JSON.stringify(value);
  } else {
    s = String(value);
  }
  return `'${s.replace(/'/g, "''")}'`;
}

(async () => {
  const pool = new Pool({ connectionString: CONN });
  try {
    const tables = await pool.query(
      `SELECT c.relname AS name
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r'
        ORDER BY c.relname`
    );
    const tableNames = tables.rows.map((r) => r.name);
    console.log("Tables:", tableNames.join(", "));

    const fks = await pool.query(
      `SELECT
         tc.table_name AS child,
         ccu.table_name AS parent
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND ccu.table_schema = 'public'`
    );
    const deps = new Map(tableNames.map((t) => [t, []]));
    for (const f of fks.rows) {
      if (f.child !== f.parent && deps.has(f.child) && deps.has(f.parent)) {
        deps.get(f.child).push(f.parent);
      }
    }
    const visited = new Set();
    const order = [];
    function visit(t) {
      if (visited.has(t)) return;
      visited.add(t);
      for (const p of deps.get(t) || []) visit(p);
      order.push(t);
    }
    for (const t of tableNames) visit(t);
    console.log("Dump order:", order.join(", "));

    const lines = [];
    lines.push("-- ============================================");
    lines.push("-- AL-MUNJIZ DATA BACKUP");
    lines.push("-- Generated: " + new Date().toISOString());
    lines.push("-- Host: " + new URL(CONN).hostname);
    lines.push("-- ============================================");
    lines.push("");
    lines.push("BEGIN;");
    lines.push("");

    for (const t of order) {
      const cols = await pool.query(
        `SELECT column_name, udt_name
           FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position`,
        [t]
      );
      const colNames = cols.rows.map((c) => c.column_name);
      const colTypes = cols.rows.map((c) => c.udt_name);
      if (colNames.length === 0) continue;

      const res = await pool.query(`SELECT * FROM "public"."${t}"`);
      lines.push(`-- Table: ${t} (${res.rows.length} rows)`);
      if (res.rows.length === 0) {
        lines.push("");
        continue;
      }
      for (const row of res.rows) {
        const vals = colNames.map((c, i) => serialize(row[c], colTypes[i])).join(", ");
        lines.push(`INSERT INTO "public"."${t}" ("${colNames.join('", "')}") VALUES (${vals});`);
      }
      lines.push("");
    }

    lines.push("COMMIT;");
    lines.push("");
    fs.writeFileSync(OUT, lines.join("\n"), "utf8");
    console.log("WROTE:", OUT, "(" + lines.length + " lines)");
  } catch (e) {
    console.error("DUMP FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
