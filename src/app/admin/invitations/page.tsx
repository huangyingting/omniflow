'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  UserPlus,
  RotateCw,
  Ban,
  Copy,
  Check,
  Clock,
  Activity,
  Users,
  ArrowLeft,
} from 'lucide-react';

type InvitationItem = {
  id: string;
  email: string;
  role: string;
  specialty: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  invitedBy?: { name: string | null; email: string } | null;
  acceptedBy?: { name: string | null; email: string } | null;
};

type AuditLogItem = {
  id: string;
  actorEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  summary: string;
  createdAt: string;
};

type MemberItem = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  specialty: string;
  status: string;
  createdAt: string;
};

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [specialty, setSpecialty] = useState('Product Manager');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  const [latestGrant, setLatestGrant] = useState<{
    email: string;
    token: string;
    inviteUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'invitations' | 'members' | 'audit'>(
    'invitations'
  );

  async function refreshAll() {
    setLoading(true);
    try {
      const [invRes, memRes, logRes] = await Promise.all([
        fetch('/api/admin/invitations'),
        fetch('/api/settings/users'),
        fetch('/api/admin/audit-logs?limit=100'),
      ]);
      if (invRes.status === 401 || invRes.status === 403) {
        setError(
          'Administrator privileges are required to manage account admission and audit logs.'
        );
        setLoading(false);
        return;
      }
      const [invData, memData, logData] = await Promise.all([
        invRes.json(),
        memRes.json(),
        logRes.json(),
      ]);
      if (invData.invitations) setInvitations(invData.invitations);
      if (memData.users) setMembers(memData.users);
      if (logData.logs) setAuditLogs(logData.logs);
    } catch {
      setError('Failed to load administration data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          specialty,
          expiresInDays,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error?.message || 'Unable to create invitation.');
        setSubmitting(false);
        return;
      }
      setLatestGrant({
        email: data.invitation.email,
        token: data.token,
        inviteUrl: data.inviteUrl,
      });
      setEmail('');
      await refreshAll();
    } catch {
      setError('Network error while creating invitation.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRotate(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/invitations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rotate', expiresInDays: 7 }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data?.error?.message || 'Failed to rotate invitation.');
      return;
    }
    setLatestGrant({
      email: data.invitation.email,
      token: data.token,
      inviteUrl: data.inviteUrl,
    });
    await refreshAll();
  }

  async function handleRevoke(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/invitations/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data?.error?.message || 'Failed to revoke invitation.');
      return;
    }
    await refreshAll();
  }

  async function handleUpdateMember(
    userId: string,
    updates: { role?: string; status?: string }
  ) {
    setError(null);
    const res = await fetch('/api/settings/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data?.error?.message || 'Unable to update member.');
      return;
    }
    await refreshAll();
  }

  function copyLink(text: string) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#06050A] text-white p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/index"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Omniflow Workspace
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8E85FF]/20 border border-[#8E85FF]/40 flex items-center justify-center text-[#A79FFF]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Invite-Only Account Admission & Security Audit
                </h1>
                <p className="text-xs text-slate-400">
                  Issue single-use expiring invitations, manage RBAC roles, revoke access, and inspect immutable audit logs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/settings/users"
              className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 transition"
            >
              Team Settings
            </Link>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-300"
          >
            {error}
          </div>
        )}

        {/* Issue Single-Use Invitation Form */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 mb-8">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-[#8E85FF]" />
            Issue New Single-Use Invitation
          </h2>
          <form
            onSubmit={handleCreateInvite}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
          >
            <div className="lg:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8E85FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER')
                }
                className="w-full rounded-xl bg-[#12101B] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8E85FF]"
              >
                <option value="MEMBER">MEMBER (Create & Edit)</option>
                <option value="ADMIN">ADMIN (Full Control)</option>
                <option value="VIEWER">VIEWER (Read-Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Expiration (Days)
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full rounded-xl bg-[#12101B] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8E85FF]"
              >
                <option value={1}>1 Day</option>
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (Default)</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-[#8E85FF] to-[#6366F1] hover:opacity-95 disabled:opacity-50 py-2 text-sm font-semibold text-white shadow-lg shadow-[#8E85FF]/20 transition"
              >
                {submitting ? 'Generating...' : 'Generate Invite Link'}
              </button>
            </div>
          </form>

          {latestGrant && (
            <div className="mt-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-emerald-300">
                  One-Time Invitation Link for {latestGrant.email} (shown once — raw token is never stored)
                </span>
                <button
                  type="button"
                  onClick={() => copyLink(latestGrant.inviteUrl)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-200 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
              <code className="block text-xs font-mono text-emerald-100 break-all bg-black/40 rounded-lg px-3 py-2">
                {latestGrant.inviteUrl}
              </code>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'invitations'
                ? 'border-[#8E85FF] text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Invitations ({invitations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'members'
                ? 'border-[#8E85FF] text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Users & Roles ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-[#8E85FF] text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Audit Logs ({auditLogs.length})
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Loading security records...
          </div>
        ) : activeTab === 'invitations' ? (
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Invited By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invitations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No invitations issued yet. Use the form above to generate a single-use invitation link.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white">
                        {inv.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 font-medium">
                          {inv.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            inv.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-300'
                              : inv.status === 'ACCEPTED'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(inv.expiresAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {inv.invitedBy?.email || 'CLI Admin'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {inv.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRotate(inv.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/15 px-2.5 py-1 text-xs text-slate-200 transition"
                            >
                              <RotateCw className="w-3 h-3" />
                              Rotate
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevoke(inv.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 px-2.5 py-1 text-xs text-rose-300 transition"
                            >
                              <Ban className="w-3 h-3" />
                              Revoke
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'members' ? (
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">
                        {member.name || member.email}
                      </div>
                      <div className="text-slate-400">{member.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {member.specialty}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleUpdateMember(member.id, { role: e.target.value })
                        }
                        className="rounded-lg bg-[#12101B] border border-white/10 px-2.5 py-1 text-xs text-white"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MEMBER">MEMBER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateMember(member.id, {
                            status:
                              member.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
                          })
                        }
                        className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1 text-xs text-slate-200 transition"
                      >
                        {member.status === 'ACTIVE'
                          ? 'Revoke Access'
                          : 'Restore Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#A79FFF]">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {log.actorEmail || 'system'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {log.targetType}
                    </td>
                    <td className="px-4 py-3 text-white">{log.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
