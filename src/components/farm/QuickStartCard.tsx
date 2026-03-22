'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudSun,
  GraduationCap,
  Bot,
  UserCircle,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    icon: CloudSun,
    title: "Check Today's Weather",
    description: 'See forecasts for your region and plan your day.',
    href: '/farm/weather',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: GraduationCap,
    title: 'Start Farm Basics Course',
    description: 'Unlock new features by completing your first course.',
    href: '/farm/training',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Bot,
    title: 'Ask the AI Assistant',
    description: 'Get personalized farming advice 24/7.',
    href: '/farm/assistant',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
  {
    icon: UserCircle,
    title: 'Set Up Your Farm Profile',
    description: 'Add your farm details for tailored recommendations.',
    href: '/farm',
    color: 'text-[#5DB347]',
    bg: 'bg-[#EBF7E5]',
  },
];

const LS_KEY = 'afu_farm_quickstart_dismissed';

const containerVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginBottom: 20,
    transition: {
      height: { type: 'spring' as const, stiffness: 200, damping: 24 },
      opacity: { duration: 0.3 },
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

export function QuickStartCard() {
  const [dismissed, setDismissed] = useState(true); // default hidden until check

  useEffect(() => {
    const wasDismissed = localStorage.getItem(LS_KEY) === 'true';
    setDismissed(wasDismissed);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(LS_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="px-4 overflow-hidden"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EBF7E5] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#5DB347]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B2A4A]">Getting Started</h3>
                  <p className="text-[11px] text-gray-400">Recommended first steps</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Dismiss getting started"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action cards */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.div key={action.href + action.title} variants={itemVariants}>
                    <Link
                      href={action.href}
                      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1B2A4A] group-hover:text-[#5DB347] transition-colors flex items-center gap-1">
                          {action.title}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#5DB347]" />
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
