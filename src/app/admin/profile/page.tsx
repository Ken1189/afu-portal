'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

interface ProfileFields {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  role: string;
  created_at: string | null;
  last_sign_in_at: string | null;
}

export default function AdminProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [fields, setFields] = useState<ProfileFields>({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: null,
    role: '',
    created_at: null,
    last_sign_in_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url, role, created_at')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        showToast('error', 'Failed to load profile');
      } else if (data) {
        setFields({
          full_name: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || null,
          role: data.role || '',
          created_at: data.created_at || user.created_at || null,
          last_sign_in_at: user.last_sign_in_at || null,
        });
      } else {
        setFields((f) => ({
          ...f,
          email: user.email || '',
          created_at: user.created_at || null,
          last_sign_in_at: user.last_sign_in_at || null,
        }));
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fields.full_name,
          phone: fields.phone,
          avatar_url: fields.avatar_url,
        })
        .eq('id', user.id);
      if (error) throw error;
      showToast('success', 'Profile updated successfully');
      try {
        await refreshProfile?.();
      } catch {}
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      showToast('success', `Password reset link sent to ${user.email}`);
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to send reset link');
    } finally {
      setResetting(false);
    }
  };

  const handleAvatarChange = (url: string) => {
    setFields((f) => ({ ...f, avatar_url: url }));
    setAvatarVersion(Date.now());
  };

  const displayAvatar = fields.avatar_url
    ? `${fields.avatar_url}${fields.avatar_url.includes('?') ? '&' : '?'}t=${avatarVersion}`
    : null;

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatDateTime = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your admin account</p>
      </div>

      {/* Avatar + meta card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex-shrink-0">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#2A3F6A] flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-100">
                {(fields.full_name || fields.email || 'A').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-xl font-semibold text-[#1B2A4A]">
              {fields.full_name || 'Unnamed Admin'}
            </h2>
            <p className="text-sm text-gray-500">{fields.email}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wide">
                  <Shield className="w-3 h-3" /> Role
                </div>
                <div className="text-sm font-semibold text-[#1B2A4A] mt-0.5 capitalize">
                  {fields.role.replace('_', ' ') || '—'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wide">
                  <Calendar className="w-3 h-3" /> Joined
                </div>
                <div className="text-sm font-semibold text-[#1B2A4A] mt-0.5">
                  {formatDate(fields.created_at)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wide">
                  <Clock className="w-3 h-3" /> Last Login
                </div>
                <div className="text-sm font-semibold text-[#1B2A4A] mt-0.5">
                  {formatDateTime(fields.last_sign_in_at)}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <ImageUploader
                bucket="avatars"
                folder={user?.id}
                value={fields.avatar_url}
                onChange={handleAvatarChange}
                round={true}
                compact={true}
                label="Change avatar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editable details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Personal Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={fields.full_name}
              onChange={(e) => setFields({ ...fields, full_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-sm"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Mail className="w-3.5 h-3.5 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={fields.email}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Phone className="w-3.5 h-3.5 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={fields.phone}
              onChange={(e) => setFields({ ...fields, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-sm"
              placeholder="+254..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#5DB347] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#4ea03c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2">Security</h2>
        <p className="text-sm text-gray-500 mb-4">
          We&apos;ll email you a secure link to change your password.
        </p>
        <button
          onClick={handlePasswordReset}
          disabled={resetting}
          className="inline-flex items-center gap-2 border border-[#1B2A4A] text-[#1B2A4A] px-5 py-2.5 rounded-xl font-medium hover:bg-[#1B2A4A] hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {resetting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" /> Send Password Reset Email
            </>
          )}
        </button>
      </div>
    </div>
  );
}
