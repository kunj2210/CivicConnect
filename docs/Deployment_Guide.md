# CivicConnect Deployment Guide

## Deployment units

Deploy the backend, admin dashboard, AI service, and batch processor as
independently configurable units. Supabase and the private Hugging Face
classifier Space are managed dependencies.

## Pre-deployment checklist

- Build the backend with `npm --prefix backend run build`.
- Build the dashboard with `npm --prefix admin-dashboard run build`.
- Run `python -m compileall -q ai_service`.
- Run Flutter static analysis from `mobile/`.
- Apply database/schema changes through the approved database workflow.
- Confirm production environment variables and provider URLs.
- Confirm storage bucket permissions and upload limits.
- Confirm the private classifier Space is reachable with `HF_TOKEN` and
  exposes `/classify`, `/transcribe`, and `/classify_text`.
- Confirm health endpoint and log collection.

## Release order

1. Apply backward-compatible database changes.
2. Deploy the backend and verify `/health`.
3. Confirm the configured hosted classifier Space and its three Gradio
   endpoints.
4. Deploy the dashboard and mobile release when client changes are compatible.
5. Enable scheduled processing after health and credentials checks.
6. Run a small authenticated report workflow and verify audit/notification
   behavior.

## Supabase project setup

1. Link the CLI to the new Supabase project without placing an access token in
   the repository:

   ```bash
   supabase login
   supabase link --project-ref <project-id>
   supabase db push
   ```

2. Confirm the private `civic-connect-data` bucket exists after applying
   `supabase/migrations/20261028170000_storage.sql`.
3. Start the backend once so it initializes the application tables, then run
   `supabase/sql/process_issue_ai_results.sql` in the Supabase SQL Editor.
4. Configure the backend with `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE`, `SUPABASE_ANON_KEY`, and
   `SUPABASE_STORAGE_BUCKET=civic-connect-data`.
5. Configure the Edge Function secrets listed in
   [Config_Reference.md](./Config_Reference.md).
6. Test avatar upload, report image upload, signed reads, and deletion before
   enabling production traffic.

## Hosted classifier Space

The private Space `Maharsh8805/CivicConnect-Classifier` is the single provider
for all AI modalities:

| Endpoint | Input | Output |
|---|---|---|
| `/classify` | image file | top-3 civic classes and confidences |
| `/transcribe` | audio file and `language` (`auto`, `en`, `hi`, or `gu`) | transcript text |
| `/classify_text` | text | top-3 civic classes and confidences |

The Edge Function, backend live path, and batch processor use the same
14-class allowlist. Each path retries transient Space/cold-start failures a
bounded number of times. A failed modality is recorded as unavailable; it
must not be replaced with a fabricated prediction.

To enable automatic Space deployments, add a GitHub Actions repository secret
named `HF_SPACE_WRITE_TOKEN`. The token must have write access to
`Maharsh8805/CivicConnect-Classifier`. The
[`deploy-classifier-space.yml`](../.github/workflows/deploy-classifier-space.yml)
workflow packages `ai_service/app.py`, its Space dependency files, and the
production model, then pushes them to the Space whenever `ai_service/` changes
on `main`.

## Rollback

Rollback the client to the last compatible release, then restore the backend
version. Do not roll back database changes that may destroy newer data without
an explicit restore plan. Disable scheduled processing if it is producing
duplicate or unsafe work, and preserve logs and job IDs for diagnosis.
