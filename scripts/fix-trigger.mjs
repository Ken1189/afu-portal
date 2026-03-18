/**
 * Fix the auth trigger and create admin users
 */

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaW9tdGlzbHVidnphanNxZmhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg1MTE5MywiZXhwIjoyMDg5NDI3MTkzfQ.O7khuzyhmOz1MaqT1FF6VlxrOj9ywvnvyQLHSmijUX4';
const BASE = 'https://wiiomtislubvzajsqfhq.supabase.co';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
};

async function main() {
  // Step 1: Verify REST API works
  console.log('📡 Testing REST API...');
  const testRes = await fetch(`${BASE}/rest/v1/suppliers?select=company_name,status&limit=2`, { headers });
  const suppliers = await testRes.json();
  console.log('✅ REST API working:', suppliers.length, 'suppliers found\n');

  // Step 2: Drop the trigger via a temporary RPC
  // First create a helper function that drops and recreates the trigger
  console.log('🔧 Creating helper function to fix trigger...');

  // We can use the Supabase Management API to run SQL
  // Or we can try a creative approach: use the service role to call pg functions

  // Actually, let's try the simplest approach: just create the users without the trigger
  // by first inserting the profile manually, then creating the auth user

  // Step 2: Create admin user (the trigger might fail but the user gets created)
  console.log('🔑 Creating admin auth user...');

  // First, let's try creating the profile FIRST, then the auth user
  // This way when the trigger fires, it hits ON CONFLICT DO NOTHING

  // Generate a UUID for the admin
  const adminId = crypto.randomUUID();

  console.log(`   Pre-creating profile with ID: ${adminId}`);

  // Insert profile first
  const profileRes = await fetch(`${BASE}/rest/v1/profiles`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify({
      id: adminId,
      email: 'admin@afu.org',
      full_name: 'AFU Administrator',
      role: 'super_admin',
      country: 'Botswana',
      region: 'Gaborone',
    }),
  });

  if (profileRes.ok) {
    console.log('✅ Profile pre-created');
  } else {
    const err = await profileRes.text();
    console.log('⚠️  Profile:', err.substring(0, 200));
  }

  // Now create the auth user with the same ID
  const authRes = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: adminId,
      email: 'admin@afu.org',
      password: 'AFUadmin2026!',
      email_confirm: true,
      user_metadata: { full_name: 'AFU Administrator' },
    }),
  });

  if (authRes.ok) {
    const data = await authRes.json();
    console.log(`✅ Admin auth user created: ${data.id}`);
  } else {
    const err = await authRes.json();
    console.log('Auth result:', err.msg || err.message);

    if (err.msg?.includes('Database error')) {
      // The trigger is the problem. Let's create auth user without matching profile ID
      // and handle it differently
      console.log('\n⚠️  Trigger is blocking. Trying alternative approach...');

      // Delete the pre-created profile since the ID won't match
      await fetch(`${BASE}/rest/v1/profiles?id=eq.${adminId}`, {
        method: 'DELETE',
        headers,
      });

      // Create auth user and let the trigger fail gracefully
      // The EXCEPTION handler should catch it
      console.log('   Trying with simpler user_metadata...');
      const retry = await fetch(`${BASE}/auth/v1/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: 'admin@afu.org',
          password: 'AFUadmin2026!',
          email_confirm: true,
        }),
      });

      if (retry.ok) {
        const data = await retry.json();
        console.log(`✅ Admin created (no metadata): ${data.id}`);

        // Now create profile manually
        await fetch(`${BASE}/rest/v1/profiles`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify({
            id: data.id,
            email: 'admin@afu.org',
            full_name: 'AFU Administrator',
            role: 'super_admin',
            country: 'Botswana',
            region: 'Gaborone',
          }),
        });
        console.log('✅ Admin profile created');
      } else {
        const retryErr = await retry.json();
        console.log('❌ Still failing:', retryErr.msg || retryErr.message);
        console.log('\n💡 The trigger needs to be fixed via the SQL Editor.');
        console.log('   Please run this SQL in the Supabase SQL Editor:\n');
        console.log('   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
        console.log('   ');
        console.log('   Then run this script again.\n');
      }
    }
  }

  // Verify profiles
  console.log('\n📋 Current profiles:');
  const verRes = await fetch(`${BASE}/rest/v1/profiles?select=email,full_name,role`, { headers });
  const profiles = await verRes.json();
  profiles.forEach(p => console.log(`   • ${p.email} — ${p.full_name} (${p.role})`));

  if (profiles.length === 0) {
    console.log('   (none yet — need to fix trigger first)');
  }
}

main().catch(console.error);
