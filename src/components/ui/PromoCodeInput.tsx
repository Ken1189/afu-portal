'use client';

import { useState, useCallback } from 'react';
import { Tag, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface PromoResult {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  currency: string;
}

interface PromoCodeInputProps {
  context?: string; // 'farmer' | 'supplier' | 'ambassador' | 'investor' | 'membership' | 'subscription'
  onValidated?: (promo: PromoResult | null) => void;
}

export default function PromoCodeInput({ context = 'all', onValidated }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; promo?: PromoResult; error?: string } | null>(null);

  const validate = useCallback(async () => {
    if (!code.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), context }),
      });
      const data = await res.json();
      setResult(data);
      onValidated?.(data.valid ? data.promo : null);
    } catch {
      setResult({ valid: false, error: 'Failed to validate' });
      onValidated?.(null);
    } finally {
      setChecking(false);
    }
  }, [code, context, onValidated]);

  const clear = () => {
    setCode('');
    setResult(null);
    onValidated?.(null);
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        <Tag className="w-3.5 h-3.5 inline mr-1" />
        Promo Code <span className="text-gray-400 font-normal">(optional)</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (result) setResult(null);
          }}
          placeholder="AFU-XXXXXX"
          disabled={result?.valid}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none disabled:bg-gray-50"
        />
        {result?.valid ? (
          <button
            onClick={clear}
            className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-medium hover:bg-gray-200 transition"
          >
            Clear
          </button>
        ) : (
          <button
            onClick={validate}
            disabled={!code.trim() || checking}
            className="px-4 py-2 bg-teal text-white rounded-xl text-sm font-medium hover:bg-teal/90 transition disabled:opacity-50"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
          </button>
        )}
      </div>
      {result && (
        <div className={`flex items-center gap-1.5 text-xs mt-1 ${result.valid ? 'text-green-600' : 'text-red-500'}`}>
          {result.valid ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {result.promo?.discount_type === 'percent'
                ? `${result.promo.discount_value}% discount applied`
                : `$${result.promo?.discount_value} discount applied`}
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" />
              {result.error}
            </>
          )}
        </div>
      )}
    </div>
  );
}
