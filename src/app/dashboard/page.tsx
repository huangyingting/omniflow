'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/workspace/AppShell';
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  FileText,
  ArrowRight,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const [projects, setProjects] = useState<
    Array<{
      id: string;
      name: string;
      shortName: string;
      description: string;
      documents: Array<{ id: string; name: string; type: string; status: string }>;
      issues: Array<{
        id: string;
        name: string;
        shortName: string;
        type: string;
        status: string;
        priority: string;
        storyPoint: number;
      }>;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        if (d.projects) setProjects(d.projects);
      })
      .finally(() => setLoading(false));
  }, []);

  const allIssues = projects.flatMap((p) =>
    (p.issues || []).map((i) => ({ ...i, projectId: p.id, projectName: p.name }))
  );
  const allDocs = projects.flatMap((p) =>
    (p.documents || []).map((d) => ({ ...d, projectId: p.id, projectName: p.name }))
  );

  const todoIssues = allIssues.filter(
    (i) => i.status === 'TODO' || i.status === 'CREATED'
  );
  const inProgressIssues = allIssues.filter((i) => i.status === 'IN_PROGRESS');
  const completedIssues = allIssues.filter((i) => i.status === 'COMPLETED');

  return (
    <AppShell
      title="My Work Dashboard"
      subtitle="Personal engineering backlog, assigned stories, and recent specifications"
      actions={
        <Link
          href="/index"
          className="rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
        >
          + New Spec Project
        </Link>
      }
    >
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            Active Projects
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            {projects.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            Synchronized Artifacts
          </div>
          <div className="mt-1 text-2xl font-extrabold text-[#5345E9]">
            {allDocs.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            Open Sprint Stories
          </div>
          <div className="mt-1 text-2xl font-extrabold text-amber-600">
            {todoIssues.length + inProgressIssues.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            Completed Stories
          </div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600">
            {completedIssues.length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading your workspace items...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Layers className="h-10 w-10 text-[#5345E9] mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            Your workspace has no projects yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Create your first Spec-Driven project from the Home Builder to
            populate your Living PRD, UI/UX wireframes, full-stack app, and
            sprint backlog.
          </p>
          <Link
            href="/index"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white"
          >
            <span>Create First Project</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Assigned Sprint Issues */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Assigned Work Items &amp; Deliverable Stages ({allIssues.length})
            </h2>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {allIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/projects/${issue.projectId}/building/issueboard`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:border-[#5345E9]/40 transition"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {issue.status === 'COMPLETED' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {issue.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {issue.shortName} • {issue.projectName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                      {issue.storyPoint} SP
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        issue.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : issue.status === 'IN_PROGRESS'
                          ? 'bg-indigo-50 text-[#5345E9]'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {issue.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Artifacts */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Recent Specifications &amp; Apps ({allDocs.length})
            </h2>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {allDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={
                    doc.type === 'DEVELOPMENT_PLAN'
                      ? `/devplan/${doc.id}`
                      : `/docs/${doc.id}`
                  }
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="h-4 w-4 text-[#5345E9] shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {doc.projectName} • {doc.type}
                      </div>
                    </div>
                  </div>
                  <span className="rounded-lg bg-[#5345E9]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5345E9]">
                    Open
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
