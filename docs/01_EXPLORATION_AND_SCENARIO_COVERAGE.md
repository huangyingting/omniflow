# 01. Playwright Exploration & Scenario Coverage Report

## 1. Executive Overview

A systematic Playwright exploration was conducted across both the public marketing and documentation portal (`https://omniflowai.com` / `https://www.omniflowai.com`) and the authenticated SaaS application (`https://app.omniflowai.com`) across desktop (`1440x900`) and mobile (`390x844`) viewports. Over 85 screenshots and full API/DOM telemetry traces were captured in `/screenshots/marketing/` and `/screenshots/app/`.

OmniFlow AI is positioned as **"The Spec-Driven AI Product Builder — Plan, design, and code. One system. Always in sync."** Its core differentiation is a unified 3-stage product development workflow powered by **Agent Joy**:
1. **Step 01 — PRD (Living Spec)**: Lock what you are building before writing code. Supports structured PRD templates, inline rich-text editing, slash commands (`/`), section-level AI edits, and automatic downstream sync tracking.
2. **Step 02 — UI/UX Design**: Multi-page visual wireframe and high-fidelity UI preview generation with selectable design styles (`Modern Minimal`, `Enterprise Clean`, `Glassmorphism`, `Brutalist Bold`, etc.), viewport switcher (`Desktop`, `Tablet`, `Mobile`), and per-page regeneration.
3. **Step 03 — Product (Full-Stack App)**: Interactive full-stack workspace combining live application preview, visual DOM/CSS style editing (`UI Edits`), code editor/file browser, dual-environment database manager (`Preview` & `Production` SQL execution, schema browser, snapshot/reset), third-party connectors (`Stripe`, `Perplexity`, `ElevenLabs`, `OpenAI`, `Resend`), GitHub/Bitbucket code sync, custom domain management, and 1-click deployment with build/runtime logs.

Beyond the 3-stage builder, OmniFlow includes a complete **Agile Project & Delivery Suite** (`/projects/:id/*` covering Planner workflow cards, Project Info, Milestones/Gantt, Sprint & Backlog management, Kanban Issue Board, and Reporting Snapshots/Weekly Reports), **Organization Knowledge Base with RAG Chat** (`/knowledge-base`), **AI Ideation Sessions** (`/ideas`), **Template Center** (`/template-documents` for both Full-Stack Product templates and Document templates), **Credit & Subscription Billing** (`/billing`), and **Admin Settings** (`/settings/*`).

---

## 2. Marketing & Public Portal Exploration (`omniflowai.com`)

| Route | Title / Purpose | Desktop Screenshot | Mobile Screenshot | Key Observed Capabilities & UI States |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Home — The Spec-Driven AI Product Builder | `screenshots/marketing/home-desktop.png` | `screenshots/marketing/home-mobile.png` | Hero interactive prompt input with attachment/project-mode selector (`PRD -> UI/UX -> Product`), 6 starter industry prompt pills (`E-Commerce`, `SaaS CRM`, `Fintech Dashboard`, `Healthcare Portal`, `AI Helpdesk`, `EdTech LMS`), 3-step spec-driven loop showcase, comparison matrix (`Traditional Stack` vs `Vibe Coding Tools` vs `Omniflow`), 10-card Production-Ready App Showcase carousel, FAQ accordion, and dark radial-glow aesthetic (`#06050a`, `#8e85ff` accent, `Plus Jakarta Sans` + `Instrument Serif`). |
| `/pricing` | Plans & Credit Tiers | `screenshots/marketing/pricing-desktop.png` | `screenshots/marketing/pricing-mobile.png` | Monthly / Annual billing toggle (`Save 20%`), 5 tiers (`Free` $0, `Performance` $25/mo, `Teams` $75/mo/user, `Scale` $200/mo/user, `Enterprise` Custom), detailed feature comparison table across Credits, Projects, UI Design Styles, Code Sync, Database Rollback, Knowledge Base, and Support. |
| `/faq` | Frequently Asked Questions | `screenshots/marketing/faq-desktop.png` | — | Categorized accordion covering Spec-Driven Development, Credits & Billing, Code Ownership & GitHub Export, Security & Privacy, and Deployment. |
| `/case-studies` | Customer Case Studies | `screenshots/marketing/case-studies-desktop.png` | — | Real-world velocity metrics showing 10x faster PRD-to-Prototype delivery and 70% reduction in engineering rework. |
| `/use-cases` | Role & Industry Use Cases | `screenshots/marketing/use-cases-desktop.png` | — | Tailored workflows for Founders, Product Managers, Engineering Leads, and Agencies. |
| `/ai-for-product-managers` | AI for Product Managers | `screenshots/marketing/ai-for-product-managers-desktop.png` | — | Deep dive into AI PRD generation, automated user stories, acceptance criteria, task breakdown, and design previewing. |
| `/free-tools` | Free AI Product Tools Hub | `screenshots/marketing/free-tools-desktop.png` | `screenshots/marketing/free-tools-mobile.png` | Hub featuring 6 interactive public generators: `PRD Generator`, `App Idea Generator`, `UI Generator`, `Landing Page Generator`, `Brand Name Generator`, and `App Name Generator`. |
| `/prd-template` | Interactive Free PRD Template | `screenshots/marketing/prd-template-desktop.png` | — | 8-section interactive PRD builder (`Overview`, `Problem Statement`, `Goals & Metrics`, `Target Personas`, `User Stories`, `Functional Scope`, `Technical Constraints`, `Release Criteria`) with Markdown/Copy export and 1-click import into OmniFlow. |
| `/docs` | Documentation Portal Index | `screenshots/marketing/docs-desktop.png` | `screenshots/marketing/docs-mobile.png` | Sidebar documentation navigation covering Quickstart, Core Concepts, Deployment, Configuration, and Integrations. |
| `/docs/core-concepts/unified-workflow` | Core Concepts: Unified Workflow | `screenshots/marketing/docs-unified-workflow-desktop.png` | — | Explains bidirectional alignment between PRD, UI/UX Design, Technical Design, Development Plan, and Product Code. |
| `/docs/deployment/production-deployment` | Production Deployment Guide | `screenshots/marketing/docs-production-deployment-desktop.png` | — | Details Preview vs Production publishing, environment promotion, and health checks. |
| `/docs/configuration/environment-separation` | Environment Separation | `screenshots/marketing/docs-env-separation-desktop.png` | — | Documents isolated Preview and Production environment variables and secrets management. |
| `/docs/configuration/database-configuration` | Database Configuration | `screenshots/marketing/docs-db-config-desktop.png` | — | Documents managed database provisioning, schema migrations, SQL execution console, and snapshot rollback. |
| `/docs/configuration/domain-configuration` | Custom Domain Configuration | `screenshots/marketing/docs-domain-config-desktop.png` | — | Explains CNAME/A-record verification, SSL provisioning, and primary domain binding. |
| `/docs/integrations/version-control` | GitHub & Bitbucket Integration | `screenshots/marketing/docs-version-control-desktop.png` | — | Covers repository binding, branch selection, commit push/pull, and PR synchronization. |
| `/blog`, `/about`, `/contact` | Company, Blog & Contact | `screenshots/marketing/blog-desktop.png`, `about-desktop.png`, `contact-desktop.png` | — | Product engineering articles, mission statement, and enterprise contact inquiry form. |

---

## 3. Authenticated Application Exploration (`app.omniflowai.com`)

### 3.1 Authentication, Session & Onboarding Flows
- **Observed Upstream Behavior**:
  - `.cred` contained an expired session cookie; visiting protected routes redirected to `/login?redirect=...`.
  - Upstream uses AWS Cognito (`us-west-1_ce073s21F`) coupled with `POST /api/signup` and `GET /api/user/RefreshUserStoken`.
  - First-time registration triggers a 4-step **FTUE Onboarding Tour** (`screenshots/app/scenario-ftue-step-1.png` through `scenario-ftue-step-3.png`) introducing:
    1. Start From an Idea (`What would you like to build today?`)
    2. Spec-First Workflow (`PRD -> UI/UX Design -> Product`)
    3. Project Templates & Showcase (`Modern SaaS Platform`, `Enterprise Collaboration Portal`, etc.)
- **Replica Enhancement (Invite-Only Security Architecture)**:
  - Per project requirements and `../Arcade/docs/NEXTAUTH_INVITE_ONLY_SPEC.md`, our implementation replaces open self-registration with **fail-closed Invite-Only Account Admission** using NextAuth v4 JWT sessions, single-use SHA-256 hashed invitation links (`/invite/[token]`), expiration enforcement, invitation rotation/revocation, role assignment (`ADMIN`, `MEMBER`, `VIEWER`), CLI-only root admin bootstrap (`npm run bootstrap:admin`), and persistent `AuditLog` tracking.

### 3.2 Complete Application Route Inventory & Screenshots

| Route Pattern | Screen / Module Name | Captured Screenshot(s) | Observed Functionality & API Backing |
| :--- | :--- | :--- | :--- |
| `/login` | Sign In Screen | `screenshots/app/login-page.png` | Email + Password authentication, Google OAuth button, forgot password flow, feature highlight carousel on right pane. |
| `/invite/[token]` | Invitation Acceptance & Registration | Implemented per Arcade spec | Validates single-use token hash & expiry (`GET /api/auth/invitation`), displays pre-bound email & assigned role, collects name & password (`POST /api/auth/register`). |
| `/index` | Home — Spec-Driven AI Builder | `screenshots/app/route-index.png` | Greeting (`Hi <Name>, what would you like to build today?`), prompt textarea with file attachment (`+`), workflow mode selector (`Full App (PRD -> UI/UX -> Product)` vs `PRD Only`), credit counter (`2,000 Credits`), 6 industry prompt pills, and `Template Showcase` grid with 10 production templates (`View App` & `Use Template`). |
| `/dashboard` | Personal & Team Dashboard | `screenshots/app/route-dashboard.png` | Actionable overview of active projects, assigned issues, recent documents, and quick creation actions (`GET /api/MyDashboardInfo`). |
| `/org` | All Organization Projects | `screenshots/app/route-org.png` | Searchable project cards/table showing project shortName, owner, progress %, target due date, status badge, and quick jump into Planner or PRD (`GET /api/OrganizationInfo`). |
| `/docs` | All Documents List | `screenshots/app/route-docs.png` | Searchable & filterable table of all organization documents (`PRD`, `UI/UX Design`, `Tech Design`, `QA Plan`, `Release Plan`, `Product`), filter by Type and Project, `+ New Document` modal (`GET /api/documents/user`). |
| `/docs/:docId` | Unified Spec / Design / Product Workspace | `screenshots/app/scenario-prd-generated.png`, `scenario-ui-design-doc.png`, `scenario-product-doc.png`, `scenario-tech-design-doc.png`, `scenario-qa-plan-doc.png`, `scenario-release-plan-doc.png` | Split-pane workspace: Left pane is **Joy AI Assistant** (`Build activity` progress tracker, version pill `V1`, follow-up suggestion chips, prompt chat, context attachment); Top bar has `1 PRD -> 2 UI/UX Design -> 3 Product` step switcher, `Customize Workflow`, primary stage CTA (`Make Design` / `Make Product` / `Publish App`), version history, and cross-doc sync indicator; Right pane renders either the Rich Document Editor, Multi-Page UI/UX Previewer, or Full-Stack Product IDE/Preview/DB/Deploy suite. |
| `/devplan/:docId` | AI Development Plan & Sprint Breakdown | `screenshots/app/scenario-devplan-route.png` | Dedicated 2-step engineering planner: Step 1 `Review the work (Epics, Stories, Tasks)` with `Roles Needed` selector & story point estimation; Step 2 `Confirm the schedule (Milestones, Sprints)`. |
| `/projects/:id/planning/builder` | Project Planner Workflow Cards | `screenshots/app/project-planning-builder.png` | Interactive stage cards for `PRD`, `UI/UX Design`, `Tech Design`, `Development Plan`, `Product`, `QA & Test Plan`, and `Release Plan`, showing status (`NOT STARTED` / `IN PROGRESS` / `COMPLETED`), owner assignment, due date, and direct link to open or generate each artifact. |
| `/projects/:id/planning/info` | Project General Information | `screenshots/app/project-planning-info.png` | Edit project name, `shortName` key, description, owner, visibility (`self`, `team`, `organization`), target dates, and delete/archive controls. |
| `/projects/:id/building/milestones` | Milestones & Timeline | `screenshots/app/project-building-milestones.png` | Milestone progress cards and timeline schedule across sprints and epics. |
| `/projects/:id/building/projectorganizationpath` | Sprint & Backlog Planner | `screenshots/app/project-building-backlog.png` | Hierarchical tree/table of Sprints, Backlog, Epics, Stories, and Tasks with `+ Add Issue`, story points, status, and assignee controls. |
| `/projects/:id/building/issueboard` | Kanban Issue Board | `screenshots/app/project-building-issueboard.png` | Drag/move Kanban columns (`To Do`, `In Progress`, `In Review`, `Done`) filtered by sprint, assignee, or issue type. |
| `/projects/:id/reporting/snapshot` | Project Reporting Snapshot | `screenshots/app/project-reporting-snapshot.png` | Executive metrics: story point burnup/velocity, completion percentage, issue breakdown by status/priority/owner. |
| `/projects/:id/reporting/weekly` | Weekly Status Report | `screenshots/app/project-reporting-weekly.png` | AI-assisted weekly progress summary covering completed work, in-flight items, blockers/risks, and next week's plan. |
| `/apps` | Built Full-Stack Applications | `screenshots/app/route-apps.png` | Grid of all generated full-stack `PRODUCT` applications with preview thumbnail, deployment status (`Draft`, `Preview`, `Published`), live URL, and `New App` button. |
| `/ideas` & `/ideas/:id` | AI Ideation & Brainstorming | `screenshots/app/route-ideas.png`, `scenario-idea-workspace.png` | Create brainstorming sessions (`Add Idea` modal) and chat with Joy (`Spec (Living PRD)`, `Design (UI/UX)`, `Code (Full Product)` promotion buttons, file attachments, sample prompts). |
| `/knowledge-base` & `/knowledge-base/:id` | Organization Knowledge Base & RAG | `screenshots/app/route-knowledge-base.png`, `scenario-kb-create-modal.png`, `scenario-kb-created.png`, `scenario-kb-detail.png` | Create knowledge bases (`POST /api/knowledge-base`), upload documents (`txt, md, pdf, docx, csv, xlsx, code`), inspect chunk indexing status, and run grounded RAG chat queries (`Chat` & `Settings` tabs). |
| `/template-documents` & `/template-documents/create/new` | Template Center (`Product` & `Document` Tabs) | `screenshots/app/route-template-documents.png`, `scenario-templates-document-tab.png`, `route-template-create.png` | Browse 10 full-stack Product templates and 6 official Document templates (`Generic PRD Document`, `Generic Technical Design`, `Development Task Breakdown`, `Generic QA / Test Plan`, `Business Strategy`, `Release Note`), or author custom templates with custom prompt instructions. |
| `/billing` | Subscription Plan & Credit Ledger | `screenshots/app/route-billing.png`, `scenario-upgrade-modal.png` | Shows current plan (`Free Plan`), monthly credit balance (`2,000`), `Upgrade Plan` modal, `Purchase Credits` top-up modal, and filterable `Credit History` ledger (`All`, `Credited`, `Debited`). |
| `/profile` | User Profile Settings | `screenshots/app/route-profile.png` | Edit First Name, Last Name, Specialty/Role, Velocity (story points/sprint), avatar, and password. |
| `/settings/users` | Team & User Management | `screenshots/app/route-settings-users.png` | Manage organization members, seats (`availableSeats` / `totalSeats`), roles, statuses, and invitations. |
| `/settings/integration`, `/settings/github`, `/settings/bitbucket` | Third-Party & Version Control Integrations | `screenshots/app/route-settings-integration.png`, `route-settings-github.png`, `route-settings-bitbucket.png` | Connect Jira, Slack, GitHub, Bitbucket, Trello, Asana, Notion, and Linear. |
| `/settings/dev-velocity` | Development Velocity Calibration | `screenshots/app/route-settings-dev-velocity.png` | Configure baseline story points for sample engineering tasks to calibrate AI sprint estimates. |
| `/settings/customization` | Design System & Brand Customization | `screenshots/app/route-settings-customization.png` | Configure organization default brand palette, typography, border radius, and custom document templates. |
| `/settings/referral` | Referral & Earn Credits Program | `screenshots/app/route-settings-referral.png` | Unique referral link, social share actions, and earned bonus credits tracker. |
| `/admin/invitations` | Invite-Only Admission & Audit Console | Implemented per Arcade spec | Admin console to create, rotate, copy, and revoke single-use expiring account invitations, manage user roles (`ADMIN`, `MEMBER`, `VIEWER`), and inspect security `AuditLog` entries. |

---

## 4. Executed Scenarios & Edge/Error State Findings

### Scenario 1: End-to-End Spec-Driven Project Creation (`SmartSupport Hub`)
- **Action**: Entered prompt *"Build an AI Customer Support & Helpdesk Triage Platform with automated ticket routing, SLA monitoring, knowledge base RAG answers, and team analytics dashboard"* on `/index` and clicked submit.
- **Observed API Sequence**:
  1. `POST /api/projects` -> Created Project `SmartSupport Hub` (`shortName: "SH10"`), initialized a default `BACKLOG` workplan, 7 `BUILDABLE` issues, and 7 linked `Document` records (`PRD`, `UI_DESIGN`, `TECH_DESIGN`, `DEVELOPMENT_PLAN`, `QA_PLAN`, `RELEASE_PLAN`, `PRODUCT`).
  2. Redirected immediately to `/docs/:prdDocId?autoGenerate=true`.
  3. Triggered `POST /api/documents/generatePRDStream` -> Joy AI Assistant streamed progress (`Step 1 of 3: Request received -> Creating prd... -> Ready for your review`), created version `V1`, and populated the structured PRD editor with `Problem & Opportunity`, `Target Audience & User Persona`, `Metrics and Goals`, and `Epics & User Stories`.
  4. Presented 3 contextual follow-up chips (`Define AI Quality Framework`, `Detail Dashboard Wireframes`, `Plan Pricing and Packaging`) and the primary stage transition CTA `Make Design`.

### Scenario 2: Transitioning from PRD to UI/UX Design (`Make Design`)
- **Action**: Clicked `Make Design` in the top workflow bar of `/docs/:prdDocId`.
- **Observed Behavior**:
  - Navigated to `/docs/:uiDesignDocId`.
  - Automatically dispatched user message *"We want to support all key feature requirements defined in the selected PRD document. Please create a UI design wireframe for it."*
  - Triggered `Build activity Step 2 of 3` (`Creating the UI design: style guide -> design preview`) with responsive viewport controls (`Desktop`, `Tablet`, `Mobile`) and design style selector.

### Scenario 3: Navigating to Product Builder & Observing Credit/Plan Gate (`Edge State`)
- **Action**: Navigated to Step 3 `Product` (`/docs/:productDocId`) on a Free tier account.
- **Observed Edge/Gate State**:
  - Displayed an inline amber banner: *"Building the full product requires credits or a paid plan. Buy credits or upgrade your plan to continue. Your PRD and UI design stay free to edit."* with `[Upgrade plan]` and `[Buy credits]` buttons.
  - Note: In our self-hosted replica, organizations start with sufficient credits and configurable plan tiers so users can execute the entire `PRD -> UI/UX Design -> Full-Stack Product` pipeline end-to-end without paywall blockage, while still accurately modeling credit consumption (`CreditLedgerEntry`) and tier limits.

### Scenario 4: Direct Access to `/docs/:devPlanDocId` vs `/devplan/:devPlanDocId` (`Edge State`)
- **Action**: Visited `/docs/:devPlanDocId` directly vs `/devplan/:devPlanDocId`.
- **Observed Behavior**:
  - Visiting `/docs/:devPlanDocId` returned an explicit error state: `"Development plan documents can only be accessed via /devPlan API: <id>"`.
  - Visiting `/devplan/:devPlanDocId` rendered the specialized 2-step Development Plan builder (`1 Review the work: Epics, Stories, Tasks` -> `2 Confirm the schedule: Milestones, Sprints`) and enforced a prerequisite guard: `"Tasks are not generated yet. Please first add the Roles Needed above before creating task breakdown."`

### Scenario 5: Creating an Organization Knowledge Base & Inspecting RAG Workspace
- **Action**: Navigated to `/knowledge-base`, clicked `Create your first knowledge base`, entered Name `"Product Architecture & Brand Guidelines"` and Description `"Core architecture standards, API contracts, and SLA definitions for SmartSupport Hub"`, and submitted.
- **Observed Behavior**:
  - `POST /api/knowledge-base` created the KB record and showed toast `"Knowledge base created successfully"`.
  - Clicking the card navigated to `/knowledge-base/:kbId`, exposing a drag-and-drop file ingestion dropzone (`Supported: txt, md, pdf, docx, csv, xlsx, xls, images, code files (max 50MB)`), a chunk indexing table (`File Name, Size, Status, Chunks, Uploaded At, Action`), and a right-hand `Chat` / `Settings` panel for grounded RAG Q&A.

### Scenario 6: Creating an AI Ideation Session (`/ideas`)
- **Action**: Navigated to `/ideas`, clicked `New Idea`, filled `"Autonomous SLA Escalation Agent"`, and clicked `Save`.
- **Observed Behavior**:
  - Created an ideation chat session and navigated to `/ideas/:sessionId` featuring Joy AI chat, sample prompt cards, file/document linking, and 1-click promotion pills (`Spec (Living PRD)`, `Design (UI/UX)`, `Code (Full Product)`).

### Scenario 7: Completed Multi-Page UI/UX Design Studio & Responsive Preview (`/docs/:uiDesignDocId`)
- **Action**: Allowed Step 2 (`UI/UX Design`) generation for `SmartSupport Hub` to complete and switched between Desktop and Mobile viewports (`screenshots/app/scenario-ui-design-completed.png`, `screenshots/app/scenario-ui-design-mobile-preview.png`).
- **Observed Behavior**:
  - Rendered the `SmartSupport Hub` multi-pane support triage application inside the `Agent Workspace` artboard frame (`Pick Design: Modern Enterprise Clarity`) with Priority Queue (`P1 Critical`, `P2 High`, `P3 Medium`), SLA Countdown (`00:08:14`), Grounded AI Reply Copilot (`96% confidence`, `Source: SSO- OAuth-Runbook.md #4.2`), and follow-up suggestion pills (`Add Analytics Dashboard`, `Design Admin Routing Rules`, `Create Customer Help Widget`).

### Scenario 8: Customizing the 7-Stage Project Workflow (`Customize Project Workflow` Modal)
- **Action**: Opened the `Customize Project Workflow` modal from the studio stepper, enabled all 7 workflow stages (`PRD`, `UI Design`, `Technical Design`, `Development Plan`, `QA`, `Release Plan`, `Product`), and saved (`screenshots/app/scenario-customize-workflow-all-checked.png`, `screenshots/app/scenario-project-planner-7-cards.png`).
- **Observed Behavior**:
  - Updated the Project Planner (`/projects/:id/planning/builder`) to display all 7 workflow stage cards and added a dropdown switcher to stage 2 of the top studio header (`UI/UX Design`, `Tech Design`, `Dev Plan`, `QA Plan`, `Release Plan`), with each supporting document opening its own Joy AI studio (`screenshots/app/scenario-tech-design-card.png`, `screenshots/app/scenario-qa-plan-card.png`, `screenshots/app/scenario-release-plan-card.png`).

### Scenario 9: End-to-End 2-Step AI Development Plan & Publishing to Agile Boards (`/devplan/:docId`)
- **Action**:
  1. Set user specialty to `Fullstack Engineer` in `Admin -> User Management` (`/settings/users`, `screenshots/app/scenario-admin-user-specialty-updated.png`).
  2. Opened `/devplan/:docId` (`Step 1: Review the work — Epics, Stories, Tasks`), selected roles in the `* Roles Needed` multi-select tree (`screenshots/app/scenario-devplan-roles-dropdown.png`), and clicked `Generate Task` (`screenshots/app/scenario-devplan-tasks-generated.png`).
  3. Clicked `Confirm Schedule` to advance to `Step 2: Confirm the schedule — Milestones, Sprints`, selected `omniflow1793651361678(FULLSTACK ENGINEER, 10 pts)` in `* Team members`, generated `Milestone 1` through `Milestone 4` and `Sprint 1` through `Sprint 6` (`screenshots/app/scenario-devplan-step2-sprints.png`), and clicked `Publish Dev Plan`.
- **Observed Behavior**:
  - Publishing the DevPlan automatically calculated target due dates for all 7 workflow cards on the Project Planner (`screenshots/app/scenario-project-planner-published-devplan.png`) and redirected to `/projects/:id/building/milestones` (`screenshots/app/scenario-devplan-published.png`, `screenshots/app/scenario-populated-milestones.png`) populated with Milestones, Sprints, and role-tagged tasks.

---

## 5. Local Replica End-to-End User Workflow Verification (`screenshots/local-verification/`)

All 47 routes and interactive sub-paths of our local Next.js 16 + NextAuth v4 + Prisma 7 replica were verified via automated Playwright end-user workflows (`screenshots/local-verification/`):

| Screenshot File | Verified End-User Workflow Path |
| :--- | :--- |
| `01-marketing-home.png`, `01b-marketing-home-mobile.png` | Public landing page on Desktop (`1440x900`) and Mobile (`390x844`) viewports. |
| `02-marketing-pricing.png` | Interactive Pricing & Credit Tiers page (`/pricing`). |
| `03-marketing-free-tools-prd.png`, `03b-marketing-free-tools-stories.png`, `03c-marketing-free-tools-sql.png` | Live synthesis across multiple public generators on `/free-tools` (`AI PRD Generator`, `AI UI/UX Wireframe Generator`, `AI SQL & Architecture Blueprint`). |
| `04-marketing-prd-template.png`, `05-marketing-documentation.png`, `06a`–`06i` | Interactive PRD Template (`/prd-template`), Documentation Portal (`/documentation`), FAQ (`/faq`), Use Cases (`/use-cases`), Case Studies (`/case-studies`), AI for PMs (`/ai-for-product-managers`), Blog (`/blog`), About (`/about`), Contact (`/contact`), Privacy (`/privacy`), and Terms (`/terms`). |
| `07-signup-locked-without-token.png`, `08-login-admin.png` | Fail-closed invite-only registration gate on `/signup` without token and Admin login on `/login`. |
| `09-admin-invitations-create-token.png`, `10-signup-redeem-invite-token.png`, `10b-member-signed-in-after-invite.png`, `09b-admin-invitations-after-redemption.png`, `09c-admin-audit-logs.png` | Admin issues single-use SHA-256 invitation on `/admin/invitations` -> New member redeems `/invite/[token]` -> Invitation transitions to `ACCEPTED` -> Immutable `AuditLog` records all admission events. |
| `11-index-ftue-tour.png`, `12-index-workspace-hub.png`, `13-modal-invite-team.png`, `14-modal-upgrade-plans.png`, `15-modal-earn-credits.png` | 5-step FTUE onboarding tour on `/index`, Workspace prompt builder, and global `Invite`, `Upgrade`, and `+Credits` modals. |
| `16-studio-stage1-prd-v1.png`, `16b-studio-stage1-prd-v2-refined.png` | Stage 1 Living PRD (`V1`) creation from `/index` and conversational refinement with Joy AI to `V2` with downstream sync notification. |
| `17-studio-stage2-uidesign-desktop.png`, `17b-studio-stage2-uidesign-mobile-theme.png` | Stage 2 Multi-Page UI/UX Design Studio across Desktop and Mobile viewports and multiple design themes (`Modern Minimal`, `Cyberpunk Dark`). |
| `18-studio-stage3-product-preview.png`, `18c-studio-stage3-product-code.png`, `18d-studio-stage3-product-database-sql.png`, `18e-studio-stage3-product-connectors.png`, `18f-studio-stage3-product-domains.png`, `18h-studio-stage3-product-deploy-logs.png`, `19-standalone-app-preview.png` | Stage 3 Full-Stack Product Studio: Live App Preview, Multi-File Code Editor, Preview/Production SQL Database Console, Connectors, Custom Domains, Git Sync & Production Deployment, and standalone `/preview/[docId]` runtime. |
| `20-project-7stage-builder.png`, `20b-studio-tech-design.png`, `20c-studio-qa-plan.png`, `20d-studio-release-plan.png` | 7-Stage Spec Builder Pipeline (`/projects/[id]/planning/builder`) plus generated `Tech Design`, `QA Plan`, and `Release Plan` studios. |
| `21-devplan-step1-epics-stories.png`, `21b-devplan-step2-sprints-milestones.png` | 2-Step AI Development Planner (`/devplan/[docId]`): Step 1 Role-based Epics & Stories and Step 2 Milestones & Sprints synchronized to project backlog. |
| `22-project-planning-info.png`, `23-project-building-milestones.png`, `24-project-planning-backlog.png`, `25-project-building-issueboard.png`, `26-project-reporting-snapshot.png`, `27-project-reporting-weekly.png` | Agile Execution Suite: Project Info, Milestones & Timeline, Sprints & Backlog (`/planning/backlog` & `/building/projectorganizationpath`), Kanban Issue Board (`/building/issueboard` with live status transitions across `To Do`, `In Progress`, `Completed`), Executive Snapshot Report, and 4-Week Sprint Velocity Report. |
| `28-workspace-dashboard.png`, `29-workspace-org.png`, `30-workspace-apps.png`, `31-workspace-docs.png` | Populated Personal Dashboard (`/dashboard`), Team Projects Directory (`/org`), Built Apps Gallery (`/apps`), and All Documents Table (`/docs`). |
| `32-ideas-studio-brainstorm.png`, `33a-knowledge-base-files-indexed.png`, `33-knowledge-base-rag-chat.png`, `34-templates-center.png`, `34b-templates-create-new.png`, `35-billing-subscription.png`, `36-profile-account.png`, `37a`–`37e` | AI Ideation brainstorming (`/ideas/[id]`), Knowledge Base document chunking & cited RAG Q&A (`/knowledge-base/[id]`), Template Center & Custom Template Creator (`/template-documents`, `/template-documents/new`), Billing & Credit Ledger (`/billing`), User Profile (`/profile`), and all Admin Settings tabs (`/settings/*`). |

