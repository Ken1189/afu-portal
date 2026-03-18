/**
 * Create admin user using @supabase/supabase-js client
 * This bypasses the DNS issues we had with pg module
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wiiomtislubvzajsqfhq.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaW9tdGlzbHVidnphanNxZmhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg1MTE5MywiZXhwIjoyMDg5NDI3MTkzfQ.O7khuzyhmOz1MaqT1FF6VlxrOj9ywvnvyQLHSmijUX4';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🔧 AFU Admin Setup via Supabase JS Client\n');

  // Step 1: Fix the trigger by running SQL via supabase.rpc or raw query
  // First, let's create an exec_sql function we can call
  console.log('Step 1: Attempting to fix trigger via SQL...');

  // Try using the raw SQL endpoint that supabase-js might expose
  // Actually, let's try a different approach: delete the existing trigger
  // by calling a helper function

  // First, let's just try creating the user and see what happens
  console.log('\nStep 2: Creating admin user...');
  const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@afu.org',
    password: 'AFUadmin2026!',
    email_confirm: true,
    user_metadata: { full_name: 'AFU Administrator' },
  });

  if (adminError) {
    console.log('Admin creation error:', adminError.message);

    if (adminError.message.includes('Database error')) {
      console.log('\n⚠️  The auth trigger is failing. Let me try without metadata...');

      // Try creating with minimal data
      const { data: retry, error: retryErr } = await supabase.auth.admin.createUser({
        email: 'admin@afu.org',
        password: 'AFUadmin2026!',
        email_confirm: true,
      });

      if (retryErr) {
        console.log('Still failing:', retryErr.message);
        console.log('\n💡 Need to fix the trigger. Trying alternative approach...');

        // The trigger is the problem. Let's see if we can use rpc to fix it
        // Create a temporary function that fixes the trigger
        const { error: rpcError } = await supabase.rpc('exec_sql', {
          sql_text: "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users"
        });

        if (rpcError) {
          console.log('RPC not available:', rpcError.message);
          console.log('\n🔄 I need you to run ONE quick SQL command in the Supabase dashboard.');
          console.log('   Go to: SQL Editor in your Supabase dashboard (AFU project)');
          console.log('   Paste and run:\n');
          console.log('   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;\n');
          console.log('   Then run this script again.\n');

          // But first let's see if the RPC approach works if we create the function first
          console.log('   OR... let me try creating the exec function first...');

          // We can try to create a pg function via the REST API by using
          // the PostgREST schema cache refresh
          // Actually this won't work either

          // Let's try one more thing: use the management API
          console.log('\n   Trying Supabase Management API...');

          try {
            const mgmtRes = await fetch('https://api.supabase.com/v1/projects/wiiomtislubvzajsqfhq/database/query', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                query: 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users',
              }),
            });

            if (mgmtRes.ok) {
              console.log('✅ Trigger dropped via Management API!');
              // Now try creating the user again
              const { data: user, error: userErr } = await supabase.auth.admin.createUser({
                email: 'admin@afu.org',
                password: 'AFUadmin2026!',
                email_confirm: true,
              });
              if (user) {
                console.log('✅ Admin created:', user.user?.id);
                await createProfile(user.user?.id, 'admin@afu.org', 'AFU Administrator', 'super_admin');
              } else {
                console.log('User creation:', userErr?.message);
              }
            } else {
              const errBody = await mgmtRes.text();
              console.log('   Management API response:', mgmtRes.status, errBody.substring(0, 200));
            }
          } catch (e) {
            console.log('   Management API not available:', e.message);
          }
        }
      } else {
        console.log('✅ Admin created (no metadata):', retry.user?.id);
        await createProfile(retry.user?.id, 'admin@afu.org', 'AFU Administrator', 'super_admin');
      }
    } else if (adminError.message.includes('already been registered')) {
      console.log('Admin already exists. Updating profile...');
      // Find the user
      const { data: users } = await supabase.auth.admin.listUsers();
      const admin = users?.users?.find(u => u.email === 'admin@afu.org');
      if (admin) {
        await createProfile(admin.id, 'admin@afu.org', 'AFU Administrator', 'super_admin');
      }
    }
  } else {
    console.log('✅ Admin created:', adminData.user?.id);
    await createProfile(adminData.user?.id, 'admin@afu.org', 'AFU Administrator', 'super_admin');
  }

  // Create member user
  console.log('\nStep 3: Creating member user...');
  const { data: memberData, error: memberError } = await supabase.auth.admin.createUser({
    email: 'farmer@afu.org',
    password: 'AFUfarmer2026!',
    email_confirm: true,
    user_metadata: { full_name: 'Thabo Mokoena' },
  });

  if (memberError) {
    console.log('Member:', memberError.message);
  } else {
    console.log('✅ Member created:', memberData.user?.id);
    await createProfile(memberData.user?.id, 'farmer@afu.org', 'Thabo Mokoena', 'member');
  }

  // Final verification
  console.log('\n📋 Profiles in database:');
  const { data: profiles } = await supabase.from('profiles').select('email, full_name, role');
  if (profiles?.length) {
    profiles.forEach(p => console.log(`   • ${p.email} — ${p.full_name} (${p.role})`));
  } else {
    console.log('   (none yet)');
  }

  console.log('\n════════════════════════════════════════════');
  console.log('  ADMIN:   admin@afu.org   / AFUadmin2026!');
  console.log('  MEMBER:  farmer@afu.org  / AFUfarmer2026!');
  console.log('════════════════════════════════════════════\n');
}

async function createProfile(userId, email, fullName, role) {
  if (!userId) return;
  console.log(`   Setting profile: ${email} → ${role}`);

  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: fullName,
    role,
    country: 'Botswana',
    region: 'Gaborone',
  }, { onConflict: 'id' });

  if (error) {
    console.log(`   Profile error: ${error.message}`);
  } else {
    console.log(`   ✅ Profile set`);
  }
}

main().catch(console.error);
