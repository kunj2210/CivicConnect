# CivicConnect Deployment Guide

## Deployment units

Deploy the backend, admin dashboard, AI service, and batch processor as
independently configurable units. Supabase and the object-storage provider are
managed dependencies.

## Pre-deployment checklist

- Build the backend with `npm --prefix backend run build`.
- Build the dashboard with `npm --prefix admin-dashboard run build`.
- Run `python -m compileall -q ai_service`.
- Run Flutter static analysis from `mobile/`.
- Apply database/schema changes through the approved database workflow.
- Confirm production environment variables and provider URLs.
- Confirm storage bucket permissions and upload limits.
- Confirm health endpoint and log collection.

## Release order

1. Apply backward-compatible database changes.
2. Deploy the backend and verify `/health`.
3. Deploy the AI service or confirm the configured hosted classifier.
4. Deploy the dashboard and mobile release when client changes are compatible.
5. Enable scheduled processing after health and credentials checks.
6. Run a small authenticated report workflow and verify audit/notification
   behavior.

## Rollback

Rollback the client to the last compatible release, then restore the backend
version. Do not roll back database changes that may destroy newer data without
an explicit restore plan. Disable scheduled processing if it is producing
duplicate or unsafe work, and preserve logs and job IDs for diagnosis.
