'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Check,
  CheckCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url: string | null;
  created_at: string;
}

// ── Animation ────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  info: { icon: <Info className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  success: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-50' },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  error: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50' },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, type, read, action_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(
          data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            title: (row.title as string) || 'Notification',
            message: (row.message as string) || '',
            type: ((row.type as string) || 'info') as Notification['type'],
            read: (row.read as boolean) ?? false,
            action_url: (row.action_url as string) || null,
            created_at: (row.created_at as string) || '',
          }))
        );
      }
    } catch {
      // Silent fail
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setMarkingId(id);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
    setMarkingId(null);
  };

  const markAllRead = async () => {
    if (!user) return;
    setMarkingAll(true);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
    setMarkingAll(false);
  };

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#8CB89C]" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === 'all' ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === 'unread' ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#8CB89C]/10 text-[#8CB89C] hover:bg-[#8CB89C]/20 transition-colors disabled:opacity-50"
            >
              {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
              Mark all read
            </button>
          )}
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#8CB89C] animate-spin" />
        </div>
      )}

      {/* Notification list */}
      {!loading && filtered.length > 0 && (
        <motion.div variants={containerVariants} className="space-y-2">
          {filtered.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.info;
            return (
              <motion.div
                key={notification.id}
                variants={itemVariants}
                className={`bg-white rounded-xl border p-4 transition-colors ${
                  notification.read
                    ? 'border-gray-100 opacity-75'
                    : 'border-[#8CB89C]/30 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5 ${config.color}`}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`text-sm font-semibold ${notification.read ? 'text-gray-500' : 'text-[#1B2A4A]'}`}>
                          {notification.title}
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-[#8CB89C] rounded-full ml-2 align-middle" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          disabled={markingId === notification.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          {markingId === notification.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Mark as read
                        </button>
                      )}
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#8CB89C]/10 text-[#8CB89C] hover:bg-[#8CB89C]/20 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-16">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-1">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {filter === 'unread'
              ? 'You\'re all caught up! Switch to "All" to see past notifications.'
              : 'When you receive notifications, they will appear here.'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
