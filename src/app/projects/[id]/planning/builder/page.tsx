'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { ProjectSubNav } from '@/components/workspace/ProjectSubNav';
import {
  FileText,
  Palette,
  Code2,
  CalendarRange,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function ProjectPlanningBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState<{
    id: string;
    name: string;
    shortName: string;
    description: string;
    documents: Array<{
      id: string;
      name: string;
      type: string;
      status: string;
      currentVersion: number;
      updatedAt: string;
    }>;
    issues: Array<{
      id: string;
      name: string;
      shortName: string;
      type: string;
      status: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [enabledStages, setEnabledStages] = useState<string[]>([
    'PRD',
    'UI_DESIGN',
    'PRODUCT',
    'DEVELOPMENT_PLAN',
    'TECH_DESIGN',
    'QA_PLAN',
    'RELEASE_PLAN',
  ]);

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && data.project) {
        setProject(data.project);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleOpenOrGenerate = async (doc: {
    id: string;
    type: string;
    status: string;
  }) => {
    if (doc.type === 'DEVELOPMENT_PLAN') {
      router.push(`/devplan/${doc.id}`);
      return;
    }
    if (doc.status === 'DRAFT') {
      setSynthesizingId(doc.id);
      await fetch(`/api/documents/${doc.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Synthesize complete ${doc.type} for ${project?.name}`,
        }),
      });
      setSynthesizingId(null);
    }
    router.push(`/docs/${doc.id}`);
  };

  if (loading || !project) {
    return (
      <AppShell title="Spec Builder Pipeline">
        <div className="p-8 text-center text-sm text-slate-500">
          Loading 7-Stage Spec-Driven Pipeline...
        </div>
      </AppShell>
    );
  }

  const stageOrder = [
    {
      type: 'PRD',
      step: 'Stage 01',
      title: 'Living Product Requirements (PRD)',
      desc: 'Executive summary, target personas, P0/P1 user stories, acceptance criteria & SLAs',
      icon: FileText,
    },
    {
      type: 'UI_DESIGN',
      step: 'Stage 02',
      title: 'Multi-Page UI/UX Wireframe Prototype',
      desc: '4 interactive screens across 5 visual design systems with Desktop/Tablet/Mobile viewports',
      icon: Palette,
    },
    {
      type: 'PRODUCT',
      step: 'Stage 03',
      title: 'Full-Stack Application & SQL Databases',
      desc: 'Live runtime preview, source code editor, Preview/Prod SQL console, connectors & custom domains',
      icon: Code2,
    },
    {
      type: 'DEVELOPMENT_PLAN',
      step: 'Stage 04',
      title: 'AI Development Plan (Epics, Stories & Sprints)',
      desc: '2-step role-based task breakdown, story point estimation, milestones & sprint scheduling',
      icon: CalendarRange,
    },
    {
      type: 'TECH_DESIGN',
      step: 'Stage 05',
      title: 'Technical System Design & API Spec',
      desc: 'System topology, relational DDL schema, REST API contracts & RBAC security posture',
      icon: FileText,
    },
    {
      type: 'QA_PLAN',
      step: 'Stage 06',
      title: 'QA & Automated Test Matrix',
      desc: 'Playwright E2E test scenarios, RBAC security verification & performance benchmarks',
      icon: FileText,
    },
    {
      type: 'RELEASE_PLAN',
      step: 'Stage 07',
      title: 'Release Runbook & Rollback Checklist',
      desc: 'Phased rollout milestones, pre-flight readiness checks & zero-downtime rollback SOP',
      icon: FileText,
    },
  ];

  return (
    <AppShell
      title={`${project.name} — Spec Builder Pipeline`}
      subtitle="7-Stage Spec-Driven Software Engineering Workflow"
      actions={
        <button
          type="button"
          onClick={() => setCustomizeOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <span>Customize Project Workflow</span>
        </button>
      }
    >
      <ProjectSubNav
        projectId={project.id}
        projectName={project.name}
        shortName={project.shortName}
      />

      {customizeOpen && (
        <div className="mb-6 rounded-2xl border border-[#5345E9]/30 bg-indigo-50/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Customize Project Workflow Stages
              </h3>
              <p className="text-xs text-slate-500">
                Select the engineering deliverables active for {project.name}.
                PRD and Product are core required stages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCustomizeOpen(false)}
              className="rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              Save Workflow
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stageOrder.map((st) => {
              const locked = st.type === 'PRD' || st.type === 'PRODUCT';
              const checked = enabledStages.includes(st.type);
              return (
                <label
                  key={st.type}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    disabled={locked}
                    checked={checked}
                    onChange={() => {
                      if (locked) return;
                      setEnabledStages((prev) =>
                        prev.includes(st.type)
                          ? prev.filter((x) => x !== st.type)
                          : [...prev, st.type]
                      );
                    }}
                    className="rounded text-[#5345E9]"
                  />
                  <span>{st.title.split('(')[0].trim()}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {stageOrder
          .filter((st) => enabledStages.includes(st.type))
          .map((st, idx) => {
          const doc = project.documents.find((d) => d.type === st.type);
          const devPlanDoc = project.documents.find(
            (d) => d.type === 'DEVELOPMENT_PLAN'
          );
          const dueDate =
            devPlanDoc?.status === 'PUBLISHED'
              ? new Date(
                  Date.now() + (idx + 1) * 7 * 86400000
                ).toLocaleDateString()
              : null;
          const Icon = st.icon;
          const isPublished = doc?.status === 'PUBLISHED';

          return (
            <div
              key={st.type}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#5345E9]/50 transition"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    isPublished
                      ? 'bg-[#5345E9]/10 text-[#5345E9]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#5345E9]">
                      {st.step}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isPublished ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Published • V
                          {doc?.currentVersion || 1}
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" /> Ready to Synthesize
                        </>
                      )}
                    </span>
                    {dueDate && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-[#5345E9]">
                        Due: {dueDate}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{st.desc}</p>
                </div>
              </div>

              {doc && (
                <div className="flex items-center gap-2 shrink-0">
                  {st.type === 'PRODUCT' && (
                    <Link
                      href={`/preview/${doc.id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <span>Live Preview</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={synthesizingId === doc.id}
                    onClick={() => handleOpenOrGenerate(doc)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                      isPublished
                        ? 'bg-[#5345E9] text-white hover:bg-[#4335D6]'
                        : 'bg-indigo-50 text-[#5345E9] hover:bg-[#5345E9] hover:text-white'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      {synthesizingId === doc.id
                        ? 'Synthesizing...'
                        : isPublished
                        ? 'Open Studio'
                        : 'Synthesize with Joy AI'}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
