/**
 * Veterinary Services API
 * GET  — Get user's appointments or admin view all
 * POST — Book new appointment
 * PATCH — Update appointment status, add diagnosis/treatment (admin/vet)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';

async function getAuthUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await createAdminClient();
    const role = user.user_metadata?.role;
    const isAdmin = role === 'admin' || role === 'super_admin';

    const appointmentId = req.nextUrl.searchParams.get('id');
    const status = req.nextUrl.searchParams.get('status');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    if (appointmentId) {
      const { data, error } = await db.from('vet_appointments').select('*').eq('id', appointmentId).single();
      if (error) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      if (!isAdmin && data.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.json(data);
    }

    let query = db.from('vet_appointments').select('*', { count: 'exact' })
      .order('scheduled_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!isAdmin) query = query.eq('user_id', user.id);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Also get clinics for reference
    const { data: clinics } = await db.from('vet_clinics').select('*').eq('is_active', true);

    return NextResponse.json({ appointments: data || [], total: count || 0, clinics: clinics || [] });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { service_type, animal_type, animal_count, description, scheduled_date, country_code, region, farm_location, priority } = body;

    if (!service_type || !animal_type || !description) {
      return NextResponse.json({ error: 'service_type, animal_type, and description required' }, { status: 400 });
    }

    const db = await createAdminClient();

    // Generate appointment number
    const appointmentNumber = 'VET-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') +
      '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    const { data, error } = await db.from('vet_appointments').insert({
      user_id: user.id,
      appointment_number: appointmentNumber,
      service_type,
      animal_type,
      animal_count: animal_count || 1,
      description,
      scheduled_date: scheduled_date || null,
      country_code: country_code || null,
      region: region || null,
      farm_location: farm_location || null,
      priority: priority || 'normal',
      status: 'scheduled',
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Appointment id required' }, { status: 400 });

    const db = await createAdminClient();

    // If completing, set completed_date
    if (updates.status === 'completed') {
      updates.completed_date = new Date().toISOString();
    }

    const { data, error } = await db.from('vet_appointments').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
