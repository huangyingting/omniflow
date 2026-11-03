'use client';

import React, { useState } from 'react';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <MarketingChrome>
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 bg-[#111029] p-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-2">
              <Mail className="h-4 w-4" /> Enterprise &amp; Workspace Inquiries
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              Contact OmniFlow AI
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Need custom SSO/SAML, dedicated VPC deployment, or an enterprise
              invitation? Reach out to our solutions engineering team.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>
                  Thank you! Your enterprise inquiry has been logged. Our team
                  will respond within 1 business day.
                </span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-white/15 bg-[#09081C] px-3.5 py-2.5 text-sm text-white focus:border-[#5345E9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization &amp; Team Size
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Corp (25 engineers)"
                    className="w-full rounded-xl border border-white/15 bg-[#09081C] px-3.5 py-2.5 text-sm text-white focus:border-[#5345E9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    How can we help?
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your product workflow, compliance requirements, or workspace invitation needs..."
                    className="w-full rounded-xl border border-white/15 bg-[#09081C] px-3.5 py-2.5 text-sm text-white focus:border-[#5345E9] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#5345E9] py-2.5 text-sm font-semibold text-white hover:bg-[#4335D6]"
                >
                  Submit Enterprise Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
