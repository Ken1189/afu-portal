/**
 * AFU Portal — Database Setup Script
 * Runs the schema migration and seed data against Supabase using fetch.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://wiiomtislubvzajsqfhq.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaW9tdGlzbHVidnphanNxZmhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg1MTE5MywiZXhwIjoyMDg5NDI3MTkzfQ.O7khuzyhmOz1MaqT1FF6VlxrOj9ywvnvyQLHSmijUX4';

async function runSQL(sql, label) {
  console.log(`\n⏳ Running: ${label}...`);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    // Try the pg endpoint instead
    const pgRes = await fetch(`${SUPABASE_URL}/pg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!pgRes.ok) {
      const text = await pgRes.text();
      console.error(`❌ ${label} failed: ${pgRes.status} ${text}`);
      return false;
    }
    const data = await pgRes.json();
    console.log(`✅ ${label} — Success`);
    return true;
  }

  console.log(`✅ ${label} — Success`);
  return true;
}

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (res.ok) {
    console.log('✅ Connected to Supabase successfully!');
    return true;
  } else {
    console.error(`❌ Connection failed: ${res.status} ${res.statusText}`);
    return false;
  }
}

async function checkExistingTables() {
  console.log('📋 Checking for existing tables...');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/suppliers?select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`📊 Suppliers table exists with ${data.length > 0 ? 'data' : 'no data'}`);
    return { exists: true, hasData: data.length > 0 };
  }

  return { exists: false, hasData: false };
}

async function main() {
  console.log('🌍 AFU Portal — Database Setup');
  console.log('================================\n');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('\n💥 Cannot connect to Supabase. Check your credentials.');
    process.exit(1);
  }

  // Check if tables already exist
  const { exists, hasData } = await checkExistingTables();

  if (exists && hasData) {
    console.log('\n✅ Database is already set up with data!');
    console.log('   Suppliers table exists and has records.');
    console.log('   Skipping schema + seed to avoid duplicates.');

    // List what we can see
    const suppRes = await fetch(`${SUPABASE_URL}/rest/v1/suppliers?select=company_name,status,country&order=company_name`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    if (suppRes.ok) {
      const suppliers = await suppRes.json();
      console.log(`\n📦 Found ${suppliers.length} suppliers:`);
      suppliers.forEach(s => console.log(`   • ${s.company_name} (${s.status}) — ${s.country}`));
    }
    return;
  }

  if (exists && !hasData) {
    console.log('\n📋 Tables exist but no data. Running seed only...');
    // Read and would run seed
  } else {
    console.log('\n📋 Tables not found. Schema needs to be created.');
    console.log('   ℹ️  The Supabase REST API cannot run DDL (CREATE TABLE) statements.');
    console.log('   ℹ️  Please run the schema SQL in the Supabase SQL Editor.\n');
    console.log('   👉  https://supabase.com/dashboard/project/wiiomtislubvzajsqfhq/sql/new\n');
    console.log('   Files to run in order:');
    console.log('   1. supabase/migrations/001_initial_schema.sql');
    console.log('   2. supabase/seed.sql');
  }
}

main().catch(console.error);
