'use client';

const LEGEND_ITEMS = [
  { color: '#5DB347', label: 'Healthy Farm (>70)' },
  { color: '#F59E0B', label: 'Needs Attention (40-70)' },
  { color: '#EF4444', label: 'At Risk (<40)' },
  { color: '#3B82F6', label: 'Equipment' },
  { color: '#8B5CF6', label: 'Cooperative' },
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
        Legend
      </p>
      <div className="space-y-1.5">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-[#1B2A4A] font-medium whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
