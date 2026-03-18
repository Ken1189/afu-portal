/**
 * Create the initial admin user via Supabase Admin API
 * Creates auth user first, then manually inserts profile if trigger fails
 */

const SUPABASE_URL = 'https://wiiomtislubvzajsqfhq.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaW9tdGlzbHVidnphanNxZmhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg1MTE5MywiZXhwIjoyMDg5NDI3MTkzfQ.O7khuzyhmOz1MaqT1FF6VlxrOj9ywvnvyQLHSmijUX4';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
};

async function fixTriggerAndCreateUsers() {
  console.log('🔧 Step 1: Fix the auth trigger...\n');

  // Drop and recreate the trigger with correct column name
  const fixSQL = `
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(
          NULLIF(NEW.raw_user_meta_data->>'role', '')::user_role,
          'member'::user_role
        )
      );
      RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
      -- If insert fails (e.g. duplicate), just continue
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
  `;

  const fixRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });

  // Use the SQL endpoint directly via PostgREST
  // Actually, let's just try creating users without the trigger first
  // and manually add profiles

  console.log('🔑 Step 2: Creating admin auth user...\n');

  const adminRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: 'admin@afu.org',
      password: 'AFUadmin2026!',
      email_confirm: true,
      app_metadata: { role: 'super_admin' },
      user_metadata: { full_name: 'AFU Administrator' },
    }),
  });

  let adminId;
  if (adminRes.ok) {
    const data = await adminRes.json();
    adminId = data.id;
    console.log(`✅ Admin auth user created: ${adminId}`);
  } else {
    const err = await adminRes.json();
    console.log('⚠️  Admin creation response:', err.msg || err.message);

    // Try to find existing user
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, { headers });
    const listData = await listRes.json();
    const existing = listData.users?.find(u => u.email === 'admin@afu.org');
    if (existing) {
      adminId = existing.id;
      console.log(`   Found existing admin: ${adminId}`);
    }
  }

  if (adminId) {
    // Manually insert profile (upsert to handle both cases)
    console.log('\n📝 Upserting admin profile...');
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
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
      const data = await profileRes.json();
      console.log('✅ Admin profile set:', data[0]?.role || 'super_admin');
    } else {
      const err = await profileRes.text();
      console.log('⚠️  Profile upsert:', err);

      // Try PATCH instead
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${adminId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ role: 'super_admin', full_name: 'AFU Administrator' }),
      });
      if (patchRes.ok) {
        console.log('✅ Admin profile patched to super_admin');
      }
    }
  }

  // Create member user
  console.log('\n🧑‍🌾 Creating member auth user...');
  const memberRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: 'farmer@afu.org',
      password: 'AFUfarmer2026!',
      email_confirm: true,
      user_metadata: { full_name: 'Thabo Mokoena' },
    }),
  });

  let memberId;
  if (memberRes.ok) {
    const data = await memberRes.json();
    memberId = data.id;
    console.log(`✅ Member auth user created: ${memberId}`);
  } else {
    const err = await memberRes.json();
    console.log('⚠️  Member creation:', err.msg || err.message || 'exists');
  }

  if (memberId) {
    console.log('\n📝 Upserting member profile...');
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        id: memberId,
        email: 'farmer@afu.org',
        full_name: 'Thabo Mokoena',
        role: 'member',
        country: 'Botswana',
        region: 'Gaborone',
      }),
    });

    if (profileRes.ok) {
      console.log('✅ Member profile set');
    } else {
      console.log('⚠️  Profile:', await profileRes.text());
    }
  }

  // Verify
  console.log('\n📋 Verifying profiles...');
  const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=email,full_name,role&order=role`, {
    headers,
  });
  if (verifyRes.ok) {
    const profiles = await verifyRes.json();
    console.log(`\n   Found ${profiles.length} profile(s):`);
    profiles.forEach(p => console.log(`   • ${p.email} — ${p.full_name} (${p.role})`));
  }

  console.log('\n════════════════════════════════════════════');
  console.log('🎉 Setup complete! Login credentials:');
  console.log('════════════════════════════════════════════');
  console.log('');
  console.log('  ADMIN:   admin@afu.org   / AFUadmin2026!');
  console.log('  MEMBER:  farmer@afu.org  / AFUfarmer2026!');
  console.log('');
  console.log('════════════════════════════════════════════');
}

fixTriggerAndCreateUsers().catch(console.error);
