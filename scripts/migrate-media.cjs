const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('--- MIGRATING TEMPLEMEDIA TABLE IN NEON DB ---');
  
  const ddl = `
    CREATE TABLE IF NOT EXISTS "TempleMedia" (
      "id" TEXT NOT NULL,
      "templeId" TEXT NOT NULL,
      "kind" TEXT NOT NULL DEFAULT 'PRIMARY',
      "sourceType" TEXT NOT NULL DEFAULT 'GOOGLE_PLACES',
      "sourceName" TEXT,
      "sourceUrl" TEXT,
      "googlePlaceId" TEXT,
      "googleMapsUrl" TEXT,
      "publicUrl" TEXT,
      "altText" TEXT,
      "caption" TEXT,
      "authorName" TEXT,
      "authorUrl" TEXT,
      "authorAvatarUrl" TEXT,
      "licenseType" TEXT,
      "attributionRequired" BOOLEAN NOT NULL DEFAULT false,
      "attributionHtml" TEXT,
      "isPrimary" BOOLEAN NOT NULL DEFAULT false,
      "isApproved" BOOLEAN NOT NULL DEFAULT false,
      "isFactual" BOOLEAN NOT NULL DEFAULT true,
      "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "verifiedAt" TIMESTAMP(3),
      "expiresAt" TIMESTAMP(3),
      CONSTRAINT "TempleMedia_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "TempleMedia_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX IF NOT EXISTS "TempleMedia_templeId_idx" ON "TempleMedia"("templeId");
    CREATE INDEX IF NOT EXISTS "TempleMedia_isPrimary_idx" ON "TempleMedia"("isPrimary");
    CREATE INDEX IF NOT EXISTS "TempleMedia_isApproved_idx" ON "TempleMedia"("isApproved");
    CREATE INDEX IF NOT EXISTS "TempleMedia_sourceType_idx" ON "TempleMedia"("sourceType");
    CREATE INDEX IF NOT EXISTS "TempleMedia_googlePlaceId_idx" ON "TempleMedia"("googlePlaceId");
  `;

  await pool.query(ddl);
  console.log('✅ TempleMedia table & indexes successfully verified/created in Neon PostgreSQL!');

  const check = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'TempleMedia' 
    ORDER BY ordinal_position;
  `);
  console.log(`Columns in TempleMedia (${check.rows.length}):`);
  check.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));

  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  pool.end();
  process.exit(1);
});
