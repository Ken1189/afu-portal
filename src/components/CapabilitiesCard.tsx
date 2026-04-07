'use client';

import { useState } from 'react';
import { Megaphone, TrendingUp, Star, GraduationCap, Plus, X, Check, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

/**
 * Self-service capability options shown in the "Add new capability" modal.
 * Kept in sync with the whitelist in /api/user/capabilities/activate.
 */
const SELF_SERVICE: Array<{
  key: string;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: 'ambassador',
    label: 'Ambassador',
    description: 'Earn commission referring new farmers and suppliers.',
    Icon: Megaphone,
  },
  {
    key: 'investor',
    label: 'Investor',
    description: 'Access investment opportunities across AFU programs.',
    Icon: TrendingUp,
  },
  {
    key: 'sponsor',
    label: 'Sponsor',
    description: 'Sponsor AFU programs for marketing exposure.',
    Icon: Star,
  },
  {
    key: 'advisor',
    label: 'Advisor',
    description: 'Offer expertise to the AFU community.',
    Icon: GraduationCap,
  },
];

// Display-only metadata for all possible capabilities (including admin-granted)
const CAPABILITY_META: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  ambassador: { label: 'Ambassador', Icon: Megaphone },
  investor: { label: 'Investor', Icon: TrendingUp },
  sponsor: { label: 'Sponsor', Icon: Star },
  advisor: { label: 'Advisor', Icon: GraduationCap },
  supplier: { label: 'Supplier', Icon: Sparkles },
  farmer: { label: 'Farmer', Icon: Sparkles },
  warehouse_op: { label: 'Warehouse Operator', Icon: Sparkles },
};

export default function CapabilitiesCard() {
  const { capabilities, refreshProfile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCaps = capabilities || [];

  const handleActivate = async (cap: string) => {
    setActivating(cap);
    setError(null);
    try {
      const res = await fetch('/api/user/capabilities/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capability: cap }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to activate capability');
      }
      await refreshProfile();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setActivating(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1B2A4A]">Active capabilities</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Additional roles you can take on across the AFU platform
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#5DB347] hover:bg-[#449933] text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add capability
          </button>
        </div>

        {activeCaps.length === 0 ? (
          <p className="text-sm text-gray-500">
            No active capabilities yet. Click &ldquo;Add capability&rdquo; to get started.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeCaps.map((cap) => {
              const meta = CAPABILITY_META[cap] || { label: cap, Icon: Sparkles };
              const Icon = meta.Icon;
              return (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5DB347]/10 border border-[#5DB347]/30 text-[#449933] text-xs font-semibold"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1B2A4A]">Add a capability</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg">
                  {error}
                </div>
              )}
              {SELF_SERVICE.map((opt) => {
                const isActive = activeCaps.includes(opt.key);
                const isActivating = activating === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isActive || isActivating || activating !== null}
                    onClick={() => handleActivate(opt.key)}
                    className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                      isActive
                        ? 'border-[#5DB347]/40 bg-[#5DB347]/5 cursor-default'
                        : 'border-gray-200 hover:border-[#5DB347] hover:bg-[#5DB347]/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1B2A4A] flex items-center justify-center flex-shrink-0">
                      <opt.Icon className="w-5 h-5 text-[#5DB347]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#1B2A4A]">{opt.label}</p>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-xs text-[#449933] font-semibold">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{opt.description}</p>
                    </div>
                    {isActivating && (
                      <Loader2 className="w-4 h-4 text-[#5DB347] animate-spin flex-shrink-0" />
                    )}
                  </button>
                );
              })}
              <p className="text-xs text-gray-400 pt-2">
                Supplier and farmer roles require admin approval and are not shown here.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
