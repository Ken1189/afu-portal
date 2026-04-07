'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';

export interface ExportDocumentRow {
  id: string;
  member_id: string;
  document_type: string;
  file_url: string | null;
  status: string;
  country_of_origin: string | null;
  destination_country: string | null;
  commodity: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useExportDocuments(memberId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [documents, setDocuments] = useState<ExportDocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('export_documents').select('*').order('created_at', { ascending: false });
      if (memberId) query = query.eq('member_id', memberId);
      const { data, error: fetchError } = await query;
      if (fetchError) {
        console.error('[useExportDocuments] fetch error:', fetchError);
        setError(fetchError.message);
        setDocuments([]);
      } else {
        setDocuments((data || []) as ExportDocumentRow[]);
      }
    } catch (err) {
      console.error('[useExportDocuments] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const createDocument = async (doc: Omit<ExportDocumentRow, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const { data, error: insertError } = await supabase.from('export_documents').insert(doc).select().single();
      if (insertError) return { data: null, error: insertError.message };
      await fetchDocuments();
      return { data, error: null };
    } catch (err) {
      console.error('[useExportDocuments] createDocument exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateDocument = async (id: string, updates: Partial<ExportDocumentRow>) => {
    try {
      const { error: updateError } = await supabase.from('export_documents').update(updates).eq('id', id);
      if (updateError) return { error: updateError.message };
      await fetchDocuments();
      return { error: null };
    } catch (err) {
      console.error('[useExportDocuments] updateDocument exception:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { documents, loading, error, fetchDocuments, refetch: fetchDocuments, createDocument, updateDocument };
}
