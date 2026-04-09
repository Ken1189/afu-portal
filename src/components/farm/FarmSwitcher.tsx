'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, Plus, Wheat } from 'lucide-react';
import { useFarm } from '@/lib/farm-context';

export default function FarmSwitcher() {
  const { farms, activeFarm, setActiveFarmId, loading } = useFarm();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="px-3 py-2 animate-pulse">
        <div className="h-9 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // No farms yet — show prompt
  if (farms.length === 0) {
    return (
      <div className="px-3 py-2">
        <Link
          href="/farm/farms"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-[#5DB347]/10 text-[#5DB347] hover:bg-[#5DB347]/20 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Your First Farm
        </Link>
      </div>
    );
  }

  // Single farm — show name, no dropdown
  if (farms.length === 1) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-gray-50">
          <Wheat className="w-4 h-4 text-[#5DB347]" />
          <span className="font-medium text-navy truncate">{activeFarm?.name}</span>
          {activeFarm?.country && (
            <span className="ml-auto text-[10px] text-gray-400 shrink-0">{activeFarm.country}</span>
          )}
        </div>
      </div>
    );
  }

  // Multiple farms — dropdown
  return (
    <div className="px-3 py-2 relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <Wheat className="w-4 h-4 text-[#5DB347] shrink-0" />
        <span className="font-medium text-navy truncate flex-1 text-left">
          {activeFarm?.name || 'Select farm'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-56 overflow-y-auto">
          {farms.map((farm) => (
            <button
              key={farm.id}
              onClick={() => { setActiveFarmId(farm.id); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                farm.id === activeFarm?.id
                  ? 'bg-[#5DB347]/10 text-[#5DB347] font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Wheat className="w-4 h-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{farm.name}</p>
                {farm.region && (
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {farm.region}{farm.country ? `, ${farm.country}` : ''}
                  </p>
                )}
              </div>
              {farm.hectares && (
                <span className="text-[10px] text-gray-400 shrink-0">{farm.hectares}ha</span>
              )}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <Link
              href="/farm/farms"
              onClick={() => setOpen(false)}
              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-[#5DB347] hover:bg-[#5DB347]/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Manage Farms
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
