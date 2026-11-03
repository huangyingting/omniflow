'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { Sparkles, ShieldCheck, Layers, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <MarketingChrome>
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5345E9]/20 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> Our Mission
            </span>
            <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              Bridging Product Strategy and Full-Stack Execution
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              OmniFlow AI was built on a simple conviction: great software
              starts with a clear, living specification. We unify Product
              Management, UI/UX Design, Full-Stack Engineering, and Agile
              Delivery into a single spec-driven platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-white/15 bg-[#111029] p-6">
              <Layers className="h-6 w-6 text-indigo-400 mb-3" />
              <h2 className="text-lg font-bold text-white">
                7 Synchronized Lifecycle Stages
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Every OmniFlow project maintains a connected graph of PRD, UI
                Design, Technical Design, Development Plan, QA Plan, Release
                Plan, and Deployed Application.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-[#111029] p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mb-3" />
              <h2 className="text-lg font-bold text-white">
                Enterprise-Grade Governance
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Invite-only cryptographic admission, role-based access control,
                and immutable audit logging ensure your intellectual property
                remains secure.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/index"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5345E9] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4335D6]"
            >
              <span>Launch OmniFlow Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
