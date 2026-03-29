'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

/**
 * S5.3: Post-onboarding checklist with role-specific next steps.
 * Shows on the dashboard until all items are completed or dismissed.
 */

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  checkFn: (profile: Record<string, unknown>, data: Record<string, unknown[]>) => boolean;
}

const FARMER_CHECKLIST: ChecklistItem[] = [
  { id: 'profile', label: 'Complete your profile', href: '/dashboard/profile', checkFn: (p) => !!(p.full_name && p.phone && p.country) },
  { id: 'kyc', label: 'Verify your identity (KYC)', href: '/dashboard/kyc', checkFn: (_p, d) => (d.kyc_verifications?.length || 0) > 0 },
  { id: 'farm_plot', label: 'Create your first farm plot', href: '/farm/crops', checkFn: (_p, d) => (d.farm_plots?.length || 0) > 0 },
  { id: 'training', label: 'Start a training course', href: '/education', checkFn: (_p, d) => (d.course_enrollments?.length || 0) > 0 },
  { id: 'financing', label: 'Explore financing options', href: '/dashboard/financing', checkFn: () => false },
];

const SUPPLIER_CHECKLIST: ChecklistItem[] = [
  { id: 'profile', label: 'Complete your profile', href: '/dashboard/profile', checkFn: (p) => !!(p.full_name && p.phone) },
  { id: 'kyc', label: 'Verify your identity', href: '/dashboard/kyc', checkFn: (_p, d) => (d.kyc_verifications?.length || 0) > 0 },
  { id: 'product', label: 'Add your first product', href: '/supplier/products', checkFn: (_p, d) => (d.products?.length || 0) > 0 },
  { id: 'bank', label: 'Set up payment details', href: '/supplier/settings', checkFn: () => false },
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'profile', label: 'Complete your profile', href: '/dashboard/profile', checkFn: (p) => !!(p.full_name && p.phone && p.country) },
  { id: 'kyc', label: 'Verify your identity', href: '/dashboard/kyc', checkFn: (_p, d) => (d.kyc_verifications?.length || 0) > 0 },
  { id: 'explore', label: 'Explore the dashboard', href: '/dashboard', checkFn: () => false },
];

export default function OnboardingChecklist() {
  const { profile } = useAuth();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const role = profile?.role || 'member';
  // 'member' role is used for farmers in the profiles table
  const checklist = (role === 'member' || role === ('farmer' as string)) ? FARMER_CHECKLIST
    : role === 'supplier' ? SUPPLIER_CHECKLIST
    : DEFAULT_CHECKLIST;

  useEffect(() => {
    if (dismissed) return;
    const dismissedKey = 'afu_checklist_dismissed';
    if (localStorage.getItem(dismissedKey)) {
      setDismissed(true);
      return;
    }

    async function check() {
      if (!profile?.id) return;
      const supabase = createClient();
      const data: Record<string, unknown[]> = {};

      // Fetch minimal data for checks
      const [kycRes, plotsRes, enrollRes, productsRes] = await Promise.allSettled([
        supabase.from('kyc_verifications').select('id').eq('member_id', profile.id).limit(1),
        supabase.from('farm_plots').select('id').eq('user_id', profile.id).limit(1),
        supabase.from('course_enrollments').select('id').eq('user_id', profile.id).limit(1),
        supabase.from('products').select('id').eq('supplier_id', profile.id).limit(1),
      ]);

      data.kyc_verifications = kycRes.status === 'fulfilled' ? (kycRes.value.data || []) : [];
      data.farm_plots = plotsRes.status === 'fulfilled' ? (plotsRes.value.data || []) : [];
      data.course_enrollments = enrollRes.status === 'fulfilled' ? (enrollRes.value.data || []) : [];
      data.products = productsRes.status === 'fulfilled' ? (productsRes.value.data || []) : [];

      const done = new Set<string>();
      for (const item of checklist) {
        if (item.checkFn(profile as unknown as Record<string, unknown>, data)) {
          done.add(item.id);
        }
      }
      setCompleted(done);
      setLoading(false);
    }

    check();
  }, [profile, checklist, dismissed]);

  if (dismissed || loading) return null;

  const completedCount = completed.size;
  const totalCount = checklist.length;
  const allDone = completedCount === totalCount;

  if (allDone) return null;

  const pct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#1B2A4A]">Getting Started</h3>
          <p className="text-xs text-gray-400 mt-0.5">{completedCount}/{totalCount} completed</p>
        </div>
        <button
          onClick={() => { setDismissed(true); localStorage.setItem('afu_checklist_dismissed', '1'); }}
          className="text-gray-300 hover:text-gray-500 transition-colors"
          title="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[#5DB347] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {checklist.map((item) => {
          const done = completed.has(item.id);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                done
                  ? 'text-gray-400 bg-gray-50'
                  : 'text-[#1B2A4A] hover:bg-[#EBF7E5] font-medium'
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-[#5DB347] shrink-0" />
              ) : (
                <Circle className="w-4.5 h-4.5 text-gray-300 shrink-0" />
              )}
              <span className={done ? 'line-through' : ''}>{item.label}</span>
              {!done && <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
