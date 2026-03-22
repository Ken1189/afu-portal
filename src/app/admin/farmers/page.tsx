'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle,
  ChevronLeft, Download, Loader2, Users, Table2, Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface FarmerRow {
  full_name: string;
  email?: string;
  phone?: string;
  country: string;
  region?: string;
  farm_size_ha?: number;
  primary_crop?: string;
  membership_tier?: string;
  gender?: string;
  years_farming?: number;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; name: string; error: string }[];
}

/* ------------------------------------------------------------------ */
/* CSV Parser                                                           */
/* ------------------------------------------------------------------ */

function parseCSV(text: string): FarmerRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/['"]/g, ''));

  // Map common header variations
  const headerMap: Record<string, string> = {
    name: 'full_name',
    farmer_name: 'full_name',
    'full name': 'full_name',
    fullname: 'full_name',
    email_address: 'email',
    telephone: 'phone',
    phone_number: 'phone',
    mobile: 'phone',
    cell: 'phone',
    location: 'region',
    district: 'region',
    province: 'region',
    farm_size: 'farm_size_ha',
    hectares: 'farm_size_ha',
    size_ha: 'farm_size_ha',
    crop: 'primary_crop',
    main_crop: 'primary_crop',
    crops: 'primary_crop',
    tier: 'membership_tier',
    membership: 'membership_tier',
    sex: 'gender',
    experience: 'years_farming',
    years: 'years_farming',
    farming_years: 'years_farming',
  };

  const normalizedHeaders = headers.map(h => headerMap[h] || h);

  // Parse rows
  const farmers: FarmerRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted values with commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    normalizedHeaders.forEach((header, idx) => {
      if (values[idx]) row[header] = values[idx].replace(/^["']|["']$/g, '');
    });

    if (row.full_name && row.country) {
      farmers.push({
        full_name: row.full_name,
        email: row.email || undefined,
        phone: row.phone || undefined,
        country: row.country,
        region: row.region || undefined,
        farm_size_ha: row.farm_size_ha ? parseFloat(row.farm_size_ha) : undefined,
        primary_crop: row.primary_crop || undefined,
        membership_tier: row.membership_tier || undefined,
        gender: row.gender || undefined,
        years_farming: row.years_farming ? parseInt(row.years_farming) : undefined,
      });
    }
  }

  return farmers;
}

/* ------------------------------------------------------------------ */
/* Sample CSV template                                                  */
/* ------------------------------------------------------------------ */

const SAMPLE_CSV = `full_name,email,phone,country,region,farm_size_ha,primary_crop,membership_tier,gender,years_farming
Tendai Moyo,tendai@example.com,+263771234567,Zimbabwe,Mashonaland East,5.2,Maize,smallholder,Male,12
Grace Chirwa,,+263772345678,Zimbabwe,Manicaland,3.0,Tobacco,smallholder,Female,8
Simba Chikwanha,simba.c@example.com,+263773456789,Zimbabwe,Midlands,15.0,Cotton,commercial,Male,20
Rumbidzai Ngwenya,,+263774567890,Zimbabwe,Masvingo,2.5,Groundnuts,smallholder,Female,6
Tapiwa Mugabe,tapiwa@example.com,+263775678901,Zimbabwe,Mashonaland West,8.0,Sorghum,commercial,Male,15`;

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function BulkFarmerImport() {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'result'>('upload');
  const [parsedFarmers, setParsedFarmers] = useState<FarmerRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name);

    if (!file.name.endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
      setError('Please upload a CSV file (.csv)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const farmers = parseCSV(text);
        if (farmers.length === 0) {
          setError('No valid farmer records found. Make sure your CSV has full_name and country columns.');
          return;
        }
        setParsedFarmers(farmers);
        setStep('preview');
      } catch {
        setError('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = async () => {
    setStep('importing');
    try {
      const res = await fetch('/api/admin/farmers/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmers: parsedFarmers }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data as ImportResult);
        setStep('result');
      } else {
        setError(data.error || 'Import failed');
        setStep('preview');
      }
    } catch {
      setError('Network error — please try again');
      setStep('preview');
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'afu_farmer_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setStep('upload');
    setParsedFarmers([]);
    setResult(null);
    setFileName('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/members"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy">Bulk Farmer Import</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upload a CSV to import multiple farmers at once</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Template download */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-[#5DB347]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-navy text-sm">CSV Template</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Download our template with the correct columns, fill in your farmer data, then upload below.
                    Required columns: <strong>full_name</strong> and <strong>country</strong>. All others are optional.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['full_name*', 'email', 'phone', 'country*', 'region', 'farm_size_ha', 'primary_crop', 'membership_tier', 'gender', 'years_farming'].map(col => (
                      <span key={col} className={`text-[10px] px-2 py-0.5 rounded-full ${col.includes('*') ? 'bg-red-50 text-red-600 font-bold' : 'bg-gray-100 text-gray-600'}`}>
                        {col}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#5DB347] hover:text-[#449933] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Zimbabwe Template (5 sample farmers)
                  </button>
                </div>
              </div>
            </div>

            {/* Drag and drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative bg-white rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                dragOver ? 'border-[#5DB347] bg-[#EBF7E5]/30' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-[#5DB347]' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-navy">
                Drag & drop your CSV file here
              </p>
              <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              <p className="text-[10px] text-gray-400 mt-3">Maximum 500 farmers per import</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-lg p-3 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[#5DB347]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy text-sm">Preview Import</h3>
                    <p className="text-xs text-gray-500">{fileName} — {parsedFarmers.length} farmers found</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200">
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Import {parsedFarmers.length} Farmers
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-navy">{parsedFarmers.length}</p>
                  <p className="text-[10px] text-gray-500">Total Farmers</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-navy">{parsedFarmers.filter(f => f.email).length}</p>
                  <p className="text-[10px] text-gray-500">With Email</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-navy">{parsedFarmers.filter(f => f.phone).length}</p>
                  <p className="text-[10px] text-gray-500">With Phone</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-navy">{[...new Set(parsedFarmers.map(f => f.country))].length}</p>
                  <p className="text-[10px] text-gray-500">Countries</p>
                </div>
              </div>

              {/* Table preview */}
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 py-2 font-medium text-gray-500">#</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Email</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Phone</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Country</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Region</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Farm (ha)</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Crop</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {parsedFarmers.slice(0, 20).map((farmer, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-navy">{farmer.full_name}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.email || '—'}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.phone || '—'}</td>
                        <td className="px-3 py-2">{farmer.country}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.region || '—'}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.farm_size_ha || '—'}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.primary_crop || '—'}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                            {farmer.membership_tier || 'smallholder'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedFarmers.length > 20 && (
                  <div className="px-3 py-2 text-xs text-gray-400 text-center bg-gray-50">
                    Showing 20 of {parsedFarmers.length} farmers
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-lg p-3 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Importing */}
        {step === 'importing' && (
          <motion.div
            key="importing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 p-12 text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-[#5DB347] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-navy mb-2">Importing Farmers...</h3>
            <p className="text-sm text-gray-500">
              Creating {parsedFarmers.length} farmer accounts. This may take a moment.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Each farmer gets: auth account + profile + member record + tier + farm plot
            </p>
          </motion.div>
        )}

        {/* Step 4: Results */}
        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                {result.failed === 0 ? (
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-navy">
                    {result.failed === 0 ? 'Import Complete!' : 'Import Completed with Errors'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {result.success} of {result.total} farmers imported successfully
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{result.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{result.success}</p>
                  <p className="text-xs text-green-600">Success</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${result.failed > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>{result.failed}</p>
                  <p className={`text-xs ${result.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>Failed</p>
                </div>
              </div>
            </div>

            {/* Error details */}
            {result.errors.length > 0 && (
              <div className="bg-white rounded-xl border border-red-100 p-5">
                <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Failed Imports ({result.errors.length})
                </h4>
                <div className="space-y-2">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-red-50 rounded-lg p-2">
                      <span className="text-red-400 font-mono">Row {err.row}</span>
                      <span className="font-medium text-red-700">{err.name}</span>
                      <span className="text-red-500">— {err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import More Farmers
              </button>
              <Link
                href="/admin/members"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-navy px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Users className="w-4 h-4" />
                View Members
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
