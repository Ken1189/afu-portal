'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Users,
  DollarSign,
  Server,
  Mail,
  Smartphone,
  MonitorSpeaker,
  AppWindow,
  CheckCircle2,
  Archive,
  Eye,
  Trash2,
  Copy,
  Edit3,
  Send,
  Clock,
  Filter,
  Search,
  MailOpen,
  ShieldAlert,
  Info,
  CreditCard,
  UserPlus,
  Settings2,
} from 'lucide-react';

// ── Animation variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
};

// ── Types ──
type TabKey = 'inbox' | 'sent' | 'templates' | 'settings';
type InboxFilter = 'all' | 'unread' | 'critical' | 'system' | 'member' | 'financial';
type NotificationType = 'critical' | 'system' | 'member' | 'financial' | 'info';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  source: string;
}

interface SentNotification {
  id: number;
  recipients: string;
  subject: string;
  sentDate: string;
  status: 'delivered' | 'failed' | 'pending';
  openRate: string;
}

interface NotificationTemplate {
  id: number;
  name: string;
  category: string;
  preview: string;
}

// ── Mock Data ──
const notifications: Notification[] = [
  { id: 1, type: 'critical', title: 'Loan Default Alert', message: 'Member AFU-2024-032 has missed 3 consecutive payments on Working Capital loan WC-0145.', timestamp: '5 min ago', read: false, priority: 'high', source: 'Financial System' },
  { id: 2, type: 'system', title: 'System Maintenance Scheduled', message: 'Platform maintenance window scheduled for Saturday 22:00-02:00 UTC. All services will be affected.', timestamp: '15 min ago', read: false, priority: 'medium', source: 'DevOps' },
  { id: 3, type: 'member', title: 'New Membership Application', message: 'Grace Nyathi from Zimbabwe has submitted a Tier A membership application with all required documents.', timestamp: '32 min ago', read: false, priority: 'medium', source: 'Applications' },
  { id: 4, type: 'financial', title: 'Large Disbursement Pending', message: '$50,000 disbursement for Sarah Dube (Invoice Finance) requires secondary approval.', timestamp: '1 hr ago', read: false, priority: 'high', source: 'Disbursements' },
  { id: 5, type: 'critical', title: 'Compliance Deadline Approaching', message: 'Annual FIRS compliance report due in 3 days. 4 member files still incomplete.', timestamp: '2 hr ago', read: false, priority: 'high', source: 'Compliance' },
  { id: 6, type: 'member', title: 'Training Completion - Batch 12', message: '18 farmers have completed the GlobalGAP Certification program. Certificates ready for issuance.', timestamp: '3 hr ago', read: true, priority: 'low', source: 'Training' },
  { id: 7, type: 'system', title: 'Database Backup Completed', message: 'Nightly database backup completed successfully. All 12 collections backed up (2.4 GB).', timestamp: '4 hr ago', read: true, priority: 'low', source: 'Infrastructure' },
  { id: 8, type: 'financial', title: 'Monthly Collections Summary', message: 'February collections: $245,000 collected (94.2% rate). 12 accounts require follow-up.', timestamp: '5 hr ago', read: true, priority: 'medium', source: 'Collections' },
  { id: 9, type: 'member', title: 'Member Profile Updated', message: 'Baraka Mwanga updated farm details: added 15 hectares, new crop types (avocado, macadamia).', timestamp: '6 hr ago', read: true, priority: 'low', source: 'Member Portal' },
  { id: 10, type: 'critical', title: 'Export Shipment Delayed', message: 'Container MAEU-4521 delayed at Beira port. ETA pushed by 5 days. Buyer notified.', timestamp: '8 hr ago', read: true, priority: 'high', source: 'Exports' },
  { id: 11, type: 'system', title: 'API Rate Limit Warning', message: 'Payment gateway API approaching rate limit (85% of daily quota). Consider load balancing.', timestamp: '10 hr ago', read: true, priority: 'medium', source: 'Monitoring' },
  { id: 12, type: 'financial', title: 'New Loan Application', message: 'Peter Banda applied for Equipment Finance ($30,000) for irrigation system purchase.', timestamp: '12 hr ago', read: true, priority: 'medium', source: 'Loans' },
  { id: 13, type: 'member', title: 'Supplier Registration', message: 'AgriChem Solutions registered as a new supplier. Pending verification and approval.', timestamp: '14 hr ago', read: true, priority: 'low', source: 'Marketplace' },
  { id: 14, type: 'system', title: 'SSL Certificate Renewal', message: 'SSL certificate for api.afuportal.com renewed successfully. Valid until March 2027.', timestamp: '1 day ago', read: true, priority: 'low', source: 'Security' },
  { id: 15, type: 'info', title: 'Weekly Digest Ready', message: 'Your weekly platform activity summary for March 3-9 is ready for review.', timestamp: '1 day ago', read: true, priority: 'low', source: 'Reports' },
];

const sentNotifications: SentNotification[] = [
  { id: 1, recipients: 'All Members (342)', subject: 'Q1 2026 Platform Updates & New Features', sentDate: 'Mar 14, 2026', status: 'delivered', openRate: '68%' },
  { id: 2, recipients: 'Tier A Members (89)', subject: 'Exclusive Export Opportunity - European Buyer', sentDate: 'Mar 13, 2026', status: 'delivered', openRate: '82%' },
  { id: 3, recipients: 'Training Batch 12 (18)', subject: 'GlobalGAP Certificate Available for Download', sentDate: 'Mar 12, 2026', status: 'delivered', openRate: '94%' },
  { id: 4, recipients: 'Financial Team (8)', subject: 'Monthly Collections Report - February 2026', sentDate: 'Mar 10, 2026', status: 'delivered', openRate: '100%' },
  { id: 5, recipients: 'Overdue Accounts (12)', subject: 'Payment Reminder - Immediate Action Required', sentDate: 'Mar 9, 2026', status: 'delivered', openRate: '75%' },
  { id: 6, recipients: 'Zimbabwe Region (156)', subject: 'Upcoming Training: Post-Harvest Handling', sentDate: 'Mar 8, 2026', status: 'delivered', openRate: '61%' },
  { id: 7, recipients: 'All Suppliers (45)', subject: 'New Marketplace Policies - Effective April 1', sentDate: 'Mar 7, 2026', status: 'delivered', openRate: '73%' },
  { id: 8, recipients: 'System Admins (5)', subject: 'Scheduled Maintenance - March 15', sentDate: 'Mar 6, 2026', status: 'failed', openRate: '0%' },
  { id: 9, recipients: 'New Members (23)', subject: 'Welcome to AFU - Getting Started Guide', sentDate: 'Mar 5, 2026', status: 'delivered', openRate: '87%' },
  { id: 10, recipients: 'Botswana Region (78)', subject: 'Regional Meeting Invitation - March 20', sentDate: 'Mar 4, 2026', status: 'pending', openRate: '-' },
];

const templates: NotificationTemplate[] = [
  { id: 1, name: 'Welcome Message', category: 'Onboarding', preview: 'Welcome to AFU! Your membership application has been approved. Here is how to get started with your account...' },
  { id: 2, name: 'Payment Reminder', category: 'Financial', preview: 'This is a reminder that your loan payment of {amount} is due on {date}. Please ensure timely payment to maintain...' },
  { id: 3, name: 'Loan Approval', category: 'Financial', preview: 'Congratulations! Your {loan_type} application for {amount} has been approved. Funds will be disbursed within...' },
  { id: 4, name: 'Compliance Alert', category: 'Regulatory', preview: 'Action Required: Your compliance documentation needs updating. Please submit the following by {deadline}...' },
  { id: 5, name: 'System Maintenance', category: 'System', preview: 'Scheduled maintenance will occur on {date} from {start_time} to {end_time}. During this time, the following...' },
  { id: 6, name: 'Training Invite', category: 'Training', preview: 'You have been invited to enroll in {program_name}. The program begins on {start_date} and covers...' },
];

// ── Helper: notification type config ──
function typeConfig(type: NotificationType) {
  switch (type) {
    case 'critical':
      return { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    case 'system':
      return { icon: <Server className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    case 'member':
      return { icon: <Users className="w-4 h-4" />, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' };
    case 'financial':
      return { icon: <DollarSign className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'info':
    default:
      return { icon: <Info className="w-4 h-4" />, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
  }
}

function priorityBadge(priority: 'high' | 'medium' | 'low') {
  switch (priority) {
    case 'high':
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold uppercase">High</span>;
    case 'medium':
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold uppercase">Medium</span>;
    case 'low':
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold uppercase">Low</span>;
  }
}

// ═══════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('inbox');
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>('all');
  const [notifState, setNotifState] = useState(notifications);
  const [searchQuery, setSearchQuery] = useState('');

  // Notification preferences (settings tab)
  const [prefs, setPrefs] = useState({
    email: true,
    sms: true,
    push: false,
    inApp: true,
    frequency: 'instant' as 'instant' | 'daily' | 'weekly',
    categories: {
      critical: { email: true, sms: true, push: true, inApp: true },
      system: { email: true, sms: false, push: false, inApp: true },
      member: { email: true, sms: false, push: false, inApp: true },
      financial: { email: true, sms: true, push: true, inApp: true },
      info: { email: false, sms: false, push: false, inApp: true },
    },
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'inbox', label: 'Inbox' },
    { key: 'sent', label: 'Sent' },
    { key: 'templates', label: 'Templates' },
    { key: 'settings', label: 'Settings' },
  ];

  const inboxFilters: { key: InboxFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'critical', label: 'Critical' },
    { key: 'system', label: 'System' },
    { key: 'member', label: 'Member' },
    { key: 'financial', label: 'Financial' },
  ];

  // ── Stats ──
  const totalNotifications = notifState.length;
  const unreadCount = notifState.filter((n) => !n.read).length;
  const criticalCount = notifState.filter((n) => n.type === 'critical' && !n.read).length;
  const sentToday = sentNotifications.filter((s) => s.sentDate.includes('Mar 14')).length;

  // ── Filtered inbox ──
  const filteredNotifications = notifState.filter((n) => {
    if (inboxFilter === 'unread') return !n.read;
    if (inboxFilter === 'critical') return n.type === 'critical';
    if (inboxFilter === 'system') return n.type === 'system';
    if (inboxFilter === 'member') return n.type === 'member';
    if (inboxFilter === 'financial') return n.type === 'financial';
    return true;
  }).filter((n) => {
    if (!searchQuery) return true;
    return n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           n.message.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const markAsRead = (id: number) => {
    setNotifState((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const archiveNotification = (id: number) => {
    setNotifState((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifState((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* ── Header ── */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Notification Center</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage alerts, messages, and notification preferences</p>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Notifications', value: totalNotifications, icon: <Bell className="w-5 h-5" />, color: 'text-[#1B2A4A]', iconBg: 'bg-[#1B2A4A]/10' },
          { label: 'Unread', value: unreadCount, icon: <MailOpen className="w-5 h-5" />, color: 'text-[#2AA198]', iconBg: 'bg-[#2AA198]/10' },
          { label: 'Critical Alerts', value: criticalCount, icon: <ShieldAlert className="w-5 h-5" />, color: 'text-red-600', iconBg: 'bg-red-50' },
          { label: 'Sent Today', value: sentToday, icon: <Send className="w-5 h-5" />, color: 'text-[#D4A843]', iconBg: 'bg-[#D4A843]/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Tab Switcher ── */}
      <motion.div variants={cardVariants} className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#1B2A4A] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ── Tab Content ── */}

      {/* ===== INBOX TAB ===== */}
      {activeTab === 'inbox' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {/* Filters & Bulk Actions */}
          <motion.div variants={cardVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-100 p-1">
                {inboxFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setInboxFilter(f.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      inboxFilter === f.key
                        ? 'bg-[#2AA198] text-white'
                        : 'text-gray-500 hover:text-[#1B2A4A] hover:bg-gray-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/50 w-56"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2AA198] bg-[#2AA198]/10 rounded-lg hover:bg-[#2AA198]/20 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Read
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Archive className="w-3.5 h-3.5" /> Archive Selected
              </button>
            </div>
          </motion.div>

          {/* Notification Cards */}
          <div className="space-y-2">
            {filteredNotifications.map((notif) => {
              const config = typeConfig(notif.type);
              return (
                <motion.div
                  key={notif.id}
                  variants={cardVariants}
                  className={`bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${
                    notif.read ? 'border-gray-100' : 'border-l-4 border-l-[#2AA198] border-t border-r border-b border-t-gray-100 border-r-gray-100 border-b-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Type Icon */}
                    <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                      {config.icon}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!notif.read && <div className="w-2 h-2 bg-[#2AA198] rounded-full flex-shrink-0" />}
                          <h4 className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-[#1B2A4A]'}`}>{notif.title}</h4>
                          {priorityBadge(notif.priority)}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">Source: {notif.source}</span>
                        <div className="flex gap-1.5">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#2AA198] bg-[#2AA198]/10 rounded-md hover:bg-[#2AA198]/20 transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => archiveNotification(notif.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <Archive className="w-3 h-3" /> Archive
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filteredNotifications.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No notifications match the current filter.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ===== SENT TAB ===== */}
      {activeTab === 'sent' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Recipient(s)</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Sent Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Open Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sentNotifications.map((sent) => (
                    <tr key={sent.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#1B2A4A]">{sent.recipients}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{sent.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{sent.sentDate}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          sent.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          sent.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {sent.status.charAt(0).toUpperCase() + sent.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{sent.openRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ===== TEMPLATES TAB ===== */}
      {activeTab === 'templates' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <motion.div key={tpl.id} variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#1B2A4A]">{tpl.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2AA198]/10 text-[#2AA198] font-medium mt-1 inline-block">
                    {tpl.category}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-3 mb-4">{tpl.preview}</p>
              <div className="flex gap-2 border-t border-gray-50 pt-3">
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#1B2A4A] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#2AA198] bg-[#2AA198]/10 rounded-lg hover:bg-[#2AA198]/20 transition-colors">
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ===== SETTINGS TAB ===== */}
      {activeTab === 'settings' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {/* Notification Channels */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Notification Channels
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'email' as const, label: 'Email', icon: <Mail className="w-5 h-5" />, desc: 'Receive via email' },
                { key: 'sms' as const, label: 'SMS', icon: <Smartphone className="w-5 h-5" />, desc: 'Text messages' },
                { key: 'push' as const, label: 'Push', icon: <MonitorSpeaker className="w-5 h-5" />, desc: 'Browser push' },
                { key: 'inApp' as const, label: 'In-App', icon: <AppWindow className="w-5 h-5" />, desc: 'In-app alerts' },
              ].map((ch) => (
                <div key={ch.key} className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  prefs[ch.key] ? 'border-[#2AA198] bg-[#2AA198]/5' : 'border-gray-100 bg-gray-50'
                }`} onClick={() => setPrefs((p) => ({ ...p, [ch.key]: !p[ch.key] }))}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${prefs[ch.key] ? 'text-[#2AA198]' : 'text-gray-400'}`}>{ch.icon}</div>
                    <div className={`w-10 h-5 rounded-full transition-all flex items-center ${
                      prefs[ch.key] ? 'bg-[#2AA198] justify-end' : 'bg-gray-300 justify-start'
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full shadow mx-0.5" />
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-[#1B2A4A]">{ch.label}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{ch.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Frequency Settings */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Frequency
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'instant' as const, label: 'Instant', desc: 'Get notified immediately' },
                { key: 'daily' as const, label: 'Daily Digest', desc: 'Summary every morning' },
                { key: 'weekly' as const, label: 'Weekly Summary', desc: 'Weekly overview on Monday' },
              ].map((freq) => (
                <button
                  key={freq.key}
                  onClick={() => setPrefs((p) => ({ ...p, frequency: freq.key }))}
                  className={`flex-1 min-w-[180px] p-4 rounded-xl border-2 text-left transition-all ${
                    prefs.frequency === freq.key
                      ? 'border-[#2AA198] bg-[#2AA198]/5'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <h4 className="text-sm font-medium text-[#1B2A4A]">{freq.label}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{freq.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Category Preferences Grid */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Category Preferences
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase">SMS</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Push</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase">In-App</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(Object.entries(prefs.categories) as [NotificationType, Record<string, boolean>][]).map(([cat, channels]) => (
                    <tr key={cat} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-[#1B2A4A] capitalize">{cat}</td>
                      {(['email', 'sms', 'push', 'inApp'] as const).map((ch) => (
                        <td key={ch} className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              setPrefs((p) => ({
                                ...p,
                                categories: {
                                  ...p.categories,
                                  [cat]: { ...p.categories[cat as keyof typeof p.categories], [ch]: !channels[ch] },
                                },
                              }))
                            }
                            className={`w-8 h-5 rounded-full transition-all flex items-center mx-auto ${
                              channels[ch] ? 'bg-[#2AA198] justify-end' : 'bg-gray-300 justify-start'
                            }`}
                          >
                            <div className="w-3.5 h-3.5 bg-white rounded-full shadow mx-0.5" />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
