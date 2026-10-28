# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a security vulnerability. Report it
privately to the repository maintainers with reproduction steps, affected
paths, and an assessment of impact.

## Repository security rules

- Store secrets in local environment files or hosting-provider secret stores.
- Commit only sanitized `.env.example` templates.
- Keep Firebase service-account keys, private keys, logs, caches, and uploads
  out of version control.
- Treat uploaded media and AI model files as untrusted input and validate them
  at service boundaries.
