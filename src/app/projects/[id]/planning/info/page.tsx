'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { ProjectSubNav } from '@/components/workspace/ProjectSubNav';
import { Save, CheckCircle2 } from 'lucide-react';

export default function ProjectInfoPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<{
    id: string;
    name: string;
    shortName: string;
    description: string;
    access: string;
    owner: { name: string | null; email: string };
  } | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [access, setAccess] = useState('ORGANIZATION');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.project) {
          setProject(d.project);
          setName(d.project.name);
          setDescription(d.project.description);
          setAccess(d.project.access);
        }
      });
  }, [projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, access }),
    });
    const data = await res.json();
    if (res.ok && data.project) {
      setProject({ ...project!, ...data.project });
      setSavedMsg('Saved project metadata.');
    }
  };

  return (
    <AppShell
      title="Project Info & Governance"
      subtitle="Manage project metadata, short key, and team visibility"
    >
      <ProjectSubNav
        projectId={projectId}
        projectName={project?.name}
        shortName={project?.shortName}
      />

      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        {savedMsg && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{savedMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Key (Short Name)
            </label>
            <input
              type="text"
              disabled
              value={project?.shortName || ''}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-mono text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specification Prompt &amp; Summary
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Workspace Visibility
            </label>
            <select
              value={access}
              onChange={(e) => setAccess(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
            >
              <option value="ORGANIZATION">
                ORGANIZATION (Visible to all invited workspace members)
              </option>
              <option value="TEAM">TEAM (Restricted to assigned team)</option>
              <option value="SELF">SELF (Private to project owner)</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5345E9] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
          >
            <Save className="h-4 w-4" />
            <span>Save Project Info</span>
          </button>
        </form>
      </div>
    </AppShell>
  );
}
