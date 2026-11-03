'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/workspace/AppShell';
import { Send, Sparkles, ArrowRight } from 'lucide-react';

export default function IdeaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ideaId = params.id;

  const [idea, setIdea] = useState<{
    id: string;
    name: string;
    messages: Array<{ id: string; role: string; content: string }>;
  } | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [converting, setConverting] = useState(false);

  const loadIdea = useCallback(async () => {
    const res = await fetch(`/api/ideas/${ideaId}`, { cache: 'no-store' });
    const data = await res.json();
    if (res.ok && data.idea) {
      setIdea(data.idea);
    }
  }, [ideaId]);

  useEffect(() => {
    loadIdea();
  }, [loadIdea]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/ideas/${ideaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      setInput('');
      await loadIdea();
    } finally {
      setSending(false);
    }
  };

  const handleConvertToProject = async () => {
    if (!idea || converting) return;
    setConverting(true);
    try {
      const combinedContext = idea.messages
        .map((m) => m.content)
        .join(' ')
        .slice(0, 600);
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: idea.name,
          prompt: combinedContext || idea.name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.prdDocument?.id) {
        router.push(`/docs/${data.prdDocument.id}`);
      }
    } finally {
      setConverting(false);
    }
  };

  return (
    <AppShell
      title={idea?.name || 'AI Ideation Studio'}
      subtitle="Collaborative Product Discovery with Joy AI"
      actions={
        <button
          type="button"
          onClick={handleConvertToProject}
          disabled={converting}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {converting
              ? 'Generating Project & PRD...'
              : 'Convert to Project & PRD →'}
          </span>
        </button>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white flex flex-col h-[calc(100vh-9rem)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(idea?.messages || []).map((msg) => (
            <div
              key={msg.id}
              className={`max-w-3xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#5345E9] text-white ml-auto'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-70 mb-1">
                {msg.role === 'user' ? 'You' : 'Joy AI Product Strategist'}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 bg-slate-50 p-4 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Joy AI to explore personas, pricing tiers, competitor moat, or MVP scope..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#5345E9] focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#5345E9] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
