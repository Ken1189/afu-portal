'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface AdData {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  target_url: string | null;
  placement_type: string;
  creative_type: string;
}

interface AdSlotProps {
  page: string;
  slot: string;
  country?: string;
  className?: string;
}

/**
 * Universal ad placement component.
 * Fetches an ad from the serve API, renders the appropriate format,
 * and tracks impressions/clicks automatically.
 *
 * Renders nothing if no qualifying ad exists.
 */
export default function AdSlot({ page, slot, country, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [tracked, setTracked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch ad on mount
  useEffect(() => {
    const params = new URLSearchParams({ page, slot });
    if (country) params.set('country', country);

    fetch(`/api/ads/serve?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ad) setAd(data.ad);
      })
      .catch(() => {}); // Silent fail — page works fine without ads
  }, [page, slot, country]);

  // Track impression when ad enters viewport
  const trackImpression = useCallback(() => {
    if (!ad || tracked) return;
    setTracked(true);

    fetch('/api/ads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ad_id: ad.id,
        event_type: 'impression',
        page,
        placement_slot: slot,
        country_code: country,
      }),
    }).catch(() => {});
  }, [ad, tracked, page, slot, country]);

  useEffect(() => {
    if (!ad || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackImpression();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ad, trackImpression]);

  // Track click
  const handleClick = () => {
    if (!ad) return;

    fetch('/api/ads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ad_id: ad.id,
        event_type: 'click',
        page,
        placement_slot: slot,
        country_code: country,
      }),
    }).catch(() => {});
  };

  if (!ad) return null;

  // ─── Banner Layout ───
  if (slot === 'banner-top' || slot === 'banner-mid' || ad.placement_type === 'banner') {
    return (
      <div ref={ref} className={`relative rounded-xl overflow-hidden ${className}`}>
        <a
          href={ad.target_url || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="block relative group"
        >
          {ad.image_url ? (
            <div className="relative w-full h-[120px] sm:h-[160px] md:h-[200px]">
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover"
                sizes="100vw"
                quality={75}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-lg font-bold">{ad.title}</div>
                {ad.description && <div className="text-sm opacity-80 max-w-md">{ad.description}</div>}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#1B2A4A] to-[#243556] p-6 text-white">
              <div className="text-lg font-bold">{ad.title}</div>
              {ad.description && <div className="text-sm opacity-70 mt-1">{ad.description}</div>}
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/30 rounded text-[10px] text-white/60 backdrop-blur-sm">
            Sponsored
          </div>
        </a>
      </div>
    );
  }

  // ─── Sidebar Layout ───
  if (slot === 'sidebar' || ad.placement_type === 'sidebar') {
    return (
      <div ref={ref} className={`rounded-xl border overflow-hidden ${className}`}>
        <a
          href={ad.target_url || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="block group"
        >
          {ad.image_url && (
            <div className="relative w-full h-[180px]">
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover"
                sizes="300px"
                quality={75}
                loading="lazy"
              />
            </div>
          )}
          <div className="p-3">
            <div className="text-sm font-semibold text-gray-900 group-hover:text-[#5DB347] transition-colors">{ad.title}</div>
            {ad.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{ad.description}</div>}
            <div className="text-[10px] text-gray-300 mt-2">Sponsored</div>
          </div>
        </a>
      </div>
    );
  }

  // ─── Featured Product Layout ───
  if (slot === 'featured' || ad.placement_type === 'featured-product') {
    return (
      <div ref={ref} className={`relative rounded-xl border overflow-hidden group ${className}`}>
        <a
          href={ad.target_url || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="block"
        >
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-[#5DB347] text-white text-[10px] font-semibold rounded-full">
            Featured
          </div>
          {ad.image_url && (
            <div className="relative w-full h-[200px]">
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={75}
                loading="lazy"
              />
            </div>
          )}
          <div className="p-4">
            <div className="font-semibold text-gray-900">{ad.title}</div>
            {ad.description && <div className="text-sm text-gray-500 mt-1 line-clamp-2">{ad.description}</div>}
          </div>
        </a>
      </div>
    );
  }

  // ─── Sponsored Content Layout ───
  return (
    <div ref={ref} className={`rounded-xl border bg-white overflow-hidden ${className}`}>
      <a
        href={ad.target_url || '#'}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block p-5 group"
      >
        <div className="flex items-start gap-4">
          {ad.image_url && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover"
                sizes="64px"
                quality={75}
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-[#5DB347] font-semibold uppercase tracking-wider mb-1">Sponsored</div>
            <div className="font-semibold text-gray-900 group-hover:text-[#5DB347] transition-colors">{ad.title}</div>
            {ad.description && <div className="text-sm text-gray-500 mt-1 line-clamp-2">{ad.description}</div>}
          </div>
        </div>
      </a>
    </div>
  );
}
