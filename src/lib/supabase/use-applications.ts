'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  application_type?: 'member' | 'farmer' | 'supplier' | 'ambassador' | 'partner';
  referral_code?: string;
  notes?: string;
}

export function useApplications(page = 1, pageSize = 50) {
  const supabase = useMemo(() => createClient(), []);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, count, error: fetchError } = await supabase
        .from('membership_applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (fetchError) {
        console.error('[useApplications] fetch error:', fetchError);
        setError(fetchError.message);
        setApplications([]);
        setTotalCount(0);
      } else {
        setApplications((data || []) as ApplicationRow[]);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      console.error('[useApplications] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setApplications([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [supabase, page, pageSize]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const approveApplication = async (id: string, profileId: string) => {
    try {
      const { error: appError } = await supabase
        .from('membership_applications')
        .update({ status: 'approved' as ApplicationStatus, reviewed_at: new Date().toISOString() })
        .eq('id', id);

      if (appError) return { error: appError.message };

      const app = applications.find(a => a.id === id);
      if (app && app.profile_id) {
        await supabase.from('members').insert({
          profile_id: app.profile_id,
          tier: app.requested_tier || 'new_enterprise',
          status: 'active',
          farm_name: app.farm_name,
          farm_size_ha: app.farm_size_ha,
          primary_crops: app.primary_crops,
        });
      }

      await fetchApplications();
      return { error: null };
    } catch (err) {
      console.error('[useApplications] approveApplication exception:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const rejectApplication = async (id: string, notes?: string) => {
    try {
      const { error: rejectError } = await supabase
        .from('membership_applications')
        .update({
          status: 'rejected' as ApplicationStatus,
          reviewed_at: new Date().toISOString(),
          notes: notes || 'Application rejected',
        })
        .eq('id', id);

      if (rejectError) return { error: rejectError.message };
      await fetchApplications();
      return { error: null };
    } catch (err) {
      console.error('[useApplications] rejectApplication exception:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const submitApplication = async (app: ApplicationInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('membership_applications')
        .insert(app)
        .select()
        .single();

      if (insertError) return { data: null, error: insertError.message };

      // Auto-approve free tier applications instantly
      if (data && app.requested_tier === 'free') {
        try {
          await fetch('/api/applications/auto-approve-free', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: data.id }),
          });
        } catch {
          // Silent — admin can approve manually if auto-approve fails
        }
      }

      await fetchApplications();
      return { data: data as ApplicationRow | null, error: null };
    } catch (err) {
      console.error('[useApplications] submitApplication exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const stats = {
    total: totalCount,
    pending: applications.filter(a => a.status === 'pending').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return { applications, loading, error, stats, totalCount, fetchApplications, refetch: fetchApplications, approveApplication, rejectApplication, submitApplication };
}
