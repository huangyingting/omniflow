'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import {
  FileText,
  MessageSquare,
  Settings,
  Upload,
  Send,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export default function KnowledgeBaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const kbId = params.id;

  const [kb, setKb] = useState<{
    id: string;
    name: string;
    description: string;
    files: Array<{
      id: string;
      fileName: string;
      fileSize: number;
      status: string;
      chunkCount: number;
      content: string;
      createdAt: string;
    }>;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; role: string; content: string }>
  >([]);
  const [activeTab, setActiveTab] = useState<'files' | 'chat' | 'settings'>(
    'files'
  );

  // Upload state
  const [fileName, setFileName] = useState('security-and-sla-architecture.md');
  const [fileContent, setFileContent] = useState(
    '# Security & SLA Architecture\n- All API endpoints enforce RBAC roles (ADMIN, MEMBER, VIEWER).\n- p95 response latency must remain under 180ms.\n- Customer data must be encrypted at rest with AES-256 and logged in AuditLog.'
  );
  const [uploading, setUploading] = useState(false);

  // RAG Chat state
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);

  // Settings state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const loadKb = useCallback(async () => {
    const res = await fetch(`/api/knowledge-base/${kbId}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (res.ok && data.knowledgeBase) {
      setKb(data.knowledgeBase);
      setChatMessages(data.chatMessages || []);
      setEditName(data.knowledgeBase.name);
      setEditDesc(data.knowledgeBase.description);
    }
  }, [kbId]);

  useEffect(() => {
    loadKb();
  }, [loadKb]);

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileContent.trim() || uploading) return;
    setUploading(true);
    try {
      const res = await fetch(`/api/knowledge-base/${kbId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload-file',
          fileName,
          content: fileContent,
        }),
      });
      if (res.ok) {
        setSavedBanner(`Indexed "${fileName}" into vector chunks.`);
        await loadKb();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAskRag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || asking) return;
    setAsking(true);
    try {
      await fetch(`/api/knowledge-base/${kbId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          question,
        }),
      });
      setQuestion('');
      await loadKb();
    } finally {
      setAsking(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/knowledge-base/${kbId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update-settings',
        name: editName,
        description: editDesc,
      }),
    });
    if (res.ok) {
      setSavedBanner('Updated Knowledge Base settings.');
      await loadKb();
    }
  };

  const handleDeleteKb = async () => {
    const res = await fetch(`/api/knowledge-base/${kbId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      router.push('/knowledge-base');
    }
  };

  return (
    <AppShell
      title={kb?.name || 'Knowledge Base'}
      subtitle={kb?.description || 'RAG Document Index & Cited Q&A'}
    >
      {/* 3-Tab Switcher matching app.omniflowai.com/knowledge-base/:id */}
      <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3">
        {(
          [
            {
              id: 'files',
              label: `Files (${kb?.files.length || 0})`,
              icon: FileText,
            },
            {
              id: 'chat',
              label: 'Chat with Knowledge Base',
              icon: MessageSquare,
            },
            { id: 'settings', label: 'Settings', icon: Settings },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === t.id
                  ? 'bg-[#5345E9] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {savedBanner && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{savedBanner}</span>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleUploadFile}
            className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-3 h-fit"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Upload className="h-4 w-4 text-[#5345E9]" />
              <span>Ingest &amp; Chunk Document</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document File Name
              </label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Content (Markdown / Text / Spec)
              </label>
              <textarea
                rows={7}
                required
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-xl bg-[#5345E9] py-2.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
            >
              {uploading
                ? 'Chunking & Indexing...'
                : 'Upload & Index into Knowledge Base'}
            </button>
          </form>

          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Indexed Documents ({kb?.files.length || 0})
            </h3>
            {(kb?.files || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No documents indexed yet. Upload a specification on the left to
                enable cited RAG Q&amp;A.
              </p>
            ) : (
              <div className="space-y-2.5">
                {kb?.files.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {f.fileName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {f.chunkCount} semantic chunks • {f.fileSize} bytes •{' '}
                        {f.status}
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      INDEXED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="rounded-2xl border border-slate-200 bg-white flex flex-col h-[520px] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">
                Ask any question about the files in{' '}
                <strong>{kb?.name}</strong>. Joy AI will answer with grounded
                chunk citations.
              </div>
            ) : (
              chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#5345E9] text-white ml-auto'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))
            )}
          </div>
          <form
            onSubmit={handleAskRag}
            className="border-t border-slate-200 bg-slate-50 p-3.5 flex gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question grounded in your indexed files (e.g., What are the SLA and RBAC requirements?)..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs"
            />
            <button
              type="submit"
              disabled={asking}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Ask KB</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Knowledge Base Name
              </label>
              <input
                type="text"
                maxLength={50}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                maxLength={100}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white"
            >
              Save Changes
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Delete this Knowledge Base and all indexed chunks
            </span>
            <button
              type="button"
              onClick={handleDeleteKb}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Knowledge Base
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
