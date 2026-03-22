'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle2, DollarSign, FileText, AlertTriangle, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

const categoryIcons: Record<string, typeof Bell> = {
  loan: DollarSign,
  kyc: FileText,
  payment: DollarSign,
  system: Info,
  alert: AlertTriangle,
  membership: CheckCircle2,
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    (async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) setNotifications(data as Notification[]);
    })();
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center min-w-[18px] px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-navy">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-[#5DB347] font-medium hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length > 0 ? (
                notifications.map((n) => {
                  const Icon = categoryIcons[n.category] || Bell;
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.action_url) window.location.href = n.action_url;
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${
                        !n.is_read ? 'bg-[#EBF7E5]/30' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {!n.is_read && (
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityColors[n.priority] || 'bg-blue-500'}`} />
                          )}
                          <p className={`text-xs truncate ${!n.is_read ? 'font-semibold text-navy' : 'font-medium text-gray-700'}`}>
                            {n.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No notifications yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
