'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { DOCUMENTATION_ARTICLES } from '@/lib/omniflow/catalog';
import { BookOpen, Search, ArrowRight, Terminal } from 'lucide-react';

export default function DocumentationPage() {
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(DOCUMENTATION_ARTICLES[0].id);

  const filtered = DOCUMENTATION_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
  );

  const currentArticle =
    filtered.find((a) => a.id === activeId) ||
    filtered[0] ||
    DOCUMENTATION_ARTICLES[0];

  return (
    <MarketingChrome>
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <BookOpen className="h-4 w-4" />
                <span>docs.omniflowai.com • Official Platform Guide</span>
              </div>
              <h1 className="mt-1 text-3xl font-extrabold text-white">
                OmniFlow AI Platform Documentation
              </h1>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guides, SQL, RBAC, sync..."
                className="w-full rounded-xl border border-white/15 bg-[#111029] pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-[#5345E9] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Article List */}
            <div className="lg:col-span-4 space-y-2">
              {filtered.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => setActiveId(article.id)}
                  className={`w-full rounded-2xl border p-3.5 text-left transition ${
                    currentArticle.id === article.id
                      ? 'border-[#5345E9] bg-[#5345E9]/20 text-white'
                      : 'border-white/10 bg-[#111029] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    {article.category}
                  </div>
                  <div className="text-sm font-bold mt-0.5">
                    {article.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {article.summary}
                  </div>
                </button>
              ))}
            </div>

            {/* Article Reader */}
            <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-[#111029] p-6 sm:p-8 space-y-6">
              <div>
                <span className="rounded-lg bg-[#5345E9]/20 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                  {currentArticle.category}
                </span>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  {currentArticle.title}
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  {currentArticle.summary}
                </p>
              </div>

              <div className="rounded-2xl bg-[#08071A] p-6 border border-white/10 whitespace-pre-wrap text-sm text-slate-200 leading-relaxed">
                {currentArticle.content}
              </div>

              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-indigo-300 shrink-0" />
                  <div className="text-xs text-slate-200">
                    Ready to try this workflow live in your workspace?
                  </div>
                </div>
                <Link
                  href="/index"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4335D6] shrink-0"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
