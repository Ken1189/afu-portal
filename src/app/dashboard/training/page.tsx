'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  ChevronRight,
  Award,
  Download,
  Sparkles,
  Filter,
  CheckCircle2,
  BarChart3,
  Layers,
  Zap,
  TrendingUp,
  Shield,
  Cpu,
  Leaf,
  DollarSign,
  FileCheck,
  Trophy,
} from 'lucide-react';
import { useCourses, type CourseRow } from '@/lib/supabase/use-courses';

/* ------------------------------------------------------------------ */
/*  Course type — UI shape mapped from CourseRow                        */
/* ------------------------------------------------------------------ */

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Farm Management' | 'Export Compliance' | 'Financial Literacy' | 'Crop-Specific' | 'Post-Harvest' | 'Technology';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  modules: number;
  instructor: string;
  rating: number;
  enrollmentCount: number;
  image: string;
  completionRate: number;
  topics: string[];
}

/** Map a Supabase CourseRow → UI Course shape */
function mapCourseRow(row: CourseRow): Course {
  const mins = row.duration_minutes ?? 0;
  const hrs = mins / 60;
  const duration =
    hrs >= 1
      ? `${Number.isInteger(hrs) ? hrs : hrs.toFixed(1)} hour${hrs !== 1 ? 's' : ''}`
      : `${mins} min`;

  const VALID_CATEGORIES = ['Farm Management', 'Export Compliance', 'Financial Literacy', 'Crop-Specific', 'Post-Harvest', 'Technology'] as const;
  const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

  const category = (VALID_CATEGORIES.includes(row.category as typeof VALID_CATEGORIES[number])
    ? row.category
    : 'Farm Management') as Course['category'];

  const difficulty = (VALID_DIFFICULTIES.includes(row.difficulty as typeof VALID_DIFFICULTIES[number])
    ? row.difficulty
    : 'Beginner') as Course['difficulty'];

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category,
    difficulty,
    duration,
    modules: row.modules_count ?? 0,
    instructor: row.instructor ?? 'AFU Instructor',
    rating: row.rating ?? 0,
    enrollmentCount: row.enrollment_count ?? 0,
    image: row.thumbnail_url ?? 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    completionRate: 0,
    topics: row.topics ?? [],
  };
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CategoryFilter =
  | 'All'
  | 'Farm Management'
  | 'Export Compliance'
  | 'Financial Literacy'
  | 'Crop-Specific'
  | 'Post-Harvest'
  | 'Technology';

type DifficultyFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

interface InProgressCourse {
  course: Course;
  completedModules: number;
  totalModules: number;
  timeLeft: string;
}

interface Certificate {
  id: string;
  title: string;
  courseTitle: string;
  dateEarned: string;
  instructor: string;
  credentialId: string;
}

interface Recommendation {
  course: Course;
  reason: string;
}

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' as const,
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 20px 40px -8px rgba(27, 42, 74, 0.15)' as const,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

const fadeSlideVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.2 },
  },
};

const progressBarVariants: Variants = {
  hidden: { width: '0%' as const },
  visible: {
    width: '100%' as const,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const pulseVariants: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Farm Management',
  'Export Compliance',
  'Financial Literacy',
  'Crop-Specific',
  'Post-Harvest',
  'Technology',
];

const DIFFICULTIES: DifficultyFilter[] = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

const categoryIcons: Record<Course['category'], React.ReactNode> = {
  'Farm Management': <Leaf className="w-3.5 h-3.5" />,
  'Export Compliance': <Shield className="w-3.5 h-3.5" />,
  'Financial Literacy': <DollarSign className="w-3.5 h-3.5" />,
  'Crop-Specific': <Layers className="w-3.5 h-3.5" />,
  'Post-Harvest': <Zap className="w-3.5 h-3.5" />,
  'Technology': <Cpu className="w-3.5 h-3.5" />,
};

const difficultyColors: Record<Course['difficulty'], string> = {
  Beginner: 'bg-green-50 text-green-700 ring-green-600/20',
  Intermediate: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Advanced: 'bg-red-50 text-red-700 ring-red-600/20',
};

const categoryColors: Record<Course['category'], string> = {
  'Farm Management': 'bg-[#EBF7E5] text-[#449933]',
  'Export Compliance': 'bg-navy/10 text-navy',
  'Financial Literacy': 'bg-gold/10 text-gold',
  'Crop-Specific': 'bg-green-50 text-green-700',
  'Post-Harvest': 'bg-purple-50 text-purple-700',
  'Technology': 'bg-blue-50 text-blue-700',
};

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* Static mock data for in-progress, certificates, and recommendations
   are derived from the live courses inside the component below. */

const certificates: Certificate[] = [
  {
    id: 'CERT-001',
    title: 'Certified Blueberry Cultivator',
    courseTitle: 'Introduction to Blueberry Cultivation',
    dateEarned: '12 Jan 2026',
    instructor: 'Dr. Chipo Madziva',
    credentialId: 'AFU-BC-2026-0142',
  },
  {
    id: 'CERT-002',
    title: 'Agricultural Finance Fundamentals',
    courseTitle: 'Understanding Agricultural Finance',
    dateEarned: '28 Feb 2026',
    instructor: 'Lebo Molefe',
    credentialId: 'AFU-AF-2026-0210',
  },
  {
    id: 'CERT-003',
    title: 'Financial Record Keeping Professional',
    courseTitle: 'Financial Record Keeping for Farmers',
    dateEarned: '05 Mar 2026',
    instructor: 'Lebo Molefe',
    credentialId: 'AFU-FR-2026-0198',
  },
];

/* ------------------------------------------------------------------ */
/*  Helper Components                                                  */
/* ------------------------------------------------------------------ */

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < full
              ? 'fill-gold text-gold'
              : i === full && hasHalf
                ? 'fill-gold/50 text-gold'
                : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-gray-600">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function ProgressBar({
  value,
  max,
  color = 'bg-[#5DB347]',
  height = 'h-2',
  animate = true,
}: {
  value: number;
  max: number;
  color?: string;
  height?: string;
  animate?: boolean;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
      {animate ? (
        <motion.div
          className={`${height} rounded-full ${color}`}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            delay: 0.3,
          }}
        />
      ) : (
        <div
          className={`${height} rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function TrainingPage() {
  const { courses: courseRows, loading, error } = useCourses();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyFilter>('All');

  /* -- Map DB rows → UI courses ------------------------------------ */
  const courses: Course[] = useMemo(
    () => courseRows.map(mapCourseRow),
    [courseRows],
  );

  /* -- Derived mock sections from live data ------------------------ */
  const inProgressCourses: InProgressCourse[] = useMemo(() => {
    if (courses.length < 3) return [];
    return [
      { course: courses[Math.min(2, courses.length - 1)], completedModules: 3, totalModules: courses[Math.min(2, courses.length - 1)].modules || 8, timeLeft: '~2 hrs left' },
      { course: courses[Math.min(3, courses.length - 1)], completedModules: 5, totalModules: courses[Math.min(3, courses.length - 1)].modules || 7, timeLeft: '~1 hr left' },
      { course: courses[Math.min(5, courses.length - 1)], completedModules: 2, totalModules: courses[Math.min(5, courses.length - 1)].modules || 6, timeLeft: '~2.5 hrs left' },
    ];
  }, [courses]);

  const recommendations: Recommendation[] = useMemo(() => {
    if (courses.length < 4) return [];
    return [
      { course: courses[Math.min(4, courses.length - 1)], reason: 'Based on your farm profile — reduce post-harvest losses' },
      { course: courses[Math.min(3, courses.length - 1)], reason: 'Recommended for your region — optimize water usage in dry season' },
      { course: courses[Math.min(6, courses.length - 1)], reason: 'You completed financial courses — take your planning to the next level' },
    ];
  }, [courses]);

  /* -- Derived data ------------------------------------------------ */

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: courses.length };
    for (const c of courses) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return counts;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const catMatch =
        activeCategory === 'All' || c.category === activeCategory;
      const diffMatch =
        activeDifficulty === 'All' || c.difficulty === activeDifficulty;
      return catMatch && diffMatch;
    });
  }, [courses, activeCategory, activeDifficulty]);

  const coursesStarted = Math.min(6, courses.length);
  const coursesCompleted = certificates.length;
  const totalLearningHours = 18.5;

  /* -- Loading state ----------------------------------------------- */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Course cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-44 bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* -- Error state ------------------------------------------------- */
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Unable to load courses</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
      </div>
    );
  }

  /* -- Empty state ------------------------------------------------- */
  if (courses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No courses available yet</p>
        <p className="text-sm text-gray-400 mt-1">Check back soon — new training content is on the way.</p>
      </div>
    );
  }

  /* -- Render ------------------------------------------------------ */

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================ */}
      {/*  HEADER                                                       */}
      {/* ============================================================ */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5DB347] to-[#449933] flex items-center justify-center shadow-lg shadow-[#5DB347]/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-navy">
                Training &amp; Certification
              </h1>
            </div>
            <p className="text-gray-500 text-sm ml-[52px]">
              Build skills, earn certificates, and grow your farming business
            </p>
          </div>

          {/* Progress summary pills */}
          <div className="flex flex-wrap items-center gap-3 ml-[52px] md:ml-0">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
              <BookOpen className="w-4 h-4 text-[#5DB347]" />
              <span className="text-sm font-medium text-navy">
                {coursesStarted} of {courses.length} started
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-navy">
                {coursesCompleted} completed
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
              <Clock className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-navy">
                {totalLearningHours} hrs learned
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  STAT CARDS                                                   */}
      {/* ============================================================ */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {[
          {
            label: 'Courses Available',
            value: courses.length,
            icon: <Layers className="w-5 h-5" />,
            color: 'from-[#5DB347] to-[#449933]',
            shadow: 'shadow-[#5DB347]/20',
          },
          {
            label: 'In Progress',
            value: inProgressCourses.length,
            icon: <Play className="w-5 h-5" />,
            color: 'from-navy-light to-navy',
            shadow: 'shadow-navy/20',
          },
          {
            label: 'Certificates Earned',
            value: certificates.length,
            icon: <Award className="w-5 h-5" />,
            color: 'from-gold to-amber-600',
            shadow: 'shadow-gold/20',
          },
          {
            label: 'Completion Rate',
            value: '68%',
            icon: <BarChart3 className="w-5 h-5" />,
            color: 'from-green-500 to-emerald-600',
            shadow: 'shadow-green-500/20',
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">
                {stat.label}
              </span>
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow}`}
              >
                <span className="text-white">{stat.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-navy">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ============================================================ */}
      {/*  MY PROGRESS SECTION                                          */}
      {/* ============================================================ */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-bold text-navy">Continue Learning</h2>
          <span className="ml-1 bg-[#EBF7E5] text-[#5DB347] text-xs font-semibold px-2 py-0.5 rounded-full">
            {inProgressCourses.length} in progress
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {inProgressCourses.map((item, idx) => {
            const pct = Math.round(
              (item.completedModules / item.totalModules) * 100
            );
            return (
              <motion.div
                key={item.course.id}
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative h-36 w-full">
                  <Image
                    src={item.course.image}
                    alt={item.course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[item.course.category]}`}
                    >
                      {item.course.category}
                    </span>
                    <span className="text-xs text-white/90 font-medium">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-navy text-sm leading-snug line-clamp-2">
                      {item.course.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.course.instructor}
                    </p>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>
                        Module {item.completedModules} of {item.totalModules}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        {item.timeLeft}
                      </span>
                    </div>
                    <ProgressBar
                      value={item.completedModules}
                      max={item.totalModules}
                      color={pct >= 60 ? 'bg-[#5DB347]' : 'bg-gold'}
                    />
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 bg-[#5DB347] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#449933] transition-colors">
                    <Play className="w-4 h-4" />
                    Continue
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/*  CATEGORY FILTER TABS                                         */}
      {/* ============================================================ */}
      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-5 h-5 text-navy" />
          <h2 className="text-lg font-bold text-navy">Available Courses</h2>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-navy text-white shadow-lg shadow-navy/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-navy/30 hover:text-navy'
                  }
                `}
              >
                {cat !== 'All' && (
                  <span className="opacity-70">
                    {categoryIcons[cat as Course['category']]}
                  </span>
                )}
                {cat}
                <span
                  className={`ml-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Difficulty toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Difficulty:
          </span>
          <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
            {DIFFICULTIES.map((diff) => {
              const isActive = activeDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setActiveDifficulty(diff)}
                  className={`
                    px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-white text-navy shadow-sm'
                        : 'text-gray-500 hover:text-navy'
                    }
                  `}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================== */}
        {/*  COURSES GRID                                               */}
        {/* ========================================================== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${activeDifficulty}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredCourses.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="col-span-full flex flex-col items-center justify-center py-16 text-center"
              >
                <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  No courses match your filters
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your category or difficulty selection
                </p>
              </motion.div>
            ) : (
              filteredCourses.map((course) => {
                const isInProgress = inProgressCourses.some(
                  (ip) => ip.course.id === course.id
                );
                const isCompleted = certificates.some(
                  (cert) => cert.courseTitle === course.title
                );
                return (
                  <motion.div
                    key={course.id}
                    variants={itemVariants}
                    layout
                  >
                    <motion.div
                      variants={cardHoverVariants}
                      initial="rest"
                      whileHover="hover"
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative h-44 w-full">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[course.category]}`}
                          >
                            {categoryIcons[course.category]}
                            {course.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset ${difficultyColors[course.difficulty]}`}
                          >
                            {course.difficulty}
                          </span>
                        </div>

                        {/* Status indicator */}
                        {(isCompleted || isInProgress) && (
                          <div className="absolute bottom-3 right-3">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-gold text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                <Play className="w-3 h-3" />
                                In Progress
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-semibold text-navy text-base leading-snug line-clamp-2 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">
                          by {course.instructor}
                        </p>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                          {course.description}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {course.duration}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-gray-400" />
                            {course.modules} modules
                          </span>
                        </div>

                        {/* Rating + Enrollment */}
                        <div className="flex items-center justify-between mb-4">
                          <StarRating rating={course.rating} />
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Users className="w-3.5 h-3.5" />
                            {course.enrollmentCount.toLocaleString()} enrolled
                          </span>
                        </div>

                        {/* Action button */}
                        <button
                          className={`
                            w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg
                            transition-colors
                            ${
                              isCompleted
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : isInProgress
                                  ? 'bg-[#5DB347] text-white hover:bg-[#449933]'
                                  : 'bg-navy text-white hover:bg-navy-light'
                            }
                          `}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Review Course
                            </>
                          ) : isInProgress ? (
                            <>
                              <Play className="w-4 h-4" />
                              Continue
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-4 h-4" />
                              Start Course
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* ============================================================ */}
      {/*  RECOMMENDED FOR YOU                                          */}
      {/* ============================================================ */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="pulse"
          >
            <Sparkles className="w-5 h-5 text-gold" />
          </motion.div>
          <h2 className="text-lg font-bold text-navy">Recommended For You</h2>
          <span className="text-xs text-gray-400 font-medium ml-1">
            AI-powered suggestions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.map((rec) => (
            <motion.div
              key={rec.course.id}
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="bg-gradient-to-br from-white to-cream rounded-xl border border-gold/20 overflow-hidden shadow-sm cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-36 w-full">
                <Image
                  src={rec.course.image}
                  alt={rec.course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-gold/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset ${difficultyColors[rec.course.difficulty]}`}
                  >
                    {rec.course.difficulty}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-navy text-sm leading-snug line-clamp-2">
                    {rec.course.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    by {rec.course.instructor}
                  </p>
                </div>

                {/* Reason chip */}
                <div className="bg-gold/5 border border-gold/15 rounded-lg px-3 py-2">
                  <p className="text-xs text-gold font-medium flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {rec.reason}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {rec.course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {rec.course.modules} modules
                  </span>
                  <StarRating rating={rec.course.rating} />
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-navy text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-navy-light transition-colors">
                  <ChevronRight className="w-4 h-4" />
                  Start Course
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/*  CERTIFICATES EARNED                                          */}
      {/* ============================================================ */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-bold text-navy">Certificates Earned</h2>
          <span className="ml-1 bg-gold/10 text-gold text-xs font-semibold px-2 py-0.5 rounded-full">
            {certificates.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden"
            >
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-gold/10 to-transparent rounded-bl-full" />
              </div>

              {/* Certificate icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-lg shadow-gold/20 shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-navy text-sm leading-snug">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cert.courseTitle}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Instructor</span>
                  <span className="text-navy font-medium">
                    {cert.instructor}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Date Earned</span>
                  <span className="text-navy font-medium">
                    {cert.dateEarned}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Credential ID</span>
                  <span className="text-[#5DB347] font-mono text-[11px] font-medium">
                    {cert.credentialId}
                  </span>
                </div>
              </div>

              {/* Verified + Download */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
                  <FileCheck className="w-3 h-3" />
                  Verified
                </span>
                <button className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-[#5DB347] transition-colors bg-gray-50 hover:bg-[#EBF7E5] px-3 py-1.5 rounded-lg">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
