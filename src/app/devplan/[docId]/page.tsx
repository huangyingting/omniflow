'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import type { DevPlanMeta } from '@/lib/omniflow/ai-engine';
import {
  CalendarRange,
  CheckCircle2,
  Sparkles,
  Users,
  ArrowRight,
  Flag,
  Kanban,
  RefreshCw,
} from 'lucide-react';

const ALL_ROLES = [
  'Product Manager',
  'UI/UX Designer',
  'Full-Stack Engineer',
  'Backend & Database Engineer',
  'QA & Automation Engineer',
  'DevOps & Security Architect',
];

export default function DevPlanStudioPage() {
  const params = useParams<{ docId: string }>();
  const router = useRouter();
  const docId = params.docId;

  const [doc, setDoc] = useState<{
    id: string;
    name: string;
    projectId: string | null;
    currentVersion: number;
    parsedMeta: DevPlanMeta;
  } | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    'Product Manager',
    'UI/UX Designer',
    'Full-Stack Engineer',
    'QA & Automation Engineer',
  ]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<
    Array<{
      id: string;
      name: string | null;
      email: string;
      specialty: string;
      velocity: number;
    }>
  >([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const loadDevPlan = useCallback(async () => {
    try {
      const [res, uRes] = await Promise.all([
        fetch(`/api/documents/${docId}`, { cache: 'no-store' }),
        fetch('/api/settings/users', { cache: 'no-store' }),
      ]);
      const data = await res.json();
      if (res.ok && data.document) {
        setDoc(data.document);
        if (data.document.parsedMeta?.roles) {
          setSelectedRoles(data.document.parsedMeta.roles);
        }
      }
      if (uRes.ok) {
        const uData = await uRes.json();
        const list = uData.users || [];
        setTeamMembers(list);
        if (list.length > 0) {
          setSelectedMemberIds(list.map((u: { id: string }) => u.id));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    loadDevPlan();
  }, [loadDevPlan]);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSynthesizePlan = async (confirmSchedule: boolean) => {
    if (!doc) return;
    setGenerating(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/documents/${doc.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roles: selectedRoles,
          confirmSchedule,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBanner(data.assistantReply);
        await loadDevPlan();
        if (!confirmSchedule) {
          setStep(2);
        }
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !doc) {
    return (
      <AppShell title="Development Plan Studio">
        <div className="p-8 text-center text-sm text-slate-500">
          Loading 2-Step AI Development Planner...
        </div>
      </AppShell>
    );
  }

  const meta = doc.parsedMeta;

  return (
    <AppShell
      title={doc.name}
      subtitle="2-Step AI Sprint, Epic, User Story & Milestone Planner"
      actions={
        doc.projectId && (
          <Link
            href={`/projects/${doc.projectId}/building/issueboard`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Open Kanban Board →</span>
          </Link>
        )
      }
    >
      {/* 2-Step Progress Header */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              step === 1
                ? 'bg-[#5345E9] text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <span>Step 1: Roles, Epics &amp; User Stories</span>
          </button>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              step === 2
                ? 'bg-[#5345E9] text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <span>Step 2: Milestones &amp; Sprint Schedule</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={generating}
            onClick={() => handleSynthesizePlan(false)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`}
            />
            <span>Generate Task Breakdown</span>
          </button>
          <button
            type="button"
            disabled={generating}
            onClick={() => handleSynthesizePlan(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirm Schedule &amp; Publish Dev Plan</span>
          </button>
        </div>
      </div>

      {banner && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
          <span>{banner}</span>
          {doc.projectId && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  router.push(`/projects/${doc.projectId}/building/milestones`)
                }
                className="rounded-lg bg-white border border-emerald-300 px-3 py-1 text-emerald-800 font-semibold"
              >
                View Milestones →
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(`/projects/${doc.projectId}/building/issueboard`)
                }
                className="rounded-lg bg-emerald-700 px-3 py-1 text-white font-semibold"
              >
                View Sprint Board →
              </button>
            </div>
          )}
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-6">
          {/* Team Role Selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
              <Users className="h-4 w-4 text-[#5345E9]" />
              <span>Select Engineering &amp; Product Roles for Task Allocation</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((role) => {
                const active = selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-[#5345E9] bg-[#5345E9]/10 text-[#5345E9]'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Epics & User Stories Hierarchy */}
          <div className="space-y-4">
            {(meta?.epics || []).map((epic) => (
              <div
                key={epic.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#5345E9]">
                      {epic.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {epic.name}
                    </h3>
                    <p className="text-xs text-slate-500">{epic.summary}</p>
                  </div>
                  <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-bold text-[#5345E9]">
                    {epic.stories.reduce((acc, s) => acc + s.storyPoint, 0)}{' '}
                    Story Points
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {epic.stories.map((st) => (
                    <div
                      key={st.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-700">
                          {st.id} • {st.role}
                        </span>
                        <span className="rounded bg-[#5345E9]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#5345E9]">
                          {st.storyPoint} SP • {st.priority}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {st.name}
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {st.acceptanceCriteria.map((ac) => (
                          <li key={ac}>• {ac}</li>
                        ))}
                      </ul>
                      <div className="text-[11px] font-medium text-slate-400 pt-1">
                        Target: {st.sprint}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5345E9] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
            >
              <span>Proceed to Step 2: Milestones &amp; Sprint Schedule</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Team Members & Velocity Capacity Selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Users className="h-4 w-4 text-[#5345E9]" />
                <span>
                  Team Members &amp; Sprint Capacity Allocation (* Team members)
                </span>
              </div>
              <Link
                href="/settings/users"
                className="text-xs font-semibold text-[#5345E9] hover:underline"
              >
                Configure Specialty &amp; Velocity →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((m) => {
                const active = selectedMemberIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setSelectedMemberIds((prev) =>
                        prev.includes(m.id)
                          ? prev.filter((id) => id !== m.id)
                          : [...prev, m.id]
                      )
                    }
                    className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-[#5345E9] bg-[#5345E9]/10 text-[#5345E9]'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {m.name || m.email.split('@')[0]} (
                    {(m.specialty || 'FULLSTACK ENGINEER').toUpperCase()},{' '}
                    {m.velocity || 10} pts)
                  </button>
                );
              })}
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <Flag className="h-4 w-4 text-[#5345E9]" />
              <span>Release Milestones</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(meta?.milestones || []).map((ms) => (
                <div
                  key={ms.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="text-xs font-bold text-[#5345E9]">
                    Target: {ms.targetDate}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {ms.name}
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {ms.deliverables.map((d) => (
                      <li key={d}>• {d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Sprints */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <CalendarRange className="h-4 w-4 text-emerald-600" />
              <span>Two-Week Sprint Cadence</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(meta?.sprints || []).map((sp) => (
                <div
                  key={sp.id}
                  className="rounded-xl border border-slate-200 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{sp.name}</span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">
                      {sp.totalStoryPoints} SP
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {sp.startDate} → {sp.endDate}
                  </div>
                  <p className="text-xs text-slate-700">{sp.goal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={generating}
              onClick={() => handleSynthesizePlan(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                Confirm Schedule &amp; Materialize Sprint Issues in Project
              </span>
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
