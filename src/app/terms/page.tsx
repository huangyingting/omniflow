'use client';

import React from 'react';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';

export default function TermsPage() {
  return (
    <MarketingChrome>
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 bg-[#111029] p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
            <h1 className="text-3xl font-extrabold text-white">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-400">
              Last Updated: February 2025
            </p>
            <h2 className="text-lg font-bold text-white">
              1. Authorized Workspace Access
            </h2>
            <p>
              Access to the OmniFlow AI Workspace is restricted to authorized
              users admitted via single-use administrator invitations or CLI
              bootstrap. Sharing credentials or bypassing RBAC controls is
              prohibited.
            </p>
            <h2 className="text-lg font-bold text-white">
              2. Intellectual Property of Generated Artifacts
            </h2>
            <p>
              Customers retain full ownership and commercial rights to all
              specifications, UI/UX designs, source code, and database schemas
              generated within their organization workspace.
            </p>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
