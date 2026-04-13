'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Globe2, Users, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─── */
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  cta_text: string;
  cta_link: string;
  display_order: number;
  slide_duration: number;
}

/* ─── Default fallback slide (matches existing hero content) ─── */
const DEFAULT_SLIDE: HeroSlide = {
  id: 'default',
  title: "Let's Grow Together",
  subtitle: 'By farmers, for farmers. Run by Africans, for Africans. We bring the financing, inputs, processing, and guaranteed buyers — you bring the land and the passion. Together, we turn your harvest into real, sustainable income.',
  description: null,
  image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&h=1080&fit=crop',
  cta_text: 'Join Our Farming Family',
  cta_link: '/apply',
  display_order: 0,
  slide_duration: 6000,
};

interface HeroSliderProps {
  /** Member count for the trust badge */
  memberCount?: number;
  /** Badge text override */
  badgeText?: string;
}

export default function HeroSlider({ memberCount = 0, badgeText = 'Active across 20 African countries' }: HeroSliderProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([DEFAULT_SLIDE]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch slides from DB
  useEffect(() => {
    async function fetchSlides() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('visible', true)
          .order('display_order')
          .limit(4);

        if (!error && data && data.length > 0) {
          setSlides(data as HeroSlide[]);
        }
        // If no slides in DB, keep the default fallback
      } catch {
        // Keep default slide on error
      }
    }
    fetchSlides();
  }, []);

  // Auto-advance
  const advance = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const duration = slides[current]?.slide_duration || 5000;
    timerRef.current = setTimeout(advance, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, isPaused, slides, advance]);

  const goTo = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(index);
  };

  const slide = slides[current] || DEFAULT_SLIDE;

  // For the default slide, use special formatting for "Grow Together"
  const isGrowTogether = slide.title.includes('Grow Together');

  return (
    <section
      id="section-hero"
      className="relative min-h-[70vh] md:min-h-[92vh] flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background images with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image_url}
            alt={slide.title}
            fill
            className="object-cover"
            priority={current === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy/80 to-navy/50" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#5DB347]/20 backdrop-blur-sm border border-[#5DB347]/30 text-[#EBF7E5] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-[#5DB347] rounded-full animate-pulse-soft" />
            {badgeText && !badgeText.toLowerCase().includes('phase') ? badgeText : 'Active across 20 African countries'}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '-content'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white mb-6">
                {isGrowTogether ? (
                  <>
                    Let&apos;s{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6ABF4B] to-[#90D87A]">
                      Grow Together
                    </span>
                  </>
                ) : (
                  slide.title
                )}
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
                {slide.subtitle || slide.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={slide.cta_link}
                  className="group text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center gap-2 shadow-lg"
                  style={{ background: '#5DB347' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
                >
                  {slide.cta_text}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="group border-2 border-white/30 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg transition-smooth flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  See How It Works
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-white/70">
              <Globe2 className="w-4 h-4 text-[#5DB347]" />
              <span>20 Countries Active</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-white/70">
              <Users className="w-4 h-4 text-[#5DB347]" />
              <span>{memberCount >= 100 ? `${memberCount.toLocaleString()}+ Farmers` : 'Growing Community'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'w-8 h-2.5 bg-[#5DB347]'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ChevronDown className="w-6 h-6 text-white/50 animate-bounce-slow" />
      </div>
    </section>
  );
}
