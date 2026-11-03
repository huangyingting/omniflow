'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { Save } from 'lucide-react';

export default function CreateTemplateDocumentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PRD');
  const [category, setCategory] = useState('Product Management');
  const [promptText, setPromptText] = useState('');
  const [content, setContent] = useState(
    '# Specification Title\n\n## 1. Executive Summary\n\n## 2. Core User Stories & Acceptance Criteria\n\n## 3. Architecture & Security Controls\n'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/template-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        type,
        category,
        promptText,
        content,
      }),
    });
    if (res.ok) {
      router.push('/template-documents');
    }
  };

  return (
    <AppShell
      title="Create Custom Document Template"
      subtitle="Define a reusable specification blueprint for your organization"
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="SOC2 Microservice PRD Template"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Artifact Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="PRD">PRD</option>
              <option value="TECH_DESIGN">TECH_DESIGN</option>
              <option value="QA_PLAN">QA_PLAN</option>
              <option value="RELEASE_PLAN">RELEASE_PLAN</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Summary
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Standardized specification for enterprise services"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Default AI Generation Prompt
          </label>
          <textarea
            rows={2}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Instructions for Joy AI when synthesizing from this template..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Markdown Structure Skeleton
          </label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-[#5345E9] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
        >
          <Save className="h-4 w-4" />
          <span>Save Custom Template</span>
        </button>
      </form>
    </AppShell>
  );
}
