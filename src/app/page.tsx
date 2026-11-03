'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import {
  PRODUCT_SHOWCASE_TEMPLATES,
  FREE_AI_TOOLS_CATALOG,
} from '@/lib/omniflow/catalog';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Palette,
  Code2,
  CalendarRange,
  CheckCircle2,
  Database,
  ShieldCheck,
  Wand2,
  Layers,
  RefreshCw,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [heroPrompt, setHeroPrompt] = useState(
    'Build an AI Customer Support & SLA Triage Platform with automated ticket routing, live sentiment scoring, and Stripe billing.'
  );
  const [activeStage, setActiveStage] = useState<
    'prd' | 'ui' | 'product' | 'devplan'
  >('prd');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'AI Apps',
    'SaaS & CRM',
    'Internal Tools',
    'E-Commerce',
    'FinTech',
  ];

  const filteredTemplates =
    selectedCategory === 'All'
      ? PRODUCT_SHOWCASE_TEMPLATES
      : PRODUCT_SHOWCASE_TEMPLATES.filter(
          (t) => t.category === selectedCategory
        );

  const handleStartFromHero = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/index?prompt=${encodeURIComponent(heroPrompt)}`);
  };

  return (
    <MarketingChrome>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#5345E9]/30 via-[#08071A] to-[#08071A]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5345E9]/40 bg-[#5345E9]/15 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
            <span>
              Spec-Driven AI Software Engineering • Living PRD → UI/UX →
              Full-Stack App
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
            Turn Product Specs into{' '}
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#38BDF8] bg-clip-text text-transparent">
              Production Apps
            </span>{' '}
            in Minutes.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            Stop vibe-coding fragile prototypes without a specification.
            OmniFlow AI synthesizes a Living PRD grounded in your Knowledge
            Base, generates multi-page UI/UX wireframes, compiles a full-stack
            application with SQL databases, and schedules your engineering
            sprints—all bidirectionally synchronized.
          </p>

          {/* Interactive Hero Prompt Composer */}
          <form
            onSubmit={handleStartFromHero}
            className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/15 bg-[#11102B]/90 p-3 shadow-2xl shadow-[#5345E9]/20 backdrop-blur-xl text-left"
          >
            <div className="flex items-center justify-between px-2 pb-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-medium text-indigo-300">
                <Wand2 className="h-3.5 w-3.5" /> Describe your product, SaaS,
                or internal tool
              </span>
              <span>Generates 7 synchronized artifacts</span>
            </div>
            <textarea
              rows={3}
              value={heroPrompt}
              onChange={(e) => setHeroPrompt(e.target.value)}
              className="w-full resize-none rounded-xl bg-[#09081C] p-3.5 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-[#5345E9] focus:outline-none"
              placeholder="Describe the application you want to specify, design, and build..."
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  'AI Customer Support Hub',
                  'Multi-Tenant Revenue CRM',
                  'SOC2 Compliance Portal',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() =>
                      setHeroPrompt(
                        `Build a ${chip} with role-based access control, interactive analytics dashboard, automated alerts, and PostgreSQL persistence.`
                      )
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5345E9] to-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#5345E9]/30 hover:opacity-95 transition"
              >
                <span>Build with Joy AI</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Trust & Capability Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Living PRD +
              Version Diffs
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 5 Multi-Page
              UI Design Systems
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Preview &amp;
              Production SQL Databases
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Invite-Only
              RBAC &amp; Audit Trail
            </span>
          </div>
        </div>
      </section>

      {/* Interactive 4-Stage Spec-Driven Lifecycle Showcase */}
      <section className="py-16 border-t border-white/10 bg-[#0B0A20]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">
              Unified 4-Stage Pipeline
            </span>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              One Source of Truth from Spec to Production
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Every change in your Living PRD automatically triggers a
              synchronization event across your UI/UX wireframes, full-stack
              application code, and engineering sprint plan.
            </p>
          </div>

          {/* Stage Selector Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              {
                id: 'prd' as const,
                label: '1. Living PRD (V1 → Vn)',
                icon: FileText,
              },
              {
                id: 'ui' as const,
                label: '2. Multi-Page UI/UX Design',
                icon: Palette,
              },
              {
                id: 'product' as const,
                label: '3. Full-Stack App + SQL DB',
                icon: Code2,
              },
              {
                id: 'devplan' as const,
                label: '4. DevPlan & Sprint Kanban',
                icon: CalendarRange,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveStage(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    activeStage === tab.id
                      ? 'bg-[#5345E9] text-white shadow-lg shadow-[#5345E9]/30'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Stage Preview Card */}
          <div className="rounded-3xl border border-white/15 bg-[#12112E] p-6 sm:p-8 shadow-2xl">
            {activeStage === 'prd' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-[#5345E9]/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                    Stage 1 • Living Specification
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Structured PRDs Grounded in Your Knowledge Base
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Chat with Joy AI to refine personas, P0/P1 user stories,
                    relational data models, and non-functional SLAs. Every edit
                    creates an immutable version snapshot (`V1`, `V2`, `V3`) and
                    flags downstream artifacts for 1-click synchronization.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />{' '}
                      Attach PDF/Markdown Knowledge Bases for RAG citations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />{' '}
                      Export to PDF, Word/HTML, or Markdown
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />{' '}
                      One-click &ldquo;Make Design&rdquo; transition
                    </li>
                  </ul>
                </div>
                <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#09081D] p-5 font-mono text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-white">
                      PRD — SmartSupport Hub (Version V2)
                    </span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                      Synced with UI &amp; App
                    </span>
                  </div>
                  <div className="text-indigo-300 font-semibold">
                    ## 3. Core Functional Scope &amp; User Stories (P0)
                  </div>
                  <p className="text-slate-400">
                    - **US-01 (P0)**: Automated SLA Triage &amp; Sentiment
                    Routing (&lt;150ms p95 latency)
                  </p>
                  <p className="text-slate-400">
                    - **US-02 (P0)**: Grounded RAG Response Drafting with inline
                    citations
                  </p>
                  <p className="text-slate-400">
                    - **US-03 (P1)**: Role-Based Escalation &amp; Immutable
                    Audit Trail
                  </p>
                </div>
              </div>
            )}

            {activeStage === 'ui' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                    Stage 2 • Multi-Page UI/UX Canvas
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    4-Page Interactive Prototypes Across 5 Visual Styles
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Generate complete multi-page wireframes (Executive
                    Dashboard, Primary Workflow Studio, Analytics &amp; Audit,
                    and RBAC Settings). Switch instantaneously between Modern
                    Minimal, Cyberpunk Dark, Glassmorphic SaaS, Warm Editorial,
                    and Enterprise Slate.
                  </p>
                </div>
                <div className="lg:col-span-7 grid grid-cols-2 gap-3">
                  {[
                    'Executive Overview & KPIs',
                    'Primary Workflow Studio',
                    'Analytics & Audit Trail',
                    'Team RBAC & Connectors',
                  ].map((pageTitle, idx) => (
                    <div
                      key={pageTitle}
                      className="rounded-xl border border-white/10 bg-[#09081D] p-4"
                    >
                      <div className="text-[11px] font-bold text-indigo-400">
                        Screen 0{idx + 1}
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        {pageTitle}
                      </div>
                      <div className="mt-3 h-16 rounded-lg bg-white/5 border border-white/5 p-2 flex flex-col justify-between">
                        <div className="h-2 w-2/3 rounded bg-indigo-500/40" />
                        <div className="grid grid-cols-3 gap-1">
                          <div className="h-6 rounded bg-white/10" />
                          <div className="h-6 rounded bg-white/10" />
                          <div className="h-6 rounded bg-white/10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeStage === 'product' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Stage 3 • Full-Stack App + SQL Database
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Live Preview, Code Editor, Dual SQL DBs &amp; Custom Domains
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Inspect and edit generated TypeScript/React/SQL source files,
                    run live `SELECT`/`INSERT`/`UPDATE` queries against isolated
                    Preview and Production databases, configure Stripe/Supabase
                    connectors, and publish to a shareable URL.
                  </p>
                </div>
                <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#09081D] p-5 font-mono text-xs text-emerald-300 space-y-2">
                  <div className="text-slate-400">
                    sql&gt; SELECT id, title, status, priority, owner FROM
                    records;
                  </div>
                  <div className="rounded-lg bg-black/50 p-3 text-slate-200 overflow-x-auto">
                    <div>
                      rec-101 | Enterprise SSO &amp; SAML | COMPLETED | P0 |
                      alex@omniflow.io
                    </div>
                    <div>
                      rec-102 | Automated Billing Webhook | IN_PROGRESS | P0 |
                      priya@omniflow.io
                    </div>
                    <div>
                      rec-103 | Knowledge Base Vector Sync | TODO | P1 |
                      marcus@omniflow.io
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStage === 'devplan' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
                    Stage 4 • Two-Step Sprint &amp; Task Planner
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Automated Epics, Stories, Story Points &amp; Sprint
                    Schedules
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Select your engineering roles in Step 1 to generate Epics
                    and User Stories, then confirm your Milestone &amp; Sprint
                    cadence in Step 2 to populate your project Kanban board and
                    burndown analytics automatically.
                  </p>
                </div>
                <div className="lg:col-span-7 grid grid-cols-3 gap-3 text-xs">
                  {[
                    {
                      sprint: 'Sprint 1: Core Foundation',
                      pts: '13 SP',
                      items: ['Auth & RBAC Schema', 'Primary CRUD API'],
                    },
                    {
                      sprint: 'Sprint 2: AI & Connectors',
                      pts: '13 SP',
                      items: ['Joy AI Synthesis', 'Stripe & Webhook Sync'],
                    },
                    {
                      sprint: 'Sprint 3: QA & Release',
                      pts: '8 SP',
                      items: ['E2E Playwright Suite', 'Production Cutover'],
                    },
                  ].map((s) => (
                    <div
                      key={s.sprint}
                      className="rounded-xl border border-white/10 bg-[#09081D] p-3.5"
                    >
                      <div className="font-bold text-white">{s.sprint}</div>
                      <div className="text-[11px] text-amber-400 mt-0.5">
                        {s.pts}
                      </div>
                      <ul className="mt-2 space-y-1 text-slate-400 text-[11px]">
                        {s.items.map((it) => (
                          <li key={it}>• {it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Showcase Templates (10 Templates) */}
      <section className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">
                Production Blueprints
              </span>
              <h2 className="mt-1 text-3xl font-bold text-white">
                Start from 10 Spec-Driven Application Templates
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-[#5345E9] text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="group rounded-2xl border border-white/10 bg-[#111029] p-5 hover:border-[#5345E9]/60 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-lg bg-[#5345E9]/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
                      {tpl.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {tpl.metrics}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                    {tpl.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    {tpl.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tpl.highlights.map((h) => (
                      <span
                        key={h}
                        className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-300"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={`/index?templateId=${tpl.id}&prompt=${encodeURIComponent(
                      tpl.promptText
                    )}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] hover:text-white transition"
                  >
                    <span>Clone Spec &amp; Build</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/template-documents"
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Preview PRD
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free AI Product Tools Teaser */}
      <section className="py-16 border-t border-white/10 bg-[#0B0A20]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                No Login Required
              </span>
              <h2 className="mt-1 text-3xl font-bold text-white">
                6 Free AI Generators for Product &amp; Engineering Teams
              </h2>
            </div>
            <Link
              href="/free-tools"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              Open All Free AI Tools <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FREE_AI_TOOLS_CATALOG.map((tool) => (
              <Link
                key={tool.id}
                href={`/free-tools?tool=${tool.id}`}
                className="rounded-2xl border border-white/10 bg-[#12112E] p-5 hover:border-amber-400/50 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-lg bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                    {tool.badge}
                  </span>
                  <Wand2 className="h-4 w-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white">{tool.name}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Architecture & Security Callout */}
      <section className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#5345E9]/30 via-[#151336] to-[#0E0D26] border border-white/15 p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <RefreshCw className="h-7 w-7 text-indigo-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Bidirectional Artifact Sync
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Every PRD update emits a `DocumentSyncEvent` so downstream
                    UI designs, Tech Designs, and Full-Stack Apps stay aligned.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Database className="h-7 w-7 text-cyan-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Isolated Preview &amp; Prod SQL DBs
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Inspect relational tables, execute SQL queries, capture
                    point-in-time snapshots, and reset schemas safely.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Layers className="h-7 w-7 text-emerald-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Invite-Only RBAC &amp; Audit Logs
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Single-use SHA-256 invitation links, role-based access
                    (`ADMIN`, `MEMBER`, `VIEWER`), and immutable audit logging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
