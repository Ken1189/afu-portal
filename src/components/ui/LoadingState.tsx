'use client';

import { SkeletonCard } from './Skeleton';

export default function LoadingState({ type = 'cards' }: { type?: 'cards' | 'table' | 'chart' }) {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 animate-pulse">
        <div className="border-b border-gray-100 p-4 flex gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-200 rounded flex-1" />)}
        </div>
        {[1,2,3,4,5].map(r => (
          <div key={r} className="border-b border-gray-50 p-4 flex gap-4">
            {[1,2,3,4].map(c => <div key={c} className="h-3 bg-gray-100 rounded flex-1" />)}
          </div>
        ))}
      </div>
    );
  }
  if (type === 'chart') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-48 bg-gray-100 rounded-lg" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
      {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
    </div>
  );
}
