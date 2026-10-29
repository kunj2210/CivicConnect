# CivicConnect API Specification

This is the canonical contract index for the Express API. The detailed
request examples and Postman workflow remain in
[API_TESTING.md](./API_TESTING.md).

## Base URL and conventions

- Local base URL: `http://localhost:5000`
- API prefix: `/api`
- JSON responses use HTTP status codes to indicate success or failure.
- Protected routes require the authenticated user's bearer token.
- Multipart endpoints are used for report and repair media.
- IDs are opaque values; clients must not infer database relationships from
  their format.

## Route groups

| Group | Route module | Responsibility |
|---|---|---|
| Health | `GET /health` | Service liveness |
| Auth | `/api/auth` | Login, registration, profile, password workflows |
| Users | `/api/users` | Profiles, devices, leaderboard, staff management |
| Reports | `/api/reports` | Issue creation, query, workflow, AI feedback |
| Departments | `/api/departments` | Department administration |
| System | `/api/system` | Wards, zones, ULB boundaries, protected maintenance actions |
| Notifications | `/api/notifications` | User notifications |
| Analytics | `/api/analytics` | Operational and executive metrics |
| Audit | `/api/audit-logs` | Auditable activity queries |
| Uploads | `/api/uploads` | Presigned media upload operations |
| WhatsApp | `/api/whatsapp` | External webhook integration |

## Error contract

Clients should treat any non-2xx response as a failed operation. A response
should provide a safe human-readable message and, where available, a stable
error code. Clients must not display stack traces, SQL errors, provider
credentials, or internal file paths.

## Authorization

Authentication proves identity; route middleware and service-level checks
authorize the requested resource and action. A user must not gain access by
changing an ID in a URL or request body. Administrative and destructive
operations require explicit role/permission checks and audit events.

## Compatibility rules

- Additive response fields are preferred for compatible changes.
- Do not rename or remove fields without a migration and client impact review.
- Document new routes in this file and add an executable example to
  `API_TESTING.md`.
- Validate uploaded files by type, size, and content before persistence.
