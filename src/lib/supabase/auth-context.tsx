'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient } from './client';
import type { User, Session } from '@supabase/supabase-js';
import type { UserRole } from './types';

// ── Types ─────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  roles?: UserRole[]; // TEXT[] column — supports dual-role (e.g. member + supplier)
  capabilities?: string[]; // TEXT[] column — additive capability flags (ambassador, sponsor, investor, etc)
  country: string | null;
  region: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSupplier: boolean;
  isMember: boolean;
  isImpersonating: boolean;
  realProfile: Profile | null;
  roles: string[];
  hasRole: (role: string) => boolean;
  capabilities: string[];
  hasCapability: (cap: string) => boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [realProfile, setRealProfile] = useState<Profile | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Fetch profile from DB — retry on failure (with 5s timeout to prevent hanging)
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const result = await Promise.race([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        ),
      ]) as { data: unknown; error: { message?: string; code?: string } | null };

      const { data, error } = result;

      if (!error && data) {
        const profileData = data as Profile;
        setRealProfile(profileData);

        // Check if impersonating — override profile with target user's profile
        const impersonationData = localStorage.getItem('afu_impersonation');
        if (impersonationData && profileData.role === 'super_admin') {
          try {
            const imp = JSON.parse(impersonationData);
            const { data: targetProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', imp.userId)
              .single();
            if (targetProfile) {
              setProfile(targetProfile as Profile);
              setIsImpersonating(true);
              return;
            }
          } catch {
            // Invalid impersonation data, fall through
          }
        }

        setProfile(profileData);
        setIsImpersonating(false);
      } else if (error) {
        console.warn('[Auth] Profile fetch failed:', error?.message, '— retrying...');
        // Retry once after 1s
        setTimeout(async () => {
          const { data: retryData } = await supabase.from('profiles').select('*').eq('id', userId).single();
          if (retryData) {
            setProfile(retryData as Profile);
            setRealProfile(retryData as Profile);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('[Auth] Profile fetch error:', err);
    }
  }, [supabase]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  // Listen for impersonation changes (same-tab custom event + cross-tab storage event)
  useEffect(() => {
    const handleImpersonationChange = () => {
      if (user) fetchProfile(user.id);
    };
    window.addEventListener('impersonation-changed', handleImpersonationChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'afu_impersonation') handleImpersonationChange();
    });
    return () => {
      window.removeEventListener('impersonation-changed', handleImpersonationChange);
    };
  }, [user, fetchProfile]);

  // Listen to auth state changes
  useEffect(() => {
    // Hard safety timeout: ensure isLoading always resolves to false within 8s
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
      console.warn('[Auth] Safety timeout: forcing isLoading=false after 8s');
    }, 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        try {
          if (newSession?.user) {
            await fetchProfile(newSession.user.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('[Auth] onAuthStateChange profile fetch failed:', err);
        } finally {
          setIsLoading(false);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession()
      .then(async ({ data: { session: initialSession } }) => {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        try {
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id);
          }
        } catch (err) {
          console.error('[Auth] Initial profile fetch failed:', err);
        }
      })
      .catch((err) => {
        console.error('[Auth] getSession failed:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // ── Auth methods ──────────────────────────────────────────────────────

  // Self-signup auto-approves a free membership so every user gets immediate access
  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'member' },
      },
    });

    if (!error && data?.user) {
      const userId = data.user.id;

      // Create profile with member role — immediate access to dashboard
      await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: fullName,
        role: 'member',
      });

      // Create an auto-approved membership application for record-keeping
      await supabase.from('membership_applications').insert({
        email,
        full_name: fullName,
        status: 'auto_approved',
        requested_tier: 'free',
        application_type: 'member',
        profile_id: userId,
      });

      // Create a members record with free tier so user is not orphaned
      const memberId = `AFU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
      await supabase.from('members').insert({
        profile_id: userId,
        member_id: memberId,
        tier: 'free',
        status: 'active',
      });
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear impersonation on sign out
    localStorage.removeItem('afu_impersonation');
    setIsImpersonating(false);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRealProfile(null);
  };

  // ── Role helpers ──────────────────────────────────────────────────────

  // Build unified roles array: combine primary role + roles[] column (deduped)
  const roles: string[] = (() => {
    const set = new Set<string>();
    if (profile?.role) set.add(profile.role);
    if (profile?.roles) profile.roles.forEach((r) => set.add(r));
    return Array.from(set);
  })();

  const hasRole = (role: string): boolean => roles.includes(role);

  // Capabilities array — gracefully handles null/undefined from older profiles
  const capabilities: string[] = Array.isArray(profile?.capabilities)
    ? (profile!.capabilities as string[])
    : [];

  const hasCapability = (cap: string): boolean => capabilities.includes(cap);

  const isSuperAdmin = hasRole('super_admin');
  const isAdmin = hasRole('admin') || hasRole('super_admin');
  const isSupplier = hasRole('supplier') || isAdmin;
  const isMember = hasRole('member') || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin,
        isSuperAdmin,
        isSupplier,
        isMember,
        isImpersonating,
        realProfile,
        roles,
        hasRole,
        capabilities,
        hasCapability,
        signUp,
        signIn,
        signInWithMagicLink,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
