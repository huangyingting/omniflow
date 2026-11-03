# 05. System Architecture & Data Model

## 1. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                        Next.js 16 App Router (TypeScript)                         |
|                                                                                   |
|  +---------------------------+  +----------------------------------------------+  |
|  | Public Marketing & Docs   |  | Authenticated OmniFlow Workspace             |  |
|  | - / /pricing /faq /blog   |  | - /index (Spec-Driven Builder Home)          |  |
|  | - /case-studies /about    |  | - /docs/[docId] (PRD | UI/UX | Product IDE)  |  |
|  | - /use-cases /contact     |  | - /devplan/[docId] (Roles & Sprint Planner)  |  |
|  | - /free-tools (6 Tools)   |  | - /projects/[id]/* (Planner, Board, Reports) |  |
|  | - /prd-template           |  | - /knowledge-base/* (Chunking & RAG Chat)    |  |
|  | - /docs (Documentation)   |  | - /ideas/* /apps /template-documents/*       |  |
|  | - /login /invite/[token]  |  | - /billing /profile /settings/*              |  |
|  +-------------+-------------+  | - /admin/invitations (Invite RBAC & Audits)  |  |
|                |                +----------------------+-----------------------+  |
|                v                                       v                          |
|  +-----------------------------------------------------------------------------+  |
|  |                  Next.js API Route Handlers & Domain Services               |  |
|  |                                                                             |  |
|  |  +--------------------------+  +-----------------------------------------+  |  |
|  |  | Account Admission & RBAC |  | OmniFlow Spec-Driven & AI Engine        |  |  |
|  |  | - NextAuth v4 JWT Auth   |  | - Joy AI PRD / Tech / QA / Release Gen  |  |  |
|  |  | - SHA-256 Invite Tokens  |  | - Multi-Page UI/UX Wireframe & Theme    |  |  |
|  |  | - Single-Use & Expiry    |  | - Full-Stack App Code, Preview & SQL DB |  |  |
|  |  | - Role Enforcement       |  | - Cross-Document Sync & Version History |  |  |
|  |  | - Immutable AuditLog     |  | - Knowledge Base Chunking & RAG Search  |  |  |
|  |  +--------------------------+  +-----------------------------------------+  |  |
|  +--------------------------------------+--------------------------------------+  |
+-----------------------------------------|-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                 Prisma 7 Data Access Layer (Dual Driver Adapter)                  |
|   - Local Dev / Test: @prisma/adapter-better-sqlite3 (prisma/schema.prisma)       |
|   - Production:       @prisma/adapter-pg             (prisma/schema.postgres.prisma)|
+-----------------------------------------------------------------------------------+
```

---

## 2. Complete Relational Data Model (Prisma Schema)

The database schema unifies the **NextAuth + Invite-Only Account Admission** models from `../Arcade` with the **OmniFlow AI** entity graph reverse-engineered from `app.omniflowai.com`.

### 2.1 Identity, Organization, Invitation & Audit Entities
1. **`Organization`**:
   - `id` (String, `@id @default(cuid())`)
   - `name`, `description`, `website`, `status` (`"ACTIVE"`)
   - `subscriptionTier` (`"FREE" | "PERFORMANCE" | "TEAMS" | "SCALE" | "ENTERPRISE"`)
   - `subscriptionStatus` (`"ACTIVE"`), `subscriptionInterval` (`"MONTHLY" | "YEARLY"`)
   - `credits` (Int, default `2000`), `monthFreeCreditUsed` (Int, default `0`)
   - `availableSeats` (Int, default `15`), `totalSeats` (Int, default `20`)
   - `apiKey` (String, nullable)
   - `meta` (String/JSON: stores brand customization palette, typography, dev velocity calibration, and workflow preferences)
2. **`User`**:
   - `id`, `name`, `firstname`, `lastname`, `username`, `email` (`@unique`), `emailVerified`, `image`
   - `passwordHash` (String, bcrypt cost 12)
   - `role` (`"ADMIN" | "MEMBER" | "VIEWER"`, default `"MEMBER"`)
   - `specialty` (`"Product Manager" | "UI/UX Designer" | "Full-Stack Engineer" | "QA Engineer"`, nullable)
   - `department`, `velocity` (Int, default `10`), `status` (`"ACTIVE" | "DISABLED"`, default `"ACTIVE"`)
   - `referralCode` (`@unique`)
   - `organizationId` (FK -> `Organization.id`)
   - `meta` (String/JSON: FTUE tour state, preferences)
3. **`AccountInvitation`**:
   - `id`, `email`, `normalizedEmail`, `activeForEmail` (`@unique`, nullable — enforces at most one active pending invitation per email)
   - `role` (`"ADMIN" | "MEMBER" | "VIEWER"`, default `"MEMBER"`)
   - `organizationId` (FK -> `Organization.id`, nullable)
   - `tokenHash` (`@unique`, SHA-256 hex digest of the single-use invitation token)
   - `expiresAt`, `acceptedAt`, `revokedAt`
   - `invitedById` (FK -> `User.id`), `acceptedUserId` (`@unique`, FK -> `User.id`)
4. **`AuditLog`**:
   - `id`, `actorId` (FK -> `User.id`), `actorEmail`, `action`, `targetType`, `targetId`, `summary`, `metadata` (JSON string), `ipAddress`, `userAgent`, `createdAt`
5. **`Account`**, **`Session`**, **`VerificationToken`**:
   - Standard NextAuth adapter models.

### 2.2 Project, Planning, Backlog & Issue Board Entities
6. **`Project`**:
   - `id`, `name`, `shortName` (e.g. `"SH10"`), `description`
   - `status` (`"CREATED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED"`)
   - `access` (`"SELF" | "TEAM" | "ORGANIZATION"`)
   - `storyPoint` (Int), `completedStoryPoint` (Int), `progress` (Int `0..100`)
   - `dueDate` (DateTime, nullable)
   - `organizationId` (FK -> `Organization.id`), `creatorUserId` (FK -> `User.id`), `ownerUserId` (FK -> `User.id`)
   - `meta` (JSON string: customized workflow steps, active design style, connected repo, weekly reports)
7. **`WorkPlan`** (Milestones, Sprints & Backlog containers):
   - `id`, `name`, `description`
   - `type` (`"BACKLOG" | "MILESTONE" | "SPRINT"`)
   - `status` (`"CREATED" | "IN_PROGRESS" | "COMPLETED"`)
   - `storyPoint`, `completedStoryPoint`, `progress`
   - `plannedStartDate`, `plannedEndDate`, `actualStartDate`, `actualEndDate`
   - `projectId` (FK -> `Project.id`), `parentWorkPlanId` (self-FK), `ownerUserId` (FK -> `User.id`)
8. **`Issue`** (Buildables, Epics, User Stories, Tasks, Bugs):
   - `id`, `name` (e.g., `"PRD"`, `"UI_DESIGN"`, or `"Epic 1: Automated Triage"`), `shortName` (e.g., `"SH10-1"`), `description`
   - `type` (`"BUILDABLE" | "EPIC" | "STORY" | "TASK" | "BUG"`)
   - `status` (`"CREATED" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED"`)
   - `priority` (`"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"`)
   - `storyPoint` (Int), `completedStoryPoint` (Int), `progress` (Int)
   - `plannedStartDate`, `plannedEndDate`
   - `projectId` (FK -> `Project.id`), `workPlanId` (FK -> `WorkPlan.id`, nullable), `parentIssueId` (self-FK, nullable)
   - `creatorUserId`, `ownerUserId` (FK -> `User.id`)
   - `meta` (JSON string: acceptance criteria, role specialty)

### 2.3 Spec-Driven Documents, Version History, Sync & Joy Chat Entities
9. **`Document`**:
   - `id`, `name`, `description`
   - `type` (`"PRD" | "UI_DESIGN" | "TECH_DESIGN" | "DEVELOPMENT_PLAN" | "QA_PLAN" | "RELEASE_PLAN" | "PRODUCT" | "PROPOSAL" | "RELEASE_NOTE" | "BUSINESS_STRATEGY"`)
   - `status` (`"CREATED" | "IN_PROGRESS" | "PUBLISHED" | "ARCHIVED"`)
   - `access` (`"SELF" | "TEAM" | "ORGANIZATION" | "PUBLIC"`)
   - `content` (Text: structured Markdown/HTML/JSON content of the document)
   - `currentVersion` (Int, default `1`)
   - `url` (String, live preview/published URL for `PRODUCT` documents)
   - `projectId` (FK -> `Project.id`, nullable), `issueId` (FK -> `Issue.id`, nullable), `organizationId` (FK -> `Organization.id`), `creatorUserId` (FK -> `User.id`), `templateDocumentId` ( nullable)
   - `meta` (JSON string storing type-specific state:
     - For `PRD`: structured sections, template name, follow-up suggestions
     - For `UI_DESIGN`: design style id, color tokens, multi-page screen definitions & HTML/component trees
     - For `DEVELOPMENT_PLAN`: selected engineering roles, generated Epics/Stories/Tasks tree, sprint schedule confirmation state
     - For `PRODUCT`: multi-file code tree `files`, visual `uiEdits`, `previewDb` & `productionDb` SQLite/JSON tables + SQL query history, `connectors`, `domains`, `gitConfig`, `deployments` & build logs)
10. **`DocumentVersion`**:
    - `id`, `documentId` (FK -> `Document.id`), `versionNumber` (Int), `label` (e.g. `"V1"`, `"V2 - Added SLA Escalation"`), `content` (Text), `metaSnapshot` (Text), `createdById` (FK -> `User.id`), `createdAt`
11. **`DocumentSyncEvent`**:
    - `id`, `projectId` (FK -> `Project.id`), `sourceDocumentId` (FK -> `Document.id`), `targetDocumentId` (FK -> `Document.id`)
    - `sourceVersion` (Int), `summary` (String), `status` (`"PENDING" | "APPLIED" | "DISMISSED"`), `createdAt`, `appliedAt`
12. **`ChatSession`** & **`ChatMessage`**:
    - `ChatSession`: `id`, `name`, `targetEntityType` (`"DOCUMENT" | "IDEA" | "KNOWLEDGE_BASE"`), `targetEntityId`, `access`, `organizationId`, `userId`, `meta`, `createdAt`, `updatedAt`
    - `ChatMessage`: `id`, `chatSessionId` (FK -> `ChatSession.id`), `role` (`"user" | "assistant" | "system"`), `content`, `meta` (JSON: build activity steps, version pill, follow-up chips, citations), `createdAt`

### 2.4 Knowledge Base, Templates, Credits & Integrations Entities
13. **`KnowledgeBase`** & **`KnowledgeBaseFile`**:
    - `KnowledgeBase`: `id`, `name`, `description`, `status` (`"ACTIVE"`), `organizationId`, `creatorUserId`, `meta`, `createdAt`, `updatedAt`
    - `KnowledgeBaseFile`: `id`, `knowledgeBaseId` (FK -> `KnowledgeBase.id`), `fileName`, `fileSize` (Int), `mimeType`, `status` (`"INDEXED" | "PROCESSING"`), `chunkCount` (Int), `content` (Text), `chunksJson` (Text: JSON array of indexed text chunks), `uploadedById`, `createdAt`
14. **`TemplateDocument`**:
    - `id`, `name`, `description`, `category` (`"PRODUCT" | "DOCUMENT"`), `type` (`"PRD" | "UI_DESIGN" | "TECH_DESIGN" | "DEVELOPMENT_PLAN" | "QA_PLAN" | "RELEASE_NOTE" | "BUSINESS_STRATEGY" | "PRODUCT"`), `access` (`"PUBLIC" | "ORGANIZATION" | "SELF"`), `promptInstructions` (Text), `sampleOutput` (Text), `previewMeta` (Text), `organizationId`, `creatorUserId`, `isSystem` (Boolean)
15. **`CreditLedgerEntry`**:
    - `id`, `organizationId` (FK -> `Organization.id`), `userId` (FK -> `User.id`, nullable), `amount` (Int: positive for `CREDITED`, negative for `DEBITED`), `type` (`"CREDITED" | "DEBITED"`), `action` (e.g. `"Starter Plan Allocation"`, `"PRD Generation"`, `"UI/UX Design Generation"`, `"Product Build"`, `"Credit Top-Up"`), `balanceAfter` (Int), `meta` (Text), `createdAt`
16. **`IntegrationConnection`**:
    - `id`, `organizationId` (FK -> `Organization.id`), `provider` (`"GITHUB" | "BITBUCKET" | "JIRA" | "SLACK" | "LINEAR" | "NOTION" | "TRELLO" | "ASANA"`), `status` (`"CONNECTED" | "DISCONNECTED"`), `configJson` (Text), `connectedById`, `updatedAt`
