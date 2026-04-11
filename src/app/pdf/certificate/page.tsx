'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Printer } from 'lucide-react';

interface Enrollment {
  id: string;
  course_id: string;
  member_id: string;
  progress_percent: number;
  completed_at: string | null;
  enrolled_at: string;
  course?: {
    title: string;
    category: string;
    instructor: string | null;
    duration_minutes: number;
  } | null;
  member?: {
    member_id: string;
    profile?: {
      full_name: string;
    } | null;
  } | null;
}

export default function CertificatePdfPage() {
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('id');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enrollmentId) {
      setError('No enrollment ID provided. Add ?id=xxx to the URL.');
      setLoading(false);
      return;
    }

    async function fetchEnrollment() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(title, category, instructor, duration_minutes),
          member:members(member_id, profile:profiles(full_name))
        `)
        .eq('id', enrollmentId!)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setEnrollment(data as unknown as Enrollment);
      }
      setLoading(false);
    }

    fetchEnrollment();
  }, [enrollmentId]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green" />
        <span className="ml-3 text-navy">Loading certificate...</span>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error</p>
          <p className="text-gray-600 mt-1">{error || 'Enrolment not found'}</p>
        </div>
      </div>
    );
  }

  if (!enrollment.completed_at) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gold font-semibold">Course Not Yet Completed</p>
          <p className="text-gray-600 mt-1">This certificate will be available once the course is completed.</p>
          <p className="text-sm text-gray-400 mt-2">Current progress: {enrollment.progress_percent}%</p>
        </div>
      </div>
    );
  }

  const farmerName = enrollment.member?.profile?.full_name || '-';
  const courseTitle = enrollment.course?.title || '-';
  const instructor = enrollment.course?.instructor;
  const category = enrollment.course?.category;
  const completionDate = new Date(enrollment.completed_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  // Generate a certificate number from the enrollment ID
  const certNumber = `AFU-CERT-${enrollment.id.slice(0, 8).toUpperCase()}`;

  return (
    <>
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, footer, .site-navbar, .site-footer, .announcement-banner,
          .cookie-consent, .chat-widget, .no-print { display: none !important; }
          @page { margin: 10mm; size: A4 landscape; }
        }
        @media screen {
          .cert-page { max-width: 1000px; margin: 0 auto; padding: 40px 24px; }
        }
      `}</style>

      <div className="cert-page bg-white min-h-screen">
        {/* Print Button */}
        <div className="no-print fixed bottom-6 right-6 z-50">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green hover:bg-green-dark text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors cursor-pointer"
          >
            <Printer className="h-5 w-5" />
            Download PDF
          </button>
        </div>

        {/* Certificate */}
        <div className="border-4 border-double border-green p-12 min-h-[600px] flex flex-col items-center justify-center text-center">
          <div className="border-2 border-gold p-10 w-full">
            {/* AFU Header */}
            <h1 className="text-base font-semibold text-green uppercase tracking-[0.15em] mb-2">
              African Farming Union
            </h1>
            <p className="text-xs text-gray-400 mb-6">Education &amp; Training Division</p>

            {/* Title */}
            <div className="text-[32px] font-bold text-navy my-4">
              Certificate of Completion
            </div>

            {/* Decorative line */}
            <div className="w-20 h-[3px] bg-gold mx-auto my-4" />

            {/* Preamble */}
            <p className="text-sm text-gray-500 mb-6">This certifies that</p>

            {/* Farmer Name */}
            <div className="text-[28px] font-bold text-navy mb-6">
              {farmerName}
            </div>

            {/* Course */}
            <p className="text-sm text-gray-500 mb-2">has successfully completed the course</p>
            <div className="text-xl font-semibold text-green mb-2">
              {courseTitle}
            </div>
            {category && (
              <p className="text-xs text-gray-400 mb-6">Category: {category}</p>
            )}

            {/* Details Grid */}
            <div className="flex justify-center gap-12 mt-8 text-sm text-gray-500">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Date of Completion</p>
                <p className="font-semibold text-navy mt-1">{completionDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Certificate No.</p>
                <p className="font-semibold text-navy mt-1">{certNumber}</p>
              </div>
              {instructor && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Instructor</p>
                  <p className="font-semibold text-navy mt-1">{instructor}</p>
                </div>
              )}
            </div>

            {/* Footer line */}
            <div className="mt-12 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                African Farming Union &middot; Education &amp; Training Division
              </p>
              <p className="text-[11px] text-gray-300 mt-1">africanfarmingunion.org</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
