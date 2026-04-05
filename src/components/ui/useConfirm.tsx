'use client';

import { useState, useCallback } from 'react';
import ConfirmModal from './ConfirmModal';

/**
 * Hook for confirmation dialogs. Returns [ConfirmDialog, confirm].
 * 
 * Usage:
 *   const [ConfirmDialog, confirm] = useConfirm();
 *   
 *   const handleDelete = async (id: string) => {
 *     const ok = await confirm('Delete this item?', 'This action cannot be undone.');
 *     if (ok) { await supabase.from('table').delete().eq('id', id); }
 *   };
 *   
 *   return <>{ConfirmDialog}<button onClick={() => handleDelete(id)}>Delete</button></>;
 */
export function useConfirm(): [React.ReactNode, (title: string, message: string) => Promise<boolean>] {
  const [state, setState] = useState<{ title: string; message: string; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ title, message, resolve });
    });
  }, []);

  const handleConfirm = () => { state?.resolve(true); setState(null); };
  const handleCancel = () => { state?.resolve(false); setState(null); };

  const dialog = (
    <ConfirmModal
      open={!!state}
      title={state?.title || ''}
      message={state?.message || ''}
      confirmLabel="Delete"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return [dialog, confirm];
}
