'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { Clock, CheckCircle2, XCircle, DollarSign, Send, FileText, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface TrackedItem {
  id: string;
  type: 'loan' | 'insurance' | 'kyc' | 'application';
  label: string;
  status: string;
  amount?: number;
  date: string;
  link: string;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  submitted: { icon: Send, color: 'text-blue-500 bg-blue-50', label: 'Submitted' },
  pending: { icon: Clock, color: 'text-amber-500 bg-amber-50', label: 'Pending' },
  under_review: { icon: FileText, color: 'text-purple-500 bg-purple-50', label: 'Under Review' },
  approved: { icon: CheckCircle2, color: 'text-green-600 bg-green-50', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-500 bg-red-50', label: 'Rejected' },
  disbursed: { icon: DollarSign, color: 'text-[#5DB347] bg-[#EBF7E5]', label: 'Disbursed' },
  verified: { icon: CheckCircle2, color: 'text-green-600 bg-green-50', label: 'Verified' },
  repaying: { icon: DollarSign, color: 'text-teal-600 bg-teal-50', label: 'Repaying' },
};

export default function StatusTracker() {
  const { user } = useAuth();
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      setLoading(true);
      const supabase = createClient();
      const tracked: TrackedItem[] = [];

      // Fetch loans via member record
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (member) {
        const { data: loans } = await supabase
          .from('loans')
          .select('id, loan_number, loan_type, amount, status, created_at')
          .eq('member_id', member.id)
          .in('status', ['submitted', 'pending', 'under_review', 'approved', 'disbursed', 'repaying'])
          .order('created_at', { ascending: false })
          .limit(5);

        if (loans) {
          loans.forEach((l: Record<string, unknown>) => {
            tracked.push({
              id: String(l.id),
              type: 'loan',
              label: `Loan: ${String(l.loan_type || 'Application').replace(/_/g, ' ')}`,
              status: String(l.status),
              amount: Number(l.amount),
              date: String(l.created_at),
              link: '/farm/financing',
            });
          });
        }
      }

      // Fetch KYC documents
      const { data: kyc } = await supabase
        .from('kyc_documents')
        .select('id, document_type, status, created_at')
        .eq('user_id', user.id)
        .in('status', ['pending', 'under_review'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (kyc) {
        kyc.forEach((d: Record<string, unknown>) => {
          tracked.push({
            id: String(d.id),
            type: 'kyc',
            label: `KYC: ${String(d.document_type || 'Document').replace(/_/g, ' ')}`,
            status: String(d.status),
            date: String(d.created_at),
            link: '/dashboard/kyc',
          });
        });
      }

      // Fetch insurance claims
      const { data: claims } = await supabase
        .from('insurance_claims')
        .select('id, claim_type, amount, status, created_at')
        .eq('farmer_id', user.id)
        .in('status', ['submitted', 'pending', 'under_review'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (claims) {
        claims.forEach((c: Record<string, unknown>) => {
          tracked.push({
            id: String(c.id),
            type: 'insurance',
            label: `Insurance: ${String(c.claim_type || 'Claim').replace(/_/g, ' ')}`,
            status: String(c.status),
            amount: Number(c.amount) || undefined,
            date: String(c.created_at),
            link: '/farm/insurance',
          });
        });
      }

      setItems(tracked);
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading your applications...
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy">Active Applications</h3>
        <span className="text-[10px] bg-[#5DB347]/10 text-[#5DB347] font-bold px-2 py-0.5 rounded-full">
          {items.length} active
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => {
          const config = statusConfig[item.status] || statusConfig.pending;
          const Icon = config.icon;
          return (
            <Link
              key={item.id}
              href={item.link}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-navy truncate">{item.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.color}`}>
                    {config.label}
                  </span>
                  {item.amount && (
                    <span className="text-[10px] text-gray-400">${item.amount.toLocaleString()}</span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
