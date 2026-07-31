// Updates site_content.homepage hero copy (AR/EN) to the final brand copy.
// Usage: node backup/update-hero-copy.js
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

const CONN = process.env.DATABASE_URL;
if (!CONN) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}

const HERO = {
  titleAr: "منصة المنجز",
  titleEn: "Al-Munjiz Platform",
  subtitleAr: "منصتك المتكاملة لخدمات التأشيرات والسفر والأعمال",
  subtitleEn: "Your integrated platform for visa, travel & business services",
  descriptionAr: "أنجز معاملاتك بسهولة، بسرعة، وبموثوقية.",
  descriptionEn: "Complete your transactions easily, quickly, and reliably.",
};

async function main() {
  const client = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(
    "SELECT data FROM site_content WHERE section = 'homepage'"
  );
  if (res.rows.length === 0) {
    console.error("No homepage site_content row found.");
    await client.end();
    process.exit(1);
  }
  const data = res.rows[0].data || {};
  data.hero = { ...(data.hero || {}), ...HERO };

  await client.query(
    "UPDATE site_content SET data = $1::jsonb, \"updatedAt\" = now() WHERE section = 'homepage'",
    [JSON.stringify(data)]
  );

  const check = await client.query(
    "SELECT data->'hero' AS hero FROM site_content WHERE section = 'homepage'"
  );
  console.log("Updated hero:", JSON.stringify(check.rows[0].hero, null, 2));
  await client.end();
  console.log("DONE");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
