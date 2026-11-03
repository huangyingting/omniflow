'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import {
  PRODUCT_SHOWCASE_TEMPLATES,
  OFFICIAL_DOCUMENT_TEMPLATES,
} from '@/lib/omniflow/catalog';
import {
  Sparkles,
  BookOpen,
  LayoutTemplate,
  ArrowRight,
  FolderKanban,
  FileText,
  Palette,
  Code2,
  CalendarRange,
  Wand2,
  Loader2,
} from 'lucide-react';

function IndexWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState(
    searchParams.get('prompt') ||
      'Build a SmartSupport AI Customer Triage & SLA Hub with automated ticket routing, grounded RAG knowledge base responses, live sentiment analytics, and Stripe billing.'
  );
  const [projectName, setProjectName] = useState('');
  const [selectedKbId, setSelectedKbId] = useState('');
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState('');
  const [knowledgeBases, setKnowledgeBases] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [recentProjects, setRecentProjects] = useState<
    Array<{
      id: string;
      name: string;
      shortName: string;
      description: string;
      createdAt: string;
      documents: Array<{ id: string; type: string; status: string }>;
    }>
  >([]);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showcaseCategory, setShowcaseCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<
    (typeof PRODUCT_SHOWCASE_TEMPLATES)[number] | null
  >(null);

  useEffect(() => {
    const queryPrompt = searchParams.get('prompt');
    if (queryPrompt) {
      setPrompt(queryPrompt);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/knowledge-base')
      .then((r) => r.json())
      .then((d) => {
        if (d.knowledgeBases) setKnowledgeBases(d.knowledgeBases);
      })
      .catch(() => {});

    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        if (d.projects) setRecentProjects(d.projects);
      })
      .catch(() => {});
  }, []);

  const handleCreateSpecProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || creating) return;
    setCreating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName.trim() || undefined,
          prompt: prompt.trim(),
          knowledgeBaseId: selectedKbId || undefined,
          templateId: selectedTemplateSlug || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create project.');
        setCreating(false);
        return;
      }
      const prdId =
        data.prdDocument?.id ||
        data.prdDocumentId ||
        data.documents?.PRD?.id;
      if (prdId) {
        router.push(`/docs/${prdId}`);
      } else if (data.project?.id) {
        router.push(`/projects/${data.project.id}/planning/builder`);
      }
    } catch {
      setErrorMsg('Network error creating project.');
      setCreating(false);
    }
  };

  const categories = [
    'All',
    'AI Apps',
    'SaaS & CRM',
    'Internal Tools',
    'E-Commerce',
    'FinTech',
  ];

  const filteredTemplates =
    showcaseCategory === 'All'
      ? PRODUCT_SHOWCASE_TEMPLATES
      : PRODUCT_SHOWCASE_TEMPLATES.filter(
          (t) => t.category === showcaseCategory
        );

  return (
    <div className="space-y-8">
      {/* Hero Spec-Driven Composer */}
      <div className="rounded-3xl bg-gradient-to-br from-[#121036] via-[#1B174D] to-[#271F6B] p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl mx-auto text-center mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-indigo-200 border border-white/15">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Joy AI • Spec-Driven Application &amp; Project Builder</span>
          </span>
          <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight">
            What would you like to specify, design, and build today?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-200/90">
            Describe your product or attach a Knowledge Base. OmniFlow creates
            your Living PRD, 4-page UI/UX wireframes, Full-Stack App + SQL DB,
            and Sprint Plan in one connected workspace.
          </p>
        </div>

        <form
          onSubmit={handleCreateSpecProject}
          className="max-w-3xl mx-auto rounded-2xl bg-white p-4 text-slate-900 shadow-2xl space-y-3"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2.5">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Optional Project Name (e.g., SmartSupport Hub)"
              className="flex-1 min-w-[200px] rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-[#5345E9] focus:outline-none"
            />

            {/* Knowledge Base Grounding Selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5 text-[#5345E9]" />
              <select
                value={selectedKbId}
                onChange={(e) => setSelectedKbId(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
                aria-label="Knowledge Base Grounding"
              >
                <option value="">No Knowledge Base attached</option>
                {knowledgeBases.map((kb) => (
                  <option key={kb.id} value={kb.id}>
                    KB: {kb.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Blueprint Selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
              <LayoutTemplate className="h-3.5 w-3.5 text-[#5345E9]" />
              <select
                value={selectedTemplateSlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  setSelectedTemplateSlug(slug);
                  const found = OFFICIAL_DOCUMENT_TEMPLATES.find(
                    (t) => t.slug === slug
                  );
                  if (found) {
                    setPrompt(found.promptText);
                    if (!projectName) setProjectName(found.name);
                  }
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
                aria-label="Specification Template"
              >
                <option value="">Standard 7-Stage Spec</option>
                {OFFICIAL_DOCUMENT_TEMPLATES.map((tpl) => (
                  <option key={tpl.slug} value={tpl.slug}>
                    Template: {tpl.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            rows={3}
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your product's target users, key workflows, data entities, and integrations..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#5345E9] focus:bg-white focus:outline-none"
          />

          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                {
                  name: 'SmartSupport Hub',
                  prompt:
                    'Build a SmartSupport AI Customer Triage & SLA Hub with automated ticket routing, grounded RAG knowledge base responses, live sentiment analytics, and Stripe billing.',
                },
                {
                  name: 'PulseCRM Pipeline',
                  prompt:
                    'Build an AI Revenue & Deal Forecasting CRM with Kanban deal stages, automated account health scoring, and PostgreSQL analytics.',
                },
                {
                  name: 'FinGuard Treasury',
                  prompt:
                    'Build an Enterprise Spend & Expense Approval Portal with multi-step policy routing, receipt OCR extraction, and immutable audit logs.',
                },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setProjectName(preset.name);
                    setPrompt(preset.prompt);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-[#5345E9] hover:text-[#5345E9] transition"
                >
                  <Wand2 className="h-3 w-3 inline mr-1 text-[#5345E9]" />
                  {preset.name}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5345E9] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#4335D6] disabled:opacity-60 transition"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing 7-Stage Project...</span>
                </>
              ) : (
                <>
                  <span>Generate Spec, UI &amp; App</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* 4-Stage Pipeline Indicator */}
        <div className="max-w-3xl mx-auto mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
          {[
            {
              icon: FileText,
              title: '1. Living PRD',
              desc: 'Versioned spec + RAG citations',
            },
            {
              icon: Palette,
              title: '2. UI/UX Design',
              desc: '4 screens × 5 style themes',
            },
            {
              icon: Code2,
              title: '3. Full-Stack App',
              desc: 'Live preview + Preview/Prod SQL',
            },
            {
              icon: CalendarRange,
              title: '4. DevPlan & Sprints',
              desc: 'Epics, stories & Kanban board',
            },
          ].map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.title}
                className="rounded-xl bg-white/10 border border-white/10 p-3 backdrop-blur-xs"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Icon className="h-3.5 w-3.5 text-indigo-300" />
                  <span>{st.title}</span>
                </div>
                <div className="text-[11px] text-indigo-200/80 mt-0.5">
                  {st.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Workspace Projects */}
      {recentProjects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Active Spec-Driven Projects
              </h2>
              <p className="text-xs text-slate-500">
                Continue refining PRDs, multi-page UI wireframes, full-stack
                code, or sprint boards.
              </p>
            </div>
            <Link
              href="/org"
              className="text-xs font-semibold text-[#5345E9] hover:underline"
            >
              View All Projects →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.slice(0, 6).map((proj) => {
              const prdDoc = proj.documents.find((d) => d.type === 'PRD');
              const uiDoc = proj.documents.find((d) => d.type === 'UI_DESIGN');
              const prodDoc = proj.documents.find((d) => d.type === 'PRODUCT');
              const devPlanDoc = proj.documents.find(
                (d) => d.type === 'DEVELOPMENT_PLAN'
              );
              return (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#5345E9]/50 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#5345E9]/10 px-2.5 py-0.5 text-xs font-mono font-bold text-[#5345E9]">
                        <FolderKanban className="h-3.5 w-3.5" />
                        {proj.shortName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      href={`/projects/${proj.id}/planning/builder`}
                      className="text-base font-bold text-slate-900 hover:text-[#5345E9]"
                    >
                      {proj.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {proj.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    {prdDoc && (
                      <Link
                        href={`/docs/${prdDoc.id}`}
                        className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-[#5345E9] hover:bg-indigo-100"
                      >
                        PRD
                      </Link>
                    )}
                    {uiDoc && (
                      <Link
                        href={`/docs/${uiDoc.id}`}
                        className="rounded-lg bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 hover:bg-cyan-100"
                      >
                        UI/UX
                      </Link>
                    )}
                    {prodDoc && (
                      <Link
                        href={`/docs/${prodDoc.id}`}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Product App
                      </Link>
                    )}
                    {devPlanDoc && (
                      <Link
                        href={`/devplan/${devPlanDoc.id}`}
                        className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                      >
                        DevPlan
                      </Link>
                    )}
                    <Link
                      href={`/projects/${proj.id}/planning/builder`}
                      className="ml-auto text-[11px] font-semibold text-slate-600 hover:text-[#5345E9]"
                    >
                      Pipeline →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Product Showcase Blueprints */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Product Showcase &amp; Starter Blueprints
            </h2>
            <p className="text-xs text-slate-500">
              Clone any blueprint to generate its full PRD, UI/UX wireframes,
              SQL database, and sprint plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setShowcaseCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  showcaseCategory === cat
                    ? 'bg-[#5345E9] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#5345E9]/50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="rounded-lg bg-[#5345E9]/10 px-2.5 py-0.5 font-semibold text-[#5345E9]">
                    {tpl.category}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {tpl.metrics}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {tpl.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {tpl.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tpl)}
                  className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Preview Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjectName(tpl.name.split('—')[0].trim());
                    setPrompt(tpl.promptText);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-xl border border-[#5345E9]/30 bg-[#5345E9]/5 py-2 text-xs font-semibold text-[#5345E9] hover:bg-[#5345E9] hover:text-white transition"
                >
                  Clone Into Builder ↑
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-lg bg-[#5345E9]/10 px-2.5 py-0.5 text-xs font-semibold text-[#5345E9]">
                  {previewTemplate.category} • {previewTemplate.metrics}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {previewTemplate.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {previewTemplate.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="text-xs font-bold text-slate-800">
                Included Spec-Driven Deliverables
              </div>
              <div className="flex flex-wrap gap-1.5">
                {previewTemplate.highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    ✓ {h}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600 pt-2 font-mono">
                Prompt Blueprint: &ldquo;{previewTemplate.promptText}&rdquo;
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const chosen = previewTemplate;
                  setPreviewTemplate(null);
                  setProjectName(chosen.name.split('—')[0].trim());
                  setPrompt(chosen.promptText);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-xl bg-[#5345E9] px-5 py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
              >
                Clone Blueprint into Builder →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IndexWorkspacePage() {
  return (
    <AppShell
      title="Home — Spec-Driven Builder"
      subtitle="Specify, design, build, and plan in one unified AI workspace"
    >
      <Suspense fallback={<div className="p-8 text-sm">Loading builder...</div>}>
        <IndexWorkspaceContent />
      </Suspense>
    </AppShell>
  );
}
