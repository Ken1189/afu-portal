/**
 * AFU Portal — Push Schema + Seed to Supabase
 * Uses pg module for direct Postgres connection.
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

const DB_URL = 'postgresql://postgres:Kennaird118%40@db.wiiomtislubvzajsqfhq.supabase.co:5432/postgres';

async function run() {
  console.log('🌍 AFU Portal — Database Setup');
  console.log('================================\n');

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔌 Connecting to Supabase Postgres...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Run schema migration
    console.log('⏳ Running schema migration (001_initial_schema.sql)...');
    const schemaSQL = readFileSync(
      resolve(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql'),
      'utf-8'
    );
    await client.query(schemaSQL);
    console.log('✅ Schema created — 12 tables, enums, RLS policies, triggers\n');

    // Run seed data
    console.log('⏳ Running seed data (seed.sql)...');
    const seedSQL = readFileSync(
      resolve(__dirname, '..', 'supabase', 'seed.sql'),
      'utf-8'
    );
    await client.query(seedSQL);
    console.log('✅ Seed data inserted — 10 suppliers\n');

    // Verify
    console.log('📋 Verifying...');
    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log(`\n📊 Tables created (${tablesRes.rows.length}):`);
    tablesRes.rows.forEach(r => console.log(`   • ${r.table_name}`));

    const suppRes = await client.query(`
      SELECT company_name, status, country FROM suppliers ORDER BY company_name;
    `);
    console.log(`\n📦 Suppliers seeded (${suppRes.rows.length}):`);
    suppRes.rows.forEach(s => console.log(`   • ${s.company_name} (${s.status}) — ${s.country}`));

    console.log('\n🎉 Database setup complete!');

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('already exists')) {
      console.log('\n⚠️  Some objects already exist. Trying seed only...');
      try {
        const seedSQL = readFileSync(
          resolve(__dirname, '..', 'supabase', 'seed.sql'),
          'utf-8'
        );
        await client.query(seedSQL);
        console.log('✅ Seed data inserted successfully!');
      } catch (seedErr) {
        console.error('❌ Seed error:', seedErr.message);
      }
    }
  } finally {
    await client.end();
  }
}

run().catch(console.error);
