'use client';

import { motion } from 'framer-motion';

interface VideoCardProps {
  title: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl?: string;
  size?: 'large' | 'small';
}

export default function VideoCard({
  title,
  duration,
  thumbnailUrl,
  videoUrl,
  size = 'large',
}: VideoCardProps) {
  const handleClick = () => {
    if (videoUrl) {
      // Future: open modal with YouTube embed
      window.open(videoUrl, '_blank');
    } else {
      alert('Video coming soon — check back after launch!');
    }
  };

  if (size === 'small') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 bg-white rounded-3xl p-3 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-[#5DB347]/20 w-full text-left group cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative w-28 h-20 rounded-2xl overflow-hidden shrink-0">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
            >
              <svg
                className="w-4 h-4 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
          </div>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[#1B2A4A] text-sm leading-tight mb-1 truncate">
            {title}
          </h4>
          <span className="text-xs text-gray-400 font-medium">{duration}</span>
        </div>
      </motion.button>
    );
  }

  // Large card
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group cursor-pointer block"
    >
      {/* Background image */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

      {/* Centered play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.15 }}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-[#5DB347]/30"
          style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
        >
          <svg
            className="w-7 h-7 text-white ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
        <h4 className="text-white font-bold text-base">{title}</h4>
        <span className="text-white/70 text-sm">{duration}</span>
      </div>
    </motion.button>
  );
}
