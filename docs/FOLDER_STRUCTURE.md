# CivicConnect Project Structure

CivicConnect is a multi-service monorepo. Its organization takes inspiration
from production-oriented repositories, while keeping deployable surfaces,
terminology, and documentation independent to CivicConnect. Root-level
commands and documentation support cross-service work.

```text
CivicConnect/
├── .agents/                 # Workspace-scoped agent instructions
├── .github/                 # CI, scheduled jobs, and Dependabot
├── AI-Related-Files/        # Versioned model binaries and AI assets
├── admin-dashboard/         # React + Vite administration web app
├── ai_service/              # Python FastAPI image-classification service
├── backend/                 # Node.js + Express + TypeScript API
├── mobile/                  # Flutter citizen application
├── supabase/                # Supabase configuration and edge functions
├── scripts/                 # Root utilities and batch processors
├── docs/                    # Canonical documentation hub
├── .gitignore
├── package.json             # Root development and validation commands
└── README.md
```

## Service boundaries

### `backend/`

The TypeScript API owns authentication, reports, users, roles, spatial
boundaries, notifications, storage, scheduled work, and integrations with the
AI service. Application code is under `src/`, with controllers, middleware,
models, routes, services, seeds, and one-off scripts kept in their respective
directories.

### `admin-dashboard/`

The React/Vite SPA provides role-aware administration workflows. UI components,
features, layouts, pages, services, configuration, and localization remain
inside the dashboard so it can be built and deployed independently.

### `ai_service/`

The Python service exposes image classification for report verification.
`main.py` is the entry point, `model_utils.py` contains model loading helpers,
and `requirements.txt` describes the runtime environment. Model binaries remain
in `AI-Related-Files/` for the current deployment.

### `mobile/`

The Flutter application provides the citizen-facing experience. Dart source
code is under `lib/`, assets under `assets/`, and platform adapters remain in
the generated platform directories. Local API configuration belongs in the
untracked environment file.

### `supabase/` and `scripts/`

Supabase configuration and edge functions are isolated under `supabase/`.
Cross-service utilities and scheduled batch processing belong under `scripts/`
and should document their required secrets and runtime.

## Repository rules

- Keep service-specific dependencies and commands in that service's manifest.
- Add or update a service README when setup or deployment behavior changes.
- Keep secrets, local environment files, caches, uploads, and build output
  untracked.
- Update links and workflows together when moving a path.
- Use the root `npm run check` command for the broadest available local checks;
  run service-specific tests when they are applicable to the change.
