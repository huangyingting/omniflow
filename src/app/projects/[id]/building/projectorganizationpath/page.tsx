'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { ProjectSubNav } from '@/components/workspace/ProjectSubNav';
import { CalendarRange, Kanban } from 'lucide-react';

export default function ProjectSprintsPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<{
    id: string;
    name: string;
    shortName: string;
    workPlans: Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      status: string;
      storyPoint: number | null;
      issues: Array<{
        id: string;
        name: string;
        shortName: string;
        status: string;
        priority: string;
        storyPoint: number;
      }>;
    }>;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.project) setProject(d.project);
      });
  }, [projectId]);

  const sprintsAndBacklog = (project?.workPlans || []).filter(
    (wp) => wp.type === 'SPRINT' || wp.type === 'BACKLOG'
  );

  return (
    <AppShell
      title="Sprints & Backlog Organization"
      subtitle="Sprint containers, story point capacity, and backlog allocation"
      actions={
        <Link
          href={`/projects/${projectId}/building/issueboard`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white"
        >
          <Kanban className="h-3.5 w-3.5" /> Open Kanban Board
        </Link>
      }
    >
      <ProjectSubNav
        projectId={projectId}
        projectName={project?.name}
        shortName={project?.shortName}
      />

      <div className="space-y-5">
        {sprintsAndBacklog.map((wp) => (
          <div
            key={wp.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <CalendarRange className="h-4 w-4 text-[#5345E9]" />
                <div>
                  <span className="text-sm font-bold text-slate-900">
                    {wp.name}
                  </span>
                  <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {wp.type} • {wp.status}
                  </span>
                </div>
              </div>
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-mono font-bold text-[#5345E9]">
                {wp.issues.reduce((s, i) => s + (i.storyPoint || 0), 0)} SP (
                {wp.issues.length} items)
              </span>
            </div>

            {wp.issues.length === 0 ? (
              <p className="text-xs text-slate-400">
                No stories assigned to this container yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {wp.issues.map((iss) => (
                  <div
                    key={iss.id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-500 mr-2">
                        {iss.shortName}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {iss.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px]">
                        {iss.storyPoint} SP
                      </span>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-[#5345E9]">
                        {iss.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
