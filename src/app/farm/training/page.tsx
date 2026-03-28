'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { TierProgress } from '@/components/farm/TierProgress';
import { FARMER_TIERS, TIER_ORDER, type FarmerTier } from '@/lib/farmer-tiers';

// ── Types ─────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  difficulty: string;
  lesson_count: number;
  tier_unlock: string; // which tier this course unlocks
  slug: string;
  category: string;
}

interface CourseCompletion {
  id: string;
  course_id: string;
  user_id: string;
  completed_at: string;
  course_title: string;
  tier_unlocked: string;
}

// ── Hardcoded Fallback Courses ────────────────────────────────────────────

const FALLBACK_COURSES: Course[] = [
  {
    id: 'fallback-farm-basics',
    title: 'Farm Basics',
    description:
      'Learn essential farming techniques, record keeping, and crop calendar management.',
    duration_hours: 2,
    difficulty: 'Beginner',
    lesson_count: 5,
    tier_unlock: 'sprout',
    slug: 'farm-basics',
    category: 'Foundation',
  },
  {
    id: 'fallback-financial-literacy',
    title: 'Financial Literacy',
    description:
      'Understand agricultural loans, insurance, savings, and mobile money payments.',
    duration_hours: 3,
    difficulty: 'Beginner',
    lesson_count: 5,
    tier_unlock: 'growth',
    slug: 'financial-literacy',
    category: 'Finance',
  },
  {
    id: 'fallback-digital-agriculture',
    title: 'Digital Agriculture',
    description:
      'Master precision farming tools, AI crop diagnosis, and sustainability tracking.',
    duration_hours: 4,
    difficulty: 'Intermediate',
    lesson_count: 5,
    tier_unlock: 'harvest',
    slug: 'digital-agriculture',
    category: 'Technology',
  },
  {
    id: 'fallback-advanced-trading',
    title: 'Advanced Trading',
    description:
      'Learn commodity trading, export procedures, marketplace strategies, and tokenization.',
    duration_hours: 5,
    difficulty: 'Advanced',
    lesson_count: 5,
    tier_unlock: 'pioneer',
    slug: 'advanced-trading',
    category: 'Commerce',
  },
];

// ── Tier → Course Mapping ─────────────────────────────────────────────────

const TIER_COURSE_MAP: Record<string, string> = {
  'farm-basics': 'sprout',
  'financial-literacy': 'growth',
  'digital-agriculture': 'harvest',
  'advanced-trading': 'pioneer',
};

const TIER_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  sprout: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  growth: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  harvest: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  pioneer: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
};

// ── Component ─────────────────────────────────────────────────────────────

export default function TrainingPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [completions, setCompletions] = useState<CourseCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<FarmerTier>('seedling');
  const [celebrateCourse, setCelebrateCourse] = useState<string | null>(null);

  // ── Fetch courses from Supabase, fallback to hardcoded ────────────────

  const fetchCourses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        setCourses(FALLBACK_COURSES);
      } else {
        // Map DB courses to our Course shape, fallback where needed
        const mapped: Course[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description || '',
          duration_hours: Math.round((c.duration_minutes || 120) / 60),
          difficulty: c.difficulty || 'Beginner',
          lesson_count: c.modules_count || 5,
          tier_unlock: TIER_COURSE_MAP[c.category?.toLowerCase().replace(/\s+/g, '-')] || 'sprout',
          slug: c.category?.toLowerCase().replace(/\s+/g, '-') || c.id,
          category: c.category || 'General',
        }));
        setCourses(mapped.length > 0 ? mapped : FALLBACK_COURSES);
      }
    } catch {
      setCourses(FALLBACK_COURSES);
    }
  }, [supabase]);

  // ── Fetch completions ─────────────────────────────────────────────────

  const fetchCompletions = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('course_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (data) {
        setCompletions(data as CourseCompletion[]);
      }
    } catch {
      // Completions table may not exist yet — silent fail
    }
  }, [supabase, user]);

  // ── Determine current tier from completions ───────────────────────────

  useEffect(() => {
    const completedSlugs = new Set(completions.map((c) => c.tier_unlocked));
    let tier: FarmerTier = 'seedling';
    if (completedSlugs.has('pioneer')) tier = 'pioneer';
    else if (completedSlugs.has('harvest')) tier = 'harvest';
    else if (completedSlugs.has('growth')) tier = 'growth';
    else if (completedSlugs.has('sprout')) tier = 'sprout';
    setCurrentTier(tier);
  }, [completions]);

  // ── Initial load ──────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchCompletions()]);
      setLoading(false);
    };
    load();
  }, [fetchCourses, fetchCompletions]);

  // ── Complete a course ─────────────────────────────────────────────────

  const completeCourse = async (course: Course) => {
    if (!user) return;
    setCompleting(course.id);

    try {
      await supabase.from('course_completions').insert({
        course_id: course.id,
        user_id: user.id,
        completed_at: new Date().toISOString(),
        course_title: course.title,
        tier_unlocked: course.tier_unlock,
      });

      setCelebrateCourse(course.id);
      setTimeout(() => setCelebrateCourse(null), 2500);
      await fetchCompletions();
    } catch {
      // Silent fail
    }
    setCompleting(null);
  };

  const isCompleted = (courseId: string) =>
    completions.some((c) => c.course_id === courseId);

  // ── Group courses by tier ─────────────────────────────────────────────

  const coursesByTier = TIER_ORDER.slice(1).map((tier) => ({
    tier,
    config: FARMER_TIERS[tier],
    courses: courses.filter((c) => c.tier_unlock === tier),
  }));

  const completedCourses = completions;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, #5DB347 0%, transparent 50%), radial-gradient(circle at 70% 80%, #449933 0%, transparent 50%)',
          }}
        />
        <div className="relative px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Training Hub
            </h1>
            <p className="text-white/60 text-sm sm:text-base max-w-2xl">
              Complete courses to unlock new tiers and platform features. Each
              course advances your farming journey on the AFU platform.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Tier Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl shadow-black/10"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">{FARMER_TIERS[currentTier].emoji}</span>
            Your Progress
          </h2>
          <TierProgress
            currentTier={currentTier}
            totalXp={completions.length * 100}
            totalCoursesCompleted={completions.length}
          />
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-[#5DB347] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/50 text-sm">Loading courses...</p>
            </div>
          </div>
        )}

        {/* Course Sections by Tier */}
        {!loading &&
          coursesByTier.map(({ tier, config, courses: tierCourses }, sectionIdx) => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + sectionIdx * 0.1 }}
            >
              {/* Tier Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
                  style={{ backgroundColor: `${config.color}25` }}
                >
                  {config.emoji}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Unlock {config.name} Tier
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: `${config.color}25`,
                        color: config.color,
                      }}
                    >
                      {config.description}
                    </span>
                  </h2>
                  <p className="text-white/40 text-xs">
                    Complete the course below to unlock {config.name} features
                  </p>
                </div>
              </div>

              {/* Course Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tierCourses.length === 0 && (
                  <div className="col-span-full bg-white/5 rounded-2xl p-6 text-center border border-white/5">
                    <p className="text-white/30 text-sm">
                      No courses available for this tier yet.
                    </p>
                  </div>
                )}
                {tierCourses.map((course, idx) => {
                  const completed = isCompleted(course.id);
                  const isCelebrating = celebrateCourse === course.id;
                  const tierStyle = TIER_BADGE_STYLES[course.tier_unlock] || TIER_BADGE_STYLES.sprout;
                  const difficultyStyle = DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.Beginner;

                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={`relative group bg-white/[0.07] backdrop-blur-xl rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 ${
                        completed
                          ? 'border-[#5DB347]/30 bg-[#5DB347]/[0.05]'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Celebration Overlay */}
                      <AnimatePresence>
                        {isCelebrating && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-3xl backdrop-blur-sm"
                          >
                            <motion.div
                              initial={{ scale: 0.5, y: 20 }}
                              animate={{ scale: 1, y: 0 }}
                              className="text-center"
                            >
                              <motion.span
                                className="text-5xl block mb-2"
                                animate={{
                                  rotate: [0, -15, 15, -15, 0],
                                  scale: [1, 1.3, 1],
                                }}
                                transition={{ duration: 0.6 }}
                              >
                                {config.emoji}
                              </motion.span>
                              <p className="text-white font-bold text-sm">
                                Course Completed!
                              </p>
                              <p className="text-[#5DB347] text-xs font-semibold mt-1">
                                {config.name} tier unlocked
                              </p>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Completed Badge */}
                      {completed && (
                        <div className="absolute top-3 right-3">
                          <div className="w-7 h-7 rounded-full bg-[#5DB347] flex items-center justify-center shadow-lg shadow-[#5DB347]/30">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Tier Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                        >
                          {config.emoji} Unlocks {config.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyStyle}`}
                        >
                          {course.difficulty}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-[#5DB347] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Meta Row */}
                      <div className="flex items-center gap-3 mb-4 text-white/40 text-[11px]">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {course.duration_hours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          {course.lesson_count} lessons
                        </span>
                      </div>

                      {/* Action Button */}
                      {completed ? (
                        <div className="flex items-center gap-2 text-[#5DB347] text-xs font-semibold">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Completed
                        </div>
                      ) : (
                        <button
                          onClick={() => completeCourse(course)}
                          disabled={completing === course.id || !user}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: 'linear-gradient(135deg, #5DB347, #449933)',
                            boxShadow: '0 4px 15px rgba(93, 179, 71, 0.3)',
                          }}
                        >
                          {completing === course.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Completing...
                            </span>
                          ) : (
                            'Start Course'
                          )}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

        {/* Completed Courses Section */}
        {!loading && completedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#5DB347]/20 flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-[#5DB347]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Completed Courses
                </h2>
                <p className="text-white/40 text-xs">
                  {completedCourses.length} course
                  {completedCourses.length !== 1 ? 's' : ''} completed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedCourses.map((completion, idx) => {
                const tierConfig = FARMER_TIERS[completion.tier_unlocked as FarmerTier];
                return (
                  <motion.div
                    key={completion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-[#5DB347]/[0.07] backdrop-blur-xl rounded-2xl p-4 border border-[#5DB347]/20 flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{
                        backgroundColor: tierConfig ? `${tierConfig.color}20` : '#5DB34720',
                      }}
                    >
                      {tierConfig?.emoji || '✓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {completion.course_title}
                      </p>
                      <p className="text-[10px] text-white/40">
                        Completed{' '}
                        {new Date(completion.completed_at).toLocaleDateString()}
                        {tierConfig && (
                          <span className="ml-1.5" style={{ color: tierConfig.color }}>
                            — {tierConfig.name} unlocked
                          </span>
                        )}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-[#5DB347] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state when not logged in */}
        {!loading && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 text-center"
          >
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Sign in to track your progress
            </h3>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              Create an account or sign in to start courses, earn XP, and unlock
              new tiers on the AFU platform.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
