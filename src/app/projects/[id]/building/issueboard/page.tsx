'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { ProjectSubNav } from '@/components/workspace/ProjectSubNav';
import { Plus, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface IssueItem {
  id: string;
  name: string;
  shortName: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  storyPoint: number;
}

export default function ProjectIssueBoardPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<{
    id: string;
    name: string;
    shortName: string;
  } | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('P1');
  const [newPoints, setNewPoints] = useState(3);

  const loadBoard = useCallback(async () => {
    const [projRes, issRes] = await Promise.all([
      fetch(`/api/projects/${projectId}`, { cache: 'no-store' }),
      fetch(`/api/projects/${projectId}/issues`, { cache: 'no-store' }),
    ]);
    const projData = await projRes.json();
    const issData = await issRes.json();
    if (projData.project) setProject(projData.project);
    if (issData.issues) setIssues(issData.issues);
  }, [projectId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const handleMoveStatus = async (issueId: string, nextStatus: string) => {
    await fetch(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        issueId,
        status: nextStatus,
      }),
    });
    await loadBoard();
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        description: newDesc,
        priority: newPriority,
        storyPoint: newPoints,
        type: 'STORY',
        status: 'TODO',
      }),
    });
    setNewName('');
    setNewDesc('');
    setShowAddModal(false);
    await loadBoard();
  };

  const columns = [
    { id: 'TODO', title: 'To Do', badgeColor: 'bg-amber-50 text-amber-700' },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      badgeColor: 'bg-indigo-50 text-[#5345E9]',
    },
    {
      id: 'COMPLETED',
      title: 'Completed',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <AppShell
      title="Kanban Sprint & Deliverable Board"
      subtitle="Manage user stories, tasks, and deliverable stage status"
      actions={
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
        >
          <Plus className="h-3.5 w-3.5" /> Create Story / Task
        </button>
      }
    >
      <ProjectSubNav
        projectId={projectId}
        projectName={project?.name}
        shortName={project?.shortName}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colIssues = issues.filter((i) =>
            col.id === 'TODO'
              ? i.status === 'TODO' || i.status === 'CREATED'
              : i.status === col.id
          );
          return (
            <div
              key={col.id}
              className="rounded-2xl border border-slate-200 bg-slate-100/70 p-3.5 space-y-3 min-h-[420px]"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-800">
                  {col.title} ({colIssues.length})
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {colIssues.reduce((s, i) => s + (i.storyPoint || 0), 0)} SP
                </span>
              </div>

              <div className="space-y-2.5">
                {colIssues.map((iss) => (
                  <div
                    key={iss.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-[#5345E9]">
                        {iss.shortName}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                        {iss.priority} • {iss.storyPoint} SP
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      {iss.name}
                    </div>
                    {iss.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {iss.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      {col.id !== 'IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleMoveStatus(iss.id, 'IN_PROGRESS')
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-[#5345E9] hover:bg-indigo-100"
                        >
                          <span>Start</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      )}
                      {col.id !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => handleMoveStatus(iss.id, 'COMPLETED')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Create Sprint Story / Task
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateIssue} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Story Title
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Implement Webhook Retry & Dead-Letter Queue"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="P0">P0 — Critical</option>
                    <option value="P1">P1 — High</option>
                    <option value="P2">P2 — Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Story Points
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={21}
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Acceptance Criteria
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Given/When/Then criteria..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white"
                >
                  Create Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
