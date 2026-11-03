'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  FileText,
  Layers,
  Code2,
  Kanban,
  Database,
  Wand2,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#08071A] text-white selection:bg-[#5345E9] selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#5345E9] via-[#7B61FF] to-[#3B82F6] px-4 py-2 text-center text-xs sm:text-sm font-medium text-white">
        <span className="inline-flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
            New
          </span>
          <span>
            OmniFlow 2.5: Spec-Driven Living PRDs → Multi-Page UI/UX → Deployed
            Full-Stack Apps with Bidirectional Sync
          </span>
          <Link
            href="/index"
            className="underline decoration-white/60 underline-offset-4 hover:decoration-white inline-flex items-center gap-1 font-semibold"
          >
            Open Workspace <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08071A]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5345E9] to-[#8B5CF6] shadow-lg shadow-[#5345E9]/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white">
                  OmniFlow <span className="text-[#8B5CF6]">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 -mt-1">
                  Spec-Driven Platform
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 text-sm">
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('solutions')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white transition">
                  Solutions <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
                {openDropdown === 'solutions' && (
                  <div className="absolute left-0 top-full w-80 pt-2">
                    <div className="rounded-2xl border border-white/15 bg-[#100F29] p-3 shadow-2xl">
                      <Link
                        href="/ai-for-product-managers"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/5 transition"
                      >
                        <FileText className="h-5 w-5 text-[#8B5CF6] mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-white text-sm">
                            AI for Product Managers
                          </div>
                          <div className="text-xs text-slate-400">
                            Living PRDs, user stories, acceptance criteria &amp;
                            roadmaps
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/use-cases"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/5 transition"
                      >
                        <Layers className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-white text-sm">
                            Use Cases &amp; Workflows
                          </div>
                          <div className="text-xs text-slate-400">
                            End-to-end SaaS, internal tools, portals &amp; AI
                            agents
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/case-studies"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/5 transition"
                      >
                        <Kanban className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-white text-sm">
                            Customer Case Studies
                          </div>
                          <div className="text-xs text-slate-400">
                            How engineering &amp; product teams ship 10x faster
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('resources')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white transition">
                  Free Tools &amp; Docs{' '}
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
                {openDropdown === 'resources' && (
                  <div className="absolute left-0 top-full w-80 pt-2">
                    <div className="rounded-2xl border border-white/15 bg-[#100F29] p-3 shadow-2xl">
                      <Link
                        href="/free-tools"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/5 transition"
                      >
                        <Wand2 className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-white text-sm">
                            6 Free AI Product Tools
                          </div>
                          <div className="text-xs text-slate-400">
                            Instant PRD, UI Prompt, SQL Schema, Backlog &amp; QA
                            generators
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/prd-template"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/5 transition"
                      >
                        <Code2 className="h-5 w-5 text-pink-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-white text-sm">
                            Interactive PRD Templates
                          </div>
                          <div className="text-xs text-slate-400">
                            Battle-tested specification templates with 1-click
                            launch
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/documentation"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/5 transition"
                      >
                        <BookOpen className="h-5 w-5 text-sky-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-white text-sm">
                            Platform Documentation
                          </div>
                          <div className="text-xs text-slate-400">
                            Guides for PRD→UI→Product lifecycle, RAG KB &amp;
                            RBAC
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/blog"
                        className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/5 transition"
                      >
                        <Database className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-white text-sm">
                            Engineering &amp; Product Blog
                          </div>
                          <div className="text-xs text-slate-400">
                            Deep dives into spec-driven AI software engineering
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/pricing"
                className={`rounded-lg px-3 py-2 transition ${
                  pathname === '/pricing'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/free-tools"
                className={`rounded-lg px-3 py-2 transition ${
                  pathname === '/free-tools'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                Free AI Tools
              </Link>
              <Link
                href="/documentation"
                className={`rounded-lg px-3 py-2 transition ${
                  pathname === '/documentation'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                Docs
              </Link>
              <Link
                href="/faq"
                className={`rounded-lg px-3 py-2 transition ${
                  pathname === '/faq'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Right CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Invite-Only Admission
            </span>
            <Link
              href="/login"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              Sign In
            </Link>
            <Link
              href="/index"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5345E9] to-[#7C3AED] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#5345E9]/30 hover:opacity-95 transition"
            >
              Launch Workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-slate-300 hover:bg-white/10"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0E0D24] px-4 py-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/ai-for-product-managers"
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
              >
                AI for PMs
              </Link>
              <Link
                href="/use-cases"
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
              >
                Use Cases
              </Link>
              <Link
                href="/case-studies"
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
              >
                Case Studies
              </Link>
              <Link
                href="/free-tools"
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
              >
                Free AI Tools
              </Link>
              <Link
                href="/prd-template"
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
              >
                PRD Templates
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
              >
                Pricing
              </Link>
              <Link
                href="/documentation"
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
              >
                Documentation
              </Link>
              <Link
                href="/faq"
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
              >
                FAQ
              </Link>
            </div>
            <div className="pt-3 flex items-center gap-2">
              <Link
                href="/login"
                className="flex-1 text-center rounded-xl border border-white/15 py-2.5 text-sm font-medium text-white"
              >
                Sign In
              </Link>
              <Link
                href="/index"
                className="flex-1 text-center rounded-xl bg-[#5345E9] py-2.5 text-sm font-semibold text-white"
              >
                Workspace
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page Body */}
      <main className="flex-1">{children}</main>

      {/* Comprehensive Footer */}
      <footer className="border-t border-white/10 bg-[#050411] text-slate-400">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2 md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5345E9]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  OmniFlow AI
                </span>
              </Link>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                The Spec-Driven AI Product Development Platform. Transform
                natural language ideas and domain knowledge bases into Living
                PRDs, Multi-Page UI/UX Designs, Full-Stack Applications, and
                Sprint Execution Plans.
              </p>
              <div className="text-xs text-slate-500">
                Protected by Invite-Only Cryptographic Admission &amp; RBAC
                Audit Logging.
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
                Product
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/index" className="hover:text-white transition">
                    Spec-Driven Builder
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-for-product-managers"
                    className="hover:text-white transition"
                  >
                    AI for Product Managers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/use-cases"
                    className="hover:text-white transition"
                  >
                    Use Cases
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition">
                    Pricing &amp; Credits
                  </Link>
                </li>
                <li>
                  <Link
                    href="/case-studies"
                    className="hover:text-white transition"
                  >
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
                Resources &amp; Tools
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/free-tools"
                    className="hover:text-white transition"
                  >
                    Free AI Product Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prd-template"
                    className="hover:text-white transition"
                  >
                    PRD Templates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documentation"
                    className="hover:text-white transition"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition">
                    Engineering Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
                Company &amp; Legal
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    About OmniFlow
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition">
                    Contact &amp; Enterprise
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition">
                    Workspace Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>
              © {new Date().getFullYear()} OmniFlow AI Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-slate-300">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-300">
                Terms
              </Link>
              <Link href="/documentation" className="hover:text-slate-300">
                Security &amp; RBAC
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
