'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';
import type { SupplierCategory, SupplierStatus, SponsorshipTier } from './types';

// ── Types ─────────────────────────────────────────────────────────────────

export interface SupplierRow {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  category: SupplierCategory;
  status: SupplierStatus;
  country: string;
  region: string | null;
  description: string | null;
  verified: boolean;
  is_founding: boolean;
  sponsorship_tier: SponsorshipTier | null;
  commission_rate: number;
  member_discount_percent: number;
  rating: number;
  review_count: number;
  products_count: number;
  total_sales: number;
  total_orders: number;
  certifications: string[];
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierInsert {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  category: SupplierCategory;
  country: string;
  region?: string;
  description?: string;
  commission_rate?: number;
  member_discount_percent?: number;
}

// ── Hook: useSuppliers ────────────────────────────────────────────────────

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
      .order('company_name');

    if (fetchError) {
      setError(fetchError.message);
      // Fall back to empty array
      setSuppliers([]);
    } else {
      setSuppliers((data as SupplierRow[]) || []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // ── CRUD Operations ────────────────────────────────────────────────────

  const addSupplier = async (supplier: SupplierInsert) => {
    const { data, error: insertError } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();

    if (insertError) {
      return { data: null, error: insertError.message };
    }

    // Refresh list
    await fetchSuppliers();
    return { data: data as SupplierRow, error: null };
  };

  const updateSupplier = async (id: string, updates: Partial<SupplierRow>) => {
    const { error: updateError } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      return { error: updateError.message };
    }

    await fetchSuppliers();
    return { error: null };
  };

  const approveSupplier = async (id: string) => {
    return updateSupplier(id, { status: 'active' as SupplierStatus, verified: true });
  };

  const suspendSupplier = async (id: string) => {
    return updateSupplier(id, { status: 'suspended' as SupplierStatus });
  };

  const activateSupplier = async (id: string) => {
    return updateSupplier(id, { status: 'active' as SupplierStatus });
  };

  // ── Summary stats ──────────────────────────────────────────────────────

  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.status === 'active').length,
    pending: suppliers.filter((s) => s.status === 'pending').length,
    suspended: suppliers.filter((s) => s.status === 'suspended').length,
  };

  return {
    suppliers,
    loading,
    error,
    stats,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    approveSupplier,
    suspendSupplier,
    activateSupplier,
  };
}
