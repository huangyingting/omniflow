# OmniFlow AI — Spec-Driven Product Creation & Engineering Platform

A production-ready, full-stack replica of **OmniFlow AI** (`omniflowai.com` & `app.omniflowai.com`) built with **Next.js 16 (App Router)**, **NextAuth v4**, **Prisma 7** (SQLite for local development and PostgreSQL for production), **Tailwind CSS**, and **TypeScript**.

---

## Key Capabilities

1. **Unified 3-Stage Spec-Driven Builder (`01 PRD` → `02 UI/UX Design` → `03 Full-Stack Product`)**
   - Natural-language project creation with `@KnowledgeBase` RAG grounding and Official Templates.
   - Provisioning of 7 synchronized project artifacts (`PRD`, `UI_DESIGN`, `TECH_DESIGN`, `DEVELOPMENT_PLAN`, `QA_PLAN`, `RELEASE_PLAN`, `PRODUCT`).
   - Bidirectional **Cross-Document Sync (`DocumentSyncEvent`)** and **Version History (`V1`, `V2`, ...)** with 1-click revert.
2. **Multi-Page Interactive UI/UX Wireframe Studio**
   - 4 interactive screen blueprints per project, 5 switchable design systems (`Modern Minimal`, `Cyberpunk Dark`, `Glassmorphic SaaS`, `Warm Editorial`, `Enterprise Slate`), and Desktop / Tablet / Mobile viewport simulation.
3. **Full-Stack Product & Relational Database Studio**
   - Live interactive application preview (`/preview/[docId]`), multi-file source code editor, dual-environment SQL Database Console (`Preview` & `Production`) with `SELECT`/`INSERT`/`UPDATE`/`DELETE`/`CREATE TABLE` execution, point-in-time snapshots, 5 third-party Connectors, Custom Domain & SSL binding, and GitHub/Bitbucket repository sync.
4. **2-Step AI Development Planner (`/devplan/[docId]`) & Project Workspace (`/projects/[id]/**`)**
   - Generates Epics, User Stories, Story Points, Sprints, and Milestones by team specialty and materializes them into the Kanban Issue Board, Sprint & Milestone Planner, Organization Path tree, Velocity Snapshot, and Weekly Status Report.
5. **RAG Knowledge Base (`/knowledge-base/[id]`), AI Ideation (`/ideas/[id]`), and Template Center (`/template-documents`)**
   - Document chunking and grounded Q&A with exact file and chunk citations.
6. **Fail-Closed Invite-Only Account Admission & RBAC**
   - Public self-registration is disabled (`REGISTRATION_MODE="invite-only"`).
   - Single-use, expiring invitation tokens hashed with **SHA-256** (`AccountInvitation`).
   - Role-based access control (`ADMIN`, `MEMBER`, `VIEWER`), token rotation, revocation, CLI-only initial admin bootstrap, and immutable `AuditLog` entries.
   - Zero dummy user accounts or pre-populated demo projects.

---

## Quick Start (Local Development with SQLite)

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client & apply SQLite migrations
npm run prisma:generate
npm run db:migrate:dev

# 3. Bootstrap the initial ADMIN account via CLI
npm run admin:bootstrap -- \
  --email="admin@omniflowai.local" \
  --password="StrongPassword!2025" \
  --name="Workspace Admin" \
  --org="OmniFlow Engineering"

# 4. Run the development server
npm run dev
```

Visit `http://localhost:3000` for the public marketing & free tools experience, or `http://localhost:3000/login` to sign in and issue single-use team invitations at `http://localhost:3000/admin/invitations`.

---

## Testing & Verification

```bash
# TypeScript verification
npm run typecheck

# Run automated unit & integration tests (Vitest)
npm test

# Production Next.js build
npm run build
```

---

## Production Deployment (PostgreSQL & Docker)

See `Dockerfile`, `docker-compose.yml`, and `.env.production.example`.

```bash
# Validate both SQLite and PostgreSQL Prisma schemas
npm run db:validate:sqlite
npm run db:validate:postgres

# Deploy with Docker Compose
docker compose up --build -d
```

---

## Engineering & Product Documentation (`docs/`)

1. [`docs/01_EXPLORATION_AND_SCENARIO_COVERAGE.md`](docs/01_EXPLORATION_AND_SCENARIO_COVERAGE.md)
2. [`docs/02_ADR_ARCHITECTURE_DECISION_RECORDS.md`](docs/02_ADR_ARCHITECTURE_DECISION_RECORDS.md)
3. [`docs/03_PRD_PRODUCT_REQUIREMENTS_DOCUMENT.md`](docs/03_PRD_PRODUCT_REQUIREMENTS_DOCUMENT.md)
4. [`docs/04_TECHNICAL_AND_UX_SPECIFICATION.md`](docs/04_TECHNICAL_AND_UX_SPECIFICATION.md)
5. [`docs/05_ARCHITECTURE_AND_DATA_MODEL.md`](docs/05_ARCHITECTURE_AND_DATA_MODEL.md)
6. [`docs/06_IMPLEMENTATION_PLAN_AND_BACKLOG.md`](docs/06_IMPLEMENTATION_PLAN_AND_BACKLOG.md)
7. [`docs/07_FEATURE_PARITY_MATRIX.md`](docs/07_FEATURE_PARITY_MATRIX.md)
