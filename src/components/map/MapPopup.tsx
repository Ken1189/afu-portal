'use client';

import Link from 'next/link';
import type { MapDataPoint } from './FarmMap';

/** Health bar component for farm popups. */
function HealthBar({ score }: { score: number }) {
  const color =
    score > 70 ? '#5DB347' : score >= 40 ? '#F59E0B' : '#EF4444';
  const label =
    score > 70 ? 'Healthy' : score >= 40 ? 'Needs Attention' : 'At Risk';

  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between text-xs mb-0.5">
        <span className="text-gray-500">Health</span>
        <span style={{ color }} className="font-semibold">
          {score}% &mdash; {label}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface MapPopupProps {
  point: MapDataPoint;
}

export default function MapPopup({ point }: MapPopupProps) {
  // ── Farm popup ──────────────────────────────────────────────
  if (point.type === 'farm') {
    return (
      <div className="font-sans text-sm leading-relaxed min-w-[220px]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base">🌱</span>
          <h3 className="font-bold text-[#1B2A4A] text-sm m-0">
            {point.farmerName || 'Unknown Farmer'}
          </h3>
        </div>

        {point.farmName && (
          <p className="text-xs text-gray-500 mt-0 mb-1">{point.farmName}</p>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
          {point.crop && (
            <>
              <span className="text-gray-500">Crop</span>
              <span className="font-medium text-[#1B2A4A]">{point.crop}</span>
            </>
          )}
          {point.farmSize != null && (
            <>
              <span className="text-gray-500">Size</span>
              <span className="font-medium text-[#1B2A4A]">{point.farmSize} ha</span>
            </>
          )}
          {point.stage && (
            <>
              <span className="text-gray-500">Stage</span>
              <span className="font-medium text-[#1B2A4A] capitalize">{point.stage}</span>
            </>
          )}
          {point.country && (
            <>
              <span className="text-gray-500">Country</span>
              <span className="font-medium text-[#1B2A4A]">{point.country}</span>
            </>
          )}
        </div>

        {point.healthScore != null && <HealthBar score={point.healthScore} />}

        {(point.loanAmount != null || point.loanStatus) && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-0.5">Loan Info</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
              {point.loanAmount != null && (
                <>
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-[#1B2A4A]">
                    ${point.loanAmount.toLocaleString()}
                  </span>
                </>
              )}
              {point.loanStatus && (
                <>
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-[#1B2A4A] capitalize">
                    {point.loanStatus}
                  </span>
                </>
              )}
              {point.repaidPercent != null && (
                <>
                  <span className="text-gray-500">Repaid</span>
                  <span className="font-medium text-[#1B2A4A]">
                    {point.repaidPercent}%
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {point.slug && (
          <Link
            href={`/farmers/${point.slug}`}
            className="inline-block mt-2.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white no-underline"
            style={{ backgroundColor: '#5DB347' }}
          >
            View Profile &rarr;
          </Link>
        )}
      </div>
    );
  }

  // ── Equipment popup ─────────────────────────────────────────
  if (point.type === 'equipment') {
    return (
      <div className="font-sans text-sm leading-relaxed min-w-[220px]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base">🔧</span>
          <h3 className="font-bold text-[#1B2A4A] text-sm m-0">
            {point.equipmentName || 'Equipment'}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
          {point.equipmentType && (
            <>
              <span className="text-gray-500">Type</span>
              <span className="font-medium text-[#1B2A4A]">{point.equipmentType}</span>
            </>
          )}
          {point.dailyRate != null && (
            <>
              <span className="text-gray-500">Daily Rate</span>
              <span className="font-medium text-[#1B2A4A]">
                ${point.dailyRate}/day
              </span>
            </>
          )}
          {point.equipmentStatus && (
            <>
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-[#1B2A4A] capitalize">
                {point.equipmentStatus}
              </span>
            </>
          )}
          {point.country && (
            <>
              <span className="text-gray-500">Location</span>
              <span className="font-medium text-[#1B2A4A]">{point.country}</span>
            </>
          )}
        </div>

        <Link
          href="/admin/equipment"
          className="inline-block mt-2.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white no-underline"
          style={{ backgroundColor: '#3B82F6' }}
        >
          Book Equipment &rarr;
        </Link>
      </div>
    );
  }

  // ── Cooperative popup ───────────────────────────────────────
  return (
    <div className="font-sans text-sm leading-relaxed min-w-[220px]">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">🏘️</span>
        <h3 className="font-bold text-[#1B2A4A] text-sm m-0">
          {point.cooperativeName || 'Cooperative'}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
        {point.memberCount != null && (
          <>
            <span className="text-gray-500">Members</span>
            <span className="font-medium text-[#1B2A4A]">{point.memberCount}</span>
          </>
        )}
        {point.region && (
          <>
            <span className="text-gray-500">Region</span>
            <span className="font-medium text-[#1B2A4A]">{point.region}</span>
          </>
        )}
        {point.country && (
          <>
            <span className="text-gray-500">Country</span>
            <span className="font-medium text-[#1B2A4A]">{point.country}</span>
          </>
        )}
      </div>

      <Link
        href="/admin/members"
        className="inline-block mt-2.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white no-underline"
        style={{ backgroundColor: '#8B5CF6' }}
      >
        View Details &rarr;
      </Link>
    </div>
  );
}
