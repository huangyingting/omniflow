'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import {
  Users,
  Building2,
  ShieldCheck,
  Plug,
  CheckCircle2,
  Save,
} from 'lucide-react';

const SETTINGS_SECTIONS = [
  { id: 'users', label: 'Team Members & RBAC', group: 'Organization' },
  { id: 'organization', label: 'Workspace Profile', group: 'Organization' },
  { id: 'permissions', label: 'Role Matrix & Policies', group: 'Organization' },
  { id: 'github', label: 'GitHub Sync', group: 'Integrations' },
  { id: 'bitbucket', label: 'Bitbucket Sync', group: 'Integrations' },
  { id: 'jira', label: 'Jira Software', group: 'Integrations' },
  { id: 'linear', label: 'Linear Issues', group: 'Integrations' },
  { id: 'slack', label: 'Slack Notifications', group: 'Integrations' },
  { id: 'supabase', label: 'Supabase Postgres', group: 'Integrations' },
  { id: 'stripe', label: 'Stripe Billing', group: 'Integrations' },
];

export default function SettingsSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section || 'users';

  const [users, setUsers] = useState<
    Array<{
      id: string;
      email: string;
      name: string | null;
      role: 'ADMIN' | 'MEMBER' | 'VIEWER';
      status: string;
      specialty: string;
      velocity: number;
    }>
  >([]);
  const [orgName, setOrgName] = useState('');
  const [integrations, setIntegrations] = useState<
    Array<{
      id: string;
      type: string;
      name: string;
      status: string;
      configJson: string;
    }>
  >([]);
  const [banner, setBanner] = useState<string | null>(null);

  const loadSettingsData = useCallback(async () => {
    const [uRes, oRes, iRes] = await Promise.all([
      fetch('/api/settings/users', { cache: 'no-store' }),
      fetch('/api/settings/organization', { cache: 'no-store' }),
      fetch('/api/settings/integrations', { cache: 'no-store' }),
    ]);
    if (uRes.ok) {
      const uData = await uRes.json();
      setUsers(uData.users || []);
    }
    if (oRes.ok) {
      const oData = await oRes.json();
      setOrgName(oData.organization?.name || '');
    }
    if (iRes.ok) {
      const iData = await iRes.json();
      setIntegrations(iData.integrations || []);
    }
  }, []);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  const handleUpdateUser = async (
    userId: string,
    payload: {
      role?: string;
      status?: string;
      specialty?: string;
      velocity?: number;
    }
  ) => {
    const res = await fetch('/api/settings/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...payload }),
    });
    if (res.ok) {
      setBanner('Updated team member profile & access control.');
      await loadSettingsData();
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/settings/organization', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orgName }),
    });
    if (res.ok) {
      setBanner('Updated organization profile.');
      await loadSettingsData();
    }
  };

  const handleToggleIntegration = async (type: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    const res = await fetch('/api/settings/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: type.toUpperCase(),
        name: type.toUpperCase(),
        status: nextStatus,
        config: { connectedAt: new Date().toISOString() },
      }),
    });
    if (res.ok) {
      setBanner(`${type.toUpperCase()} integration is now ${nextStatus}.`);
      await loadSettingsData();
    }
  };

  return (
    <AppShell
      title="Workspace Settings & Integrations"
      subtitle="Configure RBAC roles, organization profile, and external engineering connectors"
    >
      {banner && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{banner}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Left Navigation */}
        <div className="lg:col-span-3 space-y-1">
          {SETTINGS_SECTIONS.map((sec) => (
            <Link
              key={sec.id}
              href={`/settings/${sec.id}`}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                section === sec.id
                  ? 'bg-[#5345E9] text-white font-semibold'
                  : 'bg-white border border-slate-200/70 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{sec.label}</span>
              <span className="text-[10px] opacity-70">{sec.group}</span>
            </Link>
          ))}
        </div>

        {/* Settings Right Content */}
        <div className="lg:col-span-9 rounded-2xl border border-slate-200 bg-white p-6">
          {section === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Users className="h-4 w-4 text-[#5345E9]" />
                  <span>Workspace Members ({users.length})</span>
                </div>
                <Link
                  href="/admin/invitations"
                  className="rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white"
                >
                  Manage Invitations &amp; Audit Logs →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-3 py-2.5">Member</th>
                      <th className="px-3 py-2.5">Specialty</th>
                      <th className="px-3 py-2.5">RBAC Role</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-3 py-3">
                          <div className="font-bold text-slate-900">
                            {u.name || u.email}
                          </div>
                          <div className="text-slate-500">{u.email}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <select
                              aria-label={`Specialty for ${u.email}`}
                              value={u.specialty || 'Fullstack Engineer'}
                              onChange={(e) =>
                                handleUpdateUser(u.id, {
                                  specialty: e.target.value,
                                })
                              }
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700"
                            >
                              {[
                                'Fullstack Engineer',
                                'Frontend Engineer',
                                'Backend Engineer',
                                'Product Manager',
                                'UI/UX Designer',
                                'QA Engineer',
                                'DevOps Engineer',
                              ].map((spec) => (
                                <option key={spec} value={spec}>
                                  {spec}
                                </option>
                              ))}
                            </select>
                            <select
                              aria-label={`Velocity for ${u.email}`}
                              value={u.velocity || 10}
                              onChange={(e) =>
                                handleUpdateUser(u.id, {
                                  velocity: Number(e.target.value),
                                })
                              }
                              className="rounded-lg border border-slate-200 px-1.5 py-1 text-xs font-mono font-semibold text-[#5345E9]"
                            >
                              {[6, 8, 10, 12, 15, 20].map((pts) => (
                                <option key={pts} value={pts}>
                                  {pts} pts
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleUpdateUser(u.id, { role: e.target.value })
                            }
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="MEMBER">MEMBER</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateUser(u.id, {
                                status:
                                  u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
                              })
                            }
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium hover:bg-slate-50"
                          >
                            {u.status === 'ACTIVE' ? 'Disable' : 'Re-enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === 'organization' && (
            <form onSubmit={handleSaveOrg} className="space-y-4 max-w-md">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Building2 className="h-4 w-4 text-[#5345E9]" />
                <span>Organization Profile</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white"
              >
                <Save className="h-3.5 w-3.5" /> Save Organization
              </button>
            </form>
          )}

          {section === 'permissions' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-[#5345E9]" />
                <span>Role-Based Access Control (RBAC) Enforcement Matrix</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {[
                  {
                    role: 'ADMIN',
                    desc: 'Full organization governance: issue/revoke single-use invitations, manage user roles, inspect immutable audit logs, and manage all projects.',
                  },
                  {
                    role: 'MEMBER',
                    desc: 'Full engineering access: create spec-driven projects, refine PRDs, generate UI/UX & full-stack apps, run SQL queries, and manage sprints.',
                  },
                  {
                    role: 'VIEWER',
                    desc: 'Read-only stakeholder access: inspect PRDs, preview UI wireframes and live applications, and view executive reports.',
                  },
                ].map((r) => (
                  <div
                    key={r.role}
                    className="rounded-xl border border-slate-200 p-4 space-y-2"
                  >
                    <div className="font-mono font-bold text-[#5345E9]">
                      {r.role}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section !== 'users' &&
            section !== 'organization' &&
            section !== 'permissions' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Plug className="h-4 w-4 text-[#5345E9]" />
                  <span>
                    {section.toUpperCase()} Workspace Connector &amp; Sync
                  </span>
                </div>
                {(() => {
                  const found = integrations.find(
                    (i) => i.type.toLowerCase() === section.toLowerCase()
                  );
                  const isConnected = found?.status === 'CONNECTED';
                  return (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {section.toUpperCase()} Integration
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Synchronize OmniFlow PRDs, DevPlan sprints, source
                          repositories, and deployment webhooks with{' '}
                          {section.toUpperCase()}.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleIntegration(
                            section,
                            found?.status || 'DISCONNECTED'
                          )
                        }
                        className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                          isConnected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#5345E9] text-white'
                        }`}
                      >
                        {isConnected
                          ? 'Connected ✓ (Click to Disconnect)'
                          : `Connect ${section.toUpperCase()}`}
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
        </div>
      </div>
    </AppShell>
  );
}
