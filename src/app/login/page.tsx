'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  KeyRound,
  Layers,
  Code2,
  GitBranch,
  Rocket,
  Palette,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const FEATURE_SLIDES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Spec-Driven Generation',
    description:
      'Generate living PRDs, multi-page UI/UX designs, and production-ready code from natural language instantly.',
  },
  {
    icon: Layers,
    title: 'Unified Product Workflow',
    description:
      'Streamline from ideation and PRD specification to UI wireframing, sprint planning, and full-stack deployment in one system.',
  },
  {
    icon: Code2,
    title: 'End-to-End Full-Stack Development',
    description:
      'Build full-stack applications with live DOM visual editing, multi-file code editor, and Preview/Production SQL databases.',
  },
  {
    icon: Rocket,
    title: 'Deployment and Environment Configuration',
    description:
      'Deploy applications with isolated Preview and Production environments, custom domains, and live runtime logs.',
  },
  {
    icon: GitBranch,
    title: 'Version Control and Sync Management',
    description:
      'Track document versions, propagate spec updates across UI and code, and sync directly with GitHub & Bitbucket.',
  },
  {
    icon: Palette,
    title: 'Customizable Design System',
    description:
      'Customize UI themes, typography, and component tokens to match your organization brand guidelines.',
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/index';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteRedeem, setShowInviteRedeem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error?.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }
      router.push(redirectPath);
      router.refresh();
    } catch {
      setError('Unable to reach authentication server.');
      setLoading(false);
    }
  }

  function handleRedeemInvite(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inviteCode.trim();
    if (!trimmed) return;
    const tokenPart = trimmed.includes('/invite/')
      ? trimmed.split('/invite/').pop()?.split('?')[0] || trimmed
      : trimmed;
    router.push(`/invite/${encodeURIComponent(tokenPart)}`);
  }

  const activeSlide = FEATURE_SLIDES[slideIdx];
  const SlideIcon = activeSlide.icon;

  return (
    <div className="min-h-screen bg-[#06050A] text-white flex flex-col lg:flex-row">
      {/* Left Authentication Column */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8E85FF] to-[#6366F1] flex items-center justify-center font-bold text-lg shadow-lg shadow-[#8E85FF]/25">
              O
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Omniflow
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Back to omniflowai.com
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8E85FF]/10 border border-[#8E85FF]/30 text-[#A79FFF] text-xs font-medium mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Invite-Only Workspace Access
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Sign in to Omniflow
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            Plan, design, and build production-ready products in one unified spec-driven workspace.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8E85FF] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8E85FF] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#8E85FF] to-[#6366F1] hover:opacity-95 disabled:opacity-50 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8E85FF]/25 flex items-center justify-center gap-2 transition"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowInviteRedeem(!showInviteRedeem)}
              className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white py-2 transition"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[#8E85FF]" />
                Have a single-use invitation link or token?
              </span>
              <span className="text-[#8E85FF] font-medium">
                {showInviteRedeem ? 'Hide' : 'Redeem Invite →'}
              </span>
            </button>

            {showInviteRedeem && (
              <form onSubmit={handleRedeemInvite} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Paste invite token or /invite/... URL"
                  className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8E85FF]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-medium text-white transition"
                >
                  Continue
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>Omniflow — AI Product Development Platform</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms of Service
            </Link>
            <Link href="/blog" className="hover:text-slate-300">
              Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Right Feature Showcase Column */}
      <div className="lg:w-[48%] bg-gradient-to-br from-[#120E24] via-[#0B0914] to-[#06050A] p-8 sm:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#8E85FF]/15 blur-3xl pointer-events-none" />
        <div className="max-w-lg mx-auto w-full relative z-10">
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-8 backdrop-blur-xl shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#8E85FF]/20 border border-[#8E85FF]/40 flex items-center justify-center text-[#A79FFF] mb-6">
              <SlideIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {activeSlide.title}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              {activeSlide.description}
            </p>

            {/* 3-step visual pipeline preview */}
            <div className="grid grid-cols-3 gap-2.5 pt-6 border-t border-white/10">
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8E85FF]">
                  Step 01
                </div>
                <div className="text-xs font-semibold text-white mt-0.5">
                  Living PRD
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Lock scope & stories
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-400">
                  Step 02
                </div>
                <div className="text-xs font-semibold text-white mt-0.5">
                  UI/UX Design
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Interactive wireframes
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Step 03
                </div>
                <div className="text-xs font-semibold text-white mt-0.5">
                  Full Product
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Code, DB & Deploy
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-1.5">
              {FEATURE_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => setSlideIdx(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === slideIdx
                      ? 'w-6 bg-[#8E85FF]'
                      : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous feature"
                onClick={() =>
                  setSlideIdx(
                    (slideIdx - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length
                  )
                }
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Next feature"
                onClick={() =>
                  setSlideIdx((slideIdx + 1) % FEATURE_SLIDES.length)
                }
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06050A] text-white flex items-center justify-center text-sm">
          Loading Omniflow Sign In...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
