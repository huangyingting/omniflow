'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/workspace/AppShell';
import { CreditCard, Check, Sparkles, Gift, History } from 'lucide-react';

export default function BillingWorkspacePage() {
  const [org, setOrg] = useState<{
    id: string;
    name: string;
    planTier: string;
    billingInterval: string;
    credits: number;
    totalCreditsPool: number;
  } | null>(null);
  const [plans, setPlans] = useState<
    Array<{
      tier: 'FREE' | 'PRO' | 'TEAMS' | 'ENTERPRISE';
      name: string;
      monthlyPrice: number | null;
      annualPrice: number | null;
      credits: number;
      description: string;
      features: string[];
    }>
  >([]);
  const [ledger, setLedger] = useState<
    Array<{
      id: string;
      amount: number;
      type: string;
      action: string;
      balanceAfter: number;
      createdAt: string;
    }>
  >([]);
  const [banner, setBanner] = useState<string | null>(null);

  const loadBilling = useCallback(async () => {
    const res = await fetch('/api/billing', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) {
      setOrg(data.organization);
      setPlans(data.plans || []);
      setLedger(data.ledger || []);
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  const handleUpgrade = async (
    planTier: 'FREE' | 'PRO' | 'TEAMS' | 'ENTERPRISE'
  ) => {
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upgrade-plan',
        planTier,
        billingInterval: 'ANNUAL',
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setBanner(data.message);
      await loadBilling();
    }
  };

  const handleReward = async () => {
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claim-reward',
        rewardType: 'Spec-Driven Builder Milestone Bonus',
        creditsToAdd: 500,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setBanner(data.message);
      await loadBilling();
    }
  };

  return (
    <AppShell
      title="Billing, Subscription & AI Credits"
      subtitle="Manage your organization subscription tier and inspect your immutable credit ledger"
      actions={
        <button
          type="button"
          onClick={handleReward}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-3.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-500/25"
        >
          <Gift className="h-3.5 w-3.5" /> Claim +500 Bonus Credits
        </button>
      }
    >
      {banner && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900">
          {banner}
        </div>
      )}

      {/* Current Subscription Overview */}
      {org && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5345E9]/10 text-[#5345E9]">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-[#5345E9]">
                Active Organization Plan
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {org.name} — {org.planTier} Tier ({org.billingInterval})
              </h2>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500">Available AI Credits</div>
            <div className="text-2xl font-extrabold text-[#5345E9] font-mono">
              {org.credits.toLocaleString()} /{' '}
              {org.totalCreditsPool.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plans.map((p) => {
          const isCurrent = org?.planTier === p.tier;
          return (
            <div
              key={p.tier}
              className={`rounded-2xl border bg-white p-5 flex flex-col justify-between ${
                isCurrent ? 'border-[#5345E9] ring-2 ring-[#5345E9]/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    {p.name}
                  </h3>
                  {isCurrent && (
                    <span className="rounded-full bg-[#5345E9]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#5345E9]">
                      Current
                    </span>
                  )}
                </div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900">
                  {p.annualPrice === null ? 'Custom' : `$${p.annualPrice}/mo`}
                </div>
                <div className="mt-1 text-xs font-semibold text-[#5345E9]">
                  {p.credits.toLocaleString()} Credits / mo
                </div>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleUpgrade(p.tier)}
                className="mt-5 w-full rounded-xl bg-[#5345E9] py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
              >
                <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                {isCurrent ? 'Replenish Pool' : `Switch to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Credit Ledger Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
          <History className="h-4 w-4 text-[#5345E9]" />
          <span>Organization AI Credit Ledger ({ledger.length} entries)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Delta</th>
                <th className="px-4 py-2.5">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-2.5 text-slate-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {entry.action}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold">
                      {entry.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-2.5 font-mono font-bold ${
                      entry.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {entry.amount >= 0 ? `+${entry.amount}` : entry.amount}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">
                    {entry.balanceAfter.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
