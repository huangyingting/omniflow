# 06. Implementation Plan, Task Backlog & Acceptance Criteria

## 1. Phased Implementation Plan

### Phase 1: Project Scaffolding & Dual-Database Layer (`scaffold-and-database`)
1. Initialize Next.js 16 (App Router, TypeScript, Tailwind CSS) project in `/home/azadmin/omniflow`.
2. Configure Prisma 7 (`prisma.config.ts`, `prisma/schema.prisma` for SQLite, `prisma/schema.postgres.prisma` for PostgreSQL) with `@prisma/adapter-better-sqlite3` and `@prisma/adapter-pg`.
3. Create SQL migrations for both SQLite (`prisma/migrations`) and PostgreSQL (`prisma/migrations-postgres`) and verify clean schema application with zero dummy user accounts.

### Phase 2: Invite-Only Account Admission, Auth, CLI Bootstrap & Audit Logging (`implement-auth-and-admission`)
1. Implement `src/lib/account-admission/*` (`mode.ts`, `invitations.ts`, `bootstrap.ts`, `audit.ts`) and `src/lib/auth.ts` (`NextAuthOptions`, session callbacks, RBAC helpers).
2. Implement CLI bootstrap script (`scripts/bootstrap-admin.ts`) supporting `--email`, `--name`, `--password`, and `--password-stdin`.
3. Build REST endpoints:
   - `GET/POST /api/auth/[...nextauth]`
   - `GET /api/auth/invitation`
   - `POST /api/auth/register`
   - `GET/POST /api/admin/invitations`
   - `PATCH/DELETE /api/admin/invitations/[id]`
   - `GET /api/admin/audit-logs`
4. Build UI screens:
   - `/login` (Sign-in page with OmniFlow split layout & feature carousel)
   - `/invite/[token]` (Single-use invitation validation & account registration)
   - `/admin/invitations` (Admin Invitation & Security Audit console)

### Phase 3: OmniFlow Core Domain Services, AI Synthesis Engine & Official Catalog (`implement-omniflow-features` - Backend)
1. Implement lazy system catalog initialization (`src/lib/omniflow/catalog.ts`) that ensures the 10 showcase Product templates and 6 official Document templates (`Generic PRD Document`, `Generic Technical Design`, `Development Task Breakdown`, `Generic QA / Test Plan`, `Business Strategy`, `Release Note`) exist without creating any fake users or fake projects.
2. Implement `src/lib/omniflow/ai-engine.ts` for:
   - Structured PRD generation & section refinement
   - Multi-page UI/UX Design generation across 5 styles & 3 viewports
   - Full-Stack Product code, live HTML/React preview, visual DOM edits, virtual SQL database (`Preview` & `Production`), connectors, custom domains, and deployment logs
   - Development Plan role-based Epic/Story/Task breakdown & Sprint scheduling
   - Technical Design, QA Plan, and Release Plan generation
   - Knowledge Base file chunking & grounded RAG Q&A
   - 6 Public Free AI Tools (`PRD Generator`, `App Idea Generator`, `UI Generator`, `Landing Page Generator`, `Brand Name Generator`, `App Name Generator`)
3. Implement all REST API routes under `/api/projects/**`, `/api/documents/**`, `/api/knowledge-base/**`, `/api/ideas/**`, `/api/template-documents/**`, `/api/billing/**`, `/api/settings/**`, and `/api/free-tools`.

### Phase 4: Marketing Website, Documentation Portal & Authenticated Application UI (`implement-omniflow-features` - Frontend)
1. Build the Public Marketing & Docs experience (`/`, `/pricing`, `/faq`, `/case-studies`, `/use-cases`, `/ai-for-product-managers`, `/free-tools`, `/prd-template`, `/docs` [unauthenticated or `/documentation`], `/blog`, `/about`, `/contact`, `/privacy`, `/terms`).
2. Build the Authenticated App Shell (`AppSidebar` with collapsible navigation, project list, quota bar, `Invite Team` modal, `Upgrade Plan` modal, `Earn Credits` modal, FTUE Onboarding Tour, and User Profile/Billing/Admin dropdown).
3. Build all Authenticated Workspace views:
   - `/index` (Spec-Driven Prompt Builder & Template Showcase)
   - `/dashboard` (My Dashboard)
   - `/org` (All Organization Projects)
   - `/docs` (All Documents Table & Filter)
   - `/docs/[docId]` (Unified Split-Pane Joy AI + PRD Editor / Multi-Page UI Designer / Full-Stack Product IDE + Preview + SQL DB + Deploy + Version Sync)
   - `/devplan/[docId]` (2-step Roles & Sprint/Task Breakdown Planner)
   - `/preview/[docId]` (Standalone Live Application Preview)
   - `/projects/[id]/planning/builder` & `/projects/[id]/planning/info`
   - `/projects/[id]/building/milestones`, `/projects/[id]/building/projectorganizationpath`, & `/projects/[id]/building/issueboard`
   - `/projects/[id]/reporting/snapshot` & `/projects/[id]/reporting/weekly`
   - `/apps`, `/ideas`, `/ideas/[id]`, `/knowledge-base`, `/knowledge-base/[id]`, `/template-documents`, `/template-documents/create/new`, `/billing`, `/profile`, `/settings/*`, `/admin/invitations`.

### Phase 5: Verification, Automated Tests & Deployment Configuration (`tests-and-deployment`)
1. Write unit & integration tests (Vitest) for invite-only admission, token hashing, expiration/revocation/rotation, CLI bootstrap, spec-driven project creation, cross-document sync, and SQL database console.
2. Run Playwright E2E verification against the live running Next.js application covering marketing pages, free tools, CLI admin bootstrap, login, creating an invitation, registering an invited user, creating a spec-driven project, generating PRD -> UI/UX Design -> Product, managing Sprints/Kanban issues, Knowledge Base RAG, and revoking invitations.
3. Add `Dockerfile`, `docker-compose.yml` (with PostgreSQL service), `.env.example`, `.env.production.example`, and `README.md`.

---

## 2. Prioritized Task Backlog & Acceptance Criteria

| ID | Feature / Story | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| `BL-01` | Dual SQLite/Postgres Prisma Setup | P0 | `npm run db:generate` and `npm run db:generate:postgres` both succeed; SQLite database starts with 0 users and 0 projects. |
| `BL-02` | CLI Admin Bootstrap | P0 | `npm run bootstrap:admin` creates an `ADMIN` user, provisions their Organization with 2,000 starter credits, and writes `admin.bootstrap` to `AuditLog`. |
| `BL-03` | Fail-Closed Invite-Only Registration | P0 | `POST /api/auth/register` without a valid token returns `403`. Creating an invite in `/admin/invitations` produces a single-use `/invite/[token]` link that expires, supports rotation/revocation, and can be used exactly once. |
| `BL-04` | Marketing Site & Free AI Tools | P0 | `/`, `/pricing`, `/faq`, `/case-studies`, `/use-cases`, `/ai-for-product-managers`, `/free-tools`, `/prd-template`, `/docs`, `/blog`, `/about`, `/contact` render responsively on desktop and mobile with working interactive generators. |
| `BL-05` | Spec-Driven Project Creation (`/index`) | P0 | Submitting a prompt on `/index` creates a `Project` with a `shortName`, `BACKLOG` workplan, 7 `BUILDABLE` issues, and 7 `Document` records, then opens `/docs/[prdDocId]` and generates `V1` of the PRD. |
| `BL-06` | Unified Spec -> Design -> Product Workspace (`/docs/[docId]`) | P0 | Top bar switches between `1 PRD`, `2 UI/UX Design`, `3 Product` (+ customizable workflow stages). `Make Design` generates multi-page wireframes with style/viewport switching; `Make Product` generates multi-file code, live preview, visual UI edits, Preview/Prod SQL console, connectors, and deployment logs. |
| `BL-07` | Cross-Document Sync & Version History | P1 | Updating a PRD creates a `PENDING` `DocumentSyncEvent` on downstream UI/Tech/Product docs; clicking `Apply Sync` updates the downstream artifact and increments `DocumentVersion`. |
| `BL-08` | DevPlan & Agile Project Suite (`/devplan/[docId]` & `/projects/[id]/*`) | P1 | `/devplan/[docId]` generates Epics/Stories/Tasks by role and schedules Sprints/Milestones that appear in `/projects/[id]/building/milestones`, `projectorganizationpath`, `issueboard`, and `reporting/*`. |
| `BL-09` | Knowledge Base RAG, Ideas & Template Center | P1 | Users can create a Knowledge Base, upload files, inspect chunks, and get grounded RAG answers; create Ideas and promote them to Projects; clone Product/Document templates or author custom templates. |
| `BL-10` | Billing, Credit Ledger & Admin Settings | P1 | `/billing` displays plan tier, credit balance, and filterable `CreditLedgerEntry` history (`All`, `Credited`, `Debited`); `/settings/*` manages integrations, GitHub/Bitbucket, team users/roles, dev velocity, brand customization, and referrals. |
