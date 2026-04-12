'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';
import { captureError } from '@/lib/capture-error';

export type KycTier = 'tier_1' | 'tier_2' | 'tier_3';
export type KycStatus = 'pending' | 'verified' | 'rejected' | 'expired';
export type DocumentType = 'national_id' | 'passport' | 'drivers_license' | 'proof_of_address' | 'bank_statement' | 'farm_registration' | 'selfie' | 'source_of_funds';

export interface KycDocumentRow {
  id: string;
  member_id: string;
  document_type: DocumentType;
  document_number: string | null;
  file_url: string;
  verification_status: KycStatus;
  verified_by: string | null;
  verified_at: string | null;
  expires_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface KycVerificationRow {
  id: string;
  member_id: string;
  tier: KycTier;
  provider: string;
  provider_reference: string | null;
  status: KycStatus;
  risk_score: number | null;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreditScoreRow {
  id: string;
  member_id: string;
  score: number;
  tier: string;
  payment_history_score: number | null;
  loan_repayment_score: number | null;
  farm_productivity_score: number | null;
  membership_tenure_score: number | null;
  training_completion_score: number | null;
  cooperative_membership_score: number | null;
  collateral_score: number | null;
  max_loan_amount: number | null;
  calculated_at: string;
  updated_at: string;
}

export function useKyc() {
  const supabase = useMemo(() => createClient(), []);
  const [documents, setDocuments] = useState<KycDocumentRow[]>([]);
  const [verification, setVerification] = useState<KycVerificationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKyc = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, verRes] = await Promise.all([
        supabase.from('kyc_documents').select('*').order('created_at', { ascending: false }),
        supabase.from('kyc_verifications').select('*').order('created_at', { ascending: false }).limit(1),
      ]);

      if (docsRes.error) {
        console.error('[useKyc] docs fetch error:', docsRes.error);
        setError(docsRes.error.message);
        setDocuments([]);
      } else {
        setDocuments((docsRes.data || []) as KycDocumentRow[]);
      }

      if (verRes.error) {
        console.error('[useKyc] verification fetch error:', verRes.error);
      } else if (verRes.data && verRes.data.length > 0) {
        setVerification(verRes.data[0] as KycVerificationRow);
      }
    } catch (err) {
      captureError('useKyc.fetch', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchKyc(); }, [fetchKyc]);

  const uploadDocument = async (doc: {
    document_type: DocumentType;
    document_number?: string;
    file_url: string;
    expires_at?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .insert(doc)
        .select()
        .single();

      if (!error && data) {
        setDocuments((prev) => [data as KycDocumentRow, ...prev]);
      }
      return { data, error };
    } catch (err) {
      captureError('useKyc.uploadDocument', err);
      return { data: null, error: err instanceof Error ? { message: err.message } : { message: 'Unknown error' } };
    }
  };

  const currentTier: KycTier | null = verification?.status === 'verified' ? verification.tier : null;

  return { documents, verification, currentTier, loading, error, uploadDocument, refetch: fetchKyc };
}

export function useCreditScore() {
  const supabase = useMemo(() => createClient(), []);
  const [creditScore, setCreditScore] = useState<CreditScoreRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('credit_scores')
        .select('*')
        .limit(1)
        .single();

      if (fetchError) {
        // single() throws PGRST116 when 0 rows; not necessarily an error for this hook
        if (fetchError.code !== 'PGRST116') {
          console.error('[useCreditScore] fetch error:', fetchError);
          setError(fetchError.message);
        }
        setCreditScore(null);
      } else if (data) {
        setCreditScore(data as CreditScoreRow);
      }
    } catch (err) {
      captureError('useCreditScore.fetch', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCreditScore(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchScore(); }, [fetchScore]);

  return { creditScore, loading, error, refetch: fetchScore };
}
