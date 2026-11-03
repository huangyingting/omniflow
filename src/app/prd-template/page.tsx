'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { OFFICIAL_DOCUMENT_TEMPLATES } from '@/lib/omniflow/catalog';
import { FileText, ArrowRight, Copy, Check } from 'lucide-react';

export default function PrdTemplatePage() {
  const [selectedSlug, setSelectedSlug] = useState(
    OFFICIAL_DOCUMENT_TEMPLATES[0].slug
  );
  const [copied, setCopied] = useState(false);

  const selected =
    OFFICIAL_DOCUMENT_TEMPLATES.find((t) => t.slug === selectedSlug) ||
    OFFICIAL_DOCUMENT_TEMPLATES[0];

  return (
    <MarketingChrome>
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5345E9]/20 border border-[#5345E9]/40 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <FileText className="h-3.5 w-3.5" /> Official Specification
              Blueprints
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-5xl">
              Production-Tested PRD &amp; Engineering Templates
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              Inspect, copy, or launch any official OmniFlow specification
              template directly into the Spec-Driven Builder.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-2.5">
              {OFFICIAL_DOCUMENT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.slug}
                  type="button"
                  onClick={() => setSelectedSlug(tpl.slug)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedSlug === tpl.slug
                      ? 'border-[#5345E9] bg-[#5345E9]/20 text-white'
                      : 'border-white/10 bg-[#111029] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
                    <span>{tpl.category}</span>
                    <span>{tpl.type}</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {tpl.name}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {tpl.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-[#111029] p-6 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-indigo-400">
                      {selected.category} • {selected.type}
                    </span>
                    <h2 className="text-xl font-bold text-white">
                      {selected.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selected.content);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />{' '}
                          Copied Markdown
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy Markdown
                        </>
                      )}
                    </button>
                    <Link
                      href={`/index?prompt=${encodeURIComponent(
                        selected.promptText
                      )}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                    >
                      <span>Use Template in Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#08071A] p-5 border border-white/10 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selected.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
