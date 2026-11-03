'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import type { UIDesignMeta, ProductMeta } from '@/lib/omniflow/ai-engine';
import {
  Sparkles,
  Send,
  RefreshCw,
  History,
  Download,
  FileText,
  Palette,
  Code2,
  CalendarRange,
  Monitor,
  Tablet,
  Smartphone,
  Database,
  Globe,
  GitBranch,
  Plug,
  Play,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Save,
  RotateCcw,
} from 'lucide-react';

interface SiblingDoc {
  id: string;
  name: string;
  type: string;
  status: string;
  currentVersion: number;
}

interface DocVersion {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
}

interface SyncEventItem {
  id: string;
  sourceType: string;
  sourceVersion: number;
  summary: string;
}

interface ChatMsg {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function DocumentStudioPage() {
  const params = useParams<{ docId: string }>();
  const router = useRouter();
  const docId = params.docId;

  const [doc, setDoc] = useState<{
    id: string;
    name: string;
    description: string;
    content: string;
    type: string;
    status: string;
    currentVersion: number;
    projectId: string | null;
    parsedMeta: Record<string, unknown>;
    versions: DocVersion[];
    pendingSyncEvents: SyncEventItem[];
  } | null>(null);
  const [siblingDocs, setSiblingDocs] = useState<SiblingDoc[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor & AI state
  const [markdownContent, setMarkdownContent] = useState('');
  const [markdownViewMode, setMarkdownViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [chatPrompt, setChatPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // UI_DESIGN state
  const [activeUiScreenIdx, setActiveUiScreenIdx] = useState(0);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // PRODUCT studio state
  const [productTab, setProductTab] = useState<
    'preview' | 'code' | 'database' | 'connectors' | 'domains' | 'deploy'
  >('preview');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [codeBuffer, setCodeBuffer] = useState<string>('');
  const [dbEnv, setDbEnv] = useState<'PREVIEW' | 'PRODUCTION'>('PREVIEW');
  const [sqlInput, setSqlInput] = useState('SELECT * FROM records;');
  const [sqlResultMsg, setSqlResultMsg] = useState<string | null>(null);
  const [sqlRows, setSqlRows] = useState<Array<Record<string, unknown>>>([]);
  const [newDomainInput, setNewDomainInput] = useState('');

  const loadDocument = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.document) return;
      setDoc(data.document);
      setMarkdownContent(data.document.content || '');
      setSiblingDocs(data.siblingDocuments || []);
      setChatMessages(data.chatSession?.messages || []);

      const meta = data.document.parsedMeta as unknown as ProductMeta;
      if (meta?.files?.length && !selectedFilePath) {
        setSelectedFilePath(meta.files[0].path);
        setCodeBuffer(meta.files[0].content);
      }
      if (meta?.previewDb?.tables?.[0]?.rows) {
        setSqlRows(meta.previewDb.tables[0].rows);
      }
    } finally {
      setLoading(false);
    }
  }, [docId, selectedFilePath]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleSaveManual = async () => {
    if (!doc) return;
    setSaving(true);
    setStatusBanner(null);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdownContent,
          createVersionSnapshot: true,
          versionLabel: `V${doc.currentVersion + 1} - Manual Edit`,
        }),
      });
      if (res.ok) {
        setStatusBanner(
          `Saved V${doc.currentVersion + 1} and notified downstream artifacts.`
        );
        await loadDocument();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async (
    overridePrompt?: string,
    styleId?: UIDesignMeta['styleId']
  ) => {
    if (!doc || generating) return;
    const promptToSend =
      typeof overridePrompt === 'string' ? overridePrompt : chatPrompt;
    setGenerating(true);
    setStatusBanner(null);
    try {
      const res = await fetch(`/api/documents/${doc.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          styleId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatPrompt('');
        setStatusBanner(
          `Synthesized V${data.document.currentVersion} with Joy AI.`
        );
        await loadDocument();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSyncArtifact = async () => {
    if (!doc) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply-sync' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusBanner(data.message);
        await loadDocument();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleRevertVersion = async (versionNumber: number) => {
    if (!doc) return;
    const res = await fetch(`/api/documents/${doc.id}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'confirm-revert',
        versionNumber,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatusBanner(data.message);
      await loadDocument();
    }
  };

  const handleTransitionStage = async (targetType: string) => {
    const targetDoc = siblingDocs.find((s) => s.type === targetType);
    if (!targetDoc) return;
    if (targetType === 'DEVELOPMENT_PLAN') {
      router.push(`/devplan/${targetDoc.id}`);
      return;
    }
    // Ensure target stage is PUBLISHED before navigating
    if (targetDoc.status === 'DRAFT') {
      await fetch(`/api/documents/${targetDoc.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Synthesize ${targetType} synchronized with PRD V${doc?.currentVersion || 1}`,
        }),
      });
    }
    router.push(`/docs/${targetDoc.id}`);
  };

  const handleRunSql = async (
    action: 'execute-sql' | 'snapshot' | 'reset' = 'execute-sql'
  ) => {
    if (!doc) return;
    const res = await fetch(`/api/documents/${doc.id}/database`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        environment: dbEnv,
        action,
        query: sqlInput,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSqlResultMsg(data.message);
      if (data.rows) setSqlRows(data.rows);
      else if (data.db?.tables?.[0]?.rows) {
        setSqlRows(data.db.tables[0].rows);
      }
      await loadDocument();
    }
  };

  const handleDeployAction = async (payload: Record<string, unknown>) => {
    if (!doc) return;
    const res = await fetch(`/api/documents/${doc.id}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setStatusBanner(`Executed ${payload.action || 'deployment'} action.`);
      await loadDocument();
    }
  };

  const handleExportDoc = (format: 'md' | 'html') => {
    if (!doc) return;
    const content =
      format === 'md'
        ? markdownContent
        : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${doc.name}</title><style>body{font-family:sans-serif;max-width:820px;margin:40px auto;line-height:1.6;color:#1e293b}pre{background:#f1f5f9;padding:12px;border-radius:8px}</style></head><body><pre>${markdownContent}</pre></body></html>`;
    const blob = new Blob([content], {
      type: format === 'md' ? 'text/markdown' : 'text/html',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !doc) {
    return (
      <AppShell title="Loading Studio..." fullBleed>
        <div className="p-10 text-center text-sm text-slate-500">
          Loading OmniFlow Studio...
        </div>
      </AppShell>
    );
  }

  const uiMeta = doc.parsedMeta as unknown as UIDesignMeta;
  const prodMeta = doc.parsedMeta as unknown as ProductMeta;

  return (
    <AppShell
      title={doc.name}
      subtitle={`Version V${doc.currentVersion} • ${doc.type}`}
      fullBleed
      actions={
        <div className="flex items-center gap-2">
          {doc.projectId && (
            <Link
              href={`/projects/${doc.projectId}/planning/builder`}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              7-Stage Pipeline
            </Link>
          )}
          {doc.type === 'PRD' && (
            <button
              type="button"
              onClick={() => handleTransitionStage('UI_DESIGN')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#4335D6]"
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Make Design →</span>
            </button>
          )}
          {doc.type === 'UI_DESIGN' && (
            <button
              type="button"
              onClick={() => handleTransitionStage('PRODUCT')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Make Product →</span>
            </button>
          )}
          {doc.type === 'PRODUCT' && (
            <>
              <Link
                href={`/preview/${doc.id}`}
                className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <span>Live App</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => handleTransitionStage('DEVELOPMENT_PLAN')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
              >
                <CalendarRange className="h-3.5 w-3.5" />
                <span>Make DevPlan →</span>
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Top Stage Switcher + Version History Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto">
            {siblingDocs.map((sib) => {
              const active = sib.id === doc.id;
              const href =
                sib.type === 'DEVELOPMENT_PLAN'
                  ? `/devplan/${sib.id}`
                  : `/docs/${sib.id}`;
              return (
                <Link
                  key={sib.id}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-[#5345E9] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{sib.type.replace('_', ' ')}</span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    V{sib.currentVersion}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Version Snapshot Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
              <History className="h-3.5 w-3.5 text-[#5345E9]" />
              <select
                value={doc.currentVersion}
                onChange={(e) => handleRevertVersion(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                aria-label="Version History"
              >
                {doc.versions.map((v) => (
                  <option key={v.id} value={v.versionNumber}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {doc.type !== 'UI_DESIGN' && doc.type !== 'PRODUCT' && (
              <>
                <button
                  type="button"
                  onClick={() => handleExportDoc('md')}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> .MD
                </button>
                <button
                  type="button"
                  onClick={() => handleExportDoc('html')}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> .HTML
                </button>
                <button
                  type="button"
                  onClick={handleSaveManual}
                  disabled={saving}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#5345E9] px-3 py-1 text-xs font-semibold text-white hover:bg-[#4335D6]"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Version'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upstream Sync Event Notification Banner */}
        {doc.pendingSyncEvents && doc.pendingSyncEvents.length > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />
              <span>
                <strong>Upstream Specification Updated:</strong>{' '}
                {doc.pendingSyncEvents[0].summary}. Synchronize this{' '}
                {doc.type} to incorporate the latest changes.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSyncArtifact}
              disabled={generating}
              className="rounded-xl bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Synchronize Now
            </button>
          </div>
        )}

        {statusBanner && (
          <div className="flex items-center justify-between bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 text-xs text-emerald-800 shrink-0">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {statusBanner}
            </span>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Split-Screen Studio: Left Joy AI Chat | Right Artifact Canvas */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Pane: Joy AI Conversational Copilot */}
          <div className="w-80 lg:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#5345E9]/10 flex items-center justify-center text-[#5345E9]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Joy AI Copilot
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Synchronized {doc.type} Assistant
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAiGenerate('')}
                disabled={generating}
                className="inline-flex items-center gap-1 rounded-lg bg-[#5345E9]/10 px-2.5 py-1 text-[11px] font-semibold text-[#5345E9] hover:bg-[#5345E9]/20"
              >
                <RefreshCw
                  className={`h-3 w-3 ${generating ? 'animate-spin' : ''}`}
                />
                <span>Regenerate</span>
              </button>
            </div>

            {/* UI Design Style Selector inside Joy Copilot when on UI_DESIGN */}
            {doc.type === 'UI_DESIGN' && (
              <div className="p-3 border-b border-slate-100 bg-slate-50/60">
                <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
                  Design System Theme (5 Styles):
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'modern-minimal', label: 'Modern Minimal' },
                      { id: 'cyberpunk-dark', label: 'Cyberpunk Dark' },
                      { id: 'glassmorphic-saas', label: 'Glassmorphic' },
                      { id: 'warm-editorial', label: 'Warm Editorial' },
                      { id: 'enterprise-slate', label: 'Enterprise Slate' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        handleAiGenerate(
                          `Apply ${st.label} design system`,
                          st.id
                        )
                      }
                      className={`rounded-lg border px-2 py-1 text-[11px] font-medium text-left transition ${
                        uiMeta?.styleId === st.id
                          ? 'border-[#5345E9] bg-[#5345E9] text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#5345E9]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#5345E9] text-white ml-6'
                      : 'bg-slate-100 text-slate-800 mr-4'
                  }`}
                >
                  <div className="font-semibold text-[10px] opacity-75 mb-1 uppercase">
                    {msg.role === 'user' ? 'You' : 'Joy AI'}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>

            {/* Prompt Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiGenerate();
              }}
              className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2"
            >
              <div className="flex flex-wrap gap-1">
                {[
                  'Add enterprise RBAC & SSO requirements',
                  'Expand edge cases & SLA metrics',
                  'Add Stripe webhook & audit schema',
                ].map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => handleAiGenerate(pill)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:border-[#5345E9] hover:text-[#5345E9]"
                  >
                    + {pill}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder={`Ask Joy AI to refine ${doc.type}...`}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#5345E9] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={generating}
                  className="rounded-xl bg-[#5345E9] p-2 text-white hover:bg-[#4335D6] disabled:opacity-50"
                  aria-label="Send to Joy AI"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Pane: Mode-Specific Interactive Canvas */}
          <div className="flex-1 overflow-y-auto bg-[#F7F7FC]">
            {/* MODE A: UI_DESIGN MULTI-PAGE PROTOTYPE CANVAS */}
            {doc.type === 'UI_DESIGN' && uiMeta?.pages ? (
              <div className="p-6 space-y-5">
                {/* Screen Tabs & Viewport Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {uiMeta.pages.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActiveUiScreenIdx(idx)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          activeUiScreenIdx === idx
                            ? 'bg-[#5345E9] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}. {p.title}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                    {(
                      [
                        { id: 'desktop', icon: Monitor, label: 'Desktop' },
                        { id: 'tablet', icon: Tablet, label: 'Tablet' },
                        { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                      ] as const
                    ).map((vp) => {
                      const Icon = vp.icon;
                      return (
                        <button
                          key={vp.id}
                          type="button"
                          onClick={() => setViewport(vp.id)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${
                            viewport === vp.id
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{vp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Wireframe Preview Frame */}
                {(() => {
                  const screen =
                    uiMeta.pages[activeUiScreenIdx] || uiMeta.pages[0];
                  const widthClass =
                    viewport === 'mobile'
                      ? 'max-w-sm mx-auto'
                      : viewport === 'tablet'
                      ? 'max-w-2xl mx-auto'
                      : 'w-full';
                  return (
                    <div
                      className={`${widthClass} rounded-3xl border shadow-xl overflow-hidden transition-all`}
                      style={{
                        backgroundColor: uiMeta.palette.background,
                        color: uiMeta.palette.text,
                        borderColor: uiMeta.palette.primary + '40',
                      }}
                    >
                      {/* Simulated Browser Top Bar */}
                      <div
                        className="flex items-center justify-between px-5 py-3 border-b"
                        style={{
                          backgroundColor: uiMeta.palette.surface,
                          borderColor: uiMeta.palette.primary + '25',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                          <span className="ml-2 text-xs font-mono opacity-75">
                            {screen.route} • {uiMeta.styleName}
                          </span>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: uiMeta.palette.primary }}
                        >
                          Interactive Prototype
                        </span>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold">{screen.title}</h3>
                            <p className="text-xs opacity-75 mt-0.5">
                              {screen.summary}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {screen.primaryActions.map((act) => (
                              <span
                                key={act}
                                className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white"
                                style={{
                                  backgroundColor: uiMeta.palette.primary,
                                }}
                              >
                                {act}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Metric Strip */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {screen.metrics.map((m) => (
                            <div
                              key={m.label}
                              className="rounded-2xl p-4 border"
                              style={{
                                backgroundColor: uiMeta.palette.surface,
                                borderColor: uiMeta.palette.primary + '25',
                              }}
                            >
                              <div className="text-xs opacity-70">
                                {m.label}
                              </div>
                              <div className="text-2xl font-extrabold mt-1">
                                {m.value}
                              </div>
                              <div
                                className="text-xs font-semibold mt-1"
                                style={{ color: uiMeta.palette.accent }}
                              >
                                {m.delta}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Component Specs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {screen.components.map((comp) => (
                            <div
                              key={comp}
                              className="rounded-2xl p-4 border"
                              style={{
                                backgroundColor: uiMeta.palette.surface,
                                borderColor: uiMeta.palette.primary + '25',
                              }}
                            >
                              <div className="text-xs font-bold mb-2">
                                {comp}
                              </div>
                              <div className="space-y-1.5">
                                <div className="h-2.5 w-3/4 rounded bg-current opacity-15" />
                                <div className="h-2.5 w-1/2 rounded bg-current opacity-10" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : doc.type === 'PRODUCT' && prodMeta?.files ? (
              /* MODE B: FULL-STACK PRODUCT STUDIO (Preview, Code, SQL DB, Connectors, Domains, Deploy) */
              <div className="p-6 space-y-5">
                {/* 6-Tab Product Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2.5">
                  <div className="flex flex-wrap gap-1">
                    {(
                      [
                        { id: 'preview', label: 'Live App Preview', icon: Play },
                        {
                          id: 'code',
                          label: `Code Editor (${prodMeta.files.length})`,
                          icon: Code2,
                        },
                        {
                          id: 'database',
                          label: 'SQL Database (Preview & Prod)',
                          icon: Database,
                        },
                        {
                          id: 'connectors',
                          label: 'Connectors',
                          icon: Plug,
                        },
                        {
                          id: 'domains',
                          label: 'Custom Domains',
                          icon: Globe,
                        },
                        {
                          id: 'deploy',
                          label: 'Git Sync & Deployments',
                          icon: GitBranch,
                        },
                      ] as const
                    ).map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setProductTab(t.id)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                            productTab === t.id
                              ? 'bg-[#5345E9] text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDeployAction({
                        action: 'deploy',
                        environment: 'PRODUCTION',
                      })
                    }
                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Publish to Production
                  </button>
                </div>

                {/* Tab 1: Live Application Preview */}
                {productTab === 'preview' && (
                  <div className="rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                    <div className="bg-slate-900 text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-[10px] font-mono text-indigo-200">
                          LIVE FULL-STACK RUNTIME
                        </span>
                        <h3 className="text-xl font-bold mt-1">
                          {prodMeta.appTitle}
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {prodMeta.heroSubtitle}
                        </p>
                      </div>
                      <Link
                        href={`/preview/${doc.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                      >
                        <span>Open Fullscreen App</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">
                          Live Records from Preview SQL Database ({sqlRows.length}{' '}
                          rows)
                        </h4>
                        <button
                          type="button"
                          onClick={() => setProductTab('database')}
                          className="text-xs font-semibold text-[#5345E9] hover:underline"
                        >
                          Open SQL Console →
                        </button>
                      </div>
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                            <tr>
                              <th className="px-4 py-2.5">ID</th>
                              <th className="px-4 py-2.5">Title</th>
                              <th className="px-4 py-2.5">Status</th>
                              <th className="px-4 py-2.5">Priority</th>
                              <th className="px-4 py-2.5">Owner</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sqlRows.map((r, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 font-mono text-slate-500">
                                  {String(r.id || `rec-${i}`)}
                                </td>
                                <td className="px-4 py-2.5 font-semibold text-slate-900">
                                  {String(r.title || '')}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-[#5345E9]">
                                    {String(r.status || 'ACTIVE')}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 font-semibold">
                                  {String(r.priority || 'P1')}
                                </td>
                                <td className="px-4 py-2.5 text-slate-500">
                                  {String(r.owner || '')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Multi-File Code Editor */}
                {productTab === 'code' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-3 space-y-1">
                      <div className="text-[11px] font-bold uppercase text-slate-400 px-2 mb-2">
                        Generated Source Tree
                      </div>
                      {prodMeta.files.map((f) => (
                        <button
                          key={f.path}
                          type="button"
                          onClick={() => {
                            setSelectedFilePath(f.path);
                            setCodeBuffer(f.content);
                          }}
                          className={`w-full rounded-xl px-3 py-2 text-left text-xs font-mono transition ${
                            selectedFilePath === f.path
                              ? 'bg-[#5345E9] text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {f.path}
                        </button>
                      ))}
                    </div>
                    <div className="lg:col-span-9 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-xs font-mono">
                        <span>{selectedFilePath}</span>
                        <span className="text-emerald-400">
                          TypeScript / SQL Verified
                        </span>
                      </div>
                      <textarea
                        rows={18}
                        value={codeBuffer}
                        onChange={(e) => setCodeBuffer(e.target.value)}
                        className="w-full bg-transparent font-mono text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 3: Preview & Production SQL Database Console */}
                {productTab === 'database' && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {(
                          [
                            { id: 'PREVIEW', label: 'Preview Database' },
                            { id: 'PRODUCTION', label: 'Production Database' },
                          ] as const
                        ).map((env) => (
                          <button
                            key={env.id}
                            type="button"
                            onClick={() => setDbEnv(env.id)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold ${
                              dbEnv === env.id
                                ? 'bg-[#5345E9] text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {env.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRunSql('snapshot')}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Capture Snapshot
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRunSql('reset')}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reset DB
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={sqlInput}
                        onChange={(e) => setSqlInput(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-900 px-3.5 py-2 font-mono text-xs text-emerald-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRunSql('execute-sql')}
                        className="rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                      >
                        Execute SQL
                      </button>
                    </div>

                    {sqlResultMsg && (
                      <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-mono text-slate-700">
                        {sqlResultMsg}
                      </div>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">id</th>
                            <th className="px-3 py-2">title</th>
                            <th className="px-3 py-2">status</th>
                            <th className="px-3 py-2">priority</th>
                            <th className="px-3 py-2">owner</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {sqlRows.map((row, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">{String(row.id)}</td>
                              <td className="px-3 py-2">{String(row.title)}</td>
                              <td className="px-3 py-2">
                                {String(row.status)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.priority)}
                              </td>
                              <td className="px-3 py-2">{String(row.owner)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 4: Connectors */}
                {productTab === 'connectors' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prodMeta.connectors.map((conn) => (
                      <div
                        key={conn.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#5345E9]">
                            {conn.category}
                          </div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {conn.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Env Keys: {conn.envKeys.join(', ')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeployAction({
                              action: 'toggle-connector',
                              connectorId: conn.id,
                            })
                          }
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                            conn.status === 'CONNECTED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#5345E9] text-white'
                          }`}
                        >
                          {conn.status === 'CONNECTED'
                            ? 'Connected ✓'
                            : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 5: Custom Domains */}
                {productTab === 'domains' && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDomainInput}
                        onChange={(e) => setNewDomainInput(e.target.value)}
                        placeholder="app.yourdomain.com"
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newDomainInput.trim()) return;
                          handleDeployAction({
                            action: 'add-domain',
                            domain: newDomainInput,
                          });
                          setNewDomainInput('');
                        }}
                        className="rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white"
                      >
                        Add Custom Domain
                      </button>
                    </div>
                    <div className="space-y-2">
                      {prodMeta.domains.map((dom) => (
                        <div
                          key={dom.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">
                              {dom.domain}
                            </span>
                            <span className="ml-2 text-slate-400">
                              CNAME → {dom.cnameTarget}
                            </span>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {dom.status} • SSL {dom.sslStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 6: Git Sync & Deployments */}
                {productTab === 'deploy' && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          GitHub / Bitbucket Repository Sync
                        </div>
                        <div className="text-xs text-slate-500">
                          {prodMeta.gitConfig.repoUrl} (branch:{' '}
                          {prodMeta.gitConfig.branch} • commit:{' '}
                          {prodMeta.gitConfig.lastCommitHash})
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeployAction({ action: 'sync-git' })
                        }
                        className="rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white"
                      >
                        Push Latest Commit
                      </button>
                    </div>
                    <div className="space-y-2">
                      {prodMeta.deployments.map((dep) => (
                        <div
                          key={dep.id}
                          className="rounded-xl border border-slate-200 p-3 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              {dep.environment} • {dep.version}
                            </span>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              {dep.status}
                            </span>
                          </div>
                          <pre className="rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto">
                            {dep.logs.join('\n')}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* MODE C: LIVING PRD & MARKDOWN SPECIFICATION STUDIO */
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <FileText className="h-4 w-4 text-[#5345E9]" />
                    <span>Living Specification Editor &amp; Preview</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                    {(
                      [
                        { id: 'split', label: 'Split View' },
                        { id: 'edit', label: 'Markdown Source' },
                        { id: 'preview', label: 'Rendered Spec' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMarkdownViewMode(m.id)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          markdownViewMode === m.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`grid gap-4 ${
                    markdownViewMode === 'split'
                      ? 'grid-cols-1 lg:grid-cols-2'
                      : 'grid-cols-1'
                  }`}
                >
                  {(markdownViewMode === 'split' ||
                    markdownViewMode === 'edit') && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">
                        Markdown Source
                      </div>
                      <textarea
                        rows={24}
                        value={markdownContent}
                        onChange={(e) => setMarkdownContent(e.target.value)}
                        className="w-full font-mono text-xs text-slate-800 leading-relaxed focus:outline-none"
                      />
                    </div>
                  )}

                  {(markdownViewMode === 'split' ||
                    markdownViewMode === 'preview') && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                      <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">
                        Rendered Living Specification
                      </div>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-xs sm:text-sm text-slate-800 leading-relaxed">
                        {markdownContent}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
