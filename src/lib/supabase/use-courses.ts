'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

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
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setCourses([]);
    } else {
      setCourses((data as CourseRow[]) || []);
    }
    setLoading(false);
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

  return { courses, loading, error, fetchCourses };
}

// ---------------------------------------------------------------------------
// useCourseModules — fetch modules for a course
// ---------------------------------------------------------------------------

export function useCourseModules(courseId: string) {
  const [modules, setModules] = useState<CourseModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchModules = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setModules([]);
    } else {
      setModules((data as CourseModuleRow[]) || []);
    }
    setLoading(false);
  }, [supabase, courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return { modules, loading, error, fetchModules };
}

// ---------------------------------------------------------------------------
// useCourseEnrollments — fetch enrollments for current member
// ---------------------------------------------------------------------------

export function useCourseEnrollments(memberId?: string) {
  const [enrollments, setEnrollments] = useState<CourseEnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('course_enrollments')
      .select('*, course:courses(*)')
      .order('enrolled_at', { ascending: false });

    if (memberId) query = query.eq('member_id', memberId);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setEnrollments([]);
    } else {
      setEnrollments((data as CourseEnrollmentRow[]) || []);
    }
    setLoading(false);
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

  return { enrollments, loading, error, completedCount, fetchEnrollments };
}

// ---------------------------------------------------------------------------
// enrollInCourse — insert enrollment
// ---------------------------------------------------------------------------

export function enrollInCourse() {
  const supabase = createClient();

  const enroll = async (courseId: string, memberId: string) => {
    const { error } = await supabase
      .from('course_enrollments')
      .insert({ course_id: courseId, member_id: memberId });
    return { error: error?.message || null };
  };

  return { enroll };
}

// ---------------------------------------------------------------------------
// updateProgress — update progress_percent on an enrollment
// ---------------------------------------------------------------------------

export function updateProgress() {
  const supabase = createClient();

  const update = async (enrollmentId: string, progress: number) => {
    const updates: Record<string, unknown> = { progress_percent: progress };
    if (progress >= 100) updates.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('course_enrollments')
      .update(updates)
      .eq('id', enrollmentId);
    return { error: error?.message || null };
  };

  return { update };
}
