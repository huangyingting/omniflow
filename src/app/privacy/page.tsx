'use client';

import React from 'react';
import { MarketingChrome } from '@/components/marketing/MarketingChrome';

export default function PrivacyPage() {
  return (
    <MarketingChrome>
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 bg-[#111029] p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
            <h1 className="text-3xl font-extrabold text-white">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400">
              Last Updated: February 2025
            </p>
            <h2 className="text-lg font-bold text-white">
              1. Data Ownership &amp; Isolation
            </h2>
            <p>
              All Product Requirements Documents (PRDs), UI/UX wireframes,
              full-stack source code, SQL database records, and Knowledge Base
              files created in your OmniFlow workspace remain the exclusive
              property of your organization.
            </p>
            <h2 className="text-lg font-bold text-white">
              2. Invite-Only Authentication &amp; Audit Logs
            </h2>
            <p>
              OmniFlow enforces single-use SHA-256 invitation tokens, scrypt
              password hashing, and immutable audit logs (`AuditLog`) recording
              administrative actions, invitation issuance, and role changes.
            </p>
          </div>
        </div>
      </section>
    </MarketingChrome>
  );
}
