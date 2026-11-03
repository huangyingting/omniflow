// Client- and server-safe catalog of official OmniFlow templates, pricing tiers, free tools, and docs.

export interface ProductShowcaseTemplate {
  id: string;
  name: string;
  category: 'PRODUCT';
  tagline: string;
  description: string;
  badge: string;
  accentColor: string;
  prompt: string;
  promptText: string;
  highlights: string[];
  metrics: string[];
}

export interface OfficialDocumentTemplate {
  id: string;
  slug: string;
  name: string;
  category: 'DOCUMENT';
  type:
    | 'PRD'
    | 'TECH_DESIGN'
    | 'DEVELOPMENT_PLAN'
    | 'QA_PLAN'
    | 'BUSINESS_STRATEGY'
    | 'RELEASE_NOTE';
  description: string;
  promptInstructions: string;
  promptText: string;
  sampleOutput: string;
  content: string;
}

const RAW_PRODUCT_SHOWCASE_TEMPLATES: Omit<
  ProductShowcaseTemplate,
  'promptText' | 'metrics'
>[] = [
  {
    id: 'tpl-prod-modern-saas',
    name: 'Modern SaaS Platform',
    category: 'PRODUCT',
    tagline: 'Multi-tenant subscription workspace with usage analytics & billing',
    description:
      'Complete B2B SaaS starter featuring multi-workspace onboarding, usage metering, role-based access control, and real-time cohort analytics.',
    badge: 'SaaS & B2B',
    accentColor: '#8E85FF',
    prompt:
      'Build a Modern B2B SaaS Platform with multi-tenant workspace management, usage metering dashboard, subscription tier billing, and webhook event logs.',
    highlights: ['Multi-Tenant Auth', 'Usage Metering', 'Billing Portal', 'Cohort Analytics'],
  },
  {
    id: 'tpl-prod-collab-portal',
    name: 'Enterprise Collaboration Portal',
    category: 'PRODUCT',
    tagline: 'Cross-functional project rooms, document approvals, and SLA tracking',
    description:
      'Unified enterprise collaboration hub for product, design, and engineering teams with approval workflows, live activity streams, and milestone gates.',
    badge: 'Enterprise',
    accentColor: '#38BDF8',
    prompt:
      'Build an Enterprise Collaboration Portal with cross-functional project rooms, document approval workflows, SLA tracking, and executive status rollups.',
    highlights: ['Approval Gates', 'Team Rooms', 'SLA Alerts', 'Audit Trail'],
  },
  {
    id: 'tpl-prod-data-intelligence',
    name: 'Data Intelligence Hub',
    category: 'PRODUCT',
    tagline: 'AI-powered KPI telemetry, anomaly detection, and natural-language SQL',
    description:
      'Executive BI & data observability platform allowing teams to query operational metrics in natural language, monitor pipeline health, and configure anomaly alerts.',
    badge: 'Data & AI',
    accentColor: '#10B981',
    prompt:
      'Build a Data Intelligence Hub with real-time KPI telemetry charts, automated anomaly detection alerts, and a natural-language to SQL query explorer.',
    highlights: ['NL-to-SQL Console', 'Anomaly Detection', 'Live KPI Boards', 'Data Lineage'],
  },
  {
    id: 'tpl-prod-fintech-control',
    name: 'Financial Control Center',
    category: 'PRODUCT',
    tagline: 'Corporate spend management, invoice reconciliation, and cashflow forecasting',
    description:
      'Real-time treasury and corporate expense control center with multi-level spend approvals, automated ledger categorization, and 12-month runway modeling.',
    badge: 'FinTech',
    accentColor: '#F59E0B',
    prompt:
      'Build a Financial Control Center with corporate card spend limits, automated invoice reconciliation, approval policies, and cashflow runway forecasting.',
    highlights: ['Spend Policies', 'Ledger Reconciliation', 'Runway Forecast', 'Audit Export'],
  },
  {
    id: 'tpl-prod-dev-studio',
    name: 'Developer Workflow Studio',
    category: 'PRODUCT',
    tagline: 'API gateway catalog, deployment pipelines, and incident response',
    description:
      'Internal developer portal (IDP) for engineering organizations to catalog microservices, monitor deployment velocity, and coordinate on-call incidents.',
    badge: 'DevTools',
    accentColor: '#6366F1',
    prompt:
      'Build a Developer Workflow Studio with microservice catalog, deployment pipeline status, DORA velocity metrics, and incident response runbooks.',
    highlights: ['Service Catalog', 'DORA Metrics', 'Incident Triage', 'Env Promotion'],
  },
  {
    id: 'tpl-prod-commerce-engine',
    name: 'Digital Commerce Engine',
    category: 'PRODUCT',
    tagline: 'Omnichannel inventory, dynamic pricing rules, and order fulfillment',
    description:
      'High-conversion digital commerce operations suite featuring real-time SKU inventory, promotional rule builder, customer LTV segmentation, and fulfillment tracking.',
    badge: 'E-Commerce',
    accentColor: '#EC4899',
    prompt:
      'Build a Digital Commerce Engine with real-time SKU inventory tracking, dynamic promotional pricing rules, customer LTV segments, and order fulfillment.',
    highlights: ['SKU Inventory', 'Dynamic Pricing', 'Order Pipeline', 'Customer LTV'],
  },
  {
    id: 'tpl-prod-learning-academy',
    name: 'Learning & Growth Academy',
    category: 'PRODUCT',
    tagline: 'Interactive curriculum builder, AI tutor assessments, and certifications',
    description:
      'Cohort-based learning management system (LMS) with modular course authoring, AI-graded skill assessments, learner progress analytics, and credential issuance.',
    badge: 'EdTech',
    accentColor: '#14B8A6',
    prompt:
      'Build a Learning & Growth Academy LMS with interactive course authoring, AI tutor skill assessments, cohort progress analytics, and certification badges.',
    highlights: ['Course Builder', 'AI Skill Checks', 'Cohort Tracking', 'Certificates'],
  },
  {
    id: 'tpl-prod-productivity-suite',
    name: 'Team Productivity Suite',
    category: 'PRODUCT',
    tagline: 'OKR goal alignment, sprint rituals, and automated daily standups',
    description:
      'All-in-one operational rhythm platform connecting company OKRs directly to weekly sprint deliverables, async standup check-ins, and blocker escalation.',
    badge: 'Productivity',
    accentColor: '#8B5CF6',
    prompt:
      'Build a Team Productivity Suite with quarterly OKR alignment, async daily standup check-ins, sprint ritual templates, and blocker escalation.',
    highlights: ['OKR Tree', 'Async Standups', 'Sprint Rituals', 'Blocker Radar'],
  },
  {
    id: 'tpl-prod-booking-marketplace',
    name: 'Service Booking Marketplace',
    category: 'PRODUCT',
    tagline: 'Provider scheduling, escrow payouts, and verified client reviews',
    description:
      'Two-sided service marketplace with calendar availability sync, tiered service packages, automated booking confirmations, and provider payout ledgers.',
    badge: 'Marketplace',
    accentColor: '#06B6D4',
    prompt:
      'Build a Service Booking Marketplace with provider availability calendars, tiered service packages, booking checkout, and provider payout ledgers.',
    highlights: ['Smart Calendar', 'Service Packages', 'Payout Ledger', 'Verified Reviews'],
  },
  {
    id: 'tpl-prod-content-studio',
    name: 'Content Publishing Studio',
    category: 'PRODUCT',
    tagline: 'Editorial calendar, multi-channel AI drafting, and SEO performance',
    description:
      'Collaborative editorial & content operations platform with multi-stage review pipelines, brand-voice AI drafting, SEO scorecards, and distribution analytics.',
    badge: 'Media & AI',
    accentColor: '#F43F5E',
    prompt:
      'Build a Content Publishing Studio with editorial calendar kanban, brand-voice AI article drafting, SEO optimization scorecards, and channel analytics.',
    highlights: ['Editorial Kanban', 'Brand Voice AI', 'SEO Scorecard', 'Channel Analytics'],
  },
];

export const PRODUCT_SHOWCASE_TEMPLATES: ProductShowcaseTemplate[] =
  RAW_PRODUCT_SHOWCASE_TEMPLATES.map((tpl) => ({
    ...tpl,
    promptText: tpl.prompt,
    metrics: tpl.highlights,
  }));

const RAW_OFFICIAL_DOCUMENT_TEMPLATES: Omit<
  OfficialDocumentTemplate,
  'slug' | 'promptText' | 'content'
>[] = [
  {
    id: 'tpl-doc-generic-prd',
    name: 'Generic PRD Document',
    category: 'DOCUMENT',
    type: 'PRD',
    description:
      'A standard PRD template for building new software products. It includes information such as problem, opportunity, requirements, stories etc.',
    promptInstructions:
      'Structure the PRD with: 1. Problem & Opportunity, 2. Target Audience & User Persona, 3. Metrics and Goals, 4. Epics & User Stories with Acceptance Criteria, 5. Functional & Non-Functional Requirements, 6. Risks & Mitigations.',
    sampleOutput:
      '# Product Requirement Document (PRD)\n\n## Problem & Opportunity\nDefine the core customer pain point and market opportunity.\n\n## Target Audience & User Persona\nIdentify primary user segments and decision makers.\n\n## Metrics and Goals\nQuantifiable KPIs for 3, 6, and 12 months.\n\n## Epics & User Stories\nDetailed user stories with testable acceptance criteria.',
  },
  {
    id: 'tpl-doc-dev-task-breakdown',
    name: 'Development Task Breakdown',
    category: 'DOCUMENT',
    type: 'DEVELOPMENT_PLAN',
    description:
      'A detailed breakdown of development tasks based on PRD and technical design document with story estimation. Please note you will have to link the actual PRD when using this template.',
    promptInstructions:
      'Break down the PRD epics into engineering Epics, User Stories, and granular Tasks assigned by role specialty with story point estimates and sprint allocation.',
    sampleOutput:
      '# Development Task Breakdown\n\n## Sprint 1: Core Architecture & Data Layer\n- Epic 1: Authentication & Workspace Setup (8 pts)\n- Epic 2: Core Domain API & UI Shell (13 pts)',
  },
  {
    id: 'tpl-doc-generic-tech-design',
    name: 'Generic Technical Design',
    category: 'DOCUMENT',
    type: 'TECH_DESIGN',
    description:
      'A common template for technical design doc for simple engineering systems. Please note you will have to link the actual PRD when using this template.',
    promptInstructions:
      'Produce an engineering RFC / Technical Design covering System Architecture, Data Model & Schema, API Contracts, Security & Authorization, Scalability, and Observability.',
    sampleOutput:
      '# Technical Design Document (TDD)\n\n## 1. System Architecture\n## 2. Relational Data Model\n## 3. REST API Contracts\n## 4. Security, RBAC & Audit Logging',
  },
  {
    id: 'tpl-doc-generic-qa-plan',
    name: 'Generic QA / Test Plan',
    category: 'DOCUMENT',
    type: 'QA_PLAN',
    description:
      'A common template for creating QA / Test plan for product development. It includes test cases and acceptance criteria for a product.',
    promptInstructions:
      'Generate a comprehensive QA & Test Plan including Test Strategy, Unit/Integration/E2E Test Matrix, Security & Edge Case Scenarios, and Release Sign-off Criteria.',
    sampleOutput:
      '# QA & Test Plan\n\n## 1. Test Scope & Strategy\n## 2. Functional E2E Test Matrix\n## 3. Edge Cases & Negative Testing\n## 4. Release Readiness Sign-Off',
  },
  {
    id: 'tpl-doc-business-strategy',
    name: 'Business Strategy',
    category: 'DOCUMENT',
    type: 'BUSINESS_STRATEGY',
    description:
      'A common template to define high level business strategy including mission/vision statement, target market etc.',
    promptInstructions:
      'Define Mission & Vision, Market Sizing (TAM/SAM/SOM), Competitive Differentiation, Go-To-Market Strategy, and Pricing & Packaging.',
    sampleOutput:
      '# Business Strategy & Go-To-Market\n\n## 1. Vision & Strategic Positioning\n## 2. Target Market & ICP\n## 3. Competitive Moat\n## 4. Pricing & Packaging Tiers',
  },
  {
    id: 'tpl-doc-release-note',
    name: 'Release Note',
    category: 'DOCUMENT',
    type: 'RELEASE_NOTE',
    description:
      'A simple template to create a release email for communicating with users about the features shipped.',
    promptInstructions:
      'Draft customer-facing Release Notes highlighting New Capabilities, UX Improvements, Performance & Security Updates, and Migration Steps.',
    sampleOutput:
      '# Product Release Notes\n\n## What’s New\n## Improvements & Polish\n## Security & Reliability Fixes',
  },
];

export const OFFICIAL_DOCUMENT_TEMPLATES: OfficialDocumentTemplate[] =
  RAW_OFFICIAL_DOCUMENT_TEMPLATES.map((tpl) => ({
    ...tpl,
    slug: tpl.id.replace(/^tpl-doc-/, ''),
    promptText: tpl.promptInstructions,
    content: tpl.sampleOutput,
  }));

export const PRICING_TIERS = [
  {
    id: 'FREE',
    tier: 'FREE',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    yearlyPrice: 0,
    credits: 2000,
    description: 'For individuals exploring spec-driven AI product creation.',
    cta: 'Current Starter Tier',
    popular: false,
    features: [
      '2,000 monthly AI credits',
      'Up to 3 active projects',
      '1 UI design style per project',
      'AI PRD, UI/UX & Full-Stack App builder',
      'Document import, export & sharing',
      'Manual edits are always free',
    ],
  },
  {
    id: 'PERFORMANCE',
    tier: 'PRO',
    name: 'Performance',
    monthlyPrice: 25,
    annualPrice: 20,
    yearlyPrice: 20,
    credits: 20000,
    description: 'For solo founders and builders shipping production apps.',
    cta: 'Upgrade to Performance',
    popular: true,
    features: [
      '20,000 monthly AI credits',
      'Unlimited projects & documents',
      '2 UI design styles per project',
      'Custom domain binding & SSL',
      'GitHub & Bitbucket two-way code sync',
      'Live code editor & visual UI inspector',
    ],
  },
  {
    id: 'TEAMS',
    tier: 'TEAMS',
    name: 'Teams',
    monthlyPrice: 75,
    annualPrice: 60,
    yearlyPrice: 60,
    credits: 75000,
    description: 'For collaborative product, design, and engineering squads.',
    cta: 'Upgrade to Teams',
    popular: false,
    features: [
      '75,000 monthly AI credits',
      'Unlimited UI design styles & themes',
      'Invite-only team RBAC (Up to 20 seats)',
      'Custom organization design language',
      'Database snapshot, rollback & reset',
      'Jira, Linear & Slack integrations',
    ],
  },
  {
    id: 'SCALE',
    tier: 'ENTERPRISE',
    name: 'Scale',
    monthlyPrice: 200,
    annualPrice: 160,
    yearlyPrice: 160,
    credits: 200000,
    description: 'For high-velocity organizations scaling multiple product lines.',
    cta: 'Upgrade to Scale',
    popular: false,
    features: [
      '200,000 monthly AI credits',
      'Organization Knowledge Base & RAG Chat',
      'Build & runtime deployment logs',
      'Executive velocity & weekly status reports',
      'Custom tech stack & template governance',
      'Up to 100 seats + Priority Support',
    ],
  },
];

export const PRICING_PLANS = PRICING_TIERS;

export interface FreeAiToolCatalogItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  placeholder: string;
}

export const FREE_AI_TOOLS_CATALOG: FreeAiToolCatalogItem[] = [
  {
    id: 'prd-generator',
    name: 'AI PRD Generator',
    badge: 'Spec Engine',
    description:
      'Generate a comprehensive 5-section Product Requirement Document with personas, 6-month KPIs, epics, and acceptance criteria.',
    placeholder:
      'Describe your product idea, target users, and primary business goals...',
  },
  {
    id: 'ui-generator',
    name: 'AI UI/UX Wireframe Generator',
    badge: 'Design Studio',
    description:
      'Synthesize multi-page interactive UI component trees, color tokens, and responsive layout blueprints.',
    placeholder:
      'Describe the screens, dashboards, or user flows you want to design...',
  },
  {
    id: 'app-idea-generator',
    name: 'AI App Idea & ICP Validator',
    badge: 'Strategy',
    description:
      'Discover high-margin SaaS & AI product opportunities with ICP definition, pricing models, and MVP wedge.',
    placeholder:
      'Enter an industry, workflow bottleneck, or target customer segment...',
  },
  {
    id: 'landing-page-generator',
    name: 'AI Landing Page Architect',
    badge: 'Growth',
    description:
      'Draft conversion-optimized hero messaging, feature matrices, social proof blocks, and pricing comparison tables.',
    placeholder:
      'Describe your product value proposition and target buyer persona...',
  },
  {
    id: 'brand-name-generator',
    name: 'AI Brand & Domain Generator',
    badge: 'Branding',
    description:
      'Generate memorable brand identities, positioning taglines, and domain naming patterns for modern software products.',
    placeholder:
      'Describe your product category, tone of voice, and core differentiation...',
  },
  {
    id: 'app-name-generator',
    name: 'AI SQL & Architecture Blueprint',
    badge: 'Engineering',
    description:
      'Generate normalized PostgreSQL/SQLite table schemas, REST API routes, and sprint story point estimates.',
    placeholder:
      'Describe the core entities, workflows, and integrations of your app...',
  },
];

export interface DocumentationArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  sections: { heading: string; body: string; code?: string }[];
}

const RAW_DOCUMENTATION_ARTICLES: Record<
  string,
  {
    slug: string;
    category: string;
    title: string;
    subtitle: string;
    sections: { heading: string; body: string; code?: string }[];
  }
> = {
  'unified-workflow': {
    slug: 'unified-workflow',
    category: 'Core Concepts',
    title: 'The Unified Spec-Driven Workflow',
    subtitle:
      'How Omniflow keeps your Living PRD, UI/UX Design, Development Plan, and Full-Stack Product Code in bidirectional sync.',
    sections: [
      {
        heading: '1. Why Spec-Driven Development Beats Vibe Coding',
        body: 'Jumping straight from a one-sentence prompt to application code produces brittle architectures and hallucinated requirements. Omniflow enforces a structured 3-stage loop: Step 01 (Living PRD) -> Step 02 (Multi-Page UI/UX Design) -> Step 03 (Full-Stack Product). Every stage is directly editable and version-controlled.',
      },
      {
        heading: '2. Bidirectional Cross-Document Synchronization',
        body: 'Whenever you update an Epic, User Story, or Acceptance Criterion in your PRD, Omniflow records a DocumentSyncEvent for downstream artifacts (UI/UX Design, Technical Design, Development Plan, and Product Code). Reviewing and clicking "Apply Sync" propagates your updated specification without losing manual customizations.',
      },
      {
        heading: '3. Customizing Your 7-Artifact Pipeline',
        body: 'Every Omniflow project provisions 7 linked artifacts: PRD, UI/UX Design, Tech Design, Development Plan, QA Plan, Release Plan, and Product. Use the "Customize Workflow" button in the top bar to toggle which engineering stages appear in your active navigation bar.',
      },
    ],
  },
  'production-deployment': {
    slug: 'production-deployment',
    category: 'Deployment',
    title: 'Production Deployment & Promotion',
    subtitle:
      'Publish full-stack applications from Preview sandboxes to Production with automated health checks and build logs.',
    sections: [
      {
        heading: '1. Preview vs. Production Publishing',
        body: 'Every change made through Agent Joy, the Visual UI Editor, or the Code Editor is immediately reflected in your interactive Preview environment. Clicking "Publish App" executes a production build, runs database migrations, and promotes the artifact to a live URL.',
      },
      {
        heading: '2. Inspecting Build & Runtime Logs',
        body: 'In the Product workspace, open the "Logs" tab to inspect timestamped compiler output, schema migration verification, and runtime HTTP telemetry across both Preview and Production environments.',
      },
    ],
  },
  'environment-separation': {
    slug: 'environment-separation',
    category: 'Configuration',
    title: 'Environment Separation (Preview & Production)',
    subtitle:
      'Isolate API keys, third-party connectors, and relational data between staging and live environments.',
    sections: [
      {
        heading: '1. Dual-Environment Architecture',
        body: 'Omniflow maintains strict isolation between Preview (development/testing) and Production (live traffic). Environment variables, third-party connector secrets (Stripe, OpenAI, Perplexity, ElevenLabs, Resend), and database tables are scoped per environment.',
      },
      {
        heading: '2. Promoting Schema Changes Safely',
        body: 'Test destructive SQL migrations or seed scripts in the Preview database tab first. Once verified, promote the schema to Production or restore from a point-in-time snapshot.',
      },
    ],
  },
  'database-configuration': {
    slug: 'database-configuration',
    category: 'Configuration',
    title: 'Database Configuration & SQL Console',
    subtitle:
      'Manage relational tables, execute SQL queries, and perform 1-click snapshot rollbacks.',
    sections: [
      {
        heading: '1. Built-In Relational Database Manager',
        body: 'Every Full-Stack Product in Omniflow includes a managed relational database with pre-provisioned domain tables derived from your PRD entities. Switch between Preview and Production databases in one click.',
      },
      {
        heading: '2. Interactive SQL Execution & History',
        body: 'Run SELECT, INSERT, UPDATE, DELETE, and CREATE TABLE statements directly from the Database tab. Every query is logged in your SQL History with execution duration and affected row counts.',
        code: 'SELECT id, title, priority, status FROM tickets WHERE status = \'OPEN\' ORDER BY created_at DESC;',
      },
    ],
  },
  'domain-configuration': {
    slug: 'domain-configuration',
    category: 'Configuration',
    title: 'Custom Domain & SSL Configuration',
    subtitle:
      'Bind custom domains and subdomains to your published Omniflow applications with automated TLS.',
    sections: [
      {
        heading: '1. Adding a Custom Domain',
        body: 'Open the "Domains" tab inside the Product workspace and enter your custom domain (e.g., app.yourdomain.com). Configure the displayed CNAME record at your DNS provider pointing to cname.omniflowai.com.',
      },
      {
        heading: '2. DNS Verification & Primary Domain Routing',
        body: 'Click "Verify DNS" to validate propagation and automatically provision an SSL/TLS certificate. Mark any verified domain as Primary to redirect default traffic.',
      },
    ],
  },
  'version-control': {
    slug: 'version-control',
    category: 'Integrations',
    title: 'GitHub & Bitbucket Version Control Integration',
    subtitle:
      'Synchronize generated full-stack code with your organization repositories and pull request workflows.',
    sections: [
      {
        heading: '1. Two-Way Repository Synchronization',
        body: 'Connect your GitHub or Bitbucket account in Admin Settings -> Integrations or directly inside the Product workspace "GitHub" tab. Bind any repository and target branch to push generated commits or pull external developer changes.',
      },
      {
        heading: '2. Document Version History & Rollback',
        body: 'Every PRD, UI/UX Design, Technical Design, and Product artifact maintains a numbered version timeline (V1, V2, V3...). Revert to any historical snapshot with full downstream sync awareness.',
      },
    ],
  },
};

export const DOCUMENTATION_ARTICLES: DocumentationArticle[] = Object.values(
  RAW_DOCUMENTATION_ARTICLES
).map((article) => ({
  ...article,
  id: article.slug,
  summary: article.subtitle,
  content: article.sections
    .map(
      (s) =>
        `## ${s.heading}\n\n${s.body}${
          s.code ? `\n\n\`\`\`sql\n${s.code}\n\`\`\`` : ''
        }`
    )
    .join('\n\n'),
}));

