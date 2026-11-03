'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  User as UserIcon,
  Lock,
  Mail,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

type InvitationView = {
  id: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired' | 'invalid';
  maskedEmail: string | null;
  email?: string;
  role?: 'ADMIN' | 'MEMBER' | 'VIEWER';
  specialty?: string;
  organizationName?: string | null;
  expiresAt: string | null;
};

const SPECIALTY_OPTIONS = [
  'Product Manager',
  'UI/UX Designer',
  'Full-Stack Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'QA Engineer',
  'Engineering Lead',
];

export default function InviteAcceptancePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = decodeURIComponent(params?.token || '');

  const [invitation, setInvitation] = useState<InvitationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('Product Manager');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadInvitation() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/auth/invitation?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (!active) return;
        if (data?.invitation) {
          setInvitation(data.invitation);
          if (data.invitation.email) setEmail(data.invitation.email);
          if (data.invitation.specialty) setSpecialty(data.invitation.specialty);
        } else {
          setInvitation({
            id: '',
            status: 'invalid',
            maskedEmail: null,
            expiresAt: null,
          });
        }
      } catch {
        if (active) {
          setInvitation({
            id: '',
            status: 'invalid',
            maskedEmail: null,
            expiresAt: null,
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadInvitation();
    return () => {
      active = false;
    };
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          name,
          specialty,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error?.message || 'Unable to complete registration.');
        setSubmitting(false);
        return;
      }
      router.push('/index?welcome=1');
      router.refresh();
    } catch {
      setError('Network error while accepting invitation.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#06050A] text-white flex flex-col justify-between p-6 sm:p-12">
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8E85FF] to-[#6366F1] flex items-center justify-center font-bold text-lg">
            O
          </div>
          <span className="text-xl font-bold tracking-tight">Omniflow</span>
        </Link>
        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-white transition"
        >
          Already have an account? Sign In →
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-12 rounded-2xl bg-white/[0.03] border border-white/10 p-8 shadow-2xl">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Validating single-use invitation token...
          </div>
        ) : !invitation || invitation.status !== 'pending' ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              {invitation?.status === 'expired'
                ? 'Invitation Expired'
                : invitation?.status === 'revoked'
                ? 'Invitation Revoked'
                : invitation?.status === 'accepted'
                ? 'Invitation Already Used'
                : 'Invalid Invitation Link'}
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              {invitation?.status === 'expired'
                ? 'This single-use invitation link has passed its expiration time. Ask your organization administrator to rotate or issue a new invitation.'
                : invitation?.status === 'revoked'
                ? 'This invitation was revoked by an administrator and can no longer be redeemed.'
                : invitation?.status === 'accepted'
                ? 'This single-use invitation has already been redeemed to create an account.'
                : 'This invitation token was not recognized or is no longer active.'}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-5 py-2.5 text-sm font-medium text-white transition"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Single-Use Invitation
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">
              Join {invitation.organizationName || 'Omniflow Workspace'}
            </h1>
            <p className="text-xs text-slate-400 mb-6">
              Invited as{' '}
              <span className="text-white font-semibold">
                {invitation.role || 'MEMBER'}
              </span>
              {invitation.expiresAt && (
                <>
                  {' '}
                  · Expires{' '}
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </>
              )}
            </p>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-xs text-rose-300"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleAccept} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Invited Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    readOnly={Boolean(invitation.email)}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#8E85FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8E85FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Role Specialty
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full rounded-xl bg-[#12101B] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8E85FF]"
                  >
                    {SPECIALTY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Create Password (minimum 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8E85FF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-[#8E85FF] to-[#6366F1] hover:opacity-95 disabled:opacity-50 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8E85FF]/25 flex items-center justify-center gap-2 transition"
              >
                {submitting
                  ? 'Activating Account...'
                  : 'Accept Invitation & Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#8E85FF]" />
        Protected by Omniflow Invite-Only Account Admission & Audit Logging
      </div>
    </div>
  );
}
