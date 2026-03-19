import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/onboarding/complete
 * Saves onboarding wizard data for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    const {
      role,
      country,
      fullName,
      phone,
      farmName,
      farmSize,
      primaryCrops,
      hasLivestock,
      companyName,
      productCategories,
      organizationName,
      partnershipType,
      preferredLanguage,
      notifications,
      currency,
    } = body;

    const adminClient = await createAdminClient();

    // Update the user's profile with onboarding data
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        country,
        role,
        preferred_language: preferredLanguage,
        notification_preferences: notifications,
        currency,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        // Role-specific fields stored as metadata
        onboarding_metadata: {
          ...(role === 'farmer' && {
            farm_name: farmName,
            farm_size_ha: farmSize,
            primary_crops: primaryCrops,
            has_livestock: hasLivestock,
          }),
          ...(role === 'supplier' && {
            company_name: companyName,
            product_categories: productCategories,
          }),
          ...(role === 'partner' && {
            organization_name: organizationName,
            partnership_type: partnershipType,
          }),
        },
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Onboarding profile update error:', profileError);
      return NextResponse.json(
        { error: 'Failed to save onboarding data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      role,
    });
  } catch (err) {
    console.error('Onboarding complete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
