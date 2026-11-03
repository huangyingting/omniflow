'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { ArrowRight, BookOpen } from 'lucide-react';

const POSTS = [
  {
    slug: 'why-spec-driven-ai-beats-vibe-coding',
    category: 'Product Engineering',
    date: 'February 2025',
    title: 'Why Spec-Driven Development Beats Prompt-to-Code "Vibe Coding"',
    summary:
      'How maintaining a synchronized Living PRD eliminates architectural drift across UI prototypes, database schemas, and sprint execution.',
  },
  {
    slug: 'rag-knowledge-bases-for-zero-hallucination-prds',
    category: 'AI Architecture',
    date: 'January 2025',
    title: 'Grounding Product Requirements in Domain Knowledge Bases with RAG',
    summary:
      'Best practices for chunking architecture RFCs, compliance policies, and API schemas so AI-generated PRDs cite real organizational constraints.',
  },
  {
    slug: 'invite-only-rbac-and-immutable-audit-logs',
    category: 'Enterprise Security',
    date: 'January 2025',
    title:
      'Designing Cryptographic Invite-Only Admission & Immutable Audit Trails',
    summary:
      'Why production AI workspaces require SHA-256 single-use invitation tokens, strict ADMIN/MEMBER/VIEWER RBAC, and tamper-evident audit logs.',
  },
];

export default function BlogPage() {
  return (
    <MarketingChrome>
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5345E9]/20 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <BookOpen className="h-3.5 w-3.5" /> OmniFlow Engineering &amp;
              Product Blog
            </span>
            <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              Insights on Spec-Driven AI Software Engineering
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POSTS.map((post) => (
              <div
                key={post.slug}
                className="rounded-3xl border border-white/15 bg-[#111029] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
                    <span>{post.category}</span>
                    <span className="text-slate-400">{post.date}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-white">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
                <Link
                  href="/documentation"
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] hover:text-white"
                >
                  <span>Read Deep Dive in Docs</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
