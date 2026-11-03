'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { ProjectSubNav } from '@/components/workspace/ProjectSubNav';
import { LineChart } from 'lucide-react';

export default function ProjectWeeklyReportPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [report, setReport] = useState<{
    project: { id: string; name: string; shortName: string };
    weeklyVelocity: Array<{
      week: string;
      plannedPoints: number;
      completedPoints: number;
      artifactsUpdated: number;
    }>;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/reports`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setReport(d);
      });
  }, [projectId]);

  return (
    <AppShell
      title="Weekly Sprint Velocity & Burndown"
      subtitle="Historical story point throughput and specification synchronization cadence"
    >
      <ProjectSubNav
        projectId={projectId}
        projectName={report?.project.name}
        shortName={report?.project.shortName}
      />

      {!report ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Loading weekly velocity metrics...
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <LineChart className="h-4 w-4 text-[#5345E9]" />
            <span>4-Week Sprint Velocity &amp; Artifact Cadence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {report.weeklyVelocity.map((w) => {
              const pct = Math.min(
                100,
                Math.round(
                  (w.completedPoints / Math.max(1, w.plannedPoints)) * 100
                )
              );
              return (
                <div
                  key={w.week}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                >
                  <div className="text-xs font-bold text-slate-900">
                    {w.week}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-[#5345E9]">
                      {w.completedPoints} SP
                    </span>
                    <span className="text-xs text-slate-500">
                      of {w.plannedPoints} SP planned
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-[#5345E9]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {w.artifactsUpdated} Specification Updates
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
