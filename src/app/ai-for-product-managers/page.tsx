'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import {
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Palette,
  CalendarRange,
} from 'lucide-react';

export default function AiForProductManagersPage() {
  return (
    <MarketingChrome>
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5345E9]/20 border border-[#5345E9]/40 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> Built for Modern Product
              Leaders
            </span>
            <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              The AI Copilot for Spec-Driven Product Managers
            </h1>
            <p className="mt-4 text-base text-slate-300">
              Transform customer discovery notes and domain knowledge bases into
              Living PRDs, interactive multi-page UI prototypes, and story-point
              estimated engineering backlogs in minutes.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/index"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5345E9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4335D6]"
              >
                <span>Create Your First Living PRD</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/free-tools"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <span>Try Free AI PM Generators</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: FileText,
                title: '1. Living PRDs with Version Diffs (V1 → Vn)',
                desc: 'Generate comprehensive PRDs with executive summaries, target personas, P0/P1 user stories, acceptance criteria, and non-functional SLAs. Revert or compare any version.',
              },
              {
                icon: BookOpen,
                title: '2. Grounded RAG Knowledge Base Citations',
                desc: 'Upload customer interviews, RFCs, and security policies. Joy AI grounds every requirement and user story in your uploaded context.',
              },
              {
                icon: Palette,
                title: '3. Instant Multi-Page Wireframes for Stakeholders',
                desc: 'Stop waiting weeks for initial mockups. Click "Make Design" in your PRD to synthesize 4 interactive screens across 5 design systems.',
              },
              {
                icon: CalendarRange,
                title: '4. Automated Epics, Stories & Sprint Backlogs',
                desc: 'Turn approved specs into role-based Epics, INVEST user stories, story points, and two-week sprint plans synced with Jira, Linear, or GitHub.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/15 bg-[#111029] p-6"
                >
                  <Icon className="h-7 w-7 text-[#8B5CF6] mb-3" />
                  <h2 className="text-lg font-bold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Included in OmniFlow
                    Workspace
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
