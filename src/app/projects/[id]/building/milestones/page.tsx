'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { ProjectSubNav } from '@/components/workspace/ProjectSubNav';
import { Flag, Calendar } from 'lucide-react';

export default function ProjectMilestonesPage() {
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
      plannedStartDate: string | null;
      plannedEndDate: string | null;
    }>;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.project) setProject(d.project);
      });
  }, [projectId]);

  const milestones = (project?.workPlans || []).filter(
    (wp) => wp.type === 'MILESTONE'
  );

  return (
    <AppShell
      title="Milestones & Release Timeline"
      subtitle="Track phase gates, release dates, and milestone deliverables"
    >
      <ProjectSubNav
        projectId={projectId}
        projectName={project?.name}
        shortName={project?.shortName}
      />

      <div className="space-y-4">
        {milestones.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No milestones created yet. Open the DevPlan Studio to generate
            milestones automatically.
          </div>
        ) : (
          milestones.map((ms, idx) => (
            <div
              key={ms.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5345E9]/10 text-[#5345E9]">
                  <Flag className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#5345E9]">
                    Milestone 0{idx + 1} • {ms.status}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {ms.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ms.description || 'Core specification & full-stack release'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#5345E9]" />
                  {ms.plannedEndDate
                    ? new Date(ms.plannedEndDate).toLocaleDateString()
                    : 'Scheduled'}
                </span>
                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono font-bold text-[#5345E9]">
                  {ms.storyPoint || 13} SP
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
