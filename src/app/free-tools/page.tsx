'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { FREE_AI_TOOLS_CATALOG } from '@/lib/omniflow/catalog';
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Download,
} from 'lucide-react';

export default function FreeToolsPage() {
  const [selectedToolId, setSelectedToolId] = useState<string>(
    FREE_AI_TOOLS_CATALOG[0].id
  );
  const [inputPrompt, setInputPrompt] = useState(
    'An AI-powered Customer Onboarding & SLA Tracking Portal with automated health scores, Slack alerts, and role-based dashboards.'
  );
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<{
    title: string;
    outputMarkdown: string;
    highlights: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const activeTool =
    FREE_AI_TOOLS_CATALOG.find((t) => t.id === selectedToolId) ||
    FREE_AI_TOOLS_CATALOG[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/free-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: selectedToolId,
          input: inputPrompt,
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setOutput(data.result);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!output) return;
    const blob = new Blob([output.outputMarkdown], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedToolId}-output.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MarketingChrome>
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Wand2 className="h-3.5 w-3.5" /> Interactive AI Product Suite
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-5xl">
              6 Free AI Tools for Product Managers &amp; Engineers
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              Generate structured PRDs, multi-page UI prompts, INVEST user
              stories, PostgreSQL schemas, sprint estimates, and QA suites
              instantly.
            </p>
          </div>

          {/* Tool Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
            {FREE_AI_TOOLS_CATALOG.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setSelectedToolId(tool.id);
                  setOutput(null);
                }}
                className={`rounded-2xl border p-3.5 text-left transition ${
                  selectedToolId === tool.id
                    ? 'border-[#5345E9] bg-[#5345E9]/25 text-white shadow-lg'
                    : 'border-white/10 bg-[#111029] text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-amber-300">
                  {tool.badge}
                </div>
                <div className="text-xs font-bold mt-1 line-clamp-1">
                  {tool.name}
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Generator Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-3xl border border-white/15 bg-[#111029] p-6">
              <h2 className="text-lg font-bold text-white">
                {activeTool.name}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {activeTool.description}
              </p>

              <form onSubmit={handleGenerate} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Product Idea, Feature Scope, or Domain Context
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder={activeTool.placeholder}
                    className="w-full rounded-xl border border-white/15 bg-[#09081C] p-3.5 text-sm text-white placeholder-slate-500 focus:border-[#5345E9] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5345E9] to-[#7C3AED] py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {loading
                      ? 'Synthesizing Specification...'
                      : `Generate with ${activeTool.name}`}
                  </span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-[#0C0B22] p-6 flex flex-col justify-between min-h-[380px]">
              {!output ? (
                <div className="my-auto text-center py-12">
                  <Wand2 className="h-10 w-10 text-[#8B5CF6] mx-auto mb-3 opacity-80" />
                  <h3 className="text-base font-bold text-white">
                    Ready to Synthesize
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Click &ldquo;Generate&rdquo; on the left to run Joy AI and
                    produce a structured engineering artifact ready to copy,
                    download, or open in the full OmniFlow Workspace.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {output.title}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {output.highlights.map((h) => (
                            <span
                              key={h}
                              className="rounded bg-[#5345E9]/20 px-2 py-0.5 text-[10px] text-indigo-300"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              output.outputMarkdown
                            );
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white hover:bg-white/15"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />{' '}
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copy
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadMarkdown}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white hover:bg-white/15"
                        >
                          <Download className="h-3.5 w-3.5" /> .MD
                        </button>
                      </div>
                    </div>

                    <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-[#070617] p-4 font-mono text-xs text-slate-200 leading-relaxed border border-white/5">
                      {output.outputMarkdown}
                    </pre>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Want multi-page UI wireframes &amp; a live full-stack app
                      from this spec?
                    </span>
                    <Link
                      href={`/index?prompt=${encodeURIComponent(inputPrompt)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                    >
                      <span>Open in Full Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
