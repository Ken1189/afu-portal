'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Home,
  CloudSun,
  TrendingUp,
  Bot,
  Camera,
  GraduationCap,
  Layers,
  UsersRound,
  Rocket,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Tour Steps Data ──────────────────────────────────────────────────────────

interface TourStep {
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  title: string;
  description: string;
  tip: string;
  gradient: string;
  extra?: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: Sprout,
    emoji: '\u{1F331}',
    title: 'Welcome to Mkulima Hub',
    description:
      'Welcome to your farm command center! This quick tour will show you everything you need to get started.',
    tip: '"Mkulima" means "farmer" in Swahili',
    gradient: 'from-[#5DB347] to-[#3d8a2e]',
  },
  {
    icon: Home,
    emoji: '\u{1F3E0}',
    title: 'Your Farm Dashboard',
    description:
      "This is your home base. See your farm's health, weather, and tasks at a glance.",
    tip: 'Check here every morning for daily recommendations',
    gradient: 'from-[#1B2A4A] to-[#2d4470]',
  },
  {
    icon: CloudSun,
    emoji: '\u2600\uFE0F',
    title: 'Weather Forecasts',
    description:
      'Get 7-day weather forecasts specific to your region. Plan irrigation and spraying around the weather.',
    tip: 'Weather updates refresh every 6 hours',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    icon: TrendingUp,
    emoji: '\u{1F4C8}',
    title: 'Market Prices',
    description:
      'Check real-time commodity prices before you sell. Know what your crops are worth in different markets.',
    tip: 'Set price alerts to get notified when prices hit your target',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Bot,
    emoji: '\u{1F916}',
    title: 'AI Farm Assistant',
    description:
      'Your 24/7 farming advisor. Ask about pests, diseases, planting times, or any farming question.',
    tip: 'Try asking "What should I do today?" for personalized daily tasks',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Camera,
    emoji: '\u{1F4F8}',
    title: 'Crop Doctor',
    description:
      'Take a photo of a sick plant and get instant diagnosis. Identifies diseases, pests, and nutrient deficiencies.',
    tip: 'Works with maize, cassava, rice, beans, and 50+ other crops',
    gradient: 'from-rose-500 to-red-600',
  },
  {
    icon: GraduationCap,
    emoji: '\u{1F393}',
    title: 'Training Hub',
    description:
      'Complete courses to level up your farming skills AND unlock new platform features.',
    tip: 'Start with "Farm Basics" to unlock the Farm Journal and Crop Calendar',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Layers,
    emoji: '\u{1F33F}',
    title: 'Your Tier Progress',
    description:
      'You start as a Seedling. Complete training courses to unlock higher tiers with more powerful tools.',
    tip: 'Each tier unlocks powerful new tools like financing, insurance, and marketplace access',
    gradient: 'from-[#5DB347] to-[#1B2A4A]',
    extra: (
      <div className="flex items-center justify-center gap-3 mt-3 px-2">
        {[
          { emoji: '\u{1F331}', name: 'Seedling' },
          { emoji: '\u{1FAB4}', name: 'Sprout' },
          { emoji: '\u{1F33E}', name: 'Growth' },
          { emoji: '\u{1F33D}', name: 'Harvest' },
          { emoji: '\u{1F31F}', name: 'Pioneer' },
        ].map((tier) => (
          <div key={tier.name} className="flex flex-col items-center gap-1">
            <span className="text-xl">{tier.emoji}</span>
            <span className="text-[10px] font-medium text-gray-500">{tier.name}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: UsersRound,
    emoji: '\u{1F465}',
    title: 'Cooperatives',
    description:
      'Join or create a farming cooperative to access bulk pricing, shared equipment, and collective bargaining power.',
    tip: 'Cooperatives get up to 40% better input prices',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Rocket,
    emoji: '\u{1F680}',
    title: "You're Ready!",
    description:
      "That's everything to get started! Your first mission: check today's weather and explore the Training Hub.",
    tip: 'You can replay this tour anytime from the help button',
    gradient: 'from-[#5DB347] to-emerald-600',
    extra: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
        {[
          { emoji: '\u2600\uFE0F', label: 'Weather', href: '/farm/weather' },
          { emoji: '\u{1F393}', label: 'Training', href: '/farm/training' },
          { emoji: '\u{1F916}', label: 'AI Assistant', href: '/farm/assistant' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-[#EBF7E5] rounded-xl p-3 text-center"
          >
            <span className="text-xl block mb-1">{item.emoji}</span>
            <span className="text-xs font-semibold text-[#1B2A4A]">{item.label}</span>
          </div>
        ))}
      </div>
    ),
  },
];

// ── Animation Variants ─────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 40,
    transition: { duration: 0.2 },
  },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

// ── Props ────────────────────────────────────────────────────────────────────

interface GuidedTourProps {
  onComplete: () => void;
  userId?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export function GuidedTour({ onComplete, userId }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const StepIcon = step.icon;

  const completeTour = useCallback(async () => {
    // Persist to localStorage
    localStorage.setItem('afu_farm_tour_completed', 'true');

    // Try to persist to Supabase
    if (userId) {
      try {
        const supabase = createClient();
        await supabase
          .from('farmer_tiers')
          .update({ onboarding_tour_completed: true })
          .eq('user_id', userId);
      } catch {
        // Silently fail — localStorage is the primary store
      }
    }

    onComplete();
  }, [onComplete, userId]);

  const goNext = () => {
    if (isLast) {
      completeTour();
      return;
    }
    setDirection(1);
    setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (isFirst) return;
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const skipTour = () => {
    completeTour();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        {/* Tour Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* ── Green Gradient Header ── */}
          <div className={`bg-gradient-to-r ${step.gradient} px-6 pt-6 pb-10 text-white relative`}>
            {/* Skip button */}
            <button
              onClick={skipTour}
              className="absolute top-4 right-4 flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium transition-colors bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Skip Tour
            </button>

            {/* Step counter */}
            <div className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </div>

            {/* Icon circle */}
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm"
            >
              <StepIcon className="w-8 h-8 text-white" />
            </motion.div>

            {/* Title with emoji */}
            <h2 className="text-xl font-bold leading-tight">
              {step.emoji} {step.title}
            </h2>
          </div>

          {/* ── Content ── */}
          <div className="px-6 pt-5 pb-6 -mt-4 bg-white rounded-t-3xl relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="min-h-[160px]"
              >
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Tip box */}
                <div className="flex items-start gap-2.5 bg-[#EBF7E5] rounded-xl p-3 mb-3">
                  <Sparkles className="w-4 h-4 text-[#5DB347] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#1B2A4A] font-medium leading-relaxed">
                    {step.tip}
                  </p>
                </div>

                {/* Extra content (tier emojis, quick-access grid) */}
                {step.extra}
              </motion.div>
            </AnimatePresence>

            {/* ── Progress Dots ── */}
            <div className="flex items-center justify-center gap-1.5 mt-4 mb-5">
              {TOUR_STEPS.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentStep ? 1 : -1);
                    setCurrentStep(idx);
                  }}
                  className={`rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 h-2 bg-[#5DB347]'
                      : idx < currentStep
                        ? 'w-2 h-2 bg-[#5DB347]/40'
                        : 'w-2 h-2 bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* ── Navigation Buttons ── */}
            <div className="flex items-center gap-3">
              {/* Back button */}
              {!isFirst ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Next / Start Farming button */}
              <motion.button
                onClick={goNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                  isLast
                    ? 'bg-gradient-to-r from-[#5DB347] to-emerald-500 shadow-[#5DB347]/30'
                    : 'bg-[#5DB347] hover:bg-[#4da33c] shadow-[#5DB347]/20'
                }`}
              >
                {isLast ? (
                  <>
                    <Rocket className="w-4 h-4" />
                    Start Farming!
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
