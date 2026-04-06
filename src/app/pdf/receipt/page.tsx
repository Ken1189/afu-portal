'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Printer } from 'lucide-react';

interface Receipt {
  id: string;
  receipt_number: string;
  farmer_id: string | null;
  farmer_name: string | null;
  commodity: string;
  bags: number;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  unit_price: number;
  total_value: number;
  grade: string | null;
  status: string;
  created_at: string;
  quality_inspection?: {
    moisture_percent: number;
    foreign_matter_percent: number;
    damage_percent: number;
    aflatoxin_level: string;
    color_assessment: string;
    odor: string;
  } | null;
}

export default function ReceiptPdfPage() {
  const searchParams = useSearchParams();
  const receiptId = searchParams.get('id');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiptId) {
      setError('No receipt ID provided. Add ?id=xxx to the URL.');
      setLoading(false);
      return;
    }

    async function fetchReceipt() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('warehouse_receipts')
        .select('*, quality_inspections(moisture_percent, foreign_matter_percent, damage_percent, aflatoxin_level, color_assessment, odor)')
        .eq('id', receiptId!)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        // Map joined quality_inspections array to single object
        const raw = data as Record<string, unknown>;
        const inspections = raw.quality_inspections as Array<Record<string, unknown>> | null;
        const mapped: Receipt = {
          ...(raw as unknown as Receipt),
          quality_inspection: inspections && inspections.length > 0 ? (inspections[0] as unknown as Receipt['quality_inspection']) : null,
        };
        setReceipt(mapped);
      }
      setLoading(false);
    }

    fetchReceipt();
  }, [receiptId]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green" />
        <span className="ml-3 text-navy">Loading receipt...</span>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error</p>
          <p className="text-gray-600 mt-1">{error || 'Receipt not found'}</p>
        </div>
      </div>
    );
  }

  const receiptDate = new Date(receipt.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const qi = receipt.quality_inspection;

  return (
    <>
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, footer, .site-navbar, .site-footer, .announcement-banner,
          .cookie-consent, .chat-widget, .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
        @media screen {
          .receipt-page { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
        }
      `}</style>

      <div className="receipt-page bg-white min-h-screen">
        {/* Print Button */}
        <div className="no-print fixed bottom-6 right-6 z-50">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green hover:bg-green-dark text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors cursor-pointer"
          >
            <Printer className="h-5 w-5" />
            Download PDF
          </button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start pb-5 mb-8 border-b-[3px] border-green">
          <div>
            <h1 className="text-[22px] font-bold text-navy">African Farming Union</h1>
            <p className="text-xs text-gray-500">Warehouse Receipt System</p>
          </div>
          <div className="text-right">
            <div className="text-[28px] font-bold text-green">WAREHOUSE RECEIPT</div>
            <div className="text-sm text-gray-500">{receipt.receipt_number}</div>
          </div>
        </div>

        {/* Depositor + Meta */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Depositor</p>
            <p className="font-semibold text-navy text-lg">{receipt.farmer_name || '-'}</p>
            {receipt.farmer_id && <p className="text-sm text-gray-600">Farmer ID: {receipt.farmer_id}</p>}
          </div>
          <div className="text-right text-sm">
            <p><span className="text-gray-500">Date:</span> {receiptDate}</p>
            <p><span className="text-gray-500">Status:</span>{' '}
              <span className={`font-semibold capitalize ${receipt.status === 'received' ? 'text-green' : receipt.status === 'released' ? 'text-blue-600' : 'text-gold'}`}>
                {receipt.status}
              </span>
            </p>
          </div>
        </div>

        {/* Commodity Details */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy mb-3">Commodity Details</p>
          <table className="w-full border-collapse">
            <tbody>
              <DetailRow label="Commodity" value={receipt.commodity} />
              <DetailRow label="Grade" value={receipt.grade || '-'} />
              <DetailRow label="Bags" value={String(receipt.bags)} />
              <DetailRow label="Gross Weight" value={`${receipt.gross_weight_kg.toFixed(1)} kg`} />
              <DetailRow label="Tare Weight" value={`${receipt.tare_weight_kg.toFixed(1)} kg`} />
              <DetailRow label="Net Weight" value={`${receipt.net_weight_kg.toFixed(1)} kg`} bold />
              <DetailRow label="Unit Price" value={`USD ${receipt.unit_price.toFixed(2)}/kg`} />
            </tbody>
          </table>
        </div>

        {/* Total Value */}
        <div className="flex justify-end mb-8">
          <div className="bg-green-light px-6 py-4 rounded-lg text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Value</p>
            <p className="text-2xl font-bold text-navy">USD {receipt.total_value.toFixed(2)}</p>
          </div>
        </div>

        {/* Quality Inspection */}
        {qi && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy mb-3">Quality Inspection</p>
            <div className="grid grid-cols-3 gap-4">
              <QualityCard label="Moisture" value={`${qi.moisture_percent}%`} />
              <QualityCard label="Foreign Matter" value={`${qi.foreign_matter_percent}%`} />
              <QualityCard label="Damage" value={`${qi.damage_percent}%`} />
              <QualityCard label="Aflatoxin Level" value={qi.aflatoxin_level} />
              <QualityCard label="Color" value={qi.color_assessment} />
              <QualityCard label="Odor" value={qi.odor} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            African Farming Union &middot; Warehouse Receipt System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This receipt confirms deposit of the above commodity in an AFU-certified warehouse.
          </p>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 px-3 text-sm text-gray-600 w-1/3">{label}</td>
      <td className={`py-2 px-3 text-sm text-right ${bold ? 'font-bold text-navy' : ''}`}>{value}</td>
    </tr>
  );
}

function QualityCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-navy">{value}</p>
    </div>
  );
}
