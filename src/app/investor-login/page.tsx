'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  TrendingUp,
  BarChart3,
  Globe,
  Landmark,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';

/* ------------------------------------------------------------------ */
/*  Fund highlights                                                     */
/* ------------------------------------------------------------------ */
const highlights = [
  {
    icon: TrendingUp,
    label: 'Target Returns',
    value: '12-16% IRR',
    desc: 'Risk-adjusted returns backed by real agricultural assets',
  },
  {
    icon: Globe,
    label: 'Deployment',
    value: '20 Countries',
    desc: 'Diversified across Sub-Saharan African markets',
  },
  {
    icon: Leaf,
    label: 'Impact',
    value: '1M+ Farmers',
    desc: 'Direct economic uplift for smallholder communities',
  },
  {
    icon: Landmark,
    label: 'Insurance',
    value: "Lloyd's Backed",
    desc: "Coverholder status with Lloyd's of London underwriting",
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                  */
/* ------------------------------------------------------------------ */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const formContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const formItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function InvestorLoginPage() {
  const router = useRouter();
  const { signIn, user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkRoleAndRedirect = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const { role } = await res.json();
      if (role === 'investor' || role === 'admin' || role === 'super_admin') {
        router.push('/investor');
      } else {
        setError('Your account does not have investor access. Contact peterw@africanfarmingunion.org');
      }
    } catch {
      setError('Unable to verify access. Please try again.');
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && user) {
      checkRoleAndRedirect();
    }
  }, [user, authLoading, checkRoleAndRedirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
      } else {
        await checkRoleAndRedirect();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ============================================================ */}
      {/*  LEFT PANEL — Dark, institutional, premium                    */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between overflow-hidden bg-[#0A1628]"
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Gradient accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#5DB347]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#1B2A4A]/50 to-transparent rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          {/* Top: Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img
                src="/afu-logo.svg"
                alt="African Farming Union"
                className="h-14 w-auto object-contain rounded-lg bg-white/95 p-1.5"
              />
              <div>
                <span className="block text-white/40 text-xs tracking-[0.25em] uppercase font-medium">
                  Investor Relations
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Value proposition */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
              <div className="inline-flex items-center gap-2 bg-[#5DB347]/10 border border-[#5DB347]/20 rounded-full px-4 py-1.5 mb-6">
                <BarChart3 className="w-4 h-4 text-[#5DB347]" />
                <span className="text-[#5DB347] text-xs font-semibold tracking-wider uppercase">
                  Institutional Access
                </span>
              </div>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-white text-3xl xl:text-4xl font-bold leading-tight mb-4"
            >
              Agricultural Infrastructure
              <br />
              <span className="text-[#5DB347]">Investment Platform</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-white/50 text-base xl:text-lg leading-relaxed mb-10"
            >
              Access real-time portfolio analytics, fund performance data,
              impact metrics, and investor documents through your secure portal.
            </motion.p>

            {/* Highlight cards */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={3 + i}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.06] transition-colors"
                >
                  <item.icon className="w-5 h-5 text-[#5DB347]/70 mb-2" />
                  <p className="text-white font-bold text-lg leading-tight">{item.value}</p>
                  <p className="text-white/30 text-xs mt-0.5">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-white/25 text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Bank-grade encryption</span>
              <span className="mx-1">&middot;</span>
              <span>SOC 2 Type II</span>
              <span className="mx-1">&middot;</span>
              <span>GDPR compliant</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  RIGHT PANEL — Login form                                     */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center bg-[#F8F9FB] px-4 py-12 sm:px-8 lg:px-12 xl:px-20">
        <motion.div
          variants={formContainer}
          initial={{ opacity: 1 }}
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile-only logo */}
          <motion.div variants={formItem} className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/afu-logo.svg" alt="African Farming Union" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-xs text-gray-400 tracking-widest uppercase mt-2">Investor Portal</p>
          </motion.div>

          {/* Heading */}
          <motion.div variants={formItem} className="mb-8">
            <h1 className="text-3xl font-bold text-[#0A1628]">Investor Sign In</h1>
            <p className="text-gray-500 mt-2">
              Access your portfolio, documents, and impact reports.
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            variants={formItem}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100"
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
              {/* Email */}
              <div>
                <label htmlFor="investor-email" className="block text-sm font-medium text-[#0A1628] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <input
                    id="investor-email"
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-shadow"
                    placeholder="you@institution.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="investor-password" className="block text-sm font-medium text-[#0A1628] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <input
                    id="investor-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl bg-white text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-shadow"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) { setError('Enter your email first, then click Forgot Password'); return; }
                    setIsLoading(true);
                    const supabase = (await import('@/lib/supabase/client')).createClient();
                    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/investor-login`,
                    });
                    setIsLoading(false);
                    if (resetError) { setError(resetError.message); }
                    else { setError(''); alert('Password reset link sent to ' + email); }
                  }}
                  className="text-sm text-[#1B2A4A] hover:text-[#0A1628] font-medium transition-colors"
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
                className="relative w-full disabled:opacity-70 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group bg-gradient-to-r from-[#1B2A4A] to-[#0A1628] hover:shadow-lg hover:shadow-[#1B2A4A]/20"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Request access */}
          <motion.div variants={formItem} className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don&apos;t have investor access?
            </p>
            <Link
              href="/contact?subject=investor-access"
              className="inline-flex items-center gap-1 text-[#1B2A4A] hover:text-[#0A1628] font-medium text-sm mt-1 transition-colors"
            >
              Request access from our team
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Security footer */}
          <motion.div
            variants={formItem}
            className="flex items-center justify-center gap-1.5 mt-6 text-gray-400 text-xs"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Bank-grade encryption &middot; SOC 2 Type II &middot; Accredited investors only</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
