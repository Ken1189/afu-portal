'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';
import { useAuth } from './auth-context';

export interface FarmerReference {
  id: string;
  farmer_id: string;
  reference_name: string;
  relationship: string;
  relationship_other: string | null;
  phone_number: string;
  location: string | null;
  years_known: number | null;
  statement: string | null;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export const RELATIONSHIP_OPTIONS = [
  { value: 'cooperative_chairman', label: 'Cooperative Chairman/Leader' },
  { value: 'village_headman', label: 'Village Headman/Chief' },
  { value: 'fellow_farmer', label: 'Established Fellow Farmer' },
  { value: 'church_leader', label: 'Church/Religious Leader' },
  { value: 'teacher', label: 'School Teacher/Educator' },
  { value: 'employer', label: 'Current/Former Employer' },
  { value: 'family_elder', label: 'Family Elder (not immediate family)' },
  { value: 'agri_extension', label: 'Agricultural Extension Officer' },
  { value: 'local_business', label: 'Local Business Owner' },
  { value: 'other', label: 'Other' },
];

export function useFarmerReferences() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [references, setReferences] = useState<FarmerReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferences = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('farmer_references')
        .select('*')
        .eq('farmer_id', user.id)
        .order('is_primary', { ascending: false });

      if (fetchError) {
        console.error('[useFarmerReferences] fetch error:', fetchError);
        setError(fetchError.message);
        setReferences([]);
      } else {
        setReferences((data || []) as FarmerReference[]);
      }
    } catch (err) {
      console.error('[useFarmerReferences] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setReferences([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  const addReference = useCallback(async (ref: {
    reference_name: string;
    relationship: string;
    relationship_other?: string;
    phone_number: string;
    location?: string;
    years_known?: number;
    statement?: string;
    is_primary?: boolean;
  }) => {
    if (!user) return { data: null, error: { message: 'Not authenticated' } };

    try {
      const { data, error: insertError } = await supabase
        .from('farmer_references')
        .insert({
          farmer_id: user.id,
          reference_name: ref.reference_name,
          relationship: ref.relationship,
          relationship_other: ref.relationship_other || null,
          phone_number: ref.phone_number,
          location: ref.location || null,
          years_known: ref.years_known || null,
          statement: ref.statement || null,
          is_primary: ref.is_primary ?? true,
          verification_status: 'pending',
        })
        .select()
        .single();

      if (!insertError && data) {
        setReferences(prev => [data as FarmerReference, ...prev]);
      }

      return { data, error: insertError };
    } catch (err) {
      console.error('[useFarmerReferences] addReference exception:', err);
      return { data: null, error: { message: err instanceof Error ? err.message : 'Unknown error' } };
    }
  }, [supabase, user]);

  const updateReference = useCallback(async (id: string, updates: Partial<FarmerReference>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('farmer_references')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!updateError && data) {
        setReferences(prev => prev.map(r => r.id === id ? data as FarmerReference : r));
      }

      return { data, error: updateError };
    } catch (err) {
      console.error('[useFarmerReferences] updateReference exception:', err);
      return { data: null, error: { message: err instanceof Error ? err.message : 'Unknown error' } };
    }
  }, [supabase]);

  const deleteReference = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('farmer_references')
        .delete()
        .eq('id', id);

      if (!deleteError) {
        setReferences(prev => prev.filter(r => r.id !== id));
      }

      return { error: deleteError };
    } catch (err) {
      console.error('[useFarmerReferences] deleteReference exception:', err);
      return { error: { message: err instanceof Error ? err.message : 'Unknown error' } };
    }
  }, [supabase]);

  const primaryRef = references.find(r => r.is_primary);
  const secondaryRef = references.find(r => !r.is_primary);

  return {
    references,
    loading,
    error,
    primaryRef,
    secondaryRef,
    addReference,
    updateReference,
    deleteReference,
    refetch: fetchReferences,
  };
}
