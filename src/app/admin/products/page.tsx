'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Package, Search, Loader2, DollarSign, Eye, EyeOff, Store,
  Tag, BarChart3,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, supplier:suppliers(company_name)')
      .order('created_at', { ascending: false })
      .limit(200);
    setProducts(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  const filtered = products.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name?.toLowerCase().includes(s) || (p.supplier as any)?.company_name?.toLowerCase().includes(s);
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.in_stock).length,
    outOfStock: products.filter(p => !p.in_stock).length,
    totalValue: products.reduce((s: number, p: any) => s + (Number(p.price) * Number(p.stock_quantity || 0)), 0),
    suppliers: new Set(products.map(p => p.supplier_id).filter(Boolean)).size,
  };

  const toggleStock = async (id: string, current: boolean) => {
    await supabase.from('products').update({ in_stock: !current }).eq('id', id);
    fetchProducts();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Product Catalogue</h1>
        <p className="text-sm text-gray-500 mt-1">All products across all suppliers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-600 bg-blue-50' },
          { label: 'In Stock', value: stats.inStock, icon: Eye, color: 'text-green-600 bg-green-50' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: EyeOff, color: 'text-red-600 bg-red-50' },
          { label: 'Inventory Value', value: `$${stats.totalValue.toFixed(0)}`, icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
          { label: 'Suppliers', value: stats.suppliers, icon: Store, color: 'text-amber-600 bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}><s.icon className="w-4 h-4" /></div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-[#1B2A4A]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product name or supplier..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm bg-white">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><Package className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No products found</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Product</th>
                <th className="hidden sm:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Supplier</th>
                <th className="hidden md:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Category</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="hidden sm:table-cell text-right py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Stock</th>
                <th className="text-center py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-[#1B2A4A] truncate max-w-[200px]">{p.name}</p>
                  </td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-gray-600">{(p.supplier as any)?.company_name || '—'}</td>
                  <td className="hidden md:table-cell py-2.5 px-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{p.category || '—'}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium tabular-nums">${Number(p.price || 0).toFixed(2)}</td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-right tabular-nums text-gray-600">{p.stock_quantity || 0} {p.unit || ''}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {p.in_stock ? 'In Stock' : 'Out'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button onClick={() => toggleStock(p.id, p.in_stock)} className="p-1.5 rounded-lg hover:bg-gray-100" title={p.in_stock ? 'Mark out of stock' : 'Mark in stock'}>
                      {p.in_stock ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-green-500" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
