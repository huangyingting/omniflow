# 04. Technical & UI/UX Specification

## 1. Visual Design System & UX Tokens

Derived from computed CSS inspections of `omniflowai.com` and `app.omniflowai.com`:

### 1.1 Color Palette
- **Marketing & Dark Theme Surfaces**:
  - Background Primary: `#06050A` (Deep Obsidian)
  - Background Elevated / Card: `#0F0D18` / `rgba(255, 255, 255, 0.04)`
  - Border Subtle: `rgba(255, 255, 255, 0.08)`
  - Border Accent: `rgba(142, 133, 255, 0.35)`
  - Brand Primary Accent: `#6E56CF` / `#8E85FF` (Electric Violet)
  - Brand Secondary Gradient: `linear-gradient(135deg, #8E85FF 0%, #6366F1 50%, #38BDF8 100%)`
- **Authenticated App Workspace Surfaces**:
  - Left Navigation Sidebar: `#0F1117` (Dark Slate) with `#8E85FF` active indicator pill
  - Workspace Canvas: Clean High-Contrast Surface (`#F8FAFC` / `#FFFFFF` in editor cards, `#0B0D13` in dark preview/code panels)
  - Status Tokens:
    - `CREATED` / `TODO`: `#64748B` (Slate)
    - `IN_PROGRESS` / `GENERATING`: `#6366F1` (Indigo)
    - `COMPLETED` / `DONE` / `PUBLISHED`: `#10B981` (Emerald)
    - `PENDING_SYNC` / `WARNING`: `#F59E0B` (Amber)
    - `REVOKED` / `ERROR`: `#EF4444` (Rose)

### 1.2 Typography & Layout
- **Headings & UI Sans**: `Plus Jakarta Sans`, `Inter`, `-apple-system, BlinkMacSystemFont, sans-serif`
- **Display Serif Accent (Marketing Hero)**: `Instrument Serif`, `Georgia, serif`
- **Code & SQL Console**: `JetBrains Mono`, `Fira Code`, `monospace`
- **Responsive Breakpoints**:
  - Mobile (`< 768px`): Collapsible drawer sidebar, stacked Joy chat + document/preview tabs, responsive table cards.
  - Tablet (`768px - 1024px`): Collapsible icon rail sidebar, resizable split pane.
  - Desktop (`>= 1024px`): Persistent 240px left sidebar (collapsible to 64px), 380px Joy AI Assistant left panel + fluid right workspace panel.

---

## 2. Invite-Only Account Admission & Security Specification

Following `../Arcade/docs/NEXTAUTH_INVITE_ONLY_SPEC.md`:

### 2.1 Environment Variables
```env
DATABASE_URL="file:./dev.db" # or postgresql://... in production
NEXTAUTH_SECRET="<cryptographic-secret>"
NEXTAUTH_URL="http://localhost:3000"
ACCOUNT_ADMISSION_MODE="invitation-only"
```

### 2.2 Fail-Closed Admission Policy (`src/lib/account-admission/mode.ts`)
- `resolveAccountAdmissionMode(rawValue)` returns `"open"` **only** when `rawValue?.trim().toLowerCase() === "open"`.
- In all other cases (unset, empty, `"invitation-only"`, or unknown value), it returns `"invitation-only"`.

### 2.3 Cryptographic Token Lifecycle (`src/lib/account-admission/invitations.ts`)
- **Generation**: `randomBytes(32).toString("base64url")` (43 URL-safe characters, 256 bits of entropy).
- **Storage**: `tokenHash = createHash("sha256").update(token.trim()).digest("hex")`. The raw token is never persisted in the database or audit logs.
- **Single-Active-Invite Invariant**:
  - `AccountInvitation.activeForEmail` (`@unique`) is set to `normalizedEmail` while the invitation is pending (`acceptedAt == null && revokedAt == null`), and cleared to `null` when accepted or revoked.
  - `validateInvitationToken(rawToken)` checks:
    1. Token hash exists -> else `404 ACCOUNT_INVITATION_INVALID`
    2. `revokedAt === null` -> else `410 ACCOUNT_INVITATION_REVOKED`
    3. `acceptedAt === null` -> else `409 ACCOUNT_INVITATION_USED`
    4. `expiresAt > now` -> else `410 ACCOUNT_INVITATION_EXPIRED`

### 2.4 CLI-Only Root Admin Bootstrap (`scripts/bootstrap-admin.ts`)
- Executed via:
  ```bash
  printf '%s\n' 'StrongAdminPass123!' | npm run bootstrap:admin -- --email admin@example.com --name "Platform Admin" --password-stdin
  ```
- Validates email format and password minimum length (>= 8 characters).
- Hash password with `bcryptjs` (cost factor 12).
- Upserts the `User` with `role: "ADMIN"`, `status: "ACTIVE"`, provisions their default `Organization` (if not already bound) with `2,000` starter credits and official system document/product templates, and writes an `admin.bootstrap` entry to `AuditLog`.
- No HTTP endpoint can bootstrap an admin user.

---

## 3. REST API Contract Specification

### 3.1 Auth, Invitations & Admin APIs
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/[...nextauth]` | `GET, POST` | Public | NextAuth v4 credentials authentication & session endpoint. |
| `/api/auth/invitation?token=...` | `GET` | Public | Validates an invitation token and returns `{ email, role, expiresAt, organizationName }`. |
| `/api/auth/register` | `POST` | Public (Token gated) | Registers a new user by consuming a valid single-use `invitationToken` in a serializable transaction. |
| `/api/admin/invitations` | `GET, POST` | `ADMIN` | Lists all invitations (`pending`, `accepted`, `expired`, `revoked`) or creates a new single-use invitation and returns its one-time `/invite/<token>` URL. |
| `/api/admin/invitations/[id]` | `PATCH, DELETE` | `ADMIN` | Rotates (`action: "rotate"`) or revokes (`DELETE`) a pending invitation and logs to `AuditLog`. |
| `/api/admin/audit-logs` | `GET` | `ADMIN` | Returns paginated, filterable `AuditLog` entries. |
| `/api/settings/users` | `GET, PATCH` | `ADMIN` / Auth | Lists organization members and allows `ADMIN` to update roles (`ADMIN`, `MEMBER`, `VIEWER`), specialty, velocity, or active status. |

### 3.2 Core OmniFlow Application APIs
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/projects` | `GET, POST` | Auth | Lists accessible projects or creates a new spec-driven Project with its 7 canonical `Document` records, `WorkPlan` backlog, and 7 `Buildable` issues. |
| `/api/projects/[id]` | `GET, PATCH, DELETE` | Auth | Retrieves full project graph (documents, buildables, issues, workplans, milestones, metrics), updates project info, or deletes project. |
| `/api/projects/[id]/issues` | `GET, POST, PATCH, DELETE` | Auth | Creates or updates Epics, Stories, Tasks, Sprints, and Milestones (supporting Planner, Backlog, Milestones, and Kanban Issue Board). |
| `/api/projects/[id]/reports` | `GET, POST` | Auth | Returns project velocity snapshot metrics and generates/saves Weekly Status Reports. |
| `/api/documents` | `GET, POST` | Auth | Lists all organization documents with filtering by `type`, `projectId`, and search query `q`, or creates a standalone document. |
| `/api/documents/[id]` | `GET, PATCH, DELETE` | Auth | Fetches a document with its versions, chat history, and sync status; updates document content/meta/design/product state. |
| `/api/documents/[id]/generate` | `POST` | Auth | Joy AI generation endpoint for `PRD`, `UI_DESIGN`, `TECH_DESIGN`, `DEVELOPMENT_PLAN`, `QA_PLAN`, `RELEASE_PLAN`, and `PRODUCT`, recording version history, chat turns, sync events, and credit usage. |
| `/api/documents/[id]/sync` | `GET, POST` | Auth | Checks `pendingSyncs` or applies upstream spec changes (`apply-sync`) / reverts to a prior `DocumentVersion` (`confirm-revert`). |
| `/api/documents/[id]/database` | `GET, POST` | Auth | Inspects or executes SQL queries (`tables`, `execute-sql`, `snapshot`, `reset`) against the product's isolated `preview` or `production` virtual schema. |
| `/api/documents/[id]/deploy` | `POST` | Auth | Publishes a `PRODUCT` document to `preview` or `production`, records deployment build/runtime logs, and updates `/apps`. |
| `/api/knowledge-base` | `GET, POST` | Auth | Lists or creates Organization Knowledge Bases. |
| `/api/knowledge-base/[id]` | `GET, POST, DELETE` | Auth | Uploads/indexes files into chunks, executes RAG chat queries with citations, or updates KB settings. |
| `/api/ideas` | `GET, POST` | Auth | Lists or creates AI Ideation sessions (`/ideas/[id]`) and supports promoting an idea to a full Project. |
| `/api/template-documents` | `GET, POST` | Auth | Lists official + custom Product and Document templates, clones a template into a new Project/Document, or creates a custom template. |
| `/api/billing` | `GET, POST` | Auth | Returns organization plan, credit balance, and `CreditLedgerEntry` history; processes plan upgrades and credit top-ups (`ADMIN`). |
| `/api/free-tools` | `POST` | Public | Powers the 6 interactive Free AI Generators on `/free-tools` (`prd`, `app-idea`, `ui`, `landing-page`, `brand-name`, `app-name`). |
