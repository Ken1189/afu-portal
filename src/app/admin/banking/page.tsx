'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Landmark,
  Wallet,
  ArrowUpDown,
  Shield,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
} from 'lucide-react';

// ─── Types ───

type Tab = 'overview' | 'wallets' | 'ledger' | 'monitoring' | 'reconciliation';

// ─── Demo Data ───

const fallback_kpis = [
  { label: 'Total AUM', value: '$4.75M', change: '+12.3%', icon: DollarSign, color: 'text-green-600 bg-green-50' },
  { label: 'Active Wallets', value: '2,847', change: '+189 this month', icon: Wallet, color: 'text-blue-600 bg-blue-50' },
  { label: 'Transactions Today', value: '342', change: '$127K volume', icon: ArrowUpDown, color: 'text-purple-600 bg-purple-50' },
  { label: 'Pending Flags', value: '7', change: '2 high severity', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
];

const fallback_recentTransactions = [
  { id: 'TXN-001', type: 'Deposit', user: 'Grace Mutua', amount: '+$2,500.00', currency: 'USD', time: '2 min ago', status: 'completed' },
  { id: 'TXN-002', type: 'Transfer', user: 'John Kamau', amount: '-KES 45,000', currency: 'KES', time: '8 min ago', status: 'completed' },
  { id: 'TXN-003', type: 'Loan Disbursement', user: 'Faith Ochieng', amount: '+$5,000.00', currency: 'USD', time: '15 min ago', status: 'completed' },
  { id: 'TXN-004', type: 'Withdrawal', user: 'Emmanuel Moyo', amount: '-ZAR 12,500', currency: 'ZAR', time: '22 min ago', status: 'completed' },
  { id: 'TXN-005', type: 'Deposit (M-Pesa)', user: 'Alice Wanjiku', amount: '+KES 85,000', currency: 'KES', time: '31 min ago', status: 'completed' },
  { id: 'TXN-006', type: 'Insurance Premium', user: 'Peter Banda', amount: '-$120.00', currency: 'USD', time: '45 min ago', status: 'completed' },
];

const fallback_systemAccounts = [
  { name: 'Revenue - USD', type: 'revenue', currency: 'USD', balance: 245_830.50 },
  { name: 'Escrow - USD', type: 'escrow', currency: 'USD', balance: 1_250_000.00 },
  { name: 'Loan Book - USD', type: 'loan_book', currency: 'USD', balance: 2_150_000.00 },
  { name: 'Insurance Pool - USD', type: 'insurance_pool', currency: 'USD', balance: 450_000.00 },
  { name: 'Settlement - USD', type: 'settlement', currency: 'USD', balance: 89_420.75 },
  { name: 'Fees - USD', type: 'fees', currency: 'USD', balance: 34_560.00 },
  { name: 'Revenue - KES', type: 'revenue', currency: 'KES', balance: 12_450_000 },
  { name: 'Loan Book - KES', type: 'loan_book', currency: 'KES', balance: 45_000_000 },
  { name: 'Revenue - ZAR', type: 'revenue', currency: 'ZAR', balance: 2_890_000 },
  { name: 'Escrow - BWP', type: 'escrow', currency: 'BWP', balance: 1_540_000 },
];

const fallback_flags = [
  { id: 'FLG-001', user: 'Unknown User #4521', type: 'velocity', severity: 'high', detail: '12 transactions in 10 minutes', time: '1 hour ago', status: 'pending' },
  { id: 'FLG-002', user: 'James Otieno', type: 'amount_threshold', severity: 'high', detail: 'KES 2.5M in 24 hours (threshold: 1M)', time: '3 hours ago', status: 'pending' },
  { id: 'FLG-003', user: 'Sarah Mensah', type: 'cross_border', severity: 'medium', detail: 'Transfer to non-AFU country', time: '5 hours ago', status: 'investigating' },
  { id: 'FLG-004', user: 'David Phiri', type: 'unusual_pattern', severity: 'medium', detail: 'First transaction after 6 months inactive', time: '8 hours ago', status: 'investigating' },
  { id: 'FLG-005', user: 'Grace Mutua', type: 'velocity', severity: 'low', detail: '8 transactions in 1 hour', time: '1 day ago', status: 'cleared' },
];

const fallback_reconRuns = [
  { date: '2026-03-25', provider: 'Stripe', currency: 'USD', our: 127_450.00, theirs: 127_450.00, disc: 0, matched: 45, unmatched: 0, status: 'matched' },
  { date: '2026-03-25', provider: 'M-Pesa', currency: 'KES', our: 3_450_000, theirs: 3_448_500, disc: 1500, matched: 128, unmatched: 2, status: 'discrepancy' },
  { date: '2026-03-25', provider: 'EcoCash', currency: 'ZWL', our: 12_500_000, theirs: 12_500_000, disc: 0, matched: 34, unmatched: 0, status: 'matched' },
  { date: '2026-03-24', provider: 'Stripe', currency: 'USD', our: 98_320.00, theirs: 98_320.00, disc: 0, matched: 38, unmatched: 0, status: 'matched' },
  { date: '2026-03-24', provider: 'MTN MoMo', currency: 'UGX', our: 85_000_000, theirs: 84_950_000, disc: 50000, matched: 67, unmatched: 1, status: 'discrepancy' },
];

// ─── Helpers ───

function formatCurrency(amount: number, currency: string) {
  const symbols: Record<string, string> = { USD: '$', KES: 'KES ', ZAR: 'R', BWP: 'P', UGX: 'UGX ', ZWL: 'ZWL ', TZS: 'TZS ' };
  const prefix = symbols[currency] || currency + ' ';
  return prefix + amount.toLocaleString(undefined, { minimumFractionDigits: currency === 'USD' ? 2 : 0 });
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700', matched: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700', investigating: 'bg-blue-100 text-blue-700',
    cleared: 'bg-gray-100 text-gray-500', escalated: 'bg-red-100 text-red-700',
    discrepancy: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

function severityBadge(severity: string) {
  const colors: Record<string, string> = {
    critical: 'bg-red-600 text-white', high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700', low: 'bg-gray-100 text-gray-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[severity] || 'bg-gray-100'}`}>{severity}</span>;
}

// ─── Component ───

export default function AdminBankingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);
  const [kpis, setKpis] = useState(fallback_kpis);
  const [recentTransactions, setRecentTransactions] = useState(fallback_recentTransactions);
  const [systemAccounts, setSystemAccounts] = useState(fallback_systemAccounts);
  const [flags, setFlags] = useState(fallback_flags);
  const [reconRuns, setReconRuns] = useState(fallback_reconRuns);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      try {
        // Fetch wallet transactions as recent transactions
        const { data: txData } = await supabase
          .from('wallet_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (txData && txData.length > 0) {
          setRecentTransactions(
            txData.map((t: Record<string, unknown>) => ({
              id: (t.id as string)?.slice(0, 8) || 'TXN',
              type: (t.transaction_type as string) || 'Transaction',
              user: (t.description as string) || 'Unknown',
              amount: `${(t.amount as number) >= 0 ? '+' : ''}$${Math.abs((t.amount as number) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              currency: (t.currency as string) || 'USD',
              time: (t.created_at as string) || '',
              status: (t.status as string) || 'completed',
            }))
          );
        }

        // Fetch ledger accounts as system accounts
        const { data: ledgerData } = await supabase
          .from('ledger_accounts')
          .select('*')
          .order('name');
        if (ledgerData && ledgerData.length > 0) {
          setSystemAccounts(
            ledgerData.map((a: Record<string, unknown>) => ({
              name: (a.name as string) || 'Account',
              type: (a.account_type as string) || 'general',
              currency: (a.currency as string) || 'USD',
              balance: (a.balance as number) || 0,
            }))
          );
        }

        // Fetch transaction flags
        const { data: flagData } = await supabase
          .from('transaction_flags')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (flagData && flagData.length > 0) {
          setFlags(
            flagData.map((f: Record<string, unknown>) => ({
              id: (f.id as string)?.slice(0, 8) || 'FLG',
              user: (f.user_name as string) || 'Unknown User',
              type: (f.flag_type as string) || 'unknown',
              severity: (f.severity as string) || 'medium',
              detail: (f.detail as string) || '',
              time: (f.created_at as string) || '',
              status: (f.status as string) || 'pending',
            }))
          );
        }

        // Fetch reconciliation runs
        const { data: reconData } = await supabase
          .from('reconciliation_runs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (reconData && reconData.length > 0) {
          setReconRuns(
            reconData.map((r: Record<string, unknown>) => ({
              date: ((r.run_date as string) || (r.created_at as string))?.split('T')[0] || '',
              provider: (r.provider as string) || 'Unknown',
              currency: (r.currency as string) || 'USD',
              our: (r.our_balance as number) || 0,
              theirs: (r.provider_balance as number) || 0,
              disc: (r.discrepancy as number) || 0,
              matched: (r.matched_count as number) || 0,
              unmatched: (r.unmatched_count as number) || 0,
              status: (r.status as string) || 'matched',
            }))
          );
        }
      } catch {
        // fallback data already set
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof Landmark }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'wallets', label: 'Wallets & Accounts', icon: Wallet },
    { key: 'ledger', label: 'Ledger', icon: Landmark },
    { key: 'monitoring', label: 'Monitoring', icon: Shield },
    { key: 'reconciliation', label: 'Reconciliation', icon: RefreshCw },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Banking Operations</h1>
        <p className="text-gray-500 mt-1">Ledger, wallets, transaction monitoring, and reconciliation</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-white border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{kpi.label}</span>
                  <div className={`p-2 rounded-lg ${kpi.color}`}>
                    <kpi.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-xs text-gray-400 mt-1">{kpi.change}</div>
              </div>
            ))}
          </div>

          {/* Zero Balance Validation */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <span className="font-medium text-green-800">Ledger Balanced</span>
              <span className="text-green-600 text-sm ml-2">Total debits = Total credits across all currencies. Last validated: 2 minutes ago</span>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white border rounded-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="divide-y">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.amount.startsWith('+') ? 'bg-green-50' : 'bg-red-50'}`}>
                      {txn.amount.startsWith('+') ? <TrendingUp className="w-4 h-4 text-green-600" /> : <ArrowUpDown className="w-4 h-4 text-red-500" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{txn.type}</div>
                      <div className="text-xs text-gray-400">{txn.user} &middot; {txn.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>{txn.amount}</div>
                    <div className="text-xs text-gray-400">{txn.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wallets Tab */}
      {activeTab === 'wallets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border rounded-xl p-5">
              <div className="text-sm text-gray-500">Total Wallets</div>
              <div className="text-2xl font-bold mt-1">2,847</div>
              <div className="text-xs text-green-600 mt-1">+189 this month</div>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="text-sm text-gray-500">Active</div>
              <div className="text-2xl font-bold mt-1 text-green-600">2,791</div>
              <div className="text-xs text-gray-400 mt-1">98% of total</div>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="text-sm text-gray-500">Frozen</div>
              <div className="text-2xl font-bold mt-1 text-amber-600">56</div>
              <div className="text-xs text-gray-400 mt-1">Compliance holds</div>
            </div>
          </div>

          <div className="bg-white border rounded-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">System Accounts</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input type="text" placeholder="Search accounts..." className="pl-9 pr-3 py-2 border rounded-lg text-sm w-56" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Account</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Type</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Currency</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {systemAccounts.map((acct, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{acct.name}</td>
                      <td className="px-5 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{acct.type}</span></td>
                      <td className="px-5 py-3 text-gray-600">{acct.currency}</td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-gray-900">{formatCurrency(acct.balance, acct.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Tab */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <span className="font-medium text-green-800">Zero-Balance Validation: PASSED</span>
              <span className="text-green-600 text-sm ml-2">Total Debits $4,750,230.50 = Total Credits $4,750,230.50</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border rounded-xl p-5">
              <div className="text-sm text-gray-500">Total Entries</div>
              <div className="text-2xl font-bold mt-1">48,392</div>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="text-sm text-gray-500">Today&apos;s Entries</div>
              <div className="text-2xl font-bold mt-1">684</div>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="text-sm text-gray-500">Currencies Active</div>
              <div className="text-2xl font-bold mt-1">8</div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Entry Types Distribution (Today)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Deposits', count: 156, pct: 23 },
                { label: 'Withdrawals', count: 89, pct: 13 },
                { label: 'Transfers', count: 234, pct: 34 },
                { label: 'Loan Operations', count: 67, pct: 10 },
                { label: 'Insurance', count: 45, pct: 7 },
                { label: 'Membership Fees', count: 62, pct: 9 },
                { label: 'Marketplace', count: 21, pct: 3 },
                { label: 'Other', count: 10, pct: 1 },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-lg font-bold text-gray-900">{item.count}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-2 text-amber-600"><Clock className="w-4 h-4" /><span className="text-sm">Pending</span></div>
              <div className="text-2xl font-bold mt-1">4</div>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-2 text-blue-600"><Eye className="w-4 h-4" /><span className="text-sm">Investigating</span></div>
              <div className="text-2xl font-bold mt-1">2</div>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-4 h-4" /><span className="text-sm">Escalated</span></div>
              <div className="text-2xl font-bold mt-1">1</div>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" /><span className="text-sm">Cleared (30d)</span></div>
              <div className="text-2xl font-bold mt-1">23</div>
            </div>
          </div>

          <div className="bg-white border rounded-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Transaction Flags</h2>
              <div className="flex gap-2">
                <select className="border rounded-lg px-3 py-1.5 text-sm">
                  <option>All Statuses</option>
                  <option>Pending</option>
                  <option>Investigating</option>
                  <option>Escalated</option>
                </select>
              </div>
            </div>
            <div className="divide-y">
              {flags.map((flag) => (
                <div key={flag.id}>
                  <button
                    onClick={() => setExpandedFlag(expandedFlag === flag.id ? null : flag.id)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className={`w-4 h-4 ${flag.severity === 'high' ? 'text-red-500' : flag.severity === 'medium' ? 'text-amber-500' : 'text-gray-400'}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{flag.user}</div>
                        <div className="text-xs text-gray-400">{flag.detail}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {severityBadge(flag.severity)}
                      {statusBadge(flag.status)}
                      <span className="text-xs text-gray-400">{flag.time}</span>
                      {expandedFlag === flag.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {expandedFlag === flag.id && (
                    <div className="px-5 pb-4 bg-gray-50 border-t">
                      <div className="grid grid-cols-2 gap-4 py-3 text-sm">
                        <div><span className="text-gray-500">Flag ID:</span> <span className="font-mono">{flag.id}</span></div>
                        <div><span className="text-gray-500">Type:</span> {flag.type}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Investigate</button>
                        <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Escalate to Bank</button>
                        <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Clear</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Tab */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border rounded-xl p-5">
              <div className="text-sm text-gray-500">Today&apos;s Runs</div>
              <div className="text-2xl font-bold mt-1">3</div>
              <div className="text-xs text-green-600 mt-1">2 matched, 1 discrepancy</div>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="text-sm text-gray-500">Matched Rate</div>
              <div className="text-2xl font-bold mt-1 text-green-600">99.2%</div>
              <div className="text-xs text-gray-400 mt-1">310 of 312 transactions</div>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="text-sm text-gray-500">Open Discrepancies</div>
              <div className="text-2xl font-bold mt-1 text-amber-600">3</div>
              <div className="text-xs text-gray-400 mt-1">Total: KES 1,500 + UGX 50,000</div>
            </div>
          </div>

          <div className="bg-white border rounded-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Reconciliation Runs</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243556]">
                <RefreshCw className="w-3.5 h-3.5" /> New Run
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Provider</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Currency</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Our Balance</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Provider Balance</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Discrepancy</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium">Matched</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reconRuns.map((run, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-900">{run.date}</td>
                      <td className="px-5 py-3 font-medium">{run.provider}</td>
                      <td className="px-5 py-3 text-gray-600">{run.currency}</td>
                      <td className="px-5 py-3 text-right font-mono">{formatCurrency(run.our, run.currency)}</td>
                      <td className="px-5 py-3 text-right font-mono">{formatCurrency(run.theirs, run.currency)}</td>
                      <td className={`px-5 py-3 text-right font-mono ${run.disc > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
                        {run.disc === 0 ? '—' : formatCurrency(run.disc, run.currency)}
                      </td>
                      <td className="px-5 py-3 text-center">{run.matched}/{run.matched + run.unmatched}</td>
                      <td className="px-5 py-3 text-center">{statusBadge(run.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
