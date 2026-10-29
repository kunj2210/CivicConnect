# CivicConnect Documentation

This directory is the canonical documentation hub for CivicConnect. Its
organization is inspired by the production-oriented documentation practices of
the Smart-Farming repository, but every CivicConnect document is authored for
CivicConnect's own civic workflows, stack, data, and operational requirements.

## Start here

- [Project structure](./FOLDER_STRUCTURE.md)
- [API testing guide](./API_TESTING.md)
- [Root setup and service commands](../README.md)

## Documentation conventions

- Keep architecture and operational decisions in this directory.
- Keep service-specific setup close to the service in its `README.md`.
- Update links, scripts, and workflows in the same change as a path move.
- Never commit credentials, local environment files, generated caches, or
  developer-specific build output.

## Planned additions

The Smart-Farming repository demonstrates useful documentation categories and
maintenance practices. CivicConnect will use those ideas as a checklist, not
copy its documents, terminology, domain content, or implementation decisions.
The CivicConnect-specific documentation set should grow incrementally as
follows:

### Core engineering documentation

| Document | Status | CivicConnect scope |
|---|---|---|
| [Project structure](./FOLDER_STRUCTURE.md) | Available | Monorepo boundaries and repository rules |
| [API testing guide](./API_TESTING.md) | Available | Postman/cURL endpoint workflows |
| [Architecture](./Architecture.md) | Available | Backend, dashboard, mobile, AI, Supabase, storage, and data flows |
| [API specification](./API_Specification.md) | Available | Canonical route, authentication, request, response, and error contracts |
| [Configuration reference](./Config_Reference.md) | Available | Backend, dashboard, mobile, AI, Supabase, and CI environment variables |
| Design document / SRS | Next | Civic requirements, actors, workflows, constraints, and acceptance criteria |

### Operations and delivery

| Document | Status | CivicConnect scope |
|---|---|---|
| [Deployment guide](./Deployment_Guide.md) | Available | Backend, dashboard, AI service, Supabase, storage, and secrets |
| [Test plan](./Test_Plan.md) | Available | Node build/tests, dashboard checks, AI validation, mobile analysis, and API smoke tests |
| Incident runbook | Next | Authentication, database, storage, AI, batch processor, and notification failures |
| Backup and restore runbook | Next | PostgreSQL/Supabase data, object storage, and recovery verification |
| [Worker/batch architecture](./Worker_Architecture_Runbook.md) | Available | Nightly AI processor, processing jobs, retries, and observability |
| Production readiness audit | Later | Release gates, health checks, security, cost, and operational ownership |

### Product, security, and AI documentation

| Document | Status | CivicConnect scope |
|---|---|---|
| [Authentication and roles](./Auth_Roles.md) | Available | Citizen, staff, authority, admin, Supabase Auth, and RBAC |
| Security guide | Available | Repository and vulnerability-reporting rules; expand with threat model |
| [Model cards](./Model_Cards.md) | Available | MobileNetV2/classifier purpose, data, metrics, limitations, and safe use |
| AI/data operations | Later | Dataset provenance, feedback/retraining queue, evaluation, and model releases |
| Privacy policy and terms | Later | Civic reports, location, media, account, notification, and retention policies |
| User manual | Later | Citizen, staff, authority, and administrator workflows |
| UI/UX specification | Later | Neon Onyx design system, accessibility, responsive behavior, and localization |

`Next` documents are the recommended follow-up before calling the repository
production-ready. `Later` documents depend on confirmed product, legal, or
deployment decisions. These should be CivicConnect-specific documents; Smart
Farming's crop, agronomy, and farming dataset documents should not be copied.
