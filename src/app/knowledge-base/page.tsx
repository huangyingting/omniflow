'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { BookOpen, Plus, FileText, X, ArrowRight } from 'lucide-react';

export default function KnowledgeBaseListPage() {
  const router = useRouter();
  const [knowledgeBases, setKnowledgeBases] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      createdAt: string;
      files: Array<{ id: string; chunkCount: number }>;
    }>
  >([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch('/api/knowledge-base')
      .then((r) => r.json())
      .then((d) => {
        if (d.knowledgeBases) setKnowledgeBases(d.knowledgeBases);
      });
  }, []);

  const handleCreateKb = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/knowledge-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (res.ok && data.knowledgeBase) {
      setShowCreateModal(false);
      router.push(`/knowledge-base/${data.knowledgeBase.id}`);
    }
  };

  return (
    <AppShell
      title="Knowledge Base (RAG Context Engine)"
      subtitle="Upload domain specs, API schemas, and compliance docs to ground PRDs and RAG Q&A"
      actions={
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
        >
          <Plus className="h-3.5 w-3.5" /> Create Knowledge Base
        </button>
      }
    >
      {knowledgeBases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <BookOpen className="h-10 w-10 text-[#5345E9] mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            No Knowledge Bases yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Create a Knowledge Base to index your engineering RFCs, compliance
            policies, and customer research for cited RAG Q&amp;A and PRD
            synthesis.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Create First Knowledge Base
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {knowledgeBases.map((kb) => {
            const totalChunks = kb.files.reduce(
              (acc, f) => acc + (f.chunkCount || 0),
              0
            );
            return (
              <Link
                key={kb.id}
                href={`/knowledge-base/${kb.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#5345E9]/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#5345E9] font-semibold mb-2">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" /> Active Index
                    </span>
                    <span className="text-slate-400">
                      {kb.files.length} files • {totalChunks} chunks
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {kb.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {kb.description || 'Domain knowledge base for RAG synthesis'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <FileText className="h-3.5 w-3.5" /> Ready for @KB grounding
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#5345E9]">
                    <span>Open KB</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Create Knowledge Base
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateKb} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Name (max 50 characters)
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enterprise Architecture & Security Playbook"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (max 100 characters)
                </label>
                <textarea
                  rows={2}
                  maxLength={100}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="API contracts, RBAC policies, and SLA standards"
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
                  Create Knowledge Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
