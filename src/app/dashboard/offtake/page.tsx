'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  DollarSign,
  Truck,
  Calendar,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Globe2,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useContracts } from '@/lib/supabase/use-contracts';
import { adaptContract } from '@/lib/data/adapters';
import { contracts as mockContracts, type OfftakeContract } from '@/lib/data/contracts';

type StatusFilter = 'all' | OfftakeContract['status'];

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType; dot: string }> = {
  active: { label: 'Active', cls: 'bg-green-50 text-green-700', icon: CheckCircle2, dot: 'bg-green-500' },
  'pending-renewal': { label: 'Pending Renewal', cls: 'bg-amber-50 text-amber-700', icon: Clock, dot: 'bg-amber-500' },
  completed: { label: 'Completed', cls: 'bg-blue-50 text-blue-700', icon: CheckCircle2, dot: 'bg-blue-500' },
};

function formatPeriod(period: { start: string; end: string }) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return `${fmt(period.start)} — ${fmt(period.end)}`;
}

export default function OfftakePage() {
  const { contracts: liveContracts, loading: contractsLoading } = useContracts();
  const contracts: OfftakeContract[] = liveContracts.length > 0 ? liveContracts.map(adaptContract) as OfftakeContract[] : mockContracts;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = statusFilter === 'all'
    ? contracts
    : contracts.filter((c) => c.status === statusFilter);

  const activeContracts = contracts.filter((c) => c.status === 'active').length;
  const totalVolume = contracts.reduce((sum, c) => sum + c.volume, 0);
  const totalValue = contracts.reduce((sum, c) => sum + c.volume * c.pricePerKg, 0);
  const avgDelivered = contracts
    .filter((c) => c.status === 'active' || c.status === 'completed')
    .reduce((sum, c) => sum + c.deliveredPercentage, 0) /
    Math.max(contracts.filter((c) => c.status === 'active' || c.status === 'completed').length, 1);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Offtake Contracts</h1>
        <p className="text-gray-500 text-sm mt-1">
          View your guaranteed buyer contracts, track deliveries, and submit harvest data
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Contracts', value: String(activeContracts), icon: ShieldCheck, color: 'text-teal', bg: 'bg-teal/10' },
          { label: 'Total Volume', value: `${(totalVolume / 1000).toFixed(0)}T`, icon: Package, color: 'text-navy', bg: 'bg-navy/5' },
          { label: 'Contract Value', value: `$${(totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-gold', bg: 'bg-gold/10' },
          { label: 'Avg. Delivered', value: `${avgDelivered.toFixed(0)}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all' as StatusFilter, label: 'All Contracts', count: contracts.length },
          { key: 'active' as StatusFilter, label: 'Active', count: contracts.filter((c) => c.status === 'active').length },
          { key: 'pending-renewal' as StatusFilter, label: 'Pending Renewal', count: contracts.filter((c) => c.status === 'pending-renewal').length },
          { key: 'completed' as StatusFilter, label: 'Completed', count: contracts.filter((c) => c.status === 'completed').length },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === f.key
                ? 'bg-teal text-white'
                : 'border border-gray-200 text-gray-600 hover:border-teal/30 hover:text-teal'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filtered.map((contract) => {
          const status = statusConfig[contract.status] || statusConfig.active;
          const StatusIcon = status.icon;
          const isExpanded = expanded === contract.id;
          const contractValue = contract.volume * contract.pricePerKg;

          return (
            <motion.div
              key={contract.id}
              layout
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Contract Row */}
              <div
                className="p-5 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : contract.id)}
              >
                {/* Status dot */}
                <div className={`w-3 h-3 rounded-full shrink-0 ${status.dot}`} />

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-navy text-sm truncate">{contract.buyer}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {contract.id} &middot; {contract.crop} &middot; {(contract.volume / 1000).toFixed(0)}T
                  </p>
                </div>

                {/* Price & Delivery */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-navy">{contract.currency} {contract.pricePerKg.toFixed(2)}/kg</p>
                    <p className="text-xs text-gray-400">Grade {contract.qualityGrade}</p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Delivered</span>
                      <span className="text-xs font-semibold text-navy">{contract.deliveredPercentage}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 bg-teal rounded-full transition-all"
                        style={{ width: `${contract.deliveredPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <ArrowRight className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-gray-100 p-5 bg-cream/50"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      { label: 'Contract Value', value: `${contract.currency} ${contractValue.toLocaleString()}`, icon: DollarSign },
                      { label: 'Total Volume', value: `${(contract.volume / 1000).toFixed(1)} tonnes`, icon: Package },
                      { label: 'Delivery Period', value: formatPeriod(contract.contractPeriod), icon: Calendar },
                      { label: 'Incoterm', value: contract.incoterm, icon: Truck },
                    ].map((detail) => {
                      const Icon = detail.icon;
                      return (
                        <div key={detail.label} className="flex items-start gap-2">
                          <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">{detail.label}</p>
                            <p className="text-sm font-medium text-navy">{detail.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Globe2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Origin Country</p>
                        <p className="text-sm font-medium text-navy">{contract.country}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Quality Grade</p>
                        <p className="text-sm font-medium text-navy">Grade {contract.qualityGrade}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Delivered Volume</p>
                        <p className="text-sm font-medium text-navy">{(contract.deliveredVolume / 1000).toFixed(1)}T of {(contract.volume / 1000).toFixed(1)}T</p>
                      </div>
                    </div>
                    {contract.nextDeliveryDate && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Next Delivery</p>
                          <p className="text-sm font-medium text-navy">
                            {new Date(contract.nextDeliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Member Info */}
                  <div className="bg-white rounded-lg p-3 mb-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Farmer / Member</p>
                    <p className="text-sm font-medium text-navy">{contract.memberName}</p>
                    <p className="text-xs text-gray-400">{contract.memberId}</p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button className="flex items-center gap-2 text-sm text-teal font-medium hover:text-teal-dark transition-colors px-4 py-2 rounded-lg hover:bg-teal/5">
                      <Eye className="w-4 h-4" />
                      View Full Contract
                    </button>
                    <button className="flex items-center gap-2 text-sm text-navy font-medium hover:text-teal transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
                      <Truck className="w-4 h-4" />
                      Log Delivery
                    </button>
                    <button className="flex items-center gap-2 text-sm text-navy font-medium hover:text-teal transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
                      <FileText className="w-4 h-4" />
                      Download PDF
                    </button>
                    {contract.status === 'pending-renewal' && (
                      <button className="flex items-center gap-2 text-sm text-amber-600 font-medium hover:text-amber-700 transition-colors px-4 py-2 rounded-lg hover:bg-amber-50">
                        <RefreshCw className="w-4 h-4" />
                        Renew Contract
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No contracts match your filter</p>
        </div>
      )}
    </div>
  );
}
