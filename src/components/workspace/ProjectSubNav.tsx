'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Workflow,
  Info,
  Flag,
  CalendarRange,
  Kanban,
  PieChart,
  LineChart,
} from 'lucide-react';

export function ProjectSubNav({
  projectId,
  projectName,
  shortName,
}: {
  projectId: string;
  projectName?: string;
  shortName?: string;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      href: `/projects/${projectId}/planning/builder`,
      label: 'Spec Builder Pipeline',
      icon: Workflow,
    },
    {
      href: `/projects/${projectId}/planning/info`,
      label: 'Project Info & Team',
      icon: Info,
    },
    {
      href: `/projects/${projectId}/building/milestones`,
      label: 'Milestones & Timeline',
      icon: Flag,
    },
    {
      href: `/projects/${projectId}/building/projectorganizationpath`,
      label: 'Sprints & Backlog',
      icon: CalendarRange,
    },
    {
      href: `/projects/${projectId}/building/issueboard`,
      label: 'Kanban Issue Board',
      icon: Kanban,
    },
    {
      href: `/projects/${projectId}/reporting/snapshot`,
      label: 'Snapshot Report',
      icon: PieChart,
    },
    {
      href: `/projects/${projectId}/reporting/weekly`,
      label: 'Weekly Velocity',
      icon: LineChart,
    },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg bg-[#5345E9]/10 px-2.5 py-1 text-xs font-mono font-bold text-[#5345E9]">
            {shortName || 'PROJ'}
          </span>
          <h2 className="text-base font-bold text-slate-900">
            {projectName || 'Project Workspace'}
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          7-Stage Spec-Driven Lifecycle
        </span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                active
                  ? 'bg-[#5345E9] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
