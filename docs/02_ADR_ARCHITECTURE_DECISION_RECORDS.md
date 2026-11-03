# 02. Architecture Decision Records (ADRs)

## ADR-001: Unified Next.js App Router Monolith Replacing Split Marketing + SPA Architecture

### Status
Accepted

### Context
Upstream OmniFlow separates `www.omniflowai.com` (public marketing, free tools, and docs) and `app.omniflowai.com` (Vite + React Router SPA backed by a Node.js `/api/*` server). Maintaining two separate frontend deployments introduces cross-origin authentication friction, duplicated design tokens, and deployment complexity.

### Decision
We consolidate both the public marketing/documentation/free-tools experience and the authenticated application workspace into a single **Next.js (App Router, TypeScript, Tailwind CSS)** application:
- Public routes (`/`, `/pricing`, `/faq`, `/case-studies`, `/use-cases`, `/ai-for-product-managers`, `/free-tools`, `/prd-template`, `/docs/**`, `/blog`, `/about`, `/contact`, `/login`, `/invite/[token]`) are served directly alongside authenticated workspace routes (`/index`, `/dashboard`, `/org`, `/docs/[docId]`, `/devplan/[docId]`, `/projects/[id]/**`, `/apps`, `/ideas/**`, `/knowledge-base/**`, `/template-documents/**`, `/billing`, `/profile`, `/settings/**`, `/admin/invitations`).
- Route resolution for `/docs` vs `/docs/[docId]`:
  - Public documentation lives at `/documentation/**` and is also accessible from the marketing header `/docs-portal`, while `/docs` in the authenticated app renders the Organization Documents hub and `/docs/[docId]` renders the Unified Spec/Design/Product Workspace (matching `app.omniflowai.com/docs` and `app.omniflowai.com/docs/:docId`). Additionally, visiting `/docs` when unauthenticated renders the public Documentation Portal (`omniflowai.com/docs`), and when authenticated renders the App Documents Workspace with a toggle to view Product Documentation.

### Consequences
- Single build, test, and Docker deployment artifact.
- Seamless transition from marketing prompt input or Free PRD Template directly into the authenticated workspace.

---

## ADR-002: Fail-Closed Invite-Only Account Admission with NextAuth v4 & CLI Admin Bootstrap

### Status
Accepted

### Context
The project requires replacing open self-signup with **invite-only registration** featuring single-use, expiring invitation codes, role assignment, invitation rotation/revocation, CLI-only initial admin bootstrap, and comprehensive audit logging, using `../Arcade` as the canonical reference implementation. Furthermore, **no dummy data or demo user accounts** may be seeded.

### Decision
1. **Authentication Engine**: Use `next-auth` v4 with `CredentialsProvider` (`email` + `bcrypt` password verification) and JWT session strategy, backed by Prisma (`User`, `Account`, `Session`, `VerificationToken`, `AccountInvitation`, `AuditLog`).
2. **Fail-Closed Admission Policy**: `ACCOUNT_ADMISSION_MODE` defaults to `"invitation-only"`. Any unknown or malformed value resolves to `"invitation-only"`. Public self-registration without a valid single-use invitation token returns `403 ACCOUNT_INVITATION_REQUIRED`.
3. **Token Security & Single-Active-Invite Invariant**:
   - Raw 256-bit random tokens (`randomBytes(32).toString("base64url")`) are returned **only once** upon creation/rotation and never persisted in the database.
   - Only `tokenHash = sha256(token)` is persisted (`@unique`).
   - `activeForEmail` (`@unique`, nullable) enforces at the database constraint level that at most one pending invitation can exist per normalized email address.
4. **CLI-Only Root Admin Bootstrap**:
   - Initial `ADMIN` provisioning occurs exclusively via `npm run bootstrap:admin -- --email <email> --password-stdin` (`scripts/bootstrap-admin.ts`).
   - When an admin user is bootstrapped or an invited user registers, if they do not yet belong to an `Organization`, a real workspace `Organization` is provisioned for them with initial operational credits (`2,000` credits) and official system templates are lazily ensured. Zero demo users or fake projects exist in the database.
5. **Audit Logging**:
   - Every sensitive lifecycle event (`admin.bootstrap`, `account_invitation.create`, `account_invitation.rotate`, `account_invitation.revoke`, `account_invitation.accept`, `user.role_updated`, `project.created`, `document.synced`, `product.deployed`) writes an immutable `AuditLog` record.

### Consequences
- Eliminates unauthorized account creation and credential exposure.
- Full compliance with `../Arcade/docs/NEXTAUTH_INVITE_ONLY_SPEC.md`.

---

## ADR-003: Dual SQLite (Development) and PostgreSQL (Production) Data Layer with Prisma 7

### Status
Accepted

### Context
The application must run out-of-the-box in local development using **SQLite** and support **PostgreSQL** in production, with schema parity and clean migrations.

### Decision
- Use **Prisma 7** (`@prisma/client` + `prisma.config.ts`) with `@prisma/adapter-better-sqlite3` when `DATABASE_URL` begins with `file:` (SQLite) and `@prisma/adapter-pg` (`pg.Pool`) when `DATABASE_URL` begins with `postgres://` or `postgresql://`.
- Maintain synchronized schemas:
  - `prisma/schema.prisma` (`provider = "sqlite"`)
  - `prisma/schema.postgres.prisma` (`provider = "postgresql"`)
- Provide npm scripts (`db:generate`, `db:migrate`, `db:push`, `db:generate:postgres`, `db:migrate:postgres`) matching the proven pattern in `../Arcade`.

### Consequences
- Zero external database dependencies required for local development and automated CI/E2E testing, while supporting horizontally scalable PostgreSQL in production.

---

## ADR-004: Bidirectional Spec-Driven Synchronization Engine (`PRD <-> UI/UX Design <-> Product`)

### Status
Accepted

### Context
OmniFlow's core value proposition is that specs, designs, engineering plans, and full-stack product code stay synchronized (`GET /api/documents/:id/sync-status`, `POST /api/documents/:id/apply-sync`, `POST /api/documents/:id/save-version`, `POST /api/documents/:id/confirm-revert`).

### Decision
We model explicit document versioning and cross-document synchronization in the database:
- Every `Project` automatically provisions the 7 canonical `Document` artifacts (`PRD`, `UI_DESIGN`, `TECH_DESIGN`, `DEVELOPMENT_PLAN`, `QA_PLAN`, `RELEASE_PLAN`, `PRODUCT`) and 7 corresponding `Buildable` / `Issue` records.
- Whenever an upstream artifact (e.g., `PRD`) is generated or updated (creating a new `DocumentVersion`), the synchronization service records `DocumentSyncEvent` rows (`status = "PENDING"`) targeting downstream artifacts (`UI_DESIGN`, `TECH_DESIGN`, `DEVELOPMENT_PLAN`, `QA_PLAN`, `RELEASE_PLAN`, `PRODUCT`).
- Downstream workspaces display a live **Sync Status Badge** (`Pending Sync from PRD v2`) allowing the user to preview changes and click **Apply Sync** (`POST /api/documents/[id]/apply-sync`) or **Revert to Version** (`POST /api/documents/[id]/confirm-revert`), which propagates the updated requirements into the UI/UX wireframes, task breakdown, and full-stack product code.

### Consequences
- Faithfully replicates OmniFlow's living spec architecture rather than treating documents as disconnected static pages.

---

## ADR-005: Deterministic + LLM-Compatible Generation Engine for PRD, Multi-Page UI, DevPlan, and Full-Stack Product

### Status
Accepted

### Context
Users must be able to generate rich, domain-accurate PRDs, multi-page UI/UX wireframes with switchable design systems, role-calibrated Sprint/Task breakdowns, Full-Stack application code (with working live HTML/React preview, editable CSS/text, virtual SQLite/SQL table inspection, and deployment), Knowledge Base RAG answers, and Free AI Tool outputs—both when an external `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` is configured and in self-contained environments without external API keys.

### Decision
Implement a hybrid **OmniFlow AI Synthesis Engine** (`src/lib/ai-engine/*`):
- If `OPENAI_API_KEY` is configured, it can invoke the upstream LLM API with structured prompts.
- Simultaneously, it includes a deeply engineered, domain-aware synthesis engine that parses the user's prompt, project metadata, linked Knowledge Base chunks, and upstream PRD epics/stories to generate:
  1. **Structured PRDs**: Problem & Opportunity, Target Personas, KPI Metrics, Epics & User Stories with Acceptance Criteria, Functional & Non-Functional Requirements, and Risks.
  2. **Multi-Page Interactive UI/UX Designs**: Complete multi-screen interactive previews (Dashboard, Core Workflow, Analytics/Detail, Settings) across 5 selectable design styles (`Modern Minimal`, `Cosmic Dark`, `Enterprise Clean`, `Glassmorphic`, `Brutalist Bold`) and 3 viewports (`Desktop`, `Tablet`, `Mobile`).
  3. **Full-Stack Product Code & Virtual Database**: Multi-file application source tree (`App.tsx`, `schema.sql`, `api/routes.ts`, `styles.css`, `package.json`), interactive live preview iframe with visual click-to-edit DOM inspector (`UI Edits`), working SQL database console against real project tables/rows (`Preview` & `Production` environments with snapshot & reset), connector bindings, domain bindings, and deployment logs.
  4. **Knowledge Base Chunking & TF-IDF/Semantic RAG**: Real file text extraction, chunk splitting, indexing, and grounded citation-backed answers.

### Consequences
- 100% functional, responsive, and deterministic behavior in all environments without relying on hard-coded dummy state.
