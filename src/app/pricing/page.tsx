'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { PRICING_PLANS } from '@/lib/omniflow/catalog';
import { Check, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <MarketingChrome>
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5345E9]/20 border border-[#5345E9]/40 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> Predictable Credit &amp; Seat
              Plans
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">
              Scale from First PRD to Enterprise Production
            </h1>
            <p className="mt-4 text-base text-slate-300">
              Every plan includes the 7-stage Spec-Driven Builder, Living PRD
              version history, Multi-Page UI/UX wireframes, and full-stack
              application preview.
            </p>

            {/* Billing Interval Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-[#12112E] p-1.5">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  !annual
                    ? 'bg-[#5345E9] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  annual
                    ? 'bg-[#5345E9] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual Billing (Save 20%)
              </button>
            </div>
          </div>

          {/* 4-Tier Pricing Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_PLANS.map((plan) => {
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.tier}
                  className={`rounded-3xl border p-6 flex flex-col justify-between ${
                    plan.popular
                      ? 'border-[#5345E9] bg-gradient-to-b from-[#5345E9]/20 to-[#111029] shadow-2xl shadow-[#5345E9]/20'
                      : 'border-white/10 bg-[#111029]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">
                        {plan.name}
                      </h3>
                      {plan.popular && (
                        <span className="rounded-full bg-[#5345E9] px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-400 min-h-[36px]">
                      {plan.description}
                    </p>
                    <div className="mt-5 flex items-baseline gap-1">
                      {price === null ? (
                        <span className="text-3xl font-extrabold text-white">
                          Custom
                        </span>
                      ) : (
                        <>
                          <span className="text-3xl font-extrabold text-white">
                            ${price}
                          </span>
                          <span className="text-xs text-slate-400">
                            / user / mo
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 inline-block rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                      {plan.credits.toLocaleString()} AI Credits / month
                    </div>

                    <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={
                      plan.tier === 'ENTERPRISE' ? '/contact' : '/billing'
                    }
                    className={`mt-8 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition ${
                      plan.popular
                        ? 'bg-[#5345E9] text-white hover:bg-[#4335D6]'
                        : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <span>
                      {plan.tier === 'ENTERPRISE'
                        ? 'Contact Enterprise Sales'
                        : `Select ${plan.name}`}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Credit Consumption Reference */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-[#111029] p-8">
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-4">
              <HelpCircle className="h-4 w-4 text-[#8B5CF6]" />
              <span>How OmniFlow AI Credits Work</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="font-bold text-indigo-300">50 Credits</div>
                <div className="text-white font-semibold mt-1">
                  7-Artifact Project Creation
                </div>
                <p className="text-slate-400 mt-1">
                  Synthesizes PRD, 4-page UI/UX, Tech Design, DevPlan, QA Plan,
                  Release Plan, and Full-Stack App.
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="font-bold text-indigo-300">20 Credits</div>
                <div className="text-white font-semibold mt-1">
                  Joy AI Stage Refinement
                </div>
                <p className="text-slate-400 mt-1">
                  Iterative PRD revision, UI style regeneration, or Full-Stack
                  code &amp; SQL schema update.
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="font-bold text-emerald-300">0 Credits</div>
                <div className="text-white font-semibold mt-1">
                  Manual Editing &amp; SQL Console
                </div>
                <p className="text-slate-400 mt-1">
                  Direct Markdown edits, code editor changes, Kanban board
                  updates, and SQL queries are always free.
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="font-bold text-amber-300">+300–750 Credits</div>
                <div className="text-white font-semibold mt-1">
                  Workspace Rewards
                </div>
                <p className="text-slate-400 mt-1">
                  Earn bonus AI credits by completing the product tour,
                  connecting GitHub, or indexing a Knowledge Base.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
