'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  X,
  Palette,
  Code2,
  CalendarRange,
} from 'lucide-react';

export default function DocsListPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      status: string;
      currentVersion: number;
      updatedAt: string;
      project: { id: string; name: string; shortName: string } | null;
    }>
  >([]);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('PRD');
  const [newDocPrompt, setNewDocPrompt] = useState('');

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newDocName,
        type: newDocType,
        prompt: newDocPrompt,
      }),
    });
    const data = await res.json();
    if (res.ok && data.document) {
      setShowCreateModal(false);
      router.push(
        data.document.type === 'DEVELOPMENT_PLAN'
          ? `/devplan/${data.document.id}`
          : `/docs/${data.document.id}`
      );
    }
  };

  const handleDeleteDoc = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const types = [
    'ALL',
    'PRD',
    'UI_DESIGN',
    'PRODUCT',
    'DEVELOPMENT_PLAN',
    'TECH_DESIGN',
    'QA_PLAN',
    'RELEASE_PLAN',
  ];

  const filtered = documents.filter((d) => {
    const matchesType = filterType === 'ALL' || d.type === filterType;
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.project?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <AppShell
      title="All Specifications & Artifacts"
      subtitle="PRDs, Multi-Page UI/UX Designs, Tech Designs, QA Plans, Release Plans, and Products"
      actions={
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
        >
          <Plus className="h-3.5 w-3.5" /> New Standalone Document
        </button>
      }
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filterType === t
                  ? 'bg-[#5345E9] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter documents..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-[#5345E9] focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading documents...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <FileText className="h-10 w-10 text-[#5345E9] mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            No matching documents
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Create a standalone document or generate a full 7-artifact project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const href =
              doc.type === 'DEVELOPMENT_PLAN'
                ? `/devplan/${doc.id}`
                : `/docs/${doc.id}`;
            return (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#5345E9]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#5345E9]">
                      {doc.type === 'UI_DESIGN' ? (
                        <Palette className="h-3 w-3" />
                      ) : doc.type === 'PRODUCT' ? (
                        <Code2 className="h-3 w-3" />
                      ) : doc.type === 'DEVELOPMENT_PLAN' ? (
                        <CalendarRange className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {doc.type} • V{doc.currentVersion}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Link
                    href={href}
                    className="text-sm font-bold text-slate-900 hover:text-[#5345E9]"
                  >
                    {doc.name}
                  </Link>
                  <div className="text-xs text-slate-500 mt-1">
                    Project: {doc.project?.name || 'Standalone'}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={href}
                    className="font-semibold text-[#5345E9] hover:underline"
                  >
                    Open Editor →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Create New Specification Artifact
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDoc} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="PRD — Enterprise Billing Service"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Artifact Type
                </label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="PRD">PRD (Living Product Requirement)</option>
                  <option value="UI_DESIGN">
                    UI_DESIGN (Multi-Page Wireframes)
                  </option>
                  <option value="PRODUCT">PRODUCT (Full-Stack App)</option>
                  <option value="TECH_DESIGN">
                    TECH_DESIGN (Technical Architecture)
                  </option>
                  <option value="QA_PLAN">QA_PLAN (Test Matrix)</option>
                  <option value="RELEASE_PLAN">
                    RELEASE_PLAN (Runbook &amp; Rollback)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specification Prompt
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDocPrompt}
                  onChange={(e) => setNewDocPrompt(e.target.value)}
                  placeholder="Describe the core requirements, personas, and architecture..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white"
                >
                  Create &amp; Synthesize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
