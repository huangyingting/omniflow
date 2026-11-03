'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { Lightbulb, Plus, ArrowRight, Sparkles } from 'lucide-react';

export default function IdeasListPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<
    Array<{
      id: string;
      name: string;
      updatedAt: string;
      messages: Array<{ content: string }>;
    }>
  >([]);
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/ideas')
      .then((r) => r.json())
      .then((d) => {
        if (d.ideas) setIdeas(d.ideas);
      });
  }, []);

  const handleStartIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prompt.trim().slice(0, 48) || 'New Ideation Session',
          initialPrompt: prompt.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.idea) {
        router.push(`/ideas/${data.idea.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell
      title="AI Ideation & Discovery Studio"
      subtitle="Brainstorm market opportunities, personas, and MVP hypotheses before converting into a Living PRD"
    >
      {/* Quick Brainstorm Composer */}
      <form
        onSubmit={handleStartIdea}
        className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-[#5345E9]">
          <Sparkles className="h-4 w-4" />
          <span>Start New AI Product Discovery Thread</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a rough product idea, customer problem, or feature hypothesis..."
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#5345E9] focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5345E9] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
          >
            <Plus className="h-4 w-4" />
            <span>{creating ? 'Starting...' : 'Brainstorm with Joy AI'}</span>
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((idea) => (
          <Link
            key={idea.id}
            href={`/ideas/${idea.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#5345E9]/50 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#5345E9] font-semibold mb-2">
                <span className="inline-flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" /> Ideation Session
                </span>
                <span className="text-slate-400">
                  {new Date(idea.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{idea.name}</h3>
              <p className="mt-1.5 text-xs text-slate-500 line-clamp-3">
                {idea.messages?.[0]?.content ||
                  'Click to continue brainstorming...'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-semibold text-[#5345E9]">
              <span>Open Thread</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
