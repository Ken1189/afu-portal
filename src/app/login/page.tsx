'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // kept for background landscape image
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Users,
  Globe,
  DollarSign,
  Info,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';

/* ------------------------------------------------------------------ */
/*  Testimonial data                                                   */
/* ------------------------------------------------------------------ */
const testimonials = [
  {
    quote:
      'AFU transformed my small maize operation into a thriving commercial farm. The financing and training programs are world-class.',
    name: 'Grace Mwangi',
    role: 'Commercial Farmer, Kenya',
  },
  {
    quote:
      'Access to trade finance through AFU opened export markets I never thought possible. My cassava now reaches three countries.',
    name: 'Kwame Asante',
    role: 'Export Farmer, Ghana',
  },
  {
    quote:
      'The input supply program cut my costs by 30%. AFU is not just a union \u2014 it is a growth partner for every African farmer.',
    name: 'Amina Diallo',
    role: 'Cooperative Leader, Senegal',
  },
];

/* ------------------------------------------------------------------ */
/*  Framer Motion variants (typed for strict TS)                       */
/* ------------------------------------------------------------------ */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const panelSlide = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const formContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const formItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

const testimonialVariant = {
  enter: { opacity: 0, y: 20 },
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn' as const,
    },
  },
};

const pulseRing = {
  initial: { scale: 1, opacity: 0.15 },
  animate: {
    scale: [1, 1.5, 1],
    opacity: [0.15, 0, 0.15],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Helper: fetch role from server API (bypasses RLS) and redirect by role
  const fetchRoleAndRedirect = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const { role } = await res.json();
      switch (role) {
        case 'super_admin':
        case 'admin':
          router.push('/admin');
          break;
        case 'investor':
          router.push('/investor');
          break;
        case 'supplier':
          router.push('/supplier');
          break;
        case 'ambassador':
          router.push('/ambassador');
          break;
        default:
          router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
  }, [router]);

  // If already logged in, redirect based on role
  useEffect(() => {
    if (!authLoading && user) {
      fetchRoleAndRedirect();
    }
  }, [user, authLoading, fetchRoleAndRedirect]);

  // Rotate testimonials
  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [nextTestimonial]);

  // Login / Signup handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (isSignUp && !fullName) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess('Account created! Check your email to confirm, or sign in now.');
          setIsSignUp(false);
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
        } else {
          // Fetch role from server API (bypasses RLS) and redirect
          await fetchRoleAndRedirect();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ============================================================ */}
      {/*  LEFT PANEL  (hidden on mobile / tablet)                      */}
      {/* ============================================================ */}
      <motion.div
        variants={panelSlide}
        initial="hidden"
        animate="visible"
        className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between overflow-hidden"
      >
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=1800&fit=crop"
          alt="African farming landscape"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/80 to-[#8CB89C]/70" />

        {/* Decorative background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            variants={pulseRing}
            initial="initial"
            animate="animate"
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10"
          />
          <div className="absolute top-1/4 -left-16 w-64 h-64 rounded-full bg-[#8CB89C]/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-8 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' as const }}
            className="absolute bottom-20 -left-20 w-80 h-80 rounded-full border border-white/5"
          />
          {/* Small dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Content layer */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          {/* Top: Logo + brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img src="/afu-logo.svg" alt="African Farming Union" className="h-14 w-auto object-contain rounded-lg bg-white/95 p-1.5" />
              <div>
                <span className="text-white font-bold text-lg tracking-tight sr-only">
                  African Farming Union
                </span>
                <span className="block text-[#8CB89C]/70 text-xs tracking-widest uppercase">
                  Member Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Testimonial carousel */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <div className="mb-6">
              <Shield className="w-8 h-8 text-[#8CB89C]/60 mb-4" />
              <h2 className="text-white/90 text-2xl xl:text-3xl font-semibold leading-snug">
                Empowering Africa&apos;s farmers with finance, inputs &amp; market access.
              </h2>
            </div>

            {/* Testimonial */}
            <div className="relative min-h-[160px]">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={activeTestimonial}
                  variants={testimonialVariant}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <p className="text-white/75 text-base xl:text-lg leading-relaxed italic">
                    &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                  </p>
                  <footer className="mt-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5DB347]/30 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonials[activeTestimonial].name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {testimonials[activeTestimonial].name}
                      </p>
                      <p className="text-white/50 text-xs">
                        {testimonials[activeTestimonial].role}
                      </p>
                    </div>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Dots indicator */}
            <div className="flex gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeTestimonial
                      ? 'w-8 bg-[#5DB347]'
                      : 'w-4 bg-white/25 hover:bg-white/40'
                  }`}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Bottom: Stats bar */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { icon: Users, label: 'Members', value: '5,000+' },
              { icon: Globe, label: 'Countries', value: '12' },
              { icon: DollarSign, label: 'Financed', value: '$50M+' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <stat.icon className="w-5 h-5 text-[#8CB89C]/60 mx-auto mb-1.5" />
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-white/40 text-xs uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  RIGHT PANEL  (login form)                                    */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center bg-cream px-4 py-12 sm:px-8 lg:px-12 xl:px-20">
        <motion.div
          variants={formContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile-only logo */}
          <motion.div variants={formItem} className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/afu-logo.svg" alt="African Farming Union" className="h-12 w-auto object-contain" />
            </Link>
          </motion.div>

          {/* Heading */}
          <motion.div variants={formItem} className="mb-8">
            <h1 className="text-3xl font-bold text-navy">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isSignUp ? 'Join the African Farming Union' : 'Sign in to your portal'}
            </p>
          </motion.div>

          {/* Success message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="flex items-start gap-3 bg-green-50 border border-green-100 text-green-700 text-sm p-4 rounded-xl">
                  <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p>{success}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form card */}
          <motion.div
            variants={formItem}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg shadow-[#5DB347]/5 border border-white/60"
          >
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Full Name (sign-up only) */}
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-1">
                      <label htmlFor="fullName" className="block text-sm font-medium text-navy mb-2">
                        Full name
                      </label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                        <input
                          id="fullName"
                          type="text"
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow"
                          placeholder="e.g. Thabo Mokoena"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-navy mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-navy mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl bg-white text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]/40"
                  />
                  <span className="text-sm text-gray-500">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) { setError('Enter your email first, then click Forgot Password'); return; }
                    setIsLoading(true);
                    const supabase = (await import('@/lib/supabase/client')).createClient();
                    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/login`,
                    });
                    setIsLoading(false);
                    if (resetError) { setError(resetError.message); }
                    else { setError(''); alert('Password reset link sent to ' + email + '. Check your inbox.'); }
                  }}
                  className="text-sm text-[#5DB347] hover:text-[#449933] font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full disabled:opacity-70 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group bg-gradient-to-r from-[#5DB347] to-[#449933] hover:shadow-lg hover:shadow-[#5DB347]/20 hover:scale-[1.01]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-400">or</span>
              </div>
            </div>

            {/* WhatsApp button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-400 rounded-xl font-semibold cursor-not-allowed relative"
              disabled
            >
              <MessageCircle className="w-5 h-5" />
              Continue with WhatsApp
              <span className="absolute -top-2 right-3 text-[10px] font-bold bg-[#5DB347] text-white px-2 py-0.5 rounded-full">Coming Soon</span>
            </motion.button>
          </motion.div>

          {/* Toggle sign-in / sign-up */}
          <motion.p
            variants={formItem}
            className="text-center text-gray-500 text-sm mt-6"
          >
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
                  className="text-[#5DB347] hover:text-[#449933] font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
                  className="text-[#5DB347] hover:text-[#449933] font-medium transition-colors"
                >
                  Create one
                </button>
              </>
            )}
          </motion.p>

          {/* Security footer */}
          <motion.div
            variants={formItem}
            className="flex items-center justify-center gap-1.5 mt-4 text-gray-400 text-xs"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>256-bit SSL encrypted &middot; SOC 2 compliant</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
