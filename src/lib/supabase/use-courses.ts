'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from './client';
import { captureError } from '@/lib/capture-error';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  duration_minutes: number;
  modules_count: number;
  instructor: string | null;
  instructor_avatar: string | null;
  thumbnail_url: string | null;
  rating: number;
  enrollment_count: number;
  topics: string[] | null;
  is_published: boolean;
  country_scope: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CourseModuleRow {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  content_url: string | null;
  duration_minutes: number | null;
  created_at: string;
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

// ---------------------------------------------------------------------------
// useCourses — fetch all published courses, subscribe to changes
// ---------------------------------------------------------------------------

export function useCourses() {
  const supabase = useMemo(() => createClient(), []);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('[useCourses] fetch error:', fetchError);
        setError(fetchError.message);
        setCourses([]);
      } else {
        setCourses((data || []) as CourseRow[]);
      }
    } catch (err) {
      captureError('useCourses.fetch', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('courses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        fetchCourses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCourses]);

  return { courses, loading, error, fetchCourses, refetch: fetchCourses };
}

// ---------------------------------------------------------------------------
// useCourseModules — fetch modules for a course
// ---------------------------------------------------------------------------

export function useCourseModules(courseId: string) {
  const supabase = useMemo(() => createClient(), []);
  const [modules, setModules] = useState<CourseModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (fetchError) {
        console.error('[useCourseModules] fetch error:', fetchError);
        setError(fetchError.message);
        setModules([]);
      } else {
        setModules((data || []) as CourseModuleRow[]);
      }
    } catch (err) {
      captureError('useCourseModules.fetch', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return { modules, loading, error, fetchModules, refetch: fetchModules };
}

// ---------------------------------------------------------------------------
// useCourseEnrollments — fetch enrollments for current member
// ---------------------------------------------------------------------------

export function useCourseEnrollments(memberId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [enrollments, setEnrollments] = useState<CourseEnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('course_enrollments')
        .select('*, course:courses(*)')
        .order('enrolled_at', { ascending: false });

      if (memberId) query = query.eq('member_id', memberId);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useCourseEnrollments] fetch error:', fetchError);
        setError(fetchError.message);
        setEnrollments([]);
      } else {
        setEnrollments((data || []) as CourseEnrollmentRow[]);
      }
    } catch (err) {
      captureError('useCourseEnrollments.fetch', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, memberId]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('course-enrollments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'course_enrollments' }, () => {
        fetchEnrollments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchEnrollments]);

  const completedCount = enrollments.filter((e) => e.completed_at).length;

  return { enrollments, loading, error, completedCount, fetchEnrollments, refetch: fetchEnrollments };
}

// ---------------------------------------------------------------------------
// enrollInCourse — insert enrollment
// ---------------------------------------------------------------------------

export function enrollInCourse() {
  const enroll = async (courseId: string, memberId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({ course_id: courseId, member_id: memberId })
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      captureError('enrollInCourse', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { enroll };
}

// ---------------------------------------------------------------------------
// updateProgress — update progress_percent on an enrollment
// ---------------------------------------------------------------------------

export function updateProgress() {
  const update = async (enrollmentId: string, progress: number) => {
    try {
      const supabase = createClient();
      const updates: Record<string, unknown> = { progress_percent: progress };
      if (progress >= 100) updates.completed_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('course_enrollments')
        .update(updates)
        .eq('id', enrollmentId)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      captureError('updateProgress', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { update };
}
