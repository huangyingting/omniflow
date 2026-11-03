'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { PRODUCT_SHOWCASE_TEMPLATES } from '@/lib/omniflow/catalog';
import { Layers, ArrowRight } from 'lucide-react';

export default function UseCasesPage() {
  return (
    <MarketingChrome>
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              <Layers className="h-3.5 w-3.5" /> Industry &amp; Role Use Cases
            </span>
            <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              From Internal Operations Tools to Multi-Tenant SaaS
            </h1>
            <p className="mt-3 text-base text-slate-300">
              Launch any use case with a complete Living PRD, 4-screen UI/UX
              prototype, full-stack SQL database, and sprint backlog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRODUCT_SHOWCASE_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-3xl border border-white/15 bg-[#111029] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-2">
                    <span>{tpl.category}</span>
                    <span>{tpl.metrics}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{tpl.name}</h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {tpl.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tpl.highlights.map((h) => (
                      <span
                        key={h}
                        className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Includes PRD + 4 UI Screens + SQL DB + DevPlan
                  </span>
                  <Link
                    href={`/index?templateId=${tpl.id}&prompt=${encodeURIComponent(
                      tpl.promptText
                    )}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
                  >
                    <span>Launch Use Case</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
