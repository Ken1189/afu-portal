'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

export interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  duration_minutes: number;
  modules_count: number;
  instructor: string | null;
  rating: number;
  image_url: string | null;
  topics: string[] | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollmentRow {
  id: string;
  course_id: string;
  member_id: string;
  progress_percent: number;
  completed_at: string | null;
  enrolled_at: string;
  course?: CourseRow;
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (fetchError) { setError(fetchError.message); setCourses([]); }
    else { setCourses((data as CourseRow[]) || []); }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return { courses, loading, error, fetchCourses };
}

export function useEnrollments(memberId?: string) {
  const [enrollments, setEnrollments] = useState<CourseEnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('course_enrollments')
      .select('*, course:courses(*)')
      .order('enrolled_at', { ascending: false });
    if (memberId) query = query.eq('member_id', memberId);
    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setEnrollments([]); }
    else { setEnrollments((data as CourseEnrollmentRow[]) || []); }
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  const enroll = async (courseId: string, memberId: string) => {
    const { error } = await supabase.from('course_enrollments').insert({ course_id: courseId, member_id: memberId });
    if (!error) await fetchEnrollments();
    return { error: error?.message || null };
  };

  const updateProgress = async (enrollmentId: string, progress: number) => {
    const updates: Record<string, unknown> = { progress_percent: progress };
    if (progress >= 100) updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from('course_enrollments').update(updates).eq('id', enrollmentId);
    if (!error) await fetchEnrollments();
    return { error: error?.message || null };
  };

  const completedCount = enrollments.filter(e => e.completed_at).length;

  return { enrollments, loading, error, completedCount, fetchEnrollments, enroll, updateProgress };
}
