'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Home,
  LayoutDashboard,
  FileText,
  Lightbulb,
  BookOpen,
  LayoutTemplate,
  FolderKanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gift,
  UserPlus,
  Settings,
  ShieldAlert,
  LogOut,
  Check,
  Copy,
  X,
  Compass,
  Layers,
  Building2,
  User as UserIcon,
} from 'lucide-react';

export interface WorkspaceUser {
  id: string;
  email: string;
  username: string;
  name: string | null;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: string;
  specialty: string;
  velocity: number;
  onboardingCompleted: boolean;
  organizationId: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    planTier: string;
    billingInterval: string;
    credits: number;
    totalCreditsPool: number;
  } | null;
}

export interface SidebarProject {
  id: string;
  name: string;
  shortName: string;
  status: string;
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
  fullBleed = false,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  fullBleed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [projects, setProjects] = useState<SidebarProject[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global Modals matching app.omniflowai.com
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showEarnCreditsModal, setShowEarnCreditsModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>(
    'MEMBER'
  );
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteStatusMsg, setInviteStatusMsg] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Upgrade & Reward status
  const [billingBanner, setBillingBanner] = useState<string | null>(null);

  const loadWorkspaceContext = useCallback(async () => {
    try {
      const meRes = await fetch('/api/me', { cache: 'no-store' });
      const meData = await meRes.json();
      if (!meData.user) {
        router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      setUser(meData.user);

      const projRes = await fetch('/api/projects', { cache: 'no-store' });
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.projects || []);
      }
    } catch {
      // ignore transient network errors
    } finally {
      setLoadingAuth(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    loadWorkspaceContext();
  }, [loadWorkspaceContext]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  const handleIssueInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatusMsg(null);
    setInviteUrl(null);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          expiresInHours: 168,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteStatusMsg(data.error || 'Failed to issue invitation.');
        return;
      }
      setInviteUrl(data.invitationUrl);
      setInviteStatusMsg(`Single-use invitation issued for ${inviteEmail}`);
      setInviteEmail('');
    } catch {
      setInviteStatusMsg('Failed to issue invitation.');
    }
  };

  const handleClaimCredits = async (rewardType: string, amount: number) => {
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claim-reward',
        rewardType,
        creditsToAdd: amount,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setBillingBanner(data.message);
      await loadWorkspaceContext();
    }
  };

  const handleUpgradePlan = async (
    planTier: 'FREE' | 'PRO' | 'TEAMS' | 'ENTERPRISE'
  ) => {
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upgrade-plan',
        planTier,
        billingInterval: 'ANNUAL',
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setBillingBanner(data.message);
      await loadWorkspaceContext();
      setTimeout(() => setShowUpgradeModal(false), 900);
    }
  };

  const handleCompleteTour = async () => {
    await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingCompleted: true }),
    });
    setShowTourModal(false);
    await loadWorkspaceContext();
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#5345E9] flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            Loading OmniFlow AI Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const credits = user.organization?.credits ?? 0;
  const maxCredits = Math.max(user.organization?.totalCreditsPool ?? 300, 1);
  const creditPercent = Math.min(100, Math.round((credits / maxCredits) * 100));

  const primaryNav = [
    { href: '/index', label: 'Home (Create)', icon: Home },
    { href: '/dashboard', label: 'My Work Dashboard', icon: LayoutDashboard },
    { href: '/apps', label: 'My Products & Apps', icon: Layers },
    { href: '/docs', label: 'All Documents', icon: FileText },
    { href: '/ideas', label: 'AI Ideation', icon: Lightbulb },
    { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { href: '/template-documents', label: 'Template Center', icon: LayoutTemplate },
    { href: '/org', label: 'Team Projects', icon: Building2 },
  ];

  const tourSteps = [
    {
      title: '1. Spec-Driven Creation (/index)',
      description:
        'Describe your product idea, attach a RAG Knowledge Base, or pick a template. Joy AI automatically synthesizes a 7-stage project graph.',
    },
    {
      title: '2. Living PRD → Multi-Page UI/UX → Full-Stack App',
      description:
        'Refine requirements in the Living PRD, generate interactive multi-page wireframes across 5 design styles, and compile a live full-stack application with SQL databases.',
    },
    {
      title: '3. Bidirectional Sync & Version Control',
      description:
        'Whenever you update your PRD or UI Design, downstream artifacts display a Sync Banner so you can propagate changes or revert to any historical version snapshot.',
    },
    {
      title: '4. DevPlan, Sprint Kanban & Executive Reports',
      description:
        'Generate role-based Epics, User Stories, and Sprint schedules in 2 clicks, track issues on the Kanban board, and view real-time project velocity reports.',
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F7FC] text-slate-900">
      {/* Collapsible Left Navigation Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } flex flex-col border-r border-slate-200/80 bg-white transition-all duration-200 shrink-0 z-30`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-100 px-3.5">
          <Link href="/index" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#5345E9] text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  OmniFlow AI
                </span>
                <span className="text-[10px] font-medium text-[#5345E9] uppercase">
                  {user.organization?.planTier || 'FREE'} Plan
                </span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* New Project Quick Button */}
        <div className="p-2.5">
          <Link
            href="/index"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5345E9] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#4335D6] transition"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>New Spec / Project</span>}
          </Link>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-5">
          <nav className="space-y-0.5">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== '/index' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition ${
                    active
                      ? 'bg-[#5345E9]/10 text-[#5345E9] font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Projects Section */}
          {!sidebarCollapsed && (
            <div>
              <div className="flex items-center justify-between px-2.5 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Projects ({projects.length})
                </span>
                <Link
                  href="/index"
                  className="text-[11px] font-medium text-[#5345E9] hover:underline"
                >
                  + Create
                </Link>
              </div>
              {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center">
                  <p className="text-[11px] text-slate-500">
                    No projects yet. Start from a prompt on Home!
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {projects.slice(0, 8).map((proj) => {
                    const active = pathname.includes(`/projects/${proj.id}`);
                    return (
                      <Link
                        key={proj.id}
                        href={`/projects/${proj.id}/planning/builder`}
                        className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition ${
                          active
                            ? 'bg-[#5345E9]/10 text-[#5345E9] font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FolderKanban className="h-3.5 w-3.5 shrink-0 text-[#5345E9]" />
                          <span className="truncate">{proj.name}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 ml-1">
                          {proj.shortName}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Admin & Governance Section */}
          {!sidebarCollapsed && (
            <div>
              <div className="px-2.5 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Governance &amp; Admin
                </span>
              </div>
              <div className="space-y-0.5">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin/invitations"
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                      pathname.startsWith('/admin/invitations')
                        ? 'bg-[#5345E9]/10 text-[#5345E9] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4 text-[#5345E9]" />
                    <span>Invite Admission &amp; Audit</span>
                  </Link>
                )}
                <Link
                  href="/billing"
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                    pathname === '/billing'
                      ? 'bg-[#5345E9]/10 text-[#5345E9] font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <span>Billing &amp; Credits</span>
                </Link>
                <Link
                  href="/settings/users"
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                    pathname.startsWith('/settings')
                      ? 'bg-[#5345E9]/10 text-[#5345E9] font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Settings &amp; Integrations</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Quota & Action Card */}
        <div className="border-t border-slate-200/80 p-2.5 space-y-2">
          {!sidebarCollapsed && (
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/70">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 mb-1">
                <span>AI Credits</span>
                <span className="font-mono font-semibold text-[#5345E9]">
                  {credits.toLocaleString()} / {maxCredits.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-[#5345E9] to-[#8B5CF6]"
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="rounded-lg bg-[#5345E9]/10 px-1.5 py-1 text-[10px] font-semibold text-[#5345E9] hover:bg-[#5345E9]/20"
                >
                  Upgrade
                </button>
                <button
                  type="button"
                  onClick={() => setShowEarnCreditsModal(true)}
                  className="rounded-lg bg-amber-500/10 px-1.5 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-500/20"
                >
                  +Credits
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="rounded-lg bg-emerald-500/10 px-1.5 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-500/20"
                >
                  Invite
                </button>
              </div>
            </div>
          )}

          {/* User Profile Bar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 hover:bg-slate-100 transition text-left"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5345E9] text-xs font-bold text-white">
                  {(user.name || user.email).slice(0, 1).toUpperCase()}
                </div>
                {!sidebarCollapsed && (
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {user.name || user.username}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {user.role} • {user.email}
                    </div>
                  </div>
                )}
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <UserIcon className="h-3.5 w-3.5" /> My Profile
                </Link>
                <Link
                  href="/settings/users"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <Settings className="h-3.5 w-3.5" /> Workspace Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setTourStep(0);
                    setShowTourModal(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <Compass className="h-3.5 w-3.5 text-[#5345E9]" /> Interactive
                  Product Tour
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Optional Page Header */}
        {(title || actions) && (
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6">
            <div className="flex items-center gap-3 overflow-hidden">
              {title && (
                <h1 className="text-base font-bold text-slate-900 truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <span className="hidden sm:inline-block text-xs text-slate-500 truncate">
                  {subtitle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setTourStep(0);
                  setShowTourModal(true);
                }}
                className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Compass className="h-3.5 w-3.5 text-[#5345E9]" /> Tour
              </button>
              {actions}
            </div>
          </header>
        )}

        {/* Scrollable Workspace Content */}
        <main
          className={`flex-1 overflow-y-auto ${
            fullBleed ? '' : 'p-6 max-w-7xl w-full mx-auto'
          }`}
        >
          {children}
        </main>
      </div>

      {/* 1. Invite Team Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#5345E9]" />
                <h3 className="text-base font-bold text-slate-900">
                  Invite Team Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              OmniFlow enforces single-use cryptographic invitations. Issued
              links expire automatically and record an immutable audit trail.
            </p>
            {user.role !== 'ADMIN' ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                Your role is <strong>{user.role}</strong>. Only workspace{' '}
                <strong>ADMIN</strong> accounts can issue new cryptographic
                invitations.
              </div>
            ) : (
              <form onSubmit={handleIssueInvite} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#5345E9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Workspace Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(
                        e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER'
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#5345E9] focus:outline-none"
                  >
                    <option value="MEMBER">
                      MEMBER (Create &amp; edit projects, PRDs, apps)
                    </option>
                    <option value="VIEWER">
                      VIEWER (Read-only access to specs &amp; previews)
                    </option>
                    <option value="ADMIN">
                      ADMIN (Full organization &amp; invitation control)
                    </option>
                  </select>
                </div>
                {inviteStatusMsg && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                    {inviteStatusMsg}
                  </div>
                )}
                {inviteUrl && (
                  <div className="rounded-xl bg-slate-900 p-3 text-xs text-white space-y-2">
                    <div className="font-semibold text-emerald-300">
                      One-Time Invitation Link (shown once):
                    </div>
                    <div className="font-mono break-all text-[11px] text-slate-300">
                      {inviteUrl}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteUrl);
                        setCopiedInvite(true);
                        setTimeout(() => setCopiedInvite(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/25"
                    >
                      {copiedInvite ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />{' '}
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy Invite URL
                        </>
                      )}
                    </button>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Link
                    href="/admin/invitations"
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage All Invites
                  </Link>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                  >
                    Generate Single-Use Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Upgrade Workspace Plan
                </h3>
                <p className="text-xs text-slate-500">
                  Unlock higher AI credit pools, custom domains, GitHub sync,
                  and team RBAC.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {billingBanner && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
                {billingBanner}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  tier: 'FREE' as const,
                  name: 'Free Starter',
                  price: '$0',
                  credits: '300 Credits',
                  desc: 'Core PRD, UI wireframes & preview app',
                },
                {
                  tier: 'PRO' as const,
                  name: 'Pro Builder',
                  price: '$19.99/mo',
                  credits: '5,000 Credits',
                  desc: 'Full-stack code export, custom domains & Git sync',
                },
                {
                  tier: 'TEAMS' as const,
                  name: 'Teams & Scale',
                  price: '$39.99/mo',
                  credits: '15,000 Credits',
                  desc: 'Shared Knowledge Bases, Jira/Linear sync & RBAC',
                },
              ].map((p) => (
                <div
                  key={p.tier}
                  className={`rounded-2xl border p-4 flex flex-col justify-between ${
                    user.organization?.planTier === p.tier
                      ? 'border-[#5345E9] bg-[#5345E9]/5'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {p.name}
                    </div>
                    <div className="text-xl font-extrabold text-[#5345E9] mt-1">
                      {p.price}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-1">
                      {p.credits}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{p.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpgradePlan(p.tier)}
                    className="mt-4 w-full rounded-xl bg-[#5345E9] py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                  >
                    {user.organization?.planTier === p.tier
                      ? 'Refresh Plan Pool'
                      : `Switch to ${p.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Earn Credits Modal */}
      {showEarnCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Earn Free AI Credits
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEarnCreditsModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {billingBanner && (
              <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                {billingBanner}
              </div>
            )}
            <div className="space-y-3">
              {[
                {
                  title: 'Complete Spec-Driven Product Tour',
                  amount: 300,
                  desc: 'Walk through the PRD → UI → Product → DevPlan workflow',
                },
                {
                  title: 'Publish First Living PRD & UI Prototype',
                  amount: 500,
                  desc: 'Reward for shipping your first synchronized specification',
                },
                {
                  title: 'Connect GitHub or Knowledge Base RAG Index',
                  amount: 750,
                  desc: 'Ground Joy AI in your team engineering architecture',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                >
                  <div className="pr-3">
                    <div className="text-xs font-bold text-slate-900">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.desc}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClaimCredits(item.title, item.amount)}
                    className="shrink-0 rounded-xl bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-500/25"
                  >
                    +{item.amount} Credits
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive FTUE Onboarding Tour Modal */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="rounded-full bg-[#5345E9]/10 px-3 py-1 text-xs font-bold text-[#5345E9]">
                OmniFlow Guided Tour ({tourStep + 1} of {tourSteps.length})
              </span>
              <button
                type="button"
                onClick={() => setShowTourModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {tourSteps[tourStep].title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {tourSteps[tourStep].description}
            </p>
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={tourStep === 0}
                onClick={() => setTourStep(Math.max(0, tourStep - 1))}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              {tourStep < tourSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setTourStep(tourStep + 1)}
                  className="rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteTour}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Complete Tour
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
