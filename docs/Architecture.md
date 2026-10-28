# CivicConnect Architecture

## Purpose

CivicConnect connects residents, civic staff, authorities, and administrators
around the lifecycle of a civic issue: submission, verification, triage,
assignment, repair, confirmation, and audit.

## System context

```text
Citizen Mobile App ─┐
                    ├─ HTTPS/JSON ─> Node.js API ─┬─ PostgreSQL/PostGIS
Admin Dashboard ────┘                             ├─ Supabase Auth/Storage
                                                  ├─ S3-compatible media
                                                  ├─ AI Service
                                                  └─ notifications/jobs

Supabase Edge Function ──> report classification path
Nightly GitHub Action ───> batch processor ──> pending AI jobs
```

The Node.js API is the system boundary for authentication, authorization,
validation, persistence, workflows, and integration calls. Clients do not
write directly to operational tables.

## Service responsibilities

### Backend API

`backend/src/index.ts` starts Express, loads configuration, connects to the
database, registers routes, and starts scheduled processes. Route modules
delegate domain behavior to controllers and services. Sequelize models
represent users, roles, permissions, issues, repairs, departments,
jurisdictions, notifications, audit records, AI feedback, and processing jobs.

### Admin dashboard

`admin-dashboard/` is a Vite-built React application for operational users.
It consumes the API, displays report and jurisdiction workflows, and provides
administrative controls. It must not contain service credentials or duplicate
backend authorization decisions.

### Mobile application

`mobile/` is the Flutter citizen client. It handles sign-in, report capture,
location-aware submission, status tracking, notifications, and profile
workflows. The API endpoint is supplied through environment configuration.

### AI service and processing

`ai_service/main.py` exposes image classification. The backend uses the result
as an input to verification and priority logic; AI output is not a replacement
for civic authority decisions. `scripts/batch_processor/` handles scheduled
processing of pending jobs using hosted model and storage integrations.

### Data and storage

PostgreSQL stores transactional data and spatial boundaries. Supabase provides
authentication and project services. S3-compatible storage holds uploaded
media. Secrets are injected at runtime and are never part of client bundles or
the repository.

## Report lifecycle

1. A citizen submits a report with location, description, category, and optional
   media.
2. The API validates the request and persists the issue and audit event.
3. AI and priority services add verification and triage signals where enabled.
4. Routing assigns the issue to an appropriate department or authority.
5. Staff update status and record repair evidence.
6. The citizen confirms or disputes the resolution.
7. Notifications, analytics, audit history, and feedback capture the outcome.

## Design principles

- Server-side authorization is authoritative.
- Spatial decisions use validated coordinates and configured boundaries.
- AI predictions are explainable signals with confidence and fallback paths.
- Every workflow mutation should be auditable.
- External integrations fail explicitly and must not silently report success.
- New services must have a documented owner, health check, configuration
  contract, and targeted validation command.
