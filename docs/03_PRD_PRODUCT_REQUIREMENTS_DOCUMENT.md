# 03. Product Requirements Document (PRD)

## 1. Product Vision & Positioning
**Product Name**: OmniFlow AI (Enterprise Self-Hosted & Cloud Replica)  
**Tagline**: *The Spec-Driven AI Product Builder — Plan, design, and code. One system. Always in sync.*  

### Problem Statement
Software teams suffer from severe fragmentation across product management, UI/UX design, and software engineering:
1. **Traditional Stacks** (Jira + Confluence + Figma + Cursor/GitHub) require manual translation between tools; specs rot the moment coding starts.
2. **Vibe-Coding Tools** jump straight from a 1-line prompt to unmaintainable code without locking requirements, architecture, or UX first.
3. **Enterprise Governance Gaps**: Organizations require strict invite-only access control, role-based permissions, credit governance, and full auditability.

### Solution Overview
OmniFlow AI unifies the entire product lifecycle into a single spec-driven platform powered by **Agent Joy**, enhanced with enterprise-grade **Invite-Only Account Admission, RBAC, and Audit Logging**.

---

## 2. Target Personas
1. **System Administrator (`ADMIN`)**: Bootstraps the instance via CLI, issues/rotates/revokes single-use account invitations, assigns roles, configures organization integrations, customizes brand design systems, and reviews security audit logs.
2. **Product Manager / Founder (`MEMBER` — PM Specialty)**: Ideates with Joy, generates and refines PRDs, defines Epics & User Stories, manages sprints/backlogs/milestones, and tracks weekly velocity reports.
3. **Product Designer (`MEMBER` — Designer Specialty)**: Generates multi-page UI/UX wireframes from the PRD, switches design styles/themes, refines page layouts via visual edits or Joy chat, and previews across Desktop/Tablet/Mobile viewports.
4. **Full-Stack Engineer (`MEMBER` — Engineer Specialty)**: Generates Technical Designs, Development Plans, QA Plans, and Full-Stack Product code; inspects/edits source files, runs SQL queries against Preview/Production project databases, connects GitHub/Bitbucket and 3rd-party APIs, and publishes apps.
5. **Stakeholder / Reviewer (`VIEWER`)**: Reviews PRDs, UI designs, live app previews, and project reporting snapshots with read-only permissions.

---

## 3. Core Epics & Functional Requirements

### Epic 1: Marketing Website, Documentation Portal & Free AI Tools
- **FR-1.1 Marketing Pages**: Pixel-accurate recreation of `/`, `/pricing`, `/faq`, `/case-studies`, `/use-cases`, `/ai-for-product-managers`, `/blog`, `/about`, `/contact`, `/privacy`, and `/terms` with responsive Desktop & Mobile navigation.
- **FR-1.2 Interactive Free Tools (`/free-tools` & `/prd-template`)**:
  - 6 interactive public AI generators (`PRD Generator`, `App Idea Generator`, `UI Generator`, `Landing Page Generator`, `Brand Name Generator`, `App Name Generator`) that produce real, structured outputs from user prompts and allow 1-click continuation into the workspace.
  - Interactive 8-section `Free PRD Template` (`/prd-template`) with live editing, Markdown download, clipboard copy, and project import.
- **FR-1.3 Documentation Portal**: Searchable technical documentation covering Unified Workflow, Production Deployment, Environment Separation, Database Configuration, Domain Configuration, and Version Control Integrations.

### Epic 2: Invite-Only Account Admission, Authentication, RBAC & Audit Logging
- **FR-2.1 Fail-Closed Admission**: Public sign-up without a valid single-use invitation token is blocked (`403 ACCOUNT_INVITATION_REQUIRED`).
- **FR-2.2 CLI Root Admin Bootstrap**: `npm run bootstrap:admin -- --email <email> --password-stdin` creates or promotes the root `ADMIN` user and provisions their organization without exposing any public bootstrap endpoint.
- **FR-2.3 Invitation Lifecycle Management (`/admin/invitations`)**:
  - Admins can issue single-use invitations bound to an email and role (`ADMIN`, `MEMBER`, `VIEWER`) with configurable expiration (1–30 days, default 7 days).
  - Raw invitation tokens are shown only once on creation/rotation; only `sha256(token)` is stored.
  - Admins can rotate (invalidating the prior hash and extending expiration) or revoke pending invitations at any time.
- **FR-2.4 Invitation Acceptance (`/invite/[token]`)**:
  - Validates token hash and expiration (`GET /api/auth/invitation`), displays invited email and role, and registers the user (`POST /api/auth/register`) in a single atomic transaction that marks the invitation `acceptedAt`.
- **FR-2.5 Role Management & Revocation**:
  - Admins can update user roles (`ADMIN`, `MEMBER`, `VIEWER`) or deactivate/reactivate user accounts from `/settings/users` and `/admin/invitations`, preventing removing or demoting the last active `ADMIN`.
- **FR-2.6 Immutable Audit Trail**:
  - All security and workspace lifecycle actions are recorded in `AuditLog` and viewable/filterable in `/admin/invitations` and `/settings/users`.

### Epic 3: Spec-Driven Project Creation & 7-Artifact Workspace
- **FR-3.1 Prompt-to-Project Builder (`/index`)**:
  - Users can start a project from a natural language prompt, industry starter pill, attached context file, or showcase template.
  - Creating a project (`POST /api/projects`) generates a unique `shortName` (e.g., `SH10`), initializes a default `Backlog` workplan, and creates the 7 canonical project documents (`PRD`, `UI_DESIGN`, `TECH_DESIGN`, `DEVELOPMENT_PLAN`, `QA_PLAN`, `RELEASE_PLAN`, `PRODUCT`) plus corresponding buildable issues.
- **FR-3.2 Stage 1 — Living PRD Workspace (`/docs/[prdId]`)**:
  - Split screen with **Joy AI Assistant** on the left and the **Rich PRD Editor** on the right.
  - Supports streaming/instant AI PRD generation, section-level AI refinement, slash commands, template switching, manual rich-text/Markdown editing (`Manual edits are free`), version snapshots (`V1`, `V2`, ...), follow-up prompt chips, and `Make Design` CTA.
- **FR-3.3 Stage 2 — Multi-Page UI/UX Design Workspace (`/docs/[uiDocId]`)**:
  - Generates multi-page interactive UI wireframes and high-fidelity screens derived directly from the project's PRD epics and stories.
  - Includes Design Style selector (`Modern Minimal`, `Cosmic Dark`, `Enterprise Clean`, `Glassmorphic`, `Brutalist Bold`), Viewport switcher (`Desktop`, `Tablet`, `Mobile`), zoom controls, page switcher, per-page regeneration via Joy, and `Make Product` CTA.
- **FR-3.4 Stage 3 — Full-Stack Product Builder (`/docs/[productDocId]` & `/preview/[docId]`)**:
  - Generates a complete multi-file application based on the PRD + UI/UX Design + Tech Design.
  - **Live Preview & Visual UI Edits**: Interactive live preview with click-to-select DOM editing (`update-text`, `update-style`, `update-class`).
  - **Code Editor**: Browse and edit generated files (`src/App.tsx`, `src/api/routes.ts`, `prisma/schema.sql`, `src/styles.css`, `package.json`) with live hot-update in the preview.
  - **Database Manager**: Inspect `Preview` and `Production` environment tables, browse rows, execute SQL queries (`SELECT`, `INSERT`, `UPDATE`, `CREATE TABLE`), view SQL execution history, take snapshots, and reset the database.
  - **Connectors & Capabilities**: Configure integrations (`Stripe`, `OpenAI`, `Perplexity`, `ElevenLabs`, `Resend`, `Supabase`) and environment variables separated across `Preview` and `Production`.
  - **GitHub/Bitbucket Sync & Custom Domains**: Bind repository URL/branch, push commits, configure custom domain CNAME verification, and publish to Preview or Production URLs with build/runtime logs.
- **FR-3.5 Additional Engineering Artifacts (`TECH_DESIGN`, `QA_PLAN`, `RELEASE_PLAN`, `DEVELOPMENT_PLAN`)**:
  - `Customize Workflow` modal allows toggling all 7 document stages in the top bar.
  - `/devplan/[docId]` provides the 2-step **Development Plan** builder: Step 1 (`Roles Needed` + AI breakdown into Epics, Stories, and Tasks with story point estimates) and Step 2 (`Confirm Schedule` across Milestones and Sprints, syncing directly into the Project Backlog and Issue Board).
- **FR-3.6 Cross-Document Synchronization & Version History**:
  - Editing an upstream document (e.g., `PRD`) creates a pending sync alert on downstream documents (`UI_DESIGN`, `TECH_DESIGN`, `DEVELOPMENT_PLAN`, `PRODUCT`).
  - Users can inspect version history, save named versions, revert to any prior version, and apply upstream syncs in one click.

### Epic 4: Agile Project Management & Reporting (`/projects/[id]/*`)
- **FR-4.1 Planner (`/projects/[id]/planning/builder` & `/planning/info`)**: Stage cards for all 7 project artifacts with status, assignee, and due dates; project metadata management.
- **FR-4.2 Milestones (`/projects/[id]/building/milestones`)**: Create/update milestones, track completion percentage, and visualize timeline schedule.
- **FR-4.3 Sprint & Backlog (`/projects/[id]/building/projectorganizationpath`)**: Manage sprints and backlog hierarchy (`EPIC -> STORY -> TASK`), story points, priority, and assignee.
- **FR-4.4 Kanban Issue Board (`/projects/[id]/building/issueboard`)**: Interactive board across `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE`.
- **FR-4.5 Reporting (`/projects/[id]/reporting/snapshot` & `/reporting/weekly`)**: Real-time velocity/completion charts and AI-generated Weekly Status Reports.

### Epic 5: Knowledge Base RAG, Ideas, Templates, Billing & Settings
- **FR-5.1 Knowledge Base (`/knowledge-base` & `/knowledge-base/[id]`)**: Create knowledge bases, upload files/documents, automatically chunk and index text, and run grounded RAG chat conversations with source citations.
- **FR-5.2 Ideas (`/ideas` & `/ideas/[id]`)**: Brainstorm product ideas with Joy and promote any idea into a Living PRD, UI Design, or Full Product project.
- **FR-5.3 Template Center (`/template-documents` & `/template-documents/create/new`)**: Browse 10 showcase Product templates and 6 official Document templates, clone any template into a new project/document, and author custom organization templates.
- **FR-5.4 Billing & Credit Ledger (`/billing`)**: View subscription tier (`FREE`, `PERFORMANCE`, `TEAMS`, `SCALE`, `ENTERPRISE`), upgrade plan, top up credits, and inspect the immutable `CreditLedgerEntry` table (`All`, `Credited`, `Debited`).
- **FR-5.5 Profile & Admin Settings (`/profile`, `/settings/*`)**: Manage user profile/velocity, integrations (`Jira`, `GitHub`, `Bitbucket`, `Slack`, `Linear`, `Notion`), team seats/invitations, dev velocity calibration, design system customization, and referrals.
