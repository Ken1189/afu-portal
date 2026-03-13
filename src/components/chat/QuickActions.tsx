'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sprout,
  DollarSign,
  BarChart3,
  GraduationCap,
  Cloud,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
}

const quickActions: QuickAction[] = [
  { label: 'Crop Help', icon: <Sprout className="w-3.5 h-3.5" /> },
  { label: 'Loan Info', icon: <DollarSign className="w-3.5 h-3.5" /> },
  { label: 'Market Prices', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { label: 'Training', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { label: 'Weather', icon: <Cloud className="w-3.5 h-3.5" /> },
  { label: 'Documents', icon: <FileText className="w-3.5 h-3.5" /> },
  { label: 'Help', icon: <HelpCircle className="w-3.5 h-3.5" /> },
];

interface QuickActionsProps {
  onAction: (label: string) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -120 : 120, behavior: 'smooth' });
  };

  return (
    <div className="relative flex items-center">
      {/* Left scroll arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 w-6 h-6 flex items-center justify-center bg-white/90 rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-navy"
          aria-label="Scroll quick actions left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide px-1 py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(action.label)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-navy hover:bg-teal-light hover:border-teal/30 hover:text-teal-dark transition-colors duration-150"
          >
            {action.icon}
            {action.label}
          </motion.button>
        ))}
      </div>

      {/* Right scroll arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 w-6 h-6 flex items-center justify-center bg-white/90 rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-navy"
          aria-label="Scroll quick actions right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
