'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/workspace/AppShell';
import { Layers, ExternalLink, Code2, Database, Plus } from 'lucide-react';

export default function AppsPage() {
  const [apps, setApps] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      status: string;
      currentVersion: number;
      url: string | null;
      updatedAt: string;
      project: { id: string; name: string; shortName: string } | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents?type=PRODUCT')
      .then((r) => r.json())
      .then((d) => {
        if (d.documents) setApps(d.documents);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      title="My Products & Full-Stack Apps"
      subtitle="Full-stack applications with live Preview/Production SQL databases and custom domain deployment"
      actions={
        <Link
          href="/index"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
        >
          <Plus className="h-3.5 w-3.5" /> Build New App
        </Link>
      }
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading full-stack applications...
        </div>
      ) : apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Layers className="h-10 w-10 text-[#5345E9] mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            No Full-Stack Applications yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Start a project on the Home Builder to synthesize a Living PRD,
            multi-page UI/UX design, and full-stack application with SQL
            persistence.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {apps.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    V{app.currentVersion} • Full-Stack App
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {app.project?.shortName || 'APP'}
                  </span>
                </div>
                <Link
                  href={`/docs/${app.id}`}
                  className="text-base font-bold text-slate-900 hover:text-[#5345E9]"
                >
                  {app.name}
                </Link>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {app.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5">
                    <Code2 className="h-3 w-3 text-[#5345E9]" /> Code + Preview
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5">
                    <Database className="h-3 w-3 text-emerald-600" /> Preview
                    &amp; Prod SQL
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/docs/${app.id}`}
                  className="flex-1 text-center rounded-xl bg-[#5345E9] py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                >
                  Open App Studio
                </Link>
                <Link
                  href={`/preview/${app.id}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>Live App</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
