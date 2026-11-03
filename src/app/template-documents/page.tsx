'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/workspace/AppShell';
import {
  PRODUCT_SHOWCASE_TEMPLATES,
  OFFICIAL_DOCUMENT_TEMPLATES,
} from '@/lib/omniflow/catalog';
import { Plus, Layers, FileText, ArrowRight } from 'lucide-react';

export default function TemplateCenterPage() {
  const [activeTab, setActiveTab] = useState<'product' | 'document'>('product');
  const [customTemplates, setCustomTemplates] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      category: string;
      promptText: string;
    }>
  >([]);

  useEffect(() => {
    fetch('/api/template-documents')
      .then((r) => r.json())
      .then((d) => {
        if (d.documentTemplates) setCustomTemplates(d.documentTemplates);
      });
  }, []);

  return (
    <AppShell
      title="Template Center"
      subtitle="Official Product Blueprints and Specification Document Templates"
      actions={
        <Link
          href="/template-documents/create/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
        >
          <Plus className="h-3.5 w-3.5" /> Create Custom Template
        </Link>
      }
    >
      {/* Product vs Document Tabs matching app.omniflowai.com/template-documents */}
      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('product')}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'product'
              ? 'bg-[#5345E9] text-white'
              : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Product Blueprints ({PRODUCT_SHOWCASE_TEMPLATES.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('document')}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'document'
              ? 'bg-[#5345E9] text-white'
              : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>
            Document Templates (
            {customTemplates.length || OFFICIAL_DOCUMENT_TEMPLATES.length})
          </span>
        </button>
      </div>

      {activeTab === 'product' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCT_SHOWCASE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="rounded-lg bg-[#5345E9]/10 px-2.5 py-0.5 font-semibold text-[#5345E9]">
                    {tpl.category}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {tpl.metrics}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{tpl.description}</p>
              </div>
              <Link
                href={`/index?prompt=${encodeURIComponent(tpl.promptText)}`}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5345E9] py-2 text-xs font-semibold text-white hover:bg-[#4335D6]"
              >
                <span>Use Product Blueprint</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(customTemplates.length > 0
            ? customTemplates
            : OFFICIAL_DOCUMENT_TEMPLATES
          ).map((docTpl, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-0.5 font-semibold text-[#5345E9]">
                    {docTpl.category}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {docTpl.type}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {docTpl.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {docTpl.description}
                </p>
              </div>
              <Link
                href={`/index?prompt=${encodeURIComponent(docTpl.promptText)}`}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#5345E9] py-2 text-xs font-semibold text-[#5345E9] hover:bg-[#5345E9] hover:text-white transition"
              >
                <span>Start Spec from Template</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
