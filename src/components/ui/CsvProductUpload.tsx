'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, X, Download } from 'lucide-react';

interface CsvProductUploadProps {
  onComplete?: () => void;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    return row;
  });
}

const SAMPLE_CSV = `name,description,category,price,member_price,currency,unit,sku,in_stock,stock_quantity,tags
Hybrid Maize Seed 25kg,High-yield drought-resistant variety,input-supplier,45.00,39.50,USD,per bag,HMS-025,true,500,"maize,seeds,hybrid"
NPK Fertilizer 50kg,Balanced 15-15-15 NPK blend,input-supplier,32.00,28.00,USD,per bag,NPK-050,true,1200,"fertilizer,npk"
Drip Irrigation Kit,1 hectare complete setup,equipment,280.00,245.00,USD,per kit,DRK-001,true,45,"irrigation,drip,equipment"`;

export default function CsvProductUpload({ onComplete }: CsvProductUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [result, setResult] = useState<{ success: boolean; inserted?: number; errors?: string[]; error?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setPreview(rows);
      setResult(null);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) handleFile(file);
  }, [handleFile]);

  const handleUpload = async () => {
    if (preview.length === 0) return;
    setUploading(true);
    setResult(null);
    try {
      const res = await fetch('/api/supplier/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: preview }),
      });
      const data = await res.json();
      setResult(data.success ? data : { success: false, error: data.error, errors: data.errors });
      if (data.success) {
        onComplete?.();
        setTimeout(() => {
          setOpen(false);
          setPreview([]);
          setResult(null);
        }, 2000);
      }
    } catch {
      setResult({ success: false, error: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'afu-products-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
      >
        <Upload className="w-4 h-4" /> CSV Upload
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal" />
            <h3 className="font-semibold text-navy">Bulk Product Upload</h3>
          </div>
          <button onClick={() => { setOpen(false); setPreview([]); setResult(null); }} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Download template */}
          <button
            onClick={downloadSample}
            className="flex items-center gap-2 text-sm text-teal hover:underline"
          >
            <Download className="w-4 h-4" /> Download CSV template
          </button>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-teal/50 transition cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Drop a CSV file here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">Required columns: name, price. Optional: description, category, member_price, currency, unit, sku, in_stock, stock_quantity, tags</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-sm font-medium text-navy mb-2">{preview.length} products found</p>
              <div className="max-h-48 overflow-auto border border-gray-100 rounded-xl">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 text-left text-gray-500">#</th>
                      <th className="py-2 px-3 text-left text-gray-500">Name</th>
                      <th className="py-2 px-3 text-left text-gray-500">Category</th>
                      <th className="py-2 px-3 text-right text-gray-500">Price</th>
                      <th className="py-2 px-3 text-left text-gray-500">SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="py-1.5 px-3 text-gray-400">{i + 1}</td>
                        <td className="py-1.5 px-3 font-medium text-navy">{row.name}</td>
                        <td className="py-1.5 px-3 text-gray-500">{row.category || '-'}</td>
                        <td className="py-1.5 px-3 text-right">${row.price || '0'}</td>
                        <td className="py-1.5 px-3 text-gray-400">{row.sku || '-'}</td>
                      </tr>
                    ))}
                    {preview.length > 20 && (
                      <tr><td colSpan={5} className="py-2 px-3 text-center text-gray-400">...and {preview.length - 20} more</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
              result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
              <div>
                {result.success
                  ? `Successfully imported ${result.inserted} products`
                  : result.error || 'Upload failed'}
                {result.errors && result.errors.length > 0 && (
                  <ul className="mt-1 text-xs space-y-0.5">
                    {result.errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                    {result.errors.length > 5 && <li>...and {result.errors.length - 5} more errors</li>}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => { setOpen(false); setPreview([]); setResult(null); }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={preview.length === 0 || uploading}
            className="flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal/90 transition disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload {preview.length} Products
          </button>
        </div>
      </div>
    </div>
  );
}
