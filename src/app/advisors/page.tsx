'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bell,
  GraduationCap,
  Globe2,
  Sprout,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

/* ─── What We're Building ─── */
const HIGHLIGHTS = [
  { value: 'Mentorship', label: 'One-on-one farmer guidance', icon: UserCheck },
  { value: 'Programmes', label: 'Advisor-led training initiatives', icon: Award },
  { value: '20 Countries', label: 'Pan-African coverage planned', icon: Globe2 },
  { value: 'Apply Now', label: 'Expressions of interest open', icon: BookOpen },
];

export default function AdvisorsPage() {
  return (
    <main className="bg-white">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#2A3A5C] py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0djItSDI0di0yaDEyem0wIDhoLTEydjJoMTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-[#5DB347]/20 text-[#5DB347] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              Expert Network
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Meet Our Advisors
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Industry veterans, agricultural scientists, and business leaders who guide AFU programs and mentor our farmers. Decades of real-world experience across African agriculture.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/advisors/apply"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#449933] hover:to-[#387828] transition-all"
              >
                Become an Advisor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── What We're Building ─── */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {HIGHLIGHTS.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-6 w-6 text-[#5DB347]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#1B2A4A]">{item.value}</div>
                <div className="text-sm text-gray-500">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Coming Soon ─── */}
      <section className="py-24 bg-gradient-to-b from-white to-[#FAF8F3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 shadow-lg p-10 sm:p-14"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-[#5DB347]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] mb-4">
              Advisory Network Coming Soon
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              We&apos;re building a network of experienced agricultural professionals, scientists, and business leaders
              to mentor farmers and guide AFU programs across Africa. Advisor profiles will be available here shortly.
            </p>

            {/* What to expect */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                { icon: Target, title: 'Programme Matching', desc: 'Advisors matched to programmes by expertise' },
                { icon: Sprout, title: 'Farmer Mentorship', desc: 'Field visits, workshops, and guidance' },
                { icon: TrendingUp, title: 'Impact Tracking', desc: 'Measurable outcomes across the network' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-[#FAF8F3] p-4">
                  <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="h-5 w-5 text-[#5DB347]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1B2A4A] mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Notify + Apply buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/advisors/apply"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Apply as Advisor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-gray-200 text-[#1B2A4A] px-6 py-3 rounded-xl font-semibold hover:border-[#5DB347]/30 hover:text-[#5DB347] transition-all"
              >
                <Bell className="w-4 h-4" />
                Get Notified
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-16 bg-[#FAF8F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1B2A4A]">
              How Our Advisory Network Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Programme Assignment',
                desc: 'Advisors are matched to AFU programmes based on their expertise, ensuring every initiative has seasoned guidance.',
                icon: Target,
              },
              {
                step: '02',
                title: 'Farmer Mentorship',
                desc: 'Regular workshops, field visits, and one-on-one sessions help farmers apply best practices and solve real challenges.',
                icon: Users,
              },
              {
                step: '03',
                title: 'Continuous Impact',
                desc: 'Advisors track outcomes, refine strategies, and share knowledge across the AFU network to multiply impact.',
                icon: TrendingUp,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-[#5DB347]" />
                </div>
                <span className="text-xs font-bold text-[#5DB347]">Step {item.step}</span>
                <h3 className="text-lg font-bold text-[#1B2A4A] mt-1 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 bg-gradient-to-br from-[#1B2A4A] to-[#2A3A5C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#5DB347]/20 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-8 w-8 text-[#5DB347]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Share Your Expertise
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Are you an experienced agricultural professional? Join our advisory network and help shape the future of African farming. We welcome experts from all agricultural disciplines.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/advisors/apply"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Apply as Advisor
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
