import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

interface FarmerRow {
  full_name: string;
  email?: string;
  phone?: string;
  country: string;
  region?: string;
  farm_size_ha?: number;
  primary_crop?: string;
  membership_tier?: string;
  gender?: string;
  date_of_birth?: string;
  years_farming?: number;
  id_number?: string;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; name: string; error: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    // Verify auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use service role for writes
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify admin role
    const { data: profile } = await svc
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { farmers } = body as { farmers: FarmerRow[] };

    if (!farmers || !Array.isArray(farmers) || farmers.length === 0) {
      return NextResponse.json({ error: 'No farmer data provided' }, { status: 400 });
    }

    if (farmers.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 farmers per import' }, { status: 400 });
    }

    const result: ImportResult = {
      total: farmers.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    // Process each farmer
    for (let i = 0; i < farmers.length; i++) {
      const farmer = farmers[i];

      if (!farmer.full_name || !farmer.country) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          name: farmer.full_name || 'Unknown',
          error: 'Missing required fields: full_name and country',
        });
        continue;
      }

      try {
        // Generate a placeholder email if none provided
        const email = farmer.email || `farmer_${Date.now()}_${i}@afu-import.placeholder`;

        // Create auth user via admin API (if real email provided)
        let userId: string;

        if (farmer.email) {
          // Try to create a real auth user
          const { data: authUser, error: authError } = await svc.auth.admin.createUser({
            email: farmer.email,
            email_confirm: true,
            user_metadata: {
              full_name: farmer.full_name,
              imported: true,
              import_date: new Date().toISOString(),
            },
          });

          if (authError) {
            // User might already exist — try to find them
            const { data: existingUsers } = await svc.auth.admin.listUsers();
            const existing = existingUsers?.users?.find(u => u.email === farmer.email);
            if (existing) {
              userId = existing.id;
            } else {
              result.failed++;
              result.errors.push({ row: i + 1, name: farmer.full_name, error: authError.message });
              continue;
            }
          } else {
            userId = authUser.user.id;
          }
        } else {
          // No email — create auth user with placeholder
          const { data: authUser, error: authError } = await svc.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              full_name: farmer.full_name,
              imported: true,
              placeholder_email: true,
            },
          });

          if (authError) {
            result.failed++;
            result.errors.push({ row: i + 1, name: farmer.full_name, error: authError.message });
            continue;
          }
          userId = authUser.user.id;
        }

        // Update profile (auto-created by trigger or insert)
        await svc.from('profiles').upsert({
          id: userId,
          full_name: farmer.full_name,
          email: farmer.email || email,
          phone: farmer.phone || null,
          country: farmer.country,
          role: 'farmer',
        }, { onConflict: 'id' });

        // Create member record
        const tier = farmer.membership_tier || 'smallholder';
        await svc.from('members').upsert({
          profile_id: userId,
          status: 'active',
          tier,
          country: farmer.country,
        }, { onConflict: 'profile_id' });

        // Create farmer tier record (starts at seedling)
        await svc.from('farmer_tiers').upsert({
          user_id: userId,
          current_tier: 'seedling',
          xp: 0,
          courses_completed: 0,
        }, { onConflict: 'user_id' });

        // Create farm plot if farm data provided
        if (farmer.farm_size_ha || farmer.primary_crop || farmer.region) {
          await svc.from('farm_plots').insert({
            user_id: userId,
            name: `${farmer.full_name}'s Farm`,
            location: farmer.region || farmer.country,
            size_hectares: farmer.farm_size_ha || null,
            crop_type: farmer.primary_crop || null,
            status: 'active',
          });
        }

        result.success++;
      } catch (err) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          name: farmer.full_name,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Log the import to audit
    await svc.from('audit_log').insert({
      user_id: user.id,
      action: 'bulk_farmer_import',
      entity_type: 'import',
      entity_id: `import_${Date.now()}`,
      details: {
        total: result.total,
        success: result.success,
        failed: result.failed,
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
