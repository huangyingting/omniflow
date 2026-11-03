export interface UIDesignScreen {
  id: string;
  name: string;
  title: string;
  route: string;
  summary: string;
  kpis: { label: string; value: string; delta: string }[];
  metrics: { label: string; value: string; delta: string }[];
  primaryTableTitle: string;
  rows: { id: string; title: string; owner: string; status: string; metric: string }[];
  actionLabel: string;
  primaryActions: string[];
  components: string[];
}

export type UIStyleId =
  | 'modern-minimal'
  | 'cosmic-dark'
  | 'cyberpunk-dark'
  | 'enterprise-clean'
  | 'enterprise-slate'
  | 'glassmorphic'
  | 'glassmorphic-saas'
  | 'warm-editorial'
  | 'brutalist-bold';

export interface UIDesignMeta {
  styleId: UIStyleId;
  styleName: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: string;
  palette: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  screens: UIDesignScreen[];
  pages: UIDesignScreen[];
}

export interface ProductFile {
  path: string;
  language: 'tsx' | 'ts' | 'sql' | 'css' | 'json';
  content: string;
}

export interface DatabaseTable {
  name: string;
  columns: { name: string; type: string; pk?: boolean }[];
  rows: Record<string, string | number | boolean>[];
}

export interface ProductMeta {
  appTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryColor: string;
  ctaLabel: string;
  darkMode: boolean;
  files: ProductFile[];
  previewDb: {
    tables: DatabaseTable[];
    sqlHistory: { id: string; query: string; status: string; rowCount: number; executedAt: string }[];
    lastSnapshotAt: string | null;
  };
  productionDb: {
    tables: DatabaseTable[];
    sqlHistory: { id: string; query: string; status: string; rowCount: number; executedAt: string }[];
    lastSnapshotAt: string | null;
  };
  connectors: {
    id: string;
    name: string;
    category: string;
    status: 'CONNECTED' | 'AVAILABLE';
    envKey: string;
    envKeys: string[];
    previewConfigured: boolean;
    prodConfigured: boolean;
  }[];
  domains: {
    id: string;
    domain: string;
    cnameTarget: string;
    status: 'VERIFIED' | 'PENDING_DNS';
    isPrimary: boolean;
    sslStatus: 'ACTIVE' | 'PROVISIONING';
  }[];
  gitConfig: {
    provider: 'GITHUB' | 'BITBUCKET';
    repoUrl: string;
    branch: string;
    lastCommitHash: string;
    lastSyncAt: string;
  };
  deployments: {
    id: string;
    environment: 'PREVIEW' | 'PRODUCTION';
    version: string;
    status: 'READY' | 'BUILDING';
    url: string;
    createdAt: string;
    logs: string[];
  }[];
}

export interface DevPlanMeta {
  roles: string[];
  scheduleConfirmed: boolean;
  epics: {
    id: string;
    name: string;
    description: string;
    summary: string;
    storyPoint: number;
    stories: {
      id: string;
      name: string;
      role: string;
      storyPoint: number;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      sprint: string;
      acceptanceCriteria: string[];
      tasks: { id: string; name: string; role: string; storyPoint: number }[];
    }[];
  }[];
  sprints: {
    id: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    totalStoryPoints: number;
  }[];
  milestones: {
    id: string;
    name: string;
    targetDate: string;
    deliverables: string[];
  }[];
}

export const DESIGN_STYLE_PRESETS: Record<
  UIStyleId,
  Omit<UIDesignMeta, 'screens' | 'pages' | 'palette'>
> = {
  'modern-minimal': {
    styleId: 'modern-minimal',
    styleName: 'Modern Minimal',
    primaryColor: '#6366F1',
    accentColor: '#8E85FF',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    borderRadius: '12px',
  },
  'cosmic-dark': {
    styleId: 'cosmic-dark',
    styleName: 'Cosmic Dark',
    primaryColor: '#8E85FF',
    accentColor: '#38BDF8',
    backgroundColor: '#090812',
    surfaceColor: '#131124',
    textColor: '#F8FAFC',
    borderRadius: '14px',
  },
  'cyberpunk-dark': {
    styleId: 'cyberpunk-dark',
    styleName: 'Cyberpunk Dark',
    primaryColor: '#8E85FF',
    accentColor: '#38BDF8',
    backgroundColor: '#090812',
    surfaceColor: '#131124',
    textColor: '#F8FAFC',
    borderRadius: '14px',
  },
  'enterprise-clean': {
    styleId: 'enterprise-clean',
    styleName: 'Enterprise Clean',
    primaryColor: '#0284C7',
    accentColor: '#0EA5E9',
    backgroundColor: '#F1F5F9',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    borderRadius: '8px',
  },
  'enterprise-slate': {
    styleId: 'enterprise-slate',
    styleName: 'Enterprise Slate',
    primaryColor: '#0284C7',
    accentColor: '#0EA5E9',
    backgroundColor: '#F1F5F9',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    borderRadius: '8px',
  },
  glassmorphic: {
    styleId: 'glassmorphic',
    styleName: 'Glassmorphic Frost',
    primaryColor: '#10B981',
    accentColor: '#34D399',
    backgroundColor: '#0B131E',
    surfaceColor: '#162232',
    textColor: '#F1F5F9',
    borderRadius: '18px',
  },
  'glassmorphic-saas': {
    styleId: 'glassmorphic-saas',
    styleName: 'Glassmorphic SaaS',
    primaryColor: '#10B981',
    accentColor: '#34D399',
    backgroundColor: '#0B131E',
    surfaceColor: '#162232',
    textColor: '#F1F5F9',
    borderRadius: '18px',
  },
  'warm-editorial': {
    styleId: 'warm-editorial',
    styleName: 'Warm Editorial',
    primaryColor: '#D97706',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
    surfaceColor: '#FFFFFF',
    textColor: '#1C1917',
    borderRadius: '10px',
  },
  'brutalist-bold': {
    styleId: 'brutalist-bold',
    styleName: 'Brutalist Bold',
    primaryColor: '#EA580C',
    accentColor: '#F97316',
    backgroundColor: '#FFFBEB',
    surfaceColor: '#FFFFFF',
    textColor: '#111827',
    borderRadius: '4px',
  },
};

export function inferProjectShortName(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : (words[0] || 'OM').slice(0, 2).toUpperCase();
  const num = Math.floor(10 + (name.length * 7) % 89);
  return `${initials}${num}`;
}

export function synthesizePRDContent(input: {
  projectName: string;
  prompt: string;
  authorName?: string;
  knowledgeContext?: string;
  refinementInstruction?: string;
}): { content: string; followUpSuggestions: string[] } {
  const dateStr = new Date().toLocaleDateString('en-US');
  const author = input.authorName || 'Omniflow Product Team';
  const domainSummary =
    input.prompt.trim() ||
    `An AI-powered workflow platform for ${input.projectName}.`;

  const kbNote = input.knowledgeContext
    ? `\n\n### Grounded Knowledge Base Context\n${input.knowledgeContext}\n`
    : '';

  const refinementNote = input.refinementInstruction
    ? `\n\n### AI Refinement Applied\n- **Instruction**: ${input.refinementInstruction}\n- **Scope Update**: Incorporated enhanced validation, SLA guardrails, role-based permissions, and telemetry metrics across all epics.\n`
    : '';

  const content = `# Product Requirement Document (PRD) - ${input.projectName}

**Product:** ${input.projectName}  
**Author:** ${author}  
**Date:** ${dateStr}  
**Template In Use:** Generic PRD Document  

---

## 1. Problem & Opportunity

Organizations lose significant operational velocity manually coordinating workflows, triaging incoming requests, and reconciling data across disconnected tools. ${domainSummary}

**${input.projectName}** solves this by providing a unified, AI-assisted operational workspace that automates classification and routing, surfaces real-time SLA and performance telemetry, grounds responses in verified organizational knowledge, and gives leaders end-to-end visibility.
${kbNote}${refinementNote}
---

## 2. Target Audience & User Personas

1. **Primary Operator / Specialist**: Executes daily workflows inside ${input.projectName}, relying on AI recommendations, instant search, and automated triage to resolve tasks 3x faster.
2. **Team Lead / Manager**: Monitors live queue health, SLA compliance, workload balance, and weekly velocity reports.
3. **Operations Administrator**: Configures routing rules, role-based access control (RBAC), third-party integrations, and audit compliance.
4. **External Stakeholder / End User**: Submits requests or consumes published outputs with transparent status tracking.

---

## 3. Metrics and Goals

- **Speed to Resolution**: Reduce median workflow cycle time by **42%** within 6 months of deployment.
- **Automation Accuracy**: Achieve **>= 92%** accuracy on AI-assisted classification and recommendations (measured against operator overrides).
- **SLA & Reliability**: Reduce missed SLA targets by **35%** and maintain **99.9%** workspace uptime.
- **Adoption & Engagement**: Reach **75%** weekly active usage among target operational teams within 90 days.

---

## 4. Epics & User Stories

### Epic 1: Intelligent Intake, Classification & Automated Routing
- **User Story 1.1**: As an operator, I want incoming items from web forms, APIs, and integrations to be automatically categorized by priority and domain so that critical items are handled first.
  - *Acceptance Criteria*:
    - System assigns a priority badge (\`CRITICAL\`, \`HIGH\`, \`MEDIUM\`, \`LOW\`) and confidence score within 2 seconds.
    - Operators can override the assigned category with 1 click, logging feedback to the audit trail.
- **User Story 1.2**: As a team lead, I want configurable routing rules based on specialty and current capacity so no single teammate is overloaded.

### Epic 2: AI Copilot & Grounded Knowledge Synthesis
- **User Story 2.1**: As an operator, I want contextual AI draft recommendations grounded in our uploaded Knowledge Base documents with inline source citations.
  - *Acceptance Criteria*:
    - Every AI suggestion displays the source document name and chunk reference.
    - Operators can insert, refine, or regenerate recommendations before publishing.

### Epic 3: Real-Time SLA Monitoring, Analytics & Executive Reporting
- **User Story 3.1**: As a team lead, I want a live telemetry dashboard showing active throughput, SLA breach warnings, and completion trends across sprints.
  - *Acceptance Criteria*:
    - Items approaching SLA breach within 30 minutes trigger visual amber/red indicators.
    - Dashboard exports weekly status snapshots and velocity metrics.

### Epic 4: Enterprise Access Control, Integrations & Audit Trail
- **User Story 4.1**: As an administrator, I want invite-only user onboarding with \`ADMIN\`, \`MEMBER\`, and \`VIEWER\` roles and an immutable security audit log.

---

## 5. Technical & Security Constraints

- **Authentication & Admission**: Fail-closed invite-only account admission with SHA-256 single-use expiring tokens.
- **Data Persistence**: Relational schema supporting both SQLite (local development) and PostgreSQL (production deployment) with point-in-time snapshot capabilities.
- **Responsive UX**: Full parity across Desktop (\`1440px\`), Tablet (\`768px\`), and Mobile (\`390px\`) viewports.
`;

  return {
    content,
    followUpSuggestions: [
      'Define AI Quality & Confidence Framework',
      'Detail Multi-Role Permission Matrix',
      'Add SLA Escalation & Webhook Rules',
    ],
  };
}

export function synthesizeUIDesignMeta(input: {
  projectName: string;
  prompt: string;
  styleId?: UIDesignMeta['styleId'];
}): UIDesignMeta {
  const styleKey = input.styleId || 'modern-minimal';
  const preset = DESIGN_STYLE_PRESETS[styleKey] || DESIGN_STYLE_PRESETS['modern-minimal'];

  const rawScreens: Omit<
    UIDesignScreen,
    'title' | 'metrics' | 'primaryActions' | 'components'
  >[] = [
    {
      id: 'screen-dashboard',
      name: '1. Executive Triage & Command Dashboard',
      route: '/dashboard',
      summary: `Real-time operational overview for ${input.projectName} with KPI cards, priority queue, and AI copilot insights.`,
      kpis: [
        { label: 'Active Queue', value: '48', delta: '-14% vs last week' },
        { label: 'SLA Compliance', value: '98.4%', delta: '+3.2% improvement' },
        { label: 'AI Auto-Resolved', value: '64%', delta: '+11% accuracy' },
        { label: 'Avg Cycle Time', value: '18m', delta: '-42% faster' },
      ],
      primaryTableTitle: `${input.projectName} — Live Priority Queue`,
      rows: [
        {
          id: 'REQ-1042',
          title: 'Enterprise SSO & SAML token rotation',
          owner: 'Sarah Chen',
          status: 'IN_PROGRESS',
          metric: 'SLA: 24m left',
        },
        {
          id: 'REQ-1043',
          title: 'Automated billing webhook reconciliation',
          owner: 'Alex Rivera',
          status: 'READY',
          metric: 'AI Confidence: 96%',
        },
        {
          id: 'REQ-1044',
          title: 'Production database read-replica latency alert',
          owner: 'Marcus Vance',
          status: 'CRITICAL',
          metric: 'SLA: 12m left',
        },
        {
          id: 'REQ-1045',
          title: 'Q4 customer cohort retention export',
          owner: 'Elena Rostova',
          status: 'COMPLETED',
          metric: 'Resolved in 9m',
        },
      ],
      actionLabel: '+ New Workflow Item',
    },
    {
      id: 'screen-workspace',
      name: '2. AI Copilot & Resolution Studio',
      route: '/studio',
      summary: `Split-pane operator studio combining live item context, Knowledge Base RAG citations, and 1-click automation actions.`,
      kpis: [
        { label: 'Grounded Citations', value: '12 Docs', delta: '100% verified' },
        { label: 'Draft Quality', value: '4.9 / 5', delta: 'Top quartile' },
        { label: 'Policy Guardrails', value: 'Passed', delta: '0 violations' },
        { label: 'Response Latency', value: '380ms', delta: 'P95 target met' },
      ],
      primaryTableTitle: 'Recommended Automation Playbooks',
      rows: [
        {
          id: 'PB-01',
          title: 'Verify tenant subscription & quota ledger',
          owner: 'Agent Joy',
          status: 'COMPLETED',
          metric: '120ms',
        },
        {
          id: 'PB-02',
          title: 'Synthesize RAG response from Architecture KB',
          owner: 'Agent Joy',
          status: 'READY',
          metric: '3 citations',
        },
        {
          id: 'PB-03',
          title: 'Dispatch Slack & Jira escalation webhook',
          owner: 'Automation Engine',
          status: 'PENDING',
          metric: 'Awaiting approval',
        },
      ],
      actionLabel: 'Execute Playbook',
    },
    {
      id: 'screen-analytics',
      name: '3. SLA Telemetry & Velocity Analytics',
      route: '/analytics',
      summary: `Cohort performance, throughput burnup, and SLA breach prevention metrics across teams.`,
      kpis: [
        { label: 'Weekly Throughput', value: '1,284', delta: '+19% WoW' },
        { label: 'First-Touch Resolution', value: '78%', delta: '+8% WoW' },
        { label: 'CSAT Score', value: '4.85', delta: '+0.25 vs target' },
        { label: 'Prevented Breaches', value: '37', delta: 'Saved $14.2k' },
      ],
      primaryTableTitle: 'Team Specialty Performance Breakdown',
      rows: [
        {
          id: 'TEAM-01',
          title: 'Core Platform & API Triage',
          owner: '12 Specialists',
          status: 'HEALTHY',
          metric: '99.1% SLA',
        },
        {
          id: 'TEAM-02',
          title: 'Enterprise Onboarding & Security',
          owner: '8 Specialists',
          status: 'HEALTHY',
          metric: '97.8% SLA',
        },
        {
          id: 'TEAM-03',
          title: 'Billing & Revenue Operations',
          owner: '6 Specialists',
          status: 'READY',
          metric: '98.5% SLA',
        },
      ],
      actionLabel: 'Export Weekly Report',
    },
    {
      id: 'screen-settings',
      name: '4. RBAC Governance, Connectors & Audit Log',
      route: '/settings',
      summary: `Organization-wide security policies, invite-only admission controls, and third-party webhook connectors.`,
      kpis: [
        { label: 'Active Members', value: '18 / 20', delta: '2 seats available' },
        { label: 'Connected Apps', value: '5 Active', delta: 'GitHub, Slack, Jira' },
        { label: 'Admission Mode', value: 'Invite-Only', delta: 'SHA-256 enforced' },
        { label: 'Audit Events (30d)', value: '412', delta: 'Immutable log' },
      ],
      primaryTableTitle: 'Active Security & Integration Policies',
      rows: [
        {
          id: 'POL-01',
          title: 'Fail-Closed Single-Use Invitation Admission',
          owner: 'Security Admin',
          status: 'ENABLED',
          metric: '7-day expiry',
        },
        {
          id: 'POL-02',
          title: 'Two-Way GitHub Repository Synchronization',
          owner: 'DevOps Bot',
          status: 'ENABLED',
          metric: 'main branch',
        },
        {
          id: 'POL-03',
          title: 'Automated Daily Database Snapshot',
          owner: 'Data Engine',
          status: 'ENABLED',
          metric: 'Preview + Prod',
        },
      ],
      actionLabel: 'Configure Policy',
    },
  ];

  const screens: UIDesignScreen[] = rawScreens.map((s) => ({
    ...s,
    title: s.name.replace(/^\d+\.\s*/, ''),
    metrics: s.kpis,
    primaryActions: [s.actionLabel, 'Inspect Spec'],
    components: [
      s.primaryTableTitle,
      ...s.rows.map((r) => `${r.id}: ${r.title} (${r.status})`),
    ],
  }));

  return {
    ...preset,
    palette: {
      primary: preset.primaryColor,
      accent: preset.accentColor,
      background: preset.backgroundColor,
      surface: preset.surfaceColor,
      text: preset.textColor,
    },
    screens,
    pages: screens,
  };
}

export function synthesizeProductMeta(input: {
  projectName: string;
  shortName: string;
  prompt: string;
  uiMeta?: UIDesignMeta;
}): ProductMeta {
  const slug = input.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'omniflow-app';

  const primaryColor = input.uiMeta?.primaryColor || '#8E85FF';

  const initialTables: DatabaseTable[] = [
    {
      name: 'workflow_items',
      columns: [
        { name: 'id', type: 'TEXT', pk: true },
        { name: 'title', type: 'TEXT' },
        { name: 'category', type: 'TEXT' },
        { name: 'priority', type: 'TEXT' },
        { name: 'status', type: 'TEXT' },
        { name: 'owner', type: 'TEXT' },
        { name: 'sla_minutes', type: 'INTEGER' },
      ],
      rows: [
        {
          id: `${input.shortName}-101`,
          title: 'Automated intake classification & routing pipeline',
          category: 'AI Automation',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          owner: 'Sarah Chen',
          sla_minutes: 25,
        },
        {
          id: `${input.shortName}-102`,
          title: 'Knowledge Base RAG citation synthesizer',
          category: 'Core Intelligence',
          priority: 'CRITICAL',
          status: 'COMPLETED',
          owner: 'Alex Rivera',
          sla_minutes: 15,
        },
        {
          id: `${input.shortName}-103`,
          title: 'Real-time SLA breach alerting & webhook dispatch',
          category: 'Observability',
          priority: 'HIGH',
          status: 'TODO',
          owner: 'Marcus Vance',
          sla_minutes: 45,
        },
        {
          id: `${input.shortName}-104`,
          title: 'Role-based access control & audit log export',
          category: 'Security',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          owner: 'Elena Rostova',
          sla_minutes: 60,
        },
      ],
    },
    {
      name: 'automation_rules',
      columns: [
        { name: 'id', type: 'TEXT', pk: true },
        { name: 'rule_name', type: 'TEXT' },
        { name: 'trigger_event', type: 'TEXT' },
        { name: 'target_action', type: 'TEXT' },
        { name: 'enabled', type: 'BOOLEAN' },
      ],
      rows: [
        {
          id: 'RULE-01',
          rule_name: 'High-Priority Escalation',
          trigger_event: 'priority == CRITICAL',
          target_action: 'route_to_senior_specialist',
          enabled: true,
        },
        {
          id: 'RULE-02',
          rule_name: 'RAG Auto-Draft Response',
          trigger_event: 'confidence >= 0.90',
          target_action: 'attach_kb_citation_draft',
          enabled: true,
        },
      ],
    },
    {
      name: 'kpi_snapshots',
      columns: [
        { name: 'id', type: 'TEXT', pk: true },
        { name: 'metric_name', type: 'TEXT' },
        { name: 'metric_value', type: 'TEXT' },
        { name: 'recorded_at', type: 'TEXT' },
      ],
      rows: [
        {
          id: 'KPI-01',
          metric_name: 'SLA Compliance Rate',
          metric_value: '98.4%',
          recorded_at: new Date().toISOString().slice(0, 10),
        },
        {
          id: 'KPI-02',
          metric_name: 'Median Resolution Time',
          metric_value: '18 mins',
          recorded_at: new Date().toISOString().slice(0, 10),
        },
      ],
    },
  ];

  const files: ProductFile[] = [
    {
      path: 'src/App.tsx',
      language: 'tsx',
      content: `import React, { useState } from 'react';

export default function ${input.projectName.replace(/[^a-zA-Z0-9]/g, '') || 'OmniFlow'}App() {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
            ${input.shortName} · Spec-Driven Full-Stack Application
          </span>
          <h1 className="text-3xl font-bold mt-1">${input.projectName}</h1>
          <p className="text-sm text-slate-400 mt-1">${input.prompt}</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold">
          + New Workflow Item
        </button>
      </header>
    </div>
  );
}
`,
    },
    {
      path: 'src/api/routes.ts',
      language: 'ts',
      content: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    service: '${input.projectName}',
    key: '${input.shortName}',
    status: 'healthy',
    slaCompliance: 0.984,
    timestamp: new Date().toISOString(),
  });
}
`,
    },
    {
      path: 'prisma/schema.sql',
      language: 'sql',
      content: `-- ${input.projectName} (${input.shortName}) Relational Schema
CREATE TABLE workflow_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'TODO',
  owner TEXT NOT NULL,
  sla_minutes INTEGER DEFAULT 30
);

CREATE TABLE automation_rules (
  id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  target_action TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE
);
`,
    },
    {
      path: 'src/styles.css',
      language: 'css',
      content: `:root {
  --brand-primary: ${primaryColor};
  --surface-bg: #090812;
  --surface-card: #131124;
}

body {
  background-color: var(--surface-bg);
  color: #f8fafc;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}
`,
    },
    {
      path: 'package.json',
      language: 'json',
      content: JSON.stringify(
        {
          name: slug,
          version: '1.0.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
          },
          dependencies: {
            next: '^16.2.3',
            react: '^19.2.5',
            'lucide-react': '^0.454.0',
          },
        },
        null,
        2
      ),
    },
  ];

  const nowIso = new Date().toISOString();

  return {
    appTitle: input.projectName,
    heroTitle: input.projectName,
    heroSubtitle: input.prompt,
    primaryColor,
    ctaLabel: '+ Create Workflow Item',
    darkMode: true,
    files,
    previewDb: {
      tables: JSON.parse(JSON.stringify(initialTables)),
      sqlHistory: [
        {
          id: 'sql-init-1',
          query: 'SELECT * FROM workflow_items ORDER BY sla_minutes ASC;',
          status: 'SUCCESS',
          rowCount: 4,
          executedAt: nowIso,
        },
      ],
      lastSnapshotAt: nowIso,
    },
    productionDb: {
      tables: JSON.parse(JSON.stringify(initialTables)),
      sqlHistory: [
        {
          id: 'sql-prod-1',
          query: 'SELECT * FROM kpi_snapshots;',
          status: 'SUCCESS',
          rowCount: 2,
          executedAt: nowIso,
        },
      ],
      lastSnapshotAt: nowIso,
    },
    connectors: [
      {
        id: 'conn-openai',
        name: 'OpenAI GPT-4o / o3',
        category: 'AI & LLM',
        status: 'CONNECTED',
        envKey: 'OPENAI_API_KEY',
        envKeys: ['OPENAI_API_KEY'],
        previewConfigured: true,
        prodConfigured: true,
      },
      {
        id: 'conn-stripe',
        name: 'Stripe Billing & Webhooks',
        category: 'Payments',
        status: 'AVAILABLE',
        envKey: 'STRIPE_SECRET_KEY',
        envKeys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
        previewConfigured: true,
        prodConfigured: false,
      },
      {
        id: 'conn-perplexity',
        name: 'Perplexity Sonar Search',
        category: 'Search & Grounding',
        status: 'AVAILABLE',
        envKey: 'PERPLEXITY_API_KEY',
        envKeys: ['PERPLEXITY_API_KEY'],
        previewConfigured: false,
        prodConfigured: false,
      },
      {
        id: 'conn-elevenlabs',
        name: 'ElevenLabs Voice Synthesis',
        category: 'Audio & Voice',
        status: 'AVAILABLE',
        envKey: 'ELEVENLABS_API_KEY',
        envKeys: ['ELEVENLABS_API_KEY'],
        previewConfigured: false,
        prodConfigured: false,
      },
      {
        id: 'conn-resend',
        name: 'Resend Transactional Email',
        category: 'Messaging',
        status: 'CONNECTED',
        envKey: 'RESEND_API_KEY',
        envKeys: ['RESEND_API_KEY'],
        previewConfigured: true,
        prodConfigured: true,
      },
    ],
    domains: [
      {
        id: 'dom-default',
        domain: `${slug}.preview.omniflowai.com`,
        cnameTarget: 'cname.omniflowai.com',
        status: 'VERIFIED',
        isPrimary: true,
        sslStatus: 'ACTIVE',
      },
    ],
    gitConfig: {
      provider: 'GITHUB',
      repoUrl: `https://github.com/omniflow-org/${slug}`,
      branch: 'main',
      lastCommitHash: 'a8f4c21',
      lastSyncAt: nowIso,
    },
    deployments: [
      {
        id: 'dep-preview-1',
        environment: 'PREVIEW',
        version: 'v1.0.0-preview',
        status: 'READY',
        url: `/preview`,
        createdAt: nowIso,
        logs: [
          `[build] Synchronizing spec from PRD V1 & UI/UX Design...`,
          `[schema] Verified 3 relational tables (workflow_items, automation_rules, kpi_snapshots)`,
          `[compile] Compiled 5 application modules in 1.4s (0 errors)`,
          `[ready] Preview sandbox active and serving live traffic`,
        ],
      },
    ],
  };
}

export function executeVirtualSql(
  dbState: ProductMeta['previewDb'],
  rawQuery: string
): {
  updatedDb: ProductMeta['previewDb'];
  columns: string[];
  rows: Record<string, unknown>[];
  message: string;
} {
  const query = rawQuery.trim();
  const normalized = query.replace(/\s+/g, ' ').trim();
  const upper = normalized.toUpperCase();
  const nextDb: ProductMeta['previewDb'] = JSON.parse(JSON.stringify(dbState));

  // SELECT * FROM <table>
  const selectMatch = normalized.match(/SELECT\s+.+?\s+FROM\s+([a-zA-Z0-9_]+)/i);
  if (upper.startsWith('SELECT') && selectMatch) {
    const tableName = selectMatch[1];
    const table = nextDb.tables.find(
      (t) => t.name.toLowerCase() === tableName.toLowerCase()
    );
    if (!table) {
      throw new Error(`Table "${tableName}" does not exist.`);
    }
    let resultRows = [...table.rows];
    const whereMatch = normalized.match(
      /WHERE\s+([a-zA-Z0-9_]+)\s*=\s*'([^']*)'/i
    );
    if (whereMatch) {
      const [, col, val] = whereMatch;
      resultRows = resultRows.filter(
        (r) => String(r[col] ?? '').toLowerCase() === val.toLowerCase()
      );
    }
    nextDb.sqlHistory.unshift({
      id: `sql-${Date.now()}`,
      query,
      status: 'SUCCESS',
      rowCount: resultRows.length,
      executedAt: new Date().toISOString(),
    });
    return {
      updatedDb: nextDb,
      columns: table.columns.map((c) => c.name),
      rows: resultRows,
      message: `Returned ${resultRows.length} row(s) from ${table.name}.`,
    };
  }

  // INSERT INTO <table> (<cols>) VALUES (<vals>)
  const insertMatch = normalized.match(
    /INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i
  );
  if (upper.startsWith('INSERT') && insertMatch) {
    const [, tableName, colsRaw, valsRaw] = insertMatch;
    const table = nextDb.tables.find(
      (t) => t.name.toLowerCase() === tableName.toLowerCase()
    );
    if (!table) {
      throw new Error(`Table "${tableName}" does not exist.`);
    }
    const cols = colsRaw.split(',').map((c) => c.trim());
    const vals = valsRaw
      .split(',')
      .map((v) => v.trim().replace(/^'|'$/g, ''));
    const newRow: Record<string, string | number | boolean> = {};
    cols.forEach((col, i) => {
      const rawVal = vals[i] ?? '';
      if (rawVal === 'true' || rawVal === 'TRUE') newRow[col] = true;
      else if (rawVal === 'false' || rawVal === 'FALSE') newRow[col] = false;
      else if (!Number.isNaN(Number(rawVal)) && rawVal !== '')
        newRow[col] = Number(rawVal);
      else newRow[col] = rawVal;
    });
    table.rows.unshift(newRow);
    nextDb.sqlHistory.unshift({
      id: `sql-${Date.now()}`,
      query,
      status: 'SUCCESS',
      rowCount: 1,
      executedAt: new Date().toISOString(),
    });
    return {
      updatedDb: nextDb,
      columns: table.columns.map((c) => c.name),
      rows: table.rows,
      message: `Inserted 1 row into ${table.name}.`,
    };
  }

  // UPDATE <table> SET <col> = '<val>' WHERE <col2> = '<val2>'
  const updateMatch = normalized.match(
    /UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+([a-zA-Z0-9_]+)\s*=\s*'([^']*)'(?:\s+WHERE\s+([a-zA-Z0-9_]+)\s*=\s*'([^']*)')?/i
  );
  if (upper.startsWith('UPDATE') && updateMatch) {
    const [, tableName, setCol, setVal, whereCol, whereVal] = updateMatch;
    const table = nextDb.tables.find(
      (t) => t.name.toLowerCase() === tableName.toLowerCase()
    );
    if (!table) {
      throw new Error(`Table "${tableName}" does not exist.`);
    }
    let updatedCount = 0;
    table.rows = table.rows.map((r) => {
      if (!whereCol || String(r[whereCol]) === whereVal) {
        updatedCount += 1;
        return { ...r, [setCol]: setVal };
      }
      return r;
    });
    nextDb.sqlHistory.unshift({
      id: `sql-${Date.now()}`,
      query,
      status: 'SUCCESS',
      rowCount: updatedCount,
      executedAt: new Date().toISOString(),
    });
    return {
      updatedDb: nextDb,
      columns: table.columns.map((c) => c.name),
      rows: table.rows,
      message: `Updated ${updatedCount} row(s) in ${table.name}.`,
    };
  }

  // CREATE TABLE <name> (...)
  const createMatch = normalized.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\((.+)\)/i
  );
  if (upper.startsWith('CREATE TABLE') && createMatch) {
    const [, tableName, colsDef] = createMatch;
    const columns = colsDef.split(',').map((part) => {
      const tokens = part.trim().split(/\s+/);
      return {
        name: tokens[0] || 'id',
        type: (tokens[1] || 'TEXT').toUpperCase(),
        pk: part.toUpperCase().includes('PRIMARY KEY'),
      };
    });
    nextDb.tables.push({
      name: tableName,
      columns,
      rows: [],
    });
    nextDb.sqlHistory.unshift({
      id: `sql-${Date.now()}`,
      query,
      status: 'SUCCESS',
      rowCount: 0,
      executedAt: new Date().toISOString(),
    });
    return {
      updatedDb: nextDb,
      columns: columns.map((c) => c.name),
      rows: [],
      message: `Created table ${tableName}.`,
    };
  }

  // Default fallback: return first table rows
  const firstTable = nextDb.tables[0];
  nextDb.sqlHistory.unshift({
    id: `sql-${Date.now()}`,
    query,
    status: 'EXECUTED',
    rowCount: firstTable ? firstTable.rows.length : 0,
    executedAt: new Date().toISOString(),
  });
  return {
    updatedDb: nextDb,
    columns: firstTable ? firstTable.columns.map((c) => c.name) : [],
    rows: firstTable ? firstTable.rows : [],
    message: `Executed statement against ${firstTable?.name || 'database'}.`,
  };
}

export function synthesizeDevPlanMeta(input: {
  projectName: string;
  shortName: string;
  roles: string[];
}): DevPlanMeta {
  const roles =
    input.roles.length > 0
      ? input.roles
      : ['Product Manager', 'UI/UX Designer', 'Full-Stack Engineer', 'QA Engineer'];

  const now = new Date();
  const sprint1Start = now.toISOString().slice(0, 10);
  const sprint1End = new Date(now.getTime() + 14 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const sprint2Start = sprint1End;
  const sprint2End = new Date(now.getTime() + 28 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  return {
    roles,
    scheduleConfirmed: false,
    epics: [
      {
        id: `${input.shortName}-EPIC-1`,
        name: `Epic 1: Core Intake, Triage & Spec Foundation`,
        description: `Establish data schema, role-based access control, and automated intake routing for ${input.projectName}.`,
        summary: `Establish data schema, role-based access control, and automated intake routing for ${input.projectName}.`,
        storyPoint: 13,
        stories: [
          {
            id: `${input.shortName}-101`,
            name: 'Design & lock core relational schema and API contracts',
            role: roles.find((r) => r.includes('Engineer')) || roles[0],
            storyPoint: 5,
            priority: 'HIGH',
            sprint: 'Sprint 1: Core Architecture & Intake',
            acceptanceCriteria: [
              'SQLite & PostgreSQL migrations run cleanly',
              'API endpoints enforce session & role authorization',
            ],
            tasks: [
              {
                id: `${input.shortName}-T1`,
                name: 'Implement Prisma models & migration scripts',
                role: roles.find((r) => r.includes('Engineer')) || roles[0],
                storyPoint: 3,
              },
              {
                id: `${input.shortName}-T2`,
                name: 'Build REST route handlers with validation',
                role: roles.find((r) => r.includes('Engineer')) || roles[0],
                storyPoint: 2,
              },
            ],
          },
          {
            id: `${input.shortName}-102`,
            name: 'Build responsive Triage & Priority Queue interface',
            role: roles.find((r) => r.includes('Designer')) || roles[0],
            storyPoint: 8,
            priority: 'HIGH',
            sprint: 'Sprint 1: Core Architecture & Intake',
            acceptanceCriteria: [
              'Supports Desktop, Tablet, and Mobile breakpoints',
              'Displays live SLA countdown and confidence badges',
            ],
            tasks: [
              {
                id: `${input.shortName}-T3`,
                name: 'Create interactive queue table & filter bar',
                role: roles.find((r) => r.includes('Designer')) || roles[0],
                storyPoint: 5,
              },
              {
                id: `${input.shortName}-T4`,
                name: 'Wire 1-click category override and audit logging',
                role: roles.find((r) => r.includes('Engineer')) || roles[0],
                storyPoint: 3,
              },
            ],
          },
        ],
      },
      {
        id: `${input.shortName}-EPIC-2`,
        name: `Epic 2: Knowledge Base RAG, SLA Telemetry & Production Launch`,
        description: `Deliver grounded AI citations, executive analytics snapshots, and production deployment verification.`,
        summary: `Deliver grounded AI citations, executive analytics snapshots, and production deployment verification.`,
        storyPoint: 13,
        stories: [
          {
            id: `${input.shortName}-103`,
            name: 'Integrate Knowledge Base chunking & grounded RAG copilot',
            role: roles.find((r) => r.includes('Engineer')) || roles[0],
            storyPoint: 8,
            priority: 'HIGH',
            sprint: 'Sprint 2: AI Copilot, Telemetry & Launch',
            acceptanceCriteria: [
              'Uploaded documents are indexed into searchable chunks',
              'Responses cite exact source files and chunk indices',
            ],
            tasks: [
              {
                id: `${input.shortName}-T5`,
                name: 'Build document chunking & retrieval pipeline',
                role: roles.find((r) => r.includes('Engineer')) || roles[0],
                storyPoint: 5,
              },
              {
                id: `${input.shortName}-T6`,
                name: 'Execute E2E regression & security audit suite',
                role: roles.find((r) => r.includes('QA')) || roles[0],
                storyPoint: 3,
              },
            ],
          },
          {
            id: `${input.shortName}-104`,
            name: 'Executive SLA analytics & weekly status reporting',
            role: roles.find((r) => r.includes('Product')) || roles[0],
            storyPoint: 5,
            priority: 'MEDIUM',
            sprint: 'Sprint 2: AI Copilot, Telemetry & Launch',
            acceptanceCriteria: [
              'Displays story point burnup and SLA compliance rate',
              'Exports structured weekly status report',
            ],
            tasks: [
              {
                id: `${input.shortName}-T7`,
                name: 'Build reporting snapshot & weekly report generator',
                role: roles.find((r) => r.includes('Product')) || roles[0],
                storyPoint: 5,
              },
            ],
          },
        ],
      },
    ],
    sprints: [
      {
        id: 'sprint-1',
        name: 'Sprint 1: Core Architecture & Intake',
        goal: 'Lock data model, RBAC admission, and responsive triage queue.',
        startDate: sprint1Start,
        endDate: sprint1End,
        totalStoryPoints: 13,
      },
      {
        id: 'sprint-2',
        name: 'Sprint 2: AI Copilot, Telemetry & Launch',
        goal: 'Complete Knowledge Base RAG citations, SLA analytics, and production release.',
        startDate: sprint2Start,
        endDate: sprint2End,
        totalStoryPoints: 13,
      },
    ],
    milestones: [
      {
        id: 'ms-1',
        name: 'Milestone 1: Spec Lock & Interactive Prototype',
        targetDate: sprint1End,
        deliverables: ['Approved PRD V1', 'Multi-Page UI/UX Wireframe', 'Core Schema & Auth'],
      },
      {
        id: 'ms-2',
        name: 'Milestone 2: Production Full-Stack Release',
        targetDate: sprint2End,
        deliverables: ['Knowledge Base RAG Studio', 'SLA Analytics Dashboard', 'Verified Production Deployment'],
      },
    ],
  };
}

export function synthesizeSupportingDocContent(input: {
  type: 'TECH_DESIGN' | 'QA_PLAN' | 'RELEASE_PLAN';
  projectName: string;
  shortName: string;
  prompt: string;
}): string {
  if (input.type === 'TECH_DESIGN') {
    return `# Technical Design Document (TDD) - ${input.projectName} (${input.shortName})

## 1. Architecture Overview
${input.projectName} is architected as a modular full-stack web application backed by Next.js App Router, TypeScript, and a dual-compatible relational database layer (SQLite for local development and PostgreSQL for production).

## 2. Core Data Model & Entities
- **Organization & Users**: Invite-only account admission with \`ADMIN\`, \`MEMBER\`, and \`VIEWER\` RBAC roles and SHA-256 single-use invitation tokens.
- **Workflow Items (\`workflow_items\`)**: Stores prioritized operational items, SLA countdowns, and AI classification metadata.
- **Automation Rules (\`automation_rules\`)**: Declarative event-condition-action triggers.
- **Knowledge Base & Chunks**: Stores uploaded reference documents split into overlapping semantic text chunks for grounded retrieval.

## 3. API Contracts & Security
- All mutating endpoints enforce session validation, role checks, and write immutable entries to \`AuditLog\`.
- Environment variables and database connections are strictly separated between \`Preview\` and \`Production\`.
`;
  }

  if (input.type === 'QA_PLAN') {
    return `# QA & Test Plan - ${input.projectName} (${input.shortName})

## 1. Verification Strategy
- **Unit & Domain Tests**: Validate invite-only token hashing, single-use consumption, expiration, rotation, revocation, and SQL execution engine.
- **Integration API Tests**: Verify CRUD lifecycle across Projects, Documents, Cross-Document Sync, Knowledge Base RAG, and Sprint Backlog.
- **Playwright E2E Suite**: Verify Desktop (\`1440x900\`) and Mobile (\`390x844\`) user journeys end-to-end.

## 2. Test Case Matrix
| ID | Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| QA-01 | Uninvited registration attempt | Rejected with \`403 ACCOUNT_INVITATION_REQUIRED\` | PASS |
| QA-02 | Single-use invitation redemption | Creates user account once; second use rejected with \`409\` | PASS |
| QA-03 | PRD update downstream sync | Creates \`PENDING\` sync event on UI/UX Design & Product | PASS |
| QA-04 | Product Preview & SQL execution | Executes \`SELECT\` / \`INSERT\` against isolated Preview DB | PASS |
`;
  }

  return `# Release & Rollout Plan - ${input.projectName} (${input.shortName})

## 1. Release Phases
1. **Phase 1 — Internal Preview Sandbox**: Validate PRD V1, UI/UX wireframes, and Preview database migrations with internal stakeholders.
2. **Phase 2 — Invite-Only Cohort Rollout**: Issue single-use expiring invitations to pilot operators and monitor SLA telemetry.
3. **Phase 3 — General Production Promotion**: Bind primary custom domain, verify SSL/TLS, and promote build artifact to Production.

## 2. Rollback & Recovery Procedure
- Database snapshots are captured automatically prior to every schema promotion.
- Use the **Product -> Database -> Reset / Snapshot** or **Version History -> Revert** controls for instant 1-click rollback.
`;
}

export function chunkTextContent(content: string, chunkSize = 500): string[] {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const paragraphs = normalized.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length <= chunkSize) {
      current = current ? `${current}\n\n${para}` : para;
    } else {
      if (current) chunks.push(current.trim());
      if (para.length <= chunkSize) {
        current = para;
      } else {
        for (let i = 0; i < para.length; i += chunkSize) {
          chunks.push(para.slice(i, i + chunkSize).trim());
        }
        current = '';
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export function answerWithKnowledgeBase(input: {
  kbName: string;
  question: string;
  files: { fileName: string; chunksJson: string; content: string }[];
}): {
  answer: string;
  citations: { fileName: string; chunkIndex: number; excerpt: string }[];
} {
  const queryTerms = input.question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  const scoredChunks: {
    fileName: string;
    chunkIndex: number;
    text: string;
    score: number;
  }[] = [];

  for (const file of input.files) {
    let chunks: string[] = [];
    try {
      chunks = JSON.parse(file.chunksJson || '[]');
    } catch {
      chunks = [];
    }
    if (chunks.length === 0 && file.content) {
      chunks = chunkTextContent(file.content);
    }
    chunks.forEach((chunkText, idx) => {
      const lower = chunkText.toLowerCase();
      let score = 1;
      for (const term of queryTerms) {
        if (lower.includes(term)) score += 5;
      }
      scoredChunks.push({
        fileName: file.fileName,
        chunkIndex: idx + 1,
        text: chunkText,
        score,
      });
    });
  }

  scoredChunks.sort((a, b) => b.score - a.score);
  const top = scoredChunks.slice(0, 3);

  if (top.length === 0) {
    return {
      answer: `I searched **${input.kbName}**, but no documents have been uploaded yet. Upload markdown, text, CSV, or code files above so I can ground my answers with exact citations.`,
      citations: [],
    };
  }

  const citations = top.map((c) => ({
    fileName: c.fileName,
    chunkIndex: c.chunkIndex,
    excerpt: c.text.slice(0, 220),
  }));

  const synthesized = [
    `Based on the indexed documents in **${input.kbName}**, here is the grounded answer to *"${input.question}"*:`,
    '',
    ...top.map(
      (c, i) =>
        `${i + 1}. **From \`${c.fileName}\` (Chunk #${c.chunkIndex})**: ${c.text}`
    ),
  ].join('\n');

  return {
    answer: synthesized,
    citations,
  };
}

export function generateFreeToolOutput(input: {
  tool:
    | 'prd-generator'
    | 'app-idea-generator'
    | 'ui-generator'
    | 'landing-page-generator'
    | 'brand-name-generator'
    | 'app-name-generator';
  prompt: string;
}): {
  title: string;
  summary: string;
  markdown: string;
  highlights: string[];
} {
  const topic = input.prompt.trim() || 'AI-Powered B2B Workflow Platform';

  switch (input.tool) {
    case 'prd-generator': {
      const prd = synthesizePRDContent({
        projectName: topic.slice(0, 48),
        prompt: topic,
      });
      return {
        title: `Generated Living PRD: ${topic.slice(0, 48)}`,
        summary:
          'Complete 5-section Product Requirement Document with Personas, KPIs, and Epics.',
        markdown: prd.content,
        highlights: [
          'Problem & Opportunity locked',
          '4 User Personas defined',
          'Quantifiable 6-month KPIs',
          'Epics & Acceptance Criteria ready for UI/UX generation',
        ],
      };
    }
    case 'app-idea-generator':
      return {
        title: `3 Validated Product Concepts for "${topic}"`,
        summary:
          'High-margin SaaS & AI product opportunities with ICP, monetization, and MVP scope.',
        markdown: `# AI Product Ideas for: ${topic}

## Concept 1: Autonomous Triage & Workflow Copilot
- **Target ICP**: Mid-market operations teams (20–250 seats)
- **Core Wedge**: Automated intake classification + grounded Knowledge Base RAG answers
- **Pricing Model**: $75/seat/month + usage-based automation credits

## Concept 2: Real-Time SLA & Compliance Radar
- **Target ICP**: Enterprise engineering & support leaders
- **Core Wedge**: Predictive SLA breach warnings 30 minutes before deadline with 1-click Slack/Jira escalation
- **Pricing Model**: Tiered platform subscription ($200/mo Scale tier)

## Concept 3: Self-Service Client Portal & Live Status Hub
- **Target ICP**: Agencies and B2B service providers
- **Core Wedge**: Branded client workspace with live milestone tracking and automated weekly status reports`,
        highlights: ['Validated B2B ICP', 'Clear Monetization Model', 'Ready for 1-Click PRD Creation'],
      };
    case 'ui-generator':
      return {
        title: `Multi-Page UI/UX Wireframe Spec: ${topic}`,
        summary:
          'Design tokens, component hierarchy, and 4 responsive screen layouts.',
        markdown: `# UI/UX Design Specification: ${topic}

## 1. Visual Design Tokens
- **Primary Accent**: \`#8E85FF\` (Electric Violet)
- **Surface Hierarchy**: \`#06050A\` (Obsidian Canvas) / \`#121024\` (Elevated Card)
- **Typography**: Plus Jakarta Sans (UI) + JetBrains Mono (Telemetry)

## 2. Screen Architecture
1. **Command Dashboard**: 4 KPI metric cards + filterable priority queue table + Joy AI sidebar
2. **Interactive Detail Studio**: Split-pane editor with live preview and version pill switcher
3. **Analytics & Burnup**: Sprint velocity chart and SLA compliance breakdown`,
        highlights: ['Desktop, Tablet & Mobile Ready', '5 Switchable Design Themes', 'WCAG AA Contrast Verified'],
      };
    case 'landing-page-generator':
      return {
        title: `High-Conversion Landing Page Blueprint: ${topic}`,
        summary:
          'Hero positioning, 3-step value loop, social proof, and pricing matrix copy.',
        markdown: `# Landing Page Copy & Structure: ${topic}

## Hero Section
- **Headline**: *Plan, design, and ship ${topic} — in one unified system.*
- **Subheadline**: Replace fragmented docs, wireframes, and boilerplate with a living spec-driven workflow.
- **Primary CTA**: Start Building Free →

## 3-Step Value Loop
1. **01 Lock Your Spec**: Turn natural language into a structured PRD.
2. **02 Preview Your UX**: Generate multi-page wireframes across 5 design styles.
3. **03 Ship Full-Stack**: Edit code, query your database, and deploy in 1 click.`,
        highlights: ['Conversion-Optimized Hero', '3-Step Product Loop', 'Objection-Handling FAQ'],
      };
    case 'brand-name-generator':
      return {
        title: `Brand Identity & Naming Candidates for "${topic}"`,
        summary: 'Memorable, domain-friendly brand names with positioning taglines.',
        markdown: `# Brand Name Candidates: ${topic}

1. **Omniflow** — *One system. Always in sync.* ( Modern, authoritative, unified )
2. **VectraFlow** — *Precision velocity from spec to production.*
3. **SpecPulse** — *Living specifications that build themselves.*
4. **AetherWorks** — *Autonomous product engineering for modern teams.*
5. **KinetixAI** — *Turn product intent into deployed software.*`,
        highlights: ['.com / .ai Friendly', 'Distinctive Phonetics', 'Enterprise Positioning'],
      };
    case 'app-name-generator':
    default:
      return {
        title: `Application Name & Package Identifiers for "${topic}"`,
        summary: 'Short names, CLI slugs, and project key prefixes.',
        markdown: `# Application Names & Project Keys: ${topic}

| App Name | Project Key | Slug | Positioning |
| :--- | :--- | :--- | :--- |
| **FlowHub** | \`FH10\` | \`flowhub-app\` | Unified operational command center |
| **PulseDesk** | \`PD24\` | \`pulsedesk-ai\` | Real-time SLA & triage workspace |
| **NexusSpec** | \`NS42\` | \`nexusspec-studio\` | Spec-driven engineering studio |
| **VertexOps** | \`VO18\` | \`vertexops-cloud\` | Automated workflow orchestration |`,
        highlights: ['Short Project Keys Included', 'GitHub Repo Slugs Ready', 'Subdomain Compatible'],
      };
  }
}

export function runFreeAiTool(input: { toolId: string; input: string }) {
  const validTools = [
    'prd-generator',
    'app-idea-generator',
    'ui-generator',
    'landing-page-generator',
    'brand-name-generator',
    'app-name-generator',
  ] as const;
  type ToolKey = (typeof validTools)[number];
  const toolKey: ToolKey = validTools.includes(input.toolId as ToolKey)
    ? (input.toolId as ToolKey)
    : 'prd-generator';

  const generated = generateFreeToolOutput({
    tool: toolKey,
    prompt: input.input,
  });

  return {
    ...generated,
    outputMarkdown: generated.markdown,
  };
}

