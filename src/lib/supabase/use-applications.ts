'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';
import type { MembershipTier, ApplicationStatus } from './types';

export interface ApplicationRow {
  id: string;
  profile_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  region: string | null;
  farm_name: string | null;
  farm_size_ha: number | null;
  primary_crops: string[] | null;
  requested_tier: MembershipTier;
  status: ApplicationStatus;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationInsert {
  full_name: string;
  email: string;
  phone?: string;
  country: string;
  region?: string;
  farm_name?: string;
  farm_size_ha?: number;
  primary_crops?: string[];
  requested_tier?: MembershipTier;
}

export function useApplications() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('membership_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setApplications([]);
    } else {
      setApplications((data as ApplicationRow[]) || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const approveApplication = async (id: string, profileId: string) => {
    // Update application status
    const { error: appError } = await supabase
      .from('membership_applications')
      .update({ status: 'approved' as ApplicationStatus, reviewed_at: new Date().toISOString() })
      .eq('id', id);

    if (appError) return { error: appError.message };

    // Get the application to create member record
    const app = applications.find(a => a.id === id);
    if (app) {
      // Create a member record if profile exists
      if (app.profile_id) {
        await supabase.from('members').insert({
          profile_id: app.profile_id,
          tier: app.requested_tier || 'new_enterprise',
          status: 'active',
          farm_name: app.farm_name,
          farm_size_ha: app.farm_size_ha,
          primary_crops: app.primary_crops,
        });
      }
    }

    await fetchApplications();
    return { error: null };
  };

  const rejectApplication = async (id: string, notes?: string) => {
    const { error } = await supabase
      .from('membership_applications')
      .update({
        status: 'rejected' as ApplicationStatus,
        reviewed_at: new Date().toISOString(),
        notes: notes || 'Application rejected',
      })
      .eq('id', id);

    if (!error) await fetchApplications();
    return { error: error?.message || null };
  };

  const submitApplication = async (app: ApplicationInsert) => {
    const { data, error } = await supabase
      .from('membership_applications')
      .insert(app)
      .select()
      .single();

    if (!error) await fetchApplications();
    return { data: data as ApplicationRow | null, error: error?.message || null };
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return { applications, loading, error, stats, fetchApplications, approveApplication, rejectApplication, submitApplication };
}
