'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface VideoCardProps {
  title: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl?: string;
  size?: 'large' | 'small';
}

// YouTube URL (watch, shorts, youtu.be, embed) → embed URL
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

function isYouTube(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

function isShorts(url: string): boolean {
  return /youtube\.com\/shorts\//.test(url);
}

export default function VideoCard({
  title,
  duration,
  thumbnailUrl,
  videoUrl,
  size = 'large',
}: VideoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    if (!videoUrl) {
      alert('Video coming soon — check back after launch!');
      return;
    }
    setModalOpen(true);
  };

  const isYT = videoUrl ? isYouTube(videoUrl) : false;
  const embedUrl = videoUrl && isYT ? toEmbedUrl(videoUrl) : null;
  const vertical = videoUrl ? isShorts(videoUrl) : false;

  return (
    <>
      {size === 'small' ? (
        <motion.button
          onClick={handleClick}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 bg-white rounded-3xl p-3 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-[#5DB347]/20 w-full text-left group cursor-pointer"
        >
          <div className="relative w-28 h-20 rounded-2xl overflow-hidden shrink-0">
            <Image src={thumbnailUrl} alt={title} fill className="object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.15 }}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
              >
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[#1B2A4A] text-sm leading-tight mb-1 truncate">{title}</h4>
            <span className="text-xs text-gray-400 font-medium">{duration}</span>
          </div>
        </motion.button>
      ) : (
        <motion.button
          onClick={handleClick}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3 }}
          className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group cursor-pointer block"
        >
          <Image src={thumbnailUrl} alt={title} fill className="object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-[#5DB347]/30"
              style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
            >
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
          </div>
          <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
            <h4 className="text-white font-bold text-base">{title}</h4>
            <span className="text-white/70 text-sm">{duration}</span>
          </div>
        </motion.button>
      )}

      {/* Video player modal */}
      <AnimatePresence>
        {modalOpen && videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setModalOpen(false)}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl ${
                vertical ? 'max-w-[400px] aspect-[9/16]' : 'max-w-5xl aspect-video'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {isYT && embedUrl ? (
                <iframe
                  src={`${embedUrl}?autoplay=1&rel=0`}
                  title={title}
                  className="absolute inset-0 w-full h-full"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
