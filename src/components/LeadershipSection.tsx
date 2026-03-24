'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/* ─── Animation helper (matches homepage pattern) ─── */
function FadeInWhenVisible({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const offsets = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ─── */

interface BoardMember {
  name: string;
  title: string;
  org: string;
  bio: string;
  country: string;
  flag: string;
  linkedin: string;
}

const boardOfDirectors: BoardMember[] = [
  {
    name: 'Peter Watson',
    title: 'CEO & Founder',
    org: 'African Farming Union',
    bio: 'Commercial farmer and agricultural finance visionary with decades of hands-on experience across African markets. Background in commodity trading, farm management, and capital markets. Passionate about building infrastructure that helps real farmers thrive.',
    country: 'Zimbabwe',
    flag: '\u{1F1FF}\u{1F1FC}',
    linkedin: '#',
  },
  {
    name: 'Devon Kennaird',
    title: 'Co-Founder',
    org: 'African Farming Union',
    bio: 'Technology leader and platform architect driving AFU\u2019s digital infrastructure. Built the full-stack agriculture operating system from the ground up \u2014 AI integration, 5 payment gateways, and real-time farm intelligence across 10 countries.',
    country: 'Canada',
    flag: '\u{1F1E8}\u{1F1E6}',
    linkedin: '#',
  },
  {
    name: 'Duncan Kennaird',
    title: 'Co-Founder & Head of Commercial Agriculture',
    org: 'African Farming Union',
    bio: 'Commercial farming expert with deep operational experience across Southern African agriculture. Specializes in livestock management, crop production systems, and building scalable farm operations from the ground up.',
    country: 'Zimbabwe',
    flag: '\u{1F1FF}\u{1F1FC}',
    linkedin: '#',
  },
];

const advisoryCouncil: BoardMember[] = [
  // Advisory positions to be filled — managed from admin CMS
];

function avatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=300&background=1B2A4A&color=5DB347&bold=true`;
}

/* ─── Card Component ─── */

function MemberCard({ member, delay }: { member: BoardMember; delay: number }) {
  return (
    <FadeInWhenVisible delay={delay}>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#5DB347]/30 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={avatarUrl(member.name)}
            alt={member.name}
            className="w-16 h-16 rounded-full ring-2 ring-[#5DB347]/20 shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-bold text-[#1B2A4A] text-base leading-tight truncate">{member.name}</h3>
            <p className="text-[#5DB347] text-sm font-medium leading-tight mt-0.5">{member.title}</p>
          </div>
        </div>

        {/* Org */}
        <p className="text-xs text-gray-500 font-medium mb-3">{member.org}</p>

        {/* Bio */}
        <p className="text-sm text-gray-600 leading-relaxed flex-1">{member.bio}</p>

        {/* Footer: Country + LinkedIn */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="text-base">{member.flag}</span>
            {member.country}
          </span>
          <a
            href={member.linkedin}
            className="text-[#1B2A4A]/40 hover:text-[#5DB347] transition-colors"
            aria-label={`${member.name} LinkedIn`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>
    </FadeInWhenVisible>
  );
}

/* ─── Main Section ─── */

export default function LeadershipSection() {
  return (
    <section className="py-20 bg-[#F8FBF6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>
              Leadership
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              <span
                style={{
                  background: 'linear-gradient(135deg, #1B2A4A 0%, #5DB347 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Founding Team
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Built by farmers, for farmers. Our founding team brings hands-on commercial farming experience
              and deep technical expertise to transform African agriculture.
            </p>
          </div>
        </FadeInWhenVisible>

        {/* ── Board of Directors ── */}
        <FadeInWhenVisible>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 rounded-full" style={{ background: '#5DB347' }} />
              <h3 className="text-xl font-bold text-[#1B2A4A]">Board of Directors</h3>
            </div>
            <p className="text-sm text-gray-500 ml-[19px]">
              Governing the strategic direction and fiduciary oversight of AFU
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {boardOfDirectors.map((member, i) => (
            <MemberCard key={member.name} member={member} delay={i * 0.08} />
          ))}
        </div>

        {/* Advisory Council — hidden until real advisors are confirmed */}
        {advisoryCouncil.length > 0 && (
          <>
            <FadeInWhenVisible>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-6 rounded-full" style={{ background: '#8CB89C' }} />
                  <h3 className="text-xl font-bold text-[#1B2A4A]">Advisory Council</h3>
                </div>
                <p className="text-sm text-gray-500 ml-[19px]">
                  Domain experts guiding AFU&apos;s technology, policy, and market strategy
                </p>
              </div>
            </FadeInWhenVisible>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advisoryCouncil.map((member, i) => (
                <MemberCard key={member.name} member={member} delay={i * 0.08} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
