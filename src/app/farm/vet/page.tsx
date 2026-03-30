'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Phone,
  CalendarCheck,
  Syringe,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  ChevronRight,
  ShieldCheck,
  Calculator,
  AlertTriangle,
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

const ANIMAL_TYPES = ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Pigs', 'Other'] as const;
const SERVICE_TYPES = [
  'Routine Check-up',
  'Vaccination',
  'Sick Animal',
  'Breeding/AI',
  'Lab Test',
] as const;

type AnimalType = (typeof ANIMAL_TYPES)[number];
type ServiceType = (typeof SERVICE_TYPES)[number];
type VisitStatus = 'Scheduled' | 'Completed' | 'Cancelled';

interface DemoVisit {
  id: string;
  vetName: string;
  date: string;
  serviceType: string;
  status: VisitStatus;
  animalType: string;
}

const FALLBACK_VISITS: DemoVisit[] = [
  {
    id: 'VET-001',
    vetName: 'Dr. Amina Okafor',
    date: '2026-04-02',
    serviceType: 'Routine Check-up',
    status: 'Scheduled',
    animalType: 'Cattle',
  },
  {
    id: 'VET-002',
    vetName: 'Dr. James Mwangi',
    date: '2026-03-28',
    serviceType: 'Vaccination',
    status: 'Scheduled',
    animalType: 'Goats',
  },
  {
    id: 'VET-003',
    vetName: 'Dr. Amina Okafor',
    date: '2026-03-15',
    serviceType: 'Sick Animal',
    status: 'Completed',
    animalType: 'Cattle',
  },
  {
    id: 'VET-004',
    vetName: 'Dr. Peter Banda',
    date: '2026-02-20',
    serviceType: 'Breeding/AI',
    status: 'Cancelled',
    animalType: 'Cattle',
  },
];

const statusStyles: Record<VisitStatus, { bg: string; text: string; dot: string; Icon: typeof CheckCircle }> = {
  Scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', Icon: Clock },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', Icon: CheckCircle },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', Icon: XCircle },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FarmVetPage() {
  const [animalType, setAnimalType] = useState<AnimalType | ''>('');
  const [numAnimals, setNumAnimals] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liveVisits, setLiveVisits] = useState<DemoVisit[]>(FALLBACK_VISITS);

  // Fetch real appointments from API on mount
  useEffect(() => {
    fetch('/api/vet')
      .then((res) => res.json())
      .then((data) => {
        if (data.appointments && data.appointments.length > 0) {
          const mapped = data.appointments.map((a: Record<string, string | number>) => ({
            id: a.appointment_number || a.id,
            vetName: a.assigned_vet_name || 'Unassigned',
            date: (a.scheduled_date as string)?.split('T')[0] || (a.created_at as string)?.split('T')[0] || '',
            serviceType: (a.service_type as string)?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || '',
            status: a.status === 'completed' ? 'Completed' : a.status === 'cancelled' ? 'Cancelled' : 'Scheduled',
            animalType: (a.animal_type as string)?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || '',
          }));
          setLiveVisits(mapped);
        }
      })
      .catch(() => { /* fall back to demo data */ });
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalType || !serviceType || !preferredDate) return;
    setSubmitting(true);

    try {
      const serviceMap: Record<string, string> = {
        'Routine Check-up': 'routine_checkup',
        'Vaccination': 'vaccination',
        'Sick Animal': 'disease_treatment',
        'Breeding/AI': 'breeding',
        'Lab Test': 'lab_test',
      };

      const res = await fetch('/api/vet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: serviceMap[serviceType] || 'consultation',
          animal_type: animalType.toLowerCase(),
          animal_count: parseInt(numAnimals) || 1,
          description: notes || `${serviceType} for ${numAnimals || 1} ${animalType}`,
          scheduled_date: new Date(preferredDate).toISOString(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAnimalType('');
    setNumAnimals('');
    setServiceType('');
    setPreferredDate('');
    setNotes('');
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
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>
              Veterinary Services
            </h1>
          </div>
          <p className="text-gray-500 ml-[52px]">
            Schedule vet visits, track vaccinations, and access emergency animal health support.
            Our network of certified veterinarians covers livestock across all regions.
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
          {/* Book Vet Visit */}
          <motion.a
            variants={scaleIn}
            href="#book-form"
            className="group flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-shadow hover:shadow-lg"
            style={{ borderColor: '#5DB347', backgroundColor: '#f0faf0' }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: '#5DB347' }}
            >
              <CalendarCheck className="h-6 w-6" />
            </div>
            <span className="font-semibold" style={{ color: '#1B2A4A' }}>
              Book Vet Visit
            </span>
            <span className="text-sm text-gray-500">Schedule a veterinary appointment</span>
          </motion.a>

          {/* Emergency Hotline */}
          <motion.div
            variants={scaleIn}
            className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-lg cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Phone className="h-6 w-6" />
            </div>
            <span className="font-semibold" style={{ color: '#1B2A4A' }}>
              Emergency Hotline
            </span>
            <span className="text-sm text-gray-500">24/7 urgent animal health line</span>
          </motion.div>

          {/* Vaccination Schedule */}
          <motion.div
            variants={scaleIn}
            className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-lg cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Syringe className="h-6 w-6" />
            </div>
            <span className="font-semibold" style={{ color: '#1B2A4A' }}>
              Vaccination Schedule
            </span>
            <span className="text-sm text-gray-500">View upcoming vaccination calendar</span>
          </motion.div>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Book a Visit Form                                                 */}
        {/* ----------------------------------------------------------------- */}
        <motion.section
          id="book-form"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#1B2A4A' }}>
            Book a Visit
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Fill out the details below and a certified veterinarian will be assigned to your farm.
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
                Visit Booked Successfully
              </h3>
              <p className="max-w-md text-sm text-gray-500">
                Your veterinary visit has been scheduled. A vet will confirm the appointment
                within 24 hours. You will receive an SMS notification.
              </p>
              <button
                onClick={resetForm}
                className="mt-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#5DB347' }}
              >
                Book Another Visit
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Animal Type */}
                <div>
                  <label htmlFor="animalType" className="mb-1 block text-sm font-medium text-gray-700">
                    Animal Type
                  </label>
                  <select
                    id="animalType"
                    value={animalType}
                    onChange={(e) => setAnimalType(e.target.value as AnimalType)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#5DB347] focus:outline-none focus:ring-1 focus:ring-[#5DB347]"
                    required
                  >
                    <option value="">Select animal type...</option>
                    {ANIMAL_TYPES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Animals */}
                <div>
                  <label htmlFor="numAnimals" className="mb-1 block text-sm font-medium text-gray-700">
                    Number of Animals
                  </label>
                  <input
                    id="numAnimals"
                    type="number"
                    min="1"
                    value={numAnimals}
                    onChange={(e) => setNumAnimals(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#5DB347] focus:outline-none focus:ring-1 focus:ring-[#5DB347]"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label htmlFor="serviceType" className="mb-1 block text-sm font-medium text-gray-700">
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#5DB347] focus:outline-none focus:ring-1 focus:ring-[#5DB347]"
                    required
                  >
                    <option value="">Select service type...</option>
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Date */}
                <div>
                  <label htmlFor="prefDate" className="mb-1 block text-sm font-medium text-gray-700">
                    Preferred Date
                  </label>
                  <input
                    id="prefDate"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-[#5DB347] focus:outline-none focus:ring-1 focus:ring-[#5DB347]"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details (symptoms, special requirements, location directions)..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#5DB347] focus:outline-none focus:ring-1 focus:ring-[#5DB347]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#5DB347' }}
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Booking...' : 'Book Visit'}
              </button>
            </form>
          )}
        </motion.section>

        {/* ----------------------------------------------------------------- */}
        {/* Upcoming & Recent Visits                                          */}
        {/* ----------------------------------------------------------------- */}
        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="mb-10"
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#1B2A4A' }}>
            Upcoming &amp; Recent Visits
          </h2>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {liveVisits.map((v) => {
              const style = statusStyles[v.status];
              return (
                <motion.div
                  key={v.id}
                  variants={fadeUp}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold" style={{ color: '#1B2A4A' }}>
                        {v.vetName}
                      </h3>
                      <span className="text-xs text-gray-400">{v.id}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {v.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck className="h-3.5 w-3.5 text-gray-400" />
                      {v.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5 text-gray-400" />
                      {v.serviceType}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-gray-400" />
                      {v.animalType}
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
            {/* 24/7 Emergency Hotline */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                  24/7 Emergency Hotline
                </p>
                <p className="text-sm font-semibold" style={{ color: '#5DB347' }}>
                  0800-VET-HELP
                </p>
              </div>
            </div>

            {/* Disease Prevention Guides */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md cursor-pointer">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                  Disease Prevention Guides
                </p>
                <p className="text-xs text-gray-400">Keep your livestock healthy</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
            </div>

            {/* Feed Calculator */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md cursor-pointer">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                  Feed Calculator
                </p>
                <p className="text-xs text-gray-400">Optimize feed for your herd</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
