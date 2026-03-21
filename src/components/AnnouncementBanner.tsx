'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';
import Link from 'next/link';

interface Announcement {
  id: string;
  message: string;
  link_url: string | null;
  link_text: string | null;
  bg_color: string;
  text_color: string;
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedId = sessionStorage.getItem('dismissed_announcement');

    const supabase = createClient();
    supabase
      .from('announcements')
      .select('id, message, link_url, link_text, bg_color, text_color')
      .eq('is_active', true)
      .order('display_order', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0] && data[0].id !== dismissedId) {
          setAnnouncement(data[0]);
          // Trigger slide-down animation after a brief delay
          setTimeout(() => setVisible(true), 50);
        }
      });
  }, []);

  if (!announcement || dismissed) return null;

  return (
    <div
      style={{
        background: announcement.bg_color,
        color: announcement.text_color,
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
          style={{ color: announcement.text_color }}
        >
          {announcement.link_text || 'Learn more \u2192'}
        </Link>
      )}
      <button
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem('dismissed_announcement', announcement.id);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
