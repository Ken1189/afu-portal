'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [documents, setDocuments] = useState<ExportDocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('export_documents').select('*').order('created_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setDocuments([]); }
    else { setDocuments((data as ExportDocumentRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const createDocument = async (doc: Omit<ExportDocumentRow, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    const { error } = await supabase.from('export_documents').insert(doc);
    if (!error) await fetchDocuments();
    return { error: error?.message || null };
  };

  const updateDocument = async (id: string, updates: Partial<ExportDocumentRow>) => {
    const { error } = await supabase.from('export_documents').update(updates).eq('id', id);
    if (!error) await fetchDocuments();
    return { error: error?.message || null };
  };

  return { documents, loading, error, fetchDocuments, createDocument, updateDocument };
}
