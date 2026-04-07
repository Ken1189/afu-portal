'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export function useAuditLog(limit = 100) {
  const supabase = useMemo(() => createClient(), []);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (fetchError) {
        console.error('[useAuditLog] fetch error:', fetchError);
        setError(fetchError.message);
        setLogs([]);
      } else {
        setLogs((data || []) as AuditLogRow[]);
      }
    } catch (err) {
      console.error('[useAuditLog] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, limit]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return { logs, loading, error, fetchLogs, refetch: fetchLogs };
}
