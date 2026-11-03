'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { ArrowRight, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const CASE_STUDIES = [
  {
    company: 'FinLedger Cloud',
    industry: 'B2B FinTech & Treasury',
    headline:
      'Cut specification-to-deployment cycle time by 78% across 14 microservices',
    metrics: [
      { label: 'PRD & Spec Velocity', value: '6.5x Faster' },
      { label: 'Rework Reduction', value: '-64%' },
      { label: 'Sprint Predictability', value: '94% On-Time' },
    ],
    quote:
      'Before OmniFlow, our PMs wrote PRDs in Notion that drifted out of sync with Figma and Jira within 48 hours. Now our Living PRD drives UI wireframes, SQL schemas, and sprint tasks in one connected graph.',
    author: 'Elena Rostova, VP of Product Engineering',
    prompt:
      'Build an Enterprise Treasury & Spend Approval Portal with multi-currency ledger reconciliation, role-based approval policies, and audit trails.',
  },
  {
    company: 'MedTriage AI',
    industry: 'Healthcare Operations',
    headline:
      'Grounded RAG Knowledge Bases enabled zero-hallucination clinical workflow specs',
    metrics: [
      { label: 'Compliance Coverage', value: '100% Cited' },
      { label: 'Prototype Turnaround', value: '18 mins' },
      { label: 'Engineering Handoff', value: '1-Click Sync' },
    ],
    quote:
      'Attaching our HIPAA compliance playbooks to OmniFlow Knowledge Bases meant every generated PRD and QA test plan automatically included our mandatory security controls.',
    author: 'Dr. Marcus Vance, Chief Technology Officer',
    prompt:
      'Build a Clinical Patient Intake & SLA Triage Dashboard with automated priority scoring, HIPAA audit logs, and shift handoff workflows.',
  },
  {
    company: 'ScaleOps Commerce',
    industry: 'Multi-Tenant SaaS',
    headline:
      'Launched 4 customer-facing portals in 3 weeks with full-stack SQL persistence',
    metrics: [
      { label: 'Portals Shipped', value: '4 Apps' },
      { label: 'Engineering Hours Saved', value: '420 hrs' },
      { label: 'Customer CSAT', value: '4.9 / 5.0' },
    ],
    quote:
      'The 2-step DevPlan builder turned our approved PRD and UI design into 3 balanced two-week sprints with story points in under a minute.',
    author: 'Priya Nair, Head of Platform Delivery',
    prompt:
      'Build a B2B Merchant Onboarding & Order Fulfillment Portal with real-time inventory alerts, webhook logs, and Stripe billing.',
  },
];

export default function CaseStudiesPage() {
  return (
    <MarketingChrome>
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" /> Proven Engineering ROI
            </span>
            <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              How High-Velocity Teams Ship with OmniFlow AI
            </h1>
            <p className="mt-3 text-base text-slate-300">
              Explore real-world product and engineering transformations powered
              by Spec-Driven AI development.
            </p>
          </div>

          <div className="space-y-8">
            {CASE_STUDIES.map((cs) => (
              <div
                key={cs.company}
                className="rounded-3xl border border-white/15 bg-[#111029] p-6 sm:p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                      <span>{cs.company}</span>
                      <span>•</span>
                      <span className="text-slate-400">{cs.industry}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {cs.headline}
                    </h2>
                    <blockquote className="border-l-2 border-[#5345E9] pl-4 text-sm italic text-slate-300">
                      &ldquo;{cs.quote}&rdquo;
                      <footer className="mt-2 not-italic text-xs font-semibold text-slate-400">
                        — {cs.author}
                      </footer>
                    </blockquote>
                    <div className="pt-2">
                      <Link
                        href={`/index?prompt=${encodeURIComponent(cs.prompt)}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                      >
                        <span>Build Similar Architecture in Workspace</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                    {cs.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-2xl border border-white/10 bg-[#09081C] p-4 flex items-center justify-between"
                      >
                        <span className="text-xs text-slate-400">
                          {m.label}
                        </span>
                        <span className="text-lg font-extrabold text-emerald-400">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
