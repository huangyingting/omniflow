'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ProductMeta } from '@/lib/omniflow/ai-engine';
import {
  Sparkles,
  Plus,
  Database,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export default function LiveProductPreviewPage() {
  const params = useParams<{ docId: string }>();
  const docId = params.docId;

  const [doc, setDoc] = useState<{
    id: string;
    name: string;
    description: string;
    currentVersion: number;
    parsedMeta: ProductMeta;
  } | null>(null);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('P0');
  const [newOwner, setNewOwner] = useState('alex@omniflow.io');
  const [loading, setLoading] = useState(true);

  const loadApp = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.document) {
        setDoc(data.document);
        const tableRows =
          data.document.parsedMeta?.previewDb?.tables?.[0]?.rows || [];
        setRows(tableRows);
      }
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    loadApp();
  }, [loadApp]);

  const handleInsertRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !doc) return;
    const id = `rec-${Math.floor(100 + Math.random() * 900)}`;
    const sql = `INSERT INTO records (id, title, status, priority, owner, created_at) VALUES ('${id}', '${newTitle.replace(
      /'/g,
      ''
    )}', 'IN_PROGRESS', '${newPriority}', '${newOwner.replace(
      /'/g,
      ''
    )}', '${new Date().toISOString().slice(0, 10)}');`;

    const res = await fetch(`/api/documents/${doc.id}/database`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        environment: 'PREVIEW',
        action: 'execute-sql',
        query: sql,
      }),
    });
    const data = await res.json();
    if (res.ok && data.rows) {
      setRows(data.rows);
      setNewTitle('');
    }
  };

  if (loading || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-sm">
        Launching OmniFlow Live Application Runtime...
      </div>
    );
  }

  const meta = doc.parsedMeta;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Runtime Bar */}
      <header className="border-b border-white/10 bg-slate-900/90 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/docs/${doc.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Product Studio</span>
          </Link>
          <span className="text-sm font-bold text-white">
            {meta?.appTitle || doc.name}
          </span>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
            LIVE RUNTIME • V{doc.currentVersion}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Database className="h-3.5 w-3.5 text-cyan-400" /> Connected to
            Preview SQL DB
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> RBAC Active
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 sm:p-10 space-y-8">
        {/* Hero Banner */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#5345E9]/30 via-slate-900 to-slate-900 p-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Spec-Driven Full-Stack App
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {meta?.appTitle || doc.name}
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            {meta?.heroSubtitle || doc.description}
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400">Total Active Records</div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {rows.length}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400">P0 Critical Items</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {rows.filter((r) => r.priority === 'P0').length}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400">System SLA Status</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1 flex items-center gap-1.5">
                <Activity className="h-5 w-5" /> 99.98%
              </div>
            </div>
          </div>
        </div>

        {/* Interactive SQL-Backed Record Creation & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleInsertRecord}
            className="lg:col-span-4 rounded-3xl border border-white/15 bg-slate-900 p-6 space-y-4 h-fit"
          >
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#8B5CF6]" />
              <span>Create Record in SQL DB</span>
            </h2>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Workflow Item / Ticket Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Enterprise SAML Cutover"
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Priority Level
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                <option value="P0">P0 — Blocker / Critical</option>
                <option value="P1">P1 — High Priority</option>
                <option value="P2">P2 — Standard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Assignee Email
              </label>
              <input
                type="email"
                required
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#5345E9] py-2.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
            >
              Insert into Database
            </button>
          </form>

          <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">
                Live SQL Table: `records` ({rows.length} rows)
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Real-time persistence
              </span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rows.map((r, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {String(r.id)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {String(r.title)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#5345E9]/30 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                          {String(r.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-300">
                        {String(r.priority)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {String(r.owner)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
