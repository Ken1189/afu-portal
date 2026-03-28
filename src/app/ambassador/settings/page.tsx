'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Save,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Payout fields
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  // Notification preferences
  const [notifyNewReferral, setNotifyNewReferral] = useState(true);
  const [notifyCommission, setNotifyCommission] = useState(true);
  const [notifyPayout, setNotifyPayout] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Set profile data
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
    }

    const supabase = createClient();

    async function fetchAmbassador() {
      try {
        const { data: ambassador } = await supabase
          .from('ambassadors')
          .select('payout_method, payout_details, notification_preferences')
          .eq('user_id', user!.id)
          .single();

        if (ambassador) {
          if (ambassador.payout_method) setPayoutMethod(ambassador.payout_method);
          if (ambassador.payout_details) {
            const details = typeof ambassador.payout_details === 'string'
              ? JSON.parse(ambassador.payout_details)
              : ambassador.payout_details;
            setBankName(details.bank_name || '');
            setAccountNumber(details.account_number || '');
            setMobileNumber(details.mobile_number || '');
            setPaypalEmail(details.paypal_email || '');
          }
          if (ambassador.notification_preferences) {
            const prefs = typeof ambassador.notification_preferences === 'string'
              ? JSON.parse(ambassador.notification_preferences)
              : ambassador.notification_preferences;
            setNotifyNewReferral(prefs.new_referral !== false);
            setNotifyCommission(prefs.commission_earned !== false);
            setNotifyPayout(prefs.payout_processed !== false);
          }
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    }

    fetchAmbassador();
  }, [user, profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const supabase = createClient();

      // Update profile
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', user.id);

      // Update ambassador settings
      const payoutDetails: Record<string, string> = {};
      if (payoutMethod === 'bank_transfer') {
        payoutDetails.bank_name = bankName;
        payoutDetails.account_number = accountNumber;
      } else if (payoutMethod === 'mobile_money') {
        payoutDetails.mobile_number = mobileNumber;
      } else if (payoutMethod === 'paypal') {
        payoutDetails.paypal_email = paypalEmail;
      }

      await supabase
        .from('ambassadors')
        .update({
          payout_method: payoutMethod,
          payout_details: payoutDetails,
          notification_preferences: {
            new_referral: notifyNewReferral,
            commission_earned: notifyCommission,
            payout_processed: notifyPayout,
          },
        })
        .eq('user_id', user.id);

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-[#5DB347]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile, payout method, and notification preferences.</p>
      </div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Profile Information</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 700 000 000"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
            />
          </div>
        </div>
      </motion.div>

      {/* Payout Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Payout Method</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Payout Method</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'mobile_money', label: 'Mobile Money' },
              { value: 'paypal', label: 'PayPal' },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setPayoutMethod(method.value)}
                className={`py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                  payoutMethod === method.value
                    ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {payoutMethod === 'bank_transfer' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., KCB Bank"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
              />
            </div>
          </div>
        )}

        {payoutMethod === 'mobile_money' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Money Number</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="+254 700 000 000"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] max-w-md"
            />
          </div>
        )}

        {payoutMethod === 'paypal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">PayPal Email</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="paypal@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] max-w-md"
            />
          </div>
        )}
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Notification Preferences</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'New Referral Signup', desc: 'Get notified when someone signs up using your referral link.', value: notifyNewReferral, setter: setNotifyNewReferral },
            { label: 'Commission Earned', desc: 'Get notified when you earn a new commission.', value: notifyCommission, setter: setNotifyCommission },
            { label: 'Payout Processed', desc: 'Get notified when your payout has been processed.', value: notifyPayout, setter: setNotifyPayout },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">{pref.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
              </div>
              <button
                onClick={() => pref.setter(!pref.value)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  pref.value ? 'bg-[#5DB347]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    pref.value ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#5DB347] text-white font-medium text-sm hover:bg-[#4ea03c] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-sm text-green-600">Your settings have been updated successfully.</span>
        )}
      </motion.div>
    </div>
  );
}
