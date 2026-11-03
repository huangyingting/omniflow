'use client';

import React, { useState } from 'react';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How is OmniFlow AI different from prompt-to-code "vibe coding" tools?',
    a: 'Traditional prompt-to-code tools jump straight from a vague 1-sentence prompt to fragile UI code without a specification. OmniFlow is Spec-Driven: it first synthesizes a structured Living PRD grounded in your Knowledge Base, then generates multi-page UI/UX wireframes, compiles a full-stack application with isolated Preview/Production SQL databases, and creates an engineering DevPlan with Epics, Stories, and Sprints. Every change in your PRD synchronizes downstream.',
  },
  {
    q: 'How does Bidirectional Synchronization work across PRD, UI Design, and Full-Stack App?',
    a: 'Whenever you update a Living PRD (e.g., V1 → V2) or UI Design, OmniFlow creates a DocumentSyncEvent for downstream artifacts in the same project. Opening the UI/UX Design, Tech Design, or Product workspace displays a Sync Banner allowing you to apply upstream changes in one click or revert to any historical version snapshot.',
  },
  {
    q: 'How does Invite-Only Account Admission work?',
    a: 'Public self-registration is disabled. Workspace administrators generate single-use cryptographic invitation links (/invite/[token]) backed by SHA-256 token hashing, role assignment (ADMIN, MEMBER, VIEWER), expiration timestamps, instant revocation, and immutable AuditLog records. The initial root administrator is provisioned exclusively via CLI (npm run admin:bootstrap).',
  },
  {
    q: 'Can I ground PRDs and AI responses in my own architecture docs?',
    a: 'Yes! Upload Markdown, text, or specification documents into the Knowledge Base (/knowledge-base). OmniFlow chunks and indexes your documents so you can run cited RAG Q&A or attach the Knowledge Base directly when generating a new project or PRD.',
  },
  {
    q: 'Does OmniFlow support both SQLite and PostgreSQL?',
    a: 'Yes. Local development runs out-of-the-box on SQLite via Prisma 7, and production deployments use PostgreSQL with full relational parity across all 19 models.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <MarketingChrome>
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5345E9]/20 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <HelpCircle className="h-3.5 w-3.5" /> Frequently Asked Questions
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-5xl">
              Everything About Spec-Driven AI Development
            </h1>
          </div>

          <div className="space-y-3">
            {FAQS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-white/10 bg-[#111029] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-bold text-white hover:bg-white/5"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
