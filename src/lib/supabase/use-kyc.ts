'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

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
  const [documents, setDocuments] = useState<KycDocumentRow[]>([]);
  const [verification, setVerification] = useState<KycVerificationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchKyc = useCallback(async () => {
    setLoading(true);

    const [docsRes, verRes] = await Promise.all([
      supabase.from('kyc_documents').select('*').order('created_at', { ascending: false }),
      supabase.from('kyc_verifications').select('*').order('created_at', { ascending: false }).limit(1),
    ]);

    if (docsRes.error) {
      setError(docsRes.error.message);
    } else {
      setDocuments((docsRes.data as KycDocumentRow[]) || []);
    }

    if (verRes.data && verRes.data.length > 0) {
      setVerification(verRes.data[0] as KycVerificationRow);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchKyc(); }, [fetchKyc]);

  const uploadDocument = async (doc: {
    document_type: DocumentType;
    document_number?: string;
    file_url: string;
    expires_at?: string;
  }) => {
    const { data, error } = await supabase
      .from('kyc_documents')
      .insert(doc)
      .select()
      .single();

    if (!error && data) {
      setDocuments((prev) => [data as KycDocumentRow, ...prev]);
    }
    return { data, error };
  };

  const currentTier: KycTier | null = verification?.status === 'verified' ? verification.tier : null;

  return { documents, verification, currentTier, loading, error, uploadDocument, refetch: fetchKyc };
}

export function useCreditScore() {
  const [creditScore, setCreditScore] = useState<CreditScoreRow | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchScore = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('credit_scores')
      .select('*')
      .limit(1)
      .single();

    if (data) setCreditScore(data as CreditScoreRow);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchScore(); }, [fetchScore]);

  return { creditScore, loading, refetch: fetchScore };
}
