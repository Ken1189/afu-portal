'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';
import type { SupplierCategory } from './types';

export interface ProductRow {
  id: string;
  supplier_id: string;
  name: string;
  description: string | null;
  category: SupplierCategory;
  price: number;
  member_price: number | null;
  discount_percent: number;
  currency: string;
  unit: string;
  sku: string | null;
  image_url: string | null;
  images: string[] | null;
  in_stock: boolean;
  stock_quantity: number;
  sold_count: number;
  rating: number;
  review_count: number;
  featured: boolean;
  tags: string[] | null;
  specifications: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Joined supplier
  supplier?: {
    company_name: string;
    logo_url: string | null;
    country: string;
    verified: boolean;
  };
}

export interface ProductInsert {
  supplier_id: string;
  name: string;
  description?: string;
  category: SupplierCategory;
  price: number;
  member_price?: number;
  discount_percent?: number;
  unit?: string;
  image_url?: string;
  in_stock?: boolean;
  stock_quantity?: number;
  featured?: boolean;
  tags?: string[];
}

export function useProducts(supplierId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('products')
        .select('*, supplier:suppliers(company_name, logo_url, country, verified)')
        .order('created_at', { ascending: false });

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useProducts] fetch error:', fetchError);
        setError(fetchError.message);
        setProducts([]);
      } else {
        setProducts((data || []) as ProductRow[]);
      }
    } catch (err) {
      console.error('[useProducts] exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, supplierId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = async (product: ProductInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (insertError) return { data: null, error: insertError.message };

      await fetchProducts();
      try {
        await supabase.rpc('increment_supplier_products', {
          p_supplier_id: product.supplier_id,
          p_delta: 1,
        });
      } catch { /* non-critical */ }
      return { data: data as ProductRow, error: null };
    } catch (err) {
      console.error('[useProducts] addProduct exception:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateProduct = async (id: string, updates: Partial<ProductRow>) => {
    try {
      const { error: updateError } = await supabase.from('products').update(updates).eq('id', id);
      if (updateError) return { error: updateError.message };
      await fetchProducts();
      return { error: null };
    } catch (err) {
      console.error('[useProducts] updateProduct exception:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const toggleStock = async (id: string, inStock: boolean) => {
    return updateProduct(id, { in_stock: inStock });
  };

  return { products, loading, error, fetchProducts, refetch: fetchProducts, addProduct, updateProduct, toggleStock };
}
