# CivicConnect Configuration Reference

Use the committed `.env.example` files as the source of variable names. Never
commit real values.

## Backend

| Variable group | Examples | Purpose |
|---|---|---|
| Runtime | `PORT`, `BASE_URL` | Listener and public callback/base URL |
| Database | `PG_CONNECTION_STRING` | PostgreSQL/Supabase connection |
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` | Auth and project integration |
| Object storage | `SUPABASE_STORAGE_BUCKET` | Supabase Storage bucket for report, repair, and avatar media |
| Priority | `PRIORITY_WEIGHT_*` | Explainable report priority weighting |
| Classifier | `HF_SPACE_ID`, `HF_TOKEN`, `HF_SPACE_ATTEMPTS`, `HF_SPACE_RETRY_DELAY_MS` | Private hosted image, audio, and text classifier |

## Client configuration

- Dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
- Mobile: `API_BASE_URL`, `LOCAL_API_BASE_URL`, `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`

Only public client values may use a `VITE_` or mobile compile-time prefix.

## Batch processor

The scheduled processor uses GitHub Actions secrets including
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, and `HF_TOKEN`, plus the non-secret
`SUPABASE_STORAGE_BUCKET` and `HF_SPACE_ID` values. Configure secrets in the
repository/organization secret store, not in workflow YAML.

## Configuration change procedure

1. Add the variable to the relevant `.env.example`.
2. Validate it at startup with a clear error for required values.
3. Update this document and the service README.
4. Add a safe test/default for local or CI execution.
5. Rotate values if a secret was exposed during the change.

## Edge Function secrets

The `classify-report` function needs the project URL and service-role
authorization. Supabase supplies project URL and service-role values to hosted
functions automatically; configure the external provider secrets explicitly
with the Supabase dashboard or CLI:

```bash
supabase secrets set \
  HF_SPACE_ID=Maharsh8805/CivicConnect-Classifier \
  HF_TOKEN=<rotated-hugging-face-token>
```

Never put these values in `supabase/config.toml`, source files, workflow YAML,
or committed environment files.
