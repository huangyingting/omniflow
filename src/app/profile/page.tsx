'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/workspace/AppShell';
import { User, Save, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [specialty, setSpecialty] = useState('Full-Stack Product Builder');
  const [velocity, setVelocity] = useState(10);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setName(d.user.name || '');
          setEmail(d.user.email || '');
          setRole(d.user.role || 'MEMBER');
          setSpecialty(d.user.specialty || 'Full-Stack Product Builder');
          setVelocity(d.user.velocity || 10);
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, specialty, velocity }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <AppShell
      title="My Profile & Engineering Velocity"
      subtitle="Personalize your display name, role specialty, and sprint capacity"
    >
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5345E9] text-lg font-bold text-white">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">
              {name || email}
            </div>
            <div className="text-xs text-slate-500">
              {email} • Workspace Role: <strong>{role}</strong>
            </div>
          </div>
        </div>

        {saved && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Profile preferences saved.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Specialty (Used for DevPlan Story Allocation)
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
            >
              <option value="Full-Stack Product Builder">
                Full-Stack Product Builder
              </option>
              <option value="Product Manager">Product Manager</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Backend & Database Architect">
                Backend &amp; Database Architect
              </option>
              <option value="QA & Automation Engineer">
                QA &amp; Automation Engineer
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sprint Story Point Velocity (SP / 2-week Sprint)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={velocity}
              onChange={(e) => setVelocity(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5345E9] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#4335D6]"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>
    </AppShell>
  );
}
