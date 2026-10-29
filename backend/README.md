# CivicConnect Backend

The backend is the Node.js, Express, and TypeScript API gateway for reports,
users, notifications, spatial boundaries, storage, and AI integrations.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The backend listens on the port configured in `.env` (the development default
is used when no override is supplied).

## Checks and operations

```bash
npm run build
npm run seed:users
npm run seed:database
npm run seed:ulb-boundaries
```

Keep credentials and local uploads outside version control. The root
[contributing guide](../CONTRIBUTING.md) and [security policy](../SECURITY.md)
define the repository-wide rules.
