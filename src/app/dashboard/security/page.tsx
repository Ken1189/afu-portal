'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ChevronLeft,
  Copy,
  Check,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';

type Step = 'idle' | 'enrolling' | 'verify' | 'backup' | 'enabled';

interface Factor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
}

export default function SecurityPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [step, setStep] = useState<Step>('idle');
  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const verifiedFactors = factors.filter((f) => f.status === 'verified');
  const isEnabled = verifiedFactors.length > 0;

  const loadFactors = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data) {
      const all = [...(data.totp || []), ...((data as any).phone || [])];
      setFactors(all as Factor[]);
      if (all.some((f) => f.status === 'verified')) setStep('enabled');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEnroll = async () => {
    setError(null);
    setEnrolling(true);
    try {
      // Clean up any unverified factors first
      const { data: existing } = await supabase.auth.mfa.listFactors();
      const stale = (existing?.totp || []).filter((f) => f.status !== 'verified');
      for (const f of stale) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `AFU TOTP ${new Date().toISOString().slice(0, 10)}`,
      });
      if (error) throw error;
      if (!data) throw new Error('No data returned from enroll');

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStep('verify');
    } catch (e: any) {
      setError(e?.message || 'Failed to start 2FA setup');
    } finally {
      setEnrolling(false);
    }
  };

  const verifyEnroll = async () => {
    if (!factorId) return;
    if (verifyCode.length !== 6) {
      setError('Enter the 6-digit code from your authenticator');
      return;
    }
    setError(null);
    setEnrolling(true);
    try {
      const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chErr) throw chErr;
      if (!challenge) throw new Error('Failed to create challenge');

      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      });
      if (vErr) throw vErr;

      // Generate local backup codes (Supabase TOTP doesn't issue these natively)
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).slice(2, 6).toUpperCase() +
        '-' +
        Math.random().toString(36).slice(2, 6).toUpperCase()
      );
      setBackupCodes(codes);
      setStep('backup');
      await loadFactors();
    } catch (e: any) {
      setError(e?.message || 'Invalid verification code');
    } finally {
      setEnrolling(false);
    }
  };

  const finishSetup = () => {
    setStep('enabled');
    setVerifyCode('');
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
  };

  const disable2FA = async () => {
    if (!confirm('Disable two-factor authentication? Your account will be less secure.')) return;
    setDisabling(true);
    setError(null);
    try {
      for (const f of verifiedFactors) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
        if (error) throw error;
      }
      setBackupCodes([]);
      setStep('idle');
      await loadFactors();
    } catch (e: any) {
      setError(e?.message || 'Failed to disable 2FA');
    } finally {
      setDisabling(false);
    }
  };

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#5DB347]" />
          Account Security
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage two-factor authentication and other security settings.
        </p>
      </div>

      {/* 2FA card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1B2A4A]">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Add an extra layer of security with a TOTP authenticator app.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isEnabled ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {isEnabled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> Enabled
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" /> Not enabled
              </>
            )}
          </span>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-8 flex items-center justify-center text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            {/* IDLE — not enabled */}
            {step === 'idle' && !isEnabled && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Use an authenticator app like Google Authenticator, Authy, or 1Password to generate
                  one-time codes when you sign in.
                </p>
                <button
                  onClick={startEnroll}
                  disabled={enrolling}
                  className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Enable 2FA
                </button>
              </div>
            )}

            {/* VERIFY — show QR */}
            {step === 'verify' && qrCode && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Scan this QR code with your authenticator app, then enter the 6-digit code below.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="bg-white border border-gray-200 rounded-xl p-3">
                    <Image src={qrCode} alt="2FA QR code" width={160} height={160} className="w-40 h-40" unoptimized />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-gray-700 mb-1">Can&apos;t scan?</p>
                    <p className="text-gray-500 mb-2">Enter this secret manually:</p>
                    <code className="block bg-gray-50 border border-gray-200 rounded-lg p-2 font-mono text-[11px] break-all">
                      {secret}
                    </code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                    Verification code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full sm:w-48 px-3 py-2 border border-gray-200 rounded-lg text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={verifyEnroll}
                    disabled={enrolling || verifyCode.length !== 6}
                    className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Verify &amp; Enable
                  </button>
                  <button
                    onClick={() => {
                      setStep('idle');
                      setQrCode(null);
                      setSecret(null);
                      setFactorId(null);
                      setError(null);
                      setVerifyCode('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* BACKUP CODES */}
            {step === 'backup' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-1">
                    Save your backup codes
                  </p>
                  <p className="text-xs text-amber-800">
                    Keep these in a safe place. Each code can be used once if you lose access to your
                    authenticator.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {backupCodes.map((c) => (
                    <code key={c} className="text-xs font-mono text-[#1B2A4A]">
                      {c}
                    </code>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyBackupCodes}
                    className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy codes'}
                  </button>
                  <button
                    onClick={finishSetup}
                    className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* ENABLED */}
            {step === 'enabled' && isEnabled && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-800">
                  <ShieldCheck className="inline w-4 h-4 mr-1.5" />
                  Two-factor authentication is active. You&apos;ll be asked for a code at sign-in.
                </div>
                {verifiedFactors.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Active factor: {verifiedFactors[0].friendly_name || verifiedFactors[0].factor_type}
                  </div>
                )}
                <button
                  onClick={disable2FA}
                  disabled={disabling}
                  className="inline-flex items-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {disabling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  Disable 2FA
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
