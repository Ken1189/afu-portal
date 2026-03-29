'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Announcement {
  id: string;
  title: string | null;
  message: string;
  link_url: string | null;
  link_text: string | null;
  bg_color: string;
  text_color: string;
  start_date: string | null;
  end_date: string | null;
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Don't show on admin/portal pages
  const isPortalPage = pathname?.startsWith('/admin') || pathname?.startsWith('/portal') || pathname?.startsWith('/farm') || pathname?.startsWith('/investor');

  useEffect(() => {
    if (isPortalPage) return;

    const dismissedId = localStorage.getItem('dismissed_announcement');

    const supabase = createClient();
    supabase
      .from('announcements')
      .select('id, title, message, link_url, link_text, bg_color, text_color, start_date, end_date')
      .eq('is_active', true)
      .order('display_order', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (!data || data.length === 0) return;

        const now = new Date();
        // Find the first active announcement that's within date range
        const active = data.find((a) => {
          if (a.id === dismissedId) return false;
          if (a.start_date && new Date(a.start_date) > now) return false;
          if (a.end_date && new Date(a.end_date) < now) return false;
          return true;
        });

        if (active) {
          setAnnouncement(active);
          setTimeout(() => setVisible(true), 50);
        }
      });
  }, [isPortalPage]);

  if (isPortalPage || !announcement || dismissed) return null;

  return (
    <div
      style={{
        background: announcement.bg_color || '#1B2A4A',
        color: announcement.text_color || '#FFFFFF',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-out',
      }}
      className="py-2 px-4 text-center text-sm font-medium relative z-50"
    >
      <span>{announcement.message}</span>
      {announcement.link_url && (
        <Link
          href={announcement.link_url}
          className="ml-2 underline font-semibold hover:opacity-90 transition-opacity"
          style={{ color: announcement.text_color || '#FFFFFF' }}
        >
          {announcement.link_text || 'Learn more \u2192'}
        </Link>
      )}
      <button
        onClick={() => {
          setDismissed(true);
          localStorage.setItem('dismissed_announcement', announcement.id);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
