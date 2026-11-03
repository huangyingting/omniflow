'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { ProjectSubNav } from '@/components/workspace/ProjectSubNav';
import { PieChart, CheckCircle2, Clock } from 'lucide-react';

export default function ProjectSnapshotReportPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [report, setReport] = useState<{
    project: { id: string; name: string; shortName: string };
    snapshot: {
      totalIssues: number;
      completedCount: number;
      inProgressCount: number;
      todoCount: number;
      completionRate: number;
      totalStoryPoints: number;
      completedStoryPoints: number;
      byPriority: { P0: number; P1: number; P2: number };
      deliverableStages: Array<{
        id: string;
        name: string;
        type: string;
        status: string;
        version: number;
      }>;
    };
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
      title="Executive Snapshot Report"
      subtitle="Real-time deliverable status, story point progress, and priority distribution"
    >
      <ProjectSubNav
        projectId={projectId}
        projectName={report?.project.name}
        shortName={report?.project.shortName}
      />

      {!report ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Calculating project snapshot telemetry...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs text-slate-500">Overall Completion</div>
              <div className="text-3xl font-extrabold text-[#5345E9] mt-1">
                {report.snapshot.completionRate}%
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs text-slate-500">Story Points Burned</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                {report.snapshot.completedStoryPoints} /{' '}
                {report.snapshot.totalStoryPoints}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs text-slate-500">P0 Blocker Items</div>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">
                {report.snapshot.byPriority.P0}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs text-slate-500">Total Work Items</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {report.snapshot.totalIssues}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <PieChart className="h-4 w-4 text-[#5345E9]" />
              <span>7-Stage Deliverable Readiness Matrix</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {report.snapshot.deliverableStages.map((st) => (
                <div
                  key={st.id}
                  className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {st.type}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Version V{st.version}
                    </div>
                  </div>
                  {st.status === 'PUBLISHED' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      <Clock className="h-3 w-3" /> Draft
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
