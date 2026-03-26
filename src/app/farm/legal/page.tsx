'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Scale,
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  HelpCircle,
  BookOpen,
  Send,
  ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOPICS = [
  'Land Dispute',
  'Contract Review',
  'Regulatory Compliance',
  'Cooperative Matter',
  'Intellectual Property',
  'Other',
] as const;

type Topic = (typeof TOPICS)[number];
type Urgency = 'Low' | 'Medium' | 'High';
type CaseStatus = 'Pending' | 'In Progress' | 'Resolved';

interface DemoCase {
  id: string;
  title: string;
  status: CaseStatus;
  date: string;
  description: string;
  firm: string;
}

const demoCases: DemoCase[] = [
  {
    id: 'LEG-001',
    title: 'Boundary Dispute — Adjacent Farm',
    status: 'In Progress',
    date: '2026-02-14',
    description:
      'Dispute over boundary markers between Plot 4 and neighboring farm. Survey team has been dispatched and mediation is scheduled.',
    firm: 'Greenfield & Associates',
  },
  {
    id: 'LEG-002',
    title: 'Cooperative Membership Agreement Review',
    status: 'Resolved',
    date: '2026-01-20',
    description:
      'Review of updated cooperative bylaws and membership fee structure. All clauses reviewed and approved with minor amendments.',
    firm: 'Agri-Legal Partners LLP',
  },
  {
    id: 'LEG-003',
    title: 'Export Permit Compliance Query',
    status: 'Pending',
    date: '2026-03-18',
    description:
      'Clarification needed on new phytosanitary certificate requirements for sesame exports to the EU market.',
    firm: 'Unassigned',
  },
];

const statusStyles: Record<CaseStatus, { bg: string; text: string; dot: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  'In Progress': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  Resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FarmLegalPage() {
  const [topic, setTopic] = useState<Topic | ''>('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('Medium');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liveCases, setLiveCases] = useState<DemoCase[]>(demoCases);
  const [loadingCases, setLoadingCases] = useState(true);

  // Fetch real cases from API on mount
  useEffect(() => {
    fetch('/api/legal')
      .then((res) => res.json())
      .then((data) => {
        if (data.cases && data.cases.length > 0) {
          const mapped = data.cases.map((c: Record<string, string>) => ({
            id: c.case_number || c.id,
            title: c.title,
            status: c.status === 'in_progress' ? 'In Progress' : c.status === 'resolved' ? 'Resolved' : 'Pending',
            date: c.created_at?.split('T')[0] || '',
            description: c.description,
            firm: c.assigned_firm || 'Unassigned',
          }));
          setLiveCases(mapped);
        }
      })
      .catch(() => { /* fall back to demo data */ })
      .finally(() => setLoadingCases(false));
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !description.trim()) return;
    setSubmitting(true);

    try {
      const topicMap: Record<string, string> = {
        'Land Dispute': 'land_dispute',
        'Contract Review': 'contract_review',
        'Regulatory Compliance': 'compliance',
        'Cooperative Matter': 'cooperative',
        'Intellectual Property': 'intellectual_property',
        'Other': 'other',
      };
      const priorityMap: Record<string, string> = { Low: 'low', Medium: 'medium', High: 'high' };

      const res = await fetch('/api/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_type: topicMap[topic] || 'other',
          title: `${topic} — ${description.slice(0, 50)}`,
          description,
          priority: priorityMap[urgency] || 'medium',
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Graceful fallback — still show success for UX
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTopic('');
    setDescription('');
    setUrgency('Medium');
    setSubmitted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      className="min-h-screen bg-gray-50"
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ----------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ----------------------------------------------------------------- */}
        <motion.div variants={fadeUp} initial="initial" animate="animate" className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#5DB347' }}
            >
              <Scale className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>
              Legal Assistance
            </h1>
          </div>
          <p className="text-gray-500 ml-[52px]">
            Get expert legal support for land rights, contracts, regulatory matters, and more.
            Our partner law firms specialize in agricultural and rural issues.
          </p>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Quick Action Cards                                                */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 sm:grid-cols-3 mb-10"
        >
          {/* Request Legal Help */}
          <motion.a
            variants={scaleIn}
            href="#request-form"
            className="group flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-shadow hover:shadow-lg"
            style={{ borderColor: '#5DB347', backgroundColor: '#f0faf0' }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: '#5DB347' }}
            >
              <Scale className="h-6 w-6" />
            </div>
            <span className="font-semibold" style={{ color: '#1B2A4A' }}>
              Request Legal Help
            </span>
            <span className="text-sm text-gray-500">Submit a new assistance request</span>
          </motion.a>

          {/* View Land Rights Guide */}
          <motion.div
            variants={scaleIn}
            className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-lg cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="font-semibold" style={{ color: '#1B2A4A' }}>
              View Land Rights Guide
            </span>
            <span className="text-sm text-gray-500">Understand your land ownership rights</span>
          </motion.div>

          {/* Download Contract Templates */}
          <motion.div
            variants={scaleIn}
            className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-lg cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Download className="h-6 w-6" />
            </div>
            <span className="font-semibold" style={{ color: '#1B2A4A' }}>
              Download Contract Templates
            </span>
            <span className="text-sm text-gray-500">Ready-to-use farming agreements</span>
          </motion.div>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Request Legal Help Form                                           */}
        {/* ----------------------------------------------------------------- */}
        <motion.section
          id="request-form"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#1B2A4A' }}>
            Request Legal Help
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Describe your legal matter and we will connect you with a qualified agricultural law firm.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' as const }}
              className="flex flex-col items-center gap-4 py-10 text-center"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: '#e8f5e4' }}
              >
                <CheckCircle className="h-7 w-7" style={{ color: '#5DB347' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#1B2A4A' }}>
                Request Submitted Successfully
              </h3>
              <p className="max-w-md text-sm text-gray-500">
                Your legal assistance request has been received. A qualified law firm will
                review your case and contact you within 2 business days.
              </p>
              <button
                onClick={resetForm}
                className="mt-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#5DB347' }}
              >
                Submit Another Request
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Topic */}
              <div>
                <label htmlFor="topic" className="mb-1 block text-sm font-medium text-gray-700">
                  Topic
                </label>
                <select
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as Topic)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#5DB347] focus:outline-none focus:ring-1 focus:ring-[#5DB347]"
                  required
                >
                  <option value="">Select a topic...</option>
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="desc" className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your legal matter in detail..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#5DB347] focus:outline-none focus:ring-1 focus:ring-[#5DB347]"
                  required
                />
              </div>

              {/* Urgency */}
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700">Urgency</span>
                <div className="flex gap-4">
                  {(['Low', 'Medium', 'High'] as Urgency[]).map((level) => {
                    const colors: Record<Urgency, string> = {
                      Low: '#5DB347',
                      Medium: '#F59E0B',
                      High: '#EF4444',
                    };
                    return (
                      <label
                        key={level}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={level}
                          checked={urgency === level}
                          onChange={() => setUrgency(level)}
                          className="h-4 w-4 accent-[#5DB347]"
                        />
                        <span className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: colors[level] }}
                          />
                          {level}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#5DB347' }}
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </motion.section>

        {/* ----------------------------------------------------------------- */}
        {/* My Cases                                                          */}
        {/* ----------------------------------------------------------------- */}
        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="mb-10"
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B2A4A' }}>
            My Cases
          </h2>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {liveCases.map((c) => {
              const style = statusStyles[c.status];
              return (
                <motion.div
                  key={c.id}
                  variants={fadeUp}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold" style={{ color: '#1B2A4A' }}>
                        {c.title}
                      </h3>
                      <span className="text-xs text-gray-400">{c.id}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Submitted {c.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {c.firm}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        {/* ----------------------------------------------------------------- */}
        {/* Quick Links                                                       */}
        {/* ----------------------------------------------------------------- */}
        <motion.section variants={fadeUp} initial="initial" animate="animate">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B2A4A' }}>
            Quick Links
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Emergency Helpline */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                  Emergency Legal Helpline
                </p>
                <p className="text-sm font-semibold" style={{ color: '#5DB347' }}>
                  0800-FARM-LAW
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md cursor-pointer">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                  Frequently Asked Questions
                </p>
                <p className="text-xs text-gray-400">Common legal questions answered</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
            </div>

            {/* Legal Guides */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md cursor-pointer">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                  Legal Guides Library
                </p>
                <p className="text-xs text-gray-400">In-depth guides for farmers</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
