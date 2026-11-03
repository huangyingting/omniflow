'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/workspace/AppShell';
import { FolderKanban, Plus, Search, Trash2, ArrowRight } from 'lucide-react';

export default function OrgProjectsPage() {
  const [projects, setProjects] = useState<
    Array<{
      id: string;
      name: string;
      shortName: string;
      description: string;
      createdAt: string;
      owner: { name: string | null; email: string };
      documents: Array<{ id: string; type: string; status: string }>;
      issues: Array<{ id: string; status: string }>;
    }>
  >([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDeleteProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortName.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell
      title="Team Projects Directory"
      subtitle="All spec-driven projects in your organization workspace"
      actions={
        <Link
          href="/index"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
        >
          <Plus className="h-3.5 w-3.5" /> New Spec Project
        </Link>
      }
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, key, or spec..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs focus:border-[#5345E9] focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading organization projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <FolderKanban className="h-10 w-10 text-[#5345E9] mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            No matching projects found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Launch a new Spec-Driven project from the Home Builder.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => {
            const projIssues = proj.issues || [];
            const projDocs = proj.documents || [];
            const completedIssues = projIssues.filter(
              (i) => i.status === 'COMPLETED'
            ).length;
            const totalIssues = Math.max(1, projIssues.length);
            const pct = Math.round((completedIssues / totalIssues) * 100);

            return (
              <div
                key={proj.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-lg bg-[#5345E9]/10 px-2.5 py-0.5 text-xs font-mono font-bold text-[#5345E9]">
                      {proj.shortName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                      <span>Deliverable Completion</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#5345E9]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {projDocs.length} Artifacts • {projIssues.length}{' '}
                    Issues
                  </span>
                  <Link
                    href={`/projects/${proj.id}/planning/builder`}
                    className="inline-flex items-center gap-1 font-semibold text-[#5345E9] hover:underline"
                  >
                    <span>Open Builder</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
