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
  // Demographics
  gender?: string;
  date_of_birth?: string;
  id_number?: string;
  marital_status?: string;
  education_level?: string;
  // Farming details
  years_farming?: number;
  number_of_staff?: number;
  household_size?: number;
  land_ownership?: string;
  primary_income_source?: string;
  irrigation_type?: string;
  soil_type?: string;
  farming_method?: string;
  annual_revenue_usd?: number;
  cooperative_name?: string;
  nearest_town?: string;
  gps_coordinates?: string;
  // Financial
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  mobile_money_number?: string;
  mobile_money_provider?: string;
  // Farm Assets
  tractors_owned?: number;
  vehicles_owned?: number;
  storage_capacity_tons?: number;
  water_source?: string;
  has_greenhouse?: string;
  has_cold_storage?: string;
  // Crop Detail
  secondary_crops?: string;
  crop_rotation_plan?: string;
  harvest_season?: string;
  avg_yield_per_ha?: number;
  total_cultivated_ha?: number;
  fallow_land_ha?: number;
  // Livestock
  cattle_count?: number;
  goats_count?: number;
  sheep_count?: number;
  poultry_count?: number;
  pigs_count?: number;
  other_livestock?: string;
  grazing_area_ha?: number;
  // Infrastructure
  road_access?: string;
  electricity_source?: string;
  distance_to_market_km?: number;
  distance_to_road_km?: number;
  has_fencing?: string;
  // Technology
  has_smartphone?: string;
  internet_access?: string;
  uses_mobile_banking?: string;
  preferred_communication?: string;
  // Social
  languages_spoken?: string;
  disability_status?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
  // Compliance
  tax_registration_number?: string;
  vat_number?: string;
  farming_license?: string;
  land_deed_number?: string;
  // Other
  livestock_types?: string;
  challenges?: string;
  notes?: string;
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

        // Update profile with demographics
        await svc.from('profiles').upsert({
          id: userId,
          full_name: farmer.full_name,
          email: farmer.email || email,
          phone: farmer.phone || null,
          country: farmer.country,
          region: farmer.region || null,
          address: farmer.nearest_town || null,
          role: 'farmer',
          gender: farmer.gender || null,
          date_of_birth: farmer.date_of_birth || null,
          id_number: farmer.id_number || null,
          marital_status: farmer.marital_status || null,
          education_level: farmer.education_level || null,
        }, { onConflict: 'id' });

        // Create member record with all farming details
        const tier = farmer.membership_tier || 'smallholder';
        await svc.from('members').upsert({
          profile_id: userId,
          status: 'active',
          tier,
          country: farmer.country,
          farm_size_ha: farmer.farm_size_ha || null,
          primary_crops: farmer.primary_crop ? [farmer.primary_crop] : null,
          livestock_types: farmer.livestock_types ? farmer.livestock_types.split(';').map((s: string) => s.trim()) : null,
          years_farming: farmer.years_farming ? Number(farmer.years_farming) : null,
          number_of_staff: farmer.number_of_staff ? Number(farmer.number_of_staff) : null,
          household_size: farmer.household_size ? Number(farmer.household_size) : null,
          land_ownership: farmer.land_ownership || null,
          primary_income_source: farmer.primary_income_source || null,
          irrigation_type: farmer.irrigation_type || null,
          soil_type: farmer.soil_type || null,
          farming_method: farmer.farming_method || null,
          annual_revenue_usd: farmer.annual_revenue_usd ? Number(farmer.annual_revenue_usd) : null,
          cooperative_name: farmer.cooperative_name || null,
          nearest_town: farmer.nearest_town || null,
          gps_coordinates: farmer.gps_coordinates || null,
          bank_name: farmer.bank_name || null,
          bank_account_name: farmer.bank_account_name || null,
          bank_account_number: farmer.bank_account_number || null,
          mobile_money_number: farmer.mobile_money_number || null,
          mobile_money_provider: farmer.mobile_money_provider || null,
          challenges: farmer.challenges ? farmer.challenges.split(';').map((s: string) => s.trim()) : null,
          notes: farmer.notes || null,
          // Farm Assets
          tractors_owned: farmer.tractors_owned ? Number(farmer.tractors_owned) : null,
          vehicles_owned: farmer.vehicles_owned ? Number(farmer.vehicles_owned) : null,
          storage_capacity_tons: farmer.storage_capacity_tons ? Number(farmer.storage_capacity_tons) : null,
          water_source: farmer.water_source || null,
          has_greenhouse: farmer.has_greenhouse === 'true' || farmer.has_greenhouse === 'yes' || false,
          has_cold_storage: farmer.has_cold_storage === 'true' || farmer.has_cold_storage === 'yes' || false,
          // Crop Detail
          secondary_crops: farmer.secondary_crops ? farmer.secondary_crops.split(';').map((s: string) => s.trim()) : null,
          crop_rotation_plan: farmer.crop_rotation_plan || null,
          harvest_season: farmer.harvest_season || null,
          avg_yield_per_ha: farmer.avg_yield_per_ha ? Number(farmer.avg_yield_per_ha) : null,
          total_cultivated_ha: farmer.total_cultivated_ha ? Number(farmer.total_cultivated_ha) : null,
          fallow_land_ha: farmer.fallow_land_ha ? Number(farmer.fallow_land_ha) : null,
          // Livestock
          cattle_count: farmer.cattle_count ? Number(farmer.cattle_count) : null,
          goats_count: farmer.goats_count ? Number(farmer.goats_count) : null,
          sheep_count: farmer.sheep_count ? Number(farmer.sheep_count) : null,
          poultry_count: farmer.poultry_count ? Number(farmer.poultry_count) : null,
          pigs_count: farmer.pigs_count ? Number(farmer.pigs_count) : null,
          other_livestock: farmer.other_livestock || null,
          grazing_area_ha: farmer.grazing_area_ha ? Number(farmer.grazing_area_ha) : null,
          // Infrastructure
          road_access: farmer.road_access || null,
          electricity_source: farmer.electricity_source || null,
          distance_to_market_km: farmer.distance_to_market_km ? Number(farmer.distance_to_market_km) : null,
          distance_to_road_km: farmer.distance_to_road_km ? Number(farmer.distance_to_road_km) : null,
          has_fencing: farmer.has_fencing === 'true' || farmer.has_fencing === 'yes' || false,
          // Technology
          has_smartphone: farmer.has_smartphone !== 'false' && farmer.has_smartphone !== 'no',
          internet_access: farmer.internet_access || null,
          uses_mobile_banking: farmer.uses_mobile_banking === 'true' || farmer.uses_mobile_banking === 'yes' || false,
          preferred_communication: farmer.preferred_communication || null,
          // Social
          languages_spoken: farmer.languages_spoken ? farmer.languages_spoken.split(';').map((s: string) => s.trim()) : null,
          disability_status: farmer.disability_status || null,
          next_of_kin_name: farmer.next_of_kin_name || null,
          next_of_kin_phone: farmer.next_of_kin_phone || null,
          next_of_kin_relationship: farmer.next_of_kin_relationship || null,
          // Compliance
          tax_registration_number: farmer.tax_registration_number || null,
          vat_number: farmer.vat_number || null,
          farming_license: farmer.farming_license || null,
          land_deed_number: farmer.land_deed_number || null,
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
