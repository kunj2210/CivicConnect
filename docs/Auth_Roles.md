# CivicConnect Authentication and Roles

## Authentication model

CivicConnect uses Supabase credentials and server-side token verification. The
backend receives a bearer token, verifies it in authentication middleware, and
attaches the authenticated identity to the request context.

The dashboard and mobile app may hold public client configuration such as a
Supabase anonymous key. Service-role keys, database credentials, storage
secrets, LLM keys, and model-host tokens belong only in server or hosting
secret stores.

## Role model

The project contains role, permission, user-role, department, and jurisdiction
models. The effective permission is determined by the authenticated user,
assigned roles, resource ownership, department assignment, and the route's
policy. The following is the operational intent:

| Actor | Typical capabilities |
|---|---|
| Citizen | Create and track own reports, upload evidence, confirm or dispute resolutions |
| Staff | Work assigned reports, update progress, attach repair evidence |
| Authority | Review jurisdiction reports, assign work, confirm operational outcomes |
| Administrator | Manage users, roles, departments, boundaries, and system settings |

The exact permission matrix is implementation-owned by
`backend/src/middleware/rbacMiddleware.ts` and the role/permission models.
Documentation must be updated whenever that policy changes.

## Security requirements

- Verify tokens on every protected request.
- Check ownership and jurisdiction in addition to role.
- Log privileged mutations and destructive actions.
- Do not trust role fields supplied by clients.
- Revoke or rotate compromised credentials at the provider.
- Return indistinguishable authorization failures where revealing resource
  existence would create a privacy risk.
