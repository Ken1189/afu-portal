'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, supplier:suppliers(company_name, logo_url, country, verified)')
      .order('created_at', { ascending: false });

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setProducts([]);
    } else {
      setProducts((data as ProductRow[]) || []);
    }
    setLoading(false);
  }, [supabase, supplierId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = async (product: ProductInsert) => {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (!error) {
      await fetchProducts();
      // Update supplier product count
      try {
        await supabase.from('suppliers').update({
          products_count: (await supabase.from('products').select('id', { count: 'exact', head: true }).eq('supplier_id', product.supplier_id)).count || 0
        }).eq('id', product.supplier_id);
      } catch { /* non-critical */ }
    }
    return { data: data as ProductRow | null, error: error?.message || null };
  };

  const updateProduct = async (id: string, updates: Partial<ProductRow>) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (!error) await fetchProducts();
    return { error: error?.message || null };
  };

  const toggleStock = async (id: string, inStock: boolean) => {
    return updateProduct(id, { in_stock: inStock });
  };

  return { products, loading, error, fetchProducts, addProduct, updateProduct, toggleStock };
}
