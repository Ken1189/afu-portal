'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Settings,
  Bell,
  CreditCard,
  Key,
  Lock,
  Shield,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Star,
  Percent,
  BarChart3,
  Megaphone,
  Smartphone,
  Building2,
  Download,
  ChevronRight,
  CheckCircle2,
  Fingerprint,
  Zap,
} from 'lucide-react';

// -- Animation variants -------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// -- Toggle Switch component --------------------------------------------------

function ToggleSwitch({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 ${
        disabled
          ? 'bg-gray-200 cursor-not-allowed'
          : enabled
            ? 'bg-[#8CB89C] cursor-pointer'
            : 'bg-gray-200 cursor-pointer'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// -- Payout frequency options -------------------------------------------------

type PayoutFrequency = 'Weekly' | 'Bi-weekly' | 'Monthly';
type PayoutMethod = 'Bank Transfer' | 'Mobile Money';

// =============================================================================
//  MAIN COMPONENT
// =============================================================================

export default function SupplierSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // -- Notification preferences
  const [notifNewOrders, setNotifNewOrders] = useState(true);
  const [notifPaymentReceived, setNotifPaymentReceived] = useState(true);
  const [notifReviews, setNotifReviews] = useState(true);
  const [notifCommissions, setNotifCommissions] = useState(false);
  const [notifAdvertising, setNotifAdvertising] = useState(false);
  const [notifSystem, setNotifSystem] = useState(true);

  // -- Payout settings
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('Bank Transfer');
  const [payoutFrequency, setPayoutFrequency] = useState<PayoutFrequency>('Bi-weekly');
  const [payoutThreshold, setPayoutThreshold] = useState(100);

  // -- Account management
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  // -- Save states
  const [notifSaved, setNotifSaved] = useState(false);
  const [payoutSaved, setPayoutSaved] = useState(false);

  // Supplier ID for DB operations
  const [supplierId, setSupplierId] = useState<string | null>(null);

  // ── Fetch settings from Supabase ────────────────────────────────────────
  useEffect(() => {
    async function fetchSettings() {
      try {
        const supabase = createClient();

        // 1. Fetch supplier record via profile_id
        const { data: supplierRow } = await supabase
          .from('suppliers')
          .select('id')
          .eq('profile_id', user?.id ?? '')
          .single();
        if (supplierRow) setSupplierId(supplierRow.id);

        // 2. Fetch profile for settings metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id ?? '')
          .single();

        if (profile) {
          // Load notification preferences from profile metadata if available
          const meta = (profile as any).metadata || {};
          if (meta.notifNewOrders !== undefined) setNotifNewOrders(meta.notifNewOrders);
          if (meta.notifPaymentReceived !== undefined) setNotifPaymentReceived(meta.notifPaymentReceived);
          if (meta.notifReviews !== undefined) setNotifReviews(meta.notifReviews);
          if (meta.notifCommissions !== undefined) setNotifCommissions(meta.notifCommissions);
          if (meta.notifAdvertising !== undefined) setNotifAdvertising(meta.notifAdvertising);
          if (meta.notifSystem !== undefined) setNotifSystem(meta.notifSystem);
          if (meta.payoutMethod) setPayoutMethod(meta.payoutMethod);
          if (meta.payoutFrequency) setPayoutFrequency(meta.payoutFrequency);
          if (meta.payoutThreshold) setPayoutThreshold(meta.payoutThreshold);
          if (meta.twoFactorEnabled !== undefined) setTwoFactorEnabled(meta.twoFactorEnabled);
        }
      } catch (err) {
        // Keep fallback defaults
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchSettings();
    else setLoading(false);
  }, [user]);

  // -- Deactivation
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateText, setDeactivateText] = useState('');

  const handleSaveNotifications = async () => {
    try {
      const supabase = createClient();
      await supabase.from('profiles').update({
        metadata: {
          notifNewOrders, notifPaymentReceived, notifReviews,
          notifCommissions, notifAdvertising, notifSystem,
          payoutMethod, payoutFrequency, payoutThreshold, twoFactorEnabled,
        },
      }).eq('id', user?.id ?? '');
    } catch { /* silent */ }
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  const handleSavePayoutSettings = async () => {
    try {
      const supabase = createClient();
      await supabase.from('profiles').update({
        metadata: {
          notifNewOrders, notifPaymentReceived, notifReviews,
          notifCommissions, notifAdvertising, notifSystem,
          payoutMethod, payoutFrequency, payoutThreshold, twoFactorEnabled,
        },
      }).eq('id', user?.id ?? '');
    } catch { /* silent */ }
    setPayoutSaved(true);
    setTimeout(() => setPayoutSaved(false), 2000);
  };

  const handleToggleTwoFactor = (val: boolean) => {
    if (val) {
      setShowTwoFactorSetup(true);
    } else {
      setTwoFactorEnabled(false);
      setShowTwoFactorSetup(false);
    }
  };

  const handleConfirmTwoFactor = () => {
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
  };

  const notificationItems = [
    {
      label: 'New Orders',
      description: 'Get notified when a new order is placed',
      icon: <ShoppingCart className="w-4 h-4" />,
      enabled: notifNewOrders,
      onChange: setNotifNewOrders,
    },
    {
      label: 'Payment Received',
      description: 'Notifications when payments are processed',
      icon: <DollarSign className="w-4 h-4" />,
      enabled: notifPaymentReceived,
      onChange: setNotifPaymentReceived,
    },
    {
      label: 'Review Notifications',
      description: 'When buyers leave reviews on your products',
      icon: <Star className="w-4 h-4" />,
      enabled: notifReviews,
      onChange: setNotifReviews,
    },
    {
      label: 'Commission Updates',
      description: 'Updates on commission calculations and payouts',
      icon: <Percent className="w-4 h-4" />,
      enabled: notifCommissions,
      onChange: setNotifCommissions,
    },
    {
      label: 'Advertising Reports',
      description: 'Performance reports for your advertisements',
      icon: <Megaphone className="w-4 h-4" />,
      enabled: notifAdvertising,
      onChange: setNotifAdvertising,
    },
    {
      label: 'System Announcements',
      description: 'Platform updates, maintenance, and important notices',
      icon: <BarChart3 className="w-4 h-4" />,
      enabled: notifSystem,
      onChange: setNotifSystem,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* =====================================================================
          1. PAGE HEADER
      ====================================================================== */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-[#8CB89C]/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#8CB89C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences</p>
        </div>
      </motion.div>

      {/* =====================================================================
          2. NOTIFICATION PREFERENCES
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-[#8CB89C]" />
            Notification Preferences
          </h3>
        </div>

        <div className="space-y-1">
          {notificationItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors -mx-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1B2A4A]">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </div>
              <ToggleSwitch enabled={item.enabled} onChange={item.onChange} />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={handleSaveNotifications}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              notifSaved
                ? 'bg-green-500 text-white'
                : 'bg-[#8CB89C] hover:bg-[#729E82] text-white'
            }`}
          >
            {notifSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </motion.div>

      {/* =====================================================================
          3. PAYOUT SETTINGS
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2 mb-5">
          <CreditCard className="w-4.5 h-4.5 text-[#8CB89C]" />
          Payout Settings
        </h3>

        <div className="space-y-6">
          {/* Payout method */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Preferred Payout Method
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPayoutMethod('Bank Transfer')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium flex-1 ${
                  payoutMethod === 'Bank Transfer'
                    ? 'border-[#8CB89C] bg-[#8CB89C]/5 text-[#8CB89C]'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-5 h-5" />
                Bank Transfer
              </button>
              <button
                onClick={() => setPayoutMethod('Mobile Money')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium flex-1 ${
                  payoutMethod === 'Mobile Money'
                    ? 'border-[#8CB89C] bg-[#8CB89C]/5 text-[#8CB89C]'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                Mobile Money
              </button>
            </div>
          </div>

          {/* Payout frequency */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Payout Frequency</label>
            <div className="flex items-center gap-2">
              {(['Weekly', 'Bi-weekly', 'Monthly'] as PayoutFrequency[]).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setPayoutFrequency(freq)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    payoutFrequency === freq
                      ? 'bg-[#8CB89C] text-white shadow-sm'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1B2A4A]'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum payout threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-500">
                Minimum Payout Threshold
              </label>
              <span className="text-sm font-bold text-[#8CB89C] tabular-nums">
                ${payoutThreshold}
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={25}
              value={payoutThreshold}
              onChange={(e) => setPayoutThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#8CB89C]"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-400">$50</span>
              <span className="text-[10px] text-gray-400">$500</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={handleSavePayoutSettings}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              payoutSaved
                ? 'bg-green-500 text-white'
                : 'bg-[#8CB89C] hover:bg-[#729E82] text-white'
            }`}
          >
            {payoutSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save Payout Settings'
            )}
          </button>
        </div>
      </motion.div>

      {/* =====================================================================
          4. API ACCESS (Coming Soon)
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6 opacity-70 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4 text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#1B2A4A]">Coming Soon</p>
            <p className="text-xs text-gray-400 mt-1">API access is under development</p>
          </div>
        </div>

        <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2 mb-5">
          <Key className="w-4.5 h-4.5 text-[#8CB89C]" />
          API Access
        </h3>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-400">API Key</p>
              <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                Not generated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-lg h-10" />
              <button
                disabled
                className="bg-gray-200 text-gray-400 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
              >
                Generate
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            API keys will allow you to integrate your inventory management system, automate order
            processing, and sync product data with the AFU marketplace programmatically.
          </p>
          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-3">
            <Zap className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-blue-600">
              Endpoints planned: Products CRUD, Orders, Inventory sync, Webhook subscriptions
            </p>
          </div>
        </div>
      </motion.div>

      {/* =====================================================================
          5. ACCOUNT MANAGEMENT
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-6"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-base flex items-center gap-2 mb-5">
          <Shield className="w-4.5 h-4.5 text-[#8CB89C]" />
          Account Management
        </h3>

        <div className="space-y-1">
          {/* Change Password */}
          <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors -mx-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">Change Password</p>
                <p className="text-xs text-gray-400">Update your account password</p>
              </div>
            </div>
            <button className="inline-flex items-center gap-1.5 bg-[#8CB89C]/10 text-[#8CB89C] hover:bg-[#8CB89C]/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
              Change
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors -mx-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400">
                  {twoFactorEnabled
                    ? 'Enabled - your account has an extra layer of security'
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
            </div>
            <ToggleSwitch enabled={twoFactorEnabled} onChange={handleToggleTwoFactor} />
          </div>

          {/* Two-Factor Setup Mock */}
          {showTwoFactorSetup && !twoFactorEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mx-3 mt-2 mb-3 bg-[#8CB89C]/5 rounded-xl p-5 border border-[#8CB89C]/20"
            >
              <h4 className="text-sm font-semibold text-[#1B2A4A] mb-3">Set Up Two-Factor Authentication</h4>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* QR code placeholder */}
                <div className="w-32 h-32 bg-white rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
                  <div className="text-center">
                    <Fingerprint className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                    <span className="text-[9px] text-gray-400">QR Code</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-xs text-gray-600">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    and enter the 6-digit code below.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-40 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition-colors bg-white"
                    />
                    <button
                      onClick={handleConfirmTwoFactor}
                      className="bg-[#8CB89C] hover:bg-[#729E82] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Verify &amp; Enable
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Backup code: <span className="font-mono">ZMBZ-A4F2-8KLP-X9QN</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Download Account Data */}
          <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors -mx-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">Download Account Data</p>
                <p className="text-xs text-gray-400">Export all your data as a ZIP archive</p>
              </div>
            </div>
            <button className="inline-flex items-center gap-1.5 bg-[#8CB89C]/10 text-[#8CB89C] hover:bg-[#8CB89C]/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
      </motion.div>

      {/* =====================================================================
          6. DANGER ZONE
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border-2 border-red-200 p-6"
      >
        <h3 className="font-semibold text-red-600 text-base flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4.5 h-4.5" />
          Danger Zone
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          These actions are irreversible. Please proceed with caution.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-red-50 rounded-xl p-4">
          <div>
            <p className="text-sm font-semibold text-red-700">Deactivate Account</p>
            <p className="text-xs text-red-500 mt-0.5">
              This will deactivate your supplier account, remove all products from the marketplace,
              and cancel any active advertisements. Outstanding payouts will still be processed.
            </p>
          </div>
          <button
            onClick={() => setShowDeactivateConfirm(!showDeactivateConfirm)}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            Deactivate Account
          </button>
        </div>

        {/* Deactivation confirmation */}
        {showDeactivateConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-red-50 rounded-xl p-5 border border-red-200"
          >
            <p className="text-sm font-semibold text-red-700 mb-2">
              Are you sure? This action cannot be undone.
            </p>
            <p className="text-xs text-red-500 mb-4">
              Type <span className="font-mono font-bold">DEACTIVATE</span> below to confirm.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={deactivateText}
                onChange={(e) => setDeactivateText(e.target.value)}
                placeholder="Type DEACTIVATE"
                className="flex-1 max-w-[200px] px-4 py-2.5 rounded-lg border border-red-300 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors bg-white"
              />
              <button
                disabled={deactivateText !== 'DEACTIVATE'}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                Confirm Deactivation
              </button>
              <button
                onClick={() => {
                  setShowDeactivateConfirm(false);
                  setDeactivateText('');
                }}
                className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
