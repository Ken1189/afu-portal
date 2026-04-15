'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Play } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  video_url?: string;
  thumbnail_url: string;
  is_featured: boolean;
  orientation?: 'horizontal' | 'vertical';
}

// Default video — admin can change in /admin/settings/videos
const DEFAULT_VIDEO: VideoItem = {
  id: 'default',
  title: 'See AFU In Action',
  description: 'Africa\'s integrated agriculture platform — financing, inputs, processing, offtake, and training across 20 countries.',
  youtube_url: 'https://www.youtube.com/shorts/hjulq0aToQQ',
  thumbnail_url: '',
  is_featured: true,
  orientation: 'vertical',
};

/**
 * Converts any YouTube URL (watch, shorts, youtu.be) to an embed URL.
 * Returns null for invalid URLs.
 */
function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;
  if (url.includes('/embed/')) return url;
  return null;
}

function isShorts(url: string): boolean {
  return /youtube\.com\/shorts\//.test(url);
}

export default function HomepageVideo() {
  const [video, setVideo] = useState<VideoItem>(DEFAULT_VIDEO);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_config')
      .select('value')
      .eq('key', 'video_section')
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.value) return;
        try {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (!Array.isArray(parsed) || parsed.length === 0) return;
          // Prefer featured; fall back to first with a valid source
          const hasSource = (v: VideoItem) => v.youtube_url || v.video_url;
          const featured = parsed.find((v: VideoItem) => v.is_featured && hasSource(v));
          const first = parsed.find((v: VideoItem) => hasSource(v));
          const chosen = featured || first;
          if (chosen) setVideo(chosen);
        } catch {
          // JSON parse failed — keep default
        }
      });
  }, []);

  // Determine video source and orientation
  const isUploaded = !!video.video_url;
  const embedUrl = isUploaded ? null : toEmbedUrl(video.youtube_url);

  if (!isUploaded && !embedUrl) return null;

  // Orientation logic:
  // - Uploaded file: use orientation field (default horizontal)
  // - YouTube: auto-detect (Shorts = vertical)
  const vertical = isUploaded
    ? video.orientation === 'vertical'
    : isShorts(video.youtube_url);

  return (
    <section id="section-video" className="py-20 bg-gradient-to-b from-white via-[#f8fdf6] to-white relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5DB347]/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>
            Watch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4">
            {video.title}
          </h2>
          {video.description && (
            <p className="text-gray-500 max-w-2xl mx-auto">
              {video.description}
            </p>
          )}
        </div>

        <div className={`mx-auto ${vertical ? 'max-w-[360px]' : 'max-w-4xl'}`}>
          <div
            className={`relative rounded-2xl overflow-hidden shadow-2xl bg-black ${
              vertical ? 'aspect-[9/16]' : 'aspect-video'
            }`}
          >
            {playing ? (
              isUploaded ? (
                <video
                  src={video.video_url}
                  controls
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              ) : (
                <iframe
                  src={`${embedUrl}?autoplay=1&rel=0`}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 w-full h-full group"
                aria-label={`Play ${video.title}`}
              >
                {video.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : isUploaded ? (
                  // Show first frame of uploaded video as poster
                  <video
                    src={video.video_url}
                    className="absolute inset-0 w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#2D4A7A] to-[#5DB347]" />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-[#1B2A4A] ml-1" fill="#1B2A4A" />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
