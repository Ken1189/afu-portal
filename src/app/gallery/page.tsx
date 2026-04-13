'use client';

import { useState, useEffect, useCallback } from 'react';
import { Camera, X, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  country: string | null;
  photographer: string | null;
  date_taken: string | null;
  tags: string[];
  display_order: number;
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'farming', label: 'Farming' },
  { key: 'events', label: 'Events' },
  { key: 'team', label: 'Team' },
  { key: 'partners', label: 'Partners' },
  { key: 'facilities', label: 'Facilities' },
];

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-gray-100 text-gray-700',
  farming: 'bg-green-100 text-green-700',
  events: 'bg-purple-100 text-purple-700',
  team: 'bg-blue-100 text-blue-700',
  partners: 'bg-amber-100 text-amber-700',
  facilities: 'bg-cyan-100 text-cyan-700',
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('visible', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setItems(data as GalleryItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = activeCategory === 'all'
    ? items
    : items.filter((i) => i.category === activeCategory);

  // Lightbox navigation
  const lightboxIndex = lightboxItem ? filtered.findIndex((i) => i.id === lightboxItem.id) : -1;

  function goNext() {
    if (lightboxIndex < filtered.length - 1) setLightboxItem(filtered[lightboxIndex + 1]);
  }
  function goPrev() {
    if (lightboxIndex > 0) setLightboxItem(filtered[lightboxIndex - 1]);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#1B2A4A]/90 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#5DB347]/20 mb-4">
            <Camera className="w-7 h-7 text-[#5DB347]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Gallery</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            See AFU in action across Africa
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? 'bg-[#5DB347] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No images yet</h3>
            <p className="text-sm text-gray-500">Check back soon for photos from our work across Africa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1B2A4A] mb-1 line-clamp-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general}`}>
                      {item.category}
                    </span>
                    {item.country && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" /> {item.country}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Navigation arrows */}
            {lightboxIndex > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {lightboxIndex < filtered.length - 1 && (
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <div className="relative aspect-[16/10] w-full">
              <Image
                src={lightboxItem.image_url}
                alt={lightboxItem.title}
                fill
                className="object-contain bg-gray-100"
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">{lightboxItem.title}</h2>
              {lightboxItem.description && (
                <p className="text-sm text-gray-600 mb-3">{lightboxItem.description}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400">
                <span className={`font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[lightboxItem.category] || CATEGORY_COLORS.general}`}>
                  {lightboxItem.category}
                </span>
                {lightboxItem.country && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {lightboxItem.country}
                  </span>
                )}
                {lightboxItem.photographer && (
                  <span>Photo: {lightboxItem.photographer}</span>
                )}
                {lightboxItem.date_taken && (
                  <span>{new Date(lightboxItem.date_taken).toLocaleDateString()}</span>
                )}
              </div>
              {lightboxItem.tags && lightboxItem.tags.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {lightboxItem.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
